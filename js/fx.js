/* ============================================================
   BUDAPEST 26 · fx.js — cielo vivo, parallax, buscador, splash
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------- cielo por hora ---------- */
  function heroSky() {
    const h = new Date().getHours() + new Date().getMinutes() / 60;
    let top, mid, low, sun = "#ffd9a0", night = false, sunY;
    if (h < 5.5 || h >= 21.5)      { top = "#070b1c"; mid = "#101a38"; low = "#1b2947"; sun = "#e8ecf5"; night = true; sunY = 120; }
    else if (h < 8)                { top = "#25355e"; mid = "#7a6a8e"; low = "#e79a5e"; sunY = 250; }
    else if (h < 18)               { top = "#3a7bd5"; mid = "#7db3e8"; low = "#cfe4f4"; sun = "#fff3c4"; sunY = 110; }
    else if (h < 21.5)             { top = "#1b2a52"; mid = "#5d4a75"; low = "#d97b41"; sunY = 265; }
    $("#skyTop").setAttribute("stop-color", top);
    $("#skyMid").setAttribute("stop-color", mid);
    $("#skyLow").setAttribute("stop-color", low);
    const s = $("#heroSun");
    s.setAttribute("fill", sun); s.setAttribute("cy", sunY); s.setAttribute("r", night ? 22 : 34);
    $("#stars").classList.toggle("on", night);
    $("#hero").classList.toggle("night", night || h >= 20.5 || h < 6);
    $("#hero").classList.toggle("day", h >= 8 && h < 18);
  }
  heroSky();
  setInterval(heroSky, 5 * 60 * 1000);

  /* ---------- parallax bajo demanda ---------- */
  let mx = 0, tx = 0, lastY = -1, running = false;
  const layers = $$(".hero-svg .layer");
  const copy = $(".hero-copy");
  function paint() {
    const y = scrollY;
    if (y < innerHeight * 1.3) {
      layers.forEach((l) => {
        l.style.transform = `translate(${-mx * parseFloat(l.dataset.mx || 0)}px, ${y * parseFloat(l.dataset.speed || 0)}px)`;
      });
      if (copy) { copy.style.transform = `translateY(${y * .42}px)`; copy.style.opacity = Math.max(0, 1 - y / (innerHeight * .62)); }
    }
    lastY = y;
  }
  function loop() {
    mx += (tx - mx) * .08;
    const settled = Math.abs(tx - mx) < .002 && lastY === scrollY;
    paint();
    if (settled) { running = false; return; }
    requestAnimationFrame(loop);
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }
  addEventListener("scroll", kick, { passive: true });
  addEventListener("mousemove", (e) => { tx = (e.clientX / innerWidth) * 2 - 1; kick(); }, { passive: true });
  addEventListener("deviceorientation", (e) => { if (e.gamma != null) { tx = Math.max(-1, Math.min(1, e.gamma / 30)); kick(); } }, { passive: true });
  paint();

  /* ---------- buscador ---------- */
  const D = window.DATA;
  const INDEX = [];
  const add = (t, s, h, x) => INDEX.push({ t, s, h, x: x || "" });
  D.sitios.forEach((s) => add(s.nombre, `Must · ${s.zona}`, "#/ver", s.desc));
  D.noche.bloques.forEach((b) => { add(b.titulo, "La noche", "#/noche", b.texto); b.sitios.forEach((s) => add(s.nombre, `La noche · ${s.zona}`, "#/noche", s.nota)); });
  D.comer.bloques.forEach((b) => { add(b.titulo, "Comer", "#/comer", b.texto); b.sitios.forEach((s) => add(s.nombre, `Comer · ${s.zona}`, "#/comer", s.nota)); });
  D.eventos.forEach((e) => add(e.nombre, `Cartel ${e.fecha.slice(8)} · ${e.lugar}`, "#/agenda", e.genero));
  D.agenda.forEach((d) => add(d.nombre, "El finde", "#/agenda", d.dia.join(" ") + " " + d.noche.join(" ")));
  Object.values(D.practico).forEach((b) => { if (b && b.titulo) add(b.titulo, "Práctico", "#/practico", b.texto); });
  D.practico.frases.forEach((f) => add(`${f.es} → ${f.hu}`, "Frase", "#/practico", f.pron));
  add("Gastos a medias", "Saldo Álvaro/Juan", "#/gastos", "cuentas dinero pagar");
  add("Conversor EUR ⇄ HUF", "En la portada", "#/", "forintos cambio");

  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  function buscar(q) {
    q = norm(q.trim());
    if (q.length < 2) return [];
    const terms = q.split(/\s+/);
    return INDEX.map((e) => {
      const hayT = norm(e.t), hayS = norm(e.s), hayX = norm(e.x);
      let score = 0;
      for (const t of terms) {
        if (hayT.startsWith(t)) score += 5;
        else if (hayT.includes(t)) score += 3;
        else if (hayS.includes(t)) score += 2;
        else if (hayX.includes(t)) score += 1;
        else return null;
      }
      return { e, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 12).map((r) => r.e);
  }
  const sheet = $("#searchSheet"), input = $("#searchInput"), results = $("#searchResults");
  function openSearch() {
    sheet.hidden = false; input.value = "";
    results.innerHTML = '<p class="vacio">Garitos, musts, frases, cartel… todo indexado.</p>';
    setTimeout(() => input.focus(), 60);
  }
  $("#searchBtn").addEventListener("click", openSearch);
  addEventListener("keydown", (e) => {
    if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
    if (e.key === "Escape") $$(".sheet").forEach((s) => (s.hidden = true));
  });
  input.addEventListener("input", () => {
    const found = buscar(input.value);
    results.innerHTML = found.length
      ? found.map((e) => `<a class="search-hit" href="${e.h}"><b>${e.t}</b><span>${e.s}</span></a>`).join("")
      : (input.value.trim().length >= 2 ? '<p class="vacio">Nada con ese nombre. ¿Seguro que no era en Belgrado?</p>' : "");
  });
  results.addEventListener("click", (e) => { if (e.target.closest("a")) sheet.hidden = true; });

  /* ---------- splash primera visita ---------- */
  const splash = $("#splash");
  if (splash && !localStorage.getItem("bud26_seen")) {
    splash.hidden = false;
    document.body.style.overflow = "hidden";
    $("#splashGo").addEventListener("click", () => {
      localStorage.setItem("bud26_seen", "1");
      splash.classList.add("out");
      document.body.style.overflow = "";
      setTimeout(() => (splash.hidden = true), 650);
    });
  }

  window.BGFx = { openSearch };
})();
