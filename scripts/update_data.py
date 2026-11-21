"""Fetch public metadata only. Failed sources never overwrite last-good data."""
import argparse
import json
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urljoin, urlsplit, urlunsplit, parse_qsl, urlencode
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
KST = timezone(timedelta(hours=9))
NEWS_FEED = "https://www.yna.co.kr/rss/sports.xml"
KBO_LIST = "https://www.koreabaseball.com/MediaNews/Notice/List.aspx"
LIONS_LIST = "https://www.samsunglions.com/intro/intro02.asp"
USER_AGENT = "VAMOS-LIONS/1.0 (+https://vamoslions.github.io/lionsfan/)"


def fetch(url):
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=30) as response:
        return response.read()


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def read_json(path, fallback=None):
    try:
        return json.loads(path.read_text())
    except (OSError, ValueError):
        return fallback


def atomic_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    temporary.replace(path)


def clean(text):
    return BeautifulSoup(text or "", "html.parser").get_text(" ", strip=True)


def canonical_url(url):
    parts = urlsplit(url)
    if parts.scheme not in ("https", "http") or not parts.hostname:
        raise ValueError("invalid article URL")
    query = [(k, v) for k, v in parse_qsl(parts.query)
             if not k.startswith("utm_") and k not in ("section", "ref", "from")]
    return urlunsplit((parts.scheme, parts.netloc.lower(), parts.path, urlencode(query), ""))


def title_key(title):
    return re.sub(r"[\W_]+", "", unicodedata.normalize("NFKC", title)).lower()


def dedupe_news(items):
    urls, titles, result = set(), set(), []
    for item in sorted(items, key=lambda row: row["publishedAt"], reverse=True):
        url, title = canonical_url(item["href"]), title_key(item["title"])
        if url in urls or title in titles:
            continue
        urls.add(url)
        titles.add(title)
        result.append({**item, "href": url})
    return result[:30]


def collect_news(previous=None):
    root = ET.fromstring(fetch(NEWS_FEED))
    entries = root.findall("./channel/item")
    if not entries:
        raise ValueError("RSS has no entries; keep previous news")
    items = []
    for node in entries:
        title = clean(node.findtext("title"))
        # Read description only to classify relevance; do not republish body/images.
        context = title + " " + clean(node.findtext("description"))
        if not re.search(r"삼성\s*라이온즈|프로야구\s*삼성|구자욱|원태인", context):
            continue
        published = parsedate_to_datetime(node.findtext("pubDate")).astimezone(timezone.utc)
        items.append({
            "title": title, "source": "연합뉴스",
            "publishedAt": published.isoformat(),
            "date": published.astimezone(KST).date().isoformat(),
            "href": canonical_url(node.findtext("link")),
            "tag": "뉴스", "summary": "",
        })
    # A quiet news cycle is successful; retain older relevant metadata too.
    items = dedupe_news(items + (previous or {}).get("items", []))
    return {"schemaVersion": 1, "lastSuccessAt": now_iso(), "source": NEWS_FEED,
            "intervalMinutes": 60, "items": items}


def announcement_rows(raw, base):
    soup = BeautifulSoup(raw, "html.parser")
    result = []
    for row in soup.select("tr"):
        link = row.select_one('a[href*="act=view"], a[href*="/Notice/View.aspx"]')
        if not link:
            continue
        text = row.get_text(" ", strip=True)
        date = re.search(r"(20\d{2})[-.](\d{2})[-.](\d{2})", text)
        if not date:
            continue
        result.append({"title": link.get_text(" ", strip=True),
                       "href": urljoin(base, link["href"]),
                       "date": "-".join(date.groups())})
    if not result:
        raise ValueError("official list structure not recognized")
    return result


def approved_players(raw, season):
    soup = BeautifulSoup(raw, "html.parser")
    detail = soup.select_one("#contents .detail")
    if not detail:
        raise ValueError("KBO announcement body missing")
    text = detail.get_text(" ", strip=True)
    if f"{season}년" not in text or "FA 승인 선수" not in text:
        raise ValueError("wrong FA season")
    # Deliberately conservative: do not infer names from unrelated page chrome.
    match = re.search(r"FA 승인 선수는\s*삼성\s+(.+?)(?:,\s*(?:KT|kt|KIA|LG|두산|SSG|NC|한화|롯데|키움)\s)", text)
    if not match:
        raise ValueError("KBO Samsung approved-player list not recognized")
    names = [name.strip() for name in match[1].split(",")]
    if not names or any(not re.fullmatch(r"[가-힣]{2,4}", name) for name in names):
        raise ValueError("unexpected player names")
    return names


def confirmed_contract(title, body, name):
    if name not in title or not re.search(r"\bFA\b", title, re.I):
        return False
    if any(word in title for word in ("추진", "예정", "협상", "전망", "가능성", "미계약")):
        return False
    # Must name the player in the sentence that confirms execution.
    for sentence in re.split(r"[.!?\n]", body):
        if name in sentence and re.search(r"계약(?:을)?\s*(?:체결했|체결하였|완료했|완료하였|마쳤|맺었|했다|하였다)", sentence):
            return True
    return False


def collect_fa(previous=None, instant=None):
    instant = instant or datetime.now(KST)
    season = instant.year + (1 if instant.month >= 11 else 0)
    kbo = announcement_rows(fetch(KBO_LIST), KBO_LIST)
    club = announcement_rows(fetch(LIONS_LIST), LIONS_LIST)
    # Small, bounded history window covers announcements between scheduled runs.
    for page in (2, 3):
        club.extend(announcement_rows(fetch(f"{LIONS_LIST}?page={page}"), LIONS_LIST))
    approval = next((row for row in kbo if f"{season}년 FA 승인 선수" in row["title"]), None)
    # Do not claim current-season success if approval fell out of the recent page.
    if not approval:
        if previous and previous.get("season") == season and previous.get("approval"):
            approval = previous["approval"]
        else:
            raise ValueError(f"{season} official FA approval not found; keep previous data")
    names = approved_players(fetch(approval["href"]), season)
    old_players = {p["name"]: p for p in (previous or {}).get("players", [])
                   if (previous or {}).get("season") == season}
    players = []
    for name in names:
        player = old_players.get(name, {
            "name": name, "status": "FA 승인 · 계약 공식 발표 미확인",
            "announcementDate": approval["date"], "source": "KBO",
            "sourceUrl": approval["href"], "contractConfirmed": False,
        }).copy()
        for row in sorted(club + kbo, key=lambda row: row["date"], reverse=True):
            if row["date"] < approval["date"] or name not in row["title"] or "FA" not in row["title"]:
                continue
            if player.get("contractConfirmed") and row["date"] <= player["announcementDate"]:
                continue
            detail = BeautifulSoup(fetch(row["href"]), "html.parser")
            body = detail.select_one("#contents .detail, .lionsNews .content")
            if not body or not confirmed_contract(row["title"], body.get_text(" ", strip=True), name):
                continue
            # Only explicit Samsung retention/acquisition; never guess a destination.
            if "samsunglions.com" not in urlsplit(row["href"]).hostname:
                continue
            player.update(status="삼성 잔류 계약 공식 발표 확인", announcementDate=row["date"],
                          source="삼성 라이온즈", sourceUrl=row["href"], contractConfirmed=True)
            break
        players.append(player)
    # Incoming external FA signings do not appear in Samsung's own approved list.
    known = {player["name"] for player in players}
    for row in club:
        match = re.search(r"(?:외부\s*)?FA\s+([가-힣]{2,4})\s*(?:영입|계약)", row["title"])
        if not match or row["date"] < approval["date"] or match[1] in known:
            continue
        name = match[1]
        detail = BeautifulSoup(fetch(row["href"]), "html.parser")
        body = detail.select_one(".lionsNews .content")
        if body and confirmed_contract(row["title"], body.get_text(" ", strip=True), name):
            players.append(dict(name=name, status="삼성 영입 계약 공식 발표 확인",
                                announcementDate=row["date"], source="삼성 라이온즈",
                                sourceUrl=row["href"], contractConfirmed=True))
            known.add(name)
    for old in old_players.values():
        if old["name"] not in known and old.get("contractConfirmed"):
            players.append(old)
    return {"schemaVersion": 1, "season": season, "lastSuccessAt": now_iso(),
            "approval": approval, "players": players,
            "sources": [KBO_LIST, LIONS_LIST],
            "note": "KBO FA 승인 명단과 구단 공식 공지 기준. 계약·잔류·이적은 추측하지 않습니다. 공식 게시판 최근 목록 범위에서 확인하며, 타 구단 발표만 있는 이적은 자동 확정하지 않습니다."}


def update(kind, output):
    path = output / f"{kind}.json"
    previous = read_json(path, {})
    status_path = output / "status.json"
    status = read_json(status_path, {})
    try:
        value = (collect_news if kind == "news" else collect_fa)(previous)
        atomic_json(path, value)
        status[kind] = {"lastAttemptAt": now_iso(), "ok": True}
        print(f"{kind}: success ({len(value.get('items', value.get('players', [])))} records)")
        success = True
    except Exception as error:
        # Keep the content file AND its lastSuccessAt byte-for-byte unchanged.
        status[kind] = {"lastAttemptAt": now_iso(), "ok": False,
                        "error": f"{type(error).__name__}: collection failed; previous data retained"}
        print(f"{kind}: failed; previous data retained ({type(error).__name__})", file=sys.stderr)
        success = False
    atomic_json(status_path, status)
    return success


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--kind", choices=["news", "fa", "all"], default="all")
    parser.add_argument("--output", type=Path, default=ROOT / "data")
    options = parser.parse_args()
    kinds = ["news", "fa"] if options.kind == "all" else [options.kind]
    results = [update(kind, options.output) for kind in kinds]
    # Existing last-good data may still be deployed. Emit a warning for monitoring.
    if not all(results):
        print("::warning::Some sources failed; last successful data retained.")
