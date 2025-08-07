export {};

const CACHE_NAME = 'remixense-v1';
const urlsToCache = ['/', '/manifest.json'];

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache: Cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event: any) => {
  event.respondWith(
    caches.match(event.request).then((response: Response | undefined) => {
      return response || fetch(event.request);
    })
  );
});
