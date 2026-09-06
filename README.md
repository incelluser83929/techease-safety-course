# Stay Safe Online — a free course by TechEase

A free, simple online safety course (ransomware, phishing, password security,
backups, safe browsing, and what to do if something goes wrong), built as a
companion site to [TechEase](https://www.techeasefl.org/), a South Florida
nonprofit providing free tech mentorship to seniors.

Plain static HTML/CSS/JS — no build step, no framework, no backend. 3D
animations are done with [Three.js](https://threejs.org/), loaded from a CDN
via an import map.

## Structure

- `index.html` — home page (mission overview, threat landscape, course preview)
- `course.html` — course hub with per-visitor progress (stored in `localStorage`)
- `lessons/*.html` — the six lesson pages
- `resources.html` — where to get more help / report a scam, plus a glossary
- `assets/css/styles.css` — design tokens (colors pulled from techeasefl.org) + all styles
- `assets/js/` — shared behavior: `three-hero.js` (home hero animation),
  `three-icon.js` (small procedural 3D icons on lesson pages), `quiz.js`
  (renders the knowledge checks), `progress.js` (localStorage progress),
  `main.js` (mobile nav)

## Local preview

Because pages use ES module imports and root-relative asset paths, open this
with a local static server rather than double-clicking the HTML files
(`file://` URLs block ES modules). For example, from this folder:

```
npx serve .
```

or, with the Netlify CLI already installed:

```
netlify dev
```

## Deploying to Netlify

1. Push this folder to a GitHub repo.
2. In Netlify, "Add new site" → "Import an existing project" → pick the repo.
3. Build command: none. Publish directory: `.` (already set in `netlify.toml`).
4. Deploy.

## Content notes

- Colors, fonts, and the logo are pulled directly from techeasefl.org so this
  site reads as a natural extension of the main nonprofit site.
- Course content is original writing based on widely known, non-partisan
  cybersecurity guidance (avoid paying ransoms, use backups/2FA, verify
  unexpected requests independently, etc.) — not copied from any single source.
- Only two outbound reference links are used beyond techeasefl.org: the FBI's
  IC3 (ic3.gov) and the FTC's fraud-reporting site (reportfraud.ftc.gov), both
  well-established federal reporting resources.
