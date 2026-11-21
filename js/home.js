(function () {
  "use strict";
  const data = window.LIONS_DATA;
  const main = document.querySelector("#main");
  if (!main || !data) return;
  const dashboard = document.body.classList.contains("dashboard") || Boolean(document.querySelector(".dash-grid"));
  const overview = document.createElement("section");
  overview.className = `home-overview ${dashboard ? "" : "container"}`;
  overview.setAttribute("aria-label", "오늘의 라이온즈 한눈에 보기");
  // Static structure; external data is inserted only with textContent below.
  overview.innerHTML = `
    <nav class="home-shortcuts" aria-label="주요 메뉴">
      <a href="#schedule">일정·결과</a><a href="#fanzone">팬 보드</a>
      <a href="${dashboard ? "#news" : "index.html#news"}">뉴스·FA</a>
      <a href="${dashboard ? "#squad" : "index.html#squad"}">내 스쿼드</a>
    </nav>
    <div class="home-cards">
      <article class="home-card"><h2>다음 경기</h2><strong data-home-next></strong><p data-home-next-date></p><a href="#schedule">전체 일정 →</a></article>
      <article class="home-card"><h2>최근 경기 결과</h2><strong data-home-score></strong><p data-home-result-date></p><a href="#schedule">경기 기록 →</a></article>
      <article class="home-card"><h2>팬들의 한마디</h2><ul data-home-posts></ul><a href="#fanzone">팬 보드 · 글 남기기 →</a></article>
    </div>`;
  main.prepend(overview);
  const set = (selector, text) => { overview.querySelector(selector).textContent = text; };
  const next = data.simulation && data.simulation.nextGame;
  set("[data-home-next]", next ? `삼성 vs ${next.opponent}` : "공식 다음 경기 미발표");
  set("[data-home-next-date]", next ? `${next.date} ${next.time || ""}` : "시즌 종료 · 새 일정 발표를 기다리고 있습니다.");
  const latest = (data.schedule || []).filter(game => game.result && game.score)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  set("[data-home-score]", latest ? `삼성 ${latest.result} · ${latest.score} vs ${latest.opponent}` : "확인된 경기 결과 없음");
  set("[data-home-result-date]", latest ? `${latest.date} · ${latest.stage} · 프로젝트 기록 기준 ${data.meta.lastUpdated}` : "");
  window.LIONS_BOARD.subscribe(posts => {
    const list = overview.querySelector("[data-home-posts]");
    list.replaceChildren();
    posts.slice(0, 2).forEach(post => {
      const li = document.createElement("li");
      li.textContent = `${post.name}: ${post.message}`;
      list.append(li);
    });
    if (!posts.length) {
      const li = document.createElement("li");
      li.textContent = "첫 응원을 남겨보세요.";
      list.append(li);
    }
  });
  // Move complete existing sections rather than clone/remove their functionality.
  if (dashboard) {
    const grid = document.querySelector(".dash-grid");
    const hero = grid.firstElementChild;
    ["fanzone", "news", "fa", "schedule", "next"].forEach(id => {
      const section = document.getElementById(id);
      if (section) grid.insertBefore(section, hero);
    });
    document.querySelector(".page-head").classList.add("home-secondary-heading");
  } else {
    main.insertBefore(document.getElementById("fanzone"), overview.nextSibling);
    document.querySelector(".hero").classList.add("home-history-hero");
    const updates = document.createElement("section");
    updates.className = "container home-updates";
    updates.setAttribute("aria-label", "삼성 뉴스와 FA");
    updates.innerHTML = '<h2>뉴스·FA</h2><ul data-home-news></ul><p data-home-news-status class="data-update-status"></p><p data-home-fa></p><a href="index.html#fa">공식 FA 발표 자세히 →</a>';
    main.insertBefore(updates, document.querySelector(".hero"));
    const renderUpdates = () => {
      const live = window.LIONS_LIVE;
      const list = updates.querySelector("[data-home-news]");
      list.replaceChildren();
      if (live.news) {
        live.news.items.slice(0, 3).forEach(item => {
          const li = document.createElement("li");
          const link = document.createElement("a");
          link.href = item.href;
          link.target = "_blank";
          link.rel = "noopener";
          link.textContent = `${item.title} · ${item.source} · ${item.date}`;
          li.append(link);
          list.append(li);
        });
        updates.querySelector("[data-home-news-status]").textContent =
          `뉴스 마지막 성공 ${new Date(live.news.lastSuccessAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })} KST${live.offline || live.status.news?.ok === false ? " · 수집 지연, 기존 데이터 유지" : ""}`;
      }
      if (live.fa) updates.querySelector("[data-home-fa]").textContent =
        `${live.fa.season} FA · ${live.fa.players.map(player => `${player.name}: ${player.status}`).join(" / ")} · 마지막 성공 ${new Date(live.fa.lastSuccessAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })} KST${live.offline || live.status.fa?.ok === false ? " · 수집 지연, 기존 데이터 유지" : ""}`;
    };
    window.addEventListener("lions:data-updated", renderUpdates);
    renderUpdates();
  }
})();
