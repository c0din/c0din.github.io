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
    "school": "stoicism",
    "translations": {
      "long": "George Long (1862)",
      "hays": "Gregory Hays (2002)"
    },
    "defaultTranslation": "long"
  },
  "entries": [
    {
      "book": 1,
      "verse": 1,
      "text": { "long": "...", "hays": "..." },
      "tags": ["discipline", "action"]
    }
  ]
}
```

The client detects schema version at runtime (`data.entries || data`) for backward compatibility with flat arrays.

---

## Philosophical Expansions — The Warrior-Sage Corpus

Evolving the reader from a Stoic repository into a complete artifact for the Warrior-Sage requires bridging abstract philosophy with tactical execution. Group additions by school:

### The Schools

| School | Philosophers | Source Texts |
|---|---|---|
| **The Porch** (Stoicism) | Marcus Aurelius, Epictetus, Seneca | Meditations, Enchiridion, Letters |
| **The Barrel** (Cynicism) | Diogenes | Lives of the Eminent Philosophers, Book VI |
| **The Dojo** (Tactical/Martial) | Miyamoto Musashi, Sun Tzu | Book of Five Rings, Art of War |
| **The Athanor** (Mysticism/Analysis) | Carl Jung, Pythagoras (via Iamblichus) | Red Book, Man and His Symbols, Golden Verses |
| **The Stream** (Taoism) | Lao Tzu, Zhuangzi | Tao Te Ching, Zhuangzi |

### Priority Additions

- **Miyamoto Musashi** — *The Book of Five Rings*. Direct support for physical culture, bojutsu, and the mechanics of martial discipline.
- **Carl Jung** — *The Red Book* / *Man and His Symbols*. Psychological framework for shadow work, archetype exploration, and the alchemical process.
- **Pythagoras (via Iamblichus)** — Surviving fragments and maxims. Roots the application in sacred geometry; mirrors the structural mathematics of the Tetractys.
- **Lao Tzu** — *Tao Te Ching*. Counter-balance to Stoic rigidity through fluid adaptation and flow states.

---

## Schema & Feature Evolution

### 1. Thematic Tagging

Extend entry objects with a `tags` array to enable cross-author querying. Rather than "What did Marcus say?", the interface answers "Give me a passage on *Discipline*" — drawing from Musashi, Seneca, and Epictetus simultaneously.

```json
{ "book": 1, "verse": 1, "text": { "long": "..." }, "tags": ["discipline", "shadow", "action", "geometry"] }
```

### 2. The Oracle Mechanic

Replace pure randomization with a daily seed or algorithmic I Ching hexagram generator. Transforms the shuffle button into a **daily draw** — a specific focal point for the day's training or writing. Seeding by date ensures the same passage surfaces consistently within a 24-hour window across devices.

---

## Architecture Evolution — The Memory Palace

### The Problem

The current flat vertical scroll becomes an "infinite scroll of floating heads" as the philosopher count grows. Navigation is linear; there is no spatial orientation.

### The Solution: Hierarchical Routing

Transition from a flat list to a three-level Memory Palace. Navigation becomes dimensional — you enter a Room, walk into a Wing, and focus on an Artifact.

```
src/pages/
  index.astro                   # LEVEL 1: The Atrium (central hub)
  [school]/
    index.astro                 # LEVEL 2: The Wing  (e.g. /stoicism)
    [philosopher].astro         # LEVEL 3: The Sanctum (e.g. /stoicism/marcus)
```

**Level 1 (`/`)** — The Atrium maps all available schools. No scrolling. Fixed-viewport geometric dashboard built on CSS Grid. Hovering "The Stoics" node fades in low-opacity silhouettes of Marcus, Seneca, and Epictetus behind the UI. A global command palette (`Cmd+K`) lists every philosopher for instant jumps.

**Level 2 (`/stoicism`)** — The Wing fetches only JSON files tagged to that school and passes them as props into `<QuoteGenerator>`. The current scroll-snapping layout renders unchanged, restricted to that school's heads.

**Level 3 (`/stoicism/marcus`)** — The Sanctum locks the viewport to a single philosopher for deep, uninterrupted study.

### The Atrium Layout

Use CSS Grid with a sacred geometry layout (Tetractys or Seed of Life pattern) to map school nodes on desktop. Each node is a card or geometric cell. The roster "Index" button opens a command palette listing every philosopher alphabetically across all eras.

### Component Reuse

`<QuoteGenerator>` accepts a `philosophers` prop. Existing scroll-snapping logic is unchanged — the routing layer simply controls which subset is passed in.

---

## Wiki Integration Strategies

### Strategy 1: Headless Stoa (API Provider)

Build actual Astro API routes (`src/pages/api/stoa/[philosopher].ts`). Serving JSON through server-side Vercel endpoints converts the app into a micro-service consumable by any external system.

### Strategy 2: Quartz Homepage Injection

With the API live, inject a dynamic **Daily Oracle** block onto the Quartz landing page. A lightweight fetch script — identical in architecture to existing `map.js` and `calendar.js` components — hits the Astro endpoint on load and displays the daily anchor quote at the top of the grid.

### Strategy 3: Obsidian Workflow Automation

Automate `Le Quotidien` creation via the Obsidian Templater plugin. A script fires when a new daily log is created, pings the Astro API, retrieves a tagged or seeded quote, and injects it into the *Slide / Intention* field of the markdown template — zero friction.

---

## Suggested Next Steps (Ordered)

### Immediate — Unlock the Data Layer
- [x] **Build Astro API routes** — `src/pages/api/stoa/[phil].ts` serves all philosophers + school index; supports `?work`, `?book`, `?verse`, `?tag`, `?random` query params
- [x] **Add `school` key to JSON metadata** — all four existing files updated; `stoicism` / `cynicism`

### Short Term — Expand the Corpus
- [x] **Add Musashi** — Earth Scroll (10 entries) live at `/api/stoa/musashi`; school `tactical`; tagged entries
- [ ] **Add Lao Tzu** — *Tao Te Ching* has multiple PD translations; pairs naturally with the existing Stoic material
- [ ] **Add Seneca translations** — a second translation (e.g. Richard Mott Gummere) unlocks the translation selector for Seneca
- [ ] **Expand Epictetus Discourses** — all four books, not just the sampled passages currently present

### Medium Term — Architecture
- [x] **Implement thematic tags** — `tags` array on all Musashi entries; schema supports it across all files
- [x] **Build the `[school]` dynamic routes** — `src/pages/school/[name].astro`; SSR with back-link; stoicism / cynicism / tactical all return 200; unknown school → 302 to /404
- [x] **`<QuoteGenerator>` prop-driven** — accepts `ids?: string[]`; `data-ids` on scroller drives dynamic `state` + `sources`; Musashi renders with `刀` symbol placeholder until bust is added
- [ ] **Design the Atrium** — replace `index.astro` flat scroll with the geometric grid hub

### Medium Term — UX
- [ ] **Keyboard navigation** — arrow keys to step verses; `r` to shuffle
- [ ] **Oracle mechanic** — daily seed tied to the date
- [ ] **Deep-link URLs** — encode `school/philosopher/work/book/verse/translation` in the URL hash for shareable passages
- [ ] **Favorites / localStorage** — bookmark a passage to re-surface it

### Polish
- [ ] **Marcus bust background** — transparent background while others have dark; apply a consistent dark treatment to unify all four busts
- [ ] **Image optimization** — set `densities` props on `<Image>` for AVIF/WebP output via Vercel
- [ ] **`ProjectCard.astro` hookup** — wire into a `/projects` page or delete it
- [ ] **Preview deploys** — add `pull_request` trigger to `.github/workflows/deploy.yml`
- [ ] **Lighthouse CI** — post-deploy performance check; parallax layer and large PNGs are regression candidates
