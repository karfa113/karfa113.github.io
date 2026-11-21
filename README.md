# Monojit Karfa — Designer Portfolio

A single-page personal portfolio for a UI/UX designer, built as a static site with plain HTML, CSS and JavaScript. It includes a filterable work grid, featured coding projects, an achievements timeline, a contact form powered by Formspree, an interactive canvas footer, and a set of scroll- and pointer-driven motion details.

**Stack:** HTML · CSS · Vanilla JavaScript · Canvas API · Google Fonts · Formspree · GitHub Pages

---

## Features

### Navigation
- Scroll-progress bar across the top of the viewport
- Scroll-spy: the active section's nav link turns yellow with a small dot (a left-side dot inside the mobile dropdown)
- Desktop nav has the logo left, links centered and **Say hello** pinned right
- Mobile (≤640px) uses a three-line hamburger that opens a themed dropdown; closes on link click, outside click or Escape
- Smooth section links

### Hero
- Two lines on desktop, three on mobile ("I design" / rotating word / "people remember.")
- The rotating word lives in a fixed-size yellow pill: every word is stacked in the same CSS grid cell, so the box stays as wide as the longest word and never shifts the layout
- Staggered entrance animation and clickable word chips that pause the auto-rotation

### Motion
- Masked line-by-line reveal for the large display headings; lines are measured after fonts load and re-split on resize
- Infinite discipline marquee that pauses on hover
- Custom cursor with a trailing ring and context states (link, view, text, pressed)
- All motion is disabled automatically when `prefers-reduced-motion: reduce` is set

### Work
- Filterable grid of real project cards using local images in `assets/` (All / Brand / Web / Product)
- Each card links to its original Dribbble or Pinterest reference; the event card exposes three separate Pinterest links
- Staggered out/in animation when switching filters
- Pointer-driven 3D card tilt with image parallax (fine-pointer devices only)

### Code
- BunkSafe, Regex Automata and Sem Dump as feature cards with distinct warm accents, numbered ghost watermarks and subtle corner glows
- Yellow hover ring shared across all three (no card movement)
- Each card links to GitHub and either a live demo or screenshots

### Other sections
- Services, process and achievements timeline
- Achievements use bracketed year ranges and real role descriptions
- About panel with tool pills, current roles and a collaboration note

### Contact form
- Centered **Send message** button with the status text below it
- Formspree submission with a `mailto:` fallback when no endpoint is configured
- On success the button turns yellow and reads **"Message sent"**; on failure it reverts and shows an error
- Honeypot field for basic spam protection
- Accessible `aria-live` status messages

### Footer
- Interactive grid with a `<canvas>` layer: moving the pointer stamps small shapes (x, o, plus, star, box) that pop in and fade out
- Works with mouse and touch; a short demo trail plays the first time the footer scrolls into view
- Hint text adapts to pointer type and is hidden under reduced motion
- Copyright line centered below the canvas area

---

## Quick start

### Option 1 — Open directly

Double-click `index.html` in your browser.

### Option 2 — Run a local server

```bash
git clone https://github.com/karfa113/<repo-name>.git
cd <repo-name>
python -m http.server 8000
```

Then open <http://localhost:8000>.

You can also use any static server, for example:

```bash
npx serve .
```

---

## Configuration

Almost everything lives in `index.html`.

| What | Where | Notes |
| --- | --- | --- |
| Page title and meta description | Top of `<head>` | No location mention. |
| Availability tag | Hero section | Currently reads `Available now`. |
| Hero and about copy | Hero and About sections | Filled with real copy; update if your positioning changes. |
| Rotating words | `words` array in the script | Defaults to `interfaces`, `apps`, `platforms`, `experiences`. |
| Hero word pill | `#rotWord` CSS rules | Yellow box, italic text; all words share one grid cell so the width is stable. |
| Marquee items | `marquee` array in the script | Discipline labels shown in the scrolling strip. |
| Selected work cards | `projects` array in the script | Edit category, title, local image in `assets/`, link and optional Pinterest links; year and description are stored per card. |
| Code project accents | Inline `--accent`, `--accent-soft`, `--accent-ink` on each `.codecard` | Currently yellow, warm gray and cream. The hover ring always uses `--primary`. |
| Services | Services section | Four real rows: UI design, UX design, prototyping and visual/event design. |
| Process copy | Process section | Three real step descriptions. |
| Collaboration note | About section | Swap in a real testimonial when you have one. |
| Résumé button | Contact section | Currently commented out; uncomment and point it at a real PDF. |
| Contact form endpoint | `FORM_ENDPOINT` in the script | Set to your Formspree URL, or leave empty to use `mailto:`. |
| Success button state | `.cform button.btn.sent` CSS and the submit handler | Yellow background with the label `Message sent`. |
| Fallback email | `MAIL_TO` in the script | Currently `karfamonojit123@gmail.com`. |
| Footer trail colors and shapes | `COLORS` and `SHAPES` arrays in the script | Currently yellow, cream and blue shapes; five glyph types. |
| Social links | Contact section | LinkedIn, GitHub and Instagram. |

To use your own form, create one at [formspree.io](https://formspree.io/) and paste its URL into `FORM_ENDPOINT` in `index.html`. Leave it empty to use the `mailto:` fallback instead.

---

## Before publishing

No template placeholders remain. Optional things to check:

- Add a `LICENSE` file if you want to open-source the code
- Add a résumé PDF and uncomment the **Download résumé** button if you want it live
- Confirm `FORM_ENDPOINT` is still correct, or leave it empty to use the `mailto:` fallback
- Replace the collaboration note with a real testimonial when you get one

---

## Deploying to GitHub Pages

1. Push the folder to a GitHub repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose:
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/ (root)`
4. Click **Save**.
5. Your site will be available at:

```text
https://karfa113.github.io/<repo-name>/
```

If the repository is named `karfa113.github.io`, the URL will be:

```text
https://karfa113.github.io/
```

---

## Project structure

```text
.
├── assets/      # Local images used by the work cards, logo and favicon
├── index.html   # Entire site: markup, styles and script
└── README.md    # This file
```

No build step, no dependencies to install. Images are local in `assets/`; only Google Fonts and Formspree are external.

---

## Contact

- **Email:** karfamonojit123@gmail.com
- **GitHub:** [@karfa113](https://github.com/karfa113)
- **LinkedIn:** [in/karfa113](https://www.linkedin.com/in/karfa113/)
- **Instagram:** [@wl_monojit](https://www.instagram.com/wl_monojit/)

---

## License

This is a personal portfolio. No license has been applied yet — add a `LICENSE` file if you want to open-source the code.

© 2026 Monojit Karfa
