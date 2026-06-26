# AGENTS.md

## Project

Static landing page for "Diplomado en Ciberseguridad Industrial" (CEE UNI). No build step, no npm, no frameworks. Pure HTML + Tailwind CDN + vanilla JS.

## Structure

- `index.html` — single-page landing (all content lives here)
- `js/config.js` — webhook URL, course metadata, UI messages
- `js/main.js` — modal, multi-step form, sidebar form, carousel, scroll animations
- `css/custom.css` — all custom styles, animations, Tailwind config overrides
- `img/` — empty, for future assets

## Key conventions

- **No build tools.** Open `index.html` directly in a browser to preview. No `npm install`, no dev server.
- **Tailwind via CDN** (`cdn.tailwindcss.com`). Custom theme colors (`uni-blue`, `cta-orange`, etc.) configured inline in `index.html` `<script>` block.
- **Dev mode:** When `webhookURL` in `config.js` is empty or the default placeholder, form submissions log to browser console instead of sending. No backend needed for local testing.
- **All UI text is in Spanish (Peru).**
- **Two lead capture forms:** modal (5-field multi-step, `source: "modal"`) and sidebar sticky (3-field, `source: "sidebar"`). Both call `sendLead()` in `main.js`.
- **Honeypot field** (`website_url`) in forms — bots that fill it get silently discarded.
- **Carousel** uses duplicated cards for infinite CSS+JS auto-scroll. When adding testimonials, duplicate the full set for the loop to work.
- **Fonts:** Outfit (body) and Space Grotesk (headings) loaded from Google Fonts CDN in `custom.css`.
- **Accessibility:** `prefers-reduced-motion` media query disables all animations. Skip-link present. Focus-visible outlines styled.

## Skills

This repo uses auto-skills: `accessibility`, `seo`, `frontend-design`. Load them when relevant.
