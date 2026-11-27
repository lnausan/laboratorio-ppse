/* Bitácora del Laboratorio — contenidos.
   Cada tema de la carpeta "info" es un bloque de BITACORA.temas; cada concepto trabajado
   con el tiro al blanco es un bloque de "conceptos". Para sumar uno, copiar un bloque y completarlo.
   - alforja: lo que cada persona escribió con sus palabras (las frases largas se muestran como cita).
   - factores: lista opcional que se muestra agrupada debajo de la alforja.
   - centro / medio / extremo: dónde quedó cada palabra en el tiro al blanco.
   - afiche: foto del papel madera (en assets/bitacora/). */
window.BITACORA = {
  temas: [
    {
      id: 'conceptos',   // la sección de bitacora.html donde se muestra
      conceptos: [
        {
          id: 'politicas-socioeducativas',
          nombre: 'Políticas socioeducativas',
          nota: 'La noción que trabajamos todas y todos.',
          alforja: [
            'Gestión de recursos públicos y resolver conflictos',
            'Toma de decisiones en grupo para organizar a la sociedad',
            'Lineamientos de abordaje comunitario, educación popular, interculturalidad, género, aprendizajes diversos',
            'Conjunto de iniciativas, programas y acciones, impulsados por el estado, perspectiva social y pedagógica para garantizar derechos',
            'Propuestas de acompañamiento para el desarrollo social desde la educación, guías, programas y acciones para la transformación, articulación con poblaciones diversas',
            'Necesidad de miradas inclusivas'
          ],
          centro: ['Garantizar derechos', 'Toma de decisiones', 'Interculturalidad'],
          medio: ['Articulación', 'Pedagogía', 'Talleres, espacios de encuentro', 'Acompañamiento para el desarrollo social'],
          extremo: ['Ampliar universos culturales', 'Inclusión'],
          afiche: 'afiche-politicas-socioeducativas.jpg'
        },
        {
          id: 'territorio',
          nombre: 'Territorio',
          alforja: [
            'Tradición, cultura/identidad', 'Condicionamiento espacial', 'Ubicación geográfica', 'Contenedor de las grupalidades',
            'Soberanía', 'Sentido de pertenencia', 'Tierra, cuerpo', 'Trama simbólica', 'Derechos', 'Isla', 'Poder',
            'Acceso a la información', 'Habitar', 'Sur', 'Región', 'Recursos/Bienes naturales, sociales, culturales'
          ],
          centro: ['Sostener/Contener la grupalidad', 'Derecho internalizado', 'Ser territorio', 'Sentido de pertenencia', 'Identidad', 'Hacer/producir conocimiento; hacer territorio', 'Trama'],
          medio: ['Convivencia', 'Relaciones', 'Soberanía', 'Recursos/Bienes', 'Hospitalidad', 'Tradición/cultura'],
          extremo: ['Condicionamiento espacial', 'Ubicación geográfica', 'Región'],
          afiche: 'afiche-territorio.jpg'
        },
        {
          id: 'justicia-educativa',
          nombre: 'Justicia educativa',
          alforja: [
            'Discapacidad', 'Gratuidad', 'Oportunidad', 'Accesibilidad', 'Talleres de cultura', 'Equidad', 'Conocimiento del mundo',
            'Derechos', 'Capacitación', 'Acceso', 'Crecimiento', 'Elaboración de códigos', 'Inclusión', 'Redistribución de saberes y conocimientos'
          ],
          centro: ['Derechos', 'Equidad', 'Accesibilidad', 'Oportunidad', 'Bien Social'],
          medio: ['Formación', 'Capacitación'],
          extremo: ['Gratuidad', 'Redistribución'],
          afiche: 'afiche-justicia-educativa.jpg'
        },
        {
          id: 'equidad',
          nombre: 'Equidad',
          alforja: [
            'Cualidad de dar a cada persona lo que merece o necesita de manera justa, considerando diferencias individuales contexto y necesidades particulares, en lugar de aplicar una regla rigida e identica para todxs',
            'Accesibilidad', 'Mirada e implicancia', 'Historicidad', 'Capacitación', 'Participación'
          ],
          centro: ['Derecho', 'Participación', 'Accesibilidad', 'Diferencias'],
          medio: ['Implicancia', 'Distribución/Redistribución'],
          extremo: ['Mirada', 'Merecimiento', 'Igualdad', 'Meritocracia', 'Romantizar'],
          afiche: 'afiche-equidad.jpg'
        },
        {
          id: 'desigualdad',
          nombre: 'Desigualdad',
          alforja: [
            'Equivalente a un sesgo', 'Acceso para unos/ Imposibilidad para otros', 'Naturalización', 'Injusticia', 'Disidencias',
            'Exclusión', 'Inequidad', 'Bloqueo de posibilidad', 'Vulneración', 'Fragmentación'
          ],
          factores: [
            'Económicos', 'Políticos', 'Sociales', 'Culturales', 'Educativos', 'Ambientales', 'Laborales', 'Salud', 'Acceso a la información',
            'Expresión', 'Corporales', 'Religión', 'Género', 'Edad', 'Derechos', 'Raza', 'Etnia', 'Edilicias'
          ],
          centro: ['Bloqueo de posibilidad', 'Exclusión', 'Grupos, sujetos, comunidad'],
          medio: ['Injusticia', 'Fragmentación'],
          extremo: ['Naturalización', 'Imposibilidad', 'Prácticas'],
          afiche: 'afiche-desigualdad.jpg'
        },
        { id: 'igualdad', nombre: 'Igualdad', pendiente: true },
        { id: 'inclusion', nombre: 'Inclusión', pendiente: true }
      ],
      fotos: [
        { src: 'encuentro-1.jpg', alt: 'Los afiches de las nociones sobre el piso de la sala, con el grupo conversando sentado en ronda.' },
        { src: 'encuentro-2.jpg', alt: 'Participantes recorren y comentan los afiches con sus tiros al blanco.' },
        { src: 'encuentro-3.jpg', alt: 'Los cinco afiches con sus tiros al blanco de post-its, en el piso de la sala.' }
      ]
    },
    {
      id: 'cartografia',   // carpeta info/Cartografía- mapa Ushuaia
      /* lugares: cada espacio una sola vez, con su ubicación (lat, lon).
         aprox: true = ubicado por barrio, sin dirección confirmada.
         fuera: lugar de otra ciudad; no se muestra en el mapa sino como marca en el borde, hacia donde queda.
         Sin lat/lon = "por ubicar": se lista aparte hasta que el equipo confirme dónde queda. */
      lugares: [
        { id: 'cpc', nombre: 'CPC', detalle: 'Oficinas en el Ministerio de Educación', zona: '64 Viviendas', lat: -54.81874, lon: -68.34878, aprox: true },
        { id: 'esc34', nombre: 'Escuela N°34', zona: 'Almirante Brown', lat: -54.81506, lon: -68.33030 },
        { id: 'kauyak', nombre: 'Fundación Kau Yak', detalle: 'Intevu XV, casa 219 (Beauvoir y Wilder)', zona: 'INTEVU 15', lat: -54.80836, lon: -68.32757 },
        { id: 'cc11', nombre: 'CENT N°11', detalle: 'Gobernador Paz 1811', zona: 'Los Yaganes', lat: -54.81028, lon: -68.32672 },
        { id: 'kariamken', nombre: 'Kariamken', detalle: 'Centro de Día de Salud Mental · Concejal Rubinos del Río 153', zona: 'Gaucho Rivero', lat: -54.81836, lon: -68.33466 },
        { id: 'jardin3', nombre: 'Jardín N°3 «Mundo de Colores»', corto: 'Jardín N°3 · a 210 km', detalle: 'J. M. Estrada 2078', fuera: 'Río Grande', distancia: 'a unos 210 km por la Ruta 3', lat: -53.7877, lon: -67.7095 },
        { id: 'ccvarela', nombre: 'CC Felipe Varela', zona: 'Felipe Varela', lat: -54.81796, lon: -68.34409, aprox: true },
        { id: 'donbosco', nombre: 'Instituto Don Bosco', zona: 'Centro', lat: -54.80835, lon: -68.31070 },
        { id: 'untdf', nombre: 'UNTDF', zona: 'La Misión', lat: -54.82553, lon: -68.32824 }
      ],
      /* proyectos: 1° capa = dónde se lleva a cabo.
         La 2° capa (caracterización del grupo y el territorio) es de acceso restringido: NO va acá.
         Se publica cifrada en js/bitacora-capa2.js (ver tools/cifrar-capa2.mjs). */
      proyectos: [
        { lugares: ['cpc'] },
        { lugares: ['esc34', 'kauyak'] },
        { lugares: ['esc34', 'cc11'] },
        { lugares: ['kariamken', 'jardin3', 'cc11'] },
        { lugares: ['cc11', 'esc34', 'ccvarela'] },
        { lugares: ['donbosco', 'untdf'] }
      ],
      // capas de la cartografía: las que todavía no se trabajaron quedan anunciadas
      capas: [
        { id: 'espacios', nombre: '1° capa · Espacios' },
        { id: 'trama', nombre: 'Trama' },
        { id: 'caracterizacion', nombre: '2° capa · Grupos y territorio', restringida: true },   // se abre con la clave del equipo
        { id: 'preguntas', nombre: '3° capa · Preguntas de diagnóstico', pendiente: true }
      ]
    }
  ]
};
