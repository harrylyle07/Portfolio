# Harry – Tier I Support Analyst & Dispatcher Portfolio

A personal portfolio built with plain **HTML, CSS and vanilla JavaScript**. There are no frameworks, no build step and no dependencies, so it runs on GitHub Pages as-is at <https://harrylyle07.github.io/>.

## File structure

```
.
├── index.html                  # The main single-page site (all sections)
├── 404.html                    # Custom "page not found" page (GitHub Pages serves it automatically)
├── favicon.ico                 # Legacy favicon (16/32/48 px)
├── robots.txt                  # Allows crawling; hides the project template
├── sitemap.xml                 # Add a <url> entry when you add a project page
├── css/
│   ├── styles.css              # All screen styles. Design tokens (colours, spacing, type,
│   │                           # radii, shadows) are CSS variables at the top
│   └── print.css               # Print stylesheet: the page prints as a clean CV-style summary
├── js/
│   └── main.js                 # Theme toggle, scroll progress, nav, reveals, typing, count-up,
│                               # tech strip, card glow/tilt, hero network canvas, timeline draw,
│                               # terminal build log, back-to-top
├── projects/
│   ├── _template.html          # Blank write-up template: copy this for new projects
│   └── proxmox-homelab.html    # Proxmox homelab write-up (architecture diagram + build log)
├── assets/
│   ├── favicon.svg             # "H" monogram favicon (vector)
│   ├── favicon-16.png          # PNG favicons
│   ├── favicon-32.png
│   ├── apple-touch-icon.png    # iOS home-screen icon (180×180)
│   ├── icon-192.png            # Web app manifest icons
│   ├── icon-512.png
│   ├── site.webmanifest        # Web app manifest
│   └── og-image.png            # 1200×630 link-preview image (LinkedIn, Teams, etc.)
└── README.md
```

## Finding what to edit

- **Placeholders:** if you ever need one, wrap it in `<span class="ph">[like this]</span>` and it will show **highlighted in amber** on the page so it can't be missed. There are none on the site at the moment.
- Search the code for `EDIT:` to find every comment that marks something to change.
- Contact is via LinkedIn only. To change the LinkedIn URL, search for `linkedin.com/in/` (it appears in the Contact section, the footer of every page, the JSON-LD block in `index.html` and `css/print.css`).

## Editing each section (`index.html`)

Each section is wrapped in a big comment banner such as `<!-- 3. SKILLS -->`.

| Section | What to edit |
|---|---|
| **Meta / SEO** (`<head>`) | Title, description, canonical and Open Graph tags. The site lives at the root of `harrylyle07.github.io`; if you move to a custom domain, replace `https://harrylyle07.github.io/` everywhere (including `sitemap.xml`, `robots.txt` and `assets/site.webmanifest`). |
| **1. Hero** | Heading, one-line pitch and the "Open to 2nd line support roles" status pill. The name sits inside `<span class="shimmer">` for the gradient shimmer. **Typing phrases:** edit the `data-phrases` list *and* the matching `<span>`s inside `.typed-sizer` (these reserve space so the layout doesn't jump). **Stats row:** numbers inside `<span data-count="2">2</span>` count up when scrolled into view. Add a stat by copying an `<li class="stat">`. The row is laid out for three; if you change the number, update `grid-template-columns` on `.hero-stats` in `css/styles.css`. |
| **Technology strip** | The `<ul class="marquee-list">` just after the hero. Add or remove `<li>` items; the script duplicates them for the seamless loop. |
| **2. About** | The three paragraphs. |
| **3. Skills** | One `<article class="card skill-card">` per group. Add or remove `<li>` items. The **Networking & Security** and **Scripting** items are suggestions, so keep only what you're happy to talk about in an interview. |
| **4. Projects** | Currently a single wide **featured card** for the Proxmox homelab (`<article class="card project-card project-featured">`). The left side is the summary and tags; the right-hand `<dl class="featured-specs">` is an at-a-glance spec list. Keep it in sync with the write-up. |
| **5. Experience** | One `<li class="timeline-item">` per entry, newest first. The vertical line draws itself as you scroll. |
| **6. Certifications** | One `<article class="card cert-card">` per cert. To make a whole card link to a credential, add the `cert-card-linked` class and put the link on the heading with `class="card-link"`. `data-print-url` on `.cert-body` is the short URL that prints under the card. To use a real badge image, replace the `<div class="cert-badge">…</div>` with `<img src="assets/your-badge.png" alt="Microsoft 365 Certified: Fundamentals badge" width="72" height="72">`. |
| **7. Contact** | LinkedIn button (contact is LinkedIn only: no email, phone or form). |
| **8. Footer** | Links. The year updates automatically. |

### Design tokens and colours

Everything visual is a CSS variable at the top of `css/styles.css`:

- **Colours:** one block for dark and one for light. The single accent is `--accent` (teal) with `--accent-2` (blue) as the second stop of `--gradient-accent`. Keep the light-mode accent dark enough for text contrast.
- **Spacing:** `--sp-1` … `--sp-12`. **Type:** `--fs-xs` … `--fs-hero`. **Radii:** `--r-xs` … `--r-full`. **Shadows:** `--shadow-sm/md/lg` and `--glow-accent`.
- The film-grain texture is `--noise-opacity`; set it to `0` to turn it off.

## Adding a new project

1. **Copy the template:** duplicate `projects/_template.html` and give it a short name, e.g. `projects/exchange-migration.html`.
2. **Update the `<head>`:** title, description, canonical and the `og:` tags (replace `FILE-NAME.html`), and **delete the `<meta name="robots" content="noindex">` line** (it's only there so the template itself isn't indexed by search engines).
3. **Fill in the article:** the header (title, summary, type/role/date, tags) and the body sections. Delete any sections you don't need. Add `class="reveal"` to anything that should fade in on scroll. The template has a commented-out **terminal build log** block you can use for step-by-step work.
4. **Add a card on the home page:** the Projects section is laid out for one featured project. To show several, wrap the cards in `<div class="card-grid projects-grid">…</div>` (a responsive grid). Then either keep the homelab as `project-featured` above the grid, or remove that class and the `<dl class="featured-specs">` to make it a normal card. Each normal card is an `<article class="card project-card reveal" data-tilt>` with an icon, `project-kind` label, heading link (`href="projects/your-file.html"`), description, tags and a `read-more` line.
5. **Add it to `sitemap.xml`.**
6. **Screenshots (optional):** put images in `assets/projects/` and always include descriptive `alt` text plus `width` and `height` (so the layout doesn't shift) and `loading="lazy"`. Remove or blur client names, tenant names, email addresses and anything else that identifies a client.

### The homelab architecture diagram

`projects/proxmox-homelab.html` contains an inline SVG (`<figure class="diagram">`). Nodes are `<rect>` + `<text>` pairs; connections are a `d-link` path (the base line) with a `d-flow` path on top (the animated dashes). It uses the site's CSS variables, so it follows the theme. On narrow screens it scrolls sideways. Don't add IP addresses to it.

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

- Dark "infrastructure dashboard" theme by default with a light mode toggle. The switch animates as a circular sweep from the button (View Transitions API, with a plain fade fallback) and the choice is saved in the browser
- Glass sticky header with a scroll progress bar; the active section is underlined in the nav; back-to-top button appears after scrolling
- Hero: animated network-node canvas with a soft glow that follows the mouse, gradient shimmer on the name, a typing effect cycling through job titles, and count-up stats
- Staggered fade/slide-in for headings, cards and timeline items as they scroll into view
- Cards: cursor-following gradient glow border and a subtle 3D tilt
- Slow, infinite technology strip that pauses on hover
- Experience timeline whose line draws itself as you scroll
- Homelab page: animated architecture diagram (connections pulse) and a terminal-style build log that types in entry by entry with a blinking cursor
- Film-grain texture and soft glows behind key sections for depth
- Custom 404 page in the same style
- Full favicon set (SVG, ICO, PNG, Apple touch icon, web manifest) and a designed 1200×630 Open Graph image
- Print stylesheet: the home page prints as a clean, CV-style summary with credential and contact URLs written out

### Motion, performance and accessibility

- **Reduced motion:** if the visitor has *reduce motion* turned on, everything is static. There's no canvas, typing, counting, tilt, shimmer, scrolling strip (it shows as a wrapped list), timeline draw, build-log animation or fade-ins, and the diagram's pulses stop.
- **Phones and tablets:** the canvas, card glow and tilt only run on screens wider than 820px with a mouse. Touch devices get the static grid background instead.
- The canvas pauses when the hero is scrolled off screen or the tab is hidden, and is capped at 90 nodes. Scroll handlers are throttled to animation frames.
- To tone things down, edit the constants in `js/main.js`: `MAX_TILT` (degrees), `LINK_DIST` / `MOUSE_DIST` (network), the typing delays, and the strip speed (`/ 35` = pixels per second).
- Accessible: semantic HTML, skip link, visible focus styles, ARIA labels on icon buttons, keyboard-operable menu (closes on <kbd>Esc</kbd>), the diagram has a `<title>`/`<desc>` and caption, good colour contrast in both themes
- Responsive layouts for phone, tablet and desktop, with no horizontal overflow
- SEO: canonical URLs, Open Graph and Twitter cards, JSON-LD `Person` structured data, `robots.txt` and `sitemap.xml`
