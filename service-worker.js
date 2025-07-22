const CACHE_NAME = 'phone-app-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/base.css',
  '/css/layout.css',
  '/css/components/home.css',
  '/css/components/chat.css',
  '/css/components/settings.css',
  '/css/utilities.css',
  '/js/main.js',
  '/js/modules/chat.js',
  '/js/modules/settings.js',
  '/js/ui/view-manager.js',
  '/js/utils/storage.js',
  '/js/utils/time.js',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
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
