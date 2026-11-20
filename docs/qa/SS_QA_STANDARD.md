# Signals & Systems Interactive Labs — Quality Standard v1.0

**Applies to:** Chapters 1–8 of Engineering Learning Studio · Signals & Systems.  
**Version:** 1.0 · 2026-11-20 · Machine-readable source: `docs/qa/ss-quality-policy.json`.

## 1. What constitutes a pass?

A green build means **automated regression checks passed**, not that every diagram is mathematically or pedagogically certified. Never label a release fully approved until the manual gates below are recorded.

| Gate | Evidence | Failure policy |
|---|---|---|
| G0 Catalog / invariants | 8 chapters, 62 stable IDs, route type and storage keys, script syntax | Blocking |
| G1 Reference mathematics | Independent Chapter 6.1 sample, alias and periodicity identities; expand per modified concept | Blocking for covered cases |
| G2 Chapter 6 browser journey | 390×844, 1280×800, 1366×768; controls, 6 lessons, graph count, scroll, four steps | Blocking |
| G3 Theme + language | Neutral Dark / alternate theme; mode changes without losing state | Blocking |
| G4 Learning aids | progress, synthetic signal and harmonic/filter sonification (click-to-play, stop) | Blocking |
| G5 Phase 0 storage | original keys and unknown values preserved through navigation | Blocking |
| G6 Visual smoke audit | 62 labs × 2 widths × 2 themes = **248 captured lab states** | Blocking |
| G7 Evidence processing | all records / screenshots present; no horizontal overflow or body contrast below 4.5:1 | Blocking |

**Manual gates:** M1 graphs/axes/units/legends and phase; M2 independent numerical oracle for changed lessons; M3 instructional clarity with 2nd-year learners. Keep these explicitly **NOT_VERIFIED** until reviewed.

## 2. Stable baseline and boundaries

- Chapter counts: **9, 9, 7, 8, 8, 6, 7, 8**.
- Chapters 5 and 6 use native `chapter5.html` / `chapter6.html` without iframe; Chapters 1–4 and 7–8 retain the embedded-lab route.
- Shared storage keys are `els-ss-lab-progress-v1`, `els-language`, `els-theme-v2`, `ss-unified-nav-collapsed`. Do not clear unknown localStorage keys.
- Predicting before an experiment is instructional, **not a gate**: no answer submission is required to enable a slider.
- English-only, Korean and Mixed modes preserve scientific units, mathematical expressions and current slider state.

## 3. Required sequence before merging a change

1. Identify affected chapter, learning objective, initial values, equations, plot axes, state keys and independent expected results. Add or update one focused numerical oracle.
2. Run the contract checks, changed-chapter browser journey, storage protection, theme/language check and learning-aids check.
3. Run the 248-state desktop/mobile visual audit (and the 1366×768 Chapter 6 check). Record console exceptions, canvas presence, horizontal overflow and 4.5:1 body text contrast.
4. Generate the machine-readable report. **Any required automated failure blocks a green status.** A failed earlier step must not be silently represented as not tested.
5. Review affected graph screenshots and verify assumptions, labels, legend, physical units and educational sequencing. Record reviewer and decision separately from CI.

## 4. Evidence and release decisions

- `qa-standard/quality-summary.json` — machine-readable gate summary, with PASS/FAIL/NOT_RUN per gate.
- `qa-output/results.json`, `qa-output/quality-gates.json`, `qa-output/{theme}/{width}/ch{n}/{index}.png` — 248 screenshot evidence.
- `qa-ch6-viewport/` — three viewport Chapter 6 captures.
- `qa-ch5/` — three-viewport Chapter 5 native rendering, ROC/pole slider and inverse-comparison reports.
- `qa-phase0/ss-baseline.json`, `qa-learning-output/results.json`, `qa-output/ss-theme-qa.json` — focused reports.

**Release notation:** `AUTOMATED_PASS / MANUAL_PENDING` means software checks passed but graph interpretation and student learning remain pending. `APPROVED` requires manual gate evidence as well. Never convert `NOT_RUN` into `PASS`.

## 5. Extending to new lessons

Use the current `assets/ss-learning-path.v1.json` as the authoritative ID roster. For each new/changed experiment, check: input and reset behavior, output and plot reaction, axis labels and domains, parameter units, one independent mathematical case, navigation, accessibility labels, user theme and language, and stored progress isolation. Update the screenshot matrix only if chapter counts or chosen target viewports actually change.

## 6. Repository commands

```sh
npm install
npx playwright install chromium
node tests/qa-contracts.mjs
node tests/ch6-sampling-foundations.mjs
node tests/ch6-viewport-e2e.mjs
node tests/ch5-viewport-e2e.mjs
node tests/phase0-ss-baseline.mjs
C_JOURNEY_BROWSER=1 node tests/ss-theme-qa.mjs
npm run qa:learning
npm run qa:visual
node tests/quality-gates.mjs
node tests/qa-summary.mjs
```

For authoritative execution results, see GitHub Actions **Visual Lab Accessibility and Regression Audit**, which runs these checks and uploads evidence. Screenshot existence and contrast ratios do not on their own establish mathematical accuracy.
