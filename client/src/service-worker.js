// REQ: FR-UI-005 (Service worker for PWA functionality)
// Note: PWA manifest is in client/public/manifest.json

// Basic service worker for PWA install capability
// No offline caching per BRD requirements

const CACHE_NAME = 'uto-bloom-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  event.waitUntil(clients.claim());
});

// Fetch event - no caching per BRD
self.addEventListener('fetch', (event) => {
  // Network-first strategy (no offline cache)
  event.respondWith(fetch(event.request));
});
