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
  const calMonths = $("#calMonths");
  const calDetail = $("#calDetail");
  const scheduleCalendar = $("#scheduleCalendar");
  const scheduleCount = $("#scheduleCount");
  const scheduleFade = bindFade(dashSchedule);
  let scheduleFilter = "all";
  let scheduleView = "calendar";

  const schedule = Array.isArray(DATA.schedule) ? DATA.schedule : [];
  let selectedDate = schedule.length ? schedule[schedule.length - 1].date : "";

  function parseGameDate(str) {
    const parts = String(str).split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function filteredGames() {
    return schedule.filter((game) => {
      if (scheduleFilter === "home") return game.home;
      if (scheduleFilter === "away") return !game.home;
      if (scheduleFilter === "win") return game.result === "승";
      return true;
    });
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
      <article class="dash-game ${cls}" data-date="${escapeHTML(game.date)}">
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

  function renderScheduleList(games) {
    if (!dashSchedule) return;
    dashSchedule.innerHTML = games.length
      ? games.map(gameRow).join("")
      : '<p class="roster-empty">조건에 맞는 경기가 없습니다.</p>';
    scheduleFade();
  }

  function shortOpponent(name) {
    return String(name || "").split(" ")[0];
  }

  function calendarCell(cell, visibleDates) {
    if (!cell) return '<span class="cal-day is-blank" aria-hidden="true"></span>';
    const game = cell.game;
    if (!game) {
      return `<span class="cal-day is-empty"><span class="cal-daynum">${cell.day}</span></span>`;
    }
    const isWin = game.result === "승";
    const isLoss = game.result === "패";
    const isMuted = !visibleDates.has(game.date);
    const isSelected = game.date === selectedDate;
    const cls = [
      "cal-day has-game",
      isWin ? "is-win" : isLoss ? "is-loss" : "",
      isMuted ? "is-muted" : "",
      isSelected ? "is-selected" : "",
    ].filter(Boolean).join(" ");
    const score = String(game.score).replace(/\s*:\s*/, " : ");
    return `
      <button class="${cls}" type="button" data-date="${escapeHTML(game.date)}"
        aria-label="${escapeHTML(`${cell.day}일 ${game.stage} ${game.opponent} ${game.score} ${game.result}`)}"
        title="${escapeHTML(`${game.stage} · ${game.opponent} · ${game.score} ${game.result}`)}">
        <span class="cal-daynum">${cell.day}</span>
        <span class="cal-score"><b>${escapeHTML(score.replace(" : ", ":"))}</b><i>${escapeHTML(game.result)}</i></span>
      </button>`;
  }

  function buildCalendarMonths() {
    const map = new Map();
    schedule.forEach((game) => {
      const d = parseGameDate(game.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(key)) map.set(key, { year: d.getFullYear(), month: d.getMonth(), games: [] });
      map.get(key).games.push(game);
    });
    return Array.from(map.values()).sort((a, b) => (a.year - b.year) || (a.month - b.month));
  }

  function renderCalendar(games) {
    if (!calMonths) return;
    const visibleDates = new Set(games.map((game) => game.date));
    const months = buildCalendarMonths();
    if (!months.length) {
      calMonths.innerHTML = '<p class="roster-empty">표시할 경기가 없습니다.</p>';
      return;
    }

    calMonths.innerHTML = months.map(({ year, month, games: monthGames }) => {
      const first = new Date(year, month, 1);
      const startDay = first.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const cells = [];
      for (let i = 0; i < startDay; i += 1) cells.push(null);
      for (let day = 1; day <= daysInMonth; day += 1) {
        const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
        const game = monthGames.find((item) => item.date === dateStr);
        cells.push({ day, dateStr, game });
      }
      while (cells.length % 7 !== 0) cells.push(null);

      const weeks = [];
      for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
      }

      return `
        <section class="cal-month" aria-label="${year}년 ${month + 1}월">
          <div class="cal-month-head">
            <strong>${month + 1}월</strong>
            <span>${year}</span>
            <em>${monthGames.length}경기</em>
          </div>
          <div class="cal-weekdays" aria-hidden="true">
            <span class="sun">일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span class="sat">토</span>
          </div>
          <div class="cal-grid">
            ${weeks.map((week) => `<div class="cal-week">${week.map((cell) => calendarCell(cell, visibleDates)).join("")}</div>`).join("")}
          </div>
        </section>`;
    }).join("");

    renderCalendarDetail();
  }

  function renderCalendarDetail() {
    if (!calDetail) return;
    const game = schedule.find((item) => item.date === selectedDate);
    if (!game) {
      calDetail.innerHTML = '<p class="cal-hint">날짜를 선택하면 경기 상세가 표시됩니다.</p>';
      return;
    }
    const date = parseGameDate(game.date);
    const [samsungScore, oppScore] = String(game.score).split(":").map((part) => part.trim());
    const isWin = game.result === "승";
    const isLoss = game.result === "패";
    const resultClass = isWin ? "win" : isLoss ? "loss" : "up";

    calDetail.innerHTML = `
      <div class="cal-detail-date">
        <b>${date.getMonth() + 1}.${String(date.getDate()).padStart(2, "0")}</b>
        <span>${DAYS[date.getDay()]}요일</span>
      </div>
      <div class="cal-detail-main">
        <span class="cal-detail-stage">${escapeHTML(game.stage)} · ${game.home ? "홈" : "원정"}</span>
        <strong>삼성 <b>${escapeHTML(samsungScore)}</b> : <b>${escapeHTML(oppScore)}</b> ${escapeHTML(shortOpponent(game.opponent))}</strong>
        <small>${escapeHTML(game.venue)} · ${escapeHTML(game.time)}</small>
      </div>
      <div class="cal-detail-side">
        <i class="cal-detail-result ${resultClass}">${escapeHTML(game.result)}</i>
        <span>${escapeHTML(game.note || "")}</span>
      </div>`;
  }

  function renderSchedule() {
    const games = filteredGames();
    if (scheduleCount) scheduleCount.textContent = `${games.length}경기`;
    renderCalendar(games);
    renderScheduleList(games);
  }

  function setScheduleView(view) {
    scheduleView = view;
    if (scheduleCalendar) scheduleCalendar.hidden = view !== "calendar";
    if (dashSchedule) dashSchedule.hidden = view !== "list";
    $$("[data-schedule-view]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.scheduleView === view);
    });
    if (view === "list") scheduleFade();
  }

  if (calMonths) {
    calMonths.addEventListener("click", (event) => {
      const day = event.target.closest("[data-date]");
      if (!day) return;
      selectedDate = day.dataset.date;
      renderSchedule();
    });
  }

  $$("[data-schedule-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      scheduleFilter = btn.dataset.scheduleFilter;
      $$("[data-schedule-filter]").forEach((b) => b.classList.toggle("active", b === btn));
      renderSchedule();
    });
  });

  $$("[data-schedule-view]").forEach((btn) => {
    btn.addEventListener("click", () => setScheduleView(btn.dataset.scheduleView));
  });

  setScheduleView("calendar");
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

  /* ---------------- FA 트래커 ---------------- */
  function renderFA() {
    const fa = DATA.fa;
    if (!fa) return;
    const headline = $("#faHeadline");
    const summary = $("#faSummary");
    const sub = $("#faSub");
    const players = $("#faPlayers");
    const dates = $("#faDates");
    const note = $("#faNote");

    if (headline) headline.textContent = fa.headline || "";
    if (summary) summary.textContent = fa.summary || "";
    if (sub) sub.textContent = `삼성 ${Array.isArray(fa.players) ? fa.players.length : 0}명 · 11.17 협상 개시`;
    if (note) note.textContent = fa.note || "";

    if (players && Array.isArray(fa.players)) {
      players.innerHTML = fa.players.map((player) => `
        <div class="fa-player">
          <span class="fa-grade grade-${escapeHTML(String(player.grade).toLowerCase())}">${escapeHTML(player.grade)}</span>
          <div class="fa-player-main">
            <strong>${escapeHTML(player.name)}</strong>
            <small>${escapeHTML(player.pos)} · ${escapeHTML(player.role)}</small>
            <p>${escapeHTML(player.desc)}</p>
          </div>
          <div class="fa-player-side">
            <b>${escapeHTML(player.stat)}</b>
            <em>${escapeHTML(player.status)}</em>
          </div>
        </div>`).join("");
    }

    if (dates && Array.isArray(fa.dates)) {
      dates.innerHTML = fa.dates.map((item) => `
        <li class="fa-date is-${escapeHTML(item.state)}">
          <b>${escapeHTML(item.date)}</b>
          <span>${escapeHTML(item.label)}</span>
          <small>${escapeHTML(item.note)}</small>
        </li>`).join("");
    }
  }

  renderFA();

  /* ---------------- 뉴스 ---------------- */
  function newsDate(value) {
    const parts = String(value || "").split("-");
    if (parts.length < 3) return value;
    return `${Number(parts[1])}.${Number(parts[2])}`;
  }

  function renderNews() {
    const feature = $("#newsFeature");
    const list = $("#newsList");
    const updated = $("#newsUpdated");
    const news = Array.isArray(DATA.news) ? DATA.news : [];
    if (!feature || !list || !news.length) return;

    const [lead, ...rest] = news;
    feature.innerHTML = `
      <a class="news-feature-card" href="${escapeHTML(lead.href)}" target="_blank" rel="noopener">
        <span class="news-tag">${escapeHTML(lead.tag)}</span>
        <strong>${escapeHTML(lead.title)}</strong>
        <p>${escapeHTML(lead.summary)}</p>
        <span class="news-meta">${escapeHTML(lead.source)} · ${escapeHTML(newsDate(lead.date))}</span>
      </a>`;

    list.innerHTML = rest.map((item) => `
      <li>
        <a class="news-item" href="${escapeHTML(item.href)}" target="_blank" rel="noopener">
          <span class="news-tag is-small">${escapeHTML(item.tag)}</span>
          <span class="news-item-body">
            <strong>${escapeHTML(item.title)}</strong>
            <small>${escapeHTML(item.source)} · ${escapeHTML(newsDate(item.date))}</small>
          </span>
          <span class="news-arrow" aria-hidden="true">↗</span>
        </a>
      </li>`).join("");

    if (updated && DATA.meta) {
      updated.textContent = `${String(DATA.meta.lastUpdated).replace(/-/g, ".")} 기준`;
    }
  }

  renderNews();

  /* ---------------- 선수 기록 ---------------- */
  function renderStats() {
    const stats = DATA.stats;
    const feature = $("#statFeature");
    const mini = $("#statMini");
    const note = $("#statsNote");
    if (!stats || !feature || !mini) return;

    const f = stats.featured || {};
    feature.innerHTML = `
      <div class="stat-feature-top">
        <span class="stat-avatar" aria-hidden="true">${escapeHTML(f.emoji || "🦁")}</span>
        <div class="stat-feature-name">
          <strong>${escapeHTML(f.name || "")}</strong>
          <small>${escapeHTML(f.role || "")}</small>
        </div>
        <div class="stat-ops">
          <span>OPS</span>
          <b>${escapeHTML(f.ops || "—")}</b>
        </div>
      </div>
      <div class="stat-items">
        ${(f.items || []).map((item) => `
          <div class="stat-item">
            <span>${escapeHTML(item.label)}</span>
            <b>${escapeHTML(item.value)}</b>
            <small>${escapeHTML(item.note || "")}</small>
          </div>`).join("")}
      </div>
      <p class="stat-line">${escapeHTML(f.line || "")}</p>`;

    mini.innerHTML = (stats.mini || []).map((item) => `
      <div class="stat-mini">
        <small>${escapeHTML(item.name)}</small>
        <b>${escapeHTML(item.value)}</b>
        <span>${escapeHTML(item.label)} · ${escapeHTML(item.note || "")}</span>
      </div>`).join("");

    if (note) note.textContent = stats.note || "";
  }

  renderStats();

  /* ---------------- 선수단 ---------------- */
  const dashRoster = $("#dashRoster");
  const rosterSearch = $("#rosterSearch");
  const rosterFade = bindFade(dashRoster);
  let rosterFilter = "전체";

  const roster = Array.isArray(DATA.roster) ? DATA.roster : [];

  function playerCard(player) {
    const name = escapeHTML(player.name);
    const insta = `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(player.name + " 삼성 라이온즈")}`;
    const hasPhoto = Boolean(player.photo);
    const stat = player.stat
      ? `<span class="dp-stat"><b>${escapeHTML(player.stat.value)}</b>${escapeHTML(player.stat.label)}</span>`
      : "";

    const portrait = hasPhoto
      ? `<img src="${escapeHTML(player.photo)}" alt="${name} 선수 사진" loading="lazy" referrerpolicy="no-referrer" />`
      : `<span class="dp-initial" aria-hidden="true">${escapeHTML(String(player.name).charAt(0))}</span>
         <span class="dp-emoji-watermark" aria-hidden="true">${escapeHTML(player.emoji)}</span>`;

    return `
      <a class="dash-player ${hasPhoto ? "has-photo" : "no-photo"}" href="${insta}" target="_blank" rel="noopener" aria-label="${name} 인스타그램 검색">
        <span class="dp-photo">
          ${portrait}
          <span class="dp-photo-tag">${escapeHTML(player.tag)}</span>
        </span>
        <span class="dp-body">
          <span class="dp-name-row"><strong>${name}</strong>${stat}</span>
          <small>${escapeHTML(player.role)}</small>
        </span>
      </a>`;
  }

  function renderRoster() {
    if (!dashRoster) return;
    const keyword = rosterSearch ? rosterSearch.value.trim().toLowerCase() : "";
    const players = roster.filter((player) => {
      let matchesGroup;
      if (rosterFilter === "퓨처스") matchesGroup = player.squad === "futures";
      else if (rosterFilter === "전체") matchesGroup = player.squad !== "futures";
      else matchesGroup = player.squad !== "futures" && player.group === rosterFilter;
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

  /* 사진 출처 */
  const photoCredits = $("#photoCredits");
  if (photoCredits && Array.isArray(DATA.photoCredits)) {
    photoCredits.innerHTML = DATA.photoCredits.map((credit) => `
      <li>
        <a href="${escapeHTML(credit.href)}" target="_blank" rel="noopener">${escapeHTML(credit.name)}</a>
        <span>${escapeHTML(credit.author)} · ${escapeHTML(credit.license)}</span>
      </li>`).join("");
  }

  /* ---------------- 나만의 스쿼드 ---------------- */
  const SQUAD_KEY = "vamos-lions-squad-v1";
  const squadLineup = $("#squadLineup");
  const squadPool = $("#squadPool");
  const squadPitcher = $("#squadPitcher");
  const squadPitcherName = $("#squadPitcherName");
  const squadCount = $("#squadCount");
  const squadStatus = $("#squadStatus");
  const squadReset = $("#squadReset");
  const squadCopy = $("#squadCopy");

  const squadState = { pitcher: null, batters: Array(9).fill(null) };
  let squadActive = 0;
  let squadFilter = "전체";

  function squadPlayer(name) {
    return name ? roster.find((player) => player.name === name) || null : null;
  }

  function loadSquad() {
    try {
      const raw = localStorage.getItem(SQUAD_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object") return;
      if (typeof saved.pitcher === "string" && squadPlayer(saved.pitcher)) {
        squadState.pitcher = saved.pitcher;
      }
      if (Array.isArray(saved.batters)) {
        saved.batters.slice(0, 9).forEach((name, index) => {
          if (typeof name === "string" && squadPlayer(name)) squadState.batters[index] = name;
        });
      }
    } catch (e) { /* ignore */ }
  }

  function saveSquad() {
    try {
      localStorage.setItem(SQUAD_KEY, JSON.stringify(squadState));
    } catch (e) { /* ignore */ }
  }

  function squadFilled() {
    return squadState.batters.filter(Boolean).length + (squadState.pitcher ? 1 : 0);
  }

  function firstEmptyBat() {
    return squadState.batters.findIndex((name) => !name);
  }

  function setSquadStatus(text) {
    if (squadStatus) squadStatus.textContent = text;
  }

  function renderSquad() {
    if (!squadLineup) return;

    squadLineup.innerHTML = squadState.batters.map((name, index) => {
      const player = squadPlayer(name);
      const isActive = squadActive === index;
      return `
        <li>
          <button class="sq-slot ${player ? "is-filled" : ""} ${isActive ? "is-active" : ""}" data-slot="${index}" type="button">
            <span class="sq-no">${index + 1}</span>
            <span class="sq-main">
              <b>${player ? escapeHTML(player.name) : "선수 선택"}</b>
              <small>${player ? escapeHTML(player.group) : `${index + 1}번 타자`}</small>
            </span>
            ${player ? `<span class="sq-x" data-clear="${index}" role="button" tabindex="0" aria-label="${escapeHTML(player.name)} 빼기">×</span>` : ""}
          </button>
        </li>`;
    }).join("");

    if (squadPitcherName) {
      squadPitcherName.textContent = squadState.pitcher ? squadState.pitcher : "선수 선택";
    }
    if (squadPitcher) {
      squadPitcher.classList.toggle("is-filled", Boolean(squadState.pitcher));
      squadPitcher.classList.toggle("is-active", squadActive === "pitcher");
    }
    if (squadCount) squadCount.textContent = `${squadFilled()} / 10`;

    if (squadPool) {
      const pool = roster.filter((player) => {
        if (squadFilter === "퓨처스") return player.squad === "futures";
        if (squadFilter === "전체") return true;
        return player.group === squadFilter;
      });
      const picked = new Set([squadState.pitcher, ...squadState.batters].filter(Boolean));
      squadPool.innerHTML = pool.length ? pool.map((player) => {
        const isPicked = picked.has(player.name);
        const stat = player.stat ? `${player.stat.label} ${player.stat.value}` : player.tag;
        return `
          <button class="sq-chip ${isPicked ? "is-picked" : ""}" data-name="${escapeHTML(player.name)}" type="button" aria-pressed="${isPicked}">
            <span class="sq-chip-top"><b>${escapeHTML(player.name)}</b><em>${escapeHTML(player.group)}</em></span>
            <small>${escapeHTML(stat)}</small>
          </button>`;
      }).join("") : '<p class="roster-empty">해당하는 선수가 없습니다.</p>';
    }
  }

  function squadNextSlot() {
    const empty = firstEmptyBat();
    squadActive = empty === -1 ? null : empty;
  }

  function placeSquadPlayer(player) {
    const isPitcher = player.group === "투수";
    if (isPitcher && typeof squadActive === "number") {
      setSquadStatus("투수는 ‘선발 투수’ 슬롯에만 넣을 수 있어요.");
      return;
    }
    if (!isPitcher && squadActive === "pitcher") {
      setSquadStatus("선발 투수에는 투수만 넣을 수 있어요. 타자는 타순 슬롯을 선택하세요.");
      return;
    }

    if (isPitcher) {
      squadState.pitcher = player.name;
      squadActive = firstEmptyBat();
      if (squadActive === -1) squadActive = null;
      setSquadStatus(`${player.name} 선수를 선발 투수로 넣었습니다.`);
    } else {
      if (typeof squadActive !== "number") {
        setSquadStatus("먼저 타순 슬롯을 선택하세요.");
        return;
      }
      squadState.batters[squadActive] = player.name;
      const justFilled = squadActive;
      squadNextSlot();
      setSquadStatus(`${player.name} 선수를 ${justFilled + 1}번 타순에 넣었습니다.`);
    }
    saveSquad();
    renderSquad();
  }

  function removeSquadPlayer(name) {
    if (squadState.pitcher === name) squadState.pitcher = null;
    squadState.batters = squadState.batters.map((value) => (value === name ? null : value));
    saveSquad();
    renderSquad();
  }

  function toggleSquadPlayer(player) {
    const picked = squadState.pitcher === player.name || squadState.batters.includes(player.name);
    if (picked) {
      removeSquadPlayer(player.name);
      setSquadStatus(`${player.name} 선수를 뺐습니다.`);
    } else {
      placeSquadPlayer(player);
    }
  }

  if (squadPitcher) {
    squadPitcher.addEventListener("click", () => {
      squadActive = "pitcher";
      renderSquad();
      setSquadStatus("선발 투수 슬롯을 선택했습니다. 아래에서 투수를 골라주세요.");
    });
  }

  if (squadLineup) {
    squadLineup.addEventListener("click", (event) => {
      const clear = event.target.closest("[data-clear]");
      if (clear) {
        event.stopPropagation();
        const index = Number(clear.dataset.clear);
        squadState.batters[index] = null;
        saveSquad();
        renderSquad();
        setSquadStatus("타순에서 선수를 뺐습니다.");
        return;
      }
      const slot = event.target.closest("[data-slot]");
      if (!slot) return;
      squadActive = Number(slot.dataset.slot);
      renderSquad();
      setSquadStatus(`${squadActive + 1}번 타순을 선택했습니다. 아래에서 타자를 골라주세요.`);
    });
    squadLineup.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const clear = event.target.closest("[data-clear]");
      if (!clear) return;
      event.preventDefault();
      const index = Number(clear.dataset.clear);
      squadState.batters[index] = null;
      saveSquad();
      renderSquad();
      setSquadStatus("타순에서 선수를 뺐습니다.");
    });
  }

  if (squadPool) {
    squadPool.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-name]");
      if (!chip) return;
      const player = squadPlayer(chip.dataset.name);
      if (player) toggleSquadPlayer(player);
    });
  }

  $$("[data-squad-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      squadFilter = btn.dataset.squadFilter;
      $$("[data-squad-filter]").forEach((b) => b.classList.toggle("active", b === btn));
      renderSquad();
    });
  });

  if (squadReset) {
    squadReset.addEventListener("click", () => {
      squadState.pitcher = null;
      squadState.batters = Array(9).fill(null);
      squadActive = 0;
      saveSquad();
      renderSquad();
      setSquadStatus("스쿼드를 초기화했습니다. 다시 만들어보세요!");
    });
  }

  if (squadCopy) {
    squadCopy.addEventListener("click", async () => {
      if (squadFilled() === 0) {
        setSquadStatus("아직 선택한 선수가 없습니다.");
        return;
      }
      const lines = [
        "🦁 나만의 삼성 라이온즈 스쿼드",
        `선발: ${squadState.pitcher || "미정"}`,
        ...squadState.batters.map((name, index) => `${index + 1}번: ${name || "미정"}`),
        "",
        "VAMOS LIONS · vamoslions.github.io/lionsfan",
      ];
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(lines.join("\n"));
        } else {
          const textarea = document.createElement("textarea");
          textarea.value = lines.join("\n");
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          textarea.remove();
        }
        setSquadStatus("라인업을 복사했습니다. 친구에게 붙여넣어 보세요!");
      } catch (e) {
        setSquadStatus("복사에 실패했습니다. 브라우저 권한을 확인해 주세요.");
      }
    });
  }

  loadSquad();
  const squadStart = firstEmptyBat();
  squadActive = squadStart === -1 ? null : squadStart;
  renderSquad();

  /* ---------------- 팬 보드 (GitHub Issues 공유) ---------------- */
  const BOARD_REPO = "vamoslions/lionsfan";
  const BOARD_API = `https://api.github.com/repos/${BOARD_REPO}/issues?state=open&per_page=50&sort=created&direction=desc`;
  const BOARD_CACHE_KEY = "vamos-lions-board-cache-v2";
  const BOARD_PREFIX = "[팬보드]";
  const isBoardDemo = new URLSearchParams(window.location.search).get("board") === "demo";

  const cheerForm = $("#cheerForm");
  const cheerName = $("#cheerName");
  const cheerMsg = $("#cheerMsg");
  const cheerList = $("#cheerList");
  const boardTotal = $("#boardTotal");
  const boardStatus = $("#boardStatus");
  const boardRefresh = $("#boardRefresh");
  const cheerFade = bindFade(cheerList);

  let boardPosts = [];
  let boardLoaded = false;

  const demoPosts = [
    { number: 3, title: "[팬보드] 라팍3루", body: "12년 기다렸다. 이제 왕조 다시 시작! 🦁💙", created_at: "2026-11-09T10:24:00+09:00", html_url: "https://github.com/vamoslions/lionsfan/issues" },
    { number: 2, title: "[팬보드] 구자욱팬", body: "주장님 한국시리즈 MVP 축하드려요. 내년에도 함께 갑니다!", created_at: "2026-11-09T12:02:00+09:00", html_url: "https://github.com/vamoslions/lionsfan/issues" },
    { number: 1, title: "[팬보드] 대구아재", body: "라팍 첫 우승의 순간을 직관할 수 있어서 행복했습니다.", created_at: "2026-11-10T08:41:00+09:00", html_url: "https://github.com/vamoslions/lionsfan/issues" },
  ];

  function isFanBoardIssue(issue) {
    if (!issue || issue.pull_request) return false;
    const labels = (issue.labels || []).map((label) => (typeof label === "string" ? label : label.name));
    return labels.includes("fanboard") || String(issue.title || "").startsWith(BOARD_PREFIX);
  }

  function toPost(issue) {
    const rawTitle = String(issue.title || "").replace(/^\s*\[팬보드\]\s*/, "").trim();
    const rawBody = String(issue.body || "").split(/\n\s*---\s*\n/)[0].trim();
    return {
      id: String(issue.number || issue.id || Math.random()),
      name: rawTitle || "팬",
      message: rawBody || "(내용 없음)",
      at: issue.created_at || new Date().toISOString(),
      href: issue.html_url || "",
    };
  }

  function loadBoardCache() {
    try {
      const raw = localStorage.getItem(BOARD_CACHE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveBoardCache(posts) {
    try {
      localStorage.setItem(BOARD_CACHE_KEY, JSON.stringify(posts.slice(0, 30)));
    } catch (e) { /* ignore */ }
  }

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

  function renderBoard() {
    if (!cheerList) return;
    if (boardTotal) boardTotal.textContent = `${boardPosts.length}개`;

    if (!boardPosts.length) {
      cheerList.innerHTML = '<li class="cheer-empty">아직 공유된 응원이 없어요.<br />첫 글을 남겨보세요! 🦁</li>';
      cheerFade();
      return;
    }

    cheerList.innerHTML = "";
    boardPosts
      .slice()
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 30)
      .forEach((post) => {
        const li = document.createElement("li");
        li.className = "cheer-line";

        const avatar = document.createElement("span");
        avatar.className = "cheer-line-avatar";
        avatar.setAttribute("aria-hidden", "true");
        avatar.textContent = (post.name || "?").trim().charAt(0);

        const body = document.createElement("div");
        body.className = "cheer-line-body";

        const top = document.createElement("div");
        top.className = "cheer-line-top";
        const nameEl = document.createElement("strong");
        nameEl.textContent = post.name;
        const timeEl = document.createElement("span");
        timeEl.textContent = timeAgo(post.at);
        top.append(nameEl, timeEl);

        const msg = document.createElement("p");
        msg.textContent = post.message;

        body.append(top, msg);

        if (post.href) {
          const link = document.createElement("a");
          link.className = "cheer-line-link";
          link.href = post.href;
          link.target = "_blank";
          link.rel = "noopener";
          link.setAttribute("aria-label", `${post.name}의 GitHub 글 열기`);
          link.textContent = "↗";
          li.append(avatar, body, link);
        } else {
          li.append(avatar, body);
        }

        cheerList.appendChild(li);
      });
    cheerFade();
  }

  async function fetchBoard() {
    if (!cheerList) return;
    if (boardRefresh) boardRefresh.classList.add("is-loading");
    if (boardStatus) boardStatus.textContent = "공유 보드를 불러오는 중…";
    try {
      let issues;
      if (isBoardDemo) {
        issues = demoPosts;
      } else {
        const response = await fetch(BOARD_API, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!response.ok) throw new Error(`GitHub API ${response.status}`);
        issues = await response.json();
      }
      boardPosts = (Array.isArray(issues) ? issues : [])
        .filter(isFanBoardIssue)
        .map(toPost)
        .slice(0, 30);
      boardLoaded = true;
      saveBoardCache(boardPosts);
      renderBoard();
      if (boardStatus) {
        boardStatus.textContent = boardPosts.length
          ? `공유 보드 ${boardPosts.length}개 · 방금 업데이트`
          : "GitHub 로그인 후 첫 글을 남겨보세요.";
      }
    } catch (error) {
      const cached = loadBoardCache();
      if (cached.length) {
        boardPosts = cached;
        renderBoard();
        if (boardStatus) boardStatus.textContent = "최신 글을 불러오지 못해 저장된 목록을 보여줍니다.";
      } else {
        boardPosts = [];
        renderBoard();
        if (boardStatus) boardStatus.textContent = "공유 보드를 불러오지 못했어요. GitHub에서 직접 확인해 주세요.";
      }
    } finally {
      if (boardRefresh) boardRefresh.classList.remove("is-loading");
    }
  }

  if (cheerForm) {
    cheerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = cheerName ? cheerName.value.trim() : "";
      const message = cheerMsg ? cheerMsg.value.trim() : "";
      if (!name || !message) return;

      const title = `${BOARD_PREFIX} ${name.slice(0, 12)}`;
      const body = `${message.slice(0, 80)}\n\n---\nVAMOS LIONS 팬보드에서 보냄`;
      const url = `https://github.com/${BOARD_REPO}/issues/new?labels=fanboard&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
      window.open(url, "_blank", "noopener");
      if (boardStatus) {
        boardStatus.textContent = "GitHub 창에서 'Submit new issue'를 누르면 공유 보드에 게시됩니다. 등록 후 새로고침을 눌러주세요.";
      }
    });
  }

  if (boardRefresh) boardRefresh.addEventListener("click", fetchBoard);

  const cachedBoard = loadBoardCache();
  if (cachedBoard.length) {
    boardPosts = cachedBoard;
    renderBoard();
  }
  fetchBoard();

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
