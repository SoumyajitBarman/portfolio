/**
 * cards3d.js — 3D mouse-tilt effect on project cards (CSS perspective + JS transforms)
 * Also animates the card-glow radial gradient to follow cursor.
 */
(function () {
  'use strict';

  /* ── Tilt configuration ── */
  const MAX_TILT = 12;   // degrees
  const SCALE = 1.03;
  const EASE = 0.1;  // lerp factor

  /* ── State per card ── */
  const cards = [];

  function initCards() {
    const els = document.querySelectorAll('.project-card');
    if (!els.length) return;

    els.forEach((el) => {
      const state = {
        el,
        rotX: 0, rotY: 0,
        targetX: 0, targetY: 0,
        active: false,
        rafId: null,
      };
      cards.push(state);

      el.addEventListener('mouseenter', () => {
        state.active = true;
        el.style.transition = 'box-shadow 0.3s, border-color 0.3s';
        if (!state.rafId) state.rafId = requestAnimationFrame(() => tick(state));
      });

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);

        state.targetX = -dy * MAX_TILT;   // pitch (X rotation from vertical mouse)
        state.targetY = dx * MAX_TILT;   // yaw   (Y rotation from horizontal mouse)

        /* Update glow radial position */
        const glow = el.querySelector('.card-glow');
        if (glow) {
          const px = ((e.clientX - rect.left) / rect.width) * 100;
          const py = ((e.clientY - rect.top) / rect.height) * 100;
          el.style.setProperty('--mouse-x', `${px}%`);
          el.style.setProperty('--mouse-y', `${py}%`);
        }
      });

      el.addEventListener('mouseleave', () => {
        state.active = false;
        state.targetX = 0;
        state.targetY = 0;
        /* smooth return */
      });
    });
  }

  function tick(state) {
    /* Lerp toward target */
    state.rotX += (state.targetX - state.rotX) * EASE;
    state.rotY += (state.targetY - state.rotY) * EASE;

    const scale = state.active ? SCALE : 1;
    const rX = state.rotX.toFixed(3);
    const rY = state.rotY.toFixed(3);
    const near0 = Math.abs(state.rotX) < 0.05 && Math.abs(state.rotY) < 0.05;

    state.el.style.transform = `perspective(800px) rotateX(${rX}deg) rotateY(${rY}deg) scale(${scale})`;

    if (!state.active && near0) {
      /* Snap to identity and stop RAF */
      state.el.style.transform = '';
      state.rafId = null;
    } else {
      state.rafId = requestAnimationFrame(() => tick(state));
    }
  }

  /* ── Floating hero cards mouse parallax ── */
  function initHeroCards() {
    const heroCards = document.querySelectorAll('.floating-card');
    if (!heroCards.length) return;

    const depths = [0.04, 0.07, 0.05];

    let mx = 0, my = 0;
    document.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    let prev = 0;
    function parallel(ts) {
      if (ts - prev > 16) {  // ~60fps cap
        heroCards.forEach((card, i) => {
          const d = depths[i] || 0.05;
          card.style.transform =
            `translateX(${mx * d * 100}px) translateY(${my * d * 60}px)`;
        });
        prev = ts;
      }
      requestAnimationFrame(parallel);
    }
    requestAnimationFrame(parallel);
  }

  /* ── Init after DOM ready ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initCards(); initHeroCards(); });
  } else {
    initCards();
    initHeroCards();
  }
})();
