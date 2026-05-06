# c0din.github.io — Stoic Developer

A full-screen, scroll-snapped quote reader featuring four ancient philosophers. Each philosopher occupies its own viewport section; clicking the bust shuffles to a random passage while the navigation selectors allow precise book/verse/translation browsing.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Astro 5 (SSR via `output: 'server'`) |
| Adapter | Vercel (Edge Image Optimization) |
| Styling | Tailwind CSS v4 (Vite plugin) |
| Fonts | Montserrat (sans) |
| Data | Static JSON under `public/assets/stoa/` |
| Deployment | GitHub Actions → Vercel |

---

## Project Structure

```
src/
  assets/images/        Philosopher bust PNGs (marcus, epictetus, seneca, diogenes)
  components/
    QuoteGenerator.astro  Main UI — scroll container, bust images, nav selectors, quote display
    ProjectCard.astro     Unused card component (future portfolio use)
  layouts/
    Layout.astro          HTML shell, aether gradient background, parallax cloud layer
  pages/
    index.astro           Entry point — mounts QuoteGenerator
    404.astro             Glitch-effect 404 page
  styles/
    global.css            Tailwind theme tokens, cloud animations, glitch keyframes

public/assets/stoa/
  meditations.json        Marcus Aurelius — Meditations (multi-translation schema)
  epictetus.json          Epictetus — Enchiridion + Discourses
  seneca.json             Seneca — Letters
  diogenes.json           Diogenes — Lives of the Eminent Philosophers, Book VI
```

---

## Philosopher Order (scroll top → bottom)

1. **Marcus Aurelius** — the Emperor *(always first)*
2. **Epictetus** — the Teacher
3. **Seneca** — the Advisor
4. **Diogenes** — the Cynic

---

## Data Schema

All JSON files follow a versioned schema with a metadata envelope:

```json
{
  "metadata": {
    "works": ["Meditations"],
    "author": "Marcus Aurelius",
    "translations": {
      "long": "George Long (1862)",
      "hays": "Gregory Hays (2002)"
    },
    "defaultTranslation": "long"
  },
  "entries": [
    { "book": 1, "verse": 1, "text": { "long": "...", "hays": "..." } }
  ]
}
```

The client detects schema version at runtime (`data.entries || data`) for backward compatibility with flat arrays.

---

## Suggested Next Steps

### Content

- [ ] **Add Seneca translations** — a second Latin-to-English translation (e.g. Richard Mott Gummere) would unlock the translation selector for Seneca the same way Meditations has it
- [ ] **Expand Epictetus** — the Discourses are only partially represented; fill out all four books
- [ ] **Marcus image polish** — current bust has a transparent background while Epictetus/Seneca/Diogenes have dark backgrounds; a consistent treatment across all four would unify the aesthetic

### UX

- [ ] **Keyboard navigation** — left/right arrow keys to step through verses; `r` to shuffle; already noted in PLAN.md
- [ ] **Favorites / localStorage** — bookmark a passage to re-surface it later
- [ ] **Deep-link URLs** — encode `philosopher/work/book/verse/translation` in the URL hash so passages are shareable
- [ ] **Scroll-to-philosopher** — a minimal fixed header or dot-indicator showing which section is active and allowing direct jump

### Technical

- [ ] **API routes** — the client fetches `/api/stoa/marcus` etc. but no actual API route files exist under `src/pages/api/`; the files are currently served from `public/assets/stoa/` as static JSON. Either add real Astro API endpoints or document the current public-static approach
- [ ] **TypeScript types** — add a shared `Philosopher` and `QuoteEntry` type; the `tsconfig.json` exists but no type files do
- [ ] **Image optimization** — bust images range from 843px to 2048px source; set consistent `width` and `densities` props on the Astro `<Image>` component for optimal AVIF/WebP output on Vercel
- [ ] **`ProjectCard.astro` hookup** — the component is built but never used; wire it into a `/projects` page or remove it

### Infrastructure

- [ ] **Preview deploys** — add a `pull_request` trigger to `.github/workflows/deploy.yml` so branches get Vercel preview URLs
- [ ] **Lighthouse CI** — add a post-deploy performance check; the parallax layer and large PNG busts are candidates for regression
