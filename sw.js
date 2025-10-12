const CACHE = "life-pwa-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  // Network-first for documents, cache-first for others
  if (req.destination === "document") {
    e.respondWith(
      fetch(req).then((r) => {
        caches.open(CACHE).then((c) => c.put(req, r.clone()));
        return r;
      }).catch(() => caches.match(req))
    );
  } else {
    e.respondWith(
      caches.match(req).then((hit) =>
        hit ||
        fetch(req).then((r) => {
          caches.open(CACHE).then((c) => c.put(req, r.clone()));
          return r;
        })
      )
    );
  }
});
