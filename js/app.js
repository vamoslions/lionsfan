/* =========================================================
   VAMOS LIONS · app.js
   ========================================================= */
(function () {
  "use strict";

  const DATA = window.LIONS_DATA;
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

  /* ---------------- 테마 ---------------- */
  const THEME_KEY = "lions-theme";
  const themeToggle = $("#themeToggle");

  function applyTheme(theme) {
    document.body.classList.toggle("light", theme === "light");
    const isLight = theme === "light";
    themeToggle.setAttribute("aria-label", isLight ? "다크 모드로 전환" : "라이트 모드로 전환");
    document.querySelector('meta[name="theme-color"]').setAttribute("content", isLight ? "#f3f6fc" : "#060d1b");
  }

  let savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
  const themeParam = new URLSearchParams(window.location.search).get("theme");
  const initialTheme = themeParam === "dark" || themeParam === "light"
    ? themeParam
    : savedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  applyTheme(initialTheme);

  themeToggle.addEventListener("click", () => {
    const next = document.body.classList.contains("light") ? "dark" : "light";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
  });

  /* ---------------- 헤더 / 네비 ---------------- */
  const header = $("#siteHeader");
  const menuBtn = $("#menuBtn");
  const nav = $("#nav");
  const toTop = $("#toTop");

  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 10);
    toTop.classList.toggle("show", window.scrollY > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  });

  $$("#nav a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "메뉴 열기");
    });
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("open")) return;
    if (!nav.contains(event.target) && !menuBtn.contains(event.target)) {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });

  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const navLinks = $$("#nav a");
  const sectionIds = navLinks.map((a) => a.getAttribute("href")).filter(Boolean);
  const sections = sectionIds.map((id) => document.querySelector(id)).filter(Boolean);

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
    sections.forEach((section) => navObserver.observe(section));
  }

  /* ---------------- 카운트다운 ---------------- */
  const opener = new Date(DATA.meta.nextSeasonOpener);
  const cd = {
    days: $('[data-cd="days"]'),
    hours: $('[data-cd="hours"]'),
    minutes: $('[data-cd="minutes"]'),
    seconds: $('[data-cd="seconds"]'),
  };

  function pad(n) { return String(n).padStart(2, "0"); }

  function tick() {
    const diff = opener.getTime() - Date.now();
    if (diff <= 0) {
      Object.entries(cd).forEach(([, el]) => { if (el) el.textContent = "00"; });
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
  const scheduleList = $("#scheduleList");
  const scheduleCount = $("#scheduleCount");
  let scheduleFilter = "all";

  function parseGameDate(str) {
    const parts = str.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function gameCard(game) {
    const date = parseGameDate(game.date);
    const month = date.getMonth() + 1;
    const day = String(date.getDate()).padStart(2, "0");
    const weekday = DAYS[date.getDay()];
    const isWin = game.result === "승";
    const isLoss = game.result === "패";
    const cls = isWin ? "is-win" : isLoss ? "is-loss" : "";
    const resultClass = isWin ? "win" : isLoss ? "loss" : "upcoming";
    const locClass = game.home ? "home" : "away";
    const locText = game.home ? "홈" : "원정";

    return `
      <article class="game-row ${cls}" data-home="${game.home}" data-result="${escapeHTML(game.result)}">
        <div class="game-date">
          <strong>${day}</strong>
          <span>${month}월 · ${weekday}요일</span>
        </div>
        <div class="game-main">
          <span class="stage">${escapeHTML(game.stage)}</span>
          <h3><span class="vs">VS</span> ${escapeHTML(game.opponent)}</h3>
          <p>${escapeHTML(game.venue)} · ${escapeHTML(game.time)}</p>
        </div>
        <div class="game-score" title="삼성 : 상대">
          <span class="score">${escapeHTML(game.score)}</span>
          <span class="result ${resultClass}">${escapeHTML(game.result)}</span>
        </div>
        <div class="game-loc">
          <span class="loc ${locClass}">${locText}</span>
        </div>
      </article>`;
  }

  function renderSchedule() {
    const games = DATA.schedule.filter((game) => {
      if (scheduleFilter === "home") return game.home;
      if (scheduleFilter === "away") return !game.home;
      if (scheduleFilter === "win") return game.result === "승";
      return true;
    });

    scheduleList.innerHTML = games.map(gameCard).join("");
    scheduleCount.textContent = `${games.length}경기 · 삼성 기준 홈/원정`;

    if (!games.length) {
      scheduleList.innerHTML = '<p class="data-note">조건에 맞는 경기가 없습니다.</p>';
    }
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

    DATA.schedule.forEach((game, index) => {
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

  $("#icsBtn").addEventListener("click", downloadIcs);

  /* ---------------- 선수단 ---------------- */
  const rosterGrid = $("#rosterGrid");
  const rosterSearch = $("#rosterSearch");
  const rosterEmpty = $("#rosterEmpty");
  let rosterFilter = "전체";

  function rosterCard(player) {
    const name = escapeHTML(player.name);
    const ig = DATA.instagramAccounts && DATA.instagramAccounts[player.name];
    const meta = DATA.playerMeta && DATA.playerMeta[player.name];
    const positions = meta && Array.isArray(meta.positions) ? meta.positions.join(" · ") : "";
    const news = `https://search.naver.com/search.naver?query=${encodeURIComponent(player.name + " 삼성 라이온즈")}`;
    const instaLink = ig
      ? `<a class="mini-link" href="https://www.instagram.com/${encodeURIComponent(ig.handle)}/" target="_blank" rel="noopener" aria-label="${name} 인스타그램 @${escapeHTML(ig.handle)}">Instagram @${escapeHTML(ig.handle)} ↗</a>`
      : `<span class="mini-link is-disabled" title="${escapeHTML((DATA.instagramNotes && DATA.instagramNotes[player.name]) || "본인 계정을 확인하지 못했습니다.")}" aria-label="${name} 인스타그램 계정 정보 없음">계정 정보 없음</span>`;

    return `
      <article class="roster-card" data-group="${escapeHTML(player.group)}">
        <div class="roster-top">
          <span class="roster-emoji" aria-hidden="true">${escapeHTML(player.emoji)}</span>
          <span class="pos-badge">${escapeHTML(player.group)}</span>
        </div>
        <h3>${name}</h3>
        <p class="roster-role">${escapeHTML(player.role)}</p>
        ${positions ? `<span class="roster-positions">${escapeHTML(positions)}</span>` : ""}
        <span class="roster-tag">${escapeHTML(player.tag)}</span>
        <p class="roster-desc">${escapeHTML(player.desc)}</p>
        <div class="roster-links">
          ${instaLink}
          <a class="mini-link" href="${news}" target="_blank" rel="noopener" aria-label="${name} 뉴스 검색">뉴스 ↗</a>
        </div>
      </article>`;
  }

  function renderRoster() {
    const keyword = rosterSearch.value.trim().toLowerCase();
    const players = DATA.roster.filter((player) => {
      const matchesGroup = rosterFilter === "전체" || player.group === rosterFilter;
      const haystack = [player.name, player.role, player.tag, player.desc].join(" ").toLowerCase();
      return matchesGroup && (!keyword || haystack.includes(keyword));
    });

    rosterGrid.innerHTML = players.map(rosterCard).join("");
    rosterEmpty.hidden = players.length > 0;
  }

  $$("[data-roster-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      rosterFilter = btn.dataset.rosterFilter;
      $$("[data-roster-filter]").forEach((b) => b.classList.toggle("active", b === btn));
      renderRoster();
    });
  });

  rosterSearch.addEventListener("input", renderRoster);
  renderRoster();

  /* ---------------- 코칭스태프 ---------------- */
  const staffGrid = $("#staffGrid");
  staffGrid.innerHTML = DATA.staff.map((person) => `
    <article class="staff-card">
      <div class="staff-top">
        <span class="staff-emoji" aria-hidden="true">${escapeHTML(person.emoji)}</span>
        <span class="pos-badge">${escapeHTML(person.tag)}</span>
      </div>
      <h4>${escapeHTML(person.name)}</h4>
      <p class="staff-role">${escapeHTML(person.role)}</p>
      <p>${escapeHTML(person.desc)}</p>
    </article>`).join("");

  /* ---------------- 연혁 타임라인 ---------------- */
  const timeline = $("#timeline");
  timeline.innerHTML = DATA.timeline.map((item) => `
    <div class="tl-item ${item.year === "2026" ? "current" : ""}" role="listitem">
      <span class="tl-year">${escapeHTML(item.year)}</span>
      <span class="tl-title">${escapeHTML(item.title)}</span>
      <p class="tl-desc">${escapeHTML(item.desc)}</p>
    </div>`).join("");

  /* ---------------- 라이온즈TV 카드 ---------------- */
  const videoCards = $("#videoCards");
  videoCards.innerHTML = DATA.videos.map((video) => `
    <a class="video-card" href="https://www.youtube.com/@lionstv1982/search?query=${encodeURIComponent(video.query)}" target="_blank" rel="noopener">
      <span class="video-emoji" aria-hidden="true">${escapeHTML(video.emoji)}</span>
      <span class="video-body">
        <span>${escapeHTML(video.tag)}</span>
        <h4>${escapeHTML(video.title)}</h4>
        <p>${escapeHTML(video.desc)}</p>
      </span>
      <span class="video-arrow" aria-hidden="true">↗</span>
    </a>`).join("");

  /* ---------------- SNS 링크 ---------------- */
  const linkGrid = $("#linkGrid");
  let linkFilter = "전체";

  function renderLinks() {
    const links = DATA.links.filter((link) => linkFilter === "전체" || link.group === linkFilter);
    linkGrid.innerHTML = links.map((link) => {
      const dark = ["#f5c451", "#03c75a"].includes(link.color);
      return `
        <a class="link-card" href="${link.href}" target="_blank" rel="noopener" data-group="${escapeHTML(link.group)}">
          <span class="link-mark" style="background:${link.color};color:${dark ? "#0a152c" : "#fff"}">${escapeHTML(link.mark)}</span>
          <span class="link-body">
            <strong>${escapeHTML(link.name)}</strong>
            <span>${escapeHTML(link.desc)}</span>
          </span>
          <span class="arrow" aria-hidden="true">↗</span>
        </a>`;
    }).join("");
  }

  $$("[data-link-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      linkFilter = btn.dataset.linkFilter;
      $$("[data-link-filter]").forEach((b) => b.classList.toggle("active", b === btn));
      renderLinks();
    });
  });

  renderLinks();

  /* ---------------- 직관 가이드 ---------------- */
  const guideGrid = $("#guideGrid");
  guideGrid.innerHTML = DATA.checklist.map((item, index) => `
    <article class="guide-card">
      <span class="guide-num">STEP ${String(index + 1).padStart(2, "0")}</span>
      <span class="guide-emoji" aria-hidden="true">${escapeHTML(item.emoji)}</span>
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.desc)}</p>
      <a href="${item.href}" target="_blank" rel="noopener">자세히 보기 →</a>
    </article>`).join("");

  /* ---------------- 팬 보드 ---------------- */
  const cheerForm = $("#cheerForm");
  const cheerName = $("#cheerName");
  const cheerMsg = $("#cheerMsg");
  const cheerList = $("#cheerList");
  const cheerCount = $("#cheerCount");
  const boardTotal = $("#boardTotal");

  let cheers = window.LIONS_BOARD.posts();

  function timeAgo(iso) {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";
    const diff = Date.now() - then;
    if (diff < 60000) return "방금";
    if (diff < 3600000) return Math.floor(diff / 60000) + "분 전";
    if (diff < 86400000) return Math.floor(diff / 3600000) + "시간 전";
    if (diff < 604800000) return Math.floor(diff / 86400000) + "일 전";
    const d = new Date(iso);
    return `${d.getMonth() + 1}.${d.getDate()}`;
  }

  function renderCheers() {
    boardTotal.textContent = `${cheers.length}개의 응원`;
    if (!cheers.length) {
      cheerList.innerHTML = '<li class="cheer-empty">첫 번째 응원을 남겨보세요! 🦁</li>';
      return;
    }

    cheerList.innerHTML = "";
    cheers.slice().sort((a, b) => new Date(b.at) - new Date(a.at)).forEach((cheer) => {
      const li = document.createElement("li");
      li.className = "cheer-item";

      const avatar = document.createElement("span");
      avatar.className = "cheer-avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = (cheer.name || "?").trim().charAt(0);

      const content = document.createElement("div");
      content.className = "cheer-content";

      const meta = document.createElement("div");
      meta.className = "cheer-meta";
      const nameEl = document.createElement("strong");
      nameEl.textContent = cheer.name;
      const timeEl = document.createElement("span");
      timeEl.textContent = timeAgo(cheer.at);
      meta.append(nameEl, timeEl);

      const msg = document.createElement("p");
      msg.textContent = cheer.message;

      content.append(meta, msg);

      const del = document.createElement("a");
      del.className = "cheer-del";
      del.href = cheer.href || "https://github.com/vamoslions/lionsfan/issues";
      del.target = "_blank";
      del.rel = "noopener";
      del.setAttribute("aria-label", `${cheer.name}의 GitHub 공개 글 열기`);
      del.textContent = cheer.scope === "demo" ? "데모" : "공개 ↗";

      li.append(avatar, content, del);
      cheerList.appendChild(li);
    });
  }

  cheerMsg.addEventListener("input", () => {
    cheerCount.textContent = cheerMsg.value.length;
  });

  cheerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = cheerName.value.trim();
    const message = cheerMsg.value.trim();
    if (!name || !message) return;

    // Keep entered content until GitHub has actually saved the public issue.
    window.LIONS_BOARD.publish(name, message);
  });

  window.LIONS_BOARD.subscribe((posts, status) => {
    cheers = posts;
    renderCheers();
    const boardStatus = $("#boardStatus");
    if (boardStatus) boardStatus.textContent = status;
  });
  const boardRefresh = $("#boardRefresh");
  if (boardRefresh) boardRefresh.addEventListener("click", () => window.LIONS_BOARD.refresh(true));

  /* ---------------- 마지막 업데이트 ---------------- */
  const lastUpdated = $("#lastUpdated");
  if (lastUpdated) lastUpdated.textContent = DATA.meta.lastUpdated;

  /* ---------------- 스크롤 리빌 ---------------- */
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 60}ms`;
      observer.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add("in"));
  }

  /* ---------------- 오늘 날짜 기준 시즌 상태 (확장용) ---------------- */
  // 필요 시 이곳에서 오늘 경기 API를 연결할 수 있습니다.
})();
