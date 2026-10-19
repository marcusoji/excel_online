# Excel Magic Academy 🪄

A pure-frontend, offline-first Progressive Web App that teaches practical,
professional Excel skills — a five-level curriculum built around real
workplace tasks, with a real, live-calculating spreadsheet grid at the center
of every lesson.

**Everything lives on the learner's device.** There's no backend, no
database, no accounts. XP, streaks, badges, and completed lessons are all
stored in the browser's IndexedDB via [Dexie.js](https://dexie.org/).

---

## What's in this build

Every level is complete: **15 fully interactive lessons, 3 per level, across all 5 levels** — nothing is a placeholder or a "coming soon" card.

Each lesson opens with a professional **briefing** (the workplace scenario and
what you'll practise), then walks you through it step by step in a live grid.
Every step is labelled with the specific skill it builds, and every lesson can
be restarted at any point.

- **Level 0 — Spreadsheet Foundations:** The Grid, Cells & Cell References · Formulas & Operator Precedence · SUM & Ranges
- **Level 1 — Data Literacy & Core Functions:** Core Statistics (AVERAGE/MIN/MAX/COUNT) · Relative References & the Fill Handle · Logic with IF & Live Reporting
- **Level 2 — Data Integrity & Lookups:** Absolute vs. Relative References · Conditional Aggregation (COUNTIF/SUMIF + Data Validation) · XLOOKUP, Tables & Conditional Formatting
- **Level 3 — Business Analysis:** Nested Logic & Input Protection · Named Ranges & Readable Formulas · Grouping Data (Pivot & Sparkline Dashboard)
- **Level 4 — Professional Tooling & Automation:** Cleaning Messy Data (TRIM/PROPER) · Dynamic Arrays & Spill · Recording a Repeatable Macro

There's also a free **Practice workspace** (`/practice/`) — an ungraded sandbox
for trying formulas against your own numbers, with a live cell inspector.

**Built, not stubbed:**
- A hand-rolled formula engine (`src/lib/formulaEngine.ts`) supporting `SUM`, `AVERAGE`, `MAX`, `MIN`, `COUNT`, `COUNTIF`, `SUMIF`, `IF`, `ROUND`, `XLOOKUP`, `TRIM`/`UPPER`/`LOWER`/`PROPER`/`CONCAT`/`LEN`/`LEFT`/`RIGHT`/`MID`, a simplified `SORT`, named-range substitution, and real absolute-vs-relative reference handling — genuine calculation, not a canned answer key.
- A custom `InteractiveSpreadsheet` grid: formula bar, cell selection, live recalculation, cell coloring, a real **Fill Down** (the fill handle — shifts relative references, respects `$` locks), **Data Validation** dropdowns, **Conditional Formatting**, **Table** row banding, and sticky headers (a **Freeze Panes**-style effect, always on).
- Dexie-backed progress, XP, streaks, and badges — every level and lesson earns its own badge automatically.
- A real service worker with a build-time-generated precache manifest — the whole exported site (all 15 lessons) works offline after one visit.
- Downloadable `.xlsx` practice files (via SheetJS) generated from each lesson's live grid, with named ranges resolved so the exported formulas stay valid in real Excel.
- A searchable formula reference (with a "use it for" note on each entry) and a printable certificates page (one certificate per completed level).

**Honest simplifications — real features, deliberately scoped down rather than faked:**
A few desktop-Excel features don't have a full browser equivalent, so this build teaches the underlying idea with genuine, live computation rather than a static mock:
- **PivotTables** → `PivotPreview` really groups and sums the grid's live data; there's no drag-and-drop field list.
- **Sparklines** → a real inline SVG trend line, computed from live cell values.
- **Dynamic Arrays (`SORT`)** → the formula itself returns one real value (this engine is one-formula-per-cell); a separate `DynamicArrayPreview` panel shows the full sorted "spill" so the concept is visible, clearly labeled as a preview rather than written into cells the learner didn't type into.
- **Freeze Panes** → the grid's header row/column are always sticky, rather than a user-choosable freeze point.
- **Sheet Protection** → modeled with the same read-only-cell mechanism used everywhere else, applied to a lesson's given data.
- **Macro Recording** → `MacroLog` genuinely replays the learner's own actions as pseudo-VBA (real action log, not a canned transcript); it's illustrative, not executable VBA.
- **Power Query** → taught as its formula-level equivalent (`TRIM`/`PROPER`/`CONCAT`), framed explicitly as "here's what Power Query automates at scale."

`src/lib/curriculum.ts` is the single source of truth for all of the above — every lesson, level description, and badge is defined there, so extending the curriculum further never requires touching the engine or UI components.

---

## Stack

- Next.js 15 (App Router, static export) + TypeScript + Tailwind CSS + Framer Motion
- Dexie.js over IndexedDB for all progress data
- SheetJS (`xlsx`) for practice-file downloads
- Self-hosted fonts via `@fontsource` (Baloo 2, Inter, JetBrains Mono) — no Google Fonts network dependency, so typography works offline too
- A hand-written service worker (no Workbox/Serwist dependency) driven by a manifest generated after every build

---

## Project structure

```
src/
  app/                     Routes (onboarding, dashboard, lessons, cheat sheet, certificates)
  components/
    InteractiveSpreadsheet.tsx   The live grid: formula bar, fill-down, validation, conditional formatting
    LessonPlayer.tsx             Step orchestration, sort/AutoSum actions, live chart + custom panels
    MiniBarChart.tsx, Sparkline.tsx, PivotPreview.tsx, DynamicArrayPreview.tsx, MacroLog.tsx
  lib/
    curriculum.ts           All 5 levels + all 15 lessons — add new lessons here
    formulaEngine.ts         The formula tokenizer/parser/evaluator
    formulaShift.ts          Shifts relative references for Fill Down (respects $ locks)
    gridActions.ts           Pure fill-down/sort/AutoSum transforms (shared by the app and by scripts/verify-curriculum.ts)
    db.ts                    Dexie schema
    badges.ts                Badge rules (auto-derived from curriculum.ts)
  hooks/                   useProgress, useOnlineStatus
public/
  manifest.json, sw.js, icons/
scripts/
  generate-icons.py                  Regenerates all PWA icons
  generate-precache-manifest.mjs     Runs after every build (see below)
  verify-curriculum.ts               Plays through all 15 lessons headlessly (see below)
```

---

## Local development

```bash
npm install
npm run dev       # http://localhost:3000 — note: the service worker only
                   # activates against a static export, not `next dev`
npm run verify     # plays through all 15 lessons headlessly and asserts
                   # every step's check actually passes — run this after
                   # editing curriculum.ts
```

To exercise the real offline behavior locally:

```bash
npm run build      # next build && postbuild manifest generation
npx serve out      # or any static file server
```

---

## How the offline/precache system works

Next's static export produces content-hashed filenames
(`_next/static/chunks/xyz123.js`) that don't exist until after the build
finishes, so a hand-written list of files to cache would go stale
immediately. Instead:

1. `next build` exports the site to `out/`.
2. The `postbuild` npm script (`scripts/generate-precache-manifest.mjs`)
   walks `out/` and writes `out/precache-manifest.json` listing every real
   file — every page, every JS/CSS chunk, the manifest, the icons.
3. `public/sw.js` fetches that manifest on install and precaches everything
   in it.

If you add new pages or lessons, you don't need to touch the service
worker — just run `npm run build` and the manifest picks them up
automatically.

**iOS-specific notes (read before you rely on this for a kid's homework):**
- iOS Safari does not implement the Background Sync API. This app doesn't
  need it — every write goes straight to IndexedDB the moment it happens —
  but don't add a "sync progress when back online" feature using
  `registration.sync`; it will silently no-op on iPhone/iPad. Use the
  `online` window event instead (see `useOnlineStatus.ts` and
  `ServiceWorkerRegister.tsx`).
- Safari's Intelligent Tracking Prevention can evict a site's storage
  (including IndexedDB) after roughly 7 days with no visit. There is no
  web API that can prevent this. `OfflineIndicator.tsx` intentionally says
  "saved on this device" rather than promising permanence.
- Next.js 15 stopped emitting the legacy `apple-mobile-web-app-capable`
  meta tag from the `appleWebApp.capable` metadata option (it now only
  emits the newer, unprefixed `mobile-web-app-capable`). iOS Safari does
  not yet honor the new tag for a true full-screen "Add to Home Screen"
  launch, so `src/app/layout.tsx` adds the legacy tag back explicitly via
  the `other` metadata field. If you ever remove that, re-test "Add to
  Home Screen" on an actual iPhone before shipping.

---

## Deploying to Cloudflare Pages

**Option A — Git integration (recommended):**

1. Push this repo to GitHub/GitLab.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, select the repo.
3. Build settings:
   - **Framework preset:** Next.js (Static HTML Export)
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
4. Deploy. Every push to your production branch redeploys automatically.

**Option B — Direct upload via Wrangler:**

```bash
npm install -g wrangler
npm run build
wrangler pages deploy out --project-name=excel-magic-academy
```

Both routes serve the same static files — there is no server runtime to configure.

---

## Testing on each platform

**iPhone / iPad (Safari):**
1. Open the deployed URL in Safari (not Chrome — Chrome on iOS can't install PWAs).
2. Tap the **Share** icon → **Add to Home Screen** → **Add**.
3. Launch it from the home screen icon — it should open full-screen with no browser chrome.
4. Turn on Airplane Mode, relaunch from the home screen icon, and confirm the dashboard and lessons still load.
5. If something looks stale after a redeploy, background-close the app and relaunch — the service worker updates on next launch, not mid-session.

**Windows / macOS (Chrome or Edge):**
1. Open the deployed URL.
2. Click the install icon in the address bar (or the "Install" prompt on the onboarding screen), or use the browser menu → **Install Excel Magic Academy**.
3. Launch it from the Start Menu / Applications, disconnect from the network, and confirm it still works.

**macOS (Safari):**
1. Open the deployed URL. Safari on macOS supports "Add to Dock" (File menu, or the Share icon) for an app-like window.

**Lighthouse / Core Web Vitals check (any Chromium browser):**
```
DevTools → Lighthouse → Progressive Web App + Performance
```
Run this against the deployed URL, not `localhost` with `next dev` — the dev server disables the optimizations the export relies on.

---

## Known dependency advisories

`npm audit` will flag a couple of items worth understanding rather than
blindly patching:

- A `postcss` advisory nested inside Next's own internal build tooling
  (`next/node_modules/postcss`) — this affects the build toolchain, not
  code shipped to the browser, and resolving it requires a Next.js major
  version bump.
- The published `xlsx` (SheetJS) package has known advisories related to
  **parsing untrusted spreadsheet files**. This app only ever *writes*
  `.xlsx` files from its own lesson data (see `xlsxExport.ts`) and never
  parses user-uploaded spreadsheets, so that attack surface isn't
  exercised here — but if you extend the app to import `.xlsx` files from
  users, switch to SheetJS's CDN-distributed patched build first.

Run `npm audit` yourself before shipping to production and re-check
periodically.

---

## Extending the curriculum

Add a new lesson in three steps:

1. Define it in `src/lib/curriculum.ts` (grid size, starting cells, an
   array of `LessonStep`s with a `check` and optional `demo`). A lesson can
   also opt into: `namedRanges`, `liveChart`, `conditionalFormats`,
   `validationLists`, `bandedRange`, `customPanel` (Pivot/Sparkline/Dynamic
   Array preview), and `isMacroLesson`. A step can add `sortAction` or
   `autoSumAction` to render an extra action button.
2. Add its id to the right level's `lessonIds` array, in order.
3. Run `npm run build` — the static route, the precache entry, the
   learning-path node, and its badge all pick it up automatically.

No other file needs to change for ordinary content additions. Run `npm run
verify` afterward to confirm every step's check still passes.
