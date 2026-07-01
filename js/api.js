/* TargetSpace portal client helpers (global, no modules). */
window.TS = (function () {
  async function req(method, url, body) {
    const opts = { method, headers: {}, credentials: 'same-origin' };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    let data = null;
    try { data = await res.json(); } catch (_) { /* non-json */ }
    if (!res.ok) {
      const err = new Error((data && data.error) || ('HTTP ' + res.status));
      err.status = res.status; err.data = data;
      throw err;
    }
    return data;
  }
  const get = (u) => req('GET', u);
  const post = (u, b) => req('POST', u, b);
  const patch = (u, b) => req('PATCH', u, b);
  const del = (u) => req('DELETE', u);

  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  const COLOR = {
    current: 'is-teal', active: 'is-green', pilot: 'is-blue', planned: 'is-orange',
    research: 'is-violet', private: 'is-pink', retired: 'is-gray', frozen: 'is-gray', deprecated: 'is-gray',
    public: 'is-blue', verified: 'is-teal', private_eval: 'is-violet', baseline: 'is-gray',
    mock: 'is-orange', info: 'is-blue', release: 'is-teal', warn: 'is-orange',
  };
  const tagClass = (v) => COLOR[String(v || '').toLowerCase()] || 'is-gray';
  const labelize = (v) => String(v == null ? '' : v).replace(/_/g, ' ');
  const badge = (v, label) =>
    '<span class="tag ' + tagClass(v) + '"><span class="dot"></span>' + esc(label || labelize(v)) + '</span>';

  const param = (name) => new URLSearchParams(location.search).get(name);
  function fmt(n, d) {
    if (n == null || n === '') return '—';
    const x = Number(n);
    if (!isFinite(x)) return '—';
    return x.toFixed(d == null ? 2 : d);
  }

  return { get, post, patch, del, esc, qs, qsa, badge, tagClass, labelize, param, fmt };
})();
