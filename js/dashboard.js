/* =========================================================
   VAMOS LIONS · dashboard.js
   - index.html (대시보드) 전용 스크립트
   - 데이터는 js/data.js 의 window.LIONS_DATA 를 사용합니다.
   ========================================================= */
(function () {
  "use strict";

  const DATA = window.LIONS_DATA || {};
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const escapeHTML = (value) =>
    String(value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[ch]));

  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

  /* 스크롤 영역 하단 페이드 표시 */
  function bindFade(el) {
    if (!el) return function () {};
    const update = () => {
      const more = el.scrollHeight - el.clientHeight - el.scrollTop > 4;
      el.classList.toggle("has-fade", more);
    };
    el.addEventListener("scroll", update, { passive: true });
    update();
    return update;
  }

  /* ---------------- 테마 ---------------- */
  const THEME_KEY = "lions-theme";
  const themeButtons = $$("[data-theme-toggle]");

  function applyTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("light", isLight);
    themeButtons.forEach((btn) => {
      btn.setAttribute("aria-label", isLight ? "다크 모드로 전환" : "라이트 모드로 전환");
      const label = $(".theme-label", btn);
      if (label) label.textContent = isLight ? "다크 모드" : "라이트 모드";
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isLight ? "#f3f6fc" : "#060d1b");
  }

  let savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
  const themeParam = new URLSearchParams(window.location.search).get("theme");
  const initialTheme = themeParam === "dark" || themeParam === "light"
    ? themeParam
    : savedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  applyTheme(initialTheme);

  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = document.body.classList.contains("light") ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    });
  });

  /* ---------------- 오늘 날짜 ---------------- */
  const todayLabel = $("#todayLabel");
  if (todayLabel) {
    const now = new Date();
    todayLabel.textContent =
      `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${DAYS[now.getDay()]}`;
  }

  /* ---------------- 카운트다운 ---------------- */
  const opener = new Date(DATA.meta && DATA.meta.nextSeasonOpener ? DATA.meta.nextSeasonOpener : "2027-03-27T14:00:00+09:00");
  const cd = {
    days: $("#cdDays"),
    hours: $("#cdHours"),
    minutes: $("#cdMinutes"),
    seconds: $("#cdSeconds"),
  };

  function pad(n) { return String(n).padStart(2, "0"); }

  function tick() {
    const diff = opener.getTime() - Date.now();
    if (diff <= 0) {
      Object.values(cd).forEach((el) => { if (el) el.textContent = "00"; });
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (cd.days) cd.days.textContent = String(days);
    if (cd.hours) cd.hours.textContent = pad(hours);
    if (cd.minutes) cd.minutes.textContent = pad(minutes);
    if (cd.seconds) cd.seconds.textContent = pad(seconds);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------------- 경기 일정 ---------------- */
  const dashSchedule = $("#dashSchedule");
  const scheduleCount = $("#scheduleCount");
  const scheduleFade = bindFade(dashSchedule);
  let scheduleFilter = "all";

  const schedule = Array.isArray(DATA.schedule) ? DATA.schedule : [];

  function parseGameDate(str) {
    const parts = String(str).split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function gameRow(game) {
    const date = parseGameDate(game.date);
    const month = date.getMonth() + 1;
    const day = String(date.getDate()).padStart(2, "0");
    const weekday = DAYS[date.getDay()];
    const isWin = game.result === "승";
    const isLoss = game.result === "패";
    const cls = isWin ? "is-win" : isLoss ? "is-loss" : "";
    const resultClass = isWin ? "win" : isLoss ? "loss" : "up";
    const locText = game.home ? "홈" : "원정";

    return `
      <article class="dash-game ${cls}">
        <div class="dg-date">
          <b>${day}</b>
          <span>${month}월 ${weekday}</span>
        </div>
        <div class="dg-main">
          <span class="dg-stage">${escapeHTML(game.stage)} · ${locText}</span>
          <span class="dg-opp"><span class="vs">VS</span>${escapeHTML(game.opponent)}</span>
          <span class="dg-meta">${escapeHTML(game.venue)} · ${escapeHTML(game.time)}</span>
        </div>
        <div class="dg-score">
          <b>${escapeHTML(game.score)}</b>
          <i class="dg-result ${resultClass}">${escapeHTML(game.result)}</i>
        </div>
      </article>`;
  }

  function renderSchedule() {
    if (!dashSchedule) return;
    const games = schedule.filter((game) => {
      if (scheduleFilter === "home") return game.home;
      if (scheduleFilter === "away") return !game.home;
      if (scheduleFilter === "win") return game.result === "승";
      return true;
    });

    dashSchedule.innerHTML = games.length
      ? games.map(gameRow).join("")
      : '<p class="roster-empty">조건에 맞는 경기가 없습니다.</p>';

    if (scheduleCount) scheduleCount.textContent = `${games.length}경기`;
    scheduleFade();
  }

  $$("[data-schedule-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      scheduleFilter = btn.dataset.scheduleFilter;
      $$("[data-schedule-filter]").forEach((b) => b.classList.toggle("active", b === btn));
      renderSchedule();
    });
  });

  renderSchedule();

  /* ---------------- ICS 캘린더 내보내기 ---------------- */
  function icsEscape(str) {
    return String(str).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  }

  function toIcsDate(dateStr, timeStr) {
    return dateStr.replace(/-/g, "") + "T" + timeStr.replace(":", "") + "00";
  }

  function downloadIcs() {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//VAMOS LIONS//Samsung Lions Fan Hub//KO",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:삼성 라이온즈 2026 포스트시즌",
      "X-WR-TIMEZONE:Asia/Seoul",
      "BEGIN:VTIMEZONE",
      "TZID:Asia/Seoul",
      "BEGIN:STANDARD",
      "DTSTART:19700101T000000",
      "TZOFFSETFROM:+0900",
      "TZOFFSETTO:+0900",
      "TZNAME:KST",
      "END:STANDARD",
      "END:VTIMEZONE",
    ];

    schedule.forEach((game, index) => {
      const start = toIcsDate(game.date, game.time);
      const end = game.date.replace(/-/g, "") + "T220000";
      const summary = `[삼성 라이온즈] ${game.stage} vs ${game.opponent}`;
      const description = `결과: 삼성 ${game.score} ${game.opponent} (${game.result})\n${game.note || ""}\nVAMOS LIONS`;
      lines.push(
        "BEGIN:VEVENT",
        `UID:lions-2026-${index + 1}@vamoslions.fan`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
        `DTSTART;TZID=Asia/Seoul:${start}`,
        `DTEND;TZID=Asia/Seoul:${end}`,
        `SUMMARY:${icsEscape(summary)}`,
        `LOCATION:${icsEscape(game.venue)}`,
        `DESCRIPTION:${icsEscape(description)}`,
        "END:VEVENT"
      );
    });

    lines.push("END:VCALENDAR");

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "samsung-lions-2026-postseason.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const icsBtn = $("#icsBtn");
  if (icsBtn) icsBtn.addEventListener("click", downloadIcs);

  /* ---------------- 선수단 ---------------- */
  const dashRoster = $("#dashRoster");
  const rosterSearch = $("#rosterSearch");
  const rosterFade = bindFade(dashRoster);
  let rosterFilter = "전체";

  const roster = Array.isArray(DATA.roster) ? DATA.roster : [];

  function playerCard(player) {
    const name = escapeHTML(player.name);
    const insta = `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(player.name + " 삼성 라이온즈")}`;

    return `
      <a class="dash-player" href="${insta}" target="_blank" rel="noopener" aria-label="${name} 인스타그램 검색">
        <span class="dp-emoji" aria-hidden="true">${escapeHTML(player.emoji)}</span>
        <span class="dp-body">
          <strong>${name}</strong>
          <small>${escapeHTML(player.role)}</small>
        </span>
        <span class="dp-tag">${escapeHTML(player.tag)}</span>
      </a>`;
  }

  function renderRoster() {
    if (!dashRoster) return;
    const keyword = rosterSearch ? rosterSearch.value.trim().toLowerCase() : "";
    const players = roster.filter((player) => {
      const matchesGroup = rosterFilter === "전체" || player.group === rosterFilter;
      const haystack = [player.name, player.role, player.tag, player.desc].join(" ").toLowerCase();
      return matchesGroup && (!keyword || haystack.includes(keyword));
    });

    dashRoster.innerHTML = players.length
      ? players.map(playerCard).join("")
      : '<p class="roster-empty">조건에 맞는 선수가 없습니다. 🦁</p>';
    rosterFade();
  }

  $$("[data-roster-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      rosterFilter = btn.dataset.rosterFilter;
      $$("[data-roster-filter]").forEach((b) => b.classList.toggle("active", b === btn));
      renderRoster();
    });
  });

  if (rosterSearch) rosterSearch.addEventListener("input", renderRoster);
  renderRoster();

  /* ---------------- 팬 보드 ---------------- */
  const CHEER_KEY = "vamos-lions-cheers-v1";
  const cheerForm = $("#cheerForm");
  const cheerName = $("#cheerName");
  const cheerMsg = $("#cheerMsg");
  const cheerList = $("#cheerList");
  const boardTotal = $("#boardTotal");
  const cheerFade = bindFade(cheerList);

  const seedCheers = [
    { id: "seed-1", name: "라팍3루", message: "12년 기다렸다. 이제 왕조 다시 시작! 🦁💙", at: "2026-11-09T10:24:00+09:00" },
    { id: "seed-2", name: "구자욱팬", message: "주장님 한국시리즈 MVP 축하드려요. 내년에도 함께 갑니다!", at: "2026-11-09T12:02:00+09:00" },
    { id: "seed-3", name: "대구아재", message: "라팍 첫 우승의 순간을 직관할 수 있어서 행복했습니다.", at: "2026-11-10T08:41:00+09:00" },
  ];

  function loadCheers() {
    try {
      const raw = localStorage.getItem(CHEER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { /* ignore */ }
    return seedCheers.slice();
  }

  function saveCheers(list) {
    try { localStorage.setItem(CHEER_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
  }

  let cheers = loadCheers();

  function timeAgo(iso) {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";
    const diff = Date.now() - then;
    if (diff < 0) return "방금";
    if (diff < 60000) return "방금";
    if (diff < 3600000) return Math.floor(diff / 60000) + "분 전";
    if (diff < 86400000) return Math.floor(diff / 3600000) + "시간 전";
    if (diff < 604800000) return Math.floor(diff / 86400000) + "일 전";
    const d = new Date(iso);
    return `${d.getMonth() + 1}.${d.getDate()}`;
  }

  function renderCheers() {
    if (!cheerList) return;
    if (boardTotal) boardTotal.textContent = `${cheers.length}개`;

    if (!cheers.length) {
      cheerList.innerHTML = '<li class="cheer-empty">첫 번째 응원을 남겨보세요! 🦁</li>';
      cheerFade();
      return;
    }

    cheerList.innerHTML = "";
    cheers.slice().sort((a, b) => new Date(b.at) - new Date(a.at)).forEach((cheer) => {
      const li = document.createElement("li");
      li.className = "cheer-line";

      const avatar = document.createElement("span");
      avatar.className = "cheer-line-avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = (cheer.name || "?").trim().charAt(0);

      const body = document.createElement("div");
      body.className = "cheer-line-body";

      const top = document.createElement("div");
      top.className = "cheer-line-top";
      const nameEl = document.createElement("strong");
      nameEl.textContent = cheer.name;
      const timeEl = document.createElement("span");
      timeEl.textContent = timeAgo(cheer.at);
      top.append(nameEl, timeEl);

      const msg = document.createElement("p");
      msg.textContent = cheer.message;

      body.append(top, msg);

      const del = document.createElement("button");
      del.className = "cheer-line-del";
      del.type = "button";
      del.setAttribute("aria-label", `${cheer.name}의 응원 삭제`);
      del.textContent = "✕";
      del.addEventListener("click", () => {
        cheers = cheers.filter((item) => item.id !== cheer.id);
        saveCheers(cheers);
        renderCheers();
      });

      li.append(avatar, body, del);
      cheerList.appendChild(li);
    });
    cheerFade();
  }

  if (cheerForm) {
    cheerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = cheerName ? cheerName.value.trim() : "";
      const message = cheerMsg ? cheerMsg.value.trim() : "";
      if (!name || !message) return;

      cheers.push({
        id: "c-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
        name: name.slice(0, 12),
        message: message.slice(0, 80),
        at: new Date().toISOString(),
      });
      saveCheers(cheers);
      renderCheers();
      cheerForm.reset();
      if (cheerName) cheerName.focus();
    });
  }

  renderCheers();

  /* ---------------- 라이온즈TV 빠른 링크 ---------------- */
  const tvQuick = $("#tvQuick");
  if (tvQuick && Array.isArray(DATA.videos)) {
    tvQuick.innerHTML = DATA.videos.map((video) => `
      <a href="https://www.youtube.com/@lionstv1982/search?query=${encodeURIComponent(video.query)}" target="_blank" rel="noopener">
        <em aria-hidden="true">${escapeHTML(video.emoji)}</em>
        <span>${escapeHTML(video.title)}</span>
      </a>`).join("");
  }

  /* ---------------- SNS 미니 리스트 ---------------- */
  const snsMini = $("#snsMini");
  if (snsMini && Array.isArray(DATA.links)) {
    const preferred = [
      "삼성 라이온즈 홈페이지",
      "LionsTV 유튜브",
      "공식 인스타그램",
      "공식 X (트위터)",
      "네이버 클립",
      "팀스토어",
    ];
    const picked = preferred
      .map((name) => DATA.links.find((link) => link.name === name))
      .filter(Boolean);

    snsMini.innerHTML = picked.map((link) => {
      const dark = ["#f5c451", "#03c75a"].includes(link.color);
      return `
        <a class="sns-mini-row" href="${escapeHTML(link.href)}" target="_blank" rel="noopener">
          <span class="sns-mini-mark" style="background:${escapeHTML(link.color)};color:${dark ? "#0a152c" : "#fff"}">${escapeHTML(link.mark)}</span>
          <span>
            <strong>${escapeHTML(link.name)}</strong>
            <small>${escapeHTML(link.desc)}</small>
          </span>
          <span class="sns-mini-arrow" aria-hidden="true">↗</span>
        </a>`;
    }).join("");
  }

  /* ---------------- 순위표 ---------------- */
  const standingsBody = $("#standingsBody");
  if (standingsBody && Array.isArray(DATA.standings)) {
    standingsBody.innerHTML = DATA.standings.map((row) => {
      const isSamsung = row.short === "삼성" || row.team === "삼성 라이온즈";
      return `
        <tr class="${isSamsung ? "samsung" : ""}">
          <td>${escapeHTML(row.rank)}</td>
          <td>${escapeHTML(row.team)}${isSamsung ? '<span class="team-lion" aria-hidden="true">🦁</span>' : ""}</td>
          <td>${escapeHTML(row.wins)}</td>
          <td>${escapeHTML(row.losses)}</td>
          <td>${escapeHTML(row.draws)}</td>
          <td>${escapeHTML(row.pct)}</td>
        </tr>`;
    }).join("");
  }

  /* ---------------- 챔피언십 캐비닛 ---------------- */
  const champGrid = $("#champGrid");
  if (champGrid && Array.isArray(DATA.timeline)) {
    champGrid.innerHTML = DATA.timeline.map((item) => `
      <div class="champ-chip ${item.year === "2026" ? "current" : ""}">
        <small>${escapeHTML(item.year)}</small>
        <b>${escapeHTML(item.title)}</b>
      </div>`).join("") + `
      <div class="champ-chip ghost" title="다음 목표">
        <small>NEXT</small>
        <b>V10</b>
      </div>`;
  }

  /* ---------------- 사이드바 ---------------- */
  const sidebar = $("#sidebar");
  const scrim = $("#scrim");
  const menuBtn = $("#menuBtn");
  const sideClose = $("#sideClose");

  function setSidebar(open) {
    if (!sidebar) return;
    sidebar.classList.toggle("open", open);
    document.body.classList.toggle("sidebar-open", open);
    if (scrim) scrim.hidden = !open;
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    }
  }

  if (menuBtn) menuBtn.addEventListener("click", () => setSidebar(!sidebar.classList.contains("open")));
  if (sideClose) sideClose.addEventListener("click", () => setSidebar(false));
  if (scrim) scrim.addEventListener("click", () => setSidebar(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setSidebar(false);
  });

  $$("#sidebar .side-nav a").forEach((link) => {
    link.addEventListener("click", () => setSidebar(false));
  });

  /* ---------------- 사이드 내비 활성화 ---------------- */
  const navLinks = $$("#sidebar .side-nav a");
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });
    sections.forEach((section) => navObserver.observe(section));
  }

  /* ---------------- 스크롤 리빌 ---------------- */
  const revealItems = $$(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -30px 0px" });

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
      observer.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add("in"));
  }
})();
