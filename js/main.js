/* ==========================================================================
   Harry – Portfolio scripts (vanilla JS, no dependencies)
   - Theme toggle with an animated sweep (View Transitions API, with fallback)
   - Scroll progress bar, sticky header state, back-to-top button
   - Mobile navigation menu, active nav link highlighting
   - Staggered fade-in on scroll, count-up stats, typing effect
   - Infinite technology strip
   - Card glow border + 3D tilt, hero network canvas (desktop + mouse only)
   - Experience timeline that draws itself on scroll
   - Terminal-style build log on the homelab page
   - Footer year
   All motion is skipped when prefers-reduced-motion is set.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduceMotion = reduceMotionQuery.matches;
  reduceMotionQuery.addEventListener('change', function (mq) { reduceMotion = mq.matches; });

  /* Heavy effects only on a desktop-sized screen with a real mouse */
  var fxQuery = window.matchMedia('(min-width: 821px) and (hover: hover) and (pointer: fine)');
  var fxEnabled = function () { return fxQuery.matches && !reduceMotion; };
  var setFxState = function () { root.classList.toggle('fx', fxEnabled()); };
  setFxState();
  fxQuery.addEventListener('change', setFxState);
  reduceMotionQuery.addEventListener('change', setFxState);

  var clamp = function (v, min, max) { return Math.max(min, Math.min(max, v)); };

  /* ---- Theme toggle ---------------------------------------------------- */
  var themeBtn = document.querySelector('.theme-toggle');
  var THEME_COLOURS = { dark: '#090d16', light: '#f6f8fb' };

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function updateThemeButton() {
    if (!themeBtn) return;
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    themeBtn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLOURS[currentTheme()]);
  }

  function applyTheme(next) {
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
    updateThemeButton();
  }

  if (themeBtn) {
    updateThemeButton();
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';

      // Animated circular sweep from the button, where supported
      if (!document.startViewTransition || reduceMotion) { applyTheme(next); return; }

      var r = themeBtn.getBoundingClientRect();
      var x = r.left + r.width / 2;
      var y = r.top + r.height / 2;
      var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

      root.classList.add('theme-switching');
      var transition = document.startViewTransition(function () { applyTheme(next); });
      transition.ready.then(function () {
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function () {});
      transition.finished.then(function () { root.classList.remove('theme-switching'); })
        .catch(function () { root.classList.remove('theme-switching'); });
    });
  }

  /* ---- Scroll-driven bits: header, progress bar, back-to-top, timeline -- */
  var header = document.querySelector('.site-header');
  var progressBar = document.querySelector('.scroll-progress');
  var backToTop = document.querySelector('.back-to-top');
  var timelines = document.querySelectorAll('.timeline');
  var scrollTicking = false;

  function updateTimelines() {
    var vh = window.innerHeight;
    var reach = vh * 0.78; // the line is "drawn" up to this point on screen
    timelines.forEach(function (tl) {
      var r = tl.getBoundingClientRect();
      var progress = reduceMotion ? 1 : clamp((reach - r.top) / r.height, 0, 1);
      // Only ever grows, so scrolling back up doesn't "undraw" the line
      var drawn = parseFloat(tl.style.getPropertyValue('--draw')) || 0;
      if (progress > drawn) tl.style.setProperty('--draw', progress.toFixed(3));
      tl.querySelectorAll('.timeline-item').forEach(function (item) {
        var ir = item.getBoundingClientRect();
        if (reduceMotion || ir.top + 36 < reach) item.classList.add('is-reached');
      });
    });
  }

  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (progressBar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0).toFixed(4) + ')';
    }
    if (backToTop) backToTop.classList.toggle('is-visible', y > 600);
    if (timelines.length) updateTimelines();
    scrollTicking = false;
  }

  function requestScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(onScroll);
  }

  onScroll();
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll);
  window.addEventListener('load', requestScroll);

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var target = document.getElementById('top') || document.body;
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

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
    navMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        navToggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (header && !header.contains(e.target)) setMenu(false);
    });
    window.matchMedia('(min-width: 821px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---- Active nav link ------------------------------------------------ */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-menu a[href^="#"]'));
  if (navLinks.length) {
    var navSections = navLinks
      .map(function (a) { return { link: a, el: document.getElementById(a.getAttribute('href').slice(1)) }; })
      .filter(function (s) { return s.el; });

    var activeLink = null;
    var navTicking = false;
    var updateActiveNav = function () {
      navTicking = false;
      var y = window.scrollY || 0;
      var line = y + window.innerHeight * 0.35;
      var atBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 2;
      var current = null;
      if (atBottom) {
        current = navSections[navSections.length - 1];
      } else {
        navSections.forEach(function (s) {
          if (s.el.offsetTop <= line) current = s;
        });
        // Above the first section (i.e. in the hero): no active link
        if (current && y < navSections[0].el.offsetTop - window.innerHeight * 0.6) current = null;
      }
      var link = current ? current.link : null;
      if (link === activeLink) return;
      if (activeLink) { activeLink.classList.remove('is-active'); activeLink.removeAttribute('aria-current'); }
      if (link) { link.classList.add('is-active'); link.setAttribute('aria-current', 'true'); }
      activeLink = link;
    };
    var requestNav = function () {
      if (navTicking) return;
      navTicking = true;
      requestAnimationFrame(updateActiveNav);
    };
    updateActiveNav();
    window.addEventListener('scroll', requestNav, { passive: true });
    window.addEventListener('resize', requestNav);
    window.addEventListener('load', requestNav);
  }

  /* ---- Fade-in on scroll (staggered) --------------------------------- */
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
          delay = 65 + Math.random() * 45;
          if (charIndex >= phrase.length) {
            charIndex = phrase.length;
            deleting = true;
            delay = 2600;
          }
        }
        typed.textContent = phrases[phraseIndex].slice(0, charIndex);
        wrap.classList.toggle('is-typing', delay < 400);
        setTimeout(tick, delay);
      };
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
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    var counterObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
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
    marquee.classList.add('is-animated');

    var guard = 0;
    while (list.scrollWidth < window.innerWidth && guard++ < 10) {
      originals.forEach(function (li) {
        var c = li.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        list.appendChild(c);
      });
    }
    var copy = list.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    track.appendChild(copy);
    marquee.style.setProperty('--marquee-duration', Math.round(list.scrollWidth / 35) + 's');
  }

  /* ---- Card glow border + 3D tilt (desktop with a mouse) --------------- */
  var cards = document.querySelectorAll('.card');
  if (cards.length) {
    var MAX_TILT = 4; // degrees (override per card with data-tilt-max="…")
    var glowFrame = null;

    document.addEventListener('pointermove', function (e) {
      if (!root.classList.contains('fx') || e.pointerType !== 'mouse') return;
      var card = e.target.closest ? e.target.closest('.card') : null;
      if (!card) return;
      var x = e.clientX, y = e.clientY;
      if (glowFrame) cancelAnimationFrame(glowFrame);
      glowFrame = requestAnimationFrame(function () {
        var r = card.getBoundingClientRect();
        var px = (x - r.left) / r.width;
        var py = (y - r.top) / r.height;
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        if (card.hasAttribute('data-tilt')) {
          var max = parseFloat(card.getAttribute('data-tilt-max')) || MAX_TILT;
          card.style.setProperty('--ry', ((px - 0.5) * 2 * max).toFixed(2) + 'deg');
          card.style.setProperty('--rx', ((0.5 - py) * 2 * max).toFixed(2) + 'deg');
          card.classList.add('is-tilting');
        }
      });
    }, { passive: true });

    cards.forEach(function (card) {
      card.addEventListener('pointerleave', function () {
        card.classList.remove('is-tilting');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---- Hero network background (canvas) ------------------------------- */
  var hero = document.querySelector('.hero');
  var canvas = document.querySelector('.hero-network');
  if (hero && canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var nodes = [];
    var width = 0, height = 0, dpr = 1;
    var mouse = { x: -9999, y: -9999, active: false, sx: -9999, sy: -9999 };
    var running = false, heroVisible = true, rafId = null;
    var rgb = '45, 212, 191';
    var LINK_DIST = 150;   // px: max distance for a connecting line
    var MOUSE_DIST = 200;  // px: radius the cursor affects

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

      var count = Math.min(90, Math.round((width * height) / 15000));
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

      // Smoothed cursor position so the glow trails gently rather than snapping
      if (mouse.active) {
        if (mouse.sx < -999) { mouse.sx = mouse.x; mouse.sy = mouse.y; }
        mouse.sx += (mouse.x - mouse.sx) * 0.12;
        mouse.sy += (mouse.y - mouse.sy) * 0.12;
      }

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (mouse.active) {
          var mdx = n.x - mouse.sx, mdy = n.y - mouse.sy;
          var md = Math.sqrt(mdx * mdx + mdy * mdy);
          if (md < MOUSE_DIST && md > 0.1) {
            var force = (1 - md / MOUSE_DIST) * 0.02;
            n.vx += (mdx / md) * force;
            n.vy += (mdy / md) * force;
          }
        }
        n.vx *= 0.99; n.vy *= 0.99;
        var speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed < 0.08) { n.vx *= 1.05; n.vy *= 1.05; }
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = width + 20; else if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20; else if (n.y > height + 20) n.y = -20;
      }

      // Soft glow that follows the cursor
      if (mouse.active) {
        var halo = ctx.createRadialGradient(mouse.sx, mouse.sy, 0, mouse.sx, mouse.sy, MOUSE_DIST * 1.3);
        halo.addColorStop(0, 'rgba(' + rgb + ',0.14)');
        halo.addColorStop(1, 'rgba(' + rgb + ',0)');
        ctx.fillStyle = halo;
        ctx.fillRect(mouse.sx - MOUSE_DIST * 1.3, mouse.sy - MOUSE_DIST * 1.3, MOUSE_DIST * 2.6, MOUSE_DIST * 2.6);
      }

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
        if (mouse.active) {
          var cx = nodes[a].x - mouse.sx, cy = nodes[a].y - mouse.sy;
          var cd = Math.sqrt(cx * cx + cy * cy);
          if (cd < MOUSE_DIST) {
            ctx.strokeStyle = 'rgba(' + rgb + ',' + ((1 - cd / MOUSE_DIST) * 0.35).toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(mouse.sx, mouse.sy);
            ctx.stroke();
          }
        }
      }

      for (var k = 0; k < nodes.length; k++) {
        var node = nodes[k];
        var bright = 0.5;
        if (mouse.active) {
          var ndx = node.x - mouse.sx, ndy = node.y - mouse.sy;
          var nd = Math.sqrt(ndx * ndx + ndy * ndy);
          if (nd < MOUSE_DIST) bright += (1 - nd / MOUSE_DIST) * 0.5;
        }
        ctx.fillStyle = 'rgba(' + rgb + ',' + bright.toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
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
    reduceMotionQuery.addEventListener('change', setNetworkState);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { if (fxEnabled()) resize(); }, 150);
    });

    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
    });
    hero.addEventListener('pointerleave', function () { mouse.active = false; mouse.sx = mouse.sy = -9999; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible) start(); else stop();
      }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
    new MutationObserver(readColour).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  }

  /* ---- Terminal-style build log (homelab page) ------------------------ */
  var buildLogs = document.querySelectorAll('.build-log');
  if (buildLogs.length) {
    var runLog = function (log) {
      var entries = log.querySelectorAll('.log-entry');
      entries.forEach(function (entry, i) {
        setTimeout(function () { entry.classList.add('is-done'); }, 350 + i * 420);
      });
      setTimeout(function () { log.classList.add('is-complete'); }, 350 + entries.length * 420 + 150);
    };

    if (reduceMotion || !('IntersectionObserver' in window)) {
      buildLogs.forEach(function (log) {
        log.querySelectorAll('.log-entry').forEach(function (e) { e.classList.add('is-done'); });
        log.classList.add('is-complete');
      });
    } else {
      buildLogs.forEach(function (log) { log.classList.add('is-armed'); });
      var logObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          obs.unobserve(entry.target);
          runLog(entry.target);
        });
      }, { threshold: 0.15 });
      buildLogs.forEach(function (log) { logObserver.observe(log); });
    }
  }

  /* ---- 404 page: show the path that was requested --------------------- */
  var missingPath = document.querySelector('[data-missing-path]');
  if (missingPath) {
    var path = window.location.pathname || '/';
    missingPath.textContent = path.length > 60 ? path.slice(0, 57) + '…' : path;
  }

  /* ---- Printing: make sure nothing is mid-animation on paper ---------- */
  window.addEventListener('beforeprint', function () {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
    document.querySelectorAll('[data-count]').forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
    document.querySelectorAll('.log-entry').forEach(function (el) { el.classList.add('is-done'); });
    document.querySelectorAll('.build-log').forEach(function (el) { el.classList.add('is-complete'); });
  });

  /* ---- Footer year ---------------------------------------------------- */
  var year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = year; });
})();
