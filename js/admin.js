/* Admin: login page handler + dashboard console (CRUD over the admin API). */
(function () {
  var T = window.TS;

  /* ---------------- login page ---------------- */
  var loginForm = document.getElementById('login-form');
  if (loginForm) {
    var ln = document.getElementById('login-notice');
    var lb = document.getElementById('login-btn');
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      lb.disabled = true; lb.textContent = 'Signing in…';
      T.post('/api/admin/login', {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
      }).then(function () { location.href = '/admin'; })
        .catch(function (err) {
          lb.disabled = false; lb.textContent = 'Sign in';
          ln.className = 'notice show bad'; ln.textContent = err.message || 'Sign-in failed';
        });
    });
    return;
  }

  /* ---------------- dashboard ---------------- */
  var app = document.getElementById('admin-app');
  if (!app) return;
  var gate = document.getElementById('admin-gate');

  T.get('/api/admin/session').then(function (s) {
    if (!s.authenticated) { location.href = '/admin/login'; return; }
    document.getElementById('admin-who').textContent = 'signed in as ' + s.user;
    gate.classList.add('hidden'); app.classList.remove('hidden');
    initDashboard();
  }).catch(function () { location.href = '/admin/login'; });

  document.getElementById('logout-btn').addEventListener('click', function () {
    T.post('/api/admin/logout').then(go).catch(go);
    function go() { location.href = '/admin/login'; }
  });

  var READINESS = ['current', 'pilot', 'active', 'planned', 'research', 'private', 'retired'];
  var SUBTYPE = ['baseline', 'public', 'verified', 'private_eval'];
  var SPLITSTATUS = ['planned', 'pilot', 'active', 'private', 'retired'];
  var VERSTATUS = ['pilot', 'active', 'planned', 'frozen', 'deprecated'];
  var LEVELS = ['info', 'release', 'warn'];
  var SUBSTATUS = ['pending_review', 'approved', 'rejected', 'public', 'verified', 'private_eval'];
  var f = function (key, label, type, opts) { return { key: key, label: label, type: type || 'text', options: opts }; };

  var RES = {
    submissions: {
      label: 'Submissions', api: '/api/admin/submissions', triage: true,
      list: ['id', 'system_name', 'submitter_name', 'submission_type_requested', 'status'],
      fields: [f('status', 'Status', 'select', SUBSTATUS), f('review_notes', 'Review notes', 'textarea')],
    },
    leaderboard: {
      label: 'Leaderboard', api: '/api/admin/leaderboard',
      list: ['id', 'system_name', 'organization', 'submission_type', 'target_adaptation_gain'],
      fields: [
        f('system_name', 'System'), f('organization', 'Organization'), f('track_slug', 'Track slug'),
        f('split_code', 'Split code'), f('version_tag', 'Version'), f('submission_type', 'Type', 'select', SUBTYPE),
        f('is_mock', 'Mock', 'checkbox'), f('is_baseline', 'Baseline', 'checkbox'),
        f('overall_score', 'Overall', 'number'), f('target_adaptation_gain', 'Adapt. gain', 'number'),
        f('temporal_order_sensitivity', 'Temporal-order', 'number'), f('wrong_target_penalty', 'Wrong-target', 'number'),
        f('calibration_error', 'Calib. error', 'number'), f('evidence_attribution', 'Evidence attr.', 'number'),
        f('counterfactual_consistency', 'Counterfac.', 'number'), f('long_horizon_degradation', 'Long-horizon deg.', 'number'),
        f('modality_contribution', 'Modality', 'number'), f('paper_url', 'Paper URL'), f('code_url', 'Code URL'),
        f('report_url', 'Report URL'), f('submitted_at', 'Date'), f('notes', 'Notes', 'textarea'), f('sort_order', 'Sort', 'number'),
      ],
    },
    tracks: {
      label: 'Tracks', api: '/api/admin/tracks',
      list: ['id', 'code', 'name', 'readiness', 'flagship'],
      fields: [
        f('slug', 'Slug'), f('code', 'Code'), f('name', 'Name'), f('flagship', 'Flagship', 'checkbox'),
        f('readiness', 'Readiness', 'select', READINESS), f('tagline', 'Tagline'), f('target_object', 'Target object'),
        f('evidence_bands', 'Evidence bands'), f('horizon', 'Horizon'), f('example_states', 'Example states'),
        f('validator', 'Validator'), f('description', 'Description', 'textarea'), f('sort_order', 'Sort', 'number'),
      ],
    },
    splits: {
      label: 'Splits', api: '/api/admin/splits',
      list: ['id', 'code', 'name', 'track_slug', 'status'],
      fields: [
        f('code', 'Code'), f('name', 'Name'), f('track_slug', 'Track slug'), f('status', 'Status', 'select', SPLITSTATUS),
        f('description', 'Description', 'textarea'), f('input_format', 'Input format', 'textarea'),
        f('output_format', 'Output format', 'textarea'), f('metrics', 'Metrics'), f('baselines', 'Baselines'),
        f('example_task', 'Example task', 'textarea'), f('requirements', 'Requirements', 'textarea'), f('sort_order', 'Sort', 'number'),
      ],
    },
    faq: {
      label: 'FAQ', api: '/api/admin/faq',
      list: ['id', 'question', 'category', 'published'],
      fields: [f('question', 'Question'), f('answer', 'Answer', 'textarea'), f('category', 'Category'), f('published', 'Published', 'checkbox'), f('sort_order', 'Sort', 'number')],
    },
    docs: {
      label: 'Docs', api: '/api/admin/docs',
      list: ['id', 'slug', 'title', 'category', 'published'],
      fields: [f('slug', 'Slug'), f('title', 'Title'), f('category', 'Category'), f('body', 'Body (markdown)', 'textarea'), f('published', 'Published', 'checkbox'), f('sort_order', 'Sort', 'number')],
    },
    announcements: {
      label: 'Announcements', api: '/api/admin/announcements',
      list: ['id', 'title', 'level', 'pinned', 'published'],
      fields: [f('title', 'Title'), f('body', 'Body', 'textarea'), f('level', 'Level', 'select', LEVELS), f('published', 'Published', 'checkbox'), f('pinned', 'Pinned', 'checkbox')],
    },
    versions: {
      label: 'Versions', api: '/api/admin/versions',
      list: ['id', 'tag', 'name', 'status', 'is_current'],
      fields: [f('tag', 'Tag'), f('name', 'Name'), f('status', 'Status', 'select', VERSTATUS), f('is_current', 'Current', 'checkbox'), f('released_at', 'Released at'), f('notes', 'Notes', 'textarea'), f('sort_order', 'Sort', 'number')],
    },
  };
  var ORDER = ['submissions', 'leaderboard', 'tracks', 'splits', 'faq', 'docs', 'announcements', 'versions'];
  var BOOLS = { flagship: 1, published: 1, pinned: 1, is_current: 1, is_mock: 1, is_baseline: 1 };
  var BADGES = { status: 1, submission_type: 1, submission_type_requested: 1, readiness: 1, level: 1 };

  function initDashboard() {
    var tabs = document.getElementById('admin-tabs');
    var panes = document.getElementById('admin-panes');
    tabs.innerHTML = ORDER.map(function (k, i) { return '<button class="tab' + (i === 0 ? ' active' : '') + '" data-res="' + k + '">' + RES[k].label + '</button>'; }).join('');
    panes.innerHTML = ORDER.map(function (k, i) { return '<div class="tabpane' + (i === 0 ? ' active' : '') + '" id="pane-' + k + '"></div>'; }).join('');
    T.qsa('.tab', tabs).forEach(function (btn) {
      btn.addEventListener('click', function () {
        T.qsa('.tab', tabs).forEach(function (b) { b.classList.remove('active'); });
        T.qsa('.tabpane', panes).forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        var k = btn.getAttribute('data-res');
        document.getElementById('pane-' + k).classList.add('active');
        loadRes(k);
      });
    });
    loadRes(ORDER[0]);
  }

  function loadRes(k) {
    var res = RES[k], pane = document.getElementById('pane-' + k);
    pane.innerHTML = '<p class="muted">Loading…</p>';
    T.get(res.api).then(function (d) { renderPane(k, res, pane, d.items || []); })
      .catch(function (e) { pane.innerHTML = '<p class="muted">Failed to load: ' + T.esc(e.message) + '</p>'; });
  }

  function cell(v) {
    if (v == null || v === '') return '<span class="faint">—</span>';
    v = String(v); if (v.length > 46) v = v.slice(0, 46) + '…';
    return T.esc(v);
  }

  function renderPane(k, res, pane, items) {
    var head = res.list.map(function (c) { return '<th>' + T.esc(c) + '</th>'; }).join('') + '<th></th>';
    var rows = items.map(function (it) {
      var tds = res.list.map(function (c) {
        var v = it[c];
        if (BADGES[c]) return '<td>' + (v ? T.badge(v) : '<span class="faint">—</span>') + '</td>';
        if (BOOLS[c]) return '<td>' + (v ? '✓' : '·') + '</td>';
        if (c === 'id') return '<td class="rank">' + v + '</td>';
        return '<td>' + cell(v) + '</td>';
      }).join('');
      return '<tr data-id="' + it.id + '">' + tds + '<td class="row-actions">'
        + '<button class="iconbtn" data-act="edit" data-id="' + it.id + '">Edit</button>'
        + '<button class="iconbtn danger" data-act="del" data-id="' + it.id + '">Delete</button>'
        + '</td></tr>';
    }).join('');
    var addBtn = res.triage ? '' : '<button class="btn btn--ghost btn--sm" data-act="add">+ New</button>';
    var pendingNote = '';
    if (res.triage) {
      var nPending = items.filter(function (x) { return x.status === 'pending_review'; }).length;
      pendingNote = nPending
        ? ' <span class="tag is-orange"><span class="dot"></span>' + nPending + ' pending review</span>'
        : ' <span class="tag is-teal"><span class="dot"></span>none pending</span>';
    }
    pane.innerHTML = '<div class="spread" style="margin-bottom:12px"><strong>' + T.esc(res.label)
      + ' <span class="faint">(' + items.length + ')</span>' + pendingNote + '</strong>' + addBtn + '</div>'
      + '<div class="table-wrap"><table class="dtable"><thead><tr>' + head + '</tr></thead><tbody>'
      + (rows || '<tr><td colspan="' + (res.list.length + 1) + '" class="muted">None yet.</td></tr>')
      + '</tbody></table></div><div class="editor-host" id="editor-' + k + '"></div>';

    var addEl = pane.querySelector('[data-act="add"]');
    if (addEl) addEl.addEventListener('click', function () { openEditor(k, res, null); });
    T.qsa('[data-act="edit"]', pane).forEach(function (b) {
      b.addEventListener('click', function () {
        var it = items.filter(function (x) { return String(x.id) === b.getAttribute('data-id'); })[0];
        openEditor(k, res, it);
      });
    });
    T.qsa('[data-act="del"]', pane).forEach(function (b) {
      b.addEventListener('click', function () {
        if (confirm('Delete ' + res.label + ' #' + b.getAttribute('data-id') + '?')) doDelete(k, res, b.getAttribute('data-id'));
      });
    });
  }

  function inputFor(fld, val) {
    var dk = 'data-key="' + fld.key + '"';
    if (fld.type === 'textarea') return '<textarea ' + dk + '>' + T.esc(val == null ? '' : val) + '</textarea>';
    if (fld.type === 'checkbox') return '<label class="check" style="margin:0"><input type="checkbox" ' + dk + (val ? ' checked' : '') + '> <span>' + T.esc(fld.label) + '</span></label>';
    if (fld.type === 'select') {
      var o = (fld.options || []).map(function (x) { return '<option value="' + T.esc(x) + '"' + (String(val) === String(x) ? ' selected' : '') + '>' + T.esc(x) + '</option>'; }).join('');
      return '<select ' + dk + '><option value="">—</option>' + o + '</select>';
    }
    var t = fld.type === 'number' ? 'number' : 'text';
    return '<input type="' + t + '" ' + (t === 'number' ? 'step="any" ' : '') + dk + ' value="' + T.esc(val == null ? '' : val) + '">';
  }

  function openEditor(k, res, it) {
    var host = document.getElementById('editor-' + k);
    var isNew = !it;
    var fieldsHtml = res.fields.map(function (fld) {
      var val = it ? it[fld.key] : (fld.type === 'number' ? '' : '');
      if (fld.type === 'checkbox') return '<div class="field">' + inputFor(fld, val) + '</div>';
      return '<div class="field"><label>' + T.esc(fld.label) + '</label>' + inputFor(fld, val) + '</div>';
    }).join('');

    var details = '';
    if (res.triage && it) {
      details = '<div class="card small" style="margin-bottom:10px">'
        + ['submitter_name', 'email', 'organization', 'system_name', 'track_slug', 'split_code', 'version_tag',
           'submission_type_requested', 'paper_url', 'code_url', 'report_url', 'results_url', 'method_summary', 'compute_notes', 'created_at']
          .map(function (c) { return it[c] ? '<div><span class="faint mono tiny">' + c + '</span> ' + T.esc(it[c]) + '</div>' : ''; }).join('')
        + '</div>';
    }
    var triageBtns = (res.triage && it)
      ? '<button class="iconbtn" data-act="approve" type="button">Approve &rarr; public</button>'
        + '<button class="iconbtn" data-act="verify" type="button">Verified</button>'
        + '<button class="iconbtn danger" data-act="reject" type="button">Reject</button>'
      : '';

    host.innerHTML = '<div class="editor"><div class="spread"><strong>' + (isNew ? 'New ' : 'Edit #' + it.id + ' ') + T.esc(res.label)
      + '</strong><button class="iconbtn" data-act="close" type="button">Close</button></div>'
      + details + '<div class="stack-gap">' + fieldsHtml + '</div>'
      + '<div class="rowbtns"><button class="btn btn--primary btn--sm" data-act="save" type="button">Save</button>' + triageBtns + '</div>'
      + '<div class="notice" data-notice></div></div>';
    host.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    host.querySelector('[data-act="close"]').addEventListener('click', function () { host.innerHTML = ''; });
    host.querySelector('[data-act="save"]').addEventListener('click', function () { saveEditor(k, res, it, host); });
    var bind = function (sel, status) { var b = host.querySelector(sel); if (b) b.addEventListener('click', function () { quickStatus(k, res, it.id, status, host); }); };
    bind('[data-act="approve"]', 'public');
    bind('[data-act="verify"]', 'verified');
    bind('[data-act="reject"]', 'rejected');
  }

  function collect(res, host) {
    var body = {};
    res.fields.forEach(function (fld) {
      var el = host.querySelector('[data-key="' + fld.key + '"]');
      if (!el) return;
      if (fld.type === 'checkbox') body[fld.key] = el.checked ? 1 : 0;
      else if (fld.type === 'number') { var v = el.value.trim(); body[fld.key] = v === '' ? null : Number(v); }
      else { var s = el.value.trim(); body[fld.key] = s === '' ? null : s; }
    });
    return body;
  }
  function noticeIn(host, kind, msg) { var n = host.querySelector('[data-notice]'); if (n) { n.className = 'notice show ' + kind; n.textContent = msg; } }

  function saveEditor(k, res, it, host) {
    var body = collect(res, host);
    var p = it ? T.patch(res.api + '/' + it.id, body) : T.post(res.api, body);
    p.then(function () { host.innerHTML = ''; loadRes(k); })
      .catch(function (e) { noticeIn(host, 'bad', e.message || 'Save failed'); });
  }
  function quickStatus(k, res, id, status, host) {
    T.patch(res.api + '/' + id, { status: status }).then(function () { if (host) host.innerHTML = ''; loadRes(k); })
      .catch(function (e) { noticeIn(host, 'bad', e.message || 'Update failed'); });
  }
  function doDelete(k, res, id) {
    T.del(res.api + '/' + id).then(function () { loadRes(k); }).catch(function (e) { alert(e.message || 'Delete failed'); });
  }
})();
