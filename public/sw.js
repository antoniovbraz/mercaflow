// MercaFlow Service Worker
// Versão básica para resolver 404s

const CACHE_NAME = 'mercaflow-v1'
const urlsToCache = [
  '/',
  '/login',
  '/register',
  '/dashboard'
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
      })
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
  )
})