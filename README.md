# Harry – Tier I Support Analyst & Dispatcher Portfolio

A personal portfolio built with plain **HTML, CSS and vanilla JavaScript**. There is no build step: everything is static and runs on GitHub Pages as-is at <https://harrylyle07.github.io/>. The only library is GSAP (with ScrollTrigger), vendored into `js/vendor/` so nothing is loaded from a third-party CDN.

`AUDIT.md` holds the design audit and the design plan (colour system, type scale, spacing, motion principles) behind the current look.

## File structure

```
.
├── index.html                  # The main single-page site (all sections)
├── 404.html                    # Terminal-style "page not found" (GitHub Pages serves it automatically)
├── AUDIT.md                    # Design audit + plan
├── favicon.ico                 # Legacy favicon (16/32/48 px)
├── robots.txt                  # Allows crawling; hides the project template
├── sitemap.xml                 # Add a <url> entry when you add a project page
├── css/
│   ├── styles.css              # All screen styles. Design tokens (colours per theme, type,
│   │                           # spacing, radii, shadows, z-index layers, easing) are at the top
│   └── print.css               # Print stylesheet: the home page prints as a one-page CV-style summary
├── js/
│   ├── main.js                 # Core: loader, theme, header, nav, reveals/parallax (GSAP), scramble,
│   │                           # typing, marquees, spotlight/tilt, magnetic buttons, cursor, timeline,
│   │                           # build log, diagram tooltips, page transitions, back-to-top ring
│   ├── network.js              # Hero network canvas (lazy-loaded; static frame on touch devices)
│   ├── palette.js              # Command palette (Ctrl/⌘ K) and the terminal easter egg (`), lazy-loaded
│   └── vendor/                 # gsap.min.js + ScrollTrigger.min.js (GSAP 3.13, standard licence)
├── projects/
│   ├── _template.html          # Blank write-up template: copy this for new projects
│   └── proxmox-homelab.html    # Proxmox homelab write-up (interactive diagram + build log)
├── assets/
│   ├── fonts/                  # Self-hosted variable fonts (latin subset): Space Grotesk, Inter, JetBrains Mono
│   ├── favicon.svg / *.png     # Favicon set, Apple touch icon, manifest icons (incl. maskable)
│   ├── site.webmanifest        # Web app manifest
│   ├── og-image.png            # 1200×630 link-preview image (LinkedIn, Teams, etc.)
│   └── photos/                 # WebP illustrations (rack cover on the home page, switch banner on the homelab page)
└── README.md
```

## Finding what to edit

- Search the code for `EDIT:` to find every comment that marks something to change.
- Contact is via LinkedIn only. To change the LinkedIn URL, search for `linkedin.com/in/` (it appears in the Contact section, the footer of every page, the JSON-LD block in `index.html`, `css/print.css` and `js/palette.js`).
- **The command palette and terminal use their own copy of the site's text** (`js/palette.js`, `CONTENT` and `LINKS`). If you change a fact on the page, update it there too.

## Editing each section (`index.html`)

Each section is wrapped in a big comment banner such as `<!-- 3. SKILLS -->`.

| Section | What to edit |
|---|---|
| **Meta / SEO** (`<head>`) | Title, description, canonical, Open Graph tags and the JSON-LD `Person` block (which lists both credentials). The site lives at the root of `harrylyle07.github.io`; if you move to a custom domain, replace `https://harrylyle07.github.io/` everywhere (including `sitemap.xml`, `robots.txt` and `assets/site.webmanifest`). |
| **Boot loader** | The `<div class="boot">` at the top of `<body>`. Edit the lines in `.boot-lines`. It only shows on the first visit per browser session, is skippable (Esc / Enter / click), and never shows with reduced motion. |
| **1. Hero** | Heading, one-line pitch and the status pill. The name sits inside `<span class="hero-name gradient-text">`; both `data-scramble` spans decode on load. **Typing phrases:** edit the `data-phrases` list *and* the matching `<span>`s inside `.typed-sizer` (these reserve space so the layout doesn't jump). **Stats row:** numbers inside `<span data-count="2">2</span>` count up. The right-hand **lab status console** (`.hero-visual`) is decorative: its rows are the homelab's real service names and hardware, with no made-up numbers, and the two badges under it repeat the credentials. It's hidden below 980px. |
| **2. About** | The three paragraphs, plus the terminal-styled **profile card** on the right, which repeats the same facts as `<dl class="profile-rows">`. Keep the two in sync. |
| **3. Skills** | Two marquee rows (`.marquee-group`): add or remove `<li>` items; the script duplicates them for the loop and they scroll in opposite directions, pausing on hover. Then one `<article class="card skill-card">` per group. |
| **4. Projects** | A single featured card. The cover is `assets/photos/rack-dark.webp`; the right-hand `<dl class="featured-specs">` is an at-a-glance spec list. Keep it in sync with the write-up. |
| **5. Experience** | One `<li class="timeline-item">` per entry, newest first. `data-reveal-from="left|right"` controls which side the card slides in from on desktop; entries alternate sides automatically. The line draws itself as you scroll. |
| **6. Certifications** | One `<article class="card cert-card">` per cert. The whole card links to the credential (`card-link` on the heading). `data-print-url` on `.cert-body` is the short URL that prints under the card. To use a real badge image, replace `<div class="cert-badge">…</div>` with an `<img>` (with alt text). |
| **7. Contact** | LinkedIn button (contact is LinkedIn only). |
| **8. Footer** | Links and the keyboard hints. The year updates automatically. |

### Design tokens

Everything visual is a CSS variable at the top of `css/styles.css`:

- **Colours:** one block for dark and one for light. The single accent is `--accent` (signal mint) with `--accent-2` (indigo) as the second stop of `--gradient-accent`. The light-mode accent is dark enough for AA text contrast; keep it that way.
- **Type:** `--font-display` (Space Grotesk, headings), `--font-sans` (Inter, body), `--font-mono` (JetBrains Mono, labels/terminal). Sizes `--fs-xs` … `--fs-display`.
- **Spacing:** `--sp-1` … `--sp-10` (4px base) and `--section-pad`. **Radii:** `--r-xs` … `--r-full`. **Elevation:** `--shadow-sm/md/lg`, `--glow`. **Layers:** `--z-*`. **Motion:** `--ease-*`, `--dur-*`.
- The film-grain texture is `--noise-opacity`; set it to `0` to turn it off.

## Adding a new project

1. **Copy the template:** duplicate `projects/_template.html` and give it a short name, e.g. `projects/exchange-migration.html`.
2. **Update the `<head>`:** title, description, canonical and the `og:` tags (replace `FILE-NAME.html`), and **delete the `<meta name="robots" content="noindex">` line**.
3. **Fill in the article.** Delete any sections you don't need. Add `data-reveal` to anything that should fade in on scroll. The template has a commented-out **terminal build log** block you can use for step-by-step work.
4. **Add a card on the home page.** The Projects section is laid out for one featured project. To show several, wrap the cards in `<div class="card-grid projects-grid">…</div>`, keep the homelab as `project-featured` above it (or drop that class and the `featured-specs` list to make it a normal card). Each normal card is an `<article class="card project-card" data-tilt data-reveal>` with an icon, `project-kind` label, heading link (`href="projects/your-file.html"`), description, tags and a `read-more` line.
5. **Add it to `sitemap.xml`** and to the `Pages` group in `js/palette.js` so the command palette can find it.
6. **Screenshots (optional):** put images in `assets/projects/`, always with descriptive `alt` text, `width`/`height` and `loading="lazy"`. Remove or blur anything that identifies a client.

### Images

The two images in `assets/photos/` are rendered illustrations (labelled "Illustration" on the page), served as WebP with an 800px variant for phones. Real photos of your own HP 290, Zyxel switch and firewall will always beat them with a recruiter: export at the same pixel sizes, keep the `width`/`height` attributes and write a real `alt`.

### The homelab architecture diagram

`projects/proxmox-homelab.html` contains an inline SVG (`<figure class="diagram">`). Each node is a `<g class="d-node" data-tip-title="…" data-tip="…">` and gets a tooltip on hover, tap or keyboard focus (nodes are focusable; Esc closes). Connections are a `d-link` path (the base line) with a `d-flow` path on top (the animated dashes). It follows the theme, pauses when off screen, and scrolls sideways on narrow screens. Don't add IP addresses to it.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Ctrl K` / `⌘ K` | Command palette: jump to any section, open the write-up, toggle the theme, open LinkedIn / GitHub / credentials, print |
| `` ` `` | Terminal easter egg: `help`, `whoami`, `about`, `skills`, `certs`, `homelab`, `contact`, `cd <section>`, `theme`, `clear`, `exit` |
| `Esc` | Close the palette, terminal, mobile menu or diagram tooltip; skip the boot loader |

## Running it locally

Serve the folder so absolute paths (used by `404.html`) behave exactly like GitHub Pages:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Publishing on GitHub Pages

1. Merge into `main`.
2. In the repo go to **Settings → Pages**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, then save.
3. The site will be at `https://harrylyle07.github.io/` after a minute or two. GitHub Pages picks up `404.html` automatically.

## Features

- Dark "network operations centre" theme with a light mode toggle. The switch animates as a circular sweep from the button (View Transitions API, with a plain switch as fallback) and the choice is saved in the browser.
- Terminal-style boot loader on the first visit of a session (under 2 s, skippable).
- Hero: animated network-node canvas that reacts to the mouse, text-scramble reveal of the headline, animated gradient on the name, typed role line, magnetic buttons, count-up stats, lab status console.
- Glass sticky header that hides on scroll down and returns on scroll up, scroll progress bar, active-section highlight, back-to-top button with a progress ring.
- GSAP ScrollTrigger reveals (staggered, sliding in from alternating sides on the timeline), subtle parallax on the hero and the project cover, section headings that decode as they enter view.
- Cards with a cursor-following spotlight border and gentle 3D tilt; certificate cards with a holographic shine sweep.
- Two skill marquees scrolling in opposite directions, paused on hover and when off screen.
- Experience timeline whose line draws itself as you scroll.
- Homelab page: interactive architecture diagram with tooltips and pulsing data flow, and a build log that types its command and then prints each step.
- Page transitions between pages (cross-document View Transitions where supported, a short fade elsewhere).
- Subtle custom cursor on desktop.
- Command palette and terminal easter egg (see shortcuts above).
- Terminal-style 404 page, designed 1200×630 Open Graph image, full favicon set (SVG, ICO, PNG, Apple touch, maskable), print stylesheet.

### Motion, performance and accessibility

- **Reduced motion:** the loader, canvas, scramble, typing, tilt, parallax, marquees, magnetic buttons and custom cursor are all off; reveals become short opacity fades and the diagram's flow lines stop.
- **Touch devices:** no cursor, tilt, magnetic or parallax effects; the hero canvas draws a single static frame.
- **Performance:** self-hosted, preloaded variable fonts; WebP images with a phone-sized variant; the canvas (frame-rate capped, paused off screen and when the tab is hidden) and the palette are lazy-loaded; marquees and the diagram pause off screen; GSAP is deferred and feature-detected (IntersectionObserver fallback if it fails to load).
- **Accessibility:** WCAG AA contrast in both themes, visible focus states, skip link, full keyboard support for the menu, palette (listbox with arrow keys), terminal and diagram tooltips, `aria-live` output in the terminal, semantic HTML and labelled icon buttons.
- **SEO:** canonical URLs, Open Graph and Twitter cards, JSON-LD `Person` (with credentials) and `Article` data, `robots.txt` and `sitemap.xml`.
