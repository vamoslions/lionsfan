/* Public board: GitHub Issues is the only post store.
   Browser storage is a read cache / private legacy-draft recovery, not publishing.
   A static Pages site cannot silently write as a GitHub user without OAuth.
   GitHub's own authenticated editor enforces author/admin edit/delete permissions. */
(function () {
  "use strict";
  const LEGACY_KEY = "vamos-lions-cheers-v1";
  const CACHE_KEY = "vamos-lions-public-board-v3";
  const SYNC_KEY = "vamos-lions-public-board-sync-v3";
  const PENDING_KEY = "vamos-lions-board-pending-v1";
  const REPO = "vamoslions/lionsfan";
  const API = `https://api.github.com/repos/${REPO}/issues?state=open&per_page=100&sort=created&direction=desc`;
  // Anonymous GitHub API: 60 requests/hour/IP. Two browser sessions + focus/manual
  // requests need headroom. Visible tabs share a lease; hidden tabs skip polling.
  const POLL_MS = 180000;
  const demo = new URLSearchParams(location.search).get("board") === "demo";
  const listeners = new Set();
  let busy = false;
  let lastRequest = 0;
  let retryAt = 0;
  let status = "공개 게시글을 확인하고 있습니다.";
  function read(key, target) {
    try {
      const storage = target === "session" ? sessionStorage : localStorage;
      const value = JSON.parse(storage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }
  function write(key, value, target) {
    try {
      const storage = target === "session" ? sessionStorage : localStorage;
      storage.setItem(key, JSON.stringify(value)); return true;
    }
    catch (_) { return false; }
  }
  function normalize(posts) {
    const unique = new Map();
    posts.forEach(post => {
      if (!post || !post.id || typeof post.name !== "string" || typeof post.message !== "string") return;
      if (post.scope !== "public" && post.scope !== "demo") return;
      if (post.scope === "public" && !String(post.href).startsWith(`https://github.com/${REPO}/issues/`)) return;
      unique.set(String(post.id), { ...post, id: String(post.id) });
    });
    return [...unique.values()].sort((a, b) =>
      (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0) || b.id.localeCompare(a.id));
  }
  const demoPosts = [
    { id: "demo-1", name: "라팍3루", message: "최강삼성! 함께 응원해요.", at: "2026-11-09T10:00:00+09:00", scope: "demo" },
    { id: "demo-2", name: "구자욱팬", message: "다음 시즌도 함께 갑니다!", at: "2026-11-10T10:00:00+09:00", scope: "demo" },
  ];
  let remote = demo ? demoPosts : normalize(read(CACHE_KEY));
  function posts() { return normalize(remote); }
  function legacyDrafts() {
    return read(LEGACY_KEY).filter(post => post && typeof post.name === "string" &&
      typeof post.message === "string" && !String(post.id).startsWith("seed-") &&
      !remote.some(item => item.clientId === post.id));
  }
  function emit() {
    listeners.forEach(listener => listener(posts(), status));
    renderLegacyDrafts();
  }
  function issuePost(issue) {
    const marker = String(issue.body || "").match(/<!-- vamos-post:([a-zA-Z0-9-]+) -->/);
    return {
      // Server issue ID is canonical. A user-controlled body marker cannot
      // replace another user's post; it is used only for publish confirmation.
      id: `github-${issue.number}`,
      clientId: marker ? marker[1] : "",
      name: String(issue.title || "").replace(/^\s*\[팬보드\]\s*/, "").trim() || "팬",
      message: String(issue.body || "").split(/\n\s*---\s*\n/)[0].replace(/<!--.*?-->/g, "").trim() || "(내용 없음)",
      at: issue.created_at,
      href: issue.html_url,
      authorLogin: issue.user && issue.user.login || "",
      scope: "public",
    };
  }
  function confirmPending() {
    const pending = read(PENDING_KEY, "session");
    const remaining = pending.filter(draft => !remote.some(post => post.clientId === draft.id));
    write(PENDING_KEY, remaining, "session");
    return { confirmed: remaining.length < pending.length, waiting: remaining.length > 0 };
  }
  async function refresh(force) {
    if (demo) { status = "데모 게시글 · 실제 게시글과 별도"; emit(); return; }
    const now = Date.now();
    let sharedRequest = 0;
    try { sharedRequest = Number(localStorage.getItem(SYNC_KEY)) || 0; } catch (_) { /* optional */ }
    if (busy || now < retryAt || now - lastRequest < 10000 ||
        (!force && now - sharedRequest < POLL_MS - 5000)) return;
    busy = true;
    lastRequest = now;
    try { localStorage.setItem(SYNC_KEY, String(now)); } catch (_) { /* optional */ }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(API, {
        headers: { Accept: "application/vnd.github+json" },
        credentials: "omit", cache: "no-cache", signal: controller.signal,
      });
      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          const reset = Number(response.headers.get("x-ratelimit-reset")) * 1000;
          const retry = Number(response.headers.get("retry-after")) * 1000;
          retryAt = Math.max(now + (retry || POLL_MS), reset || 0);
        }
        throw new Error("board fetch");
      }
      const issues = await response.json();
      if (!Array.isArray(issues)) throw new Error("board format");
      remote = normalize(issues.filter(issue => !issue.pull_request &&
        ((issue.labels || []).some(label => (typeof label === "string" ? label : label.name) === "fanboard") ||
          String(issue.title || "").startsWith("[팬보드]"))).map(issuePost));
      write(CACHE_KEY, remote);
      const pending = confirmPending();
      status = pending.confirmed
        ? "공개 게시 완료를 서버에서 확인했습니다. 다른 사용자의 화면에도 자동 반영됩니다."
        : pending.waiting
          ? "게시 확인 대기 · GitHub에서 ‘Submit new issue’를 완료해야 공개됩니다."
          : "전체 작성자의 공개 글 · 약 3분마다 자동 확인 · 탭으로 돌아오면 다시 확인";
      if (Number(response.headers.get("x-ratelimit-remaining")) === 0 &&
          response.headers.has("x-ratelimit-remaining")) {
        retryAt = Math.max(now + POLL_MS, Number(response.headers.get("x-ratelimit-reset")) * 1000 || 0);
      }
    } catch (_) {
      status = "공개 글 연결 지연 · 마지막 공개 목록을 유지하며 자동 재시도합니다.";
    } finally {
      clearTimeout(timeout);
      busy = false;
      emit();
    }
  }
  function publishUrl(post) {
    const body = `${post.message}\n\n---\nVAMOS LIONS 팬보드에서 보냄\n<!-- vamos-post:${post.id} -->`;
    return `https://github.com/${REPO}/issues/new?labels=fanboard&title=${encodeURIComponent("[팬보드] " + post.name)}&body=${encodeURIComponent(body)}`;
  }
  function publish(name, message, existingId) {
    if (demo) { status = "데모에서는 게시하지 않습니다. 일반 페이지에서 작성해 주세요."; emit(); return false; }
    const post = { id: existingId || `c-${crypto.randomUUID()}`,
      name: name.trim().slice(0, 12), message: message.trim().slice(0, 80) };
    if (!post.name || !post.message) return false;
    const popup = window.open(publishUrl(post), "_blank");
    if (!popup) {
      status = "게시 창이 차단됐습니다. 팝업을 허용한 뒤 다시 눌러 주세요. 아직 공개되지 않았습니다.";
      emit();
      return false;
    }
    try { popup.opener = null; } catch (_) { /* Cross-origin window */ }
    // Pending form metadata is private and never merged into the public list.
    const pending = read(PENDING_KEY, "session").filter(draft => draft.id !== post.id);
    write(PENDING_KEY, [...pending, post], "session");
    status = "아직 게시 전입니다. GitHub 로그인 후 ‘Submit new issue’를 눌러 주세요. 완료되면 자동 확인합니다.";
    emit();
    return true; // Editor opened, NOT a server-save acknowledgement.
  }
  function removeDraft(id) {
    const success = write(LEGACY_KEY, read(LEGACY_KEY).filter(post => post.id !== id));
    emit();
    return success;
  }
  let legacyPanel = null;
  function renderLegacyDrafts() {
    const drafts = legacyDrafts();
    const form = document.getElementById("cheerForm");
    if (!form) return;
    if (!legacyPanel) {
      legacyPanel = document.createElement("details");
      legacyPanel.className = "board-legacy";
      form.append(legacyPanel);
    }
    legacyPanel.hidden = !drafts.length;
    legacyPanel.replaceChildren();
    const summary = document.createElement("summary");
    summary.textContent = `이전 브라우저 보관 글 ${drafts.length}개 (비공개)`;
    legacyPanel.append(summary);
    drafts.forEach(draft => {
      const row = document.createElement("div");
      const text = document.createElement("p");
      text.textContent = `${draft.name}: ${draft.message}`;
      const share = document.createElement("button");
      share.type = "button";
      share.textContent = "이 글을 GitHub에 공개";
      share.addEventListener("click", () => publish(draft.name, draft.message, draft.id));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "브라우저 보관 글 삭제";
      remove.addEventListener("click", () => removeDraft(draft.id));
      row.append(text, share, remove);
      legacyPanel.append(row);
    });
  }
  window.LIONS_BOARD = {
    posts, refresh, publish, publishUrl, legacyDrafts, removeDraft,
    subscribe(listener) {
      listeners.add(listener);
      listener(posts(), status);
      return () => listeners.delete(listener);
    },
  };
  window.addEventListener("storage", event => {
    if (event.key === CACHE_KEY || event.key === null) {
      remote = demo ? demoPosts : normalize(read(CACHE_KEY));
      if (confirmPending().confirmed) status = "공개 게시 완료를 서버에서 확인했습니다.";
    }
    if ([LEGACY_KEY, CACHE_KEY, null].includes(event.key)) emit();
  });
  // Same-browser tabs share a public cache, but independent users fetch the
  // same server query. Focus bypasses the lease (still throttled to 10 seconds).
  window.addEventListener("focus", () => refresh(true));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(true); });
  setInterval(() => { if (!document.hidden) refresh(false); }, POLL_MS);
  renderLegacyDrafts();
  refresh(false);
})();
