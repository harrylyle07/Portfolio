# Harry – IT Support Engineer Portfolio

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
│   ├── proxmox-homelab.html    # Homelab write-up (structure done, details to fill in)
│   ├── m365-intune-project.html          # PLACEHOLDER example
│   └── troubleshooting-case-study.html   # PLACEHOLDER example
├── assets/
│   ├── favicon.svg             # "H" monogram favicon
│   ├── favicon-32.png          # PNG fallback favicon
│   ├── apple-touch-icon.png    # iOS home-screen icon
│   └── og-image.png            # 1200×630 link-preview image (LinkedIn, Teams, etc.)
└── README.md
```

## Finding what to edit

- **Placeholders** are written in square brackets, e.g. `[Company name]`. Most are wrapped in `<span class="ph">…</span>`, which shows them **highlighted in amber** on the page so you can't miss any. Once you've replaced the text, remove the `<span class="ph">` wrapper too.
- Search the code for `EDIT:` to find every comment that marks something to change.
- Search for `your.email@example.com` and `your-profile` to find the contact links (they appear in the Contact section and the footer of every page).

## Editing each section (`index.html`)

Each section is wrapped in a big comment banner such as `<!-- 3. SKILLS -->`.

| Section | What to edit |
|---|---|
| **Meta / SEO** (`<head>`) | Title, description, Open Graph tags. If you use a custom domain, replace `https://harrylyle07.github.io/Portfolio/` everywhere. |
| **1. Hero** | Heading, one-line pitch and the "Open to 2nd line support roles" status pill. **Typing phrases:** edit the `data-phrases` list *and* the matching `<span>`s inside `.typed-sizer` (these reserve space so the layout doesn't jump). **Stats row:** numbers inside `<span data-count="2">2</span>` count up when scrolled into view. Replace the `[X]` client-tenants placeholder with e.g. `<span data-count="15">15</span>`, or delete that `<li>`. |
| **Technology strip** | The `<ul class="marquee-list">` just after the hero. Add or remove `<li>` items; the script duplicates them for the seamless loop. |
| **2. About** | The three paragraphs. |
| **3. Skills** | One `<article class="card skill-card">` per group. Add or remove `<li>` items. The **Networking & Security** and **Scripting** items are suggestions, so keep only what you're happy to talk about in an interview. |
| **4. Projects** | One `<article class="card project-card">` per project (see *Adding a new project* below). Remove the `<span class="badge-placeholder">Placeholder</span>` once a card is real. |
| **5. Experience** | One `<li class="timeline-item">` per entry, newest first. Fill in company name, dates and training provider. |
| **6. Certifications** | One `<article class="card cert-card">` per cert. Add your Credly link where marked. To use your real Credly badge image, replace the `<div class="cert-badge">…</div>` with `<img src="assets/your-badge.png" alt="Microsoft 365 Certified: Fundamentals badge" width="72" height="72">`. The dashed **In progress** card is for your next cert. |
| **7. Contact** | Email address (`mailto:`) and LinkedIn URL. |
| **8. Footer** | Links. The year updates automatically. |

### Changing colours

All colours are CSS variables at the top of `css/styles.css`, one block for dark and one for light. To change the accent, edit `--accent` and `--accent-hover` in both blocks (keep the light-mode accent dark enough for text contrast).

## Adding a new project

1. **Copy the template:** duplicate `projects/_template.html` and give it a short name, e.g. `projects/exchange-migration.html`.
2. **Update the `<head>`:** title, description and the `og:` tags (replace `FILE-NAME.html`), and **delete the `<meta name="robots" content="noindex">` line** (it's only there so the template itself isn't indexed by search engines).
3. **Fill in the article:** the header (title, summary, type/role/date, tags) and the body sections. Delete any sections you don't need.
4. **Add a card on the home page:** in `index.html`, copy an existing `<article class="card project-card">` in the Projects section and update the icon label, title, link (`href="projects/your-file.html"`), description and tags.
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
