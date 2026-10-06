/* Generated at build time by the precache plugin in vite.config.ts. Do not edit public/sw.js. */
const VERSION = "__VERSION__";
const PRECACHE = __PRECACHE__;
const CACHE = `umrah-${VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("umrah-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // API calls always go to the network; progress is stored in IndexedDB, not in this cache.
  if (url.pathname.startsWith("/api/")) return;
  // Audio is streamed on demand and never precached.
  if (req.destination === "audio") return;

  if (req.mode === "navigate") {
    // SPA: network first so updates arrive, falling back to the cached shell offline.
    event.respondWith(fetch(req).catch(() => caches.match("/index.html", { ignoreSearch: true })));
    return;
  }
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            void caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
