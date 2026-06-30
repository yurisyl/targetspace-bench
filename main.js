// TargetSpace-Bench — minimal vanilla interactions (no dependencies).
(function () {
  // mobile nav
  var burger = document.getElementById('burger');
  var links = document.getElementById('navlinks');
  if (burger && links) {
    burger.addEventListener('click', function () { links.classList.toggle('open'); });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') links.classList.remove('open');
    });
  }

  // copy BibTeX
  var btn = document.getElementById('copyBib');
  var bib = document.getElementById('bib');
  if (btn && bib) {
    btn.addEventListener('click', function () {
      var text = bib.innerText;
      navigator.clipboard.writeText(text).then(function () {
        var prev = btn.textContent; btn.textContent = 'Copied ✓';
        setTimeout(function () { btn.textContent = prev; }, 1600);
      }).catch(function () { btn.textContent = 'Copy failed'; });
    });
  }

  // active-section highlight
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
  var map = {};
  navAnchors.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var sec = document.getElementById(id);
    if (sec) map[id] = a;
  });
  if ('IntersectionObserver' in window && Object.keys(map).length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navAnchors.forEach(function (a) { a.style.color = ''; });
          var a = map[en.target.id];
          if (a && !a.classList.contains('nav__cta')) a.style.color = '#eaf0fb';
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { obs.observe(document.getElementById(id)); });
  }
})();
