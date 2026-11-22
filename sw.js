// Service worker de Feria Pekerón: solo guarda los archivos de la app para que abra rápido.
// Los datos (publicaciones, tiendas) siempre se piden al servidor.
// Al cambiar archivos de la app, subir la versión de C.
// Vive en su propio dominio: no comparte caché con Pekerón Gestión.
const C = 'feria-v5';
const F = [
  './', './index.html', './manifest.webmanifest', './css/feria.css',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png',
  './js/main.js', './js/config.js',
  './js/lib/util.js', './js/lib/dom.js', './js/lib/iconos.js', './js/lib/fotos.js', './js/lib/instalar.js', './js/lib/anuncio.js',
  './js/datos/index.js', './js/datos/gestion.js', './js/datos/filtro.js', './js/datos/guardado-local.js', './js/datos/local.js', './js/datos/firebase.js', './js/datos/catalogo.js',
  './js/vistas/componentes.js', './js/vistas/zona.js', './js/vistas/inicio.js', './js/vistas/categorias.js', './js/vistas/buscar.js',
  './js/vistas/producto.js', './js/vistas/tiendas.js', './js/vistas/tienda.js', './js/vistas/cuenta.js',
  './js/vistas/panel.js', './js/vistas/publicar.js', './js/vistas/mi-tienda.js', './js/vistas/perfil.js', './js/vistas/mi-cuenta.js', './js/vistas/compras.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(C).then((c) => c.addAll(F.map((u) => new Request(u, { cache: 'reload' })))));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Borra solo cachés viejas de la Feria (nunca otras).
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((n) => n.startsWith('feria-') && n !== C).map((n) => caches.delete(n)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  // Red primero (para ver siempre lo último); si no hay conexión, la copia guardada.
  e.respondWith(
    fetch(e.request).then((r) => {
      if (r.ok) { const copia = r.clone(); caches.open(C).then((c) => c.put(e.request, copia)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html')))
  );
});
