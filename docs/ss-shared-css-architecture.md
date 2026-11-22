# Signals & Systems CSS architecture (Chapter 5 reference)

Updated 2026-11-22. Covers native standalone Chapters 1–8. This is the source-of-truth for **future styling changes** rather than a rewrite of scientific simulators.

## Ownership and cascade

1. `assets/els-theme-v2.css` and related theme scripts — semantic colors and theme switching.
2. Native chapter HTML/CSS — experimental controls, domain-specific charts, plot dimensions and chapter-specific reading/derivation behavior.
3. `assets/ss-sidebar-layout.css` — navigation presentation, numbered badges, collapse toggle, theme-aware focus and active states. The old Chapter 1 horizontal-to-vertical navigation conversion and redundant sidebar grid rules were removed.
4. `assets/ss-chapter5-layout-standard.css` — the authoritative **Chapter 5-aligned sidebar and body geometry** (250px/52px rail, 15px body top, `clamp(12px,1.8vw,27px)` horizontal padding, 14px section gap).
5. `assets/ss-chapter5-internal-rhythm.css` — the authoritative **card/graph rhythm** (14px teaching-card insets, 12px radius, 13/12/10px canvas-card inset, 12px plot grid gap), with Chapter 6's numbered-step left inset and Chapters 7–8 SVG viewport geometry deliberately preserved.
6. `assets/ss-ch1-native-navigation.css` — now only the Chapter 1 footer-specific detail; former 7.5KB of duplicate navigation/grid rules is removed.

The last two common stylesheet links must follow chapter-specific CSS to win the intended overrides. Do not add another `!important` version of an existing common layout rule to individual chapter stylesheets; change the shared token instead.

## Keep separate

- Domain-specific control widths, graph axes and units, physical models, simulation update loops, KaTeX expressions and their rendering.
- Plot canvas heights, SVG viewBox, frame content, ROC shading, interpolation and responsiveness.
- Chapter 6's left clearance for numbered teaching steps.
- All localStorage keys, completed-lab states, interactive controls and chapter navigation URLs.
- The five established themes.

## Cleanup completed

- Removed approximately 9.4KB of superseded navigation rules from `ss-sidebar-layout.css` and consolidated the collapsed control.
- Removed approximately 6.9KB of redundant Chapter 1 native navigation styling. The Chapter 1 sidebar is authored directly in HTML and follows the same two-column layout as Chapter 4/5.
- Moved shared interior card and graph spacing into one stylesheet across Chapters 1–8, instead of repeating further chapter-specific overrides.
- Left original chapter-specific fallback rendering and content-dependent styles in place where removing them may alter offline operation or simulation-specific layouts.

## Regression gate

Run `npm run qa:navigation` and `npm run qa:navigation:visual`; the CI pipeline also runs them on relevant CSS changes.

The Chromium visual test checks expanded/collapsed sidebar width, number badges, active contrast, page overflow, Chapter 5-aligned content padding/position, 12px card corners, 14px teaching-card insets, 12px graph inner gutter (or equivalent SVG title gutter), and the Overview/Learning Map in five themes.

Whenever changing chart-specific CSS, also run the domain Chapter-specific regressions. These tests **do not prove** the physical or numerical correctness of every simulation.
