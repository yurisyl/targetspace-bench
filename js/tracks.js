/* Tracks page: render domain tracks and evaluation splits from the API. */
(function () {
  var T = window.TS;

  function trackCard(t) {
    var rows = [
      ['Target object', t.target_object], ['Evidence bands', t.evidence_bands],
      ['Forecast horizon', t.horizon], ['Example states', t.example_states],
      ['Validator / outcome', t.validator],
    ].map(function (r) { return '<dt>' + T.esc(r[0]) + '</dt><dd>' + T.esc(r[1] || '—') + '</dd>'; }).join('');
    return '<div class="trackcard' + (t.flagship ? ' flagship' : '') + '" id="' + T.esc(t.slug) + '">'
      + '<div class="trackcard__top"><span class="trackcard__code">' + T.esc(t.code) + '</span>'
      + T.badge(t.readiness) + (t.flagship ? '<span class="tag is-teal">flagship</span>' : '') + '</div>'
      + '<h3>' + T.esc(t.name) + '</h3>'
      + '<p class="tagline">' + T.esc(t.tagline || '') + '</p>'
      + (t.description ? '<p class="muted small">' + T.esc(t.description) + '</p>' : '')
      + '<dl>' + rows + '</dl></div>';
  }

  function splitCard(s) {
    var rows = [
      ['Description', s.description], ['Input', s.input_format], ['Output', s.output_format],
      ['Metrics', prettyList(s.metrics)], ['Baselines', s.baselines],
      ['Example task', s.example_task], ['Submission requirements', s.requirements],
    ].map(function (r) {
      if (!r[1]) return '';
      return '<dt>' + T.esc(r[0]) + '</dt><dd>' + T.esc(r[1]) + '</dd>';
    }).join('');
    return '<div class="trackcard" id="' + T.esc(s.code.toLowerCase()) + '">'
      + '<div class="trackcard__top"><span class="trackcard__code">' + T.esc(s.code) + '</span>'
      + T.badge(s.status) + '<span class="tag is-gray">' + T.esc(s.track_slug) + '</span></div>'
      + '<h3>' + T.esc(s.name) + '</h3>'
      + '<dl>' + rows + '</dl></div>';
  }
  function prettyList(v) { return v ? String(v).replace(/_/g, ' ') : v; }

  T.get('/api/tracks').then(function (d) {
    var host = document.getElementById('domain-tracks');
    host.innerHTML = (d.items || []).map(trackCard).join('') || '<p class="muted">No tracks.</p>';
    jump();
  }).catch(function () { document.getElementById('domain-tracks').innerHTML = '<p class="muted">Tracks unavailable.</p>'; });

  T.get('/api/splits').then(function (d) {
    var host = document.getElementById('split-list');
    host.innerHTML = '<div class="trackgrid">' + ((d.items || []).map(splitCard).join('') || '<p class="muted">No splits.</p>') + '</div>';
    jump();
  }).catch(function () { document.getElementById('split-list').innerHTML = '<p class="muted">Splits unavailable.</p>'; });

  function jump() {
    if (!location.hash) return;
    var el = document.getElementById(location.hash.slice(1));
    if (el) el.scrollIntoView();
  }
})();
