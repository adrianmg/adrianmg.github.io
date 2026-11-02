(() => {
  'use strict';

  const nav = document.querySelector('.home-navigation');
  const drawer = document.getElementById('home-more');
  const moreButton = nav && nav.querySelector('.home-navigation-more button');

  if (!nav || !drawer || !moreButton || typeof drawer.showModal !== 'function') {
    return;
  }

  // Without this class the nav simply wraps and shows every link.
  nav.classList.add('is-enhanced');

  const panel = drawer.querySelector('.home-drawer-panel');
  const overlay = drawer.querySelector('.home-drawer-overlay');
  const list = nav.querySelector('ul');
  const moreItem = moreButton.closest('li');
  const DISMISS_VELOCITY = 0.11; // px/ms, a quick flick
  // Links that don't always fit claim spare room in this order.
  const FOLD_PRIORITY = ['contact', 'investments', 'twitter', 'resume'];
  let closeTimer;
  let drag = null;
  let suppressClick = false;

  const width = (element) => element.getBoundingClientRect().width;

  // Fit as many links as possible on one line; the rest move into "More".
  function fitNavigation() {
    const items = Array.from(list.children).filter((li) => li !== moreItem);
    items.forEach((li) => li.classList.remove('is-folded'));
    nav.classList.remove('has-more');

    // Edge links may let their padding spill past the text column.
    const padding = parseFloat(getComputedStyle(list.querySelector('a')).paddingLeft) || 0;
    const budget = list.clientWidth + padding * 2 + 0.5;
    const folded = new Set();

    if (items.reduce((sum, li) => sum + width(li), 0) > budget) {
      nav.classList.add('has-more');
      let used = width(moreItem) + items
        .filter((li) => !li.dataset.fold)
        .reduce((sum, li) => sum + width(li), 0);
      let full = false;

      // Strict priority: once one link misses, everything after it folds too.
      FOLD_PRIORITY.forEach((key) => {
        const li = list.querySelector(`li[data-fold="${key}"]`);
        if (!li) return;
        const size = width(li);
        if (!full && used + size <= budget) {
          used += size;
        } else {
          full = true;
          folded.add(key);
        }
      });
    }

    items.forEach((li) => li.classList.toggle('is-folded', folded.has(li.dataset.fold)));
    drawer.querySelectorAll('.home-drawer-list li').forEach((li) => {
      li.classList.toggle('is-visible', folded.has(li.dataset.fold));
    });

    if (!folded.size) {
      nav.classList.remove('has-more');
      closeDrawer(true);
    }
  }

  function finishClose() {
    clearTimeout(closeTimer);
    if (drawer.open) {
      drawer.close();
    }
  }

  function resetDrawer() {
    drawer.classList.remove('is-open', 'is-instant');
    moreButton.setAttribute('aria-expanded', 'false');
    panel.style.transform = '';
    panel.style.transition = '';
    overlay.style.opacity = '';
    overlay.style.transition = '';
  }

  function openDrawer(instant) {
    clearTimeout(closeTimer);
    resetDrawer();
    drawer.classList.toggle('is-instant', instant);
    drawer.showModal();
    moreButton.setAttribute('aria-expanded', 'true');
    // Let the closed position paint once so the sheet slides up from it.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => drawer.classList.add('is-open'));
    });
  }

  function closeDrawer(instant) {
    if (!drawer.open) return;

    if (instant) {
      finishClose();
      return;
    }

    panel.style.transform = '';
    panel.style.transition = '';
    overlay.style.opacity = '';
    overlay.style.transition = '';
    drawer.classList.remove('is-open');
    closeTimer = setTimeout(finishClose, 600);
  }

  // A keyboard "click" has detail 0; keyboard actions open without motion.
  moreButton.addEventListener('click', (event) => openDrawer(event.detail === 0));

  drawer.addEventListener('close', resetDrawer);

  // Escape closes immediately, which the native dialog already does.
  drawer.addEventListener('cancel', () => clearTimeout(closeTimer));

  panel.addEventListener('transitionend', (event) => {
    if (event.propertyName === 'transform' && !drawer.classList.contains('is-open')) {
      finishClose();
    }
  });

  overlay.addEventListener('click', () => closeDrawer(false));

  drawer.querySelector('.home-drawer-close').addEventListener('click', (event) => {
    closeDrawer(event.detail === 0);
  });

  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (suppressClick) {
        event.preventDefault();
        return;
      }
      // Release the scroll lock before an in-page jump.
      if (link.getAttribute('href').startsWith('#')) {
        finishClose();
      }
    });
  });

  // Swipe down to dismiss: past a quarter of the sheet, or with a quick flick.
  panel.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    drag = { id: event.pointerId, startY: event.clientY, startTime: performance.now(), active: false, offset: 0 };
  });

  panel.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const delta = event.clientY - drag.startY;

    if (!drag.active) {
      if (Math.abs(delta) < 6) return;
      drag.active = true;
      panel.setPointerCapture(drag.id);
      panel.style.transition = 'none';
      overlay.style.transition = 'none';
    }

    // Upward drags meet growing resistance; downward drags follow the finger.
    drag.offset = delta > 0 ? delta : -Math.sqrt(-delta) * 2;
    panel.style.transform = `translateY(${drag.offset}px)`;
    overlay.style.opacity = String(Math.max(0, 1 - Math.max(0, drag.offset) / panel.offsetHeight));
  });

  function endDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const { active, offset, startTime } = drag;
    drag = null;
    if (!active) return;

    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);

    const velocity = offset / (performance.now() - startTime);
    if (offset > panel.offsetHeight / 4 || (offset > 0 && velocity > DISMISS_VELOCITY)) {
      closeDrawer(false);
    } else {
      panel.style.transition = '';
      overlay.style.transition = '';
      panel.style.transform = '';
      overlay.style.opacity = '';
    }
  }

  panel.addEventListener('pointerup', endDrag);
  panel.addEventListener('pointercancel', endDrag);

  // Refit whenever the nav's available width changes (resize, rotation, zoom).
  if ('ResizeObserver' in window) {
    new ResizeObserver(fitNavigation).observe(list);
  } else {
    window.addEventListener('resize', fitNavigation);
  }
  fitNavigation();

  // Returning from an external link via back/forward should not show a stale drawer.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) closeDrawer(true);
  });
})();
