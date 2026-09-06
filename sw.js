const CACHE_NAME = 'duo-shop-v1';
const urlsToCache = [
  './',
  './index.html',
  './duoshop.css',
  './duoshop.js',
  './manifest.json',
  './assets/duo_logo.jpg',
  './assets/ubicacion.png'
  './terminos/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
