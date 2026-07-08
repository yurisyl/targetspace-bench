/* Home page hydration: track explorer, leaderboard preview, FAQ preview. */
(function () {
  var T = window.TS;

  function trackCard(t) {
    var rows = [
      ['Target', t.target_object], ['Evidence', t.evidence_bands], ['Horizon', t.horizon],
      ['States', t.example_states], ['Validator', t.validator],
    ].map(function (r) { return '<dt>' + T.esc(r[0]) + '</dt><dd>' + T.esc(r[1] || '—') + '</dd>'; }).join('');
    return '<div class="trackcard' + (t.flagship ? ' flagship' : '') + '">'
      + '<div class="trackcard__top"><span class="trackcard__code">' + T.esc(t.code) + '</span>'
      + T.badge(t.readiness) + (t.flagship ? '<span class="tag is-teal">flagship</span>' : '') + '</div>'
      + '<h3>' + T.esc(t.name) + '</h3>'
      + '<p class="tagline">' + T.esc(t.tagline || '') + '</p>'
      + '<dl>' + rows + '</dl>'
      + '<div class="foot"><a class="btn btn--ghost btn--sm" href="/tracks#' + T.esc(t.slug) + '">View track &rarr;</a></div>'
      + '</div>';
  }

  T.get('/api/tracks').then(function (d) {
    var host = document.getElementById('track-explorer'); if (!host) return;
    host.innerHTML = (d.items || []).map(trackCard).join('') || '<p class="muted">No tracks.</p>';
  }).catch(function () { var h = document.getElementById('track-explorer'); if (h) h.innerHTML = '<p class="muted">Tracks unavailable.</p>'; });

  T.get('/api/leaderboard?split=TS-Long').then(function (d) {
    var host = document.getElementById('lb-preview'); if (!host) return;
    var rows = (d.items || []).slice(0, 7);
    if (!rows.length) { host.innerHTML = '<p class="muted">No entries yet.</p>'; return; }
    var body = rows.map(function (e, i) {
      return '<tr' + (/targetspace/i.test(e.system_name) ? ' class="row-ts"' : '') + '>'
        + '<td class="rank">' + (i + 1) + '</td>'
        + '<td class="sys">' + T.esc(e.system_name) + '<span class="sub">' + T.esc(e.organization || '') + '</span></td>'
        + '<td class="num good">' + T.fmt(e.target_adaptation_gain) + '</td>'
        + '<td class="num">' + T.fmt(e.calibration_error) + '</td>'
        + '<td>' + T.badge(e.is_mock ? 'mock' : e.submission_type, e.is_mock ? 'mock' : null) + '</td></tr>';
    }).join('');
    host.innerHTML = '<div class="table-wrap"><table class="dtable"><thead><tr>'
      + '<th>#</th><th>System</th><th class="right">Adapt. gain (bits)</th><th class="right">Calib. err</th><th>Type</th>'
      + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }).catch(function () { var h = document.getElementById('lb-preview'); if (h) h.innerHTML = '<p class="muted">Leaderboard unavailable.</p>'; });

  T.get('/api/faq').then(function (d) {
    var host = document.getElementById('faq-preview'); if (!host) return;
    host.innerHTML = (d.items || []).slice(0, 4).map(function (f) {
      return '<details class="card" style="margin-bottom:10px"><summary style="cursor:pointer;font-weight:640;color:var(--text)">'
        + T.esc(f.question) + '</summary><p class="muted" style="margin:10px 0 0">' + T.esc(f.answer) + '</p></details>';
    }).join('') || '<p class="muted">No FAQ.</p>';
  }).catch(function () { });
})();
