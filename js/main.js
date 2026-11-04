/* ==========================================================================
   Harry – Portfolio scripts (vanilla JS, no dependencies)
   - Theme toggle (remembers choice)
   - Sticky header shrink on scroll
   - Mobile navigation menu
   - Active nav link highlighting
   - Staggered fade-in on scroll
   - Hero typing effect and count-up stats
   - Infinite technology strip
   - Card tilt and hero network canvas (desktop + mouse only)
   - Footer year
   All motion is skipped when prefers-reduced-motion is set.
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

  /* ---- Fade-in on scroll (staggered) --------------------------------- */
  // Elements that enter the viewport together are revealed one after another.
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      var batch = entries
        .filter(function (e) { return e.isIntersecting; })
        .map(function (e) { return e.target; })
        .sort(function (a, b) {
          var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
          return (ra.top - rb.top) || (ra.left - rb.left);
        });

      batch.forEach(function (el, i) {
        obs.unobserve(el);
        el.style.transitionDelay = Math.min(i * 90, 450) + 'ms';
        el.classList.add('is-visible');
        // Clear the delay once revealed so hover effects aren't delayed
        el.addEventListener('transitionend', function clear(ev) {
          if (ev.target !== el) return;
          el.style.transitionDelay = '';
          el.removeEventListener('transitionend', clear);
        });
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---- Typing effect (hero) ------------------------------------------- */
  var typed = document.querySelector('.typed[data-phrases]');
  if (typed && !reduceMotion) {
    var phrases;
    try { phrases = JSON.parse(typed.getAttribute('data-phrases')); } catch (e) { phrases = null; }

    if (phrases && phrases.length > 1) {
      var wrap = typed.closest('.typed-wrap');
      var phraseIndex = 0;
      var charIndex = phrases[0].length;
      var deleting = true;
      wrap.classList.add('typing-active');

      var tick = function () {
        var phrase = phrases[phraseIndex];
        var delay;

        if (deleting) {
          charIndex--;
          delay = 35;
          if (charIndex <= 0) {
            charIndex = 0;
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            delay = 400;
          }
        } else {
          charIndex++;
          delay = 65 + Math.random() * 45; // slight variation feels more natural
          if (charIndex >= phrase.length) {
            charIndex = phrase.length;
            deleting = true;
            delay = 2600; // hold the finished phrase
          }
        }

        typed.textContent = phrases[phraseIndex].slice(0, charIndex);
        wrap.classList.toggle('is-typing', delay < 400);
        setTimeout(tick, delay);
      };

      // Show the first phrase for a moment before cycling
      setTimeout(tick, 3000);
    }
  }

  /* ---- Count-up stats ------------------------------------------------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    var runCounter = function (el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var decimals = (String(el.getAttribute('data-count')).split('.')[1] || '').length;
      var duration = 1400;
      var startTime = null;
      var step = function (now) {
        if (startTime === null) startTime = now;
        var t = Math.min((now - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        el.textContent = (target * eased).toFixed(decimals);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    var counterObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        // Wait for the stats row to fade in first
        setTimeout(function () { runCounter(entry.target); }, 500);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) {
      el.textContent = '0';
      counterObserver.observe(el);
    });
  }

  /* ---- Technology strip (infinite scroll) ----------------------------- */
  var marquee = document.querySelector('.marquee');
  if (marquee && !reduceMotion) {
    var track = marquee.querySelector('.marquee-track');
    var list = marquee.querySelector('.marquee-list');
    var originals = Array.prototype.slice.call(list.children);
    marquee.classList.add('is-animated'); // switch to the single-row layout before measuring

    // Repeat items until one list is wider than the screen, so the loop never shows a gap
    var guard = 0;
    while (list.scrollWidth < window.innerWidth && guard++ < 10) {
      originals.forEach(function (li) {
        var c = li.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        list.appendChild(c);
      });
    }
    // Second copy of the list for a seamless -50% loop (hidden from screen readers)
    var copy = list.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    track.appendChild(copy);

    // Constant, slow speed regardless of how many items there are
    marquee.style.setProperty('--marquee-duration', Math.round(list.scrollWidth / 35) + 's');
  }

  /* ---- Heavy effects: desktop with a mouse only ----------------------- */
  var fxQuery = window.matchMedia('(min-width: 821px) and (hover: hover) and (pointer: fine)');
  var fxEnabled = function () { return fxQuery.matches && !reduceMotion; };

  /* 3D tilt on cards */
  var tiltCards = document.querySelectorAll('[data-tilt]');
  if (tiltCards.length) {
    var MAX_TILT = 5; // degrees

    var setTiltState = function () {
      root.classList.toggle('tilt-enabled', fxEnabled());
    };
    setTiltState();
    fxQuery.addEventListener('change', setTiltState);

    tiltCards.forEach(function (card) {
      var frame = null;
      card.addEventListener('pointermove', function (e) {
        if (!root.classList.contains('tilt-enabled') || e.pointerType !== 'mouse') return;
        var x = e.clientX, y = e.clientY;
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var px = (x - r.left) / r.width;  // 0 → 1
          var py = (y - r.top) / r.height;  // 0 → 1
          card.style.setProperty('--ry', ((px - 0.5) * 2 * MAX_TILT).toFixed(2) + 'deg');
          card.style.setProperty('--rx', ((0.5 - py) * 2 * MAX_TILT).toFixed(2) + 'deg');
          card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
          card.classList.add('is-tilting');
        });
      });
      card.addEventListener('pointerleave', function () {
        if (frame) cancelAnimationFrame(frame);
        card.classList.remove('is-tilting');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* Hero network background (canvas) */
  var hero = document.querySelector('.hero');
  var canvas = document.querySelector('.hero-network');
  if (hero && canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var nodes = [];
    var width = 0, height = 0, dpr = 1;
    var mouse = { x: -9999, y: -9999, active: false };
    var running = false, heroVisible = true, rafId = null;
    var rgb = '45, 212, 191';
    var LINK_DIST = 140;   // px: max distance for a connecting line
    var MOUSE_DIST = 180;  // px: radius the cursor affects

    var readColour = function () {
      var v = getComputedStyle(root).getPropertyValue('--network-rgb').trim();
      if (v) rgb = v;
    };

    var resize = function () {
      var r = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = r.width; height = r.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with area, capped to keep it light
      var count = Math.min(80, Math.round((width * height) / 16000));
      while (nodes.length < count) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.2 + 0.8
        });
      }
      nodes.length = count;
    };

    var draw = function () {
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];

        // Gentle push away from the cursor
        if (mouse.active) {
          var mdx = n.x - mouse.x, mdy = n.y - mouse.y;
          var md = Math.sqrt(mdx * mdx + mdy * mdy);
          if (md < MOUSE_DIST && md > 0.1) {
            var force = (1 - md / MOUSE_DIST) * 0.02;
            n.vx += (mdx / md) * force;
            n.vy += (mdy / md) * force;
          }
        }

        // Drift, with light damping back towards a slow cruising speed
        n.vx *= 0.99; n.vy *= 0.99;
        var speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed < 0.08) { n.vx *= 1.05; n.vy *= 1.05; }
        n.x += n.vx; n.y += n.vy;

        // Wrap around edges
        if (n.x < -20) n.x = width + 20; else if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20; else if (n.y > height + 20) n.y = -20;
      }

      // Lines between nearby nodes
      ctx.lineWidth = 1;
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
          var d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            var alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.22;
            ctx.strokeStyle = 'rgba(' + rgb + ',' + alpha.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.stroke();
          }
        }
        // Lines to the cursor
        if (mouse.active) {
          var cx = nodes[a].x - mouse.x, cy = nodes[a].y - mouse.y;
          var cd = Math.sqrt(cx * cx + cy * cy);
          if (cd < MOUSE_DIST) {
            ctx.strokeStyle = 'rgba(' + rgb + ',' + ((1 - cd / MOUSE_DIST) * 0.3).toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // Dots
      ctx.fillStyle = 'rgba(' + rgb + ',0.55)';
      for (var k = 0; k < nodes.length; k++) {
        ctx.beginPath();
        ctx.arc(nodes[k].x, nodes[k].y, nodes[k].r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    var start = function () {
      if (running || !heroVisible || document.hidden || !fxEnabled()) return;
      running = true;
      rafId = requestAnimationFrame(draw);
    };
    var stop = function () {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    };

    var setNetworkState = function () {
      if (fxEnabled()) {
        readColour();
        resize();
        hero.classList.add('has-network');
        start();
      } else {
        stop();
        hero.classList.remove('has-network');
        ctx.clearRect(0, 0, width, height);
      }
    };

    setNetworkState();
    fxQuery.addEventListener('change', setNetworkState);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { if (fxEnabled()) resize(); }, 150);
    });

    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
    });
    hero.addEventListener('pointerleave', function () { mouse.active = false; });

    // Only animate while the hero is on screen and the tab is visible
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible) start(); else stop();
      }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    // Pick up the new colour when the theme changes
    new MutationObserver(readColour).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  }

  /* ---- Footer year ---------------------------------------------------- */
  var year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = year; });
})();
