// Service Worker for Quran Karim PWA - Offline Tarteel AI & Sunni Tafsir Edition
const CACHE_NAME = 'quran-karim-cache-v20261126_sunni_v16';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './quran_voice_ai_engine.js?v=20261126_sunni_v16',
  './quran_offline_whisper_worker.js?v=20261126_sunni_v16',
  './tafsir_nami_audio_data.js?v=20261126_sunni_v16',
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
          // Keep 'transformers-cache' so downloaded Offline Quran ONNX models persist across app updates!
          if (cache !== CACHE_NAME && cache !== 'transformers-cache') {
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

  const url = event.request.url;
  // Let HuggingFace Hub ONNX weights use Transformers.js native 'transformers-cache' directly
  if (url.includes('huggingface.co/')) return;

  // Cache-on-network-success for app files & jsDelivr Transformers/ONNX WASM runtime so Airplane Mode works 100%
  const isCacheableRuntime = url.startsWith(self.location.origin) || url.includes('cdn.jsdelivr.net/npm/@xenova/transformers') || url.includes('cdn.jsdelivr.net/npm/@huggingface/transformers');

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (isCacheableRuntime && networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)).catch(() => {});
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request, { ignoreSearch: false }).then(res => {
          return res || caches.match(event.request, { ignoreSearch: true });
        });
      })
  );
});
