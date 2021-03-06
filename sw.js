// Static assests to store in cache
const staticAssets = [
    './',
    './stylesheets/style.css',
    './node_modules/bootstrap/dist/css/bootstrap.min.css',
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.min.js',
    './javascripts/cards.js',
    './images/mana-leak.jpg',
    './fallback.json'
];

// Add the assets to the cache
self.addEventListener('install', async function () {
    const cache = await caches.open('card-static');
    cache.addAll(staticAssets);
    
});

// Fetch data from cache or network
self.addEventListener('fetch', event => {
    console.log('fetching...');
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
    const cache = await caches.open('cards-dynamic');

    try {
        const res = await fetch(req);
        cache.put(req, res.clone()); // put instead of add for dynamic content
        return res;
    } catch (error) {
        const cachedResponse = await cache.match(req);
        return cachedResponse || await caches.match('./fallback.json'); // Cache fallback
    }
}

// Listen for push events to push
self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const title = 'Push Codelab';
    const options = {
        body: 'Yay it works.',
        icon: 'images/icon.png',
        badge: 'images/badge.png'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Listen for clicks on the recieved notifications
self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('https://github.com/linulas/miniprojekt') // When clicked
    );
});

self.addEventListener('activate', function (event)
{
    event.waitUntil(self.clients.claim());
});