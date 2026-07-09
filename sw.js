/* BUDAPEST 26 · service worker — offline-first */
const VERSION = "bud26-v1";
const PRECACHE = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./js/map.js",
  "./js/fx.js",
  "./js/live.js",
  "./data/budapest.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("bud26-") && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;

  if (url.hostname.endsWith("tile.openstreetmap.org") || url.hostname.endsWith("basemaps.cartocdn.com")) return;

  if (url.hostname === "api.open-meteo.com" || url.hostname === "open.er-api.com") {
    e.respondWith(
      fetch(e.request)
        .then((r) => { if (r.ok) { const c = r.clone(); caches.open(VERSION).then((x) => x.put(e.request, c)); } return r; })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((r) => { caches.open(VERSION).then((c) => c.put("./index.html", r.clone())); return r; })
        .catch(() => caches.open(VERSION).then((c) => c.match("./index.html")))
    );
    return;
  }

  e.respondWith(
    caches.open(VERSION).then((c) => c.match(e.request)).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((r) => {
        const cacheable = url.origin === location.origin || url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com" || url.hostname === "unpkg.com";
        if (cacheable && r.ok) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
        return r;
      });
    })
  );
});
