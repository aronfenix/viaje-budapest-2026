/* ============================================================
   BUDAPEST 26 · app.js — núcleo (hermano recortado de БЕОГРАД 26)
   Claves de almacenamiento con prefijo bud26_ (mismo dominio que
   la app de Belgrado: no deben pisarse).
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const DIAS_SEM = ["", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const pad = (n) => String(n).padStart(2, "0");

  const FIAB = {
    ok: '<span class="fiab fiab-ok">✓ confirmado</span>',
    ver: '<span class="fiab fiab-ver">⚠ verificar</span>',
    sug: '<span class="fiab fiab-sug">💡 sugerencia</span>',
  };
  const fiab = (k) => FIAB[k] || "";

  /* ---------- THEME ---------- */
  const themeMeta = $('meta[name="theme-color"]');
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    if (themeMeta) themeMeta.content = t === "dark" ? "#0d1220" : "#f4efe6";
    dispatchEvent(new CustomEvent("bg26:theme", { detail: t }));
  }
  applyTheme(localStorage.getItem("bud26_theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  $("#themeToggle").addEventListener("click", () => {
    const t = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("bud26_theme", t);
    applyTheme(t);
  });

  /* ---------- TOAST ---------- */
  let toastT;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg; el.hidden = false; el.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => { el.classList.remove("show"); setTimeout(() => (el.hidden = true), 300); }, 2200);
  }

  /* ---------- COUNTDOWN ---------- */
  const T0 = new Date("2026-07-31T12:00:00+02:00");
  const T1 = new Date("2026-08-03T12:00:00+02:00");
  function countdown() {
    const el = $("#countdown");
    const now = new Date();
    document.body.classList.toggle("pretrip", now < T0);
    if (now < T0) {
      const d = T0 - now;
      const dd = Math.floor(d / 864e5), hh = Math.floor(d / 36e5) % 24, mm = Math.floor(d / 6e4) % 60, ss = Math.floor(d / 1e3) % 60;
      el.innerHTML = [["Días", dd], ["Horas", pad(hh)], ["Min", pad(mm)], ["Seg", pad(ss)]]
        .map(([l, v]) => `<div class="cd-cell"><div class="cd-num">${v}</div><div class="cd-lab">${l}</div></div>`).join("");
    } else if (now <= T1) {
      el.innerHTML = `<p class="cd-msg">El finde está en marcha 🍻</p>`;
    } else {
      el.innerHTML = `<p class="cd-msg">El finde ya es leyenda. Egészségedre!</p>`;
    }
  }
  countdown();
  setInterval(countdown, 1000);

  /* ---------- STORES ---------- */
  const PLAN_KEY = "bud26_plan", NOTAS_KEY = "bud26_notas", GASTOS_KEY = "bud26_gastos", CHECK_KEY = "bud26_check";
  const getPlan = () => { try { return JSON.parse(localStorage.getItem(PLAN_KEY)) || {}; } catch { return {}; } };
  const setPlan = (p) => localStorage.setItem(PLAN_KEY, JSON.stringify(p));
  const getNotas = () => { try { return JSON.parse(localStorage.getItem(NOTAS_KEY)) || []; } catch { return []; } };
  const setNotas = (n) => { localStorage.setItem(NOTAS_KEY, JSON.stringify(n)); window.BGMap && BGMap.refreshNotas(); };
  const getGastos = () => { try { return JSON.parse(localStorage.getItem(GASTOS_KEY)) || []; } catch { return []; } };
  const setGastos = (g) => localStorage.setItem(GASTOS_KEY, JSON.stringify(g));

  /* ---------- PLANNABLES ---------- */
  const PLANNABLES = {};
  function reg(id, nombre, emoji, coords) { PLANNABLES[id] = { nombre, emoji, coords: coords || null }; return id; }
  DATA.sitios.forEach((s) => reg(s.id, s.nombre, "◈", s.coords));
  DATA.noche.bloques.forEach((b) => b.sitios.forEach((s) => reg("n-" + slug(s.nombre), s.nombre, "☾", s.coords)));
  DATA.comer.bloques.forEach((b) => b.sitios.forEach((s) => reg("c-" + slug(s.nombre), s.nombre, "♨", s.coords)));
  DATA.mapaZonas.zonas.forEach((z) => ["ver", "comer", "beber"].forEach((tipo) => (z.extras?.[tipo] || []).forEach((s) => reg(s.planId || s.id, s.nombre, tipo === "ver" ? "◈" : tipo === "comer" ? "♨" : "☾", s.coords))));

  const planBtn = (id) => `<button class="plan-btn" data-plan="${id}" title="Añadir a un día">＋ plan</button>`;

  const HOTEL = DATA.viaje.alojamiento.coords;
  function distKm(a, b) {
    const R = 6371, r = Math.PI / 180;
    const dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  function walkChip(coords) {
    if (!coords) return "";
    const km = distKm(HOTEL, coords);
    if (km > 5) return `<span>🚋 lejos (${km.toFixed(1)} km) — transporte</span>`;
    return `<span>🚶 ~${Math.round(km * 13)} min desde el hotel</span>`;
  }

  function confetti(n = 30) {
    const w = document.createElement("div"); w.className = "confetti";
    const cols = ["#c9a227", "#5fc3b8", "#b5522c", "#e58aa8"];
    for (let i = 0; i < n; i++) {
      const s = document.createElement("i");
      s.style.left = Math.random() * 100 + "vw";
      s.style.background = cols[i % cols.length];
      s.style.animationDelay = (Math.random() * .35) + "s";
      s.style.setProperty("--dx", (Math.random() * 2 - 1).toFixed(2));
      w.appendChild(s);
    }
    document.body.appendChild(w); setTimeout(() => w.remove(), 2300);
  }

  /* ---------- fechas del finde ---------- */
  function fechasViaje() {
    return ["2026-07-31", "2026-08-01", "2026-08-02", "2026-08-03"].map((d) => new Date(d + "T12:00:00+02:00"));
  }

  /* ---------- plan sheet ---------- */
  let pendingPlan = null;
  function openPlanSheet(id) {
    pendingPlan = id;
    $("#planSheetTitle").textContent = `«${PLANNABLES[id].nombre}» → ¿qué día?`;
    const plan = getPlan();
    $("#planDays").innerHTML = fechasViaje().map((f) => {
      const iso = f.toISOString().slice(0, 10);
      const wd = ((f.getDay() + 6) % 7) + 1;
      const n = (plan[iso] || []).length;
      return `<button class="plan-day" data-day="${iso}">
        <span class="pd-num">${f.getDate()}</span>
        <span class="pd-wd">${DIAS_SEM[wd].slice(0, 3)}</span>
        ${n ? `<span class="pd-count">${n}</span>` : ""}</button>`;
    }).join("");
    $("#planSheet").hidden = false;
  }
  $("#planDays").addEventListener("click", (e) => {
    const b = e.target.closest("[data-day]"); if (!b || !pendingPlan) return;
    const plan = getPlan(); const day = b.dataset.day;
    plan[day] = plan[day] || [];
    if (!plan[day].includes(pendingPlan)) plan[day].push(pendingPlan);
    setPlan(plan);
    $("#planSheet").hidden = true;
    toast(`Guardado para el ${DIAS_SEM[((new Date(day + "T12:00:00").getDay() + 6) % 7) + 1]} ${+day.slice(8)}. — Bp.`);
    if (rendered.has("agenda")) renderAgenda($('.page[data-page="agenda"]'));
  });

  /* ---------- delegación global ---------- */
  document.addEventListener("click", (e) => {
    const p = e.target.closest("[data-plan]");
    if (p) { openPlanSheet(p.dataset.plan); return; }
    const c = e.target.closest("[data-close]");
    if (c) { $("#" + c.dataset.close).hidden = true; return; }
    const del = e.target.closest("[data-unplan]");
    if (del) {
      const [day, id] = del.dataset.unplan.split("|");
      const plan = getPlan();
      plan[day] = (plan[day] || []).filter((x) => x !== id);
      if (!plan[day].length) delete plan[day];
      setPlan(plan);
      renderAgenda($('.page[data-page="agenda"]'));
      return;
    }
    const rt = e.target.closest("[data-ruta]");
    if (rt) {
      const pts = (getPlan()[rt.dataset.ruta] || []).map((id) => PLANNABLES[id]).filter((x) => x && x.coords);
      window.__route = pts.map((x, i) => ({ coords: x.coords, n: i + 1, nombre: x.nombre }));
      location.hash = "#/mapa";
      return;
    }
    const a = e.target.closest("[data-fly]");
    if (a) {
      const [lat, lng] = a.dataset.fly.split(",").map(Number);
      window.__flyTo = [lat, lng];
      if (a.tagName === "BUTTON") location.hash = "#/mapa";
    }
  });

  /* ---------- SECCIONES ---------- */
  const SECCIONES = [
    { id: "agenda", sub: "La ciudad en tres actos + ideas por día", ico: "▦" },
    { id: "barrios", sub: "Buda, Pest y vuestro distrito VII", ico: "⌂" },
    { id: "ver", sub: "Los musts, con fotos y horarios en vivo", ico: "◈" },
    { id: "mapa", sub: "Todo a tiros de piedra del hotel", ico: "◎" },
    { id: "comer", sub: "Gulyás, lángos y dónde caen", ico: "♨" },
    { id: "noche", sub: "Los primos del Wurlitzer", ico: "🎸" },
    { id: "historia", sub: "Imperio, 1956 y socialismo de gulash", ico: "✦" },
    { id: "cuaderno", sub: "Notas del finde", ico: "✎" },
    { id: "gastos", sub: "Quién pagó qué — Álvaro/Juan", ico: "€" },
    { id: "practico", sub: "Forintos, BKK, termas, frases", ico: "✚" },
  ];
  const pageMeta = (id) => { const p = $(`.page[data-page="${id}"]`); return { num: p.dataset.num, title: p.dataset.title, cyr: p.dataset.cyr }; };

  function tile(s) {
    const m = pageMeta(s.id);
    return `<a class="home-tile reveal" href="#/${s.id}" data-page-ref="${s.id}">
      <span class="ht-num">${m.num} · ${s.ico}</span>
      <span class="ht-title">${m.title}</span>
      <span class="ht-sub">${s.sub}</span>
      <span class="ht-cyr">${m.cyr}</span></a>`;
  }
  const RIO_GRANDES = new Set(["agenda", "noche", "mapa", "ver"]);
  function rioItem(s, i) {
    const m = pageMeta(s.id);
    return `<a class="rio-item reveal ${RIO_GRANDES.has(s.id) ? "ri-big" : ""} ${i % 2 ? "ri-alt" : ""}" href="#/${s.id}" data-page-ref="${s.id}">
      <span class="ri-num">${m.num}</span>
      <span class="ri-title">${m.title}</span>
      <span class="ri-sub">${s.sub}</span>
    </a>`;
  }
  function paintTiles(root) {
    $$("[data-page-ref]", root).forEach((a) => {
      const probe = $(`.page[data-page="${a.dataset.pageRef}"]`);
      a.style.setProperty("--tile", getComputedStyle(probe).getPropertyValue("--sec"));
    });
  }
  $("#rioItems").innerHTML = SECCIONES.map(rioItem).join("");
  $("#guideGrid").innerHTML = SECCIONES.map(tile).join("");
  addEventListener("bg26:theme", () => { paintTiles($("#rioItems")); paintTiles($("#guideGrid")); });
  paintTiles(document);

  /* ---------- VIÑETAS ---------- */
  const V = (inner) => `<svg class="ph-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  const VINETAS = {
    agenda: V('<rect x="8" y="10" width="32" height="30" rx="3"/><line x1="8" y1="19" x2="40" y2="19"/><line x1="16" y1="6" x2="16" y2="13"/><line x1="32" y1="6" x2="32" y2="13"/><circle cx="24" cy="29" r="4"/>'),
    barrios: V('<path d="M6 40 L6 26 L14 18 L22 26 L22 40"/><path d="M22 40 L22 22 L32 12 L42 22 L42 40"/><line x1="4" y1="40" x2="44" y2="40"/>'),
    ver: V('<path d="M8 40 L8 26 L14 26 L14 20 Q 14 12 24 10 Q 34 12 34 20 L34 26 L40 26 L40 40 Z"/><line x1="24" y1="10" x2="24" y2="4"/><circle cx="24" cy="30" r="3"/>'),
    mapa: V('<path d="M24 42 C 24 42, 38 28, 38 18 A 14 14 0 0 0 10 18 C 10 28, 24 42, 24 42 Z"/><circle cx="24" cy="18" r="5"/>'),
    comer: V('<circle cx="26" cy="26" r="14"/><circle cx="26" cy="26" r="7"/><path d="M8 8 L8 20 M5 8 L5 14 M11 8 L11 14 M8 20 L8 40"/>'),
    noche: V('<path d="M10 40 L14 12 L34 12 L38 40 Z"/><path d="M17 20 L31 20" opacity=".6"/><path d="M20 8 L20 12 M28 8 L28 12"/><circle cx="24" cy="30" r="3"/>'),
    cuaderno: V('<rect x="10" y="6" width="28" height="36" rx="3"/><line x1="16" y1="6" x2="16" y2="42"/><line x1="22" y1="16" x2="33" y2="16"/><line x1="22" y1="23" x2="33" y2="23"/><line x1="22" y1="30" x2="29" y2="30"/>'),
    gastos: V('<ellipse cx="24" cy="14" rx="14" ry="5"/><path d="M10 14 L10 34 A 14 5 0 0 0 38 34 L38 14"/><path d="M10 24 A 14 5 0 0 0 38 24"/>'),
    practico: V('<rect x="8" y="16" width="32" height="24" rx="4"/><path d="M18 16 L18 10 A 3 3 0 0 1 21 7 L27 7 A 3 3 0 0 1 30 10 L30 16"/><line x1="16" y1="16" x2="16" y2="40"/><line x1="32" y1="16" x2="32" y2="40"/>'),
  };

  function pageShell(id, introHtml, bodyHtml) {
    const m = pageMeta(id);
    return `<div class="wrap">
      <div class="page-head">
        <span class="ph-cyr">${m.cyr}</span>
        <span class="ph-outline" aria-hidden="true">${m.num}</span>
        ${VINETAS[id] || ""}
        <span class="ph-num">SECCIÓN ${m.num}</span>
        <h2>${m.title}</h2>
        <div class="ph-rule"></div>
        ${introHtml ? `<p class="page-intro">${introHtml}</p>` : ""}
      </div>
      ${bodyHtml}
    </div>`;
  }

  /* ---------- HOME ---------- */
  function renderPrologo() {
    const box = $("#prologo"); if (!box || box.innerHTML) return;
    const p = DATA.viaje.prologo;
    box.innerHTML = `<div class="prologo-card reveal">
      <span class="pr-tag">${esc(p.titulo)}</span>
      ${p.texto.split("\n\n").map((t) => `<p>${esc(t)}</p>`).join("")}
      <span class="pr-firma">${esc(p.firma)}</span>
    </div>`;
  }

  /* ---------- MAPA INFOGRÁFICO DE ZONAS ---------- */
  const ZONE_COLORS = ["#d16d4b", "#458e87", "#d2a43a", "#6f72b8", "#b4587a", "#4d88b8", "#758f45", "#9b6c43"];
  let homeZoneMap = null;
  function zoneHref(id) { return `#/zona?id=${encodeURIComponent(id)}`; }
  function renderZoneMapHome() {
    const root = $("#zoneMapHome"); if (!root || !DATA.mapaZonas) return;
    if (homeZoneMap) { homeZoneMap.remove(); homeZoneMap = null; }
    const m = DATA.mapaZonas;
    const key = m.zonas.map((z, i) => `<a class="zone-key-link" href="${zoneHref(z.id)}" data-zone-id="${z.id}" style="--zone:${ZONE_COLORS[i % ZONE_COLORS.length]}"><span class="zone-dot"></span><span><b>${esc(z.nombre)}</b><br>${esc(z.sub)}</span></a>`).join("");
    root.innerHTML = `<section class="zone-map-card"><div class="zone-map-head"><h2>${esc(m.titulo)}</h2><p>${esc(m.intro)}</p></div><div class="zone-map-wrap"><div class="home-zone-map" id="homeZoneMap" role="img" aria-label="Mapa real interactivo de las zonas de Budapest"></div><span class="zone-map-hint">Toca un contorno para abrir la zona</span></div><div class="zone-map-key">${key}</div></section>`;
    requestAnimationFrame(() => {
      if (!window.L || !$("#homeZoneMap")) return;
      homeZoneMap = L.map("homeZoneMap", { scrollWheelZoom: false, zoomControl: true, attributionControl: true, zoomSnap: .5 }).setView(DATA.viaje.alojamiento.coords, 12);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' }).addTo(homeZoneMap);
      const bounds = L.latLngBounds([]);
      m.zonas.forEach((z, i) => {
        const color = ZONE_COLORS[i % ZONE_COLORS.length];
        const circle = L.circle(z.centro, { radius: (z.mapRadio || z.radio * .68) * 1000, color, weight: 3, opacity: .95, fillColor: color, fillOpacity: .07, dashArray: "7 6" }).addTo(homeZoneMap);
        circle.bindTooltip(z.corto, { permanent: true, direction: "center", className: "home-zone-label" });
        circle.on("click", () => { location.hash = zoneHref(z.id); });
        bounds.extend(circle.getBounds());
      });
      const homeIcon = L.divIcon({ className: "home-map-pin", html: "⌂", iconSize: [28, 28], iconAnchor: [14, 14] });
      L.marker(DATA.viaje.alojamiento.coords, { icon: homeIcon }).addTo(homeZoneMap).bindTooltip("Vuestra base", { direction: "top" });
      homeZoneMap.fitBounds(bounds, { padding: [24, 24] });
    });
  }

  function zoneIdFromHash() { return new URLSearchParams(location.hash.split("?")[1] || "").get("id") || ""; }
  function nearZone(coords, z) { return coords && distKm(z.centro, coords) <= z.radio; }
  function renderZona(el) {
    const z = DATA.mapaZonas.zonas.find((x) => x.id === zoneIdFromHash()) || DATA.mapaZonas.zonas[0];
    const barrios = DATA.barrios.zonas.filter((b) => z.barrios.includes(b.id));
    const sitios = [...DATA.sitios.filter((s) => nearZone(s.coords, z)), ...(z.extras?.ver || [])].sort((a, b) => distKm(z.centro, a.coords) - distKm(z.centro, b.coords));
    const comidas = [...DATA.comer.bloques.flatMap((b) => b.sitios.map((s) => ({ ...s, bloque: b.titulo }))).filter((s) => nearZone(s.coords, z)), ...(z.extras?.comer || []).map((s) => ({ ...s, bloque: "Recomendación de la zona" }))].sort((a, b) => distKm(z.centro, a.coords) - distKm(z.centro, b.coords));
    const noche = [...DATA.noche.bloques.flatMap((b) => b.sitios.map((s) => ({ ...s, bloque: b.titulo }))).filter((s) => nearZone(s.coords, z)), ...(z.extras?.beber || []).map((s) => ({ ...s, bloque: "Recomendación de la zona" }))].sort((a, b) => distKm(z.centro, a.coords) - distKm(z.centro, b.coords));
    const contexto = barrios.length ? barrios.map((b) => `<article class="card zone-detail-lead reveal"><span class="chip chip-sec">${esc(b.tag)}</span><h3>${esc(b.nombre)}</h3><p>${esc(b.desc)}</p><div class="zone-facts"><div class="zone-fact"><b>Qué hacer</b>${esc(b.hacer)}</div><div class="zone-fact"><b>La capa histórica</b>${esc(b.dato)}</div></div></article>`).join("") : `<article class="card zone-detail-lead reveal"><h3>${esc(z.nombre)}</h3><p>${esc(z.sub)}</p><div class="zone-facts"><div class="zone-fact"><b>Cómo leerla</b>Esta pieza queda fuera del centro compacto: tratadla como una excursión con identidad propia.</div></div></article>`;
    const group = (titulo, icono, items, render) => `<div class="zone-section-title"><h3>${icono} ${titulo}</h3><span>${items.length} cerca</span></div>${items.length ? items.map(render).join("") : '<p class="muted">No hay fichas cercanas todavía.</p>'}`;
    const ver = group("Qué ver", "◈", sitios, (s) => `<article class="zone-place reveal"><h4>${esc(s.nombre)} ${fiab(s.fiab)} ${planBtn(s.planId || s.id)}</h4><p>${esc(s.desc)}</p><p class="muted small">📍 ${esc(s.zona)} · ${esc(s.dur)} · ${esc(s.precio)}</p><p class="small"><a href="https://www.google.com/maps/search/?api=1&query=${s.coords.join(",")}" target="_blank" rel="noopener">navegar</a></p></article>`);
    const comer = group("Comer", "♨", comidas, (s) => `<article class="zone-place reveal"><h4>${esc(s.nombre)} ${fiab(s.fiab)} ${planBtn(s.planId || "c-" + slug(s.nombre))}</h4><p>${esc(s.nota)}</p><p class="muted small">${esc(s.bloque)} · 📍 ${esc(s.zona)}</p></article>`);
    const salir = group("Beber y salir", "☾", noche, (s) => `<article class="zone-place reveal"><h4>${esc(s.nombre)} ${fiab(s.fiab)} ${planBtn(s.planId || "n-" + slug(s.nombre))}</h4><p>${esc(s.nota)}</p><p class="muted small">${esc(s.bloque)} · 📍 ${esc(s.zona)}</p></article>`);
    el.innerHTML = pageShell("zona", `${esc(z.sub)} · selección automática en un radio aproximado de ${String(z.radio).replace(".", ",")} km.`, contexto + ver + comer + salir);
    const h = el.querySelector(".page-head h2"); if (h) h.textContent = z.nombre;
  }
  function renderBoarding() {
    const box = $("#boardingBox");
    if (new Date() >= T0) { box.innerHTML = ""; return; }
    box.innerHTML = `<div class="boarding reveal">
      <div class="bp-main">
        <div class="bp-route"><span class="bp-code">BEO</span><span class="bp-plane">➔</span><span class="bp-code">BUD</span></div>
        <div class="bp-row"><span>Pasajeros</span><b>ÁLVARO & JUAN</b></div>
        <div class="bp-row"><span>Ventana</span><b>VIE 31 JUL 12:00 → LUN 3 AGO 12:00</b></div>
        <div class="bp-row"><span>Destino</span><b>Osvát utca 2-8 · distrito VII</b></div>
      </div>
      <div class="bp-stub">
        <span class="bp-stub-cyr">JEGY</span>
        <span class="bp-seat">Asiento<br><b>junto a<br>tu colega</b></span>
        <div class="bp-barcode">${"▮▯▮▮▯▮▯▯▮▮▯▮▮▮▯▮▯▮▮▯".split("").map((c) => `<i class="${c === "▮" ? "w2" : "w1"}"></i>`).join("")}</div>
      </div>
    </div>`;
  }
  function todayCard() {
    const now = new Date();
    const iso = now.toISOString().slice(0, 10);
    const dia = DATA.agenda.find((d) => d.fecha === iso);
    let inner;
    if (dia) {
      inner = `<span class="today-tag">Hoy · ${esc(dia.nombre)}</span>
        <h3>${esc(dia.dia[0] || "")}</h3>
        ${dia.noche[0] ? `<p>☾ ${esc(dia.noche[0].slice(0, 120))}…</p>` : ""}
        <p><a href="#/agenda">El día completo →</a></p>`;
    } else {
      inner = `<span class="today-tag">El plan</span>
        <h3>Viernes 31 (mediodía) → lunes 3 (mediodía)</h3>
        <p>Base: NH Collection City Center, Osvát utca — dentro del distrito VII, el barrio de los bares.</p>
        <p>Tres noches, dos balnearios, un Parlamento y los primos del Wurlitzer. <a href="#/agenda">El finde, día a día →</a></p>`;
    }
    $("#todayCard").innerHTML = `<div class="today-card reveal">${inner}</div>`;
  }
  function renderCalle() {
    const box = $("#calleBar"); if (!box) return;
    const iso = new Date().toISOString().slice(0, 10);
    const en = (iso >= "2026-07-31" && iso <= "2026-08-03") || localStorage.getItem("bud26_calle_demo");
    if (!en) { box.innerHTML = ""; return; }
    const abiertos = DATA.sitios.filter((s) => s.horario && estadoSitio(s).open).length;
    box.innerHTML = `<div class="calle-bar reveal in">
      <span class="cb-tag">MODO CALLE</span>
      <a href="#/ver">◈ ${abiertos} abiertos</a>
      <a href="#/mapa">◎ Mapa</a>
      <button id="cbFx">Ft Cambio</button>
      <a href="#/noche">🎸 Noche</a>
    </div>`;
    $("#cbFx").addEventListener("click", () => $("#cambioBox").scrollIntoView({ block: "center", behavior: "smooth" }));
  }
  function renderInstall() {
    const box = $("#installBox"); if (!box) return;
    const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    if (standalone) { box.innerHTML = ""; return; }
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    box.innerHTML = `<div class="install-card reveal">
      <span class="in-tag">📲 Llévame en el bolsillo (tú y Juan)</span>
      <p>${ios
        ? "En iPhone: <b>Compartir</b> → <b>«Añadir a pantalla de inicio»</b>. Funciono sin conexión."
        : "En Android: menú <b>⋮</b> → <b>«Instalar aplicación»</b>. Funciono sin conexión."}</p>
    </div>`;
  }

  /* ---------- fotos (Wikimedia, con degradación silenciosa) ---------- */
  const foto = (id, alt) => id ? `<figure class="card-foto"><img src="imgs/${id}.jpg" alt="${esc(alt || "")}" loading="lazy" onerror="this.parentElement.remove()"></figure>` : "";

  /* ---------- QUÉ HACER + IDEAS POR DÍA ---------- */
  function metDia(iso) {
    try {
      const w = JSON.parse(localStorage.getItem("bud26_meteo"));
      const i = w.daily.time.indexOf(iso);
      if (i < 0) return "";
      const W = { 0: "☀️", 1: "🌤", 2: "⛅", 3: "☁️", 45: "🌫", 48: "🌫", 51: "🌦", 53: "🌦", 55: "🌧", 61: "🌧", 63: "🌧", 65: "🌧", 80: "🌦", 81: "🌧", 82: "⛈", 95: "⛈", 96: "⛈", 99: "⛈" };
      return `<span class="day-met">${W[w.daily.weather_code[i]] || "🌡"} ${Math.round(w.daily.temperature_2m_max[i])}°<i>/${Math.round(w.daily.temperature_2m_min[i])}°</i></span>`;
    } catch { return ""; }
  }
  function renderAgenda(el) {
    const hoyIso = new Date().toISOString().slice(0, 10);
    const plan = getPlan();
    const cards = DATA.agenda.map((d) => {
      const f = new Date(d.fecha + "T12:00:00");
      const wd = ((f.getDay() + 6) % 7) + 1;
      const evs = DATA.eventos.filter((e) => e.fecha === d.fecha);
      const mios = (plan[d.fecha] || []).filter((id) => PLANNABLES[id]);
      const conCoords = mios.filter((id) => PLANNABLES[id].coords).length;
      const miPlan = mios.length ? `<div class="mi-plan"><span class="mp-tag">Vuestro plan</span><ul>
        ${mios.map((id) => `<li>${PLANNABLES[id].emoji} ${esc(PLANNABLES[id].nombre)}
          <button class="mp-x" data-unplan="${d.fecha}|${id}" title="Quitar">✕</button></li>`).join("")}</ul>
        ${conCoords >= 2 ? `<button class="ruta-btn" data-ruta="${d.fecha}">🗺 Ver la ruta del día</button>` : ""}</div>` : "";
      return `<article class="card day-card reveal ${d.fecha === hoyIso ? "today-hl" : ""}">
        <div class="day-date"><span class="day-num">${f.getDate()}</span>
        <span class="day-wd">${esc(d.nombre)}</span>
        ${metDia(d.fecha)}
        ${d.fecha === hoyIso ? '<span class="chip chip-sec">HOY</span>' : ""}</div>
        ${miPlan}
        ${d.dia.length ? `<h4>☀ El día</h4><ul class="day-list">${d.dia.map((x) => `<li class="dl-open">${esc(x)}</li>`).join("")}</ul>` : ""}
        ${d.noche.length ? `<h4>☾ La noche</h4><ul class="day-list">${d.noche.map((x) => `<li class="dl-event">${esc(x)}</li>`).join("")}</ul>` : ""}
        ${evs.length ? `<h4>♪ Cartel del día</h4><ul class="day-list">${evs.map((e) => `<li class="dl-event">${esc(e.nombre)} · ${esc(e.lugar)} <span class="muted small">(${esc(e.genero)})</span> ${fiab(e.fiab)}</li>`).join("")}</ul>` : ""}
      </article>`;
    }).join("");
    const actos = DATA.quehacer.actos.map((a) => `<article class="card reveal">
      ${foto(a.img, a.titulo)}
      <h3>${esc(a.titulo)}</h3>
      <p>${esc(a.texto)}</p>
    </article>`).join("");
    el.innerHTML = pageShell("agenda",
      esc(DATA.quehacer.intro),
      actos +
      `<div class="rio-head" style="margin-top:34px"><h2>Ideas por día</h2><p>Propuesta, no contrato — con «＋ plan» en cualquier ficha lo hacéis vuestro.</p></div>` +
      cards + `<p class="muted small">${esc(DATA.eventosNota)}</p>`);
  }

  /* ---------- LA CIUDAD ---------- */
  function renderBarrios(el) {
    const zonas = DATA.barrios.zonas.map((z) => `<article class="card reveal">
      ${foto(z.img, z.nombre)}
      <span class="chip chip-sec">${esc(z.tag)}</span>
      <h3>${esc(z.nombre)}</h3>
      <p>${esc(z.desc)}</p>
      ${z.hacer ? `<h4>Qué hacer</h4><p>${esc(z.hacer)}</p>` : ""}
      ${z.dato ? `<p class="barrio-dato">✦ ${esc(z.dato)}</p>` : ""}
      <p><a href="#/mapa" data-fly="${z.coords.join(",")}">Ver en el mapa →</a></p>
    </article>`).join("");
    el.innerHTML = pageShell("barrios", esc(DATA.barrios.intro), zonas);
  }

  /* ---------- MUSTS ---------- */
  function estadoSitio(s, ref) {
    const now = ref || new Date();
    const wd = ((now.getDay() + 6) % 7) + 1;
    const h = now.getHours() + now.getMinutes() / 60;
    if (!s.horario) return { cls: "abierto", txt: "Espacio abierto", hoy: s.siempre || s.soloDias || "", open: true };
    const hoy = s.horario[wd];
    const fmt = (x) => `${Math.floor(x)}:${pad(Math.round((x % 1) * 60))}`;
    if (!hoy) return { cls: "cerrado", txt: "Hoy cerrado", hoy: s.soloDias || "Cierra este día", open: false };
    const rango = `Hoy: ${fmt(hoy[0])}–${fmt(hoy[1])}`;
    if (h >= hoy[0] && h < hoy[1]) {
      return h > hoy[1] - 1
        ? { cls: "pronto", txt: `Cierra pronto (${fmt(hoy[1])})`, hoy: rango, open: true }
        : { cls: "abierto", txt: "Abierto ahora", hoy: rango, open: true };
    }
    return { cls: "cerrado", txt: h < hoy[0] ? `Abre a las ${fmt(hoy[0])}` : "Ya cerrado hoy", hoy: rango, open: false };
  }
  function renderVer(el) {
    const cards = DATA.sitios.map((s) => {
      const st = estadoSitio(s);
      return `<article class="card entrada reveal">
        ${foto(s.id, s.nombre)}
        <h3>${esc(s.nombre)}</h3>
        <div class="sitio-meta">
          <span class="estado ${st.cls}">${st.txt}</span>
          <span>📍 <b>${esc(s.zona)}</b></span><span>⏱ ${esc(s.dur)}</span>
        </div>
        <div class="sitio-meta"><span>🎟 <b>${esc(s.precio)}</b></span><span>${esc(st.hoy)}</span>${walkChip(s.coords)}</div>
        <p>${esc(s.desc)}</p>
        ${s.consejo ? `<p class="consejo">${esc(s.consejo)}</p>` : ""}
        <div class="card-actions">${planBtn(s.id)}</div>
        <p class="fuente">${fiab(s.fiab)} ${esc(s.fuente || "")} · <a href="#/mapa" data-fly="${s.coords.join(",")}">mapa</a> · <a href="https://www.google.com/maps/search/?api=1&query=${s.coords.join(",")}" target="_blank" rel="noopener">navegar</a></p>
      </article>`;
    }).join("");
    el.innerHTML = pageShell("ver",
      `${DATA.sitios.length} lugares para tres días y medio — con las reservas urgentes marcadas ⚠ y una capa nueva de memoria socialista. El estado abierto/cerrado usa la hora real del móvil.`, cards);
  }

  /* ---------- MAPA ---------- */
  function renderMapa(el) {
    el.innerHTML = pageShell("mapa",
      "Hotel, musts, garitos y comida — con radios de tiempo a pie desde Osvát utca. Con roaming UE, el mapa va fino por la calle.",
      `<div class="map-filtros" id="mapFiltros"></div>
       <div id="mapBox"></div>
       <p class="map-nota">📍 Los anillos = ~10 / 20 / 30 min andando desde el hotel. Casi toda vuestra vida nocturna cae dentro del primero.</p>`);
    requestAnimationFrame(() => window.BGMap && BGMap.init());
  }

  /* ---------- COMER / NOCHE ---------- */
  const testimonioHtml = (t) => t ? `<blockquote class="testimonio">${esc(t.cita)}<span class="t-src">— ${esc(t.fuente)}</span></blockquote>` : "";
  function bloquesRender(bloques, pfx) {
    return bloques.map((b) => `<article class="card reveal">
      ${foto(b.img, b.titulo)}
      <h3>${esc(b.titulo)}</h3>${b.texto.split("\n\n").map((t) => `<p>${esc(t)}</p>`).join("")}
      ${b.glosario ? `<div class="glosario">${b.glosario.map((g) => `<div class="glo-item"><b>${esc(g.t)}</b><span>${esc(g.d)}</span></div>`).join("")}</div>` : ""}
      ${b.sitios.map((s) => `<h4>${esc(s.nombre)} ${fiab(s.fiab)} ${planBtn(pfx + slug(s.nombre))}</h4>
        <p class="muted small">📍 ${esc(s.zona)}</p>
        <div class="sitio-meta">${walkChip(s.coords)}</div>
        <p>${esc(s.nota)}</p>${testimonioHtml(s.testimonio)}
        ${s.fuente ? `<p class="fuente">${esc(s.fuente)}</p>` : ""}
        ${s.coords ? `<p class="small"><a href="#/mapa" data-fly="${s.coords.join(",")}">mapa</a> · <a href="https://www.google.com/maps/search/?api=1&query=${s.coords.join(",")}" target="_blank" rel="noopener">navegar</a></p>` : ""}`).join("")}
    </article>`).join("");
  }
  function renderComer(el) { el.innerHTML = pageShell("comer", esc(DATA.comer.intro), bloquesRender(DATA.comer.bloques, "c-")); }
  function renderNoche(el) { el.innerHTML = pageShell("noche", esc(DATA.noche.intro), bloquesRender(DATA.noche.bloques, "n-")); }

  /* ---------- HISTORIA ---------- */
  function renderHistoria(el) {
    const capas = DATA.historia.capas.map((c) => `<div class="tl-item reveal">
      <span class="tl-years">${esc(c.años)}</span><h3>${esc(c.epoca)}</h3>
      <p>${esc(c.texto)}</p><p class="tl-donde"><b>Se ve en:</b> ${esc(c.donde)}</p>
    </div>`).join("");
    const ensayo = `<article class="card historia-ensayo reveal">
      <img src="imgs/socialismo-hungaro.webp" alt="Interpretación visual de la vida cotidiana en la Budapest socialista de los años setenta">
      <span class="foto-nota">Imagen editorial generada · recreación histórica, no fotografía documental</span>
      <h3>${esc(DATA.historia.ensayo.titulo)}</h3>
      ${DATA.historia.ensayo.texto.split("\n\n").map((t) => `<p>${esc(t)}</p>`).join("")}
      <div class="glosario">${DATA.historia.ensayo.claves.map((g) => `<div class="glo-item"><b>${esc(g.t)}</b><span>${esc(g.d)}</span></div>`).join("")}</div>
      <h4>${esc(DATA.historia.ensayo.ruta.titulo)}</h4><p>${esc(DATA.historia.ensayo.ruta.texto)}</p>
    </article>`;
    const lecturas = `<article class="card reveal"><h3>Para seguir el hilo</h3>${DATA.historia.lecturas.map((l) => `<p><b>${esc(l.titulo)}</b> — ${esc(l.autor)}<br><span class="muted small">${esc(l.nota)}</span></p>`).join("")}</article>`;
    el.innerHTML = pageShell("historia", esc(DATA.historia.intro), ensayo + `<div class="tl">${capas}</div>` + lecturas);
  }

  /* ---------- CUADERNO ---------- */
  const CATS = ["Garito descubierto", "Comer/beber", "Idea", "Recuerdo"];
  function renderCuaderno(el) {
    el.innerHTML = pageShell("cuaderno",
      "Lo que os recomiende un camarero o la intuición a las dos de la mañana. Con «Exportar» viaja todo (notas, plan y gastos) al móvil de Juan.",
      `<article class="card">
        <h3>Nueva nota</h3>
        <form class="nota-form" id="notaForm">
          <input name="nombre" placeholder="Nombre (p. ej. «el bar del sótano de la calle X»)" required maxlength="80">
          <select name="cat">${CATS.map((c) => `<option>${c}</option>`).join("")}</select>
          <input name="zona" placeholder="Zona / dirección (opcional)" maxlength="80">
          <textarea name="texto" placeholder="Notas… (opcional)" maxlength="600"></textarea>
          <input name="coords" id="notaCoords" placeholder="Coordenadas (opcional) — o «elegir en el mapa»" readonly>
          <div class="cuaderno-tools">
            <button class="btn" type="submit">Guardar</button>
            <button class="btn ghost" type="button" id="pickMapa">📍 Elegir en el mapa</button>
            <button class="btn ghost" type="button" id="geoBtn">📡 Mi ubicación</button>
          </div>
        </form>
      </article>
      <div class="cuaderno-tools">
        <button class="btn ghost small-btn" id="expBtn">⬇ Exportar todo</button>
        <label class="btn ghost small-btn" style="cursor:pointer">⬆ Importar<input type="file" id="impFile" accept=".json" hidden></label>
        <button class="btn ghost small-btn" id="shareBtn">✉ Compartir texto</button>
      </div>
      <div id="notasList"></div>`);
    pintarNotas();
    $("#notaForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const coords = (f.get("coords") || "").split(",").map(Number).filter((n) => !isNaN(n));
      const notas = getNotas();
      notas.unshift({ id: Date.now(), nombre: f.get("nombre").trim(), cat: f.get("cat"), zona: (f.get("zona") || "").trim(), texto: (f.get("texto") || "").trim(), coords: coords.length === 2 ? coords : null, fecha: new Date().toISOString().slice(0, 10) });
      setNotas(notas); e.target.reset(); pintarNotas(); toast("Apuntado. — Bp.");
    });
    $("#pickMapa").addEventListener("click", () => { window.__pickingNote = true; location.hash = "#/mapa"; toast("Señala el sitio en el mapa 📍"); });
    $("#geoBtn").addEventListener("click", () => {
      navigator.geolocation?.getCurrentPosition(
        (p) => { $("#notaCoords").value = `${p.coords.latitude.toFixed(5)},${p.coords.longitude.toFixed(5)}`; },
        () => toast("Sin GPS. — Bp."));
    });
    $("#expBtn").addEventListener("click", () => {
      const payload = { app: "budapest26", notas: getNotas(), plan: getPlan(), gastos: getGastos() };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "budapest26.json" });
      a.click(); URL.revokeObjectURL(a.href);
    });
    $("#impFile").addEventListener("change", async (e) => {
      const file = e.target.files[0]; if (!file) return;
      try {
        const raw = JSON.parse(await file.text());
        const nuevas = raw.notas || [];
        const ids = new Set(getNotas().map((n) => n.id));
        setNotas([...nuevas.filter((n) => !ids.has(n.id)), ...getNotas()]);
        if (raw.plan) { const p = getPlan(); Object.entries(raw.plan).forEach(([d, xs]) => { p[d] = [...new Set([...(p[d] || []), ...xs])]; }); setPlan(p); }
        if (raw.gastos) { const ids2 = new Set(getGastos().map((g) => g.id)); setGastos([...getGastos(), ...raw.gastos.filter((g) => !ids2.has(g.id))]); }
        pintarNotas(); toast("Recibido y archivado. — Bp.");
      } catch { toast("Ese papel no es mío. Archivo no válido."); }
    });
    $("#shareBtn").addEventListener("click", () => {
      const txt = getNotas().map((n) => `• ${n.nombre} (${n.cat})${n.zona ? " — " + n.zona : ""}${n.texto ? "\n  " + n.texto : ""}`).join("\n") || "Cuaderno vacío";
      if (navigator.share) navigator.share({ title: "Cuaderno Budapest", text: txt }).catch(() => {});
      else { navigator.clipboard?.writeText(txt); toast("Copiado. — Bp."); }
    });
  }
  function pintarNotas() {
    const list = $("#notasList"); if (!list) return;
    const notas = getNotas();
    list.innerHTML = notas.length
      ? notas.map((n) => `<article class="card nota-item reveal in">
          <span class="n-cat">${esc(n.cat)} · ${esc(n.fecha)}</span>
          ${n.coords ? `<button class="n-pin" title="Ver en mapa" data-fly="${n.coords.join(",")}">📍</button>` : ""}
          <button class="n-del" data-del="${n.id}" title="Borrar">🗑</button>
          <h3>${esc(n.nombre)}</h3>
          ${n.zona ? `<p class="n-zona">📍 ${esc(n.zona)}</p>` : ""}
          ${n.texto ? `<p>${esc(n.texto)}</p>` : ""}
        </article>`).join("")
      : `<p class="vacio">Sin notas aún. La primera caerá a las 2:00 de alguna noche.</p>`;
    $$("[data-del]", list).forEach((b) => b.addEventListener("click", () => {
      if (confirm("¿Borrar esta nota?")) { setNotas(getNotas().filter((n) => n.id !== +b.dataset.del)); pintarNotas(); }
    }));
  }
  window.BGNotas = { getNotas, setCoordsFromMap: (lat, lng) => { window.__pendingCoords = `${lat.toFixed(5)},${lng.toFixed(5)}`; } };

  /* ---------- GASTOS (Álvaro / Juan) ---------- */
  const GCATS = ["🍺 Bares", "🍽 Comida", "🛁 Termas", "🎟 Entradas", "🚕 Transporte", "✚ Otro"];
  const fxRate = () => +(localStorage.getItem("bud26_fx") || 395);
  function renderGastos(el) {
    const gastos = getGastos();
    const enEur = (g) => (g.cur === "EUR" ? g.q : g.q / fxRate());
    const pagA = gastos.filter((g) => g.payer === "A").reduce((t, g) => t + enEur(g), 0);
    const pagJ = gastos.filter((g) => g.payer === "J").reduce((t, g) => t + enEur(g), 0);
    const total = pagA + pagJ;
    const dif = (pagA - pagJ) / 2;
    const veredicto = Math.abs(dif) < 0.5
      ? "⚖️ En paz — la amistad intacta"
      : dif > 0 ? `Juan le debe <b>${dif.toFixed(2)} €</b> a Álvaro` : `Álvaro le debe <b>${(-dif).toFixed(2)} €</b> a Juan`;
    const balance = `<article class="card balance-card reveal">
      <div class="bal-row"><div><span class="ld-label">Total finde</span><b>${total.toFixed(2)} €</b></div>
      <div><span class="ld-label">Pagó Álvaro</span><b>${pagA.toFixed(2)} €</b></div>
      <div><span class="ld-label">Pagó Juan</span><b>${pagJ.toFixed(2)} €</b></div></div>
      <p class="bal-verdict">${veredicto}</p>
      <p class="muted small">Todo a medias (50/50). Tipo usado: 1 € = ${fxRate().toFixed(0)} HUF.</p></article>`;
    const form = `<article class="card reveal"><h3>Apuntar gasto</h3>
      <form class="nota-form" id="gastoForm">
        <input name="desc" placeholder="Qué (p. ej. «rondas en Vittula»)" required maxlength="60">
        <div class="gasto-row">
          <input name="q" type="number" step="0.01" min="0" inputmode="decimal" placeholder="Importe" required>
          <select name="cur"><option>HUF</option><option>EUR</option></select>
        </div>
        <div class="gasto-row">
          <select name="payer"><option value="A">Pagó Álvaro</option><option value="J">Pagó Juan</option></select>
          <select name="cat">${GCATS.map((c) => `<option>${c}</option>`).join("")}</select>
        </div>
        <button class="btn" type="submit">Apuntar</button>
      </form></article>`;
    const lista = gastos.length ? gastos.map((g) => `<article class="card gasto-item tique reveal in">
        <span class="n-cat">${esc(g.cat)} · ${esc(g.fecha)} · pagó ${g.payer === "A" ? "Álvaro" : "Juan"}</span>
        <button class="n-del" data-gdel="${g.id}" title="Borrar">🗑</button>
        <h3>${esc(g.desc)}</h3>
        <p><b>${g.q} ${g.cur}</b>${g.cur === "HUF" ? ` <span class="muted small">≈ ${enEur(g).toFixed(2)} €</span>` : ""}</p>
      </article>`).join("")
      : `<p class="vacio">Sin gastos aún. El primero será una ronda, está escrito.</p>`;
    el.innerHTML = pageShell("gastos",
      "Cuentas claras entre colegas: en forintos o euros, saldo al momento. Entra en el «Exportar todo» del cuaderno.",
      balance + form + lista);
    $("#gastoForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      setGastos([{ id: Date.now(), desc: f.get("desc").trim(), q: +f.get("q"), cur: f.get("cur"), payer: f.get("payer"), cat: f.get("cat"), fecha: new Date().toISOString().slice(0, 10) }, ...getGastos()]);
      renderGastos(el); toast("Anotado en la cuenta común. — Bp.");
    });
    $$("[data-gdel]", el).forEach((b) => b.addEventListener("click", () => {
      if (confirm("¿Borrar este gasto?")) { setGastos(getGastos().filter((g) => g.id !== +b.dataset.gdel)); renderGastos(el); }
    }));
  }

  /* ---------- PRÁCTICO ---------- */
  function renderPractico(el) {
    const p = DATA.practico;
    const bloques = ["roaming", "transporte", "dinero", "termas", "timos", "emergencias"].map((k) => {
      const b = p[k];
      return `<article class="card reveal"><h3>${esc(b.titulo)}</h3><p>${esc(b.texto)}</p><p class="fuente">${fiab(b.fiab)} ${esc(b.fuente || "")}</p></article>`;
    }).join("");
    const frases = `<article class="card reveal"><h3>Húngaro de emergencia</h3>
      <p class="muted small">El húngaro no se parece a NADA (es pariente del finés, y de lejos). Seis frases y una sonrisa bastan.</p>
      <table class="frase-tabla">${p.frases.map((f) => `<tr>
        <td class="f-es">${esc(f.es)}</td>
        <td class="f-sr"><b>${esc(f.hu)}</b><span class="pron">${esc(f.pron)}</span></td>
      </tr>`).join("")}</table></article>`;
    const done = new Set(JSON.parse(localStorage.getItem(CHECK_KEY) || "[]"));
    const check = `<article class="card reveal"><h3>Checklist del finde</h3>
      <ul class="check-list">${p.checklist.map((c, i) => `<li class="${done.has(i) ? "done" : ""}">
        <input type="checkbox" id="ck${i}" data-ck="${i}" ${done.has(i) ? "checked" : ""}><label for="ck${i}">${esc(c)}</label>
      </li>`).join("")}</ul></article>`;
    el.innerHTML = pageShell("practico", "", bloques + frases + check);
    $$("[data-ck]", el).forEach((cb) => cb.addEventListener("change", () => {
      cb.checked ? done.add(+cb.dataset.ck) : done.delete(+cb.dataset.ck);
      localStorage.setItem(CHECK_KEY, JSON.stringify([...done]));
      cb.closest("li").classList.toggle("done", cb.checked);
      if (done.size === p.checklist.length) { confetti(); toast("Todo listo. Nos vemos el 31. — Bp. 🍻"); }
    }));
    window.BGLive && BGLive.initFx();
  }

  /* ---------- ROUTER ---------- */
  const RENDER = { agenda: renderAgenda, barrios: renderBarrios, ver: renderVer, mapa: renderMapa, comer: renderComer, noche: renderNoche, historia: renderHistoria, cuaderno: renderCuaderno, gastos: renderGastos, practico: renderPractico, zona: renderZona };
  const rendered = new Set();
  const LIVE_PAGES = new Set(["agenda", "ver", "cuaderno", "gastos", "practico", "zona"]);
  function applyRoute() {
    const id = (location.hash.replace(/^#\//, "") || "home").split("?")[0] || "home";
    const target = $(`.page[data-page="${id}"]`) ? id : "home";
    $$(".page").forEach((p) => p.classList.toggle("active", p.dataset.page === target));
    if (RENDER[target] && (!rendered.has(target) || LIVE_PAGES.has(target))) {
      RENDER[target]($(`.page[data-page="${target}"]`));
      rendered.add(target);
      observeReveals();
    }
    if (target === "home") { renderBoarding(); todayCard(); renderPrologo(); renderCalle(); renderInstall(); renderZoneMapHome(); observeReveals(); }
    if (target === "mapa") requestAnimationFrame(() => window.BGMap && BGMap.invalidate());
    if (target === "cuaderno" && window.__pendingCoords) {
      const c = window.__pendingCoords; window.__pendingCoords = null;
      requestAnimationFrame(() => { const i = $("#notaCoords"); if (i) i.value = c; });
    }
    $$(".bottomnav [data-nav]").forEach((a) => {
      const on = a.dataset.nav === target || (a.dataset.nav === "home" && target === "home");
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    scrollTo({ top: 0, behavior: "instant" });
    $("#guideSheet").hidden = true;
  }
  function route() { document.startViewTransition ? document.startViewTransition(applyRoute) : applyRoute(); }
  addEventListener("hashchange", route);

  $("#guideBtn").addEventListener("click", () => { $("#guideSheet").hidden = false; });
  $$(".sheet").forEach((sh) => sh.addEventListener("click", (e) => { if (e.target === sh) sh.hidden = true; }));

  let io;
  function observeReveals() {
    io = io || new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { threshold: .08 });
    $$(".reveal:not(.in)").forEach((r, i) => { r.style.transitionDelay = `${Math.min(i % 6, 4) * 60}ms`; io.observe(r); });
  }
  addEventListener("scroll", () => $("#topbar").classList.toggle("scrolled", scrollY > 30), { passive: true });

  window.BGCore = { estadoSitio, toast, esc, fiab, pageMeta };
  applyRoute();
})();
