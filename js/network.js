/* ==========================================================================
   Hero network canvas: glowing nodes and connections that react to the mouse.
   Lazy-loaded by js/main.js. Frame rate is capped, the loop pauses when the
   hero is off screen or the tab is hidden, and touch devices get one static
   frame instead of an animation.
   ========================================================================== */
(function () {
  'use strict';

  var FPS_CAP = 48;             // frames per second ceiling
  var LINK_DIST = 150;          // px: max distance for a connecting line
  var MOUSE_DIST = 210;         // px: radius the cursor affects
  var MAX_NODES_DESKTOP = 70;
  var MAX_NODES_STATIC = 45;

  var state = null;

  function readColour(root) {
    var v = getComputedStyle(root).getPropertyValue('--accent-rgb').trim();
    return v || '46, 230, 197';
  }
  function readColour2(root) {
    var v = getComputedStyle(root).getPropertyValue('--accent-2-rgb').trim();
    return v || '123, 140, 255';
  }

  function init(hero, canvas, opts) {
    if (state) { setAnimated(!!(opts && opts.animated)); return; }
    var ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    var root = document.documentElement;
    state = {
      hero: hero, canvas: canvas, ctx: ctx,
      nodes: [], width: 0, height: 0, dpr: 1,
      mouse: { x: -9999, y: -9999, active: false, sx: -9999, sy: -9999 },
      running: false, visible: true, rafId: null, lastFrame: 0,
      rgb: readColour(root), rgb2: readColour2(root),
      animated: !!(opts && opts.animated),
      t: 0
    };

    resize();
    hero.classList.add('has-network');

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { resize(); if (!state.animated) drawFrame(0); }, 160);
    });

    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = hero.getBoundingClientRect();
      state.mouse.x = e.clientX - r.left;
      state.mouse.y = e.clientY - r.top;
      state.mouse.active = true;
    });
    hero.addEventListener('pointerleave', function () { state.mouse.active = false; state.mouse.sx = state.mouse.sy = -9999; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        state.visible = entries[0].isIntersecting;
        if (state.visible) start(); else stop();
      }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    new MutationObserver(function () { state.rgb = readColour(root); state.rgb2 = readColour2(root); if (!state.animated) drawFrame(0); })
      .observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    if (state.animated) start(); else drawFrame(0);
  }

  function resize() {
    var s = state;
    var r = s.hero.getBoundingClientRect();
    s.dpr = Math.min(window.devicePixelRatio || 1, s.animated ? 1.5 : 2);
    s.width = r.width; s.height = r.height;
    s.canvas.width = Math.round(s.width * s.dpr);
    s.canvas.height = Math.round(s.height * s.dpr);
    s.ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
    var cap = s.animated ? MAX_NODES_DESKTOP : MAX_NODES_STATIC;
    var count = Math.min(cap, Math.round((s.width * s.height) / 17000));
    while (s.nodes.length < count) {
      s.nodes.push({
        x: Math.random() * s.width,
        y: Math.random() * s.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.3 + 0.9,
        phase: Math.random() * Math.PI * 2
      });
    }
    s.nodes.length = count;
  }

  function drawFrame(dt) {
    var s = state, ctx = s.ctx, nodes = s.nodes, m = s.mouse;
    var w = s.width, h = s.height;
    ctx.clearRect(0, 0, w, h);
    s.t += dt;

    if (m.active) {
      if (m.sx < -999) { m.sx = m.x; m.sy = m.y; }
      m.sx += (m.x - m.sx) * 0.12;
      m.sy += (m.y - m.sy) * 0.12;
    }

    if (s.animated) {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (m.active) {
          var mdx = n.x - m.sx, mdy = n.y - m.sy;
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
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
      }
    }

    // Cursor halo
    if (m.active) {
      var halo = ctx.createRadialGradient(m.sx, m.sy, 0, m.sx, m.sy, MOUSE_DIST * 1.3);
      halo.addColorStop(0, 'rgba(' + s.rgb + ',0.13)');
      halo.addColorStop(1, 'rgba(' + s.rgb + ',0)');
      ctx.fillStyle = halo;
      ctx.fillRect(m.sx - MOUSE_DIST * 1.3, m.sy - MOUSE_DIST * 1.3, MOUSE_DIST * 2.6, MOUSE_DIST * 2.6);
    }

    // Links
    ctx.lineWidth = 1;
    for (var a = 0; a < nodes.length; a++) {
      var na = nodes[a];
      for (var b = a + 1; b < nodes.length; b++) {
        var nb = nodes[b];
        var dx = na.x - nb.x, dy = na.y - nb.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          var dist = Math.sqrt(d2);
          var alpha = (1 - dist / LINK_DIST) * 0.22;
          var near = 0;
          if (m.active) {
            var mx = (na.x + nb.x) / 2 - m.sx, my = (na.y + nb.y) / 2 - m.sy;
            var mdd = Math.sqrt(mx * mx + my * my);
            if (mdd < MOUSE_DIST) near = 1 - mdd / MOUSE_DIST;
          }
          ctx.strokeStyle = near > 0
            ? 'rgba(' + s.rgb + ',' + (alpha + near * 0.45).toFixed(3) + ')'
            : 'rgba(' + s.rgb2 + ',' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          ctx.stroke();
        }
      }
      if (m.active) {
        var cx = na.x - m.sx, cy = na.y - m.sy;
        var cd = Math.sqrt(cx * cx + cy * cy);
        if (cd < MOUSE_DIST) {
          ctx.strokeStyle = 'rgba(' + s.rgb + ',' + ((1 - cd / MOUSE_DIST) * 0.4).toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(m.sx, m.sy);
          ctx.stroke();
        }
      }
    }

    // Nodes (with a gentle twinkle)
    for (var k = 0; k < nodes.length; k++) {
      var node = nodes[k];
      var bright = 0.45 + 0.15 * Math.sin(s.t * 0.0012 + node.phase);
      var glow = 0;
      if (m.active) {
        var ndx = node.x - m.sx, ndy = node.y - m.sy;
        var nd = Math.sqrt(ndx * ndx + ndy * ndy);
        if (nd < MOUSE_DIST) { glow = 1 - nd / MOUSE_DIST; bright += glow * 0.5; }
      }
      if (glow > 0.25) {
        ctx.fillStyle = 'rgba(' + s.rgb + ',' + (glow * 0.25).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(' + s.rgb + ',' + bright.toFixed(2) + ')';
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(now) {
    var s = state;
    if (!s.running) return;
    s.rafId = requestAnimationFrame(loop);
    var elapsed = now - s.lastFrame;
    if (elapsed < 1000 / FPS_CAP) return;
    s.lastFrame = now - (elapsed % (1000 / FPS_CAP));
    drawFrame(elapsed);
  }

  function start() {
    var s = state;
    if (!s || !s.animated || s.running || !s.visible || document.hidden) return;
    s.running = true;
    s.lastFrame = performance.now();
    s.rafId = requestAnimationFrame(loop);
  }
  function stop() {
    if (!state) return;
    state.running = false;
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
  function setAnimated(on) {
    if (!state) return;
    state.animated = !!on;
    if (on) { resize(); start(); }
    else { stop(); resize(); drawFrame(0); }
  }

  window.HLNetwork = { init: init, setAnimated: setAnimated };
})();
