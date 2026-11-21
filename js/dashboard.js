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
    const fa = window.LIONS_LIVE && window.LIONS_LIVE.fa;
    if (!fa) {
      $("#faHeadline").textContent = "공식 발표 확인 중";
      $("#faSummary").textContent = "검증된 FA 데이터를 불러오고 있습니다.";
      return;
    }
    const headline = $("#faHeadline");
    const summary = $("#faSummary");
    const sub = $("#faSub");
    const players = $("#faPlayers");
    const dates = $("#faDates");
    const note = $("#faNote");

    if (headline) headline.textContent = `${fa.season}시즌 FA 공식 발표`;
    if (summary) summary.textContent = "계약 추측·협상설을 제외하고 공식 확인 내용만 표시합니다.";
    if (sub) sub.textContent = `삼성 FA 승인 ${fa.players.length}명 · 공식 출처`;
    if (note) note.textContent = `${fa.note} ${updateStatus("fa", fa.lastSuccessAt)}`;

    if (players && Array.isArray(fa.players)) {
      players.innerHTML = fa.players.map((player) => `
        <div class="fa-player">
          <span class="fa-grade">${player.contractConfirmed ? "✓" : "FA"}</span>
          <div class="fa-player-main">
            <strong>${escapeHTML(player.name)}</strong>
            <small>${escapeHTML(player.status)}</small>
            <a class="fa-source" href="${escapeHTML(player.sourceUrl)}" target="_blank" rel="noopener">${escapeHTML(player.announcementDate)} · ${escapeHTML(player.source)} 발표 ↗</a>
          </div>
          <div class="fa-player-side">
            <em>${player.contractConfirmed ? "공식 확인" : "계약 미확인"}</em>
          </div>
        </div>`).join("");
    }

    if (dates) dates.replaceChildren();
  }

  renderFA();

  /* ---------------- 뉴스 ---------------- */
  function updateStatus(kind, successAt) {
    const state = window.LIONS_LIVE || {};
    const stale = state.offline || (state.status && state.status[kind] && !state.status[kind].ok);
    const time = new Date(successAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    return `마지막 성공 ${time} KST${stale ? " · 수집 지연, 기존 데이터 유지" : ""}`;
  }
  function newsDate(value) {
    return String(value || "");
  }

  function renderNews() {
    const feature = $("#newsFeature");
    const list = $("#newsList");
    const updated = $("#newsUpdated");
    const feed = window.LIONS_LIVE && window.LIONS_LIVE.news;
    const news = feed ? feed.items.slice(0, 6) : [];
    if (!feature || !list) return;
    if (!news.length) {
      feature.textContent = feed ? "RSS에서 확인된 삼성 관련 최신 기사가 없습니다." : "뉴스 데이터를 불러오고 있습니다.";
      list.replaceChildren();
      if (updated) updated.textContent = feed ? updateStatus("news", feed.lastSuccessAt) : "마지막 성공 기록 없음";
      return;
    }

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

    if (updated) updated.textContent = updateStatus("news", feed.lastSuccessAt);
  }

  renderNews();
  window.addEventListener("lions:data-updated", () => { renderNews(); renderFA(); });

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
    const meta = (DATA.playerMeta && DATA.playerMeta[player.name]) || {};
    const ig = DATA.instagramAccounts && DATA.instagramAccounts[player.name];
    const profile = DATA.playerProfiles && DATA.playerProfiles[player.name];
    const hasPhoto = Boolean(profile && profile.src && profile.verifiedName === player.name);
    const photo = hasPhoto ? profile.src : "assets/players/default.svg";
    const positions = Array.isArray(meta.positions) ? meta.positions.join(" · ") : "";
    const stat = player.stat
      ? `<span class="dp-stat"><b>${escapeHTML(player.stat.value)}</b>${escapeHTML(player.stat.label)}</span>`
      : "";
    const social = ig
      ? `<a class="dp-ig is-verified" href="https://www.instagram.com/${encodeURIComponent(ig.handle)}/" target="_blank" rel="noopener" aria-label="${name} 인스타그램 @${escapeHTML(ig.handle)}">IG @${escapeHTML(ig.handle)} ↗</a>`
      : `<span class="dp-ig is-none" title="${escapeHTML((DATA.instagramNotes && DATA.instagramNotes[player.name]) || "본인 계정을 확인하지 못했습니다.")}">계정 정보 없음</span>`;

    return `
      <article class="dash-player ${hasPhoto ? "has-photo" : "no-photo"}">
        <span class="dp-photo">
          <img src="${escapeHTML(photo)}" alt="${name} ${hasPhoto ? "선수 프로필 사진" : "프로필 미제공 · 기본 실루엣"}" loading="lazy" referrerpolicy="no-referrer" style="object-position:${escapeHTML(hasPhoto ? profile.objectPosition || "50% 25%" : "50% 50%")}" />
          <span class="dp-photo-tag">${escapeHTML(player.tag)}</span>
        </span>
        <span class="dp-body">
          <span class="dp-name-row"><strong>${name}</strong>${stat}</span>
          <small>${escapeHTML(player.role)}${positions ? ` · ${escapeHTML(positions)}` : ""}</small>
          ${social}
        </span>
      </article>`;
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
        <span>${escapeHTML(credit.author)} · ${escapeHTML(credit.license)}${credit.period ? ` · ${escapeHTML(credit.period)}` : ""}</span>
      </li>`).join("");
  }

  /* ---------------- 나만의 스쿼드 ---------------- */
  const SQUAD_KEY = "vamos-lions-squad-v1";
  const SIM = window.LIONS_SIM || null;
  const POSITIONS = (SIM && SIM.POSITIONS) || ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"];
  const DEFAULT_POSITIONS = ["CF", "RF", "LF", "DH", "1B", "C", "3B", "SS", "2B"];
  const POSITION_LABELS = {
    P: "투수", C: "포수", "1B": "1루수", "2B": "2루수", "3B": "3루수",
    SS: "유격수", LF: "좌익수", CF: "중견수", RF: "우익수", DH: "지명타자",
  };

  const squadLineup = $("#squadLineup");
  const squadPool = $("#squadPool");
  const squadPitcher = $("#squadPitcher");
  const squadPitcherName = $("#squadPitcherName");
  const squadDiamond = $("#squadDiamond");
  const squadCount = $("#squadCount");
  const squadStatus = $("#squadStatus");
  const squadPoolNote = $("#squadPoolNote");
  const squadReset = $("#squadReset");
  const squadLoadExpected = $("#squadLoadExpected");
  const squadSave = $("#squadSave");
  const squadCopy = $("#squadCopy");

  const squadState = { pitcher: null, batters: Array(9).fill(null), positions: [...DEFAULT_POSITIONS] };
  let squadActive = 0;
  let squadFilter = "전체";

  function squadPlayer(name) {
    return name ? roster.find((player) => player.name === name) || null : null;
  }

  function squadPlayerPositions(name) {
    const meta = DATA.playerMeta && DATA.playerMeta[name];
    return meta && Array.isArray(meta.positions) ? meta.positions : [];
  }

  function validPosition(value, fallback) {
    return POSITIONS.includes(value) ? value : fallback;
  }

  function loadSquad() {
    try {
      const raw = localStorage.getItem(SQUAD_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object") return;
      if (typeof saved.pitcher === "string" && squadPlayer(saved.pitcher) && squadPlayer(saved.pitcher).group === "투수") {
        squadState.pitcher = saved.pitcher;
      }
      if (Array.isArray(saved.batters)) {
        saved.batters.slice(0, 9).forEach((name, index) => {
          if (typeof name === "string" && squadPlayer(name) && squadPlayer(name).group !== "투수") {
            squadState.batters[index] = name;
          }
        });
      }
      if (Array.isArray(saved.positions)) {
        saved.positions.slice(0, 9).forEach((position, index) => {
          squadState.positions[index] = validPosition(position, DEFAULT_POSITIONS[index]);
        });
      }
    } catch (e) { /* ignore */ }
  }

  function saveSquad(silent) {
    try {
      localStorage.setItem(SQUAD_KEY, JSON.stringify(squadState));
      if (!silent) {
        const time = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
        setSquadStatus(`라인업을 저장했습니다. (${time}) 이 브라우저에 자동 보관됩니다.`);
      }
    } catch (e) {
      if (!silent) setSquadStatus("저장에 실패했습니다. 브라우저 저장 공간을 확인해 주세요.");
    }
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

  function activePosition() {
    return typeof squadActive === "number" ? squadState.positions[squadActive] : "P";
  }

  function renderSquadDiamond() {
    if (!squadDiamond) return;
    const order = ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"];
    squadDiamond.innerHTML = order.map((position) => {
      const slot = squadState.positions.indexOf(position);
      const name = slot >= 0 ? squadState.batters[slot] : null;
      const player = squadPlayer(name);
      const isActive = typeof squadActive === "number" && squadActive === slot;
      const mismatch = player && slot >= 0 && !squadPlayerPositions(name).includes(position);
      return `
        <button class="diamond-marker pos-${position.toLowerCase()} ${player ? "is-filled" : ""} ${isActive ? "is-active" : ""} ${mismatch ? "is-mismatch" : ""}"
          type="button" data-diamond-slot="${slot}" ${slot < 0 ? "disabled" : ""}
          aria-label="${POSITION_LABELS[position]} ${player ? escapeHTML(name) : "미정"}">
          <small>${position}</small>
          <b>${player ? escapeHTML(name) : "—"}</b>
        </button>`;
    }).join("");
  }

  function renderSquad() {
    if (!squadLineup) return;

    /* 라인업이 바뀌면 이전 시뮬레이션 결과는 더 이상 현재 라인업의 결과가 아니므로 숨깁니다. */
    if (!simRunning && simResults) simResults.hidden = true;

    squadLineup.innerHTML = squadState.batters.map((name, index) => {
      const player = squadPlayer(name);
      const position = squadState.positions[index];
      const isActive = squadActive === index;
      const eligible = !player || squadPlayerPositions(name).includes(position);
      return `
        <li class="sq-lineup-item">
          <button class="sq-slot ${player ? "is-filled" : ""} ${isActive ? "is-active" : ""} ${player && !eligible ? "is-mismatch" : ""}" data-slot="${index}" type="button">
            <span class="sq-no">${index + 1}</span>
            <span class="sq-main">
              <b>${player ? escapeHTML(player.name) : "선수 선택"}</b>
              <small>${player ? `${POSITION_LABELS[position] || position} · ${eligible ? "수비 가능" : "비주 포지션"}` : `${index + 1}번 타자 · ${POSITION_LABELS[position] || position}`}</small>
            </span>
            <span class="sq-pos-badge">${position}</span>
            ${player ? `<span class="sq-x" data-clear="${index}" role="button" tabindex="0" aria-label="${escapeHTML(player.name)} 빼기">×</span>` : ""}
          </button>
          <select class="sq-pos-select" data-pos-slot="${index}" aria-label="${index + 1}번 타순 수비 포지션">
            ${POSITIONS.map((pos) => `<option value="${pos}" ${pos === position ? "selected" : ""}>${pos} · ${POSITION_LABELS[pos]}</option>`).join("")}
          </select>
        </li>`;
    }).join("");

    renderSquadDiamond();

    if (squadPitcherName) {
      squadPitcherName.textContent = squadState.pitcher ? squadState.pitcher : "선수 선택";
    }
    if (squadPitcher) {
      squadPitcher.classList.toggle("is-filled", Boolean(squadState.pitcher));
      squadPitcher.classList.toggle("is-active", squadActive === "pitcher");
    }
    if (squadCount) squadCount.textContent = `${squadFilled()} / 10`;
    if (squadPoolNote) {
      squadPoolNote.textContent = squadActive === "pitcher"
        ? "선발 투수 선택 중 · 투수만 배치할 수 있습니다"
        : `선택: ${squadActive + 1}번 타순 · ${activePosition()} ${POSITION_LABELS[activePosition()] || ""}`;
    }

    if (squadPool) {
      const pool = roster.filter((player) => {
        if (squadFilter === "퓨처스") return player.squad === "futures";
        if (squadFilter === "전체") return true;
        return player.group === squadFilter;
      });
      const picked = new Set([squadState.pitcher, ...squadState.batters].filter(Boolean));
      const targetPosition = activePosition();
      squadPool.innerHTML = pool.length ? pool.map((player) => {
        const isPicked = picked.has(player.name);
        const positions = squadPlayerPositions(player.name);
        const fit = squadActive === "pitcher" ? player.group === "투수" : positions.includes(targetPosition);
        const stat = player.stat ? `${player.stat.label} ${player.stat.value}` : player.tag;
        return `
          <button class="sq-chip ${isPicked ? "is-picked" : ""} ${fit ? "is-fit" : "is-out"}" data-name="${escapeHTML(player.name)}" type="button" aria-pressed="${isPicked}">
            <span class="sq-chip-top"><b>${escapeHTML(player.name)}</b><em>${escapeHTML(player.group)}</em></span>
            <small>${escapeHTML(positions.join(" · ") || "포지션 미확인")} · ${escapeHTML(stat)}</small>
            <span class="sq-fit-label">${squadActive === "pitcher" ? (player.group === "투수" ? "선발 가능" : "투수 아님") : (fit ? "수비 적합" : "비주 포지션")}</span>
          </button>`;
      }).join("") : '<p class="roster-empty">해당하는 선수가 없습니다.</p>';
    }

    if (typeof renderSimPreview === "function") renderSimPreview();
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
      const position = squadState.positions[justFilled];
      const eligible = squadPlayerPositions(player.name).includes(position);
      const next = firstEmptyBat();
      squadActive = next === -1 ? null : next;
      setSquadStatus(eligible
        ? `${player.name} 선수를 ${justFilled + 1}번 타순 · ${position}에 넣었습니다.`
        : `${player.name} 선수를 ${justFilled + 1}번에 넣었지만 ${position}는 확인된 주 포지션이 아닙니다. 포지션을 확인해 주세요.`);
    }
    saveSquad(true);
    renderSquad();
  }

  function removeSquadPlayer(name) {
    if (squadState.pitcher === name) squadState.pitcher = null;
    squadState.batters = squadState.batters.map((value) => (value === name ? null : value));
    saveSquad(true);
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

  function loadExpectedLineup() {
    const expected = DATA.simulation && DATA.simulation.expectedLineup;
    if (!expected) {
      setSquadStatus("예상 라인업 데이터가 없습니다.");
      return;
    }
    squadState.pitcher = expected.pitcher || null;
    squadState.batters = Array(9).fill(null);
    squadState.positions = [...DEFAULT_POSITIONS];
    expected.batters.forEach((item, index) => {
      if (index < 9 && squadPlayer(item.name) && squadPlayer(item.name).group !== "투수") {
        squadState.batters[index] = item.name;
        squadState.positions[index] = validPosition(item.position, DEFAULT_POSITIONS[index]);
      }
    });
    squadActive = firstEmptyBat();
    if (squadActive === -1) squadActive = 0;
    saveSquad(true);
    renderSquad();
    setSquadStatus("2026 한국시리즈 출전 조합 기반 예상 라인업을 불러왔습니다. 공식 확정 라인업은 아닙니다.");
  }

  if (squadPitcher) {
    squadPitcher.addEventListener("click", () => {
      squadActive = "pitcher";
      renderSquad();
      setSquadStatus("선발 투수 슬롯을 선택했습니다. 아래에서 투수를 골라주세요.");
    });
  }

  if (squadDiamond) {
    squadDiamond.addEventListener("click", (event) => {
      const marker = event.target.closest("[data-diamond-slot]");
      if (!marker || marker.disabled) return;
      squadActive = Number(marker.dataset.diamondSlot);
      renderSquad();
      setSquadStatus(`${squadActive + 1}번 타순을 선택했습니다. 아래에서 선수를 골라주세요.`);
    });
  }

  if (squadLineup) {
    squadLineup.addEventListener("click", (event) => {
      const clear = event.target.closest("[data-clear]");
      if (clear) {
        event.stopPropagation();
        const index = Number(clear.dataset.clear);
        squadState.batters[index] = null;
        saveSquad(true);
        renderSquad();
        setSquadStatus("타순에서 선수를 뺐습니다.");
        return;
      }
      const slot = event.target.closest("[data-slot]");
      if (!slot) return;
      squadActive = Number(slot.dataset.slot);
      renderSquad();
      setSquadStatus(`${squadActive + 1}번 타순을 선택했습니다. 아래에서 선수를 골라주세요.`);
    });
    squadLineup.addEventListener("change", (event) => {
      const select = event.target.closest("[data-pos-slot]");
      if (!select) return;
      const index = Number(select.dataset.posSlot);
      const next = select.value;
      const otherFilled = squadState.positions.some((position, i) => i !== index && position === next && squadState.batters[i]);
      if (otherFilled) {
        setSquadStatus(`${next} 포지션은 이미 다른 타순에 배치되어 있습니다. 먼저 해당 타순의 포지션을 바꿔 주세요.`);
        renderSquad();
        return;
      }
      const previous = squadState.positions[index];
      const emptySwap = squadState.positions.findIndex((position, i) => i !== index && position === next && !squadState.batters[i]);
      if (emptySwap >= 0) squadState.positions[emptySwap] = previous;
      squadState.positions[index] = next;
      squadActive = index;
      saveSquad(true);
      renderSquad();
      setSquadStatus(`${index + 1}번 타순 포지션을 ${next}로 바꿨습니다.`);
    });
    squadLineup.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const clear = event.target.closest("[data-clear]");
      if (!clear) return;
      event.preventDefault();
      const index = Number(clear.dataset.clear);
      squadState.batters[index] = null;
      saveSquad(true);
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

  if (squadLoadExpected) squadLoadExpected.addEventListener("click", loadExpectedLineup);

  if (squadReset) {
    squadReset.addEventListener("click", () => {
      squadState.pitcher = null;
      squadState.batters = Array(9).fill(null);
      squadState.positions = [...DEFAULT_POSITIONS];
      squadActive = 0;
      saveSquad(true);
      renderSquad();
      setSquadStatus("스쿼드를 초기화했습니다. 예상 라인업을 불러와 수정할 수도 있습니다.");
    });
  }

  if (squadSave) squadSave.addEventListener("click", () => saveSquad(false));

  if (squadCopy) {
    squadCopy.addEventListener("click", async () => {
      if (squadFilled() === 0) {
        setSquadStatus("아직 선택한 선수가 없습니다.");
        return;
      }
      const lines = [
        "🦁 나만의 삼성 라이온즈 스쿼드",
        `선발: ${squadState.pitcher || "미정"}`,
        ...squadState.batters.map((name, index) => `${index + 1}번: ${name || "미정"} (${squadState.positions[index]})`),
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

  /* ---------------- AI 시뮬레이션 ---------------- */
  const simConfig = (DATA.simulation || {});
  const simOpponent = $("#simOpponent");
  const simLineupPreview = $("#simLineupPreview");
  const simDataStatus = $("#simDataStatus");
  const simRun = $("#simRun");
  const simLoading = $("#simLoading");
  const simResults = $("#simResults");
  const simProgressBar = $("#simProgressBar");
  const simProgressText = $("#simProgressText");
  const simBadge = $("#simBadge");
  let simRunning = false;

  function currentLineup() {
    return squadState.batters.map((name, index) => ({
      name,
      position: squadState.positions[index],
      empty: !name,
    }));
  }

  function opponentById(id) {
    return (simConfig.opponents || []).find((team) => team.id === id) || (simConfig.opponents || [])[0] || null;
  }

  function selectedOpponent() {
    return opponentById(simOpponent ? simOpponent.value : null);
  }

  function renderSimPreview() {
    if (!simLineupPreview) return;
    const filled = squadState.batters.filter(Boolean).length;
    const ready = Boolean(squadState.pitcher) && filled === 9;
    const summary = SIM ? SIM.dataSummary(currentLineup().filter((item) => item.name), squadState.pitcher || "선발 투수") : null;
    const names = squadState.batters.map((name, index) => `
      <span class="sim-preview-slot ${name ? "" : "is-empty"}">
        <i>${index + 1}</i><b>${name ? escapeHTML(name) : "미정"}</b><em>${squadState.positions[index]}</em>
      </span>`).join("");
    simLineupPreview.innerHTML = `
      <div class="sim-preview-head">
        <span>내 라인업 ${filled}/9</span>
        <span class="sim-preview-pitcher">선발 <b>${squadState.pitcher ? escapeHTML(squadState.pitcher) : "미정"}</b></span>
      </div>
      <div class="sim-preview-lineup">${names}</div>
      ${summary ? `<p class="sim-preview-meta">실측 OBP·SLG ${summary.confirmed}명 · 부분 기록 ${summary.partial}명 · 리그 평균 대체 ${summary.prior}명</p>` : ""}
      ${ready ? "" : '<p class="sim-preview-warn">타자 9명과 선발 투수를 모두 채워야 시뮬레이션할 수 있습니다.</p>'}`;
    if (simRun) simRun.disabled = !ready || simRunning;
    if (simDataStatus) {
      simDataStatus.textContent = `데이터 기준일 ${simConfig.asOf || DATA.meta?.lastUpdated || "-"} · 확인 ${simConfig.checkedAt || "-"} · 실측 OBP·SLG ${summary ? summary.confirmed : 0}/9 · 상대 팀 개별 기록 미수집`;
    }
  }

  function pct(value) {
    return `${(value * 100).toFixed(1)}%`;
  }

  function renderSimResults(result, recommendation) {
    if (!simResults) return;
    const maxContribution = Math.max(...result.batters.map((b) => b.contribution), 0.001);
    const top = result.topPlayers.map((player, index) => `
      <div class="sim-top-player">
        <span class="sim-rank">${index + 1}</span>
        <div><b>${escapeHTML(player.name)}</b><small>${escapeHTML(player.position)} · 기여도 ${player.contribution.toFixed(2)}</small></div>
        <em>${player.runsPerGame.toFixed(2)} 득점 · ${player.rbiPerGame.toFixed(2)} 타점</em>
      </div>`).join("");

    const lineupRows = result.batters.map((batter, index) => `
      <div class="sim-contrib-row">
        <span class="sim-contrib-slot">${index + 1}</span>
        <span class="sim-contrib-name"><b>${escapeHTML(batter.name)}</b><small>${escapeHTML(batter.position)}</small></span>
        <span class="sim-contrib-bar"><i style="width:${Math.max(4, (batter.contribution / maxContribution) * 100)}%"></i></span>
        <span class="sim-contrib-value">${batter.contribution.toFixed(2)}</span>
      </div>`).join("");

    const factors = result.factors.map((factor) => `
      <li class="sim-factor is-${factor.type}">
        <span>${factor.type === "up" ? "▲" : factor.type === "down" ? "▼" : "•"}</span>
        <div><b>${escapeHTML(factor.label)}</b><small>${escapeHTML(factor.detail)}</small></div>
      </li>`).join("");

    const recommendRows = recommendation ? recommendation.lineup.map((item, index) => `
      <div class="sim-recommend-row ${squadState.batters[index] === item.name ? "is-same" : ""}">
        <span>${index + 1}</span><b>${escapeHTML(item.name || "미정")}</b><em>${escapeHTML(item.position)}</em>
        ${squadState.batters[index] === item.name ? "<small>일치</small>" : ""}
      </div>`).join("") : "";

    const matchCount = recommendation
      ? recommendation.lineup.filter((item, index) => squadState.batters[index] === item.name).length
      : 0;

    simResults.innerHTML = `
      <div class="sim-hero">
        <div class="sim-scoreboard">
          <div class="sim-team"><small>삼성 라이온즈</small><b>${result.avgFor.toFixed(1)}</b><span>평균 득점</span></div>
          <div class="sim-vs">vs</div>
          <div class="sim-team is-opp"><small>${escapeHTML(result.opponent.name)}</small><b>${result.avgAgainst.toFixed(1)}</b><span>평균 득점</span></div>
        </div>
        <div class="sim-probabilities">
          <div class="sim-prob-row is-win"><span>삼성 승리</span><span class="sim-prob-bar"><i style="width:${result.winRate * 100}%"></i></span><b>${pct(result.winRate)}</b></div>
          <div class="sim-prob-row is-loss"><span>상대 승리</span><span class="sim-prob-bar"><i style="width:${result.lossRate * 100}%"></i></span><b>${pct(result.lossRate)}</b></div>
          <div class="sim-prob-row is-draw"><span>무승부</span><span class="sim-prob-bar"><i style="width:${result.drawRate * 100}%"></i></span><b>${pct(result.drawRate)}</b></div>
        </div>
        <p class="sim-hero-note">10,000회 중 승리 ${Math.round(result.winRate * 10000)}회 · 예상 스코어 <b>${result.expectedScore}</b> · 득실차 <b>${result.runDiff >= 0 ? "+" : ""}${result.runDiff.toFixed(2)}</b></p>
      </div>
      <div class="sim-grid">
        <section class="sim-card">
          <h3>예상 스코어 분포</h3>
          <div class="sim-score-dist">
            ${result.scores.map((item) => `<div><span>${escapeHTML(item.score)}</span><i style="width:${Math.max(5, (item.rate / result.scores[0].rate) * 100)}%"></i><b>${pct(item.rate)}</b></div>`).join("")}
          </div>
          <p class="sim-card-note">가장 많이 나온 스코어 상위 5개입니다. 실제 결과와 다를 수 있습니다.</p>
        </section>
        <section class="sim-card">
          <h3>핵심 선수 TOP 3 <small>시뮬레이션 기여도</small></h3>
          <div class="sim-top-list">${top}</div>
          <p class="sim-card-note">기여도 = 득점 0.7 + 타점 + 안타 0.12 + 홈런 0.5 (경기당)</p>
        </section>
        <section class="sim-card sim-span-2">
          <h3>타선별 기대 득점 기여도</h3>
          <div class="sim-contrib-list">${lineupRows}</div>
        </section>
        <section class="sim-card">
          <h3>선발 투수 매치업</h3>
          <div class="sim-pitcher-match">
            <div><small>삼성 선발 · ${escapeHTML(result.pitcherName)}</small><b>${result.pitcher.ip.toFixed(1)} IP</b><span>${result.pitcher.runs.toFixed(2)} 실점 · ${result.pitcher.k.toFixed(1)} K</span></div>
            <div class="sim-pitcher-vs">vs</div>
            <div><small>${escapeHTML(result.opponent.name)} 선발 · 리그 평균 모델</small><b>${result.oppPitcher.ip.toFixed(1)} IP</b><span>${result.oppPitcher.runs.toFixed(2)} 실점 · ${result.oppPitcher.k.toFixed(1)} K</span></div>
          </div>
          <p class="sim-card-note">교체·불펜 소모 자료가 없어 선발 모델을 경기 전체에 적용한 단순화입니다. 표시 이닝은 실제 선발 예상 이닝이 아닙니다. 상대 선발은 리그 평균 모델입니다.</p>
        </section>
        <section class="sim-card">
          <h3>핵심 변수</h3>
          <ul class="sim-factor-list">${factors}</ul>
        </section>
        <section class="sim-card sim-span-2">
          <h3>승리 확률을 높이는 추천 타순 <small>${recommendation ? escapeHTML(recommendation.label) : ""}</small></h3>
          ${recommendation ? `
            <div class="sim-recommend-head"><span>현재 타순과 ${matchCount}/9 일치 · 예상 승률 ${recommendation.deltaWin >= 0 ? "+" : ""}${(recommendation.deltaWin * 100).toFixed(1)}%p · 평균 득점 ${recommendation.deltaRuns >= 0 ? "+" : ""}${recommendation.deltaRuns.toFixed(2)}</span></div>
            <div class="sim-recommend-list">${recommendRows}</div>
            <p class="sim-card-note">후보 타순을 각 320경기씩 비교한 결과입니다. 선수 포지션은 유지하며, 표본이 작아 참고용으로만 보세요.</p>` : "<p class=\"sim-card-note\">9명을 모두 채우면 추천 타순을 계산합니다.</p>"}
        </section>
      </div>`;
    simResults.hidden = false;
  }

  function setSimProgress(value) {
    if (simProgressBar) simProgressBar.style.width = `${Math.round(value * 100)}%`;
    if (simProgressText) simProgressText.textContent = `${Math.round(value * 100)}%`;
  }

  async function runSimulation() {
    if (simRunning) return;
    if (!SIM) {
      setSquadStatus("시뮬레이션 엔진을 불러오지 못했습니다.");
      return;
    }
    const filled = squadState.batters.filter(Boolean).length;
    if (!squadState.pitcher || filled !== 9) {
      setSquadStatus("타자 9명과 선발 투수를 모두 채워 주세요.");
      return;
    }
    const opponent = selectedOpponent();
    if (!opponent) return;

    simRunning = true;
    if (simRun) simRun.disabled = true;
    if (simLoading) simLoading.hidden = false;
    if (simResults) simResults.hidden = true;
    setSimProgress(0);
    if (simBadge) simBadge.textContent = "계산 중";

    const line = currentLineup();
    try {
      const result = await SIM.simulateAsync({
        lineup: line,
        pitcher: squadState.pitcher,
        opponent,
        iterations: simConfig.iterations || 10000,
      }, (progress) => setSimProgress(progress * 0.92));

      if (simProgressText) simProgressText.textContent = "추천 타순 계산";
      await new Promise((resolve) => setTimeout(resolve, 30));
      const recommendation = SIM.recommend({
        lineup: line,
        pitcher: squadState.pitcher,
        opponent,
      });
      setSimProgress(1);
      renderSimResults(result, recommendation);
      if (simBadge) simBadge.textContent = `${(simConfig.iterations || 10000).toLocaleString("ko-KR")}회`;
    } catch (error) {
      if (simResults) {
        simResults.hidden = false;
        simResults.innerHTML = `<p class="roster-empty">시뮬레이션 중 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요.</p>`;
      }
    } finally {
      simRunning = false;
      if (simRun) simRun.disabled = false;
      if (simLoading) simLoading.hidden = true;
      renderSimPreview();
    }
  }

  if (simOpponent && simConfig.opponents) {
    simOpponent.innerHTML = simConfig.opponents.map((team) => `<option value="${escapeHTML(team.id)}">${escapeHTML(team.name)} · 승률 ${team.pct.toFixed(3)}</option>`).join("");
  }
  if (simRun) simRun.addEventListener("click", runSimulation);
  if (simOpponent) {
    simOpponent.addEventListener("change", () => {
      if (simResults) simResults.hidden = true;
      renderSimPreview();
    });
  }

  loadSquad();
  const squadStart = firstEmptyBat();
  squadActive = squadStart === -1 ? 0 : squadStart;
  renderSquad();
  renderSimPreview();

  /* ---------------- 팬 보드 (GitHub Issues 공유) ---------------- */

  const cheerForm = $("#cheerForm");
  const cheerName = $("#cheerName");
  const cheerMsg = $("#cheerMsg");
  const cheerList = $("#cheerList");
  const boardTotal = $("#boardTotal");
  const boardStatus = $("#boardStatus");
  const boardRefresh = $("#boardRefresh");
  const cheerFade = bindFade(cheerList);

  let boardPosts = [];

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

        if (post.href || post.scope === "local") {
          const link = document.createElement("a");
          link.className = "cheer-line-link";
          link.href = post.href || window.LIONS_BOARD.publishUrl(post);
          link.target = "_blank";
          link.rel = "noopener";
          link.setAttribute("aria-label", post.scope === "local" ? `${post.name}의 응원을 GitHub에 공개` : `${post.name}의 GitHub 글 열기`);
          link.textContent = post.scope === "local" ? "공개 ↗" : "↗";
          const scope = document.createElement("small");
          scope.textContent = post.scope === "local" ? "이 브라우저" : post.scope === "demo" ? "데모" : "GitHub 공개";
          body.append(scope);
          li.append(avatar, body, link);
        } else {
          li.append(avatar, body);
        }

        cheerList.appendChild(li);
      });
    cheerFade();
  }

  async function fetchBoard() {
    return window.LIONS_BOARD.refresh(true);
  }

  if (cheerForm) {
    cheerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = cheerName ? cheerName.value.trim() : "";
      const message = cheerMsg ? cheerMsg.value.trim() : "";
      if (!name || !message) return;

      if (window.LIONS_BOARD.add(name, message)) cheerForm.reset();
    });
  }

  if (boardRefresh) boardRefresh.addEventListener("click", fetchBoard);

  window.LIONS_BOARD.subscribe((posts, status) => {
    boardPosts = posts;
    renderBoard();
    if (boardStatus) boardStatus.textContent = status;
  });

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
