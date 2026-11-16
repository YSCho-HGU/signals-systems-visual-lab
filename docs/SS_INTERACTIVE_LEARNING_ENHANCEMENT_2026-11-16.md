# Signals & Systems — Interactive Learning Enhancement (2026-11-16)

## Delivery overview

This update extends the existing 62-experiment Signals & Systems Visual Learning Studio. Existing chapter simulations and textbook mathematical models remain intact; the new controls run alongside the legacy interface.

| Requested improvement | Implemented | Notes |
|---|---|---|
| Sonification | Yes, supplemental Chapter 3 and Chapter 6 controls | Web Audio API, user-click playback only, stop control, about 2-second synthetic signal playback, no copyrighted recordings |
| Local learning progress | Yes | Student explicitly marks reviewed/unreviewed for each existing experiment; storage `els-ss-lab-progress-v1` |
| Real-world use cases | Yes, educational examples | Ch1 synthetic ECG-like waveform, Ch3 harmonic timbre, Ch6 synthetic noisy signal with low/high-pass filtering; never presented as real patient/sensor measurements |
| Mobile fine control | Partially | +/− accessible step controls added beside existing range sliders in iframe lessons; existing canvas touch/zoom interactions unchanged. Real-device pinch-to-zoom QA still required |
| Wrong-answer feedback | Yes for new chapter-level Predict & Check checks; partial for legacy questions | One calibrated numeric question per Ch1–8; wrong inputs return 2 levels of conceptual hints. Existing diverse quiz implementations are not all connected to an automatic grader; a generic chapter hint is always available |

## Experiment progress semantics

- Existing recommended course pathway: 9+9+7+8+8+6+7+8 = **62 labs**.
- Stable lab IDs: `chapter:experimentIndex` (e.g. `3:2`) where numbering follows the existing chapter experiment list.
- Storage: `localStorage["els-ss-lab-progress-v1"] = ["1:1", "3:2", ...]`.
- The progress record is an **explicit self-reported lesson review**. It must never be represented as correct understanding, exam success or verified code execution.
- Data are validated on read; invalid / unknown lab IDs are ignored. No network requests or student records are sent to GitHub.
- Saved data are same-origin browser-local. They can be lost on browser data clearing, and do not follow a student to another device automatically.
- The Engineering Learning Studio read-only dashboard (`/engineering-learning-studio/progress/`) now reads the same key and shows total 62 and 8 chapter subtotals.

## Audio and signal examples

- Playback is opt-in by direct click. Audio starts quietly, ramps in/out to reduce clicks, is brief, and has an explicit Stop button.
- Ch3: the synthesized wave uses an odd-harmonic sum with amplitude proportional to 1/k, demonstrating timbre; learners can change the number of harmonics.
- Ch6: same original harmonic source passes through a low-pass or high-pass Web Audio Biquad filter; the parallel static chart shows a separate educational FIR-filter computation. **The audio and chart are related demonstrations, not identical filter implementations.**
- Ch1: an invented ECG-like pulse is filtered for teaching; no patient data, no medical interpretation.
- Accessibility: canvas has an accessible label; the signal is always accompanied by control and text descriptions. No audio autoplays or microphone permission is requested.

## Predict & Check

Independent short numeric questions cover:
1. CT sinusoid period
2. Discrete convolution
3. Harmonic frequency
4. CTFT time-shift magnitude
5. Laplace ROC
6. DTFT frequency periodicity
7. Nyquist limit
8. Causal Z-transform ROC

Incorrect inputs show a principle clue on first attempt and a more specific clue on repeated attempts. Numeric answers are checked with a small absolute tolerance; this activity is an *ungraded practice aid* and does not write a grade or a completion record. It does not automatically evaluate arbitrary mathematical answers in existing iframe experiments.

## Mobile UX

- Fine adjustment controls operate the same range input as its existing slider, dispatching native `input` and `change` events.
- Large 40px tap buttons and 44px responsive supplemental controls improve accessibility.
- No unverified pinch-to-zoom override is installed, because doing so can break graph-coordinate selection and existing experiment gestures.
- Further real-device testing is required for iOS Safari and Android Chrome (zoom, pointer sampling, fine sliders, responsive panels, orientation changes).

## Acceptance QA

1. Run the site and visit all 8 chapters; choose different experiments from the chapter sidebar. Mark a lab reviewed, unmark it and reload; the count should update and never exceed 62.
2. Visit the Studio progress dashboard in the same browser profile; the count and chapter totals should agree with SS. Confirm C evidence metrics are unchanged.
3. Test ENG, Korean and mixed modes; review labels, challenge feedback, screen-reader labels and audio buttons.
4. Play a 3-harmonic and 9-harmonic tone in Chapter 3; listen to the difference; test stop and navigation to another chapter.
5. In Chapter 6, vary cutoff and low/high-pass mode. Confirm both the synthetic waveforms and optional audio respond.
6. In Chapter 1, confirm ECG-like data is explicitly described as **synthetic** and **not diagnostic**.
7. Check two wrong predictions and then a right prediction in each chapter. Ensure the original lab's own quiz and input state remain unaffected.
8. Test touch stepper buttons on narrow screens; preserve keyboard and numeric slider input. Verify that no old graph gesture is obstructed.
9. Repeat in neutral-dark and warm-neutral themes, including color contrast and focus states.
10. Validate GitHub Pages deployment, open browser console, and inspect errors. No successful browser E2E or device-level pinch test is claimed by this source-level update.

## Files

- `assets/ss-progress.js`: progress controls, sidebar markers and Home progress link
- `assets/ss-applications.js`: harmonics, audio, synthetic cases and waveform display
- `assets/ss-learning-aids.js`: chapter hints, numeric Predict & Check, fine slider controls
- `assets/ss-learning-path.js`: keep sidebar active experiment selection in sync
- `index.html`: load the three new modules
- Studio `progress/index.html` and `progress/dashboard.js`: read-only SS summary


## Browser verification and fixes (2026-11-16)

New automated E2E: `tests/learning-aids-qa.mjs` / `npm run qa:learning`, executed by `.github/workflows/learning-aids-qa.yml`.

- GitHub Actions [run 43854943131](https://github.com/YSCho-HGU/signals-systems-visual-lab/actions/runs/43854943131): **12 passes, 0 failed checks, 0 reported JavaScript console/page errors**.
- Chromium desktop 1280×800 and mobile-emulated 390×844 were exercised. Both cover progress save/unmark/reload, Ch3 harmonic changes and AudioContext startup, Ch6 filtering visualization, synthetic ECG display, the two-tier numeric hints, and iframe fine-step slider controls.
- Fixed `ss-learning-aids.js` slider enhancement loop: `return` previously exited all enhancement when an already-instrumented slider was encountered. It now uses `continue`, allowing all eligible sliders to receive controls.
- Updated the older 248-screenshot visual audit theme selectors to current `warm-neutral` / `neutral-dark` values. Previous legacy test failures arose from trying to select removed `light` and `dark` values.
- **Verification limit:** Browser test confirms the Web Audio context starts after a click, not the perceptual quality of reproduced sound on speakers or headphones. Chromium touch emulation does not replace physical-device iOS/Android gesture checks. The complete 62-experiment visual audit is separately executed and must be judged by its workflow result, not assumed to pass based on these 12 checks.


### Follow-up QA update — actual Chromium tests

- Browser learning-aids E2E [run 43856283410](https://github.com/YSCho-HGU/signals-systems-visual-lab/actions/runs/43856283410): **14 pass, 0 fail, 0 JS page/console errors**, including a real pointer hit-test of Chapter 3's visible experiment navigation in desktop and mobile-emulated layouts.
- Fixed a significant UI regression: the original `.lab-area` fixed-height flex container collapsed `.lab-frame-wrap` to 0px after the added progress/applications/prediction panels. A non-Focus layout now allows full document scrolling and preserves at least 420–460px for the iframe; Focus mode remains separate. Browser evidence confirms desktop 576px and mobile-emulated ~549px iframe height, with successful real pointer clicks.
- The full 62×2×2 screenshot audit captured **248 screenshots** but its initial quality gate was not yet passing. Old theme names, hidden legacy iframe navigation, and a palette-vs-scheme overwrite in test records were corrected. These are test-automation changes, not mathematical transformations.
- Before treating the full audit as green, examine the latest `Visual Lab Accessibility and Regression Audit` workflow result and its `qa-output/results.json` and `quality-gates.json` artifacts. Outstanding issues must not be represented as passed.
- Physical Android/iOS pinch and headphone audio quality remain outside headless Chromium's validated scope.


## Full 248-screen regression resolution (2026-11-16, final)

**Root-cause analysis:** In Chromium's mobile 390px viewport, the expanded 220px unified chapter sidebar reduced the iframe to approximately 170px. All 62 experiments therefore reported horizontal overflow in each of two themes (124 reports). These were repeated measurements of one mobile layout defect, not 124 independent mathematical errors.

**UI fix:** `assets/ss-learning-path.js` now makes the sidebar an overlay on mobile, rather than subtracting 220px from the iframe. Mobile navigation is collapsed by default when no stored preference exists, can be expanded on demand, and auto-closes after an experiment is selected. LocalStorage retains the existing collapsed preference.

**Regression-test fixes:** `tests/visual-audit.mjs` now uses the visible unified navigation, opens collapsed menus before navigation, and correctly distinguishes theme palette from iframe light/dark scheme. `tests/quality-gates.mjs` uses matching theme names. Additional `tests/learning-aids-qa.mjs` assertions check mobile iframe width ≥300px and selection/auto-close behavior.

**Verified GitHub Actions (latest commit `cdf0a0a3`):**
- [Full visual audit run 43858742127](https://github.com/YSCho-HGU/signals-systems-visual-lab/actions/runs/43858742127) — **success**, 248 desktop/mobile × light/dark-equivalent experiment screenshots, automated issues 0.
- [Learning aids E2E run 43858742321](https://github.com/YSCho-HGU/signals-systems-visual-lab/actions/runs/43858742321) — **success**, including live browser mobile sidebar interaction.
- GitHub Pages deployment for the same revision — **success**.

**Scope of PASS:** Automated checks cover layout overflow, theme propagation, screenshot existence, navigation and the targeted interactive behavior. They do **not** establish proof of mathematical correctness for every graph, screen-reader usability for all elements, real-device iOS/Android pinch gestures, or actual acoustic fidelity. Those remain human/independent-review gates by design.
