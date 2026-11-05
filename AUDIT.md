# Site audit and design plan

Portfolio: https://harrylyle07.github.io/ (static, GitHub Pages, no build step).
Audited on the `main` branch at commit `06a6d79` by reading every file and
screenshotting every page at 375 / 768 / 1440 px in both themes.

All facts and copy on the site stay exactly as they are. This work is about
design, motion, features and quality, not content.

---

## Part 1 – Audit

### What looks dated or generic

- **Single sans-serif for everything.** Inter is used for display, body and
  UI. Headings have no distinct voice, so the site reads like a Tailwind
  template rather than a designed product.
- **Stacked-box layouts.** Every section is "eyebrow → heading → grid of
  identical cards". There is no rhythm change between About, Skills, Projects
  and Certifications, so the page feels long and samey.
- **Stock-style illustrations.** The three rendered "switch" and "rack" images
  are labelled "Illustration" on the page. They read as placeholders (the
  README says they are) and the one in the hero competes with the console
  panel for attention.
- **Hexagon certificate badges** are the clip-art cliché of IT portfolios.
- **Floating "chips" in the hero** ("MS-900 certified", "Level 3 ·
  Distinction") duplicate the stats row directly below them.
- **Giant outlined section numbers** sit behind the eyebrow and visibly
  collide with it ("02" overlaps "02 / SKILLS" at 1440 px).
- **Accent-coloured first letter** on the About paragraph is a gimmick that
  adds nothing.
- The hero network canvas exists but is subtle to the point of invisibility
  in the first screenshot; there is no entrance moment at all.

### Inconsistent

- `css/styles.css` is 2,094 lines, written as a v1 and then a "Premium v2"
  block appended at the bottom that **overrides** earlier rules (`.hero-title`,
  `.about-grid`, `.skills-grid`, `.project-featured`, `.section-head` are each
  defined twice). Tokens exist but are only partially used; many values are
  magic numbers (`0.72rem`, `0.68rem`, `0.65rem`, `46px`, `280px`).
- No z-index scale (`800`, `900`, `950`, `9000`, `9500` scattered).
- Easings and durations are tokens, but half the rules use literal `ease`.
- Mono micro-labels drop to 10.4–11.5 px (`.c-tag` 0.65rem, `.c-meta`
  0.68rem, `.photo-credit` 0.65rem), below a comfortable reading size.
- Cache-busting is a hand-edited `?v=2` on three files.

### Slow or wasteful

- Google Fonts is loaded as a render-blocking stylesheet with a two-hop chain
  (css → woff2) and no `preload`.
- The hero loads a 120 KB decorative JPEG with `fetchpriority="high"`, ahead
  of the real content. ~340 KB of JPEGs in total, no WebP.
- The network canvas runs at an uncapped `requestAnimationFrame` rate with an
  O(n²) link loop (90 nodes → 4,005 distance checks per frame), with no
  frame-rate cap.
- `.section-glow::before` paints a 70 %-height, 40 px-blurred radial gradient
  on two sections; `.hero-glow` uses `filter: blur(90px)` on two 500 px
  elements with infinite transform animation. Blur + animation is the most
  expensive combination for mobile GPUs.
- Everything is in one eagerly-executed 24 KB script, nothing is lazy.
- `transition: background-color, color` on `body` plus `transition: none
  !important` toggling during theme switch is fragile.

### Accessibility

- Dark theme colour contrast passes AA (body `#dbe2ee` on `#090d16` ≈ 14:1,
  muted `#94a3b8` ≈ 7.1:1, accent `#2dd4bf` ≈ 10:1). Light theme passes too
  (accent `#0f766e` on white ≈ 5.6:1). Keep this bar.
- Reduced motion is honoured, but the global
  `transition-duration: 0.01ms !important` removes even simple fades, which
  makes reveals feel broken rather than calm.
- Architecture diagram has `<title>`/`<desc>` but no per-node explanations
  and nothing is focusable.
- Skip link, focus rings, labelled icon buttons, `Esc` to close the menu: all
  present. Good base.
- The marquee is duplicated with `aria-hidden` correctly.

### SEO / meta

- Canonical, OG, Twitter, JSON-LD `Person`, sitemap, robots: all present.
- JSON-LD lacks `hasCredential` for the two credentials, and the sitemap has
  no `lastmod`.
- OG image is on-brand for the old look and will be regenerated.

### Missing against the brief

Boot loader, text scramble, magnetic buttons, header hide-on-scroll, parallax,
heading decode effect, two-row marquee, alternating timeline, holographic
certificate shine, page transitions, custom cursor, back-to-top progress ring,
command palette, interactive diagram tooltips, terminal easter egg,
terminal-style 404, self-hosted fonts, GSAP-driven scroll animation.

---

## Part 2 – Design plan

### Visual direction

**"Network operations centre, after hours."** A deep navy-black canvas (never
pure black), fine 1 px borders, a single electric mint-cyan signal colour, and
a quiet indigo as the second gradient stop so glows feel like an aurora rather
than a neon sign. Monospace is used only where it means something: labels,
status, logs, commands. Plenty of air; motion that answers the user rather
than performing at them. Quality reference: Linear, Vercel, Raycast landing
pages, but personal and warm in the copy.

Decisions on imagery: the two switch illustrations come out of the hero and
About (the hero's visual is the live network canvas and the redesigned lab
console; About gets a terminal-styled "profile" card built only from existing
facts). The rack render stays as a low-key cover on the featured project and
the switch-cables render stays as the homelab banner, both converted to WebP.
Real photos of the HP 290 / Zyxel kit would be the single best future upgrade.

### Colour system (CSS custom properties, dark and light)

| Token | Dark | Light | Notes |
|---|---|---|---|
| `--bg` | `#070a12` | `#f6f8fc` | page |
| `--bg-2` | `#0a0f1c` | `#eef2f8` | alternate sections |
| `--surface` | `#0f1526` | `#ffffff` | cards |
| `--surface-2` | `#141b30` | `#f3f6fb` | nested panels, bars |
| `--border` | `rgba(154,170,200,.12)` | `#dfe5ef` | hairline |
| `--border-strong` | `rgba(154,170,200,.24)` | `#c3cddc` | |
| `--text` | `#dfe5f1` | `#1a2238` | body |
| `--text-strong` | `#ffffff` | `#0a1020` | headings |
| `--text-muted` | `#93a0b8` | `#54627a` | ≥ 6:1 on bg |
| `--accent` | `#2ee6c5` | `#0a7f70` | signal mint; light ≥ 4.6:1 on white |
| `--accent-2` | `#7b8cff` | `#4f62e0` | indigo, gradient stop only |
| `--ok` / `--warn` / `--err` | `#34d399` / `#fbbf24` / `#fb7185` | darker equivalents | status only |

One strong accent (`--accent`), one subtle gradient (`--gradient-accent`:
accent → accent-2 at 135°), everything else is neutral.

### Type scale

- Display: **Space Grotesk** (variable, 500–700) for h1–h3 and big numbers.
- Body: **Inter** (variable, 400–600).
- Technical: **JetBrains Mono** (variable, 400–600) for eyebrows, labels,
  status, logs, commands, keyboard hints.
- All three self-hosted as latin-subset variable WOFF2 (~100 KB total),
  preloaded, `font-display: swap`, with metric-compatible fallbacks.
- Scale (rem, fluid where it matters): `xs .75 · sm .875 · base 1 · md 1.125
  · lg 1.25 · xl 1.5 · 2xl clamp(1.75–2.25) · 3xl clamp(2.25–3.25) · display
  clamp(2.75–5.5)`. Mono labels never below `.75rem`.

### Spacing, radii, elevation, layers, motion

- Spacing: 4 px base: `1=4 · 2=8 · 3=12 · 4=16 · 5=24 · 6=32 · 7=48 · 8=64 ·
  9=96 · 10=128`; section padding `clamp(4rem, 10vw, 8rem)`.
- Radii: `xs 6 · sm 10 · md 14 · lg 20 · xl 28 · full`.
- Shadows: `sm / md / lg` plus `--glow` (accent ring + soft bloom).
- Z-index: `bg -1 · base 0 · raised 10 · sticky 100 · header 200 · overlay 300
  · modal 400 · cursor 500 · loader 600 · skip 700`.
- Easing: `--ease-out (.22,1,.36,1)`, `--ease-in-out (.65,0,.35,1)`,
  `--ease-spring (.34,1.56,.64,1)`. Durations: `fast 120 · base 200 · slow 360
  · reveal 700 · ambient 1000+`.
- Motion principles: (1) motion explains, it never decorates for its own sake;
  (2) enter fast, settle slow; staggers ≤ 80 ms, never more than ~6 items;
  (3) scroll effects are scrubbed, never scroll-jacked: native scrolling, GSAP
  ScrollTrigger only reads scroll position; (4) ambient loops are slow (≥ 8 s)
  and pause off-screen or when the tab is hidden; (5) reduced motion keeps
  short opacity fades and drops everything else; (6) touch devices get no
  cursor, tilt, magnetic or parallax effects.

### Depth and texture

Animated fine grid that drifts slowly behind the hero, a static dot grid on
alternate sections, a film-grain overlay at 3–4 % opacity, soft radial glows
behind the hero, projects and contact, glass header with saturation boost,
cards with hairline borders, inner top highlight and a cursor-following
spotlight.

### Libraries

GSAP 3.13 + ScrollTrigger, **vendored** into `js/vendor/` (the GSAP standard
licence allows this and it is free). Self-hosting rather than a CDN removes a
third-party dependency and a DNS hop on GitHub Pages. `js/main.js` feature
detects `window.gsap` and falls back to IntersectionObserver reveals if the
files fail to load. No other dependencies, no build step.

### Build order

**Phase 2 – design system**
1. Tokens (both themes), fonts, base, focus, texture, layout helpers.
2. Header (glass, hide on scroll down), nav, theme toggle, ⌘K hint.
3. Buttons, tags, cards (spotlight + tilt), section headers.
4. Hero split layout: copy + redesigned lab console.
5. Skills: double marquee + bento cards.
6. Projects: featured case card. 7. Experience: centred alternating timeline.
8. Certifications: seal badges + shine. 9. Contact band. 10. Footer.
11. Homelab page, 404 page, project template, print.

**Phase 3 – motion**
Loader → hero canvas → scramble + gradient name + typed role → magnetic
buttons → progress bar / header → GSAP reveals + parallax → heading decode →
spotlight / tilt → marquee → timeline draw → cert shine → build log →
page transitions → theme reveal → custom cursor → back-to-top ring.

**Phase 4 – features**
Command palette → interactive SVG architecture diagram → terminal easter egg
→ terminal 404 → OG image + favicon set → print stylesheet.

**Phase 5/6 – quality**
Reduced motion, touch, performance budget, accessibility pass, SEO, then
screenshot review at 375 / 768 / 1440 in both themes plus reduced motion,
link check, palette / terminal / 404 check, Lighthouse.
