// public/service-worker.js

self.addEventListener('install', event => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activado');
  clients.claim(); // Control inmediato
});

self.addEventListener('fetch', event => {
  // Deja pasar todas las peticiones sin cachear
  event.respondWith(fetch(event.request).catch(() => new Response("Offline")));
});
