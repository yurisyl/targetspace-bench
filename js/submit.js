/* Submit page: populate selects, validate, POST /api/submissions, confirm. */
(function () {
  var T = window.TS;
  var form = document.getElementById('submit-form');
  var notice = document.getElementById('form-notice');
  var btn = document.getElementById('submit-btn');

  function fill(id, items, mk) {
    var sel = document.getElementById(id);
    sel.innerHTML = '<option value="">Select…</option>' + items.map(mk).join('');
  }
  T.get('/api/tracks').then(function (d) { fill('track_slug', d.items || [], function (t) { return '<option value="' + T.esc(t.slug) + '">' + T.esc(t.code + ' — ' + t.name) + '</option>'; }); }).catch(function () {});
  T.get('/api/splits').then(function (d) { fill('split_code', d.items || [], function (s) { return '<option value="' + T.esc(s.code) + '">' + T.esc(s.code) + '</option>'; }); }).catch(function () {});
  T.get('/api/versions').then(function (d) {
    var items = d.items || [];
    fill('version_tag', items, function (v) { return '<option value="' + T.esc(v.tag) + '"' + (v.is_current ? ' selected' : '') + '>' + T.esc(v.tag) + '</option>'; });
  }).catch(function () {});

  function setErr(id, on) {
    var f = document.getElementById(id); if (!f) return;
    var field = f.closest('.field') || f.closest('.check');
    if (field) field.classList.toggle('invalid', !!on);
  }
  function show(kind, msg) {
    notice.className = 'notice show ' + kind;
    notice.innerHTML = msg;
    notice.scrollIntoView({ block: 'nearest' });
  }
  function validUrl(v) { if (!v) return true; try { var u = new URL(v); return u.protocol === 'http:' || u.protocol === 'https:'; } catch (e) { return false; } }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = {};
    ['submitter_name', 'email', 'organization', 'system_name', 'track_slug', 'split_code', 'version_tag',
      'submission_type_requested', 'paper_url', 'code_url', 'report_url', 'results_url', 'method_summary', 'compute_notes']
      .forEach(function (k) { f[k] = (document.getElementById(k).value || '').trim(); });
    f.no_leakage = document.getElementById('no_leakage').checked;
    f.repro_agreement = document.getElementById('repro_agreement').checked;

    var bad = false;
    function need(id, cond) { setErr(id, !cond); if (!cond) bad = true; }
    need('submitter_name', f.submitter_name.length > 0);
    need('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email));
    need('system_name', f.system_name.length > 0);
    ['paper_url', 'code_url', 'report_url', 'results_url'].forEach(function (k) { need(k, validUrl(f[k])); });
    need('no_leakage', f.no_leakage);
    need('repro_agreement', f.repro_agreement);
    if (bad) { show('bad', 'Please fix the highlighted fields and try again.'); return; }

    btn.disabled = true; btn.textContent = 'Submitting…';
    T.post('/api/submissions', f).then(function (res) {
      form.classList.add('hidden');
      show('ok', '<strong>Submission received.</strong> Reference <span class="mono">#' + res.id + '</span>. Status: <span class="tag is-gray"><span class="dot"></span>pending review</span>. We will review it before it appears on the leaderboard. Thank you.');
      notice.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }).catch(function (e) {
      btn.disabled = false; btn.textContent = 'Submit for review';
      if (e.data && e.data.field) setErr(e.data.field, true);
      show('bad', T.esc(e.message || 'Submission failed. Please try again.'));
    });
  });
})();
