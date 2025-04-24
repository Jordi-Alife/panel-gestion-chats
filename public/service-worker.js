self.addEventListener('install', event => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activado');
});

self.addEventListener('fetch', event => {
  // No interceptamos nada por ahora
});

// Notificación de prueba
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    self.registration.showNotification('Notificación de prueba', {
      body: 'Este es el contenido de una notificación enviada desde el Service Worker.',
      icon: '/icon-192x192.png',
    });
  }
});
