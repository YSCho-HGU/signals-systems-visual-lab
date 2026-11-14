# Signals & Systems — Interactive Visual Learning Studio

Interactive bilingual (English/Korean) Visual Labs for university Signals & Systems, Chapters 1–8.

- 62 interactive experiments, 18 engineering cases, transform relationship explorer
- Feedback: use the **오류 제보 / Feedback** form on the site to open a prefilled GitHub Issue (GitHub sign-in required), copy a report, or save it as TXT.
- All lab functionality is bundled in [index.html](./index.html) and runs without external dependencies.

## GitHub Pages setup

1. Repository **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose **main** and **/(root)**, then **Save**.
4. After deployment completes, the student URL is https://yscho-hgu.github.io/signals-systems-visual-lab/ .
5. Ensure **Settings → General → Features → Issues** is enabled for feedback.

## Versioning

The current published revision is **Rev8**. Dark mode follows the OS by default, with optional System/Light/Dark selection. Previous Drive versions are retained in `Note/old/`; updating the homepage means replacing `index.html` with the latest verified revision. Existing URLs remain unchanged.

For teaching, students should verify any reported errors with the course instructor; Issues are public, so avoid sharing personal information.

## Chapter 1 foundation labs (Rev7)

Nine experiments: CT/DT signals, elementary signals and impulses, time transformations, CT/DT sinusoid periodicity, energy/power, system properties, even/odd decomposition, signal operations, and synthetic engineering signals. Based on course note `101_Ch1_Signals_and_Systems_Rev2f`.

## Rev7 graph and contrast audit

All 62 experiments (132 graphs) now show axis names and visible plotted bounds. Dark-mode text contrast was checked in every experiment. Validation: 465/465 browser checks, 62/62 dark-mode sweeps, 186/186 Chapter 1 numerical checks and 67,249/67,249 Chapter 2–8 checks (233 independent analytic-value checks and 67,016 data/invariant checks). See the full-source ZIP and `QA_REPORT.md` for methodology and limits.

## Graph Probe (Rev8)

Move your mouse over any graph, tap on mobile, or focus the graph and use the arrow keys to inspect cursor coordinates and signal values. Analytic functions are evaluated at the cursor x; precomputed and discrete traces show their nearest actual sample and its x coordinate, without claiming interpolation. Complex planes show Re/Im, magnitude, phase, pole/zero proximity and ROC. All 132 plots across 62 experiments support this feature in both Light and Dark modes.

QA: 548/548 desktop checks, 12/12 additional interaction checks, 3/3 formula probe checks, 186/186 Ch1 and 67,249/67,249 Ch2–8 math/data checks passed.
