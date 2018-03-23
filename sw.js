// Cache names
const staticCacheName = 'card-static';
const dynamicCacheName = 'cards-dynamic';
// Static assests to store in cache
const staticAssets = [
    './',
    './stylesheets/style.css',
    './javascripts/jquery.min.js',
    './javascripts/cards.js',
    './images/mana-leak.jpg',
    './fallback.json'
];

// Add the assets to the cache
self.addEventListener('install', async function () {
    console.log('adding static cache resources');
    const cache = await caches.open(staticCacheName);
    cache.addAll(staticAssets);
});

// Fixes a corner case in which the app wasn't returning the latest data.
self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== staticCacheName && key !== dynamicCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// Fetch data from cache or network
self.addEventListener('fetch', event => {
    console.log('fetching');
    const req = event.request;
    const url = new URL(req.url);

    if (url.origin === location.origin) {
        event.respondWith(cacheFirst(req));
    } else {
        event.respondWith(networkFirst(req));
    }
});

// Use cahce if it exists, fallback on network
async function cacheFirst(req) {
    const cachedResponse = await caches.match(req);
    return cachedResponse || fetch(req);
}

// Use the network and cache the response, fallback on cache
async function networkFirst(req) {
    const cache = await caches.open(dynamicCacheName);
    
    try {
        const res = await fetch(req);
        cache.put(req, res.clone()); // put instead of add for dynamic content
        console.log(cache.length);
        return res;
    } catch (error) {
        const cachedResponse = await cache.match(req);
        return cachedResponse || await caches.match('./fallback.json'); // Cache fallback
    }
}