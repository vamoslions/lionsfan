/* Shared board: browser posts sync immediately; public posts use GitHub Issues.
   No credentials are embedded in this static site. Public publishing needs GitHub. */
(function () {
  "use strict";
  const LOCAL_KEY = "vamos-lions-cheers-v1";
  const CACHE_KEY = "vamos-lions-board-cache-v2";
  const SYNC_KEY = "vamos-lions-board-sync-v1";
  const REPO = "vamoslions/lionsfan";
  const API = `https://api.github.com/repos/${REPO}/issues?state=open&per_page=100&sort=created&direction=desc`;
  const demo = new URLSearchParams(location.search).get("board") === "demo";
  const listeners = new Set();
  let busy = false;
  let lastRequest = 0;
  let retryAt = 0;
  let status = "";
  function read(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  }
  function normalize(posts) {
    const unique = new Map();
    posts.forEach((post) => {
      if (!post || !post.id || typeof post.name !== "string" || typeof post.message !== "string") return;
      unique.set(String(post.id), { ...post, id: String(post.id) });
    });
    return [...unique.values()].sort((a, b) =>
      (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0) || b.id.localeCompare(a.id));
  }
  const demoPosts = [
    { id: "demo-1", name: "라팍3루", message: "최강삼성! 함께 응원해요.", at: "2026-11-09T10:00:00+09:00", scope: "demo" },
    { id: "demo-2", name: "구자욱팬", message: "다음 시즌도 함께 갑니다!", at: "2026-11-10T10:00:00+09:00", scope: "demo" },
  ];
  let remote = demo ? demoPosts : read(CACHE_KEY);
  function posts() {
    // Public versions replace local drafts with the same stable ID.
    return normalize([...read(LOCAL_KEY).filter(p => !String(p.id).startsWith("seed-"))
      .map(p => ({ ...p, scope: "local" })), ...remote]);
  }
  function emit() {
    listeners.forEach(listener => listener(posts(), status));
  }
  function issuePost(issue) {
    const marker = String(issue.body || "").match(/<!-- vamos-post:([a-zA-Z0-9-]+) -->/);
    return {
      id: marker ? marker[1] : `github-${issue.number}`,
      name: String(issue.title || "").replace(/^\s*\[팬보드\]\s*/, "").trim() || "팬",
      message: String(issue.body || "").split(/\n\s*---\s*\n/)[0].replace(/<!--.*?-->/g, "").trim() || "(내용 없음)",
      at: issue.created_at,
      href: issue.html_url,
      scope: "public",
    };
  }
  async function refresh(force) {
    if (demo) { status = "데모 게시글 · 실제 게시글과 별도"; emit(); return; }
    const now = Date.now();
    let sharedRequest = 0;
    try { sharedRequest = Number(localStorage.getItem(SYNC_KEY)) || 0; } catch (_) { /* optional */ }
    if (busy || now < retryAt || now - lastRequest < 10000 || (!force && now - sharedRequest < 55000)) return;
    busy = true;
    lastRequest = now;
    try { localStorage.setItem(SYNC_KEY, String(now)); } catch (_) { /* optional */ }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(API, {
        headers: { Accept: "application/vnd.github+json" },
        cache: "no-cache",
        signal: controller.signal,
      });
      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          const reset = Number(response.headers.get("x-ratelimit-reset")) * 1000;
          const retry = Number(response.headers.get("retry-after")) * 1000;
          retryAt = Math.max(now + (retry || 60000), reset || 0);
        }
        throw new Error("board fetch");
      }
      const issues = await response.json();
      if (!Array.isArray(issues)) throw new Error("board format");
      remote = normalize(issues.filter(issue => !issue.pull_request &&
        ((issue.labels || []).some(label => (typeof label === "string" ? label : label.name) === "fanboard") ||
          String(issue.title || "").startsWith("[팬보드]"))).map(issuePost));
      write(CACHE_KEY, remote);
      status = "공개 글 자동 확인: 약 1분마다 · 이 브라우저의 응원은 즉시 반영";
    } catch (_) {
      status = "공개 글 연결 지연 · 저장된 글을 표시하며 자동 재시도합니다";
    } finally {
      clearTimeout(timeout);
      busy = false;
      emit();
    }
  }
  function add(name, message) {
    const post = {
      id: `c-${crypto.randomUUID()}`,
      name: name.trim().slice(0, 12),
      message: message.trim().slice(0, 80),
      at: new Date().toISOString(),
    };
    if (!post.name || !post.message) return false;
    if (!write(LOCAL_KEY, normalize([...read(LOCAL_KEY), post]))) {
      status = "브라우저 저장 실패 · 저장 공간과 개인정보 보호 설정을 확인해 주세요.";
      emit();
      return false;
    }
    status = "응원을 저장했습니다 · 같은 브라우저의 모든 탭에 즉시 반영됩니다.";
    emit();
    return true;
  }
  function remove(id) {
    if (!write(LOCAL_KEY, read(LOCAL_KEY).filter(post => post.id !== id))) return false;
    emit();
    return true;
  }
  function publishUrl(post) {
    const body = `${post.message}\n\n---\nVAMOS LIONS 팬보드에서 보냄\n<!-- vamos-post:${post.id} -->`;
    return `https://github.com/${REPO}/issues/new?labels=fanboard&title=${encodeURIComponent("[팬보드] " + post.name)}&body=${encodeURIComponent(body)}`;
  }
  window.LIONS_BOARD = {
    posts, add, remove, refresh, publishUrl,
    subscribe(listener) {
      listeners.add(listener);
      listener(posts(), status);
      return () => listeners.delete(listener);
    },
  };
  window.addEventListener("storage", event => {
    if (event.key === CACHE_KEY || event.key === null) remote = demo ? demoPosts : read(CACHE_KEY);
    if ([LOCAL_KEY, CACHE_KEY, null].includes(event.key)) emit();
  });
  window.addEventListener("focus", () => refresh(false));
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh(false);
  });
  setInterval(() => { if (!document.hidden) refresh(false); }, 60000);
  refresh(false);
})();
