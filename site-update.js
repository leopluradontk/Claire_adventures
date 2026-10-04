/* Shared update check. No user data is stored or sent. */
(() => {
  'use strict';
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  let reloading = false;
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && !reloading) {
      reloading = true;
      location.reload();
    }
  });
  async function start() {
    try {
      const registration = await navigator.serviceWorker.register('service-worker.js', {updateViaCache: 'none'});
      registration.update().catch(() => {});
      document.getElementById('refreshBtn')?.addEventListener('click', () => {
        registration.update().catch(() => {});
      });
      await navigator.serviceWorker.ready;
      if ('caches' in window) {
        const cache = await caches.open('claire-adventures-v3-treat-time');
        const saved = await cache.match(new URL('treat-time.html', document.baseURI).href);
        if (saved) document.dispatchEvent(new Event('storybook:offline-ready'));
      }
    } catch (error) {
      console.info('Offline saving is unavailable; online play still works.', error);
    }
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, {once: true});
})();
