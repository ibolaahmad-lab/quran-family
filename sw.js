// Service Worker for Quran Karim PWA
const CACHE_NAME = 'quran-karim-cache-v20261125_v8';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './quran.png',
  './quran_512.png',
  './app_v4_master_overhaul.js',
  './murajaa_features_engine.js',
  './quran_voice_ai_engine.js'
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
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Let network handle dynamic requests, fallback to cache if offline
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
