/* Shared header, footer, and announcement banner for every page. Global script. */
(function () {
  var NAV = [
    ['/', 'Overview'], ['/industry', 'Industry'], ['/protocol', 'Protocol'],
    ['/hardware', 'Hardware'], ['/research', 'Research'],
    ['/product-quickstart', 'Run TargetSpace'], ['/paper', 'Paper'],
    ['/governance', 'Governance'], ['/leaderboard', 'Status'], ['/faq', 'FAQ'],
    ['https://github.com/yurisyl/targetspace-bench', 'GitHub'],
  ];
  var REPO = 'https://github.com/yurisyl/targetspace-bench';

  function path() {
    var p = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (p.length > 1 && p.charAt(p.length - 1) === '/') p = p.slice(0, -1);
    return p || '/';
  }
  function isActive(href) {
    var p = path();
    if (href === '/') return p === '/';
    if (href === '/admin') return p.indexOf('/admin') === 0;
    return p === href || p.indexOf(href + '/') === 0;
  }
  function navHtml() {
    var links = NAV.map(function (it) {
      if (it[0].indexOf('http') === 0) return '<a href="' + it[0] + '" rel="noopener" target="_blank">' + it[1] + '</a>';
      var act = isActive(it[0]);
      return '<a class="' + (act ? 'active' : '') + '" href="' + it[0] + '">' + it[1] + '</a>';
    }).join('');
    return '<nav class="nav"><div class="nav__in">'
      + '<a class="brand" href="/"><span class="dot"></span>TargetSpace<small>v1.0</small></a>'
      + '<button class="nav__burger" id="ts-burger" aria-label="Toggle menu">&#9776;</button>'
      + '<div class="nav__links" id="ts-navlinks">' + links + '</div></div></nav>';
  }
  function footHtml() {
    return '<footer class="footer"><div class="container"><div class="footer__grid">'
      + '<div><a class="brand" href="/" style="margin-bottom:12px"><span class="dot"></span>TargetSpace<small>v1.0</small></a>'
      + '<p class="muted small" style="max-width:38ch;margin:0">A pre-pilot benchmark protocol for target-specific forecasting under partial observation. Version 1.0 &mdash; protocol and synthetic harness available; pilot validation pending.</p></div>'
      + '<div><h4>Protocol</h4><a href="/protocol">Protocol</a><a href="/run-harness">Run the harness</a><a href="/schemas">Schemas</a><a href="/product-quickstart">Run TargetSpace</a></div>'
      + '<div><h4>Participate</h4><a href="/leaderboard">Status &amp; leaderboard</a><a href="/submit">Prepare a record</a><a href="/governance">Governance</a><a href="/faq">FAQ</a></div>'
      + '<div><h4>Framework</h4><a href="/industry">Industry map</a><a href="/hardware">Hardware</a><a href="/research">Research agenda</a><a href="/benchmark">Benchmark</a><a href="/tracks">Tracks</a></div>'
      + '<div><h4>Project</h4><a href="/paper">Paper v1.0</a><a href="/baselines">Baselines</a><a href="/docs">Docs</a><a href="' + REPO + '" rel="noopener">GitHub</a><a href="/admin">Admin</a></div>'
      + '</div><div class="footer__bottom"><span>&copy; 2026 Yuri Andrade Sylvester &middot; TargetSpace v1.0</span>'
      + '<span class="mono">The target is not a profile; it is an observed trajectory in motion.</span></div></div></footer>';
  }
  function mountBanner() {
    var host = document.getElementById('ts-banner');
    if (!host || !window.TS) return;
    TS.get('/api/announcements').then(function (d) {
      var items = (d && d.items) || [];
      var a = items.filter(function (x) { return x.pinned; })[0] || items[0];
      if (!a) return;
      host.innerHTML = '<div class="banner"><div class="banner__in"><b>'
        + TS.esc(a.level === 'release' ? 'Pilot' : 'Notice') + '</b> '
        + TS.esc(a.title) + '<a href="/faq">Learn more &rarr;</a></div></div>';
    }).catch(function () { /* banner is best-effort */ });
  }
  function mount() {
    var h = document.getElementById('site-header'); if (h) h.innerHTML = navHtml();
    var f = document.getElementById('site-footer'); if (f) f.innerHTML = footHtml();
    var burger = document.getElementById('ts-burger');
    var links = document.getElementById('ts-navlinks');
    if (burger && links) burger.addEventListener('click', function () { links.classList.toggle('open'); });
    mountBanner();
  }
  if (document.readyState !== 'loading') mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
