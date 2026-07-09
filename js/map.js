/* ============================================================
   BUDAPEST 26 · map.js — Leaflet, capas y rutas
   ============================================================ */
(function () {
  "use strict";
  let map, groups = {}, notaLayer, tiles, routeLayer;

  const COLORES = { hotel: "#d84a36", ver: "#c9a227", comer: "#e0912f", noche: "#6d84f5", nota: "#72b56c" };
  const ETIQ = { hotel: "🏨 Hotel", ver: "◈ Musts", comer: "♨ Comer", noche: "🎸 Noche", nota: "✎ Notas" };

  function pin(color, emoji) {
    return L.divIcon({
      className: "", iconSize: [26, 26], iconAnchor: [13, 24], popupAnchor: [0, -22],
      html: `<div class="pin-dot" style="background:${color}"><span>${emoji}</span></div>`,
    });
  }
  const gmaps = (c) => `<a href="https://www.google.com/maps/search/?api=1&query=${c.join(",")}" target="_blank" rel="noopener">Cómo llegar ↗</a>`;

  const TILE_LIGHT = { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", opt: { maxZoom: 19, attribution: "© OpenStreetMap" } };
  const TILE_DARK = { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", opt: { maxZoom: 19, attribution: "© OpenStreetMap © CARTO" } };
  function setTiles() {
    if (!map) return;
    const t = document.documentElement.dataset.theme === "dark" ? TILE_DARK : TILE_LIGHT;
    if (tiles) map.removeLayer(tiles);
    tiles = L.tileLayer(t.url, t.opt).addTo(map);
  }

  function puntos() {
    const D = window.DATA;
    const pts = [];
    pts.push({ cap: "hotel", coords: D.viaje.alojamiento.coords, emoji: "🏨", pop: `<b>${D.viaje.alojamiento.nombre}</b><br>${D.viaje.alojamiento.direccion}<br>` });
    D.sitios.forEach((s) => pts.push({ cap: "ver", coords: s.coords, emoji: "◈", pop: `<b>${s.nombre}</b><br>${s.zona} · ${s.precio}<br>` }));
    D.comer.bloques.forEach((b) => b.sitios.forEach((s) => { if (s.coords) pts.push({ cap: "comer", coords: s.coords, emoji: "♨", pop: `<b>${s.nombre}</b><br>${s.zona}<br>${s.nota}<br>` }); }));
    D.noche.bloques.forEach((b) => b.sitios.forEach((s) => { if (s.coords) pts.push({ cap: "noche", coords: s.coords, emoji: "🎸", pop: `<b>${s.nombre}</b><br>${s.zona}<br>${s.nota}<br>` }); }));
    return pts;
  }

  function refreshNotas() {
    if (!map || !notaLayer) return;
    notaLayer.clearLayers();
    (window.BGNotas ? BGNotas.getNotas() : []).forEach((n) => {
      if (!n.coords) return;
      L.marker(n.coords, { icon: pin(COLORES.nota, "✎") })
        .bindPopup(`<b>${n.nombre}</b><br>${n.cat}${n.zona ? "<br>📍 " + n.zona : ""}${n.texto ? "<br>" + n.texto : ""}<br>` + gmaps(n.coords))
        .addTo(notaLayer);
    });
  }

  function drawRoute() {
    if (!map || !window.__route) return;
    const pts = window.__route; window.__route = null;
    if (routeLayer) map.removeLayer(routeLayer);
    routeLayer = L.layerGroup().addTo(map);
    const hotel = window.DATA.viaje.alojamiento.coords;
    const coords = [hotel, ...pts.map((p) => p.coords)];
    L.polyline(coords, { color: "#d84a36", weight: 3, dashArray: "8 8", opacity: .8 }).addTo(routeLayer);
    L.marker(hotel, { icon: pin("#d84a36", "🏨") }).bindPopup("<b>Salida: hotel</b>").addTo(routeLayer);
    pts.forEach((p) => {
      L.marker(p.coords, { icon: L.divIcon({ className: "", iconSize: [28, 28], iconAnchor: [14, 14], html: `<div class="route-pin">${p.n}</div>` }) })
        .bindPopup(`<b>${p.n}. ${p.nombre}</b><br>` + gmaps(p.coords)).addTo(routeLayer);
    });
    map.fitBounds(L.latLngBounds(coords).pad(0.2));
  }

  function init() {
    const box = document.getElementById("mapBox");
    if (!box || map) { invalidate(); return; }
    map = L.map(box, { zoomControl: true }).setView(window.DATA.viaje.alojamiento.coords, 14);
    setTiles();
    addEventListener("bg26:theme", setTiles);

    const hotel = window.DATA.viaje.alojamiento.coords;
    [[750, "≈10 min a pie"], [1500, "≈20 min"], [2250, "≈30 min"]].forEach(([m, txt]) => {
      L.circle(hotel, { radius: m, color: "#d84a36", weight: 1.2, dashArray: "5 7", fill: false, opacity: .55 })
        .bindTooltip(txt).addTo(map);
    });

    Object.keys(ETIQ).forEach((k) => { groups[k] = L.layerGroup().addTo(map); });
    notaLayer = groups.nota;
    puntos().forEach((p) => {
      L.marker(p.coords, { icon: pin(COLORES[p.cap], p.emoji) }).bindPopup(p.pop + gmaps(p.coords)).addTo(groups[p.cap]);
    });
    refreshNotas();

    const filtros = document.getElementById("mapFiltros");
    filtros.innerHTML = Object.entries(ETIQ).map(([k, v]) => `<button class="on" data-cap="${k}">${v}</button>`).join("");
    filtros.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const g = groups[b.dataset.cap];
      if (map.hasLayer(g)) { map.removeLayer(g); b.classList.remove("on"); }
      else { map.addLayer(g); b.classList.add("on"); }
    });

    map.on("click", (e) => {
      if (!window.__pickingNote) return;
      window.__pickingNote = false;
      window.BGNotas && BGNotas.setCoordsFromMap(e.latlng.lat, e.latlng.lng);
      location.hash = "#/cuaderno";
    });

    setTimeout(invalidate, 120);
  }

  function invalidate() {
    if (!map) return;
    map.invalidateSize();
    if (window.__flyTo) { map.flyTo(window.__flyTo, 16, { duration: .9 }); window.__flyTo = null; }
    drawRoute();
  }

  window.BGMap = { init, invalidate, refreshNotas };
})();
