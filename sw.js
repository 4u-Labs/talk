/**
 * TalkMotion - sw.js
 * Service Worker para Suporte PWA e Cache Offline
 * 4U.IA.BR
 */

const CACHE_NAME = 'talkmotion-v2.0';
const ASSETS = [
  './',
  './index.php',
  './manifest.json',
  './favicon.svg',
  './favicon.ico',
  './favicon-32x32.png',
  './icon-192.png',
  './icon-512.png',
  './style_main.css',
  './lib_app.js',
  './privacidade.php',
  './termos.php',
  './suporte.php'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Apenas intercepta GET e não intercepta chamadas de API
  if (event.request.method !== 'GET') return;
  const url = event.request.url;
  if (url.includes('api_') || url.includes('/api/') || url.includes('accounts.google.com') || url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        if (!res || res.status !== 200 || res.type !== 'basic') {
          return res;
        }
        const toCache = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, toCache));
        return res;
      }).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.php');
        }
      });
    })
  );
});
