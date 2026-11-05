/* ==========================================================================
   Harry – Portfolio scripts (vanilla JS + optional GSAP/ScrollTrigger)
   --------------------------------------------------------------------------
   Everything here degrades gracefully:
   - GSAP + ScrollTrigger (js/vendor) drive reveals, parallax and the timeline.
     If they are missing, IntersectionObserver reveals take over.
   - js/network.js (hero canvas) and js/palette.js (command palette + terminal)
     are lazy-loaded only when needed.
   - Reduced motion: loader, canvas, tilt, parallax, cursor, scramble and
     typing are all skipped; reveals become short opacity fades.
   - Touch devices: no cursor, tilt or magnetic effects; static canvas frame.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFx = window.matchMedia('(min-width: 821px) and (hover: hover) and (pointer: fine)');
  var reduceMotion = mqReduce.matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || '') || /Mac/.test(navigator.userAgent);

  var clamp = function (v, min, max) { return Math.max(min, Math.min(max, v)); };
  var qs = function (s, el) { return (el || document).querySelector(s); };
  var qsa = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* The inline head script hides reveal targets and arms a safety timer.
     We are alive, so clear it: the animations below will show everything. */
  if (window.__revealSafety) { clearTimeout(window.__revealSafety); window.__revealSafety = null; }

  if (hasGsap) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.config({ nullTargetWarn: false });
  } else {
    root.classList.add('no-gsap');
  }

  var fxEnabled = function () { return mqFx.matches && !reduceMotion; };
  var setFx = function () { root.classList.toggle('fx', fxEnabled()); };
  setFx();
  mqFx.addEventListener('change', setFx);
  mqReduce.addEventListener('change', function (e) { reduceMotion = e.matches; setFx(); });

  /* Platform-aware modifier label (⌘ on Apple devices) */
  qsa('[data-mod-key]').forEach(function (el) { el.textContent = isMac ? '⌘' : 'Ctrl'; });

  /* ---- Tiny script loader (for lazy modules) ------------------------------ */
  var loaded = {};
  function loadScript(src) {
    if (loaded[src]) return loaded[src];
    loaded[src] = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.onload = resolve;
      s.onerror = function () { delete loaded[src]; reject(new Error('Failed to load ' + src)); };
      document.head.appendChild(s);
    });
    return loaded[src];
  }
  var scriptBase = (function () {
    var me = qs('script[src*="main.js"]');
    return me ? me.getAttribute('src').replace(/main\.js.*$/, '') : 'js/';
  })();
  var VERSION = (function () {
    var me = qs('script[src*="main.js"]');
    var m = me && me.getAttribute('src').match(/\?v=([\w.-]+)/);
    return m ? '?v=' + m[1] : '';
  })();

  var onIdle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 200); };

  /* ---- Text scramble (hero headline, section headings) --------------------- */
  var SCRAMBLE_CHARS = '!<>-_\\/[]{}=+*^?#_01';
  var activeScrambles = [];
  function finishScrambles() { activeScrambles.splice(0).forEach(function (cancel) { cancel(); }); }
  function scramble(el, opts) {
    opts = opts || {};
    var text = el.getAttribute('data-text') || el.textContent;
    el.setAttribute('data-text', text);
    if (reduceMotion) { el.textContent = text; if (opts.onDone) opts.onDone(); return; }
    var duration = opts.duration || 900;
    var chars = text.split('');
    var start = null;
    var rafId;
    // Lock the element's box for the duration so random glyphs never shift layout
    var rect = el.getBoundingClientRect();
    var prevStyle = el.getAttribute('style') || '';
    if (rect.width && getComputedStyle(el).display.indexOf('inline') === 0) {
      el.style.display = 'inline-block';
      el.style.width = rect.width + 'px';
      el.style.whiteSpace = 'nowrap';
      el.style.overflow = 'hidden';
      el.style.verticalAlign = 'bottom';
    }
    var unlock = function () { if (prevStyle) el.setAttribute('style', prevStyle); else el.removeAttribute('style'); };
    el.classList.add('scramble');
    el.setAttribute('aria-label', text);
    var step = function (now) {
      if (start === null) start = now;
      var p = clamp((now - start) / duration, 0, 1);
      var html = '';
      for (var i = 0; i < chars.length; i++) {
        var c = chars[i];
        if (c === ' ') { html += ' '; continue; }
        // each character resolves at a slightly different point in the timeline
        var resolveAt = (i / chars.length) * 0.75 + 0.2;
        if (p >= resolveAt) {
          html += c;
        } else if (Math.random() < 0.28) {
          html += '<span class="sc-rand">' + SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)] + '</span>';
        } else {
          html += '<span class="sc-rand">' + (el._last && el._last[i] ? el._last[i] : ' ') + '</span>';
        }
      }
      el.innerHTML = html;
      el._last = qsa('.sc-rand', el).map(function (s) { return s.textContent; });
      if (p < 1) rafId = requestAnimationFrame(step);
      else {
        el.textContent = text;
        el.classList.remove('scramble');
        el.removeAttribute('aria-label');
        unlock();
        var idx = activeScrambles.indexOf(cancel);
        if (idx >= 0) activeScrambles.splice(idx, 1);
        if (opts.onDone) opts.onDone();
      }
    };
    rafId = requestAnimationFrame(step);
    var cancel = function () {
      cancelAnimationFrame(rafId);
      el.textContent = text;
      el.classList.remove('scramble');
      el.removeAttribute('aria-label');
      unlock();
      var i = activeScrambles.indexOf(cancel);
      if (i >= 0) activeScrambles.splice(i, 1);
    };
    activeScrambles.push(cancel);
    return cancel;
  }

  /* ---- Boot loader --------------------------------------------------------- */
  var boot = qs('#boot');
  var bootDone = Promise.resolve();
  if (boot && !root.classList.contains('booted') && !reduceMotion) {
    bootDone = new Promise(function (resolve) {
      var lines = qsa('.boot-line', boot);
      var bar = qs('.boot-progress i', boot);
      var skipBtn = qs('.boot-skip', boot);
      var timers = [];
      var finished = false;

      var finish = function () {
        if (finished) return;
        finished = true;
        timers.forEach(clearTimeout);
        try { sessionStorage.setItem('booted', '1'); } catch (e) {}
        boot.classList.add('is-done');
        root.classList.add('booted');
        document.removeEventListener('keydown', onKey);
        setTimeout(function () { if (boot.parentNode) boot.parentNode.removeChild(boot); }, 500);
        resolve();
      };
      var onKey = function (e) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(); }
      };

      body.style.overflow = 'hidden';
      lines.forEach(function (line, i) {
        timers.push(setTimeout(function () {
          line.classList.add('is-on');
          var s = qs('.b-status', line);
          if (s) s.textContent = '[ OK ]';
          if (bar) bar.style.width = Math.round(((i + 1) / lines.length) * 100) + '%';
        }, 160 + i * 190));
      });
      timers.push(setTimeout(function () { body.style.overflow = ''; finish(); }, 160 + lines.length * 190 + 320));

      skipBtn && skipBtn.addEventListener('click', finish);
      boot.addEventListener('click', function (e) { if (e.target === boot) finish(); });
      document.addEventListener('keydown', onKey);
      bootDone.then(function () { body.style.overflow = ''; });
    });
  } else if (boot) {
    try { sessionStorage.setItem('booted', '1'); } catch (e) {}
    root.classList.add('booted');
    if (boot.parentNode) boot.parentNode.removeChild(boot);
  }

  /* ---- Theme toggle (circular reveal from the button) ----------------------- */
  var themeBtns = qsa('.theme-toggle');
  var THEME_COLOURS = { dark: '#070a12', light: '#f6f8fc' };

  function currentTheme() { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
  function updateThemeButtons() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    themeBtns.forEach(function (b) { b.setAttribute('aria-label', 'Switch to ' + next + ' mode'); });
    qsa('meta[name="theme-color"]').forEach(function (m) { m.setAttribute('content', THEME_COLOURS[currentTheme()]); });
  }
  function applyTheme(next) {
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    updateThemeButtons();
  }
  function toggleTheme(originEl) {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || reduceMotion) { applyTheme(next); return; }
    var x = window.innerWidth / 2, y = 40;
    if (originEl) { var r = originEl.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
    var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    root.classList.add('theme-switching');
    var t = document.startViewTransition(function () { applyTheme(next); });
    t.ready.then(function () {
      root.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 650, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(function () {});
    t.finished.then(function () { root.classList.remove('theme-switching'); })
      .catch(function () { root.classList.remove('theme-switching'); });
  }
  updateThemeButtons();
  themeBtns.forEach(function (b) { b.addEventListener('click', function () { toggleTheme(b); }); });

  /* ---- Scroll-driven chrome: header, progress, back-to-top, timeline ------- */
  var header = qs('.site-header');
  var progressBar = qs('.scroll-progress');
  var backToTop = qs('.back-to-top');
  var bttBar = backToTop && qs('.btt-bar', backToTop);
  var timelines = qsa('.timeline');
  var lastY = window.scrollY || 0;
  var scrollTicking = false;
  var overlayOpen = false; // set by palette / terminal via events

  function updateTimelinesFallback() {
    var reach = window.innerHeight * 0.8;
    timelines.forEach(function (tl) {
      var r = tl.getBoundingClientRect();
      var progress = reduceMotion ? 1 : clamp((reach - r.top) / r.height, 0, 1);
      var drawn = parseFloat(tl.style.getPropertyValue('--draw')) || 0;
      if (progress > drawn) tl.style.setProperty('--draw', progress.toFixed(3));
      qsa('.timeline-item', tl).forEach(function (item) {
        if (reduceMotion || item.getBoundingClientRect().top + 36 < reach) item.classList.add('is-reached');
      });
    });
  }

  function onScroll() {
    var y = window.scrollY || 0;
    var max = root.scrollHeight - window.innerHeight;
    var p = max > 0 ? clamp(y / max, 0, 1) : 0;
    if (header) {
      header.classList.toggle('is-scrolled', y > 8);
      var delta = y - lastY;
      if (!overlayOpen) {
        if (y > 140 && delta > 6) header.classList.add('is-hidden');
        else if (delta < -6 || y <= 140) header.classList.remove('is-hidden');
      }
    }
    if (progressBar) progressBar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (backToTop) {
      backToTop.classList.toggle('is-visible', y > 600);
      if (bttBar) bttBar.style.strokeDashoffset = (138.2 * (1 - p)).toFixed(1);
    }
    if (timelines.length && !hasGsap) updateTimelinesFallback();
    lastY = y;
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
      var target = qs('#top') || body;
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

  /* ---- Mobile navigation ---------------------------------------------------- */
  var navToggle = qs('.nav-toggle');
  var navMenu = qs('#nav-menu');
  function setMenu(open) {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navMenu.classList.toggle('is-open', open);
    if (header) header.classList.toggle('menu-open', open);
  }
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () { setMenu(navToggle.getAttribute('aria-expanded') !== 'true'); });
    navMenu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') { setMenu(false); navToggle.focus(); }
    });
    document.addEventListener('click', function (e) { if (header && !header.contains(e.target)) setMenu(false); });
    window.matchMedia('(min-width: 821px)').addEventListener('change', function (mq) { if (mq.matches) setMenu(false); });
  }

  /* ---- Active nav link ------------------------------------------------------ */
  var navLinks = qsa('.nav-menu a[href^="#"]');
  if (navLinks.length) {
    var navSections = navLinks
      .map(function (a) { return { link: a, el: document.getElementById(a.getAttribute('href').slice(1)) }; })
      .filter(function (s) { return s.el; });
    var activeLink = null, navTicking = false;
    var updateActiveNav = function () {
      navTicking = false;
      var y = window.scrollY || 0;
      var line = y + window.innerHeight * 0.35;
      var atBottom = y + window.innerHeight >= root.scrollHeight - 2;
      var current = null;
      if (atBottom) current = navSections[navSections.length - 1];
      else {
        navSections.forEach(function (s) { if (s.el.offsetTop <= line) current = s; });
        if (current && y < navSections[0].el.offsetTop - window.innerHeight * 0.6) current = null;
      }
      var link = current ? current.link : null;
      if (link === activeLink) return;
      if (activeLink) { activeLink.classList.remove('is-active'); activeLink.removeAttribute('aria-current'); }
      if (link) { link.classList.add('is-active'); link.setAttribute('aria-current', 'true'); }
      activeLink = link;
    };
    var requestNav = function () { if (navTicking) return; navTicking = true; requestAnimationFrame(updateActiveNav); };
    updateActiveNav();
    window.addEventListener('scroll', requestNav, { passive: true });
    window.addEventListener('resize', requestNav);
    window.addEventListener('load', requestNav);
  }

  /* ---- Hero intro: stagger, scramble, typed role, count-up ------------------- */
  var hero = qs('.hero');
  var heroIns = qsa('[data-hero-in]');
  var heroVisual = qs('.hero-visual');

  function runHeroIntro() {
    var scrambles = qsa('[data-scramble]');
    if (reduceMotion) {
      heroIns.forEach(function (el) { el.classList.add('is-in'); });
      if (heroVisual) heroVisual.classList.add('is-on');
      startTyping(3000);
      return;
    }
    if (hasGsap) {
      window.gsap.fromTo(heroIns, { autoAlpha: 0, y: 26 }, {
        autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.09, delay: 0.05,
        onComplete: function () { heroIns.forEach(function (el) { el.classList.add('is-in'); }); window.gsap.set(heroIns, { clearProps: 'all' }); }
      });
    } else {
      heroIns.forEach(function (el, i) { el.style.transitionDelay = (i * 90) + 'ms'; el.classList.add('is-in'); });
    }
    scrambles.forEach(function (el, i) { setTimeout(function () { scramble(el, { duration: 900 + i * 200 }); }, 150 + i * 120); });
    if (heroVisual) setTimeout(function () { heroVisual.classList.add('is-on'); }, 300);
    startTyping(3200);
  }

  var typedStarted = false;
  function startTyping(initialDelay) {
    var typed = qs('.typed[data-phrases]');
    if (!typed || reduceMotion || typedStarted) return;
    typedStarted = true;
    var phrases;
    try { phrases = JSON.parse(typed.getAttribute('data-phrases')); } catch (e) { phrases = null; }
    if (!phrases || phrases.length < 2) return;
    var wrap = typed.closest('.typed-wrap');
    var phraseIndex = 0, charIndex = phrases[0].length, deleting = true;
    wrap.classList.add('typing-active');
    var tick = function () {
      if (document.hidden) { setTimeout(tick, 600); return; }
      var phrase = phrases[phraseIndex], delay;
      if (deleting) {
        charIndex--; delay = 32;
        if (charIndex <= 0) { charIndex = 0; deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; delay = 420; }
      } else {
        charIndex++; delay = 60 + Math.random() * 45;
        if (charIndex >= phrase.length) { charIndex = phrase.length; deleting = true; delay = 2800; }
      }
      typed.textContent = phrases[phraseIndex].slice(0, charIndex);
      wrap.classList.toggle('is-typing', delay < 400);
      setTimeout(tick, delay);
    };
    setTimeout(tick, initialDelay);
  }

  var counters = qsa('[data-count]');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    var runCounter = function (el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var decimals = (String(el.getAttribute('data-count')).split('.')[1] || '').length;
      var duration = 1200, startTime = null;
      var step = function (now) {
        if (startTime === null) startTime = now;
        var t = Math.min((now - startTime) / duration, 1);
        el.textContent = (target * (1 - Math.pow(1 - t, 3))).toFixed(decimals);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var counterObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        bootDone.then(function () { setTimeout(function () { runCounter(entry.target); }, 700); });
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { el.textContent = '0'; counterObserver.observe(el); });
  }

  bootDone.then(runHeroIntro);

  /* ---- Scroll reveals ------------------------------------------------------ */
  var reveals = qsa('[data-reveal]');
  function siblingIndex(el) {
    var sibs = qsa(':scope > [data-reveal]', el.parentNode);
    return Math.max(0, sibs.indexOf(el));
  }
  if (reveals.length) {
    if (hasGsap && !reduceMotion) {
      reveals.forEach(function (el) {
        var from = el.getAttribute('data-reveal-from');
        var wide = window.innerWidth >= 900;
        var x = wide && from === 'left' ? -48 : wide && from === 'right' ? 48 : 0;
        var y = x ? 0 : 28;
        window.gsap.fromTo(el, { autoAlpha: 0, x: x, y: y }, {
          autoAlpha: 1, x: 0, y: 0,
          duration: 0.95,
          ease: 'power3.out',
          delay: Math.min(siblingIndex(el) * 0.08, 0.4),
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onComplete: function () { el.classList.add('is-in'); window.gsap.set(el, { clearProps: 'all' }); }
        });
      });
    } else if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.filter(function (e) { return e.isIntersecting; })
          .map(function (e) { return e.target; })
          .sort(function (a, b) { var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return (ra.top - rb.top) || (ra.left - rb.left); })
          .forEach(function (el, i) {
            obs.unobserve(el);
            el.style.transitionDelay = (reduceMotion ? 0 : Math.min(i * 80, 400)) + 'ms';
            el.classList.add('is-in');
          });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      reveals.forEach(function (el) { revealObserver.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* ---- Heading decode effect ------------------------------------------------ */
  var decodes = qsa('[data-decode]');
  if (decodes.length && !reduceMotion && 'IntersectionObserver' in window) {
    var decodeObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        scramble(entry.target, { duration: 750 });
      });
    }, { threshold: 0.4 });
    decodes.forEach(function (el) { decodeObserver.observe(el); });
  }

  /* ---- Parallax (GSAP scrub; skipped on touch / reduced motion) -------------- */
  if (hasGsap && fxEnabled()) {
    qsa('[data-parallax]').forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
      var container = el.closest('.hero, .featured-cover, .article-banner, .section') || el.parentNode;
      var amp = 240 * speed;
      window.gsap.fromTo(el, { y: -amp }, {
        y: amp, ease: 'none',
        scrollTrigger: { trigger: container, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      });
    });
    if (hero) {
      window.gsap.to('.hero-inner', {
        y: 70, opacity: 0.25, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 }
      });
    }
  }

  /* ---- Timeline draw (GSAP scrub, with scroll fallback above) ---------------- */
  if (timelines.length && hasGsap && !reduceMotion) {
    timelines.forEach(function (tl) {
      var state = { v: 0 };
      tl.style.setProperty('--draw', '0');
      window.gsap.to(state, {
        v: 1, ease: 'none',
        scrollTrigger: { trigger: tl, start: 'top 80%', end: 'bottom 70%', scrub: 0.4 },
        onUpdate: function () {
          var cur = parseFloat(tl.style.getPropertyValue('--draw')) || 0;
          if (state.v > cur) tl.style.setProperty('--draw', state.v.toFixed(3));
        }
      });
      qsa('.timeline-item', tl).forEach(function (item) {
        window.ScrollTrigger.create({ trigger: item, start: 'top 80%', once: true, onEnter: function () { item.classList.add('is-reached'); } });
      });
    });
  } else if (timelines.length && reduceMotion) {
    timelines.forEach(function (tl) { tl.style.setProperty('--draw', '1'); qsa('.timeline-item', tl).forEach(function (i) { i.classList.add('is-reached'); }); });
  }

  /* ---- Skill marquees (two rows, opposite directions) ------------------------- */
  var marqueeGroups = qsa('.marquee-group');
  marqueeGroups.forEach(function (group) {
    if (reduceMotion) return;
    group.classList.add('is-animated');
    qsa('.marquee', group).forEach(function (marquee) {
      var track = qs('.marquee-track', marquee);
      var list = qs('.marquee-list', marquee);
      var originals = qsa(':scope > li', list);
      marquee.classList.add('is-animated');
      var guard = 0;
      while (list.scrollWidth < window.innerWidth * 1.2 && guard++ < 10) {
        originals.forEach(function (li) { var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); list.appendChild(c); });
      }
      var copy = list.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
      marquee.style.setProperty('--marquee-duration', Math.round(list.scrollWidth / 42) + 's');
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { group.classList.toggle('is-paused', !entries[0].isIntersecting); }).observe(group);
    }
  });

  /* ---- Card spotlight + tilt (desktop with a mouse) ---------------------------- */
  var cards = qsa('.card');
  if (cards.length) {
    var MAX_TILT = 4;
    var glowFrame = null;
    document.addEventListener('pointermove', function (e) {
      if (!root.classList.contains('fx') || e.pointerType !== 'mouse') return;
      var card = e.target.closest ? e.target.closest('.card') : null;
      if (!card) return;
      var x = e.clientX, y = e.clientY;
      if (glowFrame) cancelAnimationFrame(glowFrame);
      glowFrame = requestAnimationFrame(function () {
        var r = card.getBoundingClientRect();
        var px = (x - r.left) / r.width, py = (y - r.top) / r.height;
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

  /* ---- Magnetic buttons ----------------------------------------------------- */
  qsa('[data-magnetic]').forEach(function (btn) {
    var strength = 0.35, radius = 80;
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null, active = false;
    var loop = function () {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      btn.style.transform = 'translate(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px)';
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) raf = requestAnimationFrame(loop);
      else { raf = null; if (!active) btn.style.transform = ''; }
    };
    var kick = function () { if (!raf) raf = requestAnimationFrame(loop); };
    btn.addEventListener('pointermove', function (e) {
      if (!root.classList.contains('fx') || e.pointerType !== 'mouse') return;
      var r = btn.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      var d = Math.hypot(dx, dy);
      active = true;
      var f = d < radius + r.width / 2 ? strength : 0;
      tx = dx * f; ty = dy * f;
      kick();
    });
    btn.addEventListener('pointerleave', function () { active = false; tx = 0; ty = 0; kick(); });
  });

  /* ---- Custom cursor (desktop, fine pointer, no reduced motion) --------------- */
  (function cursor() {
    if (!fxEnabled() || !window.matchMedia('(hover: hover)').matches) return;
    var dot = document.createElement('div'); dot.className = 'cursor-dot';
    var ring = document.createElement('div'); ring.className = 'cursor-ring';
    dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
    body.appendChild(dot); body.appendChild(ring);
    var x = -100, y = -100, rx = -100, ry = -100, raf = null, shown = false;
    var loop = function () {
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      if (Math.abs(x - rx) > 0.2 || Math.abs(y - ry) > 0.2) raf = requestAnimationFrame(loop); else raf = null;
    };
    var hoverSel = 'a, button, [role="button"], input, textarea, select, summary, label, [data-tilt], .marquee-list li';
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') { root.classList.remove('has-cursor'); return; }
      if (!root.classList.contains('fx')) return;
      if (!shown) { shown = true; root.classList.add('has-cursor'); rx = e.clientX; ry = e.clientY; }
      x = e.clientX; y = e.clientY;
      dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      root.classList.remove('cursor-hidden');
      var t = e.target.closest ? e.target.closest(hoverSel) : null;
      root.classList.toggle('cursor-hover', !!t && !(t.matches('input, textarea')));
      root.classList.toggle('cursor-text', !!t && t.matches('input, textarea'));
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener('pointerleave', function () { root.classList.add('cursor-hidden'); });
    document.addEventListener('pointerenter', function () { root.classList.remove('cursor-hidden'); });
    document.addEventListener('pointerdown', function () { root.classList.add('cursor-down'); });
    document.addEventListener('pointerup', function () { root.classList.remove('cursor-down'); });
    window.addEventListener('blur', function () { root.classList.add('cursor-hidden'); });
    mqFx.addEventListener('change', function () { if (!fxEnabled()) root.classList.remove('has-cursor'); });
  })();

  /* ---- Hero network canvas (lazy module) -------------------------------------- */
  var canvas = qs('.hero-network');
  if (hero && canvas && !reduceMotion) {
    var startNetwork = function () {
      loadScript(scriptBase + 'network.js' + VERSION).then(function () {
        if (window.HLNetwork) window.HLNetwork.init(hero, canvas, { animated: fxEnabled() });
      }).catch(function () {});
    };
    bootDone.then(function () { onIdle(startNetwork, { timeout: 1500 }); });
    mqFx.addEventListener('change', function () { if (window.HLNetwork) window.HLNetwork.setAnimated(fxEnabled()); });
    mqReduce.addEventListener('change', function () { if (window.HLNetwork) window.HLNetwork.setAnimated(fxEnabled()); });
  }

  /* ---- Command palette + terminal (lazy module) --------------------------------- */
  var paletteReady = null;
  function ensurePalette() {
    if (!paletteReady) {
      paletteReady = loadScript(scriptBase + 'palette.js' + VERSION).then(function () {
        if (window.HLPalette) window.HLPalette.init({ toggleTheme: toggleTheme, currentTheme: currentTheme, reduceMotion: function () { return reduceMotion; } });
      });
    }
    return paletteReady;
  }
  document.addEventListener('overlay:change', function (e) { overlayOpen = !!(e.detail && e.detail.open); if (overlayOpen && header) header.classList.remove('is-hidden'); });

  qsa('[data-palette-open]').forEach(function (b) {
    b.addEventListener('click', function () { ensurePalette().then(function () { window.HLPalette.open(); }).catch(function () {}); });
  });
  document.addEventListener('keydown', function (e) {
    var k = e.key;
    var inField = e.target && e.target.matches && e.target.matches('input, textarea, select, [contenteditable="true"]');
    if ((e.ctrlKey || e.metaKey) && !e.altKey && (k === 'k' || k === 'K')) {
      e.preventDefault();
      ensurePalette().then(function () { window.HLPalette.toggle(); }).catch(function () {});
    } else if (k === '`' && !inField && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      ensurePalette().then(function () { window.HLPalette.toggleTerminal(); }).catch(function () {});
    }
  });
  // Warm the module when the browser is idle so the first Ctrl+K is instant
  bootDone.then(function () { onIdle(function () { ensurePalette().catch(function () {}); }, { timeout: 4000 }); });

  /* ---- Page transitions (cross-document View Transitions, JS fade fallback) ---- */
  (function pageTransitions() {
    var supportsCrossDoc = 'onpagereveal' in window;
    var fade = document.createElement('div');
    fade.className = 'page-fade';
    fade.setAttribute('aria-hidden', 'true');
    body.appendChild(fade);
    if (supportsCrossDoc || reduceMotion) return;
    // Fade in if we arrived via the fallback
    var navType = (performance.getEntriesByType('navigation')[0] || {}).type;
    try {
      if (sessionStorage.getItem('page-fade') && navType !== 'back_forward') {
        root.classList.add('is-entering');
        requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.remove('is-entering'); }); });
      }
      sessionStorage.removeItem('page-fade');
    } catch (e) {}
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return; // same-page anchor
      e.preventDefault();
      try { sessionStorage.setItem('page-fade', '1'); } catch (err) {}
      root.classList.add('is-leaving');
      setTimeout(function () { location.href = url.href; }, 230);
    });
    window.addEventListener('pageshow', function (ev) { if (ev.persisted) root.classList.remove('is-leaving'); });
  })();

  /* ---- Terminal-style build log (homelab page) -------------------------------- */
  var buildLogs = qsa('.build-log');
  if (buildLogs.length) {
    var runLog = function (log) {
      var cmd = qs('.typed-cmd', log);
      var entries = qsa('.log-entry', log);
      var begin = function () {
        entries.forEach(function (entry, i) { setTimeout(function () { entry.classList.add('is-done'); }, 200 + i * 260); });
        setTimeout(function () { log.classList.add('is-complete'); }, 200 + entries.length * 260 + 120);
      };
      if (cmd) {
        var text = cmd.textContent, i = 0;
        cmd.textContent = '';
        log.classList.add('is-typing');
        var type = function () {
          cmd.textContent = text.slice(0, ++i);
          if (i < text.length) setTimeout(type, 22 + Math.random() * 28); else setTimeout(begin, 180);
        };
        setTimeout(type, 120);
      } else begin();
    };
    if (reduceMotion || !('IntersectionObserver' in window)) {
      buildLogs.forEach(function (log) { qsa('.log-entry', log).forEach(function (e) { e.classList.add('is-done'); }); log.classList.add('is-complete'); });
    } else {
      buildLogs.forEach(function (log) { log.classList.add('is-armed'); });
      var logObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) { if (!entry.isIntersecting) return; obs.unobserve(entry.target); runLog(entry.target); });
      }, { threshold: 0.15 });
      buildLogs.forEach(function (log) { logObserver.observe(log); });
    }
  }

  /* ---- Interactive architecture diagram (homelab page) ------------------------- */
  qsa('.diagram').forEach(function (diagram) {
    var frame = qs('.diagram-frame', diagram);
    var nodes = qsa('.d-node[data-tip]', diagram);
    if (!frame || !nodes.length) return;
    var tip = document.createElement('div');
    tip.className = 'diagram-tip';
    tip.setAttribute('role', 'tooltip');
    tip.id = 'diagram-tip';
    frame.appendChild(tip);
    var active = null;
    var show = function (node) {
      active = node;
      nodes.forEach(function (n) { n.classList.toggle('is-active', n === node); });
      var title = node.getAttribute('data-tip-title') || '';
      tip.innerHTML = (title ? '<strong></strong>' : '') + '<span></span>';
      if (title) qs('strong', tip).textContent = title;
      qs('span', tip).textContent = node.getAttribute('data-tip');
      node.setAttribute('aria-describedby', 'diagram-tip');
      var fr = frame.getBoundingClientRect(), nr = node.getBoundingClientRect();
      tip.classList.add('is-on');
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      var left = nr.left - fr.left + frame.scrollLeft + nr.width / 2 - tw / 2;
      left = clamp(left, 8, frame.scrollWidth - tw - 8);
      var top = nr.top - fr.top - th - 10;
      if (top < 4) top = nr.bottom - fr.top + 10;
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
    };
    var hide = function () {
      tip.classList.remove('is-on');
      if (active) { active.classList.remove('is-active'); active.removeAttribute('aria-describedby'); }
      active = null;
    };
    nodes.forEach(function (node) {
      node.setAttribute('tabindex', '0');
      node.setAttribute('role', 'img');
      if (!node.getAttribute('aria-label')) node.setAttribute('aria-label', (node.getAttribute('data-tip-title') || '') + '. ' + node.getAttribute('data-tip'));
      node.addEventListener('pointerenter', function () { show(node); });
      node.addEventListener('pointerleave', hide);
      node.addEventListener('focus', function () { show(node); });
      node.addEventListener('blur', hide);
      node.addEventListener('click', function () { if (active === node) hide(); else show(node); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && active) hide(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { diagram.classList.toggle('is-paused', !entries[0].isIntersecting); }).observe(diagram);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) diagram.classList.add('is-paused'); else if (!diagram.classList.contains('is-offscreen')) diagram.classList.remove('is-paused'); });
  });

  /* ---- 404 page: show the path that was requested ----------------------------- */
  var missingPath = qs('[data-missing-path]');
  if (missingPath) {
    var path = window.location.pathname || '/';
    missingPath.textContent = path.length > 60 ? path.slice(0, 57) + '…' : path;
  }
  var nfLines = qsa('[data-nf-line]');
  if (nfLines.length && !reduceMotion) {
    nfLines.forEach(function (line, i) { line.style.opacity = '0'; setTimeout(function () { line.style.transition = 'opacity 200ms ease'; line.style.opacity = '1'; }, 150 + i * 260); });
  }

  /* ---- Printing: nothing mid-animation on paper -------------------------------- */
  window.addEventListener('beforeprint', function () {
    finishScrambles();
    root.classList.add('reveal-all');
    qsa('[data-count]').forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
    qsa('.log-entry').forEach(function (el) { el.classList.add('is-done'); });
    qsa('.build-log').forEach(function (el) { el.classList.add('is-complete'); });
  });

  /* ---- Footer year ------------------------------------------------------------ */
  var year = String(new Date().getFullYear());
  qsa('[data-year]').forEach(function (el) { el.textContent = year; });
})();
