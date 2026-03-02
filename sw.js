/* ============================================
   SERVICE WORKER — Doc Forge
   Permite que la app funcione sin conexión
   (PWA offline). Cachea todos los archivos
   necesarios en el primer acceso.
   ============================================ */

// Nombre de la caché. Cambia la versión cuando
// actualices archivos para forzar recarga.
const CACHE_NAME = 'docforge-v4';

// Lista de TODOS los archivos que la app necesita
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './src/css/app.css',
    './src/js/app.js',
    './src/js/visual-editor.js',
    './src/js/header-footer.js',
    './src/js/background-manager.js',
    './src/js/pdf-export.js',
    './src/js/html2canvas.min.js',
    './src/js/jspdf.umd.min.js',
    './src/fonts/dm-sans-latin-300-normal.woff2',
    './src/fonts/dm-sans-latin-400-normal.woff2',
    './src/fonts/dm-sans-latin-400-italic.woff2',
    './src/fonts/dm-sans-latin-500-normal.woff2',
    './src/fonts/dm-sans-latin-600-normal.woff2',
    './src/fonts/dm-sans-latin-700-normal.woff2',
    './src/fonts/jetbrains-mono-latin-400-normal.woff2',
    './src/fonts/jetbrains-mono-latin-500-normal.woff2',
    './assets/icons/icon-192.png',
    './assets/icons/icon-192.svg',
    './assets/icons/icon-512.png'
];

// INSTALL — Se ejecuta al registrar el SW por primera vez
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('[SW] Cacheando archivos...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(function() {
                // Activar inmediatamente sin esperar
                return self.skipWaiting();
            })
    );
});

// ACTIVATE — Limpia cachés antiguas
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(function(name) {
                        return name !== CACHE_NAME;
                    })
                    .map(function(name) {
                        console.log('[SW] Eliminando caché antigua:', name);
                        return caches.delete(name);
                    })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// FETCH — Intenta caché primero, luego red
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(cachedResponse) {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request);
            })
            .catch(function() {
                // Fallback para navegación
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            })
    );
});