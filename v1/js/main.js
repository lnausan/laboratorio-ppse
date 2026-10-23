/* Laboratorio PPSE · UNTDF — interacciones */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Generador pseudoaleatorio con semilla: el paisaje sale igual en cada carga.
  function rng(seed) {
    return function () {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  function el(name, attrs) {
    var node = document.createElementNS(SVG_NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  /* ---------- Bosque: pinos tipo recorte ---------- */
  var treeColors = ['#2f5d3a', '#3f6f45', '#4b7d4f', '#d98a3a', '#e3a548'];
  document.querySelectorAll('.trees').forEach(function (group, gi) {
    var rand = rng(17 + gi * 31);
    var svg = group.ownerSVGElement;
    var width = svg.viewBox.baseVal.width;
    var baseY = Number(group.dataset.y);
    var count = Number(group.dataset.count);
    var scale = Number(group.dataset.scale || 1);
    for (var i = 0; i < count; i++) {
      var x = (i + rand() * 0.8) * (width / count);
      var y = baseY + rand() * 34;
      var h = (22 + rand() * 20) * scale;
      var w = h * 0.55;
      var color = treeColors[Math.floor(rand() * (rand() > 0.82 ? 5 : 3))];
      group.appendChild(el('path', {
        d: 'M' + x + ' ' + (y - h) + ' L' + (x + w / 2) + ' ' + y + ' L' + (x - w / 2) + ' ' + y + ' Z',
        fill: color
      }));
    }
  });

  /* ---------- Casitas de colores ---------- */
  var houseColors = ['#ec6a4d', '#1f6e6a', '#8a68b4', '#f3b23a', '#3b82b4', '#c95b3f'];
  document.querySelectorAll('.houses').forEach(function (group) {
    var rand = rng(7);
    var d = group.dataset;
    var x0 = +d.x0, x1 = +d.x1, y0 = +d.y0, y1 = +d.y1, count = +d.count;
    for (var i = 0; i < count; i++) {
      var x = x0 + rand() * (x1 - x0);
      var y = y0 + rand() * (y1 - y0);
      var w = 18 + rand() * 12;
      var h = 13 + rand() * 8;
      var g = el('g', {});
      g.appendChild(el('rect', { x: x, y: y, width: w, height: h, fill: houseColors[Math.floor(rand() * houseColors.length)] }));
      g.appendChild(el('path', { d: 'M' + (x - 3) + ' ' + y + ' L' + (x + w / 2) + ' ' + (y - 10) + ' L' + (x + w + 3) + ' ' + y + ' Z', fill: '#2c2e2a' }));
      g.appendChild(el('rect', { x: x + w / 2 - 3, y: y + h - 7, width: 6, height: 7, fill: '#f5f1e4' }));
      group.appendChild(g);
    }
  });

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var links = document.getElementById('nav-links');
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- Aparición al hacer scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add('is-in'); });
  }

  /* ---------- Link activo en la nav ---------- */
  var navLinks = document.querySelectorAll('.nav__links a');
  if ('IntersectionObserver' in window) {
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) sectionIO.observe(target);
    });
  }

  /* ---------- Camino punteado entre post-its ---------- */
  var recorrido = document.querySelector('.recorrido');
  var pathSvg = recorrido.querySelector('.recorrido__path');
  var line = pathSvg.querySelector('.path-line');
  var mask = pathSvg.querySelector('.path-mask');
  var pathLength = 0;

  function drawPath() {
    var box = recorrido.getBoundingClientRect();
    var pts = Array.prototype.map.call(recorrido.querySelectorAll('.postit'), function (p) {
      var r = p.getBoundingClientRect();
      return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
    });
    if (!pts.length) return;
    // entra desde arriba y sale hacia el mapa
    var start = { x: pts[0].x, y: 0 };
    var end = { x: pts[pts.length - 1].x, y: box.height };
    var all = [start].concat(pts, [end]);
    var d = 'M' + all[0].x + ' ' + all[0].y;
    for (var i = 1; i < all.length; i++) {
      var a = all[i - 1], b = all[i];
      var my = (b.y - a.y) * 0.55;
      d += ' C' + a.x + ' ' + (a.y + my) + ' ' + b.x + ' ' + (b.y - my) + ' ' + b.x + ' ' + b.y;
    }
    pathSvg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
    line.setAttribute('d', d);
    mask.setAttribute('d', d);
    pathLength = mask.getTotalLength();
    mask.style.strokeDasharray = pathLength;
    updatePath();
  }

  function updatePath() {
    if (reduceMotion) { mask.style.strokeDashoffset = 0; return; }
    var box = recorrido.getBoundingClientRect();
    var progress = (window.innerHeight * 0.7 - box.top) / box.height;
    progress = Math.max(0, Math.min(1, progress));
    mask.style.strokeDashoffset = pathLength * (1 - progress);
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawPath, 120);
  });
  window.addEventListener('scroll', updatePath, { passive: true });
  window.addEventListener('load', drawPath);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawPath);
  drawPath();

  /* ---------- Mapa ↔ encuentros ---------- */
  var places = document.querySelectorAll('.place');
  var sessions = document.querySelectorAll('.session');

  function highlight(name) {
    places.forEach(function (p) { p.classList.toggle('is-active', p.dataset.place === name); });
    sessions.forEach(function (s) { s.classList.toggle('is-active', s.dataset.place === name); });
  }
  function clear() { highlight(null); }

  sessions.forEach(function (s) {
    s.addEventListener('mouseenter', function () { highlight(s.dataset.place); });
    s.addEventListener('mouseleave', clear);
  });
  places.forEach(function (p) {
    p.addEventListener('mouseenter', function () { highlight(p.dataset.place); });
    p.addEventListener('mouseleave', clear);
    p.addEventListener('focus', function () { highlight(p.dataset.place); });
    p.addEventListener('blur', clear);
    p.addEventListener('click', function () { highlight(p.dataset.place); });
  });
})();
