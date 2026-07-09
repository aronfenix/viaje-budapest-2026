/* ============================================================
   BUDAPEST 26 · Álvaro & Juan — el finde
   Fiabilidad: 'ok' confirmado · 'ver' verificar · 'sug' sugerencia
   Verificado online: 8 de julio de 2026.
   ============================================================ */

const DATA = {

  viaje: {
    ciudad: "Budapest",
    magiar: "BUDAPEST",
    viajeros: ["Álvaro", "Juan"],
    inicio: "2026-07-31",   // viernes mediodía
    fin: "2026-08-03",      // lunes mediodía
    alojamiento: {
      nombre: "NH Collection Budapest City Center",
      direccion: "Osvát utca 2-8, 1073 Budapest",
      coords: [47.4975, 19.0695], coordsAprox: true,
      zona: "Borde del distrito VII (Erzsébetváros), junto a Blaha Lujza tér. Traducción: dormís DENTRO del barrio de los bares. El New York Café está a 3 minutos; Szimpla, a 10.",
    },
    moneda: { codigo: "HUF", nombre: "forinto húngaro", cambioAprox: "1 € ≈ 395 HUF", fiab: "ver" },
    hermana: { nombre: "БЕОГРАД 26", url: "https://aronfenix.github.io/viaje-belgrado-2026/" },
    prologo: {
      titulo: "Prólogo",
      texto: "Belgrado os avisó en una de sus cartas: su prima del norte es más guapa y se conservó mejor. Es verdad y no pasa nada — Budapest es la ciudad-espectáculo del Danubio, un decorado imperial construido para impresionar, y a la tercera cúpula dorada dejaréis de haceros los dignos.\n\nPero este finde no va de palacios. Va de tres noches con Juan en el distrito exacto donde Budapest esconde a sus primos del Wurlitzer: sótanos punk, patios en ruinas, cerveza a dos euros y conciertos entre paredes llenas de pegatinas. De día, los must sin prisa; de noche, lo vuestro. Tres días y medio bien jugados dan para mucho más de lo que parece.",
      firma: "— La guía, que ya os conoce"
    },
  },

  /* ---------- AGENDA: el finde, día a día ---------- */
  agenda: [
    {
      fecha: "2026-07-31", nombre: "Viernes · llegada",
      dia: [
        "Llegada a mediodía. Check-in en Osvát utca, y ya estáis en el VII: primera toma de contacto sin plan por el barrio judío (Dob utca, Kazinczy utca).",
        "💡 Tarde suave: paseo hasta el Danubio por Andrássy o Wesselényi, primera vista del Parlamento desde el puente. Guardaos los museos: el finde es corto y la calle es mejor.",
      ],
      noche: [
        "🌟 LA JUGADA GRANDE: baño nocturno en Rudas (viernes 22:00–03:00, ≈15.000 HUF, SOLO online). Jacuzzi en la azotea con el Danubio iluminado a los pies. Si Juan llega con energía, no hay mejor bienvenida del mundo.",
        "Plan B (o después, que Rudas suelta a las 3): primera ronda de reconocimiento — Fekete Kutya o Kisüzem, a 8 min del hotel.",
      ],
    },
    {
      fecha: "2026-08-01", nombre: "Sábado · el grande",
      dia: [
        "Mañana de musts con fresco: Parlamento (si conseguisteis reserva), Zapatos del Danubio y Basílica. Todo seguido a pie por la orilla.",
        "Mercado Central antes de las 15:00 (los sábados cierra pronto): lángos arriba y paprika para casa.",
        "💡 Tarde: cruzar el Puente de las Cadenas y subir al Bastión de los Pescadores hacia el atardecer — la postal de Budapest con la mejor luz.",
      ],
      noche: [
        "El VII a fondo: Szimpla pronto (a las 19-20 se puede; a medianoche es un parque de atracciones), cena en Karaván al lado, y de ahí a lo vuestro: Vittula → Robot (mismo eje Akácfa-Kertész).",
        "♪ Alternativa cartel: Moby en Budapest Park (verificar entradas).",
      ],
    },
    {
      fecha: "2026-08-02", nombre: "Domingo · el bueno",
      dia: [
        "Mañana termal: Széchenyi (llegar ANTES de las 10 o después de las 16; el mediodía de domingo es sopa de gente). Combinable con Plaza de los Héroes y Andrássy de vuelta.",
        "💡 Ojo: el Mercado Central cierra los domingos. Comida alternativa: Gettó Gulyás (reservad) o Bors GasztroBár.",
      ],
      noche: [
        "♪ Domingo con cartel del rollo correcto: Patriarchy en ROBOT — concierto en vuestro club de cabecera a 10 min del hotel. Difícil pedirle más a un domingo.",
        "Cierre tranquilo: Csak a jó sör para una última cerveza seria, o el kej del Danubio si el cuerpo pide paseo.",
      ],
    },
    {
      fecha: "2026-08-03", nombre: "Lunes · media jornada",
      dia: [
        "Mañana de remate: lo que quedara pendiente — desayuno lento en el New York Café (a 3 min del hotel; id ANTES de las 10 o la cola os come la mañana), última vuelta por el barrio, compras de última hora.",
        "Check-out y a mediodía, fin del finde. Se acabó lo que se daba.",
      ],
      noche: [],
    },
  ],

  eventos: [
    { fecha: "2026-07-31", nombre: "Ásgeir", lugar: "A38 (el barco)", genero: "Indie-folk", fiab: "ver", fuente: "Songkick, 8-jul" },
    { fecha: "2026-07-31", nombre: "Budapest Play (música callejera)", lugar: "plazas del centro", genero: "Festival urbano", fiab: "ver" },
    { fecha: "2026-08-01", nombre: "MOBY", lugar: "Budapest Park", genero: "Electrónica", fiab: "ver", fuente: "Songkick, 8-jul" },
    { fecha: "2026-08-02", nombre: "Patriarchy", lugar: "ROBOT", genero: "Dark rock/industrial", fiab: "ver", fuente: "Songkick, 8-jul" },
  ],
  eventosNota: "Cartel localizado en agregadores a 8-jul-2026 — verificar entradas y horarios esa semana. La programación pequeña de los garitos sale con días de antelación en sus Instagram.",

  /* ---------- MUSTS ---------- */
  sitios: [
    {
      id: "parlamento", nombre: "Parlamento húngaro", zona: "Kossuth tér",
      coords: [47.5076, 19.0455], dur: "1 h (visita guiada)", precio: "7.000 HUF (adultos UE) · reservar en jegymester.hu/parlament",
      horario: { 1: [8, 16], 2: [8, 16], 3: [8, 16], 4: [8, 16], 5: [8, 16], 6: [8, 16], 7: [8, 16] },
      desc: "El edificio-espectáculo del Danubio: neogótico desmesurado, 691 salas, la Santa Corona custodiada por guardias con sable. La visita guiada (hay en español algunos horarios) es de las que justifican madrugar.",
      consejo: "⚠ SE AGOTA con 2-4 semanas de antelación en verano. Reservad HOY para el sábado 1. Si no hay, la vista desde fuera —y desde el tranvía 2— sigue siendo el mejor gratis de Europa.",
      fiab: "ok", fuente: "parlament.hu · ver. 8-jul-2026"
    },
    {
      id: "bastion", nombre: "Bastión de los Pescadores + Matthias", zona: "Colina del Castillo (Buda)",
      coords: [47.5022, 19.0348], dur: "1.5 h con paseo", precio: "Terrazas altas ≈1.500 HUF; el resto, gratis",
      horario: null, siempre: "Abierto siempre; las terrazas de pago, ~9:00–20:00.",
      desc: "La postal absoluta: torretas blancas de cuento mirando al Parlamento sobre el río, con la iglesia de Matthias de tejas de colores al lado. Sí, hay gente. La luz de última hora lo arregla todo.",
      consejo: "Subid al atardecer del sábado. El bus 16 o el funicular ahorran la cuesta; bajar andando por las callejuelas del Castillo es la mitad del plan.",
      fiab: "ver"
    },
    {
      id: "basilica", nombre: "Basílica de San Esteban", zona: "Pest centro",
      coords: [47.5009, 19.054], dur: "45 min (+mirador)", precio: "Donativo/entrada ≈1.200–2.300 HUF; cúpula aparte",
      horario: { 1: [9, 17.75], 2: [9, 17.75], 3: [9, 17.75], 4: [9, 17.75], 5: [9, 17.75], 6: [9, 17.75], 7: [13, 17.75] },
      desc: "La cúpula que os saludará desde media ciudad (96 metros exactos, como el Parlamento: empate patriótico deliberado). El mirador de la cúpula da la mejor panorámica del lado Pest.",
      fiab: "ver", fuente: "Horarios orientativos; domingo abre tras las misas"
    },
    {
      id: "cadenas", nombre: "Puente de las Cadenas", zona: "Danubio",
      coords: [47.4989, 19.0437], dur: "El cruce: 15 min que se vuelven 40", precio: "Gratis",
      horario: null, siempre: "Siempre. De noche, iluminado, es otro edificio.",
      desc: "El primer puente permanente entre Buda y Pest (1849) y todavía el más elegante. Cruzarlo a pie al anochecer, con el Castillo iluminándose delante, es el momento más barato y más caro de Budapest a la vez.",
      fiab: "ok"
    },
    {
      id: "zapatos", nombre: "Zapatos a la orilla del Danubio", zona: "Entre Parlamento y P. Cadenas",
      coords: [47.5039, 19.045], dur: "15 min", precio: "Gratis",
      horario: null, siempre: "Siempre.",
      desc: "Sesenta pares de zapatos de hierro en el borde del muelle: el memorial a los judíos fusilados al río en 1944-45 por los milicianos flechacruzistas. Sobrio, durísimo y necesario. Se pasa por delante camino del Parlamento: parad.",
      fiab: "ok"
    },
    {
      id: "mercado", nombre: "Mercado Central (Nagyvásárcsarnok)", zona: "Fővám tér",
      coords: [47.487, 19.0587], dur: "1 h", precio: "Gratis entrar",
      horario: { 1: [6, 17], 2: [6, 18], 3: [6, 18], 4: [6, 18], 5: [6, 18], 6: [6, 15], 7: null },
      desc: "La catedral del paprika: hierro y azulejos de 1897, abajo puestos de verdad, arriba lángos y souvenirs comestibles. Turístico y auténtico en proporción aceptable.",
      consejo: "⚠ Domingo CIERRA y el sábado echa el cierre a las 15:00 — os toca el sábado por la mañana o nada.",
      fiab: "ver", fuente: "Horario habitual del mercado"
    },
    {
      id: "szechenyi", nombre: "Balneario Széchenyi", zona: "Parque de la Ciudad",
      coords: [47.5186, 19.081], dur: "2–3 h", precio: "≈13.500 HUF (finde) · con taquilla",
      horario: { 1: [7, 19], 2: [7, 19], 3: [7, 19], 4: [7, 19], 5: [7, 20], 6: [7, 20], 7: [7, 19] },
      desc: "El palacio amarillo de las termas: 15+ piscinas, vapor, viejos jugando al ajedrez en el agua a 38°. Es EL cliché de Budapest y funciona exactamente como prometen.",
      consejo: "Domingo por la mañana temprano (antes de las 10) o media tarde. Llevad chanclas y bañador; la toalla se alquila. M1 hasta Széchenyi fürdő.",
      fiab: "ok", fuente: "szechenyibath.hu · ver. 8-jul-2026"
    },
    {
      id: "rudas", nombre: "Rudas · baño nocturno del viernes", zona: "Pie del Gellért (Buda)",
      coords: [47.489, 19.047], dur: "2–3 h (22:00–03:00)", precio: "≈15.000 HUF · SOLO online",
      horario: null, soloDias: "Baño nocturno: viernes (y sábados) 22:00–03:00.",
      desc: "Cúpula otomana de 1550 por dentro, jacuzzi panorámico en la azotea por fuera: el Danubio y el Parlamento iluminados mientras estáis en remojo a medianoche. La mejor primera noche posible de un finde de colegas.",
      consejo: "⚠ Las plazas del viernes noche vuelan: reservad online YA en rudasfurdo.hu para el 31.",
      fiab: "ok", fuente: "rudasfurdo.hu + bathsbudapest · ver. 8-jul-2026"
    },
    {
      id: "heroes", nombre: "Plaza de los Héroes + Andrássy", zona: "Fin de Andrássy",
      coords: [47.515, 19.077], dur: "45 min + paseo", precio: "Gratis",
      horario: null, siempre: "Siempre.",
      desc: "El desfile de magiares a caballo del milenio húngaro (1896, ese año otra vez) cerrando la avenida más elegante de la ciudad. Combina natural con Széchenyi, que está detrás.",
      fiab: "ok"
    },
    {
      id: "newyork", nombre: "New York Café", zona: "A 3 min de vuestro hotel",
      coords: [47.4984, 19.0705], dur: "1 h (más la cola)", precio: "Café ≈2.500 HUF — pagáis el techo",
      horario: null, siempre: "A diario, aprox. 8:00–24:00.",
      desc: "«El café más bonito del mundo» según ellos mismos, y la verdad es que el barroco dorado con frescos les da la razón. Dormís al lado: eso os da la ventaja de ir a primera hora del lunes, cuando abre y no hay nadie.",
      consejo: "Desayuno del lunes, 8:00 en punto. Es caro para ser café y barato para ser palacio.",
      fiab: "ver"
    },
  ],

  /* ---------- LA NOCHE (el corazón de esta guía) ---------- */
  noche: {
    intro: "Vuestro encargo era claro: primos del Wurlitzer. Buenas noticias — Budapest tiene la familia entera, casi toda en el distrito VII donde dormís: sótanos punk con pegatinas hasta el techo, patios en ruinas, cerveza a 800-1.500 HUF (2-4 €) y conciertos de garaje. Verificado a 8-jul-2026: todos vivos.",
    bloques: [
      {
        titulo: "Los primos del Wurlitzer 🎸",
        texto: "La familia directa: garitos oscuros, música alta, cero postureo, gente del rollo. Todos a 5-12 min andando del hotel.",
        sitios: [
          { nombre: "ROBOT", zona: "Akácfa u. · 8 min", coords: [47.5, 19.066], nota: "El primo hermano: club de rock/alternativo con conciertos, en el complejo de Akácfa. El domingo 2 tocan Patriarchy — vuestro concierto del finde, a 10 minutos de la cama.", fiab: "ver", fuente: "Cartel Songkick 8-jul" },
          { nombre: "Vittula", zona: "Kertész u. 4 · 9 min", coords: [47.499, 19.0655], nota: "El sótano legendario del underground: escaleras abajo, punk-rock, garaje y cero decoración que no sea historia acumulada. Si el Wurlitzer tuviera Erasmus en Budapest, viviría aquí.", testimonio: { cita: "Quintaesencia del bar underground: decoración ecléctica y alma punk. Sigue siendo el de siempre.", fuente: "Reseñas locales, mar-2026" }, fiab: "ok" },
          { nombre: "Fekete Kutya («Perro Negro»)", zona: "Dob u. 31 · 7 min", coords: [47.499, 19.062], nota: "El dive de los alternativos locales de toda la vida: barra estrecha, parroquia fija, pálinka honesta. Donde se bebe ANTES o DESPUÉS del concierto.", fiab: "ok", fuente: "Offbeat Budapest, oct-2025" },
          { nombre: "Kisüzem", zona: "Kis Diófa u. 2 · 8 min", coords: [47.4995, 19.0625], nota: "«Pequeña fábrica»: mitad bar artistoide mitad sala de conciertos raros (jazz torcido, punk, experimentos). Abre desde mediodía — vale también para la caña de las 17:00.", fiab: "ok" },
          { nombre: "Dürer Kert", zona: "Zugló (tranvía, ~20 min)", coords: [47.53, 19.11], nota: "EL templo del rock/punk/metal de Budapest: dos salas + escenario al aire libre en patio industrial, paredes forradas de flyers. Mirad su programa del finde: 33 conciertos anunciados en 2026.", fiab: "ok", fuente: "durerkert.com vía Songkick" },
          { nombre: "A38", zona: "Barco en el Danubio (Buda, puente Petőfi)", coords: [47.477, 19.056], nota: "Un carguero ucraniano reconvertido en la mejor sala de conciertos flotante de Europa. El viernes 31 toca Ásgeir. Aunque no entréis: cubierta-bar con el río pasando.", fiab: "ok" },
          { nombre: "Gólya", zona: "Orczy út (VIII, ~15 min tranvía)", coords: [47.483, 19.085], nota: "Cooperativa autogestionada con conciertos de la escena DIY. El primo politizado de la familia; grande para caer un rato si hay algo esa noche.", fiab: "sug" },
        ]
      },
      {
        titulo: "Ruin bars: el original, con instrucciones",
        texto: "Los «romkocsma» (bares en ruinas) nacieron aquí, en edificios condenados del barrio judío. El original merece verse; el truco es CUÁNDO.",
        sitios: [
          { nombre: "Szimpla Kert", zona: "Kazinczy u. 14 · 10 min", coords: [47.497, 19.063], nota: "El primer ruin bar (2002) y aún el más alucinante como ESPACIO: patios, trastos, una bañera-sofá, un Trabant de mesa. Id entre semana o el sábado ANTES de las 20:00; a medianoche es Disneyland con cerveza.", testimonio: { cita: "Ve pronto, pide una cerveza, pasea el edificio como un museo, y lárgate a los bares de verdad cuando llegue la marabunta.", fuente: "Consejo repetido en r/budapest, 2025-26" }, fiab: "ok" },
          { nombre: "Instant-Fogas", zona: "Akácfa u. 49-51", coords: [47.5, 19.0658], nota: "El complejo-fiesta: 7 pistas, 18 barras, hasta las 6. No es vuestro rollo de cabecera, pero está pegado a Robot — asomarse cuenta como antropología.", fiab: "sug" },
        ]
      },
      {
        titulo: "Cerveza seria",
        texto: "La escena craft húngara es potente (Mad Scientist, MONYO, Fehér Nyúl). Dónde catarla sin ceremonia:",
        sitios: [
          { nombre: "Élesztőház", zona: "IX, Tűzoltó u. (M3 Corvin, ~12 min)", coords: [47.483, 19.068], nota: "«La casa de la levadura»: ruin pub cervecero en una cristalería vieja, ~20 grifos de craft húngara. El Samo Pivo de Budapest.", fiab: "ver" },
          { nombre: "Csak a jó sör", zona: "Kertész u. 42 · 9 min", coords: [47.501, 19.067], nota: "«Solo cerveza buena», y el nombre es un contrato: tienda-bar con cientos de botellas y grifos rotando. Para la última tranquila del domingo.", fiab: "ver" },
        ]
      },
    ]
  },

  /* ---------- COMER (corto y al grano) ---------- */
  comer: {
    intro: "Tres días no dan para tesis gastronómica: van los imprescindibles húngaros y dónde caen cerca. Precios: plato fuerte 3.500–6.000 HUF, cerveza 800–1.500, lángos 1.800–2.800. Ojo: muchos sitios añaden servicio (szervizdíj) del 12-15% — miradlo antes de dejar más propina.",
    bloques: [
      {
        titulo: "El canon magiar",
        texto: "Gulyás (sopa-guiso de la patria, no «goulash» espesado alemán), pörkölt (el guiso denso de verdad, con nokedli), lángos (masa frita con ajo, nata agria y queso — la gloria absoluta de resaca), kürtőskalács (chimenea dulce de brasa) y pálinka de postre líquido.",
        sitios: [
          { nombre: "Gettó Gulyás", zona: "Wesselényi u. · 6 min", coords: [47.4995, 19.064], nota: "Los guisos de caza y el gulyás que enseñarías a un extranjero, en el corazón del VII. Reservad (Instagram/teléfono) — pequeño y con fama.", testimonio: { cita: "El pörkölt de aquí es lo que tu abuela húngara imaginaria cocinaría.", fuente: "Síntesis de reseñas locales, 2025-26" }, fiab: "sug" },
          { nombre: "Karaván", zona: "Kazinczy u., pegado a Szimpla", coords: [47.4972, 19.0628], nota: "Patio de food trucks del barrio: lángos, hamburguesa de mangalica, opción vegana. Cena rápida perfecta antes de la ruta de bares.", fiab: "ok" },
          { nombre: "Bors GasztroBár", zona: "Kazinczy u. · 9 min", coords: [47.4975, 19.0635], nota: "Culto local: sopas creativas y baguettes calientes con nombres de película. Barato, rápido, siempre con cola corta que avanza.", fiab: "sug" },
          { nombre: "Lángos del Mercado Central", zona: "Planta alta del mercado", coords: [47.487, 19.0587], nota: "El clásico entre turistas y abuelas: grasiento, enorme, feliz. Solo sábado por la mañana (domingo cierra).", fiab: "ok" },
        ]
      },
    ]
  },

  /* ---------- PRÁCTICO ---------- */
  practico: {
    dinero: { titulo: "Forintos", texto: "1 € ≈ 395 HUF (ver conversor arriba). Hungría es UE pero NO euro. Tarjeta funciona en casi todo, bares cutres incluidos; llevad algo de efectivo para lángos y mercadillo. El aviso de siempre: si el datáfono ofrece cobrar «en euros» (DCC), NO — en forintos siempre sale mejor.", fiab: "ok" },
    roaming: { titulo: "¡Vuelve el roaming UE!", texto: "Tras Serbia, milagro: en Hungría vuestra tarifa española funciona normal, datos incluidos. Sin eSIM, sin dramas. Mapa online por la calle sin miramientos.", fiab: "ok" },
    transporte: { titulo: "Moverse: la BKK de 72 h", texto: "La travelcard de 72 horas cuesta 5.500 HUF (~14,5 €) y calza EXACTA con vuestro finde: metro, tranvía y bus ilimitados. Se compra en apps (BudapestGO) o máquinas moradas. Imprescindible el tranvía 2 por la orilla del Danubio: la mejor «atracción» de la ciudad cuesta cero extra. Si llegáis en tren, de Keleti al hotel hay 12 min andando o una parada de M2.", fiab: "ok", fuente: "bkk.hu · ver. 8-jul-2026" },
    termas: { titulo: "Protocolo de balneario", texto: "Bañador obligatorio (se alquila, pero mejor llevarlo), chanclas muy recomendables, toalla alquilable, taquillas con pulsera. Hidratarse: el agua a 38° + cerveza de después no perdonan. En Rudas nocturno el ambiente es más de plan-noche: nadie va a nadar largos.", fiab: "ok" },
    timos: { titulo: "El único timo local", texto: "Los «gentlemen's clubs» y chicas simpáticas que invitan a un bar en Váci utca: cuentas de cientos de euros y matones en la puerta. Regla simple: en el VII con vuestros garitos elegidos, riesgo cero. Taxis: app Bolt o Főtaxi, nunca parar uno a mano.", fiab: "ok" },
    emergencias: { titulo: "Emergencias", texto: "112 europeo. Embajada de España en Budapest: Eötvös u. 11/B, +36 1 202 4006. Sanidad: aquí SÍ vale la Tarjeta Sanitaria Europea.", fiab: "ver" },
    frases: [
      { es: "Hola", hu: "Szia", pron: "SI-a" },
      { es: "Gracias", hu: "Köszönöm", pron: "KÖ-sö-nöm" },
      { es: "¡Salud!", hu: "Egészségedre!", pron: "EH-guess-shé-guedre (nadie lo dice bien, brindad igual)" },
      { es: "Una cerveza, por favor", hu: "Egy sört kérek", pron: "eyy shört KÉ-rek" },
      { es: "La cuenta", hu: "A számlát, kérem", pron: "o SÁM-lat KÉ-rem" },
      { es: "No hablo húngaro", hu: "Nem beszélek magyarul", pron: "nem BE-sé-lek MO-dyo-rul" },
    ],
    checklist: [
      "⚠ YA: reservar Parlamento (jegymester.hu/parlament) — se agota",
      "⚠ YA: entradas Rudas nocturno del viernes 31 (rudasfurdo.hu)",
      "Mirar entradas: Patriarchy en ROBOT (dom 2) · Moby (sáb 1) · Ásgeir en A38 (vie 31)",
      "Bañador y chanclas (×2 humanos)",
      "BKK 72 h al llegar (BudapestGO o máquina morada)",
      "Pasaporte o DNI (Hungría es UE: vale el DNI)",
      "Forintos: sacar poco al llegar, casi todo va con tarjeta",
      "Esta app instalada en el móvil de Juan también",
    ],
  },
};

window.DATA = DATA;
