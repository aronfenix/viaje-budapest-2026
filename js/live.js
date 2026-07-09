/* ============================================================
   BUDAPEST 26 · live.js — reloj, clima, HUF y «¿y ahora qué?»
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c) => (c || document).querySelector(s);
  const esc = (s) => window.BGCore.esc(s);

  const WMO = {
    0: ["☀️", "Despejado"], 1: ["🌤", "Casi despejado"], 2: ["⛅", "Nubes y claros"], 3: ["☁️", "Nublado"],
    45: ["🌫", "Niebla"], 48: ["🌫", "Niebla"], 51: ["🌦", "Llovizna"], 53: ["🌦", "Llovizna"], 55: ["🌧", "Llovizna"],
    61: ["🌧", "Lluvia débil"], 63: ["🌧", "Lluvia"], 65: ["🌧", "Lluvia fuerte"], 80: ["🌦", "Chubascos"],
    81: ["🌧", "Chubascos"], 82: ["⛈", "Chubascos fuertes"], 95: ["⛈", "Tormenta"], 96: ["⛈", "Tormenta"], 99: ["⛈", "Tormenta"],
  };
  const wmo = (c) => WMO[c] || ["🌡", "—"];

  let weather = null;
  try { weather = JSON.parse(localStorage.getItem("bud26_meteo") || "null"); } catch {}

  const fmtHora = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Budapest" });

  function dashSkeleton() {
    const box = $("#liveDash"); if (!box) return;
    box.innerHTML = `<div class="live-dash reveal in">
      <div class="ld-row">
        <div class="ld-clock"><span class="ld-label">Ahora en Budapest</span>
          <b id="ldTime">--:--:--</b>
          <span class="ld-sub">misma hora que en España</span></div>
        <div class="ld-weather" id="ldWeather"><span class="ld-label">&nbsp;</span><b>…</b><span class="ld-sub">cargando clima</span></div>
        <div class="ld-sun" id="ldSun"><span class="ld-label">Atardecer</span><b>~20:20</b><span class="ld-sub" id="ldSunIn">hora dorada en el Bastión</span></div>
      </div>
      <div class="ld-strip" id="ldStrip"></div>
      <button class="btn ahora-btn" id="ahoraBtn">✨ ¿Y ahora qué hacemos?</button>
    </div>`;
    $("#ahoraBtn").addEventListener("click", abrirAhora);
    tick(); pintarClima();
  }

  function tick() {
    const t = $("#ldTime");
    if (t) t.textContent = fmtHora.format(new Date());
    const si = $("#ldSunIn");
    if (si && weather && weather.daily) {
      try {
        const hoy = new Date().toISOString().slice(0, 10);
        const i = weather.daily.time.indexOf(hoy);
        const sunset = new Date(weather.daily.sunset[i]);
        const d = sunset - new Date();
        si.textContent = d > 0
          ? `en ${Math.floor(d / 36e5) ? Math.floor(d / 36e5) + " h " : ""}${Math.floor(d / 6e4) % 60} min · hora dorada en el Bastión`
          : "el sol ya se puso — hora del distrito VII";
      } catch {}
    }
  }
  setInterval(tick, 1000);

  function pintarClima() {
    const w = weather, elW = $("#ldWeather"), elS = $("#ldSun"), strip = $("#ldStrip");
    if (!elW || !w || !w.current) return;
    const [ico, txt] = wmo(w.current.weather_code);
    elW.innerHTML = `<span class="ld-label">${ico} ${esc(txt)}</span>
      <b>${Math.round(w.current.temperature_2m)}°</b>
      <span class="ld-sub">sensación ${Math.round(w.current.apparent_temperature)}°</span>`;
    const hoyIso = new Date().toISOString().slice(0, 10);
    const i = w.daily.time.indexOf(hoyIso);
    if (i >= 0 && elS) {
      elS.innerHTML = `<span class="ld-label">Atardecer</span><b>${w.daily.sunset[i].slice(11, 16)}</b>
        <span class="ld-sub" id="ldSunIn">hora dorada en el Bastión</span>`;
    }
    const finde = w.daily.time.map((d, ix) => ({ d, ix })).filter((x) => x.d >= "2026-07-31" && x.d <= "2026-08-03");
    const dias = finde.length ? finde : w.daily.time.map((d, ix) => ({ d, ix })).slice(1, 8);
    strip.innerHTML = dias.map(({ d, ix }) => {
      const [i2] = wmo(w.daily.weather_code[ix]);
      const en = d >= "2026-07-31" && d <= "2026-08-03";
      return `<div class="ld-day ${en ? "trip" : ""}">
        <span>${+d.slice(8)}<i>${["L","M","X","J","V","S","D"][(new Date(d + "T12:00").getDay() + 6) % 7]}</i></span>
        <b>${i2}</b>
        <span>${Math.round(w.daily.temperature_2m_max[ix])}°<i>${Math.round(w.daily.temperature_2m_min[ix])}°</i></span>
      </div>`;
    }).join("");
    if (finde.length) strip.insertAdjacentHTML("afterbegin", '<p class="ld-strip-tag">Vuestro finde ↓</p>');
  }

  async function cargarClima() {
    try {
      const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=47.4979&longitude=19.0402&current=temperature_2m,apparent_temperature,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=Europe%2FBudapest&forecast_days=16");
      if (!r.ok) throw 0;
      weather = await r.json();
      localStorage.setItem("bud26_meteo", JSON.stringify(weather));
      pintarClima();
    } catch {}
  }

  /* ---------- conversor EUR ⇄ HUF ---------- */
  let rate = +(localStorage.getItem("bud26_fx") || 395);
  let rateFecha = localStorage.getItem("bud26_fx_date") || null;
  async function cargarFx() {
    const hoy = new Date().toISOString().slice(0, 10);
    if (rateFecha === hoy) return;
    try {
      const r = await fetch("https://open.er-api.com/v6/latest/EUR");
      if (!r.ok) throw 0;
      const j = await r.json();
      if (j && j.rates && j.rates.HUF) {
        rate = j.rates.HUF;
        localStorage.setItem("bud26_fx", String(rate));
        localStorage.setItem("bud26_fx_date", hoy);
        rateFecha = hoy;
        pintaFxNota();
      }
    } catch {}
  }
  function pintaFxNota() {
    const n = $("#fxNotaH");
    if (n) n.textContent = `1 € = ${rate.toFixed(0)} HUF · ${rateFecha ? "tipo de hoy" : "tipo aproximado"} · evitad los cambios de Váci utca`;
    const refs = $("#fxRefsH");
    if (refs) refs.innerHTML = [["🍺 caña", 1100], ["🫓 lángos", 2200], ["🍲 gulyás", 3800], ["🛁 Széchenyi", 13500], ["🚋 BKK 72h", 5500]]
      .map(([t, v]) => `<span class="fx-ref">${t}<b>${v.toLocaleString("es")} Ft ≈ ${(v / rate).toFixed(1)} €</b></span>`).join("");
  }
  function initFx() {
    const eur = $("#fxEurH"), huf = $("#fxRsdH");
    if (eur && !eur.dataset.wired) {
      eur.dataset.wired = "1";
      const upd = (from) => {
        if (from === "eur") huf.value = Math.round((+eur.value || 0) * rate);
        else eur.value = ((+huf.value || 0) / rate).toFixed(2);
      };
      eur.addEventListener("input", () => upd("eur"));
      huf.addEventListener("input", () => upd("huf"));
      upd("eur");
    }
    pintaFxNota(); cargarFx();
  }

  /* ---------- ¿y ahora qué? ---------- */
  function abrirAhora() {
    const D = window.DATA, C = window.BGCore;
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;
    const temp = weather && weather.current ? weather.current.temperature_2m : null;
    const lluvia = weather && weather.current && [51,53,55,61,63,65,80,81,82,95,96,99].includes(weather.current.weather_code);
    const wd = ((now.getDay() + 6) % 7) + 1;
    const sug = [];
    if (lluvia) sug.push({ t: "☔ Llueve: plan de interior", d: "Termas (el plan perfecto bajo lluvia), Basílica, o directamente Kisüzem, que abre desde mediodía.", h: "#/ver" });
    if (h >= 7 && h < 11) {
      sug.push({ t: "🥐 Mañana bien empezada", d: wd === 6 ? "Sábado: Mercado Central ANTES de las 15 (lángos arriba) y de ahí a la orilla del Danubio." : "Musts con fresco: Parlamento, Zapatos, Basílica — todo seguido a pie por la orilla.", h: "#/ver" });
    } else if (h >= 11 && h < 17) {
      if (temp != null && temp >= 30) sug.push({ t: `🥵 ${Math.round(temp)}°: al agua`, d: "Széchenyi (mejor después de las 16) o esperar al Rudas nocturno si es viernes. El asfalto puede esperar.", h: "#/ver" });
      else sug.push({ t: "🚶 Hora de cruzar el río", d: "Puente de las Cadenas a pie y subida al Castillo/Bastión. O tranvía 2 arriba y abajo por la orilla: la mejor atracción gratis.", h: "#/ver" });
    } else if (h >= 17 && h < 20.5) {
      sug.push({ t: "🌇 Atardecer en el Bastión", d: "La postal con la mejor luz. Y bajando, primera caña del VII de camino al hotel.", h: "#/ver" });
    } else {
      sug.push({ t: "🎸 Es la hora de los primos", d: "Fekete Kutya o Kisüzem de apertura, Vittula cuando pida sótano, Robot si hay concierto. Todo a 10 min de la cama.", h: "#/noche" });
      if (wd === 5) sug.push({ t: "🛁 ¿Viernes? RUDAS NOCTURNO", d: "22:00–03:00, jacuzzi en la azotea sobre el Danubio. Si tenéis entrada, es LA noche.", h: "#/ver" });
    }
    sug.push({ t: "🎲 Comodín", d: ["Lángos de emergencia en Karaván.", "Tranvía 2 entero, ida y vuelta, mirando por la ventana.", "New York Café si la cola es corta: palacio + café.", "Csak a jó sör: una cerveza rara que no conozcáis."][Math.floor(Math.random() * 4)], h: "#/comer" });
    $("#ahoraBody").innerHTML = sug.map((s) => `<a class="ahora-card" href="${s.h}"><b>${s.t}</b><p>${s.d}</p></a>`).join("") +
      `<p class="muted small" style="margin-top:10px">Con la hora${temp != null ? " y el clima reales" : " real"} de Budapest. Sugerencias, no órdenes 💡</p>`;
    $("#ahoraSheet").hidden = false;
  }
  document.addEventListener("click", (e) => { if (e.target.closest(".ahora-card")) $("#ahoraSheet").hidden = true; });

  dashSkeleton();
  cargarClima();
  initFx();
  setInterval(cargarClima, 30 * 60 * 1000);

  window.BGLive = { initFx };
})();
