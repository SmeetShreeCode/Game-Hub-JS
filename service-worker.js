const cacheName = 'puzzle-craft-v1';
const filesToCache = [
    './',
    './index.html',
    './css/image-puzzle.css',
    './js/image-puzzle.js',
    './images/puzzle.png',
    './icon.png',
    './icon.png',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.filter(cn => cn !== cacheName).map(cn => caches.delete(cn))
            )
        )
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

