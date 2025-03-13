const CACHE_NAME = "pwa-cache-v1"; // Change version when updating files
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.json",
    "/service-worker.js"
];

// Install event - Cache required files
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting(); // Activate new service worker immediately
});

// Fetch event - Serve files from cache first, then update from network
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone()); // Update cache
                    return networkResponse;
                });
            });
        }).catch(() => caches.match("/index.html")) // Fallback to index.html if offline
    );
});

// Activate event - Clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim(); // Take control of all pages
});
