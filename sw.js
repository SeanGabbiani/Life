// --- Game of Life PWA SW (cache-busted by CACHE name) ---
const CACHE = "life-pwa-v2";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Take over immediately on update
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for static assets, network-first for HTML navigations
self.addEventListener("fetch", (e) => {
  const req = e.request;

  // Only handle GETs
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isHTML = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    // Network first, fall back to cache
    e.respondWith(
      fetch(req).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return r;
      }).catch(() => caches.match(req, { ignoreSearch: true }))
    );
  } else {
    // Cache first for static assets
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then(hit =>
        hit || fetch(req).then(r => {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return r;
        })
      )
    );
  }
});
