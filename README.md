# Signals & Systems — Interactive Visual Learning Studio

Interactive bilingual (English/Korean) Visual Labs for university Signals & Systems, Chapters 1–8.

- 62 interactive experiments, 18 engineering cases, transform relationship explorer
- Feedback: use the **오류 제보 / Feedback** form on the site to open a prefilled GitHub Issue (GitHub sign-in required), copy a report, or save it as TXT.
- All chapters are now independent pages: chapter1.html through chapter8.html. The homepage is a course overview and no longer embeds lab payloads or iframes.
- Shared theme, header, formula and learning bridge assets are in assets/. Publish the full repository, rather than just index.html.

## Current architecture and teaching continuity — 2026-11-21

- **Standalone Chapters:** chapter1.html through chapter8.html. No chapter iframe or embedded encoded lab payload in index.html.
- **UI:** shared chapter dropdown and five-theme control; Chapter 1–4 numeric code preserved with Predict → Change → Observe → Explain reading stages.
- **Mathematics:** shared KaTeX key relations and safe guided-derivation enhancement, with original math retained when conversion is ambiguous.
- **Learning bridges:** ROC, inverse transforms, phasor cancellation, anti-aliasing and digital filter continuity; Chapter 5.7 and 8.8 contain an interactive RC-to-IIR coefficient bridge.
- **QA:** tests/chapter-continuity-qa.mjs and .github/workflows/chapter-continuity-audit.yml exercise chapter navigation, lab controls, charts, math, themes and links.

## GitHub Pages setup

1. Repository **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose **main** and **/(root)**, then **Save**.
4. After deployment completes, the student URL is https://yscho-hgu.github.io/signals-systems-visual-lab/ .
5. Ensure **Settings → General → Features → Issues** is enabled for feedback.

## Versioning

The current standalone pages use Neutral Dark, Warm Dark, Navy Dark, Warm Neutral, and White Clean themes independently of OS appearance. The Rev7/Rev8 sections below describe historical releases. Previous Drive versions are retained in `Note/old/`; updating the homepage means replacing `index.html` with the latest verified revision. Existing URLs remain unchanged.

For teaching, students should verify any reported errors with the course instructor; Issues are public, so avoid sharing personal information.

## Chapter 1 foundation labs (Rev7)

Nine experiments: CT/DT signals, elementary signals and impulses, time transformations, CT/DT sinusoid periodicity, energy/power, system properties, even/odd decomposition, signal operations, and synthetic engineering signals. Based on course note `101_Ch1_Signals_and_Systems_Rev2f`.

## Rev7 graph and contrast audit

All 62 experiments (132 graphs) now show axis names and visible plotted bounds. Dark-mode text contrast was checked in every experiment. Validation: 465/465 browser checks, 62/62 dark-mode sweeps, 186/186 Chapter 1 numerical checks and 67,249/67,249 Chapter 2–8 checks (233 independent analytic-value checks and 67,016 data/invariant checks). See the full-source ZIP and `QA_REPORT.md` for methodology and limits.

## Graph Probe (Rev8)

Move your mouse over any graph, tap on mobile, or focus the graph and use the arrow keys to inspect cursor coordinates and signal values. Analytic functions are evaluated at the cursor x; precomputed and discrete traces show their nearest actual sample and its x coordinate, without claiming interpolation. Complex planes show Re/Im, magnitude, phase, pole/zero proximity and ROC. All 132 plots across 62 experiments support this feature in both Light and Dark modes.

QA: 548/548 desktop checks, 12/12 additional interaction checks, 3/3 formula probe checks, 186/186 Ch1 and 67,249/67,249 Ch2–8 math/data checks passed.

## Engineering Learning Studio shared theme — 2026-11-15

The Visual Learning Studio now uses the same light/dark semantic palette as the C Programming site:

- `assets/design-system.css`: shared Engineering Learning Studio tokens (source-equivalent copy).
- `assets/ss-site-theme.css`: visual adapter for the home page, transform map, engineering cases, feedback dialog, and chapter navigation.
- `assets/ss-lab-theme.css`: adapter inserted into **all eight embedded chapter lab frames** at runtime, leaving original lab programs and graph drawing code unchanged.

The legacy parent/iframe model described here is historical; chapter pages now apply their own shared theme. Numeric simulation and plotting palettes are intentionally not changed by the UI theme adapter.

**Important for offline copies:** The experiment payload is no longer embedded in index.html. Preserve each chapter HTML file and the assets/ directory together; KaTeX also requires its referenced library. Publish/copy the entire repository (not just `index.html`) to preserve the identical new look. Individual downloaded chapter HTML files retain their original self-contained appearance.

**Accessibility:** WCAG 2.2 AA text contrast is a design target, not a certified status. Browser-based desktop/mobile/keyboard/200%-zoom checks across all 62 experiments and 132 graphs remain necessary after this theme-only change. Prior numerical QA results are historical, not a new complete automated browser acceptance.


## Design System v1.0.0 + Recommended Learning Path (2026-11-15)

- **Official shared style**: canonical [Engineering Learning Studio Design System v1.0.0](https://github.com/YSCho-HGU/engineering-learning-studio/blob/main/docs/Design_System_v1.0.0.md). Shared \`assets/design-system.css\` matches the canonical file; individual course adapters keep plots and equations functional.
- **Student learning path**: each Chapter now contains a collapsible, directly navigable **Core recommended (42)** + **Optional advanced (20)** selection. Full [62-experiment catalog and learning objectives](docs/Signals_Systems_62_Learning_Path_v1.md) is sourced from the existing lab modules, and remains a recommendation rather than an official assessment policy.
- **Accessibility/readability**: improved minimum label size, touch control height, formula overflow, dark/light semantic colors, and small-screen navigation.
- **Browser QA pipeline**: [visual audit](tests/visual-audit.mjs) checks each experiment in light/dark × mobile/desktop (248 views); [GitHub Actions workflow](.github/workflows/visual-audit.yml) uploads screenshots and \`results.json\`. \`npm install && npx playwright install chromium && npm run qa:visual\`.
- **QA status:** [Source-level UI/UX and acceptance report](docs/Signals_Systems_UIUX_62_Audit_2026-11-15.md). Real browser screenshot pass is not asserted until the workflow result and artifacts have been examined.

**Offline:** new palette and pathway require the repository's \`assets/\` files. The original interactive lab payload remains embedded in \`index.html\`; opening a standalone HTML copy without assets falls back to the legacy interface.

## New interactive learning aids (2026-11-16)

- **Self-reported progress:** 62 experiment review markers stored only in the current browser and shown on the Studio Progress Dashboard.
- **Hear the signal:** original synthetic harmonic audio in Chapter 3 and low/high-pass filtered audio in Chapter 6; playback requires a user click.
- **Engineering examples:** simulated ECG-like waveform (Ch1), additive harmonics (Ch3), and synthetic signal denoising/filtering (Ch6).
- **Practice feedback:** chapter-level numeric Predict & Check with graduated hints; separate from existing embedded experimental quizzes.
- **Mobile:** accessible range-slider increment/decrement buttons; device-level pinch zoom remains a separate testing requirement.

[Details, limitations and acceptance checks](docs/SS_INTERACTIVE_LEARNING_ENHANCEMENT_2026-11-16.md).

## Phase 0 — Browser compatibility baseline

The read-only [S&S storage contract](docs/phase0/ss-storage-baseline.json) pins 8 chapters, 62 lab IDs, and legacy preference/progress keys. The isolated Chromium [Phase 0 regression suite](tests/phase0-ss-baseline.mjs) and [source-only storage scanner](tests/phase0-storage-scan.mjs) run in [GitHub Actions](.github/workflows/phase0-ss-baseline.yml) on Ubuntu 24.04. Reference [successful run 43867654674](https://github.com/YSCho-HGU/signals-systems-visual-lab/actions/runs/43867654674): 53/53 checks passed. Tests use generated browser fixtures, not student data.
