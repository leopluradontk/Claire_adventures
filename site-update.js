/* Shared update/offline check. No user data is sent. */
(() => {
  'use strict';
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  let reloading = false;
  const hadController = Boolean(navigator.serviceWorker.controller);
  async function checkOffline() {
    if (!('caches' in window)) return;
    const studioFiles = ["bakery.html", "dress-up.html", "studios/bakery.js", "studios/characters.js", "studios/dress-up.js", "studios/food.js", "studios/model.js", "studios/style.css", "studios/ui.js", "studios/wardrobe.js", "treat-trail/progress.js", "treat-trail/audio.js", "treat-trail/themes.js"];
    const arcadeFiles = ["memory-match.html", "stuffy-snake.html", "arcade/style.css", "arcade/designs.js", "arcade/memory-model.js", "arcade/memory-app.js", "arcade/snake-model.js", "arcade/snake-art.js", "arcade/snake-app.js", "arcade/common.js", "arcade/store.js", "studios/ui.js", "studios/model.js", "studios/characters.js", "studios/wardrobe.js", "studios/style.css", "treat-trail/progress.js", "treat-trail/audio.js", "treat-trail/themes.js"];
    const clubFiles = ["clubhouse.html", "music-dance.html", "club-stage/art-copy.js", "club-stage/audio.js", "club-stage/catalog.js", "club-stage/clubhouse.js", "club-stage/common.js", "club-stage/dance.js", "club-stage/model.js", "club-stage/move-icons.js", "club-stage/performers.js", "club-stage/props.js", "club-stage/rhythm.js", "club-stage/style.css", "studios/model.js", "studios/wardrobe.js", "studios/characters.js", "studios/food.js", "treat-trail/progress.js", "treat-trail/audio.js", "treat-trail/themes.js", "coloring/art-data.js", "coloring/store.js", "coloring/art.js", "coloring/pages.js", "coloring/paint.js", "coloring/art/raspberry0.js", "coloring/art/together1.js", "coloring/art/together3.js", "coloring/art/pusheen1.js", "coloring/art/together0.js", "coloring/art/together4.js", "coloring/art/claire2.js", "coloring/art/claire0.js", "coloring/art/kitty1.js", "coloring/art/together2.js", "coloring/art/pusheen0.js", "coloring/art/kitty0.js", "coloring/art/raspberry1.js", "coloring/art/claire1.js"];
    const files = /\/(clubhouse|music-dance)\.html$/.test(location.pathname) ? clubFiles : /\/(memory-match|stuffy-snake)\.html$/.test(location.pathname) ? arcadeFiles : /\/(bakery|dress-up)\.html$/.test(location.pathname) ? studioFiles
      : location.pathname.endsWith('/coloring-time.html')
      ? ['coloring-time.html', 'coloring/style.css', 'coloring/app.js', 'coloring/paint.js', 'coloring/store.js', 'coloring/pages.js', 'coloring/art.js','coloring/art-data.js','coloring/art/claire0.js','coloring/art/claire1.js','coloring/art/claire2.js','coloring/art/pusheen0.js','coloring/art/pusheen1.js','coloring/art/kitty0.js','coloring/art/kitty1.js','coloring/art/raspberry0.js','coloring/art/raspberry1.js','coloring/art/together0.js','coloring/art/together1.js','coloring/art/together2.js','coloring/art/together3.js','coloring/art/together4.js']
      : location.pathname.endsWith('/treat-trail.html')
      ? ['treat-trail.html','treat-trail/style.css','treat-trail/game.js','treat-trail/levels.js','treat-trail/engine.js','treat-trail/renderer.js','treat-trail/audio.js','treat-trail/progress.js','treat-trail/celebration.js','treat-trail/release.css','treat-trail/themes.js','studios/wardrobe.js','studios/characters.js','studios/model.js']
      : ['treat-time.html','treat-time.css','treat-time.js'];
    try {
      const cache = await caches.open('claire-adventures-v10-club-stage-1.3.0');
      const ready = await Promise.all(files.map(file => cache.match(new URL(file, document.baseURI).href)));
      if (ready.every(response => response?.ok)) {
        document.documentElement.dataset.offlineReady = 'true';
        document.dispatchEvent(new Event('storybook:offline-ready'));
      }
    } catch (_) { /* Offline storage is optional. */ }
  }
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    checkOffline();
    if (document.body.dataset.gameRunning === 'true') {
      document.dispatchEvent(new Event('storybook:update-ready'));
    } else if (hadController && !reloading) {
      reloading = true;
      location.reload();
    }
  });
  async function start() {
    try {
      const registration = await navigator.serviceWorker.register('service-worker.js', {updateViaCache: 'none'});
      registration.update().catch(() => {});
      document.getElementById('refreshBtn')?.addEventListener('click', () => registration.update().catch(() => {}));
      await navigator.serviceWorker.ready;
      await checkOffline();
    } catch (error) {
      console.info('Offline saving is unavailable; online play still works.', error);
    }
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, {once: true});
})();
