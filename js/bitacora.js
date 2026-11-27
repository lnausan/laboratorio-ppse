/* Laboratorio PPSE · UNTDF — Bitácora: lo que vamos construyendo */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var data = window.BITACORA || { temas: [] };

  function h(tag, attrs, parent, text) {
    var n = document.createElement(tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function s(tag, attrs, parent) {
    var n = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function rng(seed) {
    return function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  }

  // "Lab" en coral cada vez que aparece la palabra laboratorio
  var LAB_RE = /\b(lab)(?=oratorio)/gi;
  function markLab(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || /^(SCRIPT|STYLE|TITLE)$/i.test(p.nodeName) || p.namespaceURI === SVG_NS) return NodeFilter.FILTER_REJECT;
        if (p.closest('.lab-mark, .brand__lab')) return NodeFilter.FILTER_REJECT;
        LAB_RE.lastIndex = 0;
        return LAB_RE.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var frag = document.createDocumentFragment(), text = n.nodeValue, last = 0, mt;
      LAB_RE.lastIndex = 0;
      while ((mt = LAB_RE.exec(text))) {
        if (mt.index > last) frag.appendChild(document.createTextNode(text.slice(last, mt.index)));
        h('span', { 'class': 'lab-mark' }, frag, mt[1]);
        last = mt.index + mt[1].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      n.parentNode.replaceChild(frag, n);
    });
  }

  /* ---------- Visor de fotos ---------- */
  var lb = document.getElementById('lightbox');   // solo en las páginas con fotos
  var lbImg = lb && lb.querySelector('img'), lbCap = lb && lb.querySelector('figcaption');
  var lbReturn = null;
  function openPhoto(src, caption, from) {
    lbImg.src = 'assets/bitacora/' + src;
    lbImg.alt = caption;
    lbCap.textContent = caption;
    lb.hidden = false;
    document.body.classList.add('has-lightbox');
    lbReturn = from || null;
    lb.querySelector('.lightbox__close').focus();
  }
  function closePhoto() {
    lb.hidden = true;
    document.body.classList.remove('has-lightbox');
    if (lbReturn) lbReturn.focus();
  }
  if (lb) {
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('.lightbox__close')) closePhoto(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closePhoto(); });
  }

  /* ---------- Conceptos: alforja + tiro al blanco ---------- */
  var RINGS = [
    { id: 'centro', name: 'Centro', hint: 'lo importante, en común', r: [0, 62] },
    { id: 'medio', name: 'Medio', hint: 'lo que agregaríamos', r: [62, 112] },
    { id: 'extremo', name: 'Extremo', hint: 'las tensiones', r: [112, 160] }
  ];
  var tema = data.temas.filter(function (t) { return t.id === 'conceptos'; })[0];
  var tabsEl = document.querySelector('.concepts__tabs');
  var panel = document.getElementById('concept-panel');

  if (tema && tabsEl && panel) {
    var tabs = tema.conceptos.map(function (c, i) {
      var b = h('button', { 'class': 'concepts__tab' + (c.pendiente ? ' is-pending' : ''), role: 'tab', id: 'tab-' + c.id, 'aria-controls': 'concept-panel', 'aria-selected': 'false', tabindex: '-1' }, tabsEl, c.nombre);
      b.addEventListener('click', function () { show(i, true); });
      return b;
    });
    tabsEl.addEventListener('keydown', function (e) {
      var k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!k) return;
      e.preventDefault();
      var cur = tabs.indexOf(document.activeElement);
      var next = (cur + k + tabs.length) % tabs.length;
      show(next, true); tabs[next].focus();
    });

    // diana dibujada como el afiche: papel madera, tres anillos y los post-its pegados
    function board(c, parent) {
      var svg = s('svg', { viewBox: '0 0 340 340', 'class': 'diana__board', 'aria-hidden': 'true' }, parent);
      s('rect', { x: 0, y: 0, width: 340, height: 340, rx: 34, 'class': 'diana__paper' }, svg);
      RINGS.slice().reverse().forEach(function (r) {
        s('circle', { cx: 170, cy: 170, r: r.r[1], 'class': 'diana__ring', 'data-ring': r.id }, svg);
      });
      var rand = rng(c.nombre.length * 97 + 13);
      RINGS.forEach(function (r) {
        var items = c[r.id] || [];
        var g = s('g', { 'class': 'diana__notes', 'data-ring': r.id }, svg);
        var off = rand() * Math.PI * 2;
        items.forEach(function (_, j) {
          var a = off + j * (Math.PI * 2 / items.length);
          var rad = r.id === 'centro' ? (items.length > 1 ? 30 : 0) : (r.r[0] + r.r[1]) / 2;
          var x = 170 + Math.cos(a) * rad, y = 170 + Math.sin(a) * rad;
          var n = s('rect', { x: x - 11, y: y - 11, width: 22, height: 22, 'class': 'diana__note', transform: 'rotate(' + (rand() * 30 - 15).toFixed(0) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')' }, g);
          n.style.setProperty('--d', (0.15 + j * 0.06 + RINGS.indexOf(r) * 0.2).toFixed(2) + 's');
        });
      });
      return svg;
    }

    function show(i, user) {
      var c = tema.conceptos[i];
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); t.tabIndex = j === i ? 0 : -1; });
      panel.setAttribute('aria-labelledby', 'tab-' + c.id);
      panel.innerHTML = '';
      panel.classList.remove('is-in'); void panel.offsetWidth; panel.classList.add('is-in');
      if (user && history.replaceState) history.replaceState(null, '', '#' + c.id);

      var head = h('div', { 'class': 'concept__head' }, panel);
      var ht = h('div', {}, head);
      h('h3', { 'class': 'concept__name' }, ht, c.nombre);
      if (c.nota) h('p', { 'class': 'concept__note' }, ht, c.nota);

      if (c.pendiente) {
        var p = h('div', { 'class': 'concept__pending' }, panel);
        h('p', {}, p, 'Esta noción también circuló en nuestras alforjas. Estamos terminando de sistematizarla: pronto va a estar acá.');
        return;
      }

      if (c.afiche) {
        var btn = h('button', { 'class': 'btn btn--ghost concept__afiche' }, head);
        h('span', {}, btn, 'Ver el afiche');
        var thumb = h('img', { src: 'assets/bitacora/' + c.afiche, alt: '', loading: 'lazy' }, btn);
        thumb.className = 'concept__thumb';
        btn.addEventListener('click', function () { openPhoto(c.afiche, 'Afiche de ' + c.nombre + ': las definiciones de la alforja y el tiro al blanco con post-its.', btn); });
      }

      var grid = h('div', { 'class': 'concept__grid' }, panel);

      // lo que trajimos
      var alf = h('section', { 'class': 'alforja' }, grid);
      h('h4', { 'class': 'concept__label' }, alf, 'Lo que trajimos en la alforja');
      var ul = h('ul', { 'class': 'alforja__items' }, alf);
      var rnd = rng(i * 31 + 7);
      c.alforja.forEach(function (t, j) {
        var li = h('li', { 'class': t.length > 60 ? 'alforja__quote' : 'alforja__tag' }, ul, t);
        li.style.setProperty('--r', (rnd() * 6 - 3).toFixed(1) + 'deg');
        li.style.setProperty('--d', (j * 0.03).toFixed(2) + 's');
      });
      if (c.factores) {
        h('p', { 'class': 'alforja__sub' }, alf, 'Factores');
        var fu = h('ul', { 'class': 'alforja__factores' }, alf);
        c.factores.forEach(function (t) { h('li', {}, fu, t); });
      }

      // lo que acordamos
      var dia = h('section', { 'class': 'diana' }, grid);
      h('h4', { 'class': 'concept__label' }, dia, 'Lo que acordamos en el tiro al blanco');
      var wrap = h('div', { 'class': 'diana__wrap' }, dia);
      board(c, wrap);
      var groups = h('div', { 'class': 'diana__groups' }, wrap);
      RINGS.forEach(function (r) {
        var g = h('div', { 'class': 'ring-group', 'data-ring': r.id, tabindex: '0' }, groups);
        var nm = h('p', { 'class': 'ring-group__name' }, g);
        h('i', { 'aria-hidden': 'true' }, nm);
        h('b', {}, nm, r.name);
        h('span', {}, nm, r.hint);
        var pu = h('ul', { 'class': 'ring-group__notes' }, g);
        (c[r.id] || []).forEach(function (t, j) {
          var li = h('li', {}, pu, t);
          li.style.setProperty('--r', (rnd() * 5 - 2.5).toFixed(1) + 'deg');
        });
        // señalar un grupo destaca su anillo en la diana
        function on() { wrap.dataset.focus = r.id; }
        function off() { delete wrap.dataset.focus; }
        g.addEventListener('mouseenter', on); g.addEventListener('focus', on);
        g.addEventListener('mouseleave', off); g.addEventListener('blur', off);
      });
      markLab(panel);
    }

    var fromHash = tema.conceptos.map(function (c) { return c.id; }).indexOf(location.hash.slice(1));
    show(fromHash >= 0 ? fromHash : 0, false);
    if (fromHash >= 0) setTimeout(function () { document.getElementById('concepts').scrollIntoView(); }, 0);
  }

  /* ---------- Fotos del encuentro ---------- */
  var fotosEl = document.getElementById('fotos-conceptos');
  if (tema && fotosEl) {
    tema.fotos.forEach(function (f, i) {
      var b = h('button', { 'class': 'bita-foto', 'aria-label': 'Ampliar foto: ' + f.alt }, fotosEl);
      b.style.setProperty('--r', ([-1.5, 1, -0.5][i % 3]) + 'deg');
      h('img', { src: 'assets/bitacora/' + f.src, alt: '', loading: 'lazy' }, b);
      b.addEventListener('click', function () { openPhoto(f.src, f.alt, b); });
    });
  }

  /* ---------- Cartografía: mapa real de Ushuaia con capas ---------- */
  var carto = data.temas.filter(function (t) { return t.id === 'cartografia'; })[0];
  var cartoEl = document.getElementById('carto');
  if (carto && cartoEl) buildCarto(carto, cartoEl);

  function buildCarto(T, box) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var COLORS = ['#ec6a4d', '#1f6e6a', '#8a68b4', '#d99a1e', '#3b82b4', '#4a7d4b'];
    var byId = {};
    T.lugares.forEach(function (l) { l.proyectos = []; byId[l.id] = l; });
    T.proyectos.forEach(function (p, i) {
      p.n = i + 1; p.color = COLORS[i % COLORS.length];
      p.lugares.forEach(function (id) { byId[id].proyectos.push(i); });
    });
    var located = T.lugares.filter(function (l) { return l.lat != null && !l.fuera; });
    var far = T.lugares.filter(function (l) { return l.fuera; });
    var state = { proj: -1, place: null, layers: { espacios: true, trama: true, caracterizacion: false } };
    // 2° capa: llega cifrada (js/bitacora-capa2.js) y solo se lee con la clave del equipo
    var capa2 = { open: false, asking: false, error: '', btn: null };
    var LOCK = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/></svg>';

    /* capas */
    var layersEl = box.querySelector('.carto__layers');
    T.capas.forEach(function (c) {
      var b = h('button', { 'class': 'carto__layer' + (c.pendiente ? ' is-pending' : '') + (c.restringida ? ' is-locked' : ''), 'aria-pressed': String(!c.pendiente && !c.restringida) }, layersEl);
      h('i', { 'aria-hidden': 'true' }, b);
      h('span', {}, b, c.nombre);
      if (c.pendiente) { b.disabled = true; h('em', {}, b, 'Próximamente'); return; }
      if (c.restringida) { var lk = h('span', { 'class': 'carto__lock' }, b); lk.innerHTML = LOCK; capa2.btn = b; }
      b.addEventListener('click', function () {
        if (c.restringida && !capa2.open) { askKey(); return; }
        state.layers[c.id] = !state.layers[c.id];
        b.setAttribute('aria-pressed', String(state.layers[c.id]));
        applyLayers(); renderFicha();
      });
    });

    /* proyectos */
    var projEl = box.querySelector('.carto__projects');
    var projBtns = T.proyectos.map(function (p, i) {
      var b = h('button', { 'class': 'carto__proj', 'aria-pressed': 'false', 'aria-label': 'Proyecto ' + p.n }, projEl, String(p.n));
      b.style.setProperty('--c', p.color);
      b.addEventListener('click', function () { selectProject(state.proj === i ? -1 : i); });
      return b;
    });

    /* lugares por ubicar */
    var pendEl = box.querySelector('.carto__pending-list');
    var pending = T.lugares.filter(function (l) { return l.lat == null; });
    box.querySelector('.carto__pending').hidden = !pending.length;
    pending.forEach(function (l) {
      var li = h('li', {}, pendEl);
      h('span', {}, li, l.nombre);
      l.proyectos.forEach(function (i) { var d = h('b', { title: 'Proyecto ' + (i + 1) }, li, String(i + 1)); d.style.setProperty('--c', T.proyectos[i].color); });
      l.chip = li;
    });

    /* ficha del proyecto o del lugar elegido */
    var ficha = document.getElementById('carto-ficha');
    function placeTags(parent, ids) {
      var ul = h('ul', { 'class': 'carto__places' }, parent);
      ids.forEach(function (id) {
        var l = byId[id];
        var li = h('li', { 'class': l.lat == null ? 'is-pending' : '' }, ul, l.nombre);
        if (l.lat == null) h('em', {}, li, 'por ubicar');
        else if (l.fuera) h('em', {}, li, l.fuera);
        else if (l.aprox) h('em', {}, li, 'zona aprox.');
      });
    }
    function renderFicha() {
      ficha.innerHTML = '';
      if (capa2.asking) { keyForm(); return; }
      if (state.proj >= 0) {
        var p = T.proyectos[state.proj];
        ficha.style.setProperty('--c', p.color);
        var hd = h('p', { 'class': 'carto__ficha-head' }, ficha);
        h('b', {}, hd, String(p.n));
        h('span', {}, hd, 'Proyecto ' + p.n);
        h('p', { 'class': 'carto__label' }, ficha, 'Dónde');
        placeTags(ficha, p.lugares);
        if (!capa2.open) {
          h('p', { 'class': 'carto__label' }, ficha, 'El grupo y su territorio');
          var lb = h('button', { 'class': 'carto__locked' }, ficha);
          var ic = h('span', { 'aria-hidden': 'true' }, lb); ic.innerHTML = LOCK;
          h('span', {}, lb, 'Acceso restringido · abrir con la clave del equipo');
          lb.addEventListener('click', askKey);
        } else if (state.layers.caracterizacion) {
          h('p', { 'class': 'carto__label' }, ficha, 'El grupo y su territorio');
          if (p.texto) h('p', { 'class': 'carto__text' }, ficha, p.texto);
          if (p.rasgos) {
            var ul = h('ul', { 'class': 'carto__rasgos' }, ficha);
            p.rasgos.forEach(function (r) { h('li', {}, ul, r); });
          }
        }
      } else if (state.place) {
        var l = state.place;
        ficha.style.removeProperty('--c');
        var ph = h('p', { 'class': 'carto__ficha-head carto__ficha-head--place' }, ficha);
        h('span', {}, ph, l.nombre);
        if (l.detalle) h('p', { 'class': 'carto__zona' }, ficha, l.detalle);
        if (l.zona) h('p', { 'class': 'carto__zona' }, ficha, 'Barrio ' + l.zona + (l.aprox ? ' · ubicación aproximada' : ''));
        if (l.fuera) h('p', { 'class': 'carto__zona' }, ficha, l.fuera + ' · ' + l.distancia);
        h('p', { 'class': 'carto__label' }, ficha, l.proyectos.length > 1 ? 'Acá se cruzan ' + l.proyectos.length + ' proyectos' : 'Proyecto');
        var pl = h('div', { 'class': 'carto__projects carto__projects--mini' }, ficha);
        l.proyectos.forEach(function (i) {
          var b = h('button', { 'class': 'carto__proj', 'aria-label': 'Ver proyecto ' + (i + 1) }, pl, String(i + 1));
          b.style.setProperty('--c', T.proyectos[i].color);
          b.addEventListener('click', function () { selectProject(i); });
        });
      } else {
        ficha.style.removeProperty('--c');
        h('p', { 'class': 'carto__hint' }, ficha, 'Elegí un proyecto para ver dónde trabaja y cómo son su grupo y su territorio, o tocá un lugar del mapa para ver qué proyectos se cruzan ahí.');
      }
    }

    /* 2° capa: pedir la clave, descifrar y volver a cerrar */
    function askKey() { capa2.asking = true; capa2.error = ''; renderFicha(); }
    function keyForm() {
      ficha.style.removeProperty('--c');
      var f = h('form', { 'class': 'carto__key' }, ficha);
      var hd = h('p', { 'class': 'carto__ficha-head carto__ficha-head--place' }, f);
      var ic = h('span', { 'class': 'carto__key-ico', 'aria-hidden': 'true' }, hd); ic.innerHTML = LOCK;
      h('span', {}, hd, '2° capa · acceso restringido');
      h('p', { 'class': 'carto__text' }, f, 'La caracterización de los grupos y sus territorios reúne información sensible. Está disponible para el equipo del Laboratorio.');
      var lab = h('label', { 'for': 'carto-key' }, f, 'Clave del equipo');
      lab.className = 'carto__label';
      var inp = h('input', { id: 'carto-key', type: 'password', autocomplete: 'current-password', required: '' }, f);
      if (capa2.error) h('p', { 'class': 'carto__key-error', role: 'alert' }, f, capa2.error);
      var row = h('div', { 'class': 'carto__key-actions' }, f);
      h('button', { type: 'submit', 'class': 'btn btn--teal' }, row, 'Abrir capa');
      var cancel = h('button', { type: 'button', 'class': 'carto__key-cancel' }, row, 'Cancelar');
      cancel.addEventListener('click', function () { capa2.asking = false; renderFicha(); });
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        unlock(inp.value).then(function (ok) {
          if (ok) { capa2.asking = false; try { sessionStorage.setItem('capa2', inp.value); } catch (err) {} }
          else capa2.error = 'La clave no es correcta.';
          renderFicha();
        });
      });
      inp.focus();
    }
    function unlock(pass) {
      var C = window.BITACORA_CAPA2, sub = window.crypto && window.crypto.subtle;
      pass = (pass || '').trim().toLowerCase();   // la clave no distingue mayúsculas ni espacios de más
      if (!C || !sub || !pass) return Promise.resolve(false);
      var bytes = function (b64) { return Uint8Array.from(atob(b64), function (ch) { return ch.charCodeAt(0); }); };
      return sub.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey'])
        .then(function (base) {
          return sub.deriveKey({ name: 'PBKDF2', salt: bytes(C.salt), iterations: C.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
        })
        .then(function (key) { return sub.decrypt({ name: 'AES-GCM', iv: bytes(C.iv) }, key, bytes(C.data)); })
        .then(function (buf) {
          JSON.parse(new TextDecoder().decode(buf)).forEach(function (d, i) {
            if (T.proyectos[i]) { T.proyectos[i].texto = d.texto; T.proyectos[i].rasgos = d.rasgos; }
          });
          capa2.open = true; state.layers.caracterizacion = true;
          if (capa2.btn) { capa2.btn.classList.remove('is-locked'); capa2.btn.setAttribute('aria-pressed', 'true'); }
          return true;
        })
        .catch(function () { return false; });
    }
    var saved = null;
    try { saved = sessionStorage.getItem('capa2'); } catch (err) {}
    if (saved) unlock(saved).then(function (ok) { if (ok) renderFicha(); });

    /* mapa */
    var mapEl = document.getElementById('carto-map');
    var map = null, markers = [];
    if (!window.maplibregl) { box.querySelector('.carto__fallback').hidden = false; renderFicha(); return; }

    // la trama se dibuja con curvas suaves, como el recorrido del cronograma
    function arc(a, b, side) {
      var mx = (a.lon + b.lon) / 2, my = (a.lat + b.lat) / 2;
      var dx = b.lon - a.lon, dy = b.lat - a.lat;
      var cx = mx - dy * 0.25 * side, cy = my + dx * 0.25 * side, out = [];
      for (var t = 0; t <= 1.0001; t += 0.05) {
        var u = 1 - t;
        out.push([u * u * a.lon + 2 * u * t * cx + t * t * b.lon, u * u * a.lat + 2 * u * t * cy + t * t * b.lat]);
      }
      return out;
    }
    var tramaData = { type: 'FeatureCollection', features: [] };
    T.proyectos.forEach(function (p, i) {
      var all = p.lugares.map(function (id) { return byId[id]; });
      var pts = all.filter(function (l) { return l.lat != null && !l.fuera; });
      function link(a, b) {
        tramaData.features.push({ type: 'Feature', properties: { p: i, color: p.color },
          geometry: { type: 'LineString', coordinates: arc(a, b, i % 2 ? 1 : -1) } });
      }
      for (var k = 1; k < pts.length; k++) link(pts[k - 1], pts[k]);
      // los lugares de otra ciudad: la trama sale del mapa hacia donde quedan
      if (pts.length) all.filter(function (l) { return l.fuera; }).forEach(function (l) { link(pts[0], l); });
    });

    var FONT = ['Noto Sans Regular'], FONT_B = ['Noto Sans Bold'];
    var style = {
      version: 8,
      glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
      sources: {
        omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet',
          attribution: '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>' },
        trama: { type: 'geojson', data: tramaData }
      },
      layers: [
        { id: 'tierra', type: 'background', paint: { 'background-color': '#efe4c8' } },
        { id: 'barrios', type: 'fill', source: 'omt', 'source-layer': 'landuse', filter: ['in', ['get', 'class'], ['literal', ['residential', 'suburb', 'neighbourhood']]], paint: { 'fill-color': '#e9dcbc' } },
        { id: 'bosque', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['==', ['get', 'class'], 'wood'], paint: { 'fill-color': '#a9c79a', 'fill-opacity': 0.75 } },
        { id: 'pasto', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['in', ['get', 'class'], ['literal', ['grass', 'wetland']]], paint: { 'fill-color': '#d3e2b4', 'fill-opacity': 0.7 } },
        { id: 'hielo', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['==', ['get', 'class'], 'ice'], paint: { 'fill-color': '#ffffff' } },
        { id: 'roca', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['==', ['get', 'class'], 'rock'], paint: { 'fill-color': '#d9cdee', 'fill-opacity': 0.6 } },
        { id: 'parques', type: 'fill', source: 'omt', 'source-layer': 'park', paint: { 'fill-color': '#b9d38a', 'fill-opacity': 0.45 } },
        { id: 'agua', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': '#3b82b4' } },
        { id: 'rios', type: 'line', source: 'omt', 'source-layer': 'waterway', paint: { 'line-color': '#3b82b4', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 16, 3] } },
        { id: 'edificios', type: 'fill', source: 'omt', 'source-layer': 'building', minzoom: 14, paint: { 'fill-color': '#ddd0b1', 'fill-outline-color': '#cbbd9b' } },
        { id: 'calles-menores', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['minor', 'service', 'track']]],
          layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 0.6, 15, 4, 18, 16] } },
        { id: 'calles-borde', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary', 'trunk', 'motorway']]],
          layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#c9b98f', 'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 2.2, 15, 8, 18, 26] } },
        { id: 'calles', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary', 'trunk', 'motorway']]],
          layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 1.4, 15, 6, 18, 22] } },
        { id: 'senderos', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'path'], minzoom: 14,
          paint: { 'line-color': '#8a7f66', 'line-width': 1, 'line-dasharray': [2, 2] } },
        { id: 'trama', type: 'line', source: 'trama', layout: { 'line-cap': 'round' },
          paint: { 'line-color': ['get', 'color'], 'line-width': 4, 'line-dasharray': [1.2, 1.6], 'line-opacity': 0.85 } },
        { id: 'nombres-calles', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 14.5,
          layout: { 'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': FONT, 'text-size': 11 },
          paint: { 'text-color': '#6f716d', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } },
        { id: 'nombres-agua', type: 'symbol', source: 'omt', 'source-layer': 'water_name',
          layout: { 'text-field': ['get', 'name'], 'text-font': FONT, 'text-size': 13, 'text-letter-spacing': 0.2, 'text-transform': 'uppercase' },
          paint: { 'text-color': 'rgba(255,255,255,.85)' } },
        { id: 'nombres-barrios', type: 'symbol', source: 'omt', 'source-layer': 'place', filter: ['in', ['get', 'class'], ['literal', ['suburb', 'neighbourhood', 'quarter']]], minzoom: 13,
          layout: { 'text-field': ['get', 'name'], 'text-font': FONT, 'text-size': 11, 'text-letter-spacing': 0.12, 'text-transform': 'uppercase', 'text-max-width': 8 },
          paint: { 'text-color': '#8b7f63', 'text-halo-color': '#efe4c8', 'text-halo-width': 1.5 } },
        { id: 'nombres-ciudad', type: 'symbol', source: 'omt', 'source-layer': 'place', filter: ['in', ['get', 'class'], ['literal', ['city', 'town']]],
          layout: { 'text-field': ['get', 'name'], 'text-font': FONT_B, 'text-size': 16 },
          paint: { 'text-color': '#2c2e2a', 'text-halo-color': '#efe4c8', 'text-halo-width': 2 } }
      ]
    };

    var bounds = new maplibregl.LngLatBounds();
    located.forEach(function (l) { bounds.extend([l.lon, l.lat]); });
    var PAD = { top: 140, bottom: 50, left: 60, right: 60 };
    try {
      map = new maplibregl.Map({
        container: mapEl, style: style, bounds: bounds, fitBoundsOptions: { padding: PAD, maxZoom: 15 },
        maxBounds: [[-68.62, -54.92], [-68.05, -54.70]], minZoom: 11, maxZoom: 18,
        cooperativeGestures: true, attributionControl: false, dragRotate: false, pitchWithRotate: false, touchPitch: false
      });
    } catch (e) { box.querySelector('.carto__fallback').hidden = false; renderFicha(); return; }
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
    if (map.touchZoomRotate) map.touchZoomRotate.disableRotation();
    map.on('error', function (e) { if (e && e.sourceId === 'omt' && !map.isStyleLoaded()) box.querySelector('.carto__fallback').hidden = false; });

    // pines: el tamaño crece con la cantidad de proyectos que se cruzan en el lugar
    located.forEach(function (l) {
      var el = h('button', { 'class': 'carto-pin' + (l.aprox ? ' is-aprox' : ''), 'aria-label': l.nombre + ': ' + l.proyectos.length + (l.proyectos.length > 1 ? ' proyectos' : ' proyecto') });
      el.style.setProperty('--s', (1 + (l.proyectos.length - 1) * 0.18).toFixed(2));
      var pin = h('span', { 'class': 'carto-pin__pin', 'aria-hidden': 'true' }, el);
      var dots = h('span', { 'class': 'carto-pin__dots' }, pin);
      l.proyectos.forEach(function (i) { var d = h('i', {}, dots); d.style.background = T.proyectos[i].color; });
      h('span', { 'class': 'carto-pin__name' }, el, l.nombre);
      el.addEventListener('click', function (e) { e.stopPropagation(); selectPlace(l); });
      l.marker = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([l.lon, l.lat]).addTo(map);
      l.el = el;
      markers.push(l);
    });

    // lugares de otra ciudad: un cartel en el borde del mapa, del lado donde quedan
    far.forEach(function (l) {
      var el = h('button', { 'class': 'carto-far', 'aria-label': l.nombre + ', en ' + l.fuera + ', ' + l.distancia }, mapEl.parentNode);
      var ar = h('span', { 'class': 'carto-far__arrow', 'aria-hidden': 'true' }, el);
      ar.innerHTML = '<svg class="ico"><use href="#i-arrow"/></svg>';
      var tx = h('span', { 'class': 'carto-far__text' }, el);
      h('b', {}, tx, l.fuera);
      h('span', {}, tx, l.corto || l.nombre);
      var dots = h('span', { 'class': 'carto-far__dots', 'aria-hidden': 'true' }, el);
      l.proyectos.forEach(function (i) { var d = h('i', {}, dots); d.style.background = T.proyectos[i].color; });
      el.addEventListener('click', function () { selectPlace(l); });
      // al desplegarse cambia de tamaño: se vuelve a apoyar en el borde
      ['mouseenter', 'mouseleave', 'focus', 'blur'].forEach(function (ev) { el.addEventListener(ev, function () { placeFar(); }); });
      l.el = el; l.arrow = ar.firstChild;
      markers.push(l);
    });
    // el cartel se apoya en el borde del mapa, sobre la línea que va del centro hacia la otra ciudad
    function placeFar() {
      var W = mapEl.clientWidth, H = mapEl.clientHeight, M = 14;
      far.forEach(function (l) {
        var bw = l.el.offsetWidth, bh = l.el.offsetHeight;
        var p = map.project([l.lon, l.lat]), cx = W / 2, cy = H / 2;
        var dx = p.x - cx, dy = p.y - cy;
        var k = Math.min(Math.abs((W / 2 - bw / 2 - M) / (dx || 1e-6)), Math.abs((H / 2 - bh / 2 - M) / (dy || 1e-6)));
        l.el.style.left = (cx + dx * k - bw / 2) + 'px';
        l.el.style.top = (cy + dy * k - bh / 2) + 'px';
        l.arrow.style.transform = 'rotate(' + (Math.atan2(dy, dx) * 180 / Math.PI).toFixed(0) + 'deg)';
      });
    }
    // si dos nombres se pisan, se oculta el del lugar con menos proyectos (el elegido siempre se ve)
    function declutter() {
      var taken = far.map(function (l) { return l.el.getBoundingClientRect(); });
      markers.filter(function (l) { return !l.fuera; })
        .sort(function (a, b) { return (b.el.classList.contains('is-on') - a.el.classList.contains('is-on')) || (b.proyectos.length - a.proyectos.length); })
        .forEach(function (l) {
          var name = l.el.querySelector('.carto-pin__name');
          l.el.classList.remove('is-quiet');
          var r = name.getBoundingClientRect(), g = 3;
          var hit = taken.some(function (t) { return r.left + g < t.right && r.right - g > t.left && r.top + g < t.bottom && r.bottom - g > t.top; });
          if (hit && !l.el.classList.contains('is-on')) l.el.classList.add('is-quiet');
          else taken.push(r);
        });
    }
    map.on('move', placeFar);
    map.on('moveend', declutter);

    function go(b, maxZoom) {
      var opts = { padding: PAD, maxZoom: maxZoom || 15.5, duration: reduce ? 0 : 900 };
      map.fitBounds(b, opts);
    }
    function applyLayers() {
      markers.forEach(function (l) { l.el.hidden = !state.layers.espacios; });
      if (map.getLayer('trama')) map.setLayoutProperty('trama', 'visibility', state.layers.trama ? 'visible' : 'none');
    }
    function highlight() {
      var p = state.proj;
      projBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === p)); });
      markers.forEach(function (l) {
        var on = p >= 0 ? l.proyectos.indexOf(p) >= 0 : state.place ? l === state.place : true;
        l.el.classList.toggle('is-dim', !on);
        l.el.classList.toggle('is-on', (p >= 0 && on) || l === state.place);
      });
      T.lugares.forEach(function (l) { if (l.chip) l.chip.classList.toggle('is-on', p >= 0 && l.proyectos.indexOf(p) >= 0); });
      placeFar();
      declutter();
      if (map.getLayer('trama')) {
        map.setPaintProperty('trama', 'line-opacity', p >= 0 ? ['case', ['==', ['get', 'p'], p], 1, 0.12] : 0.85);
        map.setPaintProperty('trama', 'line-width', p >= 0 ? ['case', ['==', ['get', 'p'], p], 6, 3] : 4);
      }
    }
    function selectProject(i) {
      state.proj = i; state.place = null;
      highlight(); renderFicha();
      if (i < 0) { go(bounds, 15); return; }
      var b = new maplibregl.LngLatBounds();
      T.proyectos[i].lugares.forEach(function (id) { var l = byId[id]; if (l.lat != null && !l.fuera) b.extend([l.lon, l.lat]); });
      if (!b.isEmpty()) go(b, 15.5);
    }
    function selectPlace(l) {
      state.place = state.place === l ? null : l; state.proj = -1;
      highlight(); renderFicha();
      if (state.place && !l.fuera) map.easeTo({ center: [l.lon, l.lat], zoom: Math.max(map.getZoom(), 14.5), duration: reduce ? 0 : 700 });
    }
    map.on('click', function () { if (state.place || state.proj >= 0) { state.place = null; state.proj = -1; highlight(); renderFicha(); } });
    map.on('load', function () { applyLayers(); placeFar(); highlight(); });
    renderFicha();
  }

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var links = document.getElementById('nav-links');
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });

  // Si el menú no entra en una línea (zoom, tipografía, ancho), primero se ocultan los logos
  // (siguen en el pie) y, si tampoco alcanza, pasa a desplegable.
  var navEl = document.querySelector('.nav');
  function fitNav() {
    var fits = function () { return navEl.scrollWidth <= navEl.clientWidth + 1; };
    navEl.classList.remove('is-tight', 'is-menu');
    if (fits()) return;
    navEl.classList.add('is-tight');
    if (fits()) return;
    navEl.classList.remove('is-tight'); navEl.classList.add('is-menu');
    if (fits()) return;
    navEl.classList.add('is-tight');
  }
  var fitQueued = false;
  window.addEventListener('resize', function () {
    if (fitQueued) return;
    fitQueued = true;
    requestAnimationFrame(function () { fitQueued = false; fitNav(); });
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNav);
  fitNav();

  markLab(document.body);
})();
