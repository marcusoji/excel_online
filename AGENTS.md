# AGENTS.md

Excel Academy — a pure-frontend, offline-first Next.js 15 PWA that
teaches practical Excel skills through 15 guided lessons in a live grid.
No backend, no accounts; all progress is in IndexedDB via Dexie.

## Commands

```bash
npm ci            # install (use `npm ci`, not `npm install`)
npm run dev       # dev server on :3000
npm run build     # production build → static export in ./out
npm run lint      # ESLint (next lint)
npm run verify    # curriculum + formula-engine regression check (tsx)
npm run gen:icons # regenerate PWA icons (python3)
```

Run `npm run verify` after any change to `src/lib/curriculum.ts`,
`src/lib/formulaEngine.ts`, or `src/lib/gridActions.ts`. It plays through
every lesson with the same functions the UI uses and asserts each step's
check passes, plus a set of direct formula spot-checks. It is the fastest
feedback loop and does not need a browser.

To preview the built site: `python3 -m http.server 12000 --directory out`.

## Architecture

- `src/lib/curriculum.ts` — all lessons and levels. Source of truth for content.
- `src/lib/formulaEngine.ts` — hand-rolled tokenizer/parser/evaluator.
- `src/lib/gridActions.ts` — pure Fill Down / Sort / AutoSum transforms.
- `src/lib/formulaShift.ts` — relative-vs-absolute reference shifting on copy.
- `src/lib/lessonRunner.ts` — shared step check (`checkStepPasses`) and the
  resume helpers (`rebuildGridUpTo`, `selectedCellForStep`). Used by both the
  lesson player and `verify-curriculum.ts` so the two cannot drift.
- `src/components/LessonPlayer.tsx` — lesson runner: brief → steps → complete.
  Resumes a part-finished lesson from `bestStepIndex`, rebuilding the sheet by
  replaying earlier steps' deterministic effects.
- `src/components/InteractiveSpreadsheet.tsx` — the grid (formula bar, Fill
  Down, validation dropdowns, conditional formatting, banded Tables).
- `scripts/verify-curriculum.ts` — the regression check described above.

## Conventions and constraints

- The curriculum is adult/professional. Lesson copy is a workplace scenario,
  and every `LessonStep` carries an `objective` (the skill it builds) plus an
  optional `hint`. Keep new lessons in that shape — `Lesson.brief` and
  `Lesson.objectives` are required.
- `AppMode` is visual density only (`focus` | `analyst`). Both modes serve the
  same curriculum. Dexie migration v2 maps legacy `kid`/`pro` values onto
  these. Levels carry no age or audience label — only `title` and
  `description`.
- `lesson.id` values are stable keys for Dexie progress; renaming one resets
  that lesson's progress for existing users.
- Lesson step checks must be passable by the step's `demo` beats (or by the
  Fill Down / Sort / AutoSum convention `verify` simulates). Fill-Down steps
  are encoded as `highlightCells: [sourceCell, destinationCell]` where the
  destination is exactly one row below the source.
- Named ranges used in a lesson's formulas must be declared in
  `Lesson.namedRanges`; `xlsxExport` substitutes them so exports stay valid.
