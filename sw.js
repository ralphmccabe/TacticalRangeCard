/* TRC-VERSION - v7.27.31 */
const CACHE_NAME = 'trc-v7.27.31';
const ASSETS = [
    './',
    './index.html?v=7.27.1',
    './style.css?v=1.7',
    './trc_core.js?v=8.0.7',
    './manifest.json',
    './icon-512.png',
    './icon-192.png',
    './splash-page.jpg',
    './tailwind.css',
    './lucide.min.js?v=1.5',
    './html2canvas.min.js?v=1.5',
    './idb_helper.js?v=1.5'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Caching New Version:', CACHE_NAME);
            return cache.addAll(ASSETS).catch(err => {
                console.error('[SW] Cache addAll failed:', err);
                // Continue installing even if a specific asset fails
            });
        })
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => {
                    console.log('[SW] Deleting Old Cache:', key);
                    return caches.delete(key);
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Dynamic Offline Caching Strategy
self.addEventListener('fetch', event => {
    // Bypass cache completely for version history to ensure live updates
    if (event.request.url.includes('VERSION_HISTORY.txt') || event.request.url.includes('api.open-meteo.com')) {
        event.respondWith(fetch(event.request));
        return;
    }
    
    // Only cache GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
            if (cachedResponse) {
                // If it's in cache, return it immediately, but fetch a new one in the background if it's the main page
                return cachedResponse;
            }

            // If not in cache, fetch from network and dynamically add it to the cache!
            return fetch(event.request).then(networkResponse => {
                // Check if we received a valid response
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
                    return networkResponse;
                }

                // Clone the response because it's a stream
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    // Do not cache chrome-extension:// or other weird schemes
                    if (event.request.url.startsWith('http')) {
                        cache.put(event.request, responseToCache);
                    }
                });

                return networkResponse;
            }).catch(error => {
                console.error('[SW] Fetch failed; returning offline fallback if available.', error);
                // Fallback to cached index.html for navigation requests to prevent the Chrome offline Dinosaur screen
                if (event.request.mode === 'navigate' || event.request.destination === 'document' || event.request.url.includes('index.html')) {
                    return caches.match('./index.html?v=7.27.0', { ignoreSearch: true }).then(fallback => {
                        return fallback || caches.match('./', { ignoreSearch: true });
                    });
                }
                throw error;
            });
        })
    );
});



































































































