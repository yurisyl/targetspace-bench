/* Docs page: fetch sections, render sidebar + a minimal, safe markdown subset. */
(function () {
  var T = window.TS;
  var esc = T.esc;

  function mdInline(s) {
    return s
      .replace(/`([^`]+)`/g, function (_, c) { return '<code>' + c + '</code>'; })
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }
  function md(src) {
    src = String(src || '');
    var parts = src.split('```');
    var html = '';
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        var code = parts[i].replace(/^[a-zA-Z0-9]*\n/, '').replace(/\n$/, '');
        html += '<pre><code>' + esc(code) + '</code></pre>';
        continue;
      }
      var lines = esc(parts[i]).split('\n');
      var inList = false, buf = '', para = [];
      function closeList() { if (inList) { html += '<ul>' + buf + '</ul>'; buf = ''; inList = false; } }
      function flushPara() { if (para.length) { html += '<p>' + mdInline(para.join(' ')) + '</p>'; para = []; } }
      for (var l = 0; l < lines.length; l++) {
        var t = lines[l].trim();
        if (/^###\s+/.test(t)) { closeList(); flushPara(); html += '<h3>' + mdInline(t.replace(/^###\s+/, '')) + '</h3>'; }
        else if (/^##\s+/.test(t)) { closeList(); flushPara(); html += '<h2>' + mdInline(t.replace(/^##\s+/, '')) + '</h2>'; }
        else if (/^-\s+/.test(t)) { flushPara(); inList = true; buf += '<li>' + mdInline(t.replace(/^-\s+/, '')) + '</li>'; }
        else if (t === '') { closeList(); flushPara(); }
        else { closeList(); para.push(t); }
      }
      closeList(); flushPara();
    }
    return html;
  }

  T.get('/api/docs').then(function (d) {
    var items = d.items || [];
    var nav = document.getElementById('doc-nav');
    var content = document.getElementById('doc-content');
    if (!items.length) { content.innerHTML = '<p class="muted">No documentation yet.</p>'; return; }
    nav.innerHTML = items.map(function (s) { return '<a href="#' + esc(s.slug) + '" data-slug="' + esc(s.slug) + '">' + esc(s.title) + '</a>'; }).join('');
    content.innerHTML = items.map(function (s) {
      return '<section class="doc-section" id="' + esc(s.slug) + '">' + md(s.body) + '</section>';
    }).join('');

    // scrollspy
    var links = T.qsa('a', nav);
    function setActive(slug) { links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-slug') === slug); }); }
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
      }, { rootMargin: '-20% 0px -70% 0px' });
      items.forEach(function (s) { var el = document.getElementById(s.slug); if (el) obs.observe(el); });
    }
    if (location.hash) { var el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }
    else setActive(items[0].slug);
  }).catch(function () { document.getElementById('doc-content').innerHTML = '<p class="muted">Documentation unavailable.</p>'; });
})();
