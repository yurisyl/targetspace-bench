/* Leaderboard page: populate filters, fetch + render the data-backed table. */
(function () {
  var T = window.TS;
  var els = {
    track: document.getElementById('f-track'),
    split: document.getElementById('f-split'),
    type: document.getElementById('f-type'),
    version: document.getElementById('f-version'),
    org: document.getElementById('f-org'),
    reset: document.getElementById('f-reset'),
    table: document.getElementById('lb-table'),
  };

  function opt(v, label) { return '<option value="' + T.esc(v) + '">' + T.esc(label) + '</option>'; }

  // populate filter dropdowns
  T.get('/api/tracks').then(function (d) {
    els.track.innerHTML = '<option value="">All tracks</option>' + (d.items || []).map(function (t) { return opt(t.slug, t.code + ' — ' + t.name); }).join('');
  }).catch(function () {});
  T.get('/api/splits').then(function (d) {
    els.split.innerHTML = '<option value="">All splits</option>' + (d.items || []).map(function (s) { return opt(s.code, s.code); }).join('');
  }).catch(function () {});
  T.get('/api/versions').then(function (d) {
    els.version.innerHTML = '<option value="">All versions</option>' + (d.items || []).map(function (v) { return opt(v.tag, v.tag); }).join('');
  }).catch(function () {});

  function links(e) {
    var out = [];
    if (e.paper_url) out.push('<a href="' + T.esc(e.paper_url) + '" rel="noopener">paper</a>');
    if (e.code_url) out.push('<a href="' + T.esc(e.code_url) + '" rel="noopener">code</a>');
    if (e.report_url) out.push('<a href="' + T.esc(e.report_url) + '" rel="noopener">report</a>');
    return out.length ? out.join(' · ') : '<span class="faint">—</span>';
  }
  function date(s) { return s ? T.esc(String(s).slice(0, 10)) : '—'; }

  function render(items) {
    if (!items.length) { els.table.innerHTML = '<p class="muted">No entries match these filters.</p>'; return; }
    var body = items.map(function (e, i) {
      var ts = /targetspace/i.test(e.system_name);
      return '<tr' + (ts ? ' class="row-ts"' : '') + '>'
        + '<td class="rank">' + (i + 1) + '</td>'
        + '<td class="sys">' + T.esc(e.system_name)
        + (e.is_mock ? ' <span class="mockflag">mock</span>' : '')
        + '<span class="sub">' + T.esc(e.organization || '') + '</span></td>'
        + '<td>' + T.esc(e.track_slug || '—') + '</td>'
        + '<td>' + T.esc(e.split_code || '—') + '</td>'
        + '<td><span class="vtag">' + T.esc(e.version_tag || '—') + '</span></td>'
        + '<td class="num">' + T.fmt(e.overall_score) + '</td>'
        + '<td class="num good">' + T.fmt(e.target_adaptation_gain) + '</td>'
        + '<td class="num">' + T.fmt(e.calibration_error) + '</td>'
        + '<td class="num">' + T.fmt(e.evidence_attribution) + '</td>'
        + '<td class="num">' + T.fmt(e.counterfactual_consistency) + '</td>'
        + '<td>' + T.badge(e.submission_type) + '</td>'
        + '<td class="small">' + date(e.submitted_at) + '</td>'
        + '<td class="small">' + links(e) + '</td>'
        + '</tr>';
    }).join('');
    els.table.innerHTML = '<div class="table-wrap"><table class="dtable" style="min-width:1100px"><thead><tr>'
      + '<th>#</th><th>System</th><th>Track</th><th>Split</th><th>Version</th>'
      + '<th class="right">Overall</th><th class="right">Adapt. gain</th><th class="right">Calib. err</th>'
      + '<th class="right">Evidence</th><th class="right">Counterfac.</th><th>Type</th><th>Date</th><th>Links</th>'
      + '</tr></thead><tbody>' + body + '</tbody></table></div>'
      + '<p class="faint tiny" style="margin-top:10px">' + items.length + ' entr' + (items.length === 1 ? 'y' : 'ies') + '. Adapt. gain in bits over R2; calibration error and long-horizon degradation are lower-is-better.</p>';
  }

  function load() {
    var q = [];
    if (els.track.value) q.push('track=' + encodeURIComponent(els.track.value));
    if (els.split.value) q.push('split=' + encodeURIComponent(els.split.value));
    if (els.type.value) q.push('type=' + encodeURIComponent(els.type.value));
    if (els.version.value) q.push('version=' + encodeURIComponent(els.version.value));
    var url = '/api/leaderboard' + (q.length ? '?' + q.join('&') : '');
    els.table.innerHTML = '<p class="muted">Loading…</p>';
    T.get(url).then(function (d) {
      var items = d.items || [];
      var org = els.org.value.trim().toLowerCase();
      if (org) items = items.filter(function (e) { return (e.organization || '').toLowerCase().indexOf(org) >= 0; });
      render(items);
    }).catch(function () { els.table.innerHTML = '<p class="muted">Leaderboard unavailable.</p>'; });
  }

  ['track', 'split', 'type', 'version'].forEach(function (k) { els[k].addEventListener('change', load); });
  els.org.addEventListener('input', function () { clearTimeout(els.org._t); els.org._t = setTimeout(load, 200); });
  els.reset.addEventListener('click', function () {
    els.track.value = ''; els.split.value = ''; els.type.value = ''; els.version.value = ''; els.org.value = ''; load();
  });

  // preselect from ?track= etc.
  ['track', 'split', 'type', 'version'].forEach(function (k) { var v = T.param(k); if (v) els[k].value = v; });
  load();
})();
