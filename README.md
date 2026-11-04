# Harry – Tier I Support Analyst & Dispatcher Portfolio

A single-page personal portfolio built with plain **HTML, CSS and vanilla JavaScript**. There are no frameworks, no build step and no dependencies, so it runs on GitHub Pages as-is.

## File structure

```
.
├── index.html                  # The main single-page site (all sections)
├── css/
│   └── styles.css              # All styles. Colours/theme tokens are at the top
├── js/
│   └── main.js                 # Theme, header, mobile menu, scroll animations, typing,
│                               # count-up stats, tech strip, card tilt, hero network canvas
├── projects/
│   ├── _template.html          # Blank write-up template: copy this for new projects
│   └── proxmox-homelab.html    # Proxmox homelab write-up
├── assets/
│   ├── favicon.svg             # "H" monogram favicon
│   ├── favicon-32.png          # PNG fallback favicon
│   ├── apple-touch-icon.png    # iOS home-screen icon
│   └── og-image.png            # 1200×630 link-preview image (LinkedIn, Teams, etc.)
└── README.md
```

## Finding what to edit

- **Placeholders:** if you ever need one, wrap it in `<span class="ph">[like this]</span>` and it will show **highlighted in amber** on the page so it can't be missed. There are none on the site at the moment.
- Search the code for `EDIT:` to find every comment that marks something to change.
- Contact is via LinkedIn only. To change the LinkedIn URL, search for `linkedin.com/in/` (it appears in the Contact section and the footer of every page).

## Editing each section (`index.html`)

Each section is wrapped in a big comment banner such as `<!-- 3. SKILLS -->`.

| Section | What to edit |
|---|---|
| **Meta / SEO** (`<head>`) | Title, description, Open Graph tags. If you use a custom domain, replace `https://harrylyle07.github.io/Portfolio/` everywhere. |
| **1. Hero** | Heading, one-line pitch and the "Open to 2nd line support roles" status pill. **Typing phrases:** edit the `data-phrases` list *and* the matching `<span>`s inside `.typed-sizer` (these reserve space so the layout doesn't jump). **Stats row:** numbers inside `<span data-count="2">2</span>` count up when scrolled into view. Add a stat by copying an `<li class="stat">`. The row is laid out for three; if you change the number, update `grid-template-columns` on `.hero-stats` in `css/styles.css`. |
| **Technology strip** | The `<ul class="marquee-list">` just after the hero. Add or remove `<li>` items; the script duplicates them for the seamless loop. |
| **2. About** | The three paragraphs. |
| **3. Skills** | One `<article class="card skill-card">` per group. Add or remove `<li>` items. The **Networking & Security** and **Scripting** items are suggestions, so keep only what you're happy to talk about in an interview. |
| **4. Projects** | Currently a single wide **featured card** for the Proxmox homelab (`<article class="card project-card project-featured">`). The left side is the summary and tags; the right-hand `<dl class="featured-specs">` is an at-a-glance spec list. Keep it in sync with the write-up. |
| **5. Experience** | One `<li class="timeline-item">` per entry, newest first. Fill in company name, dates and training provider. |
| **6. Certifications** | One `<article class="card cert-card">` per cert. To make a whole card link to a credential (as the MS-900 card does), add the `cert-card-linked` class and put the link on the heading with `class="card-link"`. To use a real badge image, replace the `<div class="cert-badge">…</div>` with `<img src="assets/your-badge.png" alt="Microsoft 365 Certified: Fundamentals badge" width="72" height="72">`. |
| **7. Contact** | LinkedIn button (contact is LinkedIn only: no email, phone or form). |
| **8. Footer** | Links. The year updates automatically. |

### Changing colours

All colours are CSS variables at the top of `css/styles.css`, one block for dark and one for light. To change the accent, edit `--accent` and `--accent-hover` in both blocks (keep the light-mode accent dark enough for text contrast).

## Adding a new project

1. **Copy the template:** duplicate `projects/_template.html` and give it a short name, e.g. `projects/exchange-migration.html`.
2. **Update the `<head>`:** title, description and the `og:` tags (replace `FILE-NAME.html`), and **delete the `<meta name="robots" content="noindex">` line** (it's only there so the template itself isn't indexed by search engines).
3. **Fill in the article:** the header (title, summary, type/role/date, tags) and the body sections. Delete any sections you don't need.
4. **Add a card on the home page:** the Projects section is laid out for one featured project. To show several, wrap the cards in `<div class="card-grid projects-grid">…</div>` (a responsive grid). Then either keep the homelab as `project-featured` above the grid, or remove that class and the `<dl class="featured-specs">` to make it a normal card. Each normal card is an `<article class="card project-card reveal" data-tilt>` with an icon, `project-kind` label, heading link (`href="projects/your-file.html"`), description, tags and a `read-more` line.
5. **Screenshots (optional):** put images in `assets/projects/` and always include descriptive `alt` text. Remove or blur client names, tenant names, email addresses and anything else that identifies a client.

## Running it locally

Just open `index.html` in a browser, or serve the folder so paths behave exactly like GitHub Pages:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Publishing on GitHub Pages

1. Merge into `main`.
2. In the repo go to **Settings → Pages**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, then save.
3. The site will be at `https://harrylyle07.github.io/Portfolio/` after a minute or two.

## Features

- Dark theme by default with a light mode toggle (choice is saved in the browser)
- Sticky header that shrinks on scroll; hamburger menu on mobile (closes on link click, outside click or <kbd>Esc</kbd>)
- Active section highlighted in the nav
- Staggered fade/slide-in for sections and cards as they scroll into view
- Hero: animated network-node canvas that reacts gently to the mouse, a typing effect cycling through job titles, and count-up stats
- Slow, infinite technology strip that pauses on hover
- Subtle 3D tilt with a soft highlight on skill and project cards

### Motion and performance

- **Reduced motion:** if the visitor has *reduce motion* turned on, everything is static. There's no canvas, typing, counting, tilt, scrolling strip (it shows as a wrapped list) or fade-ins.
- **Phones and tablets:** the canvas and card tilt only run on screens wider than 820px with a mouse. Touch devices get the static grid background instead.
- The canvas pauses when the hero is scrolled off screen or the tab is hidden, and is capped at 80 nodes.
- To tone things down, edit the constants in `js/main.js`: `MAX_TILT` (degrees), `LINK_DIST` / `MOUSE_DIST` (network), the typing delays, and the strip speed (`/ 35` = pixels per second).
- Accessible: semantic HTML, skip link, visible focus styles, ARIA labels on icon buttons, good colour contrast in both themes
- Responsive layouts for phone, tablet and desktop
- SEO and Open Graph meta tags for link previews
