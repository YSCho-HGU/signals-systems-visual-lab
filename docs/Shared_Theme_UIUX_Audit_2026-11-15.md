# Signals & Systems — Shared Theme and UI/UX Audit

**Date:** 2026-11-15  
**Repository:** `YSCho-HGU/signals-systems-visual-lab`  
**Audience:** 2nd-year Signals and Systems students  
**Scope:** Main overview, transform map, engineering cases, feedback, and all 8 chapter lab iframes (62 experiments / 132 existing plots).

## Objective and implementation

The user explicitly preferred the C Programming File I/O site's comfortable colors and requested that they be used **consistently throughout Signals and Systems**, with a renewed UI/UX review.

**Shared source palette**: `assets/design-system.css` is copied verbatim from `YSCho-HGU/engineering-learning-studio/assets/design-system.css`. It defines explicit light/dark semantic tokens: page/surface/ink/muted/border/primary/link/focus/selected/code.

**Adapters**:
- `assets/ss-site-theme.css`: Overview, navigation, chapter cards, transform map, engineering case panels, feedback modal and lab chrome.
- `assets/ss-lab-theme.css`: injected into all eight pre-existing standalone chapter documents when their HTML is decoded for the iframe.
- `index.html`: retains existing 8 embedded lab payloads, math logic, plot engines and interactive controls. Only theme links, small navigation affordances, graph-probe instruction, and active route semantics were modified.

**Important boundary:** Existing plotted series colors and chart canvases/SVG graph backgrounds were deliberately preserved rather than applying generic panel colors to graphs. Treating data visualizations as ordinary cards could hide plotted curves or axes and would change the established design semantics.

The original System / Light / Dark control is retained; iframe chapters continue following the parent with `ss-set-theme` messages. Keyboard focus can move to the new view on direct route selection, and `aria-current="page"` marks the selected nav destination.

## Exact shared token colors

| Token | Light | Dark |
|---|---|---|
| Page | #F5F8FC | #0F1B2B |
| Surface | #FFFFFF | #1D2C40 |
| Raised surface | #EAF1F8 | #273B53 |
| Main text | #14263A | #F1F7FF |
| Secondary text | #455B70 | #C8D9EB |
| Border | #98AEC2 | #8199B4 |
| Link | #075A93 | #A9DAFF |
| Focus | #085D95 | #FFDC79 |

### Calculated contrast of main tokens

| Test | Contrast ratio | Meets 4.5:1 normal-text threshold |
|---|---:|---|
| Light main text on surface | 15.35:1 | Yes |
| Light secondary text | 7.04:1 | Yes |
| Light link | 7.26:1 | Yes |
| Light primary button | 7.26:1 | Yes |
| Dark main text | 13.11:1 | Yes |
| Dark secondary text | 9.81:1 | Yes |
| Dark link | 9.53:1 | Yes |
| Dark primary button | 10.37:1 | Yes |

These are **token-level checks**, not sitewide WCAG 2.2 AA certification. SVG/canvas chart labels, hover states, gradients, all utility text, enlarged text, nontext contrast and screen-reader operation need real browser audit.

## Static regression verification

- Main single-page app uses valid JavaScript; the embedded `application/json` payload is not JavaScript and must not be compiled as JS.
- All **8 embedded lab payloads** decode into documents with exactly one `</head>` and each has working parent-theme message listener.
- All **8 labs' inline JS blocks parse**, 35 blocks in total, with no syntax errors.
- All lab payloads are unchanged (the new color adapter is inserted into the iframe's HTML string at load time), preserving original mathematical computations and 132 existing plot implementations.
- Main document includes theme links; each iframe receives both global tokens and the lab adapter.
- Mobile navigation hint and explicit graph interaction hint added.
- Main content regions are focusable via `tabindex="-1"`; navigation reflects current page through `aria-current`.

## UI/UX evaluation for students

### Strong foundations
1. Chapter 1–8 selection and transformation relationship map are clear conceptual entry points.
2. Same **Predict → Change → Derive → Explain** model helps transfer study routines across chapters.
3. Graph Probe offers mouse/touch/arrow-key access to signal values.
4. Independent labs avoid loading all experiments at once; existing diagrams and numerical models are not disturbed.
5. System/Light/Dark preference is consistent across overview and active chapter.

### Problems and remedies
| Priority | Student friction | Implemented / next action |
|---|---|---|
| P0 | Inconsistent chapter-page/card colors in dark mode | Shared semantic themes installed in main and all eight lab frames |
| P0 | Potential low contrast in chapter subtext, tool buttons, select boxes | Shared semantic colors and focus rings applied; full browser sweep needed |
| P1 | Long top nav on mobile has hidden horizontal overflow | Added mobile scroll hint, minimum-size nav controls |
| P1 | Selecting chapter by keyboard did not clearly reveal new region | Enabled view focus and selected-page semantics |
| P1 | Graph inspection interaction not apparent | Added hint in lab footer |
| P1 | Eight chapter lab layouts differ from one another | Shared surface and typography adapter added; complete interaction unification deferred |
| P2 | 62 experiments make it hard to find the next task | Potential chapter-specific “recommended first lab” and short objectives; not implemented |
| P2 | No unified mastery evidence | Later connect prediction/explanation with student submissions; not implemented |
| P2 | Can be overwhelming to infer what is optional | Consider essential/advanced labels for each S&S lab, matched to the 2nd-year syllabus |
| P2 | Large ~1MB HTML payload | Defer payload optimization until performance is measured; avoiding a fragile refactor protects regressions |

## Offline / deployment caveat

Previously the standalone `index.html` held all labs. The new **unified appearance** now requires `assets/design-system.css`, `assets/ss-site-theme.css`, and `assets/ss-lab-theme.css` to be available alongside `index.html`. If only the HTML is copied offline, old built-in CSS acts as fallback; the new shared palette will not appear. Downloaded individual chapter HTML still falls back to its original theme.

## Not yet verified

Live GitHub Pages deployment, pixel-level screenshots, dark/light all states, 200% zoom, keyboard-only focus cycle, mobile touch usage, 132 chart color legibility, actual student study outcomes, and full WCAG 2.2 AA are **not** verified. Existing historical graph numerical QA figures in the README are not newly rerun here.

## Recommended acceptance tasks

1. Browse overview, map, engineering cases, feedback and all eight chapter labs in Light/Dark/System.
2. Check dynamic graph axes, legends, focus/Graph Probe state, selected nav state and formula/readout clarity.
3. Check mobile at 360px and 768px; desktop at 1280px; test 200% zoom.
4. Test student workflows: select Chapter 2 convolution, modify one parameter, inspect Graph Probe, step through derivation, return to Transform Map.
5. Interview 5–8 second-year students about discoverability and cognitive load before redesigning simulation layouts.
