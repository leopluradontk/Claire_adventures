/* Shared update/offline check. No user data is sent. */
(() => {
  'use strict';
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  let reloading = false;
  const hadController = Boolean(navigator.serviceWorker.controller);
  async function checkOffline() {
    if (!('caches' in window)) return;
    const files = location.pathname.endsWith('/treat-trail.html')
      ? ['treat-trail.html','treat-trail/style.css','treat-trail/game.js','treat-trail/levels.js','treat-trail/engine.js','treat-trail/renderer.js','treat-trail/audio.js','treat-trail/progress.js','treat-trail/celebration.js','treat-trail/beta2.css']
      : ['treat-time.html','treat-time.css','treat-time.js'];
    try {
      const cache = await caches.open('claire-adventures-v5-trail-beta2');
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
