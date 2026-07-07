/* ==========================================================================
   VERRE — Premium Photography Studio · Interaction Layer
   Vanilla JS, no dependencies. Respects prefers-reduced-motion throughout.
   ========================================================================== */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ------------------------------------------------------------------------
     1. HEADER — background on scroll
     ---------------------------------------------------------------------- */
  const header = document.getElementById('siteHeader');
  const scrollFill = document.getElementById('scrollFill');

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);

    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (y / docH) * 100 : 0;
    scrollFill.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------------
     2. HERO — Prism Reveal on load
     Trigger: page load (DOMContentLoaded + image ready)
     Duration: 0.9s per line, staggered 0.15s
     Easing: cubic-bezier(0.16,1,0.3,1) "ease-prism" — decelerated, no bounce
     Purpose: title lines and the tri-channel image separate into focus,
     mirroring a prism resolving white light — the page's signature moment.
     ---------------------------------------------------------------------- */
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      document.body.classList.add('is-loaded');
    });
  });
  // Fallback in case 'load' is delayed by slow external images
  setTimeout(() => document.body.classList.add('is-loaded'), 1800);

  /* ------------------------------------------------------------------------
     3. DEPTH SCROLL — hero parallax
     Trigger: scroll, hero in viewport
     Duration: continuous, tied to scroll position (no fixed duration)
     Easing: linear (1:1 with scroll, no lag — avoids seasick feel)
     Purpose: background image moves slower than content, creating a sense
     of physical depth between glass/foreground and the monolith behind it.
     ---------------------------------------------------------------------- */
  const heroMedia = document.querySelector('.hero__media');
  const heroEl = document.querySelector('.hero');
  if (heroMedia && !reduceMotion) {
    window.addEventListener('scroll', () => {
      const rect = heroEl.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const progress = Math.min(1, Math.max(0, -rect.top / rect.height));
      heroMedia.style.transform = `translate3d(0, ${progress * 60}px, 0)`;
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     4. AMBIENT LIGHT SWEEP + PRISM CURSOR
     Trigger: mousemove (desktop only)
     Duration: continuous / 0.35s ring easing
     Easing: ease-soft
     Purpose: a soft light source follows the cursor, reinforcing the idea
     that the whole page is a lit museum installation rather than a flat UI.
     ---------------------------------------------------------------------- */
  const cursor = document.querySelector('.prism-cursor');
  if (cursor && !isTouch && !reduceMotion) {
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.style.opacity = '1';
    });
    function raf() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      const core = cursor.querySelector('.prism-cursor__core');
      const ring = cursor.querySelector('.prism-cursor__ring');
      if (core) core.style.left = mx + 'px', core.style.top = my + 'px', core.style.transform = 'translate(-50%,-50%)';
      if (ring) ring.style.left = cx + 'px', ring.style.top = cy + 'px';
      requestAnimationFrame(raf);
    }
    raf();

    // Ring grows over interactive elements ("Reflective Hover")
    document.querySelectorAll('a, button, .p-item, .g-item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        const ring = cursor.querySelector('.prism-cursor__ring');
        if (ring) { ring.style.width = '64px'; ring.style.height = '64px'; ring.style.opacity = '0.4'; }
      });
      el.addEventListener('mouseleave', () => {
        const ring = cursor.querySelector('.prism-cursor__ring');
        if (ring) { ring.style.width = '34px'; ring.style.height = '34px'; ring.style.opacity = '1'; }
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. MAGNETIC BUTTONS
     Trigger: mousemove within button bounds (desktop only)
     Duration: 0.25s return snap
     Easing: ease-soft
     Purpose: primary CTAs feel physically responsive, like polished objects
     with weight — reinforces "expensive object" feel requested in the brief.
     ---------------------------------------------------------------------- */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('.btn--solid, .btn--outline').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const relX = e.clientX - r.left - r.width / 2;
        const relY = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${relX * 0.25}px, ${relY * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.25s var(--ease-soft)';
        btn.style.transform = 'translate(0,0)';
        setTimeout(() => { btn.style.transition = ''; }, 260);
      });
      btn.addEventListener('mouseenter', () => { btn.style.transition = ''; });
    });
  }

  /* ------------------------------------------------------------------------
     6. SCROLL REVEAL — generic "Cinematic Reveal" / "Luxury Blur"
     Trigger: IntersectionObserver, 15% visible
     Duration: 0.9s
     Easing: ease-prism
     Purpose: sections rise and resolve into place as the visitor scrolls,
     evoking a photograph developing — never repeats the same offset twice
     in a row across adjacent sections (varied via CSS transform only).
     ---------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll(
    '.about__frame, .about__grid, .section-head, .approach__card, .service-card, .team__card, .g-item, .interior__content, .interior__media'
  );
  revealEls.forEach(el => el.classList.add('sr'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  revealEls.forEach(el => io.observe(el));

  // Stagger children of approach/services/team grids
  function staggerGroup(selector) {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.style.setProperty('--i', i % 6);
      el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    });
  }
  staggerGroup('.approach__card');
  staggerGroup('.service-card');
  staggerGroup('.team__card');
  staggerGroup('.g-item');

  /* ------------------------------------------------------------------------
     7. ANIMATED COUNTERS (about stats)
     Trigger: IntersectionObserver on .about__stats
     Duration: 1.6s per counter
     Easing: ease-out (quadratic, manual)
     Purpose: quantifies trust (years, shoots, awards) at the exact moment
     the visitor is reading the brand story — reinforcing credibility.
     ---------------------------------------------------------------------- */
  const statNums = document.querySelectorAll('.stat__num');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = reduceMotion ? 0 : 1600;
      const start = performance.now();

      function tick(now) {
        const p = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target).toLocaleString('ru-RU');
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  statNums.forEach(el => statObserver.observe(el));

  /* ------------------------------------------------------------------------
     8. MOBILE MENU
     ---------------------------------------------------------------------- */
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  function openMenu() {
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    burgerBtn.setAttribute('aria-expanded', 'true');
    burgerBtn.setAttribute('aria-label', 'Закрыть меню');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn.setAttribute('aria-label', 'Открыть меню');
    document.body.style.overflow = '';
  }
  // The burger is the single toggle: it opens the menu, animates into an
  // X, and the same click target closes it — no second close button
  // competing for the same corner of the screen.
  burgerBtn.addEventListener('click', () => {
    mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) closeMenu();
  });

  /* ------------------------------------------------------------------------
     9. PORTFOLIO FILTERS
     Trigger: click on filter button
     Duration: 0.4s fade/scale per item
     Easing: ease-soft
     Purpose: lets the visitor narrow the "exhibition" to their category of
     interest without a page reload, keeping momentum toward booking.
     ---------------------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const pItems = document.querySelectorAll('.p-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      pItems.forEach(item => {
        const match = filter === 'all' || item.dataset.cat === filter;
        item.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ------------------------------------------------------------------------
     10. GALLERY LIGHTBOX
     ---------------------------------------------------------------------- */
  const galleryGrid = document.getElementById('galleryGrid');
  if (galleryGrid) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `<button class="lightbox__close" aria-label="Закрыть">✕</button><img alt="">`;
    document.body.appendChild(lightbox);
    const lightboxImg = lightbox.querySelector('img');
    const lightboxClose = lightbox.querySelector('.lightbox__close');

    galleryGrid.querySelectorAll('.g-item img').forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src.replace(/w=\d+/, 'w=1800');
        lightboxImg.alt = img.alt;
        lightbox.classList.add('is-open');
      });
    });
    function closeLightbox() { lightbox.classList.remove('is-open'); }
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
  }

  /* ------------------------------------------------------------------------
     11. TESTIMONIALS SLIDER — touch-swipeable
     Trigger: dot click, swipe gesture, or auto-advance every 6s
     Duration: 0.7s track transition
     Easing: ease-prism
     Purpose: rotates social proof without demanding interaction, but still
     responds instantly to a deliberate swipe — never fights the visitor.
     ---------------------------------------------------------------------- */
  const track = document.getElementById('testimonialsTrack');
  const dotsWrap = document.getElementById('testimonialsDots');
  const slides = track ? track.children.length : 0;
  let current = 0;
  let autoTimer;

  if (track && slides > 0) {
    for (let i = 0; i < slides; i++) {
      const dot = document.createElement('button');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Отзыв ${i + 1}`);
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }

    function goTo(i) {
      current = (i + slides) % slides;
      track.style.transform = `translateX(-${current * 100}%)`;
      [...dotsWrap.children].forEach((d, idx) => d.classList.toggle('is-active', idx === current));
      resetAuto();
    }
    function resetAuto() {
      clearInterval(autoTimer);
      if (!reduceMotion) autoTimer = setInterval(() => goTo(current + 1), 6000);
    }
    resetAuto();

    // Touch swipe
    let startX = 0;
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 40) goTo(current + (diff < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     12. BOOKING FORM
     ---------------------------------------------------------------------- */
  const bookingForm = document.getElementById('bookingForm');
  const formNote = document.getElementById('formNote');

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('nameInput').value.trim();
      const phone = document.getElementById('phoneInput').value.trim();
      const service = document.getElementById('serviceInput').value;

      if (!name || !phone || !service) {
        formNote.textContent = 'Пожалуйста, заполните все поля.';
        formNote.style.color = 'var(--color-prism-warm)';
        return;
      }

      formNote.textContent = `Спасибо, ${name}! Мы свяжемся с вами по номеру ${phone} в течение часа.`;
      formNote.style.color = 'var(--color-prism)';
      bookingForm.reset();
    });
  }

  /* ------------------------------------------------------------------------
     13. SMOOTH ANCHOR OFFSET (accounts for fixed header)
     ---------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

})();
