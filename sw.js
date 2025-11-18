// Extremely safe, transparent service worker for Life PWA.
// No offline caching yet – just makes sure old broken caches are gone
// and that we don't interfere with normal network loading.

const LIFE_CACHE_PREFIX = 'life-pwa';

// Install: activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate: delete any old Life-related caches, then take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith(LIFE_CACHE_PREFIX))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: just go straight to the network, no caching.
// This makes the SW effectively "transparent" and very hard to break.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
