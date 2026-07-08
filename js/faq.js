/* FAQ page: fetch + render grouped accordions. */
(function () {
  var T = window.TS;
  var LABEL = {
    positioning: 'Positioning', scope: 'Scope', privacy: 'Privacy & data', protocol: 'Protocol',
    submissions: 'Submissions', metrics: 'Scoring', participation: 'Participation', general: 'General',
  };
  T.get('/api/faq').then(function (d) {
    var host = document.getElementById('faq-list');
    var items = d.items || [];
    if (!items.length) { host.innerHTML = '<p class="muted">No questions yet.</p>'; return; }
    var groups = {};
    items.forEach(function (f) { (groups[f.category] = groups[f.category] || []).push(f); });
    host.innerHTML = Object.keys(groups).map(function (cat) {
      var qs = groups[cat].map(function (f) {
        return '<details class="card" style="margin-bottom:10px"><summary style="cursor:pointer;font-weight:640;color:var(--text)">'
          + T.esc(f.question) + '</summary><p class="muted" style="margin:10px 0 0">' + T.esc(f.answer) + '</p></details>';
      }).join('');
      return '<h2 style="margin:26px 0 12px;font-size:1.2rem">' + T.esc(LABEL[cat] || cat) + '</h2>' + qs;
    }).join('');
  }).catch(function () { document.getElementById('faq-list').innerHTML = '<p class="muted">FAQ unavailable.</p>'; });
})();
