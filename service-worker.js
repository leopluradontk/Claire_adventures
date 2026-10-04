/* Version 8: Stuffy Studios 1.1 and network-first updates with an offline fallback. */
const CACHE = 'claire-adventures-v8-studios-1.1.0';
const ROOT = new URL('./', self.location.href);
const CORE = ['index.html', 'styles.css', 'app.js', 'stories.json',
  'manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png',
  'treat-time.html', 'treat-time.css', 'treat-time.js', 'site-update.js',
  'treat-trail.html', 'treat-trail/style.css', 'treat-trail/game.js',
  'treat-trail/engine.js', 'treat-trail/levels.js', 'treat-trail/renderer.js',
  'treat-trail/audio.js', 'treat-trail/progress.js', 'treat-trail/celebration.js', 'treat-trail/release.css','treat-trail/themes.js',
  'coloring-time.html','coloring/style.css','coloring/app.js','coloring/paint.js','coloring/store.js','coloring/pages.js','coloring/art.js','coloring/art-data.js','coloring/art/claire0.js','coloring/art/claire1.js','coloring/art/claire2.js','coloring/art/pusheen0.js','coloring/art/pusheen1.js','coloring/art/kitty0.js','coloring/art/kitty1.js','coloring/art/raspberry0.js','coloring/art/raspberry1.js','coloring/art/together0.js','coloring/art/together1.js','coloring/art/together2.js','coloring/art/together3.js','coloring/art/together4.js',
  'bakery.html','dress-up.html','studios/bakery.js','studios/characters.js','studios/dress-up.js','studios/food.js','studios/model.js','studios/style.css','studios/ui.js','studios/wardrobe.js'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE.map(path => new Request(new URL(path, ROOT), {cache: 'reload'})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Retain previously saved story pages. Do not touch other sites' caches.
    for (const name of (await caches.keys()).filter(key => key.startsWith('claire-adventures-') && key !== CACHE)) {
      if (!(await caches.has(name))) continue;
      const old = await caches.open(name);
      let copied = true;
      for (const request of await old.keys()) {
        const url = new URL(request.url);
        if (url.origin === ROOT.origin && url.pathname.startsWith(ROOT.pathname + 'stories/')) {
          const response = await old.match(request);
          if (response?.ok) {
            try { await cache.put(url.origin + url.pathname, response); }
            catch (_) { copied = false; }
          }
        }
      }
      if (copied) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  // Normalize timestamps so the offline catalog is reusable after a refresh.
  const key = url.origin + (url.pathname === ROOT.pathname ? ROOT.pathname + 'index.html' : url.pathname);
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(event.request, {cache: 'no-store'});
      if (response.ok) {
        try { await cache.put(key, response.clone()); } catch (_) { /* Storage can be full. */ }
        return response;
      }
      return (await cache.match(key)) || response;
    } catch (_) {
      const saved = await cache.match(key);
      if (saved) return saved;
      if (event.request.mode === 'navigate') {
        return new Response('<h1>You are offline</h1><p>Connect to the internet once to save this page for next time.</p>', {status: 503, headers: {'Content-Type': 'text/html; charset=utf-8'}});
      }
      return Response.error();
    }
  })());
});
