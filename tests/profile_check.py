"""Check real official images and isolated failure cases, without public writes."""
import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, parse_qs
from urllib.request import urlopen

from playwright.sync_api import sync_playwright


class RosterImages(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = {}

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "img" and "/upload/player/" in attrs.get("src", ""):
            self.images[urljoin("https://www.samsunglions.com", attrs["src"])] = attrs.get("alt", "")


def run(base, chrome, report_path=None):
    official = RosterImages()
    for page in ("roster_2_list.asp", "roster_3_list.asp"):
        with urlopen("https://www.samsunglions.com/roster/" + page, timeout=30) as response:
            official.feed(response.read().decode("utf-8"))
    report = {"base": base, "images": [], "responses": [], "consoleErrors": [], "requestFailures": []}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=chrome, headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        page.on("console", lambda message: report["consoleErrors"].append(message.text)
                if message.type == "error" else None)
        page.on("pageerror", lambda error: report["consoleErrors"].append(str(error)))
        page.on("response", lambda response: report["responses"].append(
            {"url": response.url, "status": response.status})
            if "/upload/player/" in response.url else None)
        page.on("requestfailed", lambda request: report["requestFailures"].append(
            {"url": request.url, "error": request.failure})
            if "/upload/player/" in request.url else None)
        page.goto(base + "/", wait_until="networkidle")
        profiles = page.evaluate("LIONS_DATA.playerProfiles")
        roster = page.evaluate("LIONS_DATA.roster.map(p => ({name:p.name,group:p.group}))")
        assert len(profiles) == len(roster) == 28
        for player in roster:
            profile = profiles[player["name"]]
            assert profile["verifiedName"] == player["name"]
            assert profile["officialName"] == {
                "아리엘 후라도": "후라도", "크리스 페덱": "페덱"
            }.get(player["name"], player["name"])
            assert profile["src"] in official.images, profile
            assert re.fullmatch(r"(?:투수|포수|내야수|외야수)\d+" +
                                re.escape(profile["officialName"]), official.images[profile["src"]])
            assert parse_qs(urlsplit(profile["source"]).query)["pcode"] == [profile["playerCode"]]
            assert urlsplit(profile["src"]).path.rsplit("/", 1)[1].startswith(profile["playerCode"] + "_")
        # Two players named Kim Tae-hoon exist; select the outfielder, not pitcher.
        assert official.images[profiles["김태훈"]["src"]].startswith("외야수")
        assert len(set(profile["src"] for profile in profiles.values())) == 28
        for group, count in (("전체", 20), ("퓨처스", 8)):
            page.locator(f'[data-roster-filter="{group}"]').click()
            page.eval_on_selector_all("#dashRoster img", "els=>els.forEach(img=>img.loading='eager')")
            page.wait_for_function("""Array.from(document.querySelectorAll('#dashRoster img'))
                .every(img => img.complete)""")
            images = page.eval_on_selector_all("#dashRoster img", """els=>els.map(img=>({
                name:img.dataset.playerName, src:img.src, state:img.dataset.profileState,
                width:img.naturalWidth, height:img.naturalHeight}))""")
            assert len(images) == count
            assert all(img["state"] == "official" and img["width"] > 0 for img in images), images
            report["images"].extend(images)
        assert all(response["status"] == 200 for response in report["responses"]), report["responses"]
        assert len(set(response["url"] for response in report["responses"])) == 28
        assert not report["requestFailures"], report["requestFailures"]
        assert not report["consoleErrors"], report["consoleErrors"]
        print("PASS: official source/name/code match, 28 unique images decoded, HTTP 200, Console clean")

        # Simulated errors intentionally produce Console network errors. They are
        # tested separately from the real-image success report.
        for status in (403, 404, 200):
            failed = browser.new_page()
            failed.route(profiles["구자욱"]["src"], lambda route, request, status=status:
                         route.fulfill(status=status, content_type="image/png", body=b"not an image"))
            failed.goto(base + "/", wait_until="networkidle")
            image = failed.locator('#dashRoster img[data-player-name="구자욱"]')
            image.evaluate("img=>img.loading='eager'")
            failed.wait_for_function("""() => {
              const img = document.querySelector('#dashRoster img[data-player-name="구자욱"]');
              return img.dataset.profileState === 'fallback' && img.complete && img.naturalWidth > 0;
            }""")
            assert image.get_attribute("src") == "assets/players/default.svg"
            assert "로드 실패" in image.get_attribute("alt")
            assert failed.locator("#dashRoster .has-photo").count() == 19
            failed.close()
        print("PASS: isolated 403 / 404 / corrupt HTTP 200 only replace affected image")
        missing = browser.new_page()
        missing.route("**/js/data.js", lambda route: route.fulfill(
            response=(response := route.fetch()),
            body=response.text() + '\ndelete window.LIONS_DATA.playerProfiles["구자욱"];'))
        missing.goto(base + "/", wait_until="networkidle")
        assert missing.locator('#dashRoster img[data-player-name="구자욱"]').get_attribute("data-profile-state") == "fallback"
        assert missing.locator("#dashRoster .has-photo").count() == 19
        missing.close()
        print("PASS: missing mapping falls back for that player only")
        for width in (390, 1440):
            page.set_viewport_size({"width": width, "height": 900})
            page.locator('[data-roster-filter="전체"]').click()
            page.locator("#roster").scroll_into_view_if_needed()
            assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
        print("PASS: original desktop/mobile card layout, no horizontal overflow")
        browser.close()
    if report_path:
        Path(report_path).write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="http://localhost:8080")
    parser.add_argument("--chrome", default="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
    parser.add_argument("--report")
    args = parser.parse_args()
    run(args.base.rstrip("/"), args.chrome, args.report)
