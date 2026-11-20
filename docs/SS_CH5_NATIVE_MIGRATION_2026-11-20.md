# Chapter 5 — Native Laplace Visual Lab migration

Date: 2026-11-20

## User goal
Make Chapter 5 a full-width, no-iframe standalone native page with the Chapter 6 compact navigation, theme and spacing. The original ROC, pole/zero, inverse Laplace comparison, sliders and plots must remain functional.

## Deliverables
- `chapter5.html`: extracted the exact original Chapter 5 Laplace core script from `index.html`'s `lab-payload["5"]` Base64 HTML; added native Chapter 6-style top header, chapter/language/theme menus, shared tokens.
- `assets/ss-ch5-standalone.css`: responsive header, native sidebar, compact controls and readable charts. Experiment controls are non-sticky; moving into ROC/interpretation sections will not leave a floating panel over the page. Existing Canvas handlers are not overridden.
- `assets/ss-ch5-standalone.js`: same-origin theme/language settings and optional self-reported progress with existing `els-ss-lab-progress-v1` storage contract. The numerical core remains untouched.
- `index.html`: route `#chapter=5` to `chapter5.html`, exactly as Chapter 6 routes to `chapter6.html`.
- `assets/ss-ch6-learning-flow.js` + `chapter6.html`: Chapter 6 selector links natively to Chapter 5.
- `docs/qa/ss-quality-policy.json`: Chapter 5 native route.
- `tests/qa-contracts.mjs`, `tests/phase0-ss-baseline.mjs`, `tests/visual-audit.mjs`, `tests/ch5-viewport-e2e.mjs`, `.github/workflows/visual-audit.yml`: native route regression, eight labs, original ROC controls, inverse comparison, 3 viewport journey, 248-state image audit.

## Compatibility and non-regression principles
1. Core JavaScript from the original embedded Laplace page was compared against the standalone document **byte for byte** using the exact text span starting with `<script>\n'use strict';\nconst PI`, and verified equal (58,875 characters). All 8 labs and their numerical functions remain unchanged.
2. No iframe exists in the native Chapter 5 document. The old Base64 payload remains in `index.html` as a dormant compatibility reference; the route no longer uses it.
3. The previous `window.__laplaceVisualLab` and `window.__labNumerics` diagnostics are preserved.
4. Important protected functions include `installPlotInteractions()`, `drawInverseComparison()`, `drawInverse()`, `drawStability()`, and ROC state/pointer handlers.
5. The current language selector persists the shared preference. Most original Chapter 5 explanatory content remains authored bilingually; full English-only conversion is not part of this migration.
6. Static validation confirmed all 7 inline scripts parse and routing, theme links, sliders, progress hooks are present. Browser/runtime and screenshot gate results are **NOT_VERIFIED** here until GitHub Actions runs.
7. Maintaining Phase 0: Chapter counts 9,9,7,8,8,6,7,8; 62 progress IDs and existing storage keys unchanged.

## Routes
- `https://yscho-hgu.github.io/signals-systems-visual-lab/chapter5.html`
- `https://yscho-hgu.github.io/signals-systems-visual-lab/index.html#chapter=5` (redirects)
- `https://yscho-hgu.github.io/signals-systems-visual-lab/chapter6.html` (native chapter picker Ch 5 returns above)

## Further hardening
Run `node tests/ch5-viewport-e2e.mjs` and `npm run qa:visual` in installed Playwright environment, examine screenshots at 390/1280/1366, confirm ROC pole/zero dragging in actual browser, and adjust horizontal overflow/layout after evidence review. Do not label manual mathematical/visual gates complete before seeing the results.

## Q2: KaTeX mathematical typesetting
- `assets/ss-ch5-math.js` supplies typed, dynamically parameterized LaTeX for all eight experiment formula headers and 32 guided derivation steps.
- `chapter5.html` uses the same KaTeX 0.16.25 distribution as Chapter 6, and the existing shared `ELSLabUI.renderMath` renderer (accessible HTML + MathML output).
- Rendering runs on lab selection, slider updates, preset changes and guided-step changes; the numerical computation and canvas/pointer handling functions are retained.
- KaTeX availability requires the external CDN. If unavailable, the original HTML equations are retained as a fallback.
- Source-level test: 21 model scenarios including RS/LS/strip ROC, all five transform pairs, exact pole-zero cancellation, overdamped/underdamped cases and RC changes; all 21 produced four valid LaTeX derivation expressions.
- Browser E2E gate extended to require KaTeX rendering in each experiment.
- **Verification limit:** Container networking cannot resolve GitHub Pages or jsDelivr, so live Chromium screenshots and drag actions have not been executed here. The automated Playwright workflow is committed, but its run result is not independently confirmed.
