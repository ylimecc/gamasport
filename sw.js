/* Modo sin conexión de GamaSport.

   Guarda la página 404, que se basta sola (lleva sus estilos dentro), y la
   muestra cuando alguien navega sin internet. Así el visitante ve la marca y
   los enlaces para volver, en vez del error del navegador. */
const CACHE   = "gamasport-offline-v2";
const OFFLINE = new URL("404.html", self.location).pathname;

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.add(OFFLINE))
      .then(() => self.skipWaiting())
  );
});

/* Al activarse borra las versiones anteriores del caché: sin esto, quien ya
   visitó el sitio seguiría viendo la página guardada de la versión vieja. */
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match(OFFLINE)));
  }
});
