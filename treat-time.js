/* Treat Time 1.0: local, quiet play. No accounts, scores, or tracking. */
(() => {
  'use strict';
  const game = document.getElementById('treatGame');
  if (!game) return;
  const friends = [...game.querySelectorAll('[data-friend]')];
  const choices = [...game.querySelectorAll('[data-treat]')];
  const pats = document.getElementById('patMode');
  const status = document.getElementById('gameStatus');
  const effects = document.getElementById('treatEffects');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const labels = {cookie: 'cookie', strawberry: 'strawberry', cupcake: 'cupcake'};
  const busy = new WeakSet();
  let selected = null;
  let drag = null;
  let suppressClickUntil = 0;

  function select(treat) {
    selected = treat;
    choices.forEach(button => {
      const active = button.dataset.treat === treat;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    pats.classList.toggle('selected', !treat);
    pats.setAttribute('aria-pressed', String(!treat));
    friends.forEach(friend => friend.setAttribute('aria-label', treat
      ? `Give ${friend.dataset.friend} a ${labels[treat]}`
      : `Give ${friend.dataset.friend} a gentle pat`));
    status.textContent = treat ? `Tap a friend to share a ${labels[treat]}!` : 'Tap any friend for a gentle pat.';
  }

  function icon(treat) {
    return choices.find(button => button.dataset.treat === treat).querySelector('svg').cloneNode(true);
  }

  function hearts(friend, count) {
    const box = friend.querySelector('.character').getBoundingClientRect();
    // Bound temporary elements even during very fast tapping.
    while (effects.childElementCount > 36) effects.firstElementChild.remove();
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('span');
      heart.className = 'floating-heart';
      heart.textContent = '\u2665';
      heart.style.left = `${box.left + box.width * (.25 + Math.random() * .5)}px`;
      heart.style.top = `${box.top + box.height * (.27 + Math.random() * .22)}px`;
      heart.style.fontSize = `${21 + Math.random() * 17}px`;
      heart.style.setProperty('--drift', `${(Math.random() - .5) * 105}px`);
      heart.style.setProperty('--tilt', `${(Math.random() - .5) * 45}deg`);
      heart.style.animationDelay = `${i * .055}s`;
      effects.append(heart);
      setTimeout(() => heart.remove(), 1750);
    }
  }

  function react(friend, treat) {
    const bubble = friend.querySelector('.friend-bubble');
    friend.classList.remove('reacting', 'petting');
    void friend.offsetWidth;
    friend.classList.add(treat ? 'reacting' : 'petting');
    bubble.textContent = treat ? (friend.dataset.friend === 'Hello Kitty' ? 'Thank you! \u2661' : 'Yum, yum!') : 'Love you, Claire!';
    status.textContent = treat
      ? `${friend.dataset.friend} loved the ${labels[treat]}! More treats to share!`
      : `${friend.dataset.friend} loves your gentle pats!`;
    hearts(friend, reduceMotion.matches ? 2 : (treat ? 7 : 3));
    setTimeout(() => {
      friend.classList.remove('reacting', 'petting');
      busy.delete(friend);
    }, 950);
  }

  function feed(friend, treat, from) {
    if (busy.has(friend)) return;
    busy.add(friend);
    if (!treat || reduceMotion.matches) {
      react(friend, treat);
      return;
    }
    const trayButton = choices.find(button => button.dataset.treat === treat);
    const start = trayButton.querySelector('svg').getBoundingClientRect();
    const end = friend.querySelector('.character').getBoundingClientRect();
    const x = from ? from.x : start.left + start.width / 2;
    const y = from ? from.y : start.top + start.height / 2;
    const tx = end.left + end.width * .50;
    const ty = end.top + end.height * .57;
    const flying = document.createElement('div');
    flying.className = 'flying-treat';
    flying.style.left = `${x - 31}px`;
    flying.style.top = `${y - 31}px`;
    flying.append(icon(treat));
    effects.append(flying);
    const finish = () => { flying.remove(); react(friend, treat); };
    if (typeof flying.animate !== 'function') { finish(); return; }
    const flight = flying.animate([
      {transform: 'translate(0,0) scale(1)', opacity: 1},
      {transform: `translate(${(tx - x) * .55}px,${(ty - y) * .55 - 30}px) scale(.95)`, opacity: 1, offset: .55},
      {transform: `translate(${tx - x}px,${ty - y}px) scale(.15)`, opacity: 0}
    ], {duration: 450, easing: 'ease-in-out', fill: 'forwards'});
    flight.finished.then(finish, finish);
  }

  function hitFriend(x, y) {
    return document.elementFromPoint(x, y)?.closest('[data-friend]') || null;
  }
  function highlight(target) {
    friends.forEach(friend => friend.classList.toggle('drop-target', friend === target));
  }
  function cancelDrag() {
    if (!drag) return;
    const old = drag;
    drag = null;
    old.ghost?.remove();
    highlight(null);
    document.body.classList.remove('dragging');
    if (old.button.hasPointerCapture?.(old.id)) old.button.releasePointerCapture(old.id);
  }

  choices.forEach(button => {
    button.addEventListener('click', event => {
      if (event.detail && performance.now() < suppressClickUntil) return;
      select(selected === button.dataset.treat ? null : button.dataset.treat);
    });
    button.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || drag) return;
      drag = {id: event.pointerId, button, treat: button.dataset.treat, x: event.clientX, y: event.clientY, moved: false, ghost: null};
      button.setPointerCapture?.(event.pointerId);
    });
    button.addEventListener('pointercancel', cancelDrag);
    button.addEventListener('lostpointercapture', cancelDrag);
    button.addEventListener('contextmenu', event => event.preventDefault());
  });
  document.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 10) return;
      event.preventDefault();
      if (!drag.moved) {
        drag.moved = true;
        select(drag.treat);
        drag.ghost = document.createElement('div');
        drag.ghost.className = 'drag-treat';
        drag.ghost.append(icon(drag.treat));
        effects.append(drag.ghost);
        document.body.classList.add('dragging');
      }
      drag.ghost.style.transform = `translate(${event.clientX - 31}px,${event.clientY - 42}px) rotate(-8deg)`;
      highlight(hitFriend(event.clientX, event.clientY));
    });
  document.addEventListener('pointerup', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const {moved, treat} = drag;
      const target = moved ? hitFriend(event.clientX, event.clientY) : null;
      cancelDrag();
      if (moved) {
        suppressClickUntil = performance.now() + 500;
        if (target) feed(target, treat, {x: event.clientX, y: event.clientY});
        else status.textContent = 'No worries! Tap a friend, or try dragging again.';
      }
    });
  document.addEventListener('pointercancel', cancelDrag);
  friends.forEach(friend => friend.addEventListener('click', event => {
    if (event.detail && performance.now() < suppressClickUntil) return;
    feed(friend, selected);
  }));
  pats.addEventListener('click', () => select(null));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { cancelDrag(); select(null); }
  });
  window.addEventListener('blur', cancelDrag);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelDrag(); });
  document.addEventListener('storybook:offline-ready', () => {
    document.getElementById('offlineStatus').textContent = 'Saved for offline play on this device \u2661';
  });
})();
