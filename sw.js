// GUCCI Golf — service worker.
// Netværk først: når der er forbindelse, hentes altid den nyeste udgave (så nye runder vises med det samme).
// Uden net vises den senest hentede udgave. Skift versionsnummeret, hvis cachen skal ryddes.
const CACHE = 'gucci-golf-v1';
const CORE = ['./', 'index.html', 'riviera.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  const own = u.origin === location.origin, font = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (r.method !== 'GET' || (!own && !font)) return;
  e.respondWith(
    fetch(r, own ? {cache:'no-cache'} : undefined)
      .then(res => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; })
      .catch(() => caches.match(r, {ignoreSearch:true}).then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
