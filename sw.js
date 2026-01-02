const CACHE_NAME = 'menuia-dynamic-v1';

// SIMPLIFIED SW: No pre-caching strict list to prevent install failures.
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install Immediate');
    self.skipWaiting(); // Build momentum
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Network First, Fallback to Cache strategy
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    // Cache successful GET requests
                    if (event.request.method === 'GET' && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Priority 1: Focus existing window
            for (const client of clientList) {
                // Check if the client matches the notification's target URL or related app pages
                if ((client.url.includes('repartidor.html') || client.url.includes('menu.html') || client.url.includes('index.html')) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Priority 2: Open new window if none exists
            if (clients.openWindow) {
                const urlToOpen = event.notification.data?.url || '/repartidor.html'; // Default to driver if unsure, or contextual
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

