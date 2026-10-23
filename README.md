# Laboratorio de Gestión de Programas y Proyectos Socioeducativos — Web

Página 1 (landing) del proyecto de extensión IEC · UNTDF, noviembre–diciembre 2026.

Sitio estático, sin dependencias ni build: abrir `index.html` en el navegador
(o en Cursor, con la extensión *Live Server* o `npx serve .`).

```
web/
├── index.html        estructura y contenido (textos de "Página 1.docx")
├── css/styles.css    estilos; todos los colores y tamaños están en :root
├── js/main.js        construye el paisaje y mueve la "cámara" por el mapa al hacer scroll
├── assets/flyer.jpg  ilustración del flyer
└── v1/               primera versión (estática), para comparar
```

## Cómo funciona el descenso

- `.journey` contiene un `.stage` fijo (sticky) con el mapa ilustrado (`.world`, SVG de 1440×3600)
  y, por encima, el contenido en "capítulos" (`.chapter`): cielo, montaña, bosque, ciudad, costa, canal.
- `main.js` traduce el avance del scroll a una posición de cámara sobre el mapa (con suavizado).
- Capas con `data-depth` se mueven más lento (parallax): sol, nubes, cordón trasero.
- Todo lo que tiene clase `.pop` y `data-y` se "despliega" como libro pop-up cuando entra desde abajo
  y se pliega al volver a subir.
- El camino punteado se define con los puntos `routePts` en `main.js`; el pin coral lo recorre.
- Respeta `prefers-reduced-motion`: sin suavizado ni animaciones automáticas.

## Cronograma

- Las fechas salen de los botones `.stop` en `index.html` (`data-date`, `data-place`, `data-time`): para cambiar un encuentro se edita ahí.
- `main.js` dibuja las casas, pinos y el mar del mapa, y el recorrido 1 → 6 (`curves`); el post-it amarillo viaja por ese recorrido.
- Según la fecha de hoy marca los encuentros realizados (✓), el próximo y los días que faltan; arranca mostrando el próximo.
- "Agendar" descarga un `.ics` (presenciales 18–21 h hora de Ushuaia; virtuales como día completo, porque no tienen horario).

## Estilo

- Base "MindMarket": lienzo crema `#f5f1e4`, Inter gigante con tracking negativo,
  cards blancas con radio 50px, nav en píldora flotante, sin sombras.
- Paleta tomada del flyer: petróleo (acento estructural), coral (acción),
  mostaza, lila/violeta, azul canal.
- Efecto inspirado en "Karl": escenas ilustradas a pantalla completa, capas a distinta
  velocidad, piezas que se levantan como libro pop-up, texto como cartelería.
- Recorrido de arriba hacia abajo como Ushuaia: cielo → Martial / Monte Olivia / Cinco Hermanos
  → bosque y Laguna Esmeralda → ciudad (IPESfa, UNTDF) → puerto → canal Beagle y faro.

## Contenido

Por ahora todos los textos salen de `Página 1.docx`. El contacto del footer (Jessica Rodriguez, jmrodriguez@untdf.edu.ar) sale de la Plantilla del Proyecto de Extensión.

## Pendientes para confirmar con el equipo

- [ ] Horario del 26/11: en Página 1 dice "1 a 21hs" → se puso 18 a 21 h.
- [ ] Horario de los encuentros virtuales (Página 1 no lo indica; no se muestra).
- [ ] Ubicación de IPESfa y UNTDF en el mapa: es ilustrativa, no geográfica.
- [ ] Logos: UNTDF·IEC e IPESfa ya están (PNG de baja resolución; idealmente SVG). Falta Secretaría de Extensión.
- [ ] ¿Se sigue inscribiendo? (la inscripción del proyecto cerraba el 15/10).
- [ ] Encuesta inicial: link a formulario o integrada.
