// Service Worker for Quran Karim PWA - Sunni Tafsir Edition
const CACHE_NAME = 'quran-karim-cache-v20261126_sunni_v11';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './quran.png',
  './quran_512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('Pre-caching some assets failed:', err);
      });
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Purging old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  // Network first for all HTML and JS scripts
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
