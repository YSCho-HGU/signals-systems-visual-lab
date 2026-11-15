# Signals & Systems Visual Lab — UI/UX & 62-Experiment QA (2026-11-15)

**Scope:** Eight chapters / 62 existing experiments / 132 previously documented graph panels; overview, transformation map, engineering applications, embedded labs, and system/light/dark theme.  
**Change boundary:** Keep all original numerical, derivation, sample data, draw functions, plot palettes and graph probe logic untouched.  
**Result:** Source review and common UI corrections completed; repeatable **248-screen browser acceptance suite installed but not marked passed in this session**.

## 1. Source-grounded full experiment audit

The exact eight chapter payloads were reopened and decoded. All 62 experiment labels matched source definitions rather than a reconstructed list.

| Chapter | Experiments | Core recommended | Optional advanced | Embedded scripts pass syntax |
|---|---:|---:|---:|---:|
| 1 Fundamentals | 9 | 6 | 3 | 4 |
| 2 LTI & Convolution | 9 | 5 | 4 | 5 |
| 3 Fourier Series | 7 | 5 | 2 | 5 |
| 4 CTFT | 8 | 6 | 2 | 5 |
| 5 Laplace | 8 | 5 | 3 | 5 |
| 6 DTFT | 6 | 4 | 2 | 5 |
| 7 Sampling | 7 | 5 | 2 | 3 |
| 8 Z-Transform | 8 | 6 | 2 | 3 |
| **Total** | **62** | **42** | **20** | **35** |

All eight source documents include a viewport meta tag, a chapter navigation element, a main content landmark, system/light/dark theme handling from parent messages and at least one mobile-responsive stylesheet block.

### Main findings (before/after work)

| Area | Source audit finding | Action |
|---|---|---|
| Theme | Inconsistent root variables and dark-mode colors across chapter frames | Shared Design System v1.0.0 and common site/lab CSS adapters in all 8 chapters |
| Navigation | Long horizontal chapter/experiment tabs can be difficult to discover on mobile | Scrollable nav guidance and 44 px controls; source-level responsive overflow safeguards |
| Instruction | 62 experiments without a clear recommended path can overwhelm learners | Collapsible *core* and *optional advanced* route above chapter frame, with named navigation to the original experiment |
| Secondary text | Legacy 10–11 px labels exist in many labs | Raised UI label/legend/control minimum to 12 px (not internal axis drawing, which belongs to graph engine) |
| Math | Long Fourier/Laplace expressions can overflow on narrow screens | Safe horizontal overflow with math font fallback and responsive size |
| Keyboard | Current chapter indication inconsistent | Existing selected state plus aria-current and chapter focus enhancements |
| Graph probe | Mouse/touch/arrow-key interaction was not obvious | Added explicit page instructions; original probe and trace calculation unchanged |
| Progress | Clicking an experiment is not proof of student competence | Pathway shows *recommendations*, no automatic mastery badge |
| Plot semantics | Blanket dark background replacement could hide lines and axes | Preserve the existing canvas/SVG backgrounds and plot-specific palette |

## 2. Engineering Learning Studio v1.0.0 integration

- Canonical CSS: \`YSCho-HGU/engineering-learning-studio/assets/design-system.css\`.
- Exact mirrored CSS: \`assets/design-system.css\` in this repository.
- App adapters: \`assets/ss-site-theme.css\`, \`assets/ss-lab-theme.css\`.
- Version manifests: \`assets/design-system.version.json\` in both repositories; future course starter and specification are in the canonical repository.
- Design tokens control background/text/surface/link/focus; experiment canvases and SVG data drawing are exempt from blanket changes.

**Calculated token contrast** (not a full WCAG claim): Light body 15.35:1; Light muted 7.04:1; Dark body 13.11:1; Dark muted 9.81:1; Dark primary button 10.37:1. Target: WCAG 2.2 AA.

## 3. Installed reproducible browser acceptance workflow

- \`tests/visual-audit.mjs\`: launches Chromium via Playwright; serves repo locally over HTTP by default.
- \`package.json\`: \`npm run qa:visual\`.
- \`.github/workflows/visual-audit.yml\`: GitHub Actions runner for reproducible tests and screenshot artifacts.

**Planned browser matrix:** 62 experiments × 2 viewport widths (390 px mobile / 1280 px desktop) × 2 themes (light/dark) = **248 experiment screenshots**. Also takes overview and transformation map screenshots, checks iframe theme propagation, viewport overflow, parent route semantics, body text contrast and captures console errors. Each run saves \`qa-output/results.json\` and screenshots, uploaded as workflow artifacts.

This suite is **committed**, but the GitHub Actions run outcome and browser image inspection were not retrieved in this session. Do not describe the screenshots as captured or the automated browser tests as passed until the workflow outputs are inspected.

### To run
~~~sh
npm install
npx playwright install chromium
npm run qa:visual
~~~

The script assumes Python 3 is available to serve the static site, or \`SS_BASE_URL\` can point to a running HTTP server. Run from the repository root.

## 4. Remaining acceptance gates

1. Inspect actual generated screenshots for clipped equations, legend collisions, invisible poles/zeros or indistinguishable line colors.
2. Test keyboard-only navigation (Tab, Shift+Tab, arrow-key Graph Probe, Focus toggle) and screen-reader announcements.
3. Check 200% zoom and tablet width (768 px) in addition to the two automated breakpoint samples.
4. Confirm all chapter experiment links open the correct embedded module. Validate retained state and route after back navigation.
5. Review diagram contrast in all 132 graph panels, including dynamic hover/probe overlays and theme transitions; source scripts alone cannot guarantee this.
6. Collect first-hand usability results from representative 2nd-year students and test transfer to unseen prediction/derivation problems.

## 5. Recommended ongoing acceptance policy

Do not change source mathematical computations as part of CSS refactoring; version course-specific JS changes separately. Future changes should preserve canonical shared CSS alignment, run the Chromium sweep, review screenshots, and compare course numerical regression tests. Pass a chapter release only after both **visual QA and learning outcome QA** evidence exists.

**Educational impact hypothesis (not yet measured):** A collapsed, source-grounded recommended pathway should improve students' ability to find high-priority experiments without removing exploration freedom. This must be confirmed with observation, not inferred from page-view or click counts.
