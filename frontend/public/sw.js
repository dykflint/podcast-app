import { apiFetch } from '../src/api.js';
const CACHE_NAME = 'podnotes-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
});

self.addEventListener('fetch', e => {
  const { request } = e;

  // App shell
  if (request.mode === 'navigate') {
    e.respondWith(caches.match('/index.html').then(res => res || apiFetch(request)));
    return;
  }

  // API calls (network first)
  if (request.url.includes('/api/')) {
    e.respondWith(
      apiFetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request)),
    );
  }
});
self.addEventListener('activate', () => self.clients.claim());
