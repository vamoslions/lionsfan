(function () {
  "use strict";
  const KEY = "vamos-lions-live-data-v1";
  let cached = {};
  try { cached = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (_) { /* optional */ }
  const state = { news: cached.news || null, fa: cached.fa || null, status: {}, offline: false };
  window.LIONS_LIVE = state;
  function valid(kind, value) {
    if (!value || !Number.isFinite(Date.parse(value.lastSuccessAt))) return false;
    if (kind === "news") return Array.isArray(value.items) && value.items.every(item =>
      typeof item.title === "string" && typeof item.source === "string" &&
      /^https?:\/\//.test(item.href) && Number.isFinite(Date.parse(item.publishedAt)));
    return Number.isInteger(value.season) && Array.isArray(value.players) && value.players.every(player =>
      typeof player.name === "string" && typeof player.status === "string" &&
      /^https:\/\/www\.(koreabaseball|samsunglions)\.com\//.test(player.sourceUrl));
  }
  ["news", "fa"].forEach(kind => { if (!valid(kind, state[kind])) state[kind] = null; });
  async function refresh() {
    const results = await Promise.allSettled(["news", "fa", "status"].map(async kind => {
      const response = await fetch(`data/${kind}.json`, { cache: "no-cache" });
      if (!response.ok) throw new Error(kind);
      const value = await response.json();
      if (kind !== "status" && !valid(kind, value)) throw new Error("invalid data");
      return { kind, value };
    }));
    state.offline = results.some(result => result.status === "rejected");
    results.forEach(result => {
      if (result.status !== "fulfilled") return;
      const { kind, value } = result.value;
      if (kind === "status" || !state[kind] ||
          Date.parse(value.lastSuccessAt) >= Date.parse(state[kind].lastSuccessAt)) state[kind] = value;
    });
    try { localStorage.setItem(KEY, JSON.stringify({ news: state.news, fa: state.fa })); } catch (_) { /* optional */ }
    window.dispatchEvent(new CustomEvent("lions:data-updated"));
  }
  window.LIONS_LIVE_REFRESH = refresh;
  refresh();
  setInterval(() => { if (!document.hidden) refresh(); }, 300000);
})();
