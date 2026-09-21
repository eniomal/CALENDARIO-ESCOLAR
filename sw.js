/* Service Worker - Calendario Escolar 2026-2027
   Desarrolló: Enio Maldonado
   Estrategia: cache-first para que la app funcione 100% offline. */

const CACHE = "calendario-escolar-2627-v2";

const ASSETS = [
  "./",
  "./Calendario-Escolar-2026-2027.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
  "./favicon-64.png"
];

// Instalación: precachea los archivos de la app
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activación: limpia caches viejos de versiones anteriores
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: responde desde cache; si no está, va a la red y lo guarda
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Guarda una copia de recursos del mismo origen
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          // Si falla la red y es una navegación, sirve la app cacheada
          if (req.mode === "navigate") {
            return caches.match("./Calendario-Escolar-2026-2027.html");
          }
        });
    })
  );
});
