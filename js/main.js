/* ==========================================================================
   Harry – Portfolio scripts (vanilla JS, no dependencies)
   - Theme toggle (remembers choice)
   - Sticky header shrink on scroll
   - Mobile navigation menu
   - Active nav link highlighting
   - Fade-in on scroll (respects prefers-reduced-motion)
   - Footer year
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Theme toggle ---------------------------------------------------- */
  var themeBtn = document.querySelector('.theme-toggle');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function updateThemeButton() {
    if (!themeBtn) return;
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    themeBtn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', currentTheme() === 'dark' ? '#0b1120' : '#f8fafc');
  }

  if (themeBtn) {
    updateThemeButton();
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
      updateThemeButton();
    });
  }

  /* ---- Sticky header shrink ------------------------------------------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 16);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile navigation ---------------------------------------------- */
  var navToggle = document.querySelector('.nav-toggle');
  var navMenu = document.getElementById('nav-menu');

  function setMenu(open) {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navMenu.classList.toggle('is-open', open);
    if (header) header.classList.toggle('menu-open', open);
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close after choosing a link
    navMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    // Close on Escape and return focus to the toggle
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        navToggle.focus();
      }
    });

    // Close when clicking outside the header
    document.addEventListener('click', function (e) {
      if (header && !header.contains(e.target)) setMenu(false);
    });

    // Reset if resized up to desktop
    window.matchMedia('(min-width: 821px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---- Active nav link ------------------------------------------------ */
  var navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
  if ('IntersectionObserver' in window && navLinks.length) {
    var linkFor = {};
    navLinks.forEach(function (a) { linkFor[a.getAttribute('href').slice(1)] = a; });

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.remove('is-active');
          a.removeAttribute('aria-current');
        });
        var link = linkFor[entry.target.id];
        if (link) {
          link.classList.add('is-active');
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    document.querySelectorAll('main section[id]').forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---- Fade-in on scroll ---------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-visible');
        obs.unobserve(el);
        // Clear the stagger delay once revealed so hover effects aren't delayed
        el.addEventListener('transitionend', function clear() {
          el.style.transitionDelay = '';
          el.removeEventListener('transitionend', clear);
        });
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealEls.forEach(function (el) {
      // Small stagger for items that sit side by side in a grid
      var siblings = el.parentElement ? el.parentElement.querySelectorAll(':scope > .reveal') : [];
      var index = Array.prototype.indexOf.call(siblings, el);
      if (index > 0) el.style.transitionDelay = Math.min(index * 70, 350) + 'ms';
      revealObserver.observe(el);
    });
  }

  /* ---- Footer year ---------------------------------------------------- */
  var year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = year; });
})();
