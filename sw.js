const CACHE_NAME = 'duo-shop-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/duoshop.css',
  '/duoshop.js',
  '/manifest.json',
  '/assets/duo_logo.jpg',
  '/assets/ubicacion.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
