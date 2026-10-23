/* Laboratorio PPSE · UNTDF — el descenso por el mapa */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WORLD_W = 1440, WORLD_H = 3600;

  // Pseudoaleatorio con semilla: el paisaje sale igual en cada carga.
  function rng(seed) {
    return function () {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }
  function el(name, attrs, parent) {
    var node = document.createElementNS(SVG_NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }
  function popGroup(parent, baseY, delay) {
    var g = el('g', { 'class': 'pop', 'data-y': baseY }, parent);
    g.style.setProperty('--d', delay.toFixed(2) + 's');
    return g;
  }

  /* =========================================================
     1. Construcción del paisaje
     ========================================================= */
  var rand = rng(11);

  // Nubes
  var clouds = document.getElementById('w-clouds');
  for (var c = 0; c < 7; c++) {
    var cg = el('g', { 'class': 'cloud' }, clouds);
    cg.style.setProperty('--dur', (45 + rand() * 35).toFixed(0) + 's');
    cg.style.setProperty('--delay', (-rand() * 80).toFixed(0) + 's');
    var cs = 0.7 + rand() * 0.8;
    var inner = el('g', { transform: 'translate(0 ' + (120 + c * 95 + rand() * 40).toFixed(0) + ') scale(' + cs.toFixed(2) + ')' }, cg);
    el('rect', { x: 0, y: 0, width: 200, height: 46, rx: 23, fill: '#fff' }, inner);
    el('circle', { cx: 62, cy: 4, r: 40, fill: '#fff' }, inner);
    el('circle', { cx: 122, cy: -8, r: 52, fill: '#fff' }, inner);
    el('circle', { cx: 168, cy: 12, r: 30, fill: '#fff' }, inner);
  }

  // Bosque: pinos y lengas (algunas otoñales)
  var trees = document.getElementById('w-trees');
  var greens = ['#2f5d3a', '#3a6b40', '#467a48', '#2c5236'];
  var autumn = ['#d98a3a', '#c95b3f', '#e3a548'];
  var treeList = [];
  for (var t = 0; t < 150; t++) {
    var tx = rand() * WORLD_W;
    var ty = 1260 + rand() * 500;
    var inLagoon = Math.pow((tx - 330) / 200, 2) + Math.pow((ty - 1335) / 80, 2) < 1;
    if (inLagoon) continue;
    treeList.push({ x: tx, y: ty });
  }
  treeList.sort(function (a, b) { return a.y - b.y; });
  // claros donde están paradas las personas (x1–x2, pies): ningún árbol asoma entre ellas
  var clearings = [{ x1: 940, x2: 1220, feet: 1270 }, { x1: 380, x2: 580, feet: 1420 }];
  treeList.forEach(function (p) {
    var h = 46 + rand() * 40, w = h * 0.55;
    var color = rand() > 0.8 ? autumn[Math.floor(rand() * 3)] : greens[Math.floor(rand() * 4)];
    var delay = rand() * 0.25;
    var behindPeople = clearings.some(function (c) {
      return p.x + w / 2 > c.x1 && p.x - w / 2 < c.x2 && p.y > c.feet - 175 && p.y - h - 14 < c.feet + 8;
    });
    if (behindPeople) return;
    var g = popGroup(trees, p.y, delay);
    el('rect', { x: p.x - 3, y: p.y - 10, width: 6, height: 12, fill: '#5b4636' }, g);
    el('path', { d: 'M' + p.x + ' ' + (p.y - h) + ' L' + (p.x + w / 2) + ' ' + (p.y - 8) + ' L' + (p.x - w / 2) + ' ' + (p.y - 8) + ' Z', fill: color }, g);
    el('path', { d: 'M' + p.x + ' ' + (p.y - h - 14) + ' L' + (p.x + w * 0.36) + ' ' + (p.y - h * 0.5) + ' L' + (p.x - w * 0.36) + ' ' + (p.y - h * 0.5) + ' Z', fill: color }, g);
  });

  // Ciudad: casitas de colores a lo largo de las calles
  var houses = document.getElementById('w-houses');
  var houseColors = ['#ec6a4d', '#1f6e6a', '#8a68b4', '#f3b23a', '#3b82b4', '#c95b3f', '#f5f1e4'];
  var roofColors = ['#2c2e2a', '#2c2e2a', '#c95b3f', '#1f6e6a'];
  var avenues = [200, 430, 660, 890, 1130];
  var keepOut = [{ x: 520, y: 2040, r: 110 }, { x: 640, y: 1985, r: 100 }, { x: 960, y: 2290, r: 110 }, { x: 1075, y: 2235, r: 100 }];
  // placita donde está la ronda de conversación: sin casas detrás de las personas
  var plaza = { x: 168, y: 1988, w: 304, h: 178 };
  el('rect', { x: plaza.x, y: plaza.y, width: plaza.w, height: plaza.h, rx: 44, fill: '#b9d38a', stroke: '#2c2e2a', 'stroke-width': 2 }, houses);
  [1885, 2035, 2185, 2335, 2485].forEach(function (streetY) {
    for (var hx = 40; hx < 1400; hx += 56 + rand() * 24) {
      var nearAvenue = avenues.some(function (a) { return Math.abs(a - hx) < 36; });
      var nearPin = keepOut.some(function (k) { return Math.hypot(k.x - hx, k.y - streetY) < k.r; });
      if (nearAvenue || nearPin || rand() < 0.12) continue;
      var base = streetY - 12 - rand() * 6;
      var w = 34 + rand() * 16, h = 26 + rand() * 14;
      var x = hx;
      // (se descarta después de sortear el tamaño para no alterar el resto de las casas)
      var inPlaza = x + w + 5 > plaza.x && x - 5 < plaza.x + plaza.w && base > plaza.y && base - h - 18 < plaza.y + plaza.h;
      if (inPlaza) continue;
      var g = popGroup(houses, base, (hx / WORLD_W) * 0.35);
      el('rect', { x: x, y: base - h, width: w, height: h, fill: houseColors[Math.floor(rand() * houseColors.length)], stroke: '#2c2e2a', 'stroke-width': 2 }, g);
      el('path', { d: 'M' + (x - 5) + ' ' + (base - h) + ' L' + (x + w / 2) + ' ' + (base - h - 18) + ' L' + (x + w + 5) + ' ' + (base - h) + ' Z', fill: roofColors[Math.floor(rand() * roofColors.length)], stroke: '#2c2e2a', 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
      el('rect', { x: x + w / 2 - 4, y: base - 12, width: 8, height: 12, fill: '#2c2e2a' }, g);
      el('rect', { x: x + 5, y: base - h + 6, width: 8, height: 8, fill: '#fff8dc', stroke: '#2c2e2a', 'stroke-width': 1.5 }, g);
      if (rand() < 0.3) {
        var chx = x + w * 0.72;
        el('rect', { x: chx, y: base - h - 16, width: 7, height: 12, fill: '#6b5b53', stroke: '#2c2e2a', 'stroke-width': 1.5 }, g);
        for (var s = 0; s < 3; s++) {
          var puff = el('circle', { cx: chx + 3.5, cy: base - h - 22, r: 6, fill: '#fff', 'class': 'puff' }, houses);
          puff.style.setProperty('--delay', (s * 1.1 + rand()).toFixed(2) + 's');
        }
      }
    }
  });

  // Olas
  var waves = document.getElementById('w-waves');
  for (var wv = 0; wv < 34; wv++) {
    var wx = rand() * WORLD_W, wy = 2830 + rand() * 720;
    var wave = el('path', { d: 'M' + wx + ' ' + wy + ' q16 -12 32 0 t32 0', fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.55, 'class': 'wave' }, waves);
    wave.style.setProperty('--delay', (-rand() * 4).toFixed(2) + 's');
  }

  // Barquitos
  var boats = document.getElementById('w-boats');
  [{ y: 3010, s: 1, dur: 70, sail: '#fff' }, { y: 3200, s: 1.3, dur: 95, sail: '#ec6a4d', back: true }, { y: 3400, s: 0.9, dur: 60, sail: '#f3b23a' }].forEach(function (b, i) {
    var g = el('g', { 'class': 'boat' + (b.back ? ' boat--back' : '') }, boats);
    g.style.setProperty('--dur', b.dur + 's');
    g.style.setProperty('--delay', (-b.dur * (0.2 + i * 0.3)).toFixed(0) + 's');
    var pos = el('g', { transform: 'translate(0 ' + b.y + ') scale(' + b.s + ')' }, g);
    var bob = el('g', { 'class': 'bob' }, pos);
    el('path', { d: 'M-48 0 H48 L36 22 H-36 Z', fill: '#fff', stroke: '#2c2e2a', 'stroke-width': 3, 'stroke-linejoin': 'round' }, bob);
    el('path', { d: 'M0 0 V-82', stroke: '#2c2e2a', 'stroke-width': 3 }, bob);
    el('path', { d: 'M4 -78 L44 -8 H4 Z', fill: b.sail, stroke: '#2c2e2a', 'stroke-width': 3, 'stroke-linejoin': 'round' }, bob);
    el('path', { d: 'M-4 -60 L-32 -8 H-4 Z', fill: '#d9cdee', stroke: '#2c2e2a', 'stroke-width': 3, 'stroke-linejoin': 'round' }, bob);
  });


  /* ---------- Personas (estilo recorte de papel del flyer) ---------- */
  var INK = '#2c2e2a';
  var people = document.getElementById('w-people');

  // objetos que llevan en la mano; el "laboratorio" aparece sutil
  var items = {
    flask: function (g) {           // matraz con un brote que crece
      el('path', { d: 'M0 -14 C-2 -22 -8 -24 -10 -30 C-2 -30 0 -24 0 -18 C0 -26 6 -32 12 -30 C10 -24 4 -22 0 -16', fill: '#5f9258', stroke: INK, 'stroke-width': 1.5 }, g);
      el('rect', { x: -4, y: -14, width: 8, height: 9, fill: '#fff', stroke: INK, 'stroke-width': 2 }, g);
      el('path', { d: 'M-4 -5 L-13 12 Q-14 16 -9 16 H9 Q14 16 13 12 L4 -5 Z', fill: '#fff', stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
      el('path', { d: 'M-8 5 L-11 12 Q-11 14 -8 14 H8 Q11 14 11 12 L8 5 Z', fill: '#5cc3b4' }, g);
    },
    lens: function (g) {            // lupa
      el('path', { d: 'M6 6 L16 16', stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      el('circle', { r: 10, fill: '#dbeef0', stroke: INK, 'stroke-width': 3 }, g);
    },
    notebook: function (g) {        // cuaderno de registro
      el('rect', { x: -13, y: -10, width: 26, height: 20, rx: 2, fill: '#f5f1e4', stroke: INK, 'stroke-width': 2 }, g);
      el('path', { d: 'M-7 -3 H8 M-7 2 H5 M-7 6 H8', stroke: INK, 'stroke-width': 1.2 }, g);
      el('path', { d: 'M-13 -10 V10', stroke: '#ec6a4d', 'stroke-width': 3 }, g);
    },
    postit: function (g) {
      el('rect', { x: -11, y: -11, width: 22, height: 22, fill: '#f3b23a', stroke: INK, 'stroke-width': 2, transform: 'rotate(8)' }, g);
    },
    map: function (g) {
      el('path', { d: 'M-22 -10 l14 -5 l14 5 l14 -5 v26 l-14 5 l-14 -5 l-14 5 z', fill: '#f5f1e4', stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
      el('path', { d: 'M-8 -15 v26 M6 -10 v26', stroke: INK, 'stroke-width': 1.2 }, g);
      el('circle', { cx: 0, cy: 0, r: 3, fill: '#ec6a4d' }, g);
    }
  };

  var hairs = {
    bun: 'M-15 -98 C-16 -118 16 -118 15 -98 C9 -108 -9 -108 -15 -98 Z M0 -122 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0',
    short: 'M-15 -96 C-17 -120 17 -122 15 -98 C10 -106 -2 -110 -15 -96 Z',
    pony: 'M-15 -100 C-16 -120 16 -120 15 -100 C8 -110 -8 -110 -15 -100 Z',
    curly: 'M-16 -100 a7 7 0 0 1 6 -12 a7 7 0 0 1 10 -4 a7 7 0 0 1 10 4 a7 7 0 0 1 6 12 C10 -106 -10 -106 -16 -100 Z'
  };

  function person(x, y, o) {
    var g = popGroup(people, y, o.delay || 0);
    var f = el('g', { transform: 'translate(' + x + ' ' + y + ') scale(' + ((o.flip ? -1 : 1) * (o.s || 1)) + ' ' + (o.s || 1) + ')' }, g);
    var sw = o.sweater, skin = o.skin;
    // piernas y zapatos
    el('rect', { x: -13, y: -38, width: 11, height: 38, rx: 5, fill: o.pants || INK }, f);
    el('rect', { x: 2, y: -38, width: 11, height: 38, rx: 5, fill: o.pants || INK }, f);
    el('ellipse', { cx: -8, cy: 0, rx: 9, ry: 4, fill: INK }, f);
    el('ellipse', { cx: 8, cy: 0, rx: 9, ry: 4, fill: INK }, f);
    var arm = { stroke: sw, 'stroke-width': 10, 'stroke-linecap': 'round', fill: 'none' };
    // torso (pulóver con textura de punto)
    el('path', { d: 'M-24 -34 C-27 -64 -20 -84 0 -84 C20 -84 27 -64 24 -34 Z', fill: sw, stroke: INK, 'stroke-width': 2.5 }, f);
    el('path', { d: 'M-22 -40 H22 M-12 -78 v6 M-6 -80 v6 M0 -80 v6 M6 -80 v6 M12 -78 v6', stroke: INK, 'stroke-width': 1.2, opacity: 0.35 }, f);
    // cola de caballo (por detrás de la cabeza)
    if (o.hair === 'pony') el('path', { d: 'M10 -110 C26 -112 32 -96 26 -80 C22 -90 18 -98 8 -102 Z', fill: o.hairColor || INK }, f);
    // cabeza
    el('rect', { x: -5, y: -90, width: 10, height: 8, fill: skin }, f);
    el('circle', { cx: 0, cy: -102, r: 14, fill: skin, stroke: INK, 'stroke-width': 2 }, f);
    el('path', { d: hairs[o.hair || 'short'], fill: o.hairColor || INK }, f);
    // brazos según la pose
    var hand, item;
    if (o.pose === 'raise') {
      el('path', Object.assign({ d: 'M-20 -74 C-30 -60 -30 -48 -26 -40' }, arm), f);
      el('circle', { cx: -26, cy: -38, r: 5, fill: skin }, f);
      el('path', Object.assign({ d: 'M20 -74 C34 -84 38 -100 36 -114' }, arm), f);
      hand = [36, -116];
    } else if (o.pose === 'hold') {
      el('path', Object.assign({ d: 'M-20 -72 C-26 -58 -20 -54 -13 -56' }, arm), f);
      el('path', Object.assign({ d: 'M20 -72 C26 -58 20 -54 13 -56' }, arm), f);
      hand = [0, -60];
    } else {
      el('path', Object.assign({ d: 'M-20 -74 C-30 -60 -30 -48 -26 -40' }, arm), f);
      el('path', Object.assign({ d: 'M20 -74 C30 -60 30 -48 26 -40' }, arm), f);
      el('circle', { cx: -26, cy: -38, r: 5, fill: skin }, f);
      el('circle', { cx: 26, cy: -38, r: 5, fill: skin }, f);
    }
    if (hand) {
      if (o.item) {
        item = el('g', { transform: 'translate(' + hand[0] + ' ' + (hand[1] - (o.pose === 'raise' ? 10 : 0)) + ')' }, f);
        items[o.item](item);
      }
      el('circle', { cx: hand[0] - (o.pose === 'hold' ? 13 : 0), cy: hand[1] + (o.pose === 'hold' ? 4 : 0), r: 5, fill: skin }, f);
      if (o.pose === 'hold') el('circle', { cx: hand[0] + 13, cy: hand[1] + 4, r: 5, fill: skin }, f);
    }
  }

  function bubble(x, y, delay) {
    var g = popGroup(people, y + 40, delay);
    el('path', { d: 'M' + (x - 34) + ' ' + (y - 20) + ' h68 a14 14 0 0 1 14 14 v12 a14 14 0 0 1 -14 14 h-30 l-12 12 v-12 h-26 a14 14 0 0 1 -14 -14 v-12 a14 14 0 0 1 14 -14 z', fill: '#fff', stroke: INK, 'stroke-width': 2.5 }, g);
    [-14, 0, 14].forEach(function (dx) { el('circle', { cx: x + dx, cy: y, r: 4, fill: INK }, g); });
  }

  var C = { violet: '#8a68b4', teal: '#1f6e6a', coral: '#e8613f', mustard: '#f3b23a', green: '#3f7d55' };
  var S = ['#f2c6a0', '#c98d62', '#8a5a3c', '#e9b48c'];
  var H = ['#2c2e2a', '#6b3f26', '#c9a27a', '#3a2a20'];

  var P = 1.35; // escala de las personas
  // al pie de la montaña: una persona levanta el matraz con el brote
  person(1000, 1255, { s: P, sweater: C.violet, skin: S[0], hair: 'bun', hairColor: H[1], pose: 'raise', item: 'flask', delay: 0 });
  person(1082, 1262, { s: P, sweater: C.teal, skin: S[2], hair: 'curly', hairColor: H[0], pose: 'hold', item: 'notebook', delay: 0.1, pants: '#43708f' });
  person(1162, 1252, { s: P, sweater: C.coral, skin: S[3], hair: 'pony', hairColor: H[2], pose: 'down', delay: 0.2, flip: true });

  // en la laguna: observar y registrar
  person(440, 1405, { s: P, sweater: C.mustard, skin: S[1], hair: 'short', hairColor: H[3], pose: 'hold', item: 'lens', delay: 0 });
  person(522, 1412, { s: P, sweater: C.green, skin: S[0], hair: 'pony', hairColor: H[0], pose: 'hold', item: 'notebook', delay: 0.12, flip: true, pants: '#5b4636' });

  // en la ciudad: una ronda de conversación
  bubble(320, 1925, 0.3);
  person(240, 2128, { s: P, sweater: C.coral, skin: S[2], hair: 'short', hairColor: H[0], pose: 'raise', item: 'postit', delay: 0 });
  person(320, 2138, { s: P, sweater: C.violet, skin: S[3], hair: 'pony', hairColor: H[1], pose: 'hold', item: 'flask', delay: 0.1 });
  person(400, 2126, { s: P, sweater: C.teal, skin: S[0], hair: 'bun', hairColor: H[2], pose: 'down', delay: 0.2, flip: true, pants: '#43708f' });

  // en la costa: llevando el mapa hacia el muelle
  person(1070, 2742, { s: P, sweater: C.teal, skin: S[1], hair: 'curly', hairColor: H[3], pose: 'hold', item: 'map', delay: 0 });
  person(1160, 2740, { s: P, sweater: C.mustard, skin: S[0], hair: 'bun', hairColor: H[0], pose: 'raise', item: 'flask', delay: 0.12, flip: true });

  /* =========================================================
     2. El camino: curva suave que serpentea entre las paradas
     ========================================================= */
  var routePts = [
    [720, 700], [1060, 950], [1110, 1180], [720, 1370], [430, 1560], [390, 1800],
    [520, 2030], [760, 2190], [960, 2320], [1010, 2520], [880, 2720], [760, 2930],
    [690, 3150], [600, 3420], [560, 3600]
  ];
  function catmullRom(pts) {
    var d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0] + ' ' + p2[1];
    }
    return d;
  }
  var routeD = catmullRom(routePts);
  var ghost = document.querySelector('.route--ghost');
  var drawn = document.querySelector('.route--drawn');
  var routeMask = document.querySelector('.route__mask');
  var traveler = document.querySelector('.traveler');
  ghost.setAttribute('d', routeD);
  drawn.setAttribute('d', routeD);
  routeMask.setAttribute('d', routeD);
  var routeLen = routeMask.getTotalLength();
  routeMask.style.strokeDasharray = routeLen;
  routeMask.style.strokeDashoffset = routeLen;
  // muestreo para encontrar rápido el punto del camino a una altura dada
  var samples = [];
  for (var L = 0; L <= routeLen; L += 6) {
    var pt = routeMask.getPointAtLength(L);
    samples.push({ l: L, x: pt.x, y: pt.y });
  }
  function sampleAtY(y) {
    // el camino siempre baja, así que la primera muestra que supera "y" sirve
    var lo = 0, hi = samples.length - 1;
    while (lo < hi) {
      var mid = (lo + hi) >> 1;
      if (samples[mid].y < y) lo = mid + 1; else hi = mid;
    }
    return samples[lo];
  }

  /* =========================================================
     3. La cámara: el scroll baja por el mapa
     ========================================================= */
  var journey = document.querySelector('.journey');
  var stage = document.querySelector('.stage');
  var world = document.querySelector('.world');
  var depthLayers = Array.prototype.map.call(document.querySelectorAll('.depth'), function (g) {
    return { el: g, depth: parseFloat(g.dataset.depth) };
  });
  var sunRing = document.querySelector('.sun-ring');
  var sunDisc = sunRing.previousElementSibling;
  var RING_OUTER = 316; // radio del anillo (290) + alto de las letras, en unidades del mapa
  var sunK = 1;
  var SUN_DROP = 70; // se baja el sol para que pueda crecer sin tocar el header
  var pops = Array.prototype.map.call(document.querySelectorAll('.pop'), function (g) {
    return { el: g, y: parseFloat(g.dataset.y), up: false };
  });

  var m = {}; // métricas
  function measure() {
    m.W = stage.clientWidth;
    m.H = stage.clientHeight;
    m.worldH = m.H * 4;
    m.scale = Math.max(m.W / WORLD_W, m.worldH / WORLD_H);
    m.offY = (m.worldH - WORLD_H * m.scale) / 2;
    m.top = journey.getBoundingClientRect().top + window.scrollY;
    m.span = journey.offsetHeight - m.H;
    // el sol y su anillo de texto se achican si al inicio llegarían a tocar el header
    var navEl = document.querySelector('.nav');
    var minTop = (navEl ? navEl.getBoundingClientRect().bottom : 80) + 14;
    sunK = Math.max(0.6, Math.min(1.08, (520 + SUN_DROP - (minTop - m.offY) / m.scale) / RING_OUTER));
    if (sunDisc) sunDisc.setAttribute('transform', 'translate(1040 ' + (520 + SUN_DROP) + ') scale(' + sunK.toFixed(3) + ') translate(-1040 -520)');
  }

  var current = 0, target = 0, running = false;

  function progressFromScroll() {
    var p = (window.scrollY - m.top) / m.span;
    return Math.max(0, Math.min(1, p));
  }

  function render(p) {
    var camPx = p * (m.worldH - m.H);
    world.style.transform = 'translate3d(0,' + (-camPx).toFixed(1) + 'px,0)';

    var camY = (camPx - m.offY) / m.scale;         // borde superior visible, en unidades del mapa
    var viewH = m.H / m.scale;                     // alto visible, en unidades del mapa

    // capas con profundidad (se mueven más lento → parallax)
    depthLayers.forEach(function (layer) {
      layer.el.setAttribute('transform', 'translate(0 ' + (camY * layer.depth).toFixed(1) + ')');
    });
    sunRing.setAttribute('transform', 'translate(1040 ' + (520 + SUN_DROP) + ') scale(' + sunK.toFixed(3) + ') rotate(' + (camY * 0.08).toFixed(2) + ') translate(-1040 -520)');

    // piezas pop-up: se levantan al entrar desde abajo y se pliegan al volver a subir
    var edge = camY + viewH;
    for (var i = 0; i < pops.length; i++) {
      var pp = pops[i];
      if (!pp.up && pp.y < edge - 30) { pp.up = true; pp.el.classList.add('up'); }
      else if (pp.up && pp.y > edge + 60) { pp.up = false; pp.el.classList.remove('up'); }
    }

    // el marcador acompaña la mitad de la pantalla
    var focusY = camY + viewH * 0.55;
    if (focusY < routePts[0][1]) {
      traveler.style.opacity = 0;
      routeMask.style.strokeDashoffset = routeLen;
    } else {
      var s = sampleAtY(focusY);
      traveler.style.opacity = 1;
      traveler.setAttribute('transform', 'translate(' + s.x.toFixed(1) + ' ' + s.y.toFixed(1) + ')');
      routeMask.style.strokeDashoffset = (routeLen - s.l).toFixed(1);
    }
  }

  function tick() {
    var diff = target - current;
    if (reduceMotion || Math.abs(diff) < 0.0004) {
      current = target;
      render(current);
      running = false;
      return;
    }
    current += diff * 0.12;               // suavizado: la cámara "flota" detrás del scroll
    render(current);
    requestAnimationFrame(tick);
  }
  // la portada se desvanece y sube antes de quedar sobre la montaña
  var hero = document.querySelector('.hero');
  var cue = document.querySelector('.scroll-cue');
  function fadeHero() {
    var k = Math.min(1, Math.max(0, window.scrollY / (m.H * 0.45)));
    hero.style.opacity = (1 - k).toFixed(3);
    hero.style.transform = 'translateY(' + (-k * 60).toFixed(1) + 'px)';
    hero.style.visibility = k >= 1 ? 'hidden' : 'visible';
    cue.style.opacity = Math.max(0, 1 - k * 2.5).toFixed(3);
    cue.style.visibility = k >= 0.4 ? 'hidden' : 'visible';
  }

  function onScroll() {
    fadeHero();
    target = progressFromScroll();
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  measure();
  current = target = progressFromScroll();
  render(current);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); onScroll(); });
  window.addEventListener('load', function () { measure(); onScroll(); });

  /* =========================================================
     4. Texto e interfaz
     ========================================================= */
  // Título letra por letra
  document.querySelectorAll('[data-split]').forEach(function (node) {
    var text = node.textContent;
    node.closest('h1').setAttribute('aria-label', node.closest('h1').textContent.replace(/\s+/g, ' ').trim());
    node.textContent = '';
    text.split('').forEach(function (ch, i) {
      var span = document.createElement('span');
      span.className = i < 3 ? 'ch ch--lab' : 'ch';
      span.style.setProperty('--i', i);
      span.setAttribute('aria-hidden', 'true');
      span.textContent = ch;
      node.appendChild(span);
    });
  });

  // "Lab" en coral cada vez que aparece la palabra laboratorio (también en el SVG)
  var LAB_RE = /\b(lab)(?=oratorio)/gi;
  function markLab(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || /^(SCRIPT|STYLE|TITLE|TEXTAREA)$/i.test(p.nodeName)) return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('.lab-mark, .brand__lab, .hero__display, title')) return NodeFilter.FILTER_REJECT;
        LAB_RE.lastIndex = 0;
        return LAB_RE.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var inSvg = n.parentNode.namespaceURI === SVG_NS;
      var frag = document.createDocumentFragment(), text = n.nodeValue, last = 0, mt;
      LAB_RE.lastIndex = 0;
      while ((mt = LAB_RE.exec(text))) {
        if (mt.index > last) frag.appendChild(document.createTextNode(text.slice(last, mt.index)));
        var mark = inSvg ? document.createElementNS(SVG_NS, 'tspan') : document.createElement('span');
        mark.setAttribute('class', 'lab-mark');
        mark.textContent = mt[1];
        frag.appendChild(mark);
        last = mt.index + mt[1].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      n.parentNode.replaceChild(frag, n);
    });
  }
  markLab(document.body);

  // Que "Laboratorio" y el texto del inicio no pisen el anillo de texto del sol:
  // se mide dónde empieza el anillo y se achica la palabra / el ancho del bloque si hace falta.
  var heroEl = document.querySelector('.hero');
  var heroDisplay = document.querySelector('.hero__display');
  var ringText = document.querySelector('.ring-text');
  var fitPending = false;
  function fitHero() {
    if (!heroEl || !heroDisplay || !ringText) return;
    if (window.scrollY > 10) { fitPending = true; return; } // el anillo se mueve con la cámara
    fitPending = false;
    heroDisplay.style.fontSize = '';
    heroEl.style.maxWidth = '';
    var rb = ringText.getBoundingClientRect();
    if (!rb.width) return; // anillo oculto en pantallas chicas
    var cx = rb.left + rb.width / 2, cy = rb.top + rb.height / 2, r = rb.width / 2, GAP = 28;
    function ringEdge(top, bottom) {
      var dy = cy < top ? top - cy : cy > bottom ? cy - bottom : 0;
      return dy >= r ? Infinity : cx - Math.sqrt(r * r - dy * dy);
    }
    for (var pass = 0; pass < 2; pass++) {
      var db = heroDisplay.getBoundingClientRect(), w = 0;
      heroDisplay.querySelectorAll('.ch').forEach(function (c) { w += c.offsetWidth; });
      var room = ringEdge(db.top, db.bottom) - db.left - GAP;
      if (w > room) {
        var fs = parseFloat(getComputedStyle(heroDisplay).fontSize);
        heroDisplay.style.fontSize = Math.max(56, fs * room / w).toFixed(1) + 'px';
      }
      var hb = heroEl.getBoundingClientRect();
      var heroRoom = ringEdge(hb.top, hb.bottom) - hb.left - GAP;
      if (heroRoom < hb.width) heroEl.style.maxWidth = Math.max(320, heroRoom).toFixed(0) + 'px';
    }
  }
  // se recalcula cuando el mapa ya está ubicado (load) y cuando terminan de cargar las fuentes
  window.addEventListener('load', function () { setTimeout(fitHero, 60); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(fitHero, 60); });
  window.addEventListener('resize', fitHero);
  window.addEventListener('scroll', function () { if (fitPending && window.scrollY <= 10) fitHero(); }, { passive: true });

  // Tarjetas y bloques que aparecen al entrar en pantalla
  var revealables = document.querySelectorAll('.chapter .card, .reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    revealables.forEach(function (r) { io.observe(r); });
  } else {
    revealables.forEach(function (r) { r.classList.add('is-in'); });
  }

  // Menú móvil
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

  // Link activo en la nav
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
      var t = document.querySelector(a.getAttribute('href'));
      if (t) sectionIO.observe(t);
    });
  }

  /* =========================================================
     5. Cronograma: mapa ilustrado + recorrido de los 6 encuentros
     ========================================================= */
  var map = document.querySelector('.map');
  var stops = Array.prototype.slice.call(document.querySelectorAll('.stop'));
  if (map && stops.length) buildCronograma();

  function buildCronograma() {
    var mrand = rng(23);
    var INK = '#2c2e2a';
    var tones = ['#ec6a4d', '#1f6e6a', '#8a68b4', '#f3b23a', '#3b82b4', '#f5f1e4'];

    // Nubes
    var clouds = document.getElementById('m-clouds');
    [[150, 60, 0.6], [640, 40, 0.75], [1090, 160, 0.5]].forEach(function (c, i) {
      var g = el('g', { 'class': 'wave', transform: 'translate(' + c[0] + ' ' + c[1] + ') scale(' + c[2] + ')' }, clouds);
      g.style.setProperty('--delay', (i * 1.3) + 's');
      el('rect', { x: 0, y: 0, width: 160, height: 38, rx: 19, fill: '#fff' }, g);
      el('circle', { cx: 52, cy: 4, r: 32, fill: '#fff' }, g);
      el('circle', { cx: 100, cy: -6, r: 40, fill: '#fff' }, g);
    });

    // Pinos en la franja verde (detrás de la loma de la ciudad)
    var mtrees = document.getElementById('m-trees');
    var tl = [];
    for (var t = 0; t < 80; t++) tl.push({ x: mrand() * 1200, y: 268 + mrand() * 52 });
    tl.sort(function (a, b) { return a.y - b.y; });
    tl.forEach(function (p) {
      var h = 18 + mrand() * 16, w = h * 0.55;
      var c = mrand() > 0.82 ? ['#d98a3a', '#e3a548'][Math.floor(mrand() * 2)] : ['#2f5d3a', '#3a6b40', '#467a48'][Math.floor(mrand() * 3)];
      el('path', { d: 'M' + p.x + ' ' + (p.y - h) + ' L' + (p.x + w / 2) + ' ' + p.y + ' L' + (p.x - w / 2) + ' ' + p.y + ' Z', fill: c }, mtrees);
    });

    // Casitas sobre las calles (se leen de las propias calles del SVG)
    var mhouses = document.getElementById('m-houses');
    var streets = map.querySelectorAll('.map__streets path');
    var avenuesX = [220, 394, 568, 743, 917];
    var free = [{ x: 470, w: 120 }, { x: 545, w: 46 }, { x: 790, w: 120 }, { x: 715, w: 70 }];
    function yAt(path, x) {
      var len = path.getTotalLength(), best = null;
      for (var i = 0; i <= 120; i++) {
        var pt = path.getPointAtLength(len * i / 120);
        if (!best || Math.abs(pt.x - x) < Math.abs(best.x - x)) best = pt;
      }
      return best.y;
    }
    for (var r = 0; r < 3; r++) {
      for (var hx = 70; hx < 1140; hx += 30 + mrand() * 16) {
        var w = 16 + mrand() * 8, h = 12 + mrand() * 7, color = tones[Math.floor(mrand() * tones.length)];
        var skip = mrand() < 0.18 ||
          avenuesX.some(function (a) { return Math.abs(a - hx - w / 2) < 22; }) ||
          free.some(function (f) { return Math.abs(f.x - hx - w / 2) < f.w / 2 + w / 2; });
        if (skip) continue;
        var base = yAt(streets[r], hx + w / 2) - 5;
        el('rect', { x: hx, y: base - h, width: w, height: h, fill: color, stroke: INK, 'stroke-width': 1.5 }, mhouses);
        el('path', { d: 'M' + (hx - 3) + ' ' + (base - h) + ' L' + (hx + w / 2) + ' ' + (base - h - 10) + ' L' + (hx + w + 3) + ' ' + (base - h) + ' Z', fill: INK, stroke: INK, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, mhouses);
        el('rect', { x: hx + w / 2 - 2.5, y: base - 7, width: 5, height: 7, fill: INK }, mhouses);
      }
    }

    // Mar: olas, un barquito y el faro
    var sea = document.getElementById('m-sea');
    for (var k = 0; k < 16; k++) {
      var wx = 380 + mrand() * 780, wy = 510 + mrand() * 80;
      var wave = el('path', { d: 'M' + wx.toFixed(0) + ' ' + wy.toFixed(0) + ' q12 -9 24 0 t24 0', fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.55, 'class': 'wave' }, sea);
      wave.style.setProperty('--delay', (-mrand() * 4).toFixed(2) + 's');
    }
    var boat = el('g', { transform: 'translate(760 560)' }, sea);
    var bob = el('g', { 'class': 'bob' }, boat);
    el('path', { d: 'M-34 0 H34 L24 16 H-24 Z', fill: '#c95b3f', stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, bob);
    el('path', { d: 'M0 0 V-46 L28 -6 Z', fill: '#fff', stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, bob);
    el('ellipse', { cx: 1085, cy: 586, rx: 64, ry: 15, fill: '#6b5b53', stroke: INK, 'stroke-width': 2.5 }, sea);
    var lh = el('g', { transform: 'translate(1085 580)' }, sea);
    el('path', { d: 'M-11 0 L-8 -64 H8 L11 0 Z', fill: '#fff', stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, lh);
    el('path', { d: 'M-10 -26 H10 L9 -40 H-9 Z', fill: '#ec6a4d' }, lh);
    el('rect', { x: -9, y: -76, width: 18, height: 12, fill: INK }, lh);
    el('path', { d: 'M-12 -76 L0 -90 L12 -76 Z', fill: '#ec6a4d', stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, lh);

    // Recorrido 1 → 6: IPESfa → Virtual → IPESfa → UNTDF → Virtual → UNTDF
    var spot = { ipesfa: [470, 340], untdf: [790, 350], virtual: [512, 150] };
    var curves = [
      'M470 340 C 420 280, 440 190, 512 150',
      'M512 150 C 600 190, 580 300, 470 340',
      'M470 340 C 560 450, 700 450, 790 350',
      'M790 350 C 800 230, 680 170, 512 150',
      'M512 150 C 640 60, 920 180, 790 350'
    ];
    var routeG = document.getElementById('m-route');
    var segs = curves.map(function (d) { return el('path', { d: d, 'class': 'route__seg' }, routeG); });
    // flechita a mitad de cada tramo, para leer el sentido del recorrido
    segs.forEach(function (sg) {
      var L = sg.getTotalLength(), a = sg.getPointAtLength(L / 2 - 2), b = sg.getPointAtLength(L / 2 + 2);
      var ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      el('path', { d: 'M-7 -7 L5 0 L-7 7', 'class': 'route__arrow', transform: 'translate(' + b.x.toFixed(1) + ' ' + b.y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')' }, routeG);
    });

    /* ---- datos de cada encuentro ---- */
    var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    var DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    var PLACE_NAME = { ipesfa: 'IPESfa', untdf: 'UNTDF', virtual: 'Encuentro virtual' };
    function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
    var today = iso(new Date());
    var data = stops.map(function (b, i) {
      var p = b.dataset.date.split('-').map(Number);
      return { i: i, btn: b, place: b.dataset.place, date: b.dataset.date, time: b.dataset.time, d: new Date(p[0], p[1] - 1, p[2]) };
    });
    var nextIdx = -1;
    data.forEach(function (s) {
      if (s.date < today) s.btn.classList.add('is-past');
      else if (nextIdx < 0) nextIdx = s.i;
    });
    if (nextIdx >= 0) data[nextIdx].btn.classList.add('is-next');

    function daysUntil(s) { return Math.round((s.d - new Date(today.replace(/-/g, '/'))) / 864e5); }
    function statusText(s) {
      if (s.date < today) return 'Realizado';
      var n = daysUntil(s);
      if (n === 0) return '¡Es hoy!';
      if (n === 1) return 'Mañana';
      return 'Faltan ' + n + ' días';
    }

    // Aviso del próximo encuentro en el encabezado
    var nextEl = document.getElementById('crono-next');
    if (nextEl) {
      if (nextIdx >= 0) {
        var ns = data[nextIdx];
        nextEl.textContent = 'Próximo encuentro: ' + DIAS[ns.d.getDay()].toLowerCase() + ' ' + ns.d.getDate() + ' de ' + MESES[ns.d.getMonth()] + ' · ' + statusText(ns).toLowerCase();
      } else {
        nextEl.textContent = 'El Laboratorio 2026 ya realizó sus seis encuentros.';
        markLab(nextEl);
      }
      nextEl.hidden = false;
    }

    // Archivo .ics para agendar (presenciales 18–21 h de Ushuaia = UTC-3; virtuales, día completo)
    function ics(s) {
      var ymd = s.date.replace(/-/g, '');
      var nextDay = iso(new Date(s.d.getTime() + 864e5)).replace(/-/g, '');
      var virtual = s.place === 'virtual';
      var when = virtual
        ? ['DTSTART;VALUE=DATE:' + ymd, 'DTEND;VALUE=DATE:' + nextDay]
        : ['DTSTART:' + ymd + 'T210000Z', 'DTEND:' + nextDay + 'T000000Z'];
      return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Laboratorio PPSE UNTDF//ES', 'BEGIN:VEVENT',
        'UID:laboratorio-ppse-2026-' + (s.i + 1) + '@untdf.edu.ar',
        'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z']
        .concat(when, [
          'SUMMARY:Laboratorio PPSE · Encuentro ' + (s.i + 1) + (virtual ? ' (virtual)' : ''),
          'LOCATION:' + (virtual ? 'Virtual' : PLACE_NAME[s.place] + '\\, Ushuaia'),
          'DESCRIPTION:Laboratorio de Gestión de Programas y Proyectos Socioeducativos · IEC-UNTDF. Consultas: jmrodriguez@untdf.edu.ar',
          'END:VEVENT', 'END:VCALENDAR']).join('\r\n');
    }

    /* ---- selección ---- */
    var dNum = document.getElementById('d-num'), dStatus = document.getElementById('d-status');
    var dDate = document.getElementById('d-date'), dMode = document.getElementById('d-mode'), dWhere = document.getElementById('d-where');
    var dPrev = document.getElementById('d-prev'), dNext = document.getElementById('d-next'), dIcs = document.getElementById('d-ics');
    var detail = document.querySelector('.detail');
    var places = Array.prototype.slice.call(document.querySelectorAll('.place'));
    var traveler = document.getElementById('m-traveler'), travelerNum = document.getElementById('m-traveler-num');
    var current = -1, pos = 0, anim = null;

    function placeTraveler(x, y) { traveler.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + (y - 64).toFixed(1) + ')'); }
    function travelTo(target) {
      if (anim) cancelAnimationFrame(anim);
      var from = pos, dir = target > from ? 1 : -1;
      if (reduceMotion || target === from) {
        pos = target; var sp = spot[data[target].place]; placeTraveler(sp[0], sp[1]); return;
      }
      var seg = dir > 0 ? from : from - 1, t0 = null, dur = 520;
      function step(ts) {
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        var path = segs[seg], L = path.getTotalLength();
        var pt = path.getPointAtLength(L * (dir > 0 ? e : 1 - e));
        placeTraveler(pt.x, pt.y);
        if (k < 1) { anim = requestAnimationFrame(step); return; }
        pos += dir; travelerNum.textContent = pos + 1;
        if (pos !== target) { seg += dir; t0 = null; anim = requestAnimationFrame(step); }
      }
      anim = requestAnimationFrame(step);
    }

    function select(i, opts) {
      if (i < 0 || i >= data.length || i === current) return;
      var s = data[i];
      current = i;
      data.forEach(function (o) {
        o.btn.setAttribute('aria-selected', o.i === i ? 'true' : 'false');
        o.btn.tabIndex = o.i === i ? 0 : -1;
      });
      places.forEach(function (p) { p.classList.toggle('is-active', p.dataset.place === s.place); });
      segs.forEach(function (sg, k) { sg.classList.toggle('is-done', k < i); });

      dNum.textContent = 'Encuentro ' + (i + 1) + ' de ' + data.length;
      dStatus.textContent = statusText(s);
      dStatus.hidden = false;
      dStatus.classList.toggle('is-next', i === nextIdx);
      dDate.textContent = DIAS[s.d.getDay()] + ' ' + s.d.getDate() + ' de ' + MESES[s.d.getMonth()];
      var virtual = s.place === 'virtual';
      dMode.textContent = virtual ? 'Virtual' : 'Presencial';
      dMode.className = 'mode mode--' + (virtual ? 'virtual' : 'presencial');
      dWhere.textContent = PLACE_NAME[s.place] + (s.time ? ' · ' + s.time : '');
      dPrev.disabled = i === 0;
      dNext.disabled = i === data.length - 1;
      if (s.date >= today) {
        dIcs.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics(s));
        dIcs.setAttribute('download', 'laboratorio-encuentro-' + (i + 1) + '.ics');
        dIcs.hidden = false;
      } else {
        dIcs.hidden = true;
      }
      detail.classList.remove('is-swap'); void detail.offsetWidth; detail.classList.add('is-swap');
      if (opts && opts.focus) s.btn.focus();
      if (!(opts && opts.silent)) travelTo(i);
    }

    stops.forEach(function (b, i) { b.addEventListener('click', function () { select(i); }); });
    document.querySelector('.timeline__stops').addEventListener('keydown', function (e) {
      var k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (e.key === 'Home') { e.preventDefault(); select(0, { focus: true }); }
      else if (e.key === 'End') { e.preventDefault(); select(data.length - 1, { focus: true }); }
      else if (k) { e.preventDefault(); select(Math.max(0, Math.min(data.length - 1, current + k)), { focus: true }); }
    });
    dPrev.addEventListener('click', function () { select(current - 1); });
    dNext.addEventListener('click', function () { select(current + 1); });

    // Tocar un lugar del mapa salta al siguiente encuentro en ese lugar
    function pickPlace(name) {
      for (var n = 1; n <= data.length; n++) {
        var j = (current + n) % data.length;
        if (data[j].place === name) { select(j); return; }
      }
    }
    places.forEach(function (p) {
      p.addEventListener('click', function () { pickPlace(p.dataset.place); });
      p.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickPlace(p.dataset.place); }
      });
    });

    // Arranca en el encuentro 1 y, al aparecer la sección, el post-it viaja hasta el próximo
    var start = nextIdx >= 0 ? nextIdx : data.length - 1;
    select(0, { silent: true });
    placeTraveler(spot.ipesfa[0], spot.ipesfa[1]);
    if (start === 0) return;
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        setTimeout(function () { if (current === 0) select(start); }, 500);
      }, { threshold: 0.45 });
      io.observe(map);
    } else {
      select(start);
    }
  }
})();
