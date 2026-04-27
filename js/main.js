/**
 * main.js — GSAP animations, scroll reveals, custom cursor, counters,
 *            skill bars, navbar scroll, hamburger, form feedback.
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     1. GSAP + ScrollTrigger setup
     ══════════════════════════════════════════════════════ */
  if (typeof gsap === 'undefined') {
    console.warn('[main] GSAP not loaded, animations skipped');
    /* Un-hide all reveal elements so content is still usable */
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  } else {
    gsap.registerPlugin(ScrollTrigger);

    /* ─── Hero entrance sequence ─── */
    const heroTL = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTL
      .from('#titleLine1', { y: 60, opacity: 0, duration: 0.8 }, 0.3)
      .from('#titleLine2', { y: 60, opacity: 0, duration: 0.8 }, 0.5)
      .from('#titleLine3', { y: 60, opacity: 0, duration: 0.8 }, 0.7)
      .from('#heroDesc', { y: 40, opacity: 0, duration: 0.7 }, 0.9)
      .from('#heroActions', { y: 30, opacity: 0, duration: 0.6 }, 1.1)
      .from('#heroStats', { y: 30, opacity: 0, duration: 0.6 }, 1.3)
      .from('#scrollHint', { opacity: 0, duration: 0.8 }, 1.8);

    /* Hero 3D container */
    gsap.from('#hero3dContainer', {
      x: 80, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.6
    });

    /* ─── Generic section reveal ─── */
    gsap.utils.toArray('.section-header').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        y: 50, opacity: 0, duration: 0.9, ease: 'power3.out'
      });
    });

    /* ─── About section ─── */
    gsap.from('.about-visual', {
      scrollTrigger: { trigger: '.about', start: 'top 75%' },
      x: -60, opacity: 0, duration: 1, ease: 'power3.out'
    });
    gsap.from('.about-text', {
      scrollTrigger: { trigger: '.about', start: 'top 75%' },
      x: 60, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.2
    });

    /* ─── Skill categories stagger ─── */
    gsap.from('.skill-category', {
      scrollTrigger: { trigger: '.skills-grid', start: 'top 80%' },
      y: 60, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out'
    });

    /* ─── Project cards stagger ─── */
    gsap.from('.project-card', {
      scrollTrigger: { trigger: '.projects-grid', start: 'top 80%' },
      y: 80, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out'
    });

    /* ─── Contact ─── */
    gsap.from('.contact-info', {
      scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' },
      x: -50, opacity: 0, duration: 0.9, ease: 'power3.out'
    });
    gsap.from('.contact-form', {
      scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' },
      x: 50, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.2
    });

    /* ─── Tech pills stagger ─── */
    gsap.from('.tech-pill', {
      scrollTrigger: { trigger: '.tech-orbit', start: 'top 85%' },
      scale: 0, opacity: 0, stagger: 0.05, duration: 0.5, ease: 'back.out(1.7)'
    });

    /* ─── Value chips ─── */
    gsap.from('.value-chip', {
      scrollTrigger: { trigger: '.about-values', start: 'top 85%' },
      scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'back.out(1.7)'
    });

    /* ─── Contact links ─── */
    gsap.from('.contact-link', {
      scrollTrigger: { trigger: '.contact-links', start: 'top 85%' },
      x: -30, opacity: 0, stagger: 0.15, duration: 0.6, ease: 'power3.out'
    });
  }

  /* ══════════════════════════════════════════════════════
     2. SKILL BAR ANIMATION via Intersection Observer
     ══════════════════════════════════════════════════════ */
  const skillItems = document.querySelectorAll('.skill-item');

  const skillObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const item = entry.target;
      const pct = parseInt(item.dataset.percent, 10) || 0;
      const fill = item.querySelector('.skill-fill');
      if (fill) fill.style.width = pct + '%';
      skillObs.unobserve(item);
    });
  }, { threshold: 0.3 });

  skillItems.forEach(item => skillObs.observe(item));

  /* ══════════════════════════════════════════════════════
     3. ANIMATED COUNTERS
     ══════════════════════════════════════════════════════ */
  function animateCounter(el, target, duration) {
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const val = Math.round(progress * target);
      el.textContent = val;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statsObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.stat-num').forEach(el => {
        animateCounter(el, parseInt(el.dataset.count, 10), 1800);
      });
      statsObs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) statsObs.observe(statsEl);

  /* ══════════════════════════════════════════════════════
     4. NAVBAR SCROLL EFFECT
     ══════════════════════════════════════════════════════ */
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (navbar) {
      navbar.classList.toggle('scrolled', y > 60);
    }
    lastScroll = y;
  }, { passive: true });

  /* ══════════════════════════════════════════════════════
     5. HAMBURGER MENU
     ══════════════════════════════════════════════════════ */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    /* Close on link click */
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     6. CUSTOM CURSOR
     ══════════════════════════════════════════════════════ */
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');

  if (cursor && cursorDot && window.matchMedia('(hover: hover)').matches) {
    let cx = -100, cy = -100;
    let dx = -100, dy = -100;
    let raf;

    document.addEventListener('mousemove', (e) => {
      dx = e.clientX;
      dy = e.clientY;
    });

    function moveCursor() {
      cx += (dx - cx) * 0.12;
      cy += (dy - cy) * 0.12;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      cursorDot.style.left = dx + 'px';
      cursorDot.style.top = dy + 'px';
      raf = requestAnimationFrame(moveCursor);
    }
    raf = requestAnimationFrame(moveCursor);

    /* Hover states */
    const interactives = document.querySelectorAll('a, button, .project-card, .tech-pill, .value-chip');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '52px';
        cursor.style.height = '52px';
        cursor.style.background = 'rgba(124,58,237,0.15)';
        cursor.style.borderColor = '#7c3aed';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '32px';
        cursor.style.height = '32px';
        cursor.style.background = 'transparent';
        cursor.style.borderColor = 'rgba(124,58,237,0.8)';
      });
    });
  } else {
    if (cursor) cursor.style.display = 'none';
    if (cursorDot) cursorDot.style.display = 'none';
  }

  /* ══════════════════════════════════════════════════════
     7. CONTACT FORM (demo — no real submission)
     ══════════════════════════════════════════════════════ */
  const form = document.getElementById('contactForm');
  const sendBtn = document.getElementById('sendBtn');

  /* ── Web3Forms access key — paste yours here after getting it from web3forms.com ── */
  const WEB3FORMS_KEY = 'ab70e97e-de19-4d38-b49f-17ab114c421b';

  if (form && sendBtn) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btnText = sendBtn.querySelector('.btn-text');

      /* Validate */
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const subject = document.getElementById('contactSubject').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      if (!name || !email || !message) {
        showFormFeedback('Please fill in all required fields.', 'error');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormFeedback('Please enter a valid email address.', 'error');
        return;
      }

      if (WEB3FORMS_KEY === 'YOUR_ACCESS_KEY_HERE') {
        showFormFeedback('⚠️ Form not configured yet — add your Web3Forms key in main.js.', 'error');
        return;
      }

      /* Send via Web3Forms */
      sendBtn.disabled = true;
      if (btnText) btnText.textContent = 'Sending…';

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            name,
            email,
            subject: subject || 'Portfolio Contact Form',
            message,
          }),
        });

        const data = await res.json();

        if (data.success) {
          if (btnText) btnText.textContent = '✓ Message Sent!';
          form.reset();
          showFormFeedback("Thanks! I'll get back to you soon 🚀", 'success');
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      } catch (err) {
        showFormFeedback('Something went wrong. Please email me directly.', 'error');
        console.error('[ContactForm]', err);
      } finally {
        sendBtn.disabled = false;
        setTimeout(() => {
          if (btnText) btnText.textContent = 'Send Message';
        }, 4000);
      }
    });
  }

  function showFormFeedback(msg, type) {
    let fb = document.getElementById('formFeedback');
    if (!fb) {
      fb = document.createElement('div');
      fb.id = 'formFeedback';
      fb.style.cssText = `
        padding: 0.75rem 1rem;
        border-radius: 10px;
        font-size: 0.875rem;
        font-weight: 500;
        margin-top: -0.5rem;
        transition: opacity 0.4s;
      `;
      form.appendChild(fb);
    }
    fb.textContent = msg;
    fb.style.background = type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)';
    fb.style.border = type === 'success' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(244,63,94,0.3)';
    fb.style.color = type === 'success' ? '#34d399' : '#fb7185';
    fb.style.opacity = '1';

    setTimeout(() => { fb.style.opacity = '0'; }, 5000);
  }

  /* ══════════════════════════════════════════════════════
     8. SMOOTH ACTIVE NAV HIGHLIGHT on scroll
     ══════════════════════════════════════════════════════ */
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  const navObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinkEls.forEach(link => {
          link.style.color = link.getAttribute('href') === '#' + entry.target.id
            ? 'var(--text-primary)'
            : '';
        });
      }
    });
  }, { threshold: 0.5, rootMargin: '-10% 0px -50% 0px' });

  sections.forEach(s => navObs.observe(s));

  /* ══════════════════════════════════════════════════════
     9. HERO PARALLAX on scroll (content layer)
     ══════════════════════════════════════════════════════ */
  const heroContent = document.querySelector('.hero-content');
  window.addEventListener('scroll', () => {
    if (heroContent && window.scrollY < window.innerHeight) {
      heroContent.style.transform = `translateY(${window.scrollY * 0.25}px)`;
      heroContent.style.opacity = 1 - (window.scrollY / window.innerHeight) * 1.5;
    }
  }, { passive: true });

  /* ══════════════════════════════════════════════════════
     10. ADD SCROLLED CLASS IMMEDIATELY if page reloads mid-scroll
     ══════════════════════════════════════════════════════ */
  if (window.scrollY > 60 && navbar) navbar.classList.add('scrolled');

})();
