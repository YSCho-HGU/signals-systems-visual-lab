# Signals & Systems — Chapter 5/6 Native Learning Standard

Version: 1.0 (2026-11-21)  
Reference: Chapter 6.1 (DTFT fundamentals)

## Scope

This standard applies to the native Chapter 5 and Chapter 6 pages **only**.
The six other chapters retain their existing iframe implementations until a
separate explicit migration is approved.

## Instructional hierarchy

1. **Predict** — write an optional hypothesis before operating controls.
2. **Adjust** — keep sliders, inputs, presets, and reset controls together.
3. **Observe** — show the changing plots beside Step 2 on sufficiently wide
   viewports. Controls and plots must both remain visible and interactive.
4. **Explain & Check** — begin below the two-column workbench, at the **left
   margin of the full content region**. Show interpretation and optional
   self-check alongside/after guided derivation as the specific lab requires.

A guided derivation may be shown before Step 4, but must also begin at the
same full-width left margin; it must not inherit the right-side plot column.
Do not force a fixed number of derivation equations or worked examples.

### Standard stage indicator

Use the same rectangular rounded number marker in both chapters:
31 × 31 CSS px; radius 8px; border 1.5px; 16px weight 850.
Use palette tokens `--ss-step-background`, `--ss-step-foreground`,
`--ss-step-stroke` from `assets/ss-four-step-standard.css`.
Avoid hardcoded navy/white marker overrides on individual Chapter pages.

### Typography and page rhythm

- Core explanatory body: at least 16px with line height near 1.7, based on the
  C Programming File I/O reading standard.
- Figure captions, chart details, and secondary metadata may be smaller
  (typically 13–14px), with clear hierarchy.
- Mathematical expressions remain genuine typeset equations where applicable.
- No sticky plot control panel that obstructs a later derivation or check.
- The small viewport must stack controls above graphs rather than narrow
  both columns; avoid horizontal document overflow.

## Theme contract

One persisted setting: `els-theme-v2` in localStorage, managed by
`assets/els-theme-v2.js`; page-specific scripts must not create a competing
theme storage key.

| Theme | Page background | Surface | Scheme |
|---|---|---|---|
| neutral-dark | #101010 | #1c1c1c | dark |
| warm-dark | #1d2323 | #293130 | dark |
| navy-dark | #101827 | #1c293a | dark |
| warm-neutral | #f7f6f2 | #fffefa | only light |
| white-clean | #f4f6f7 | #ffffff | only light |

The retired `white` selector is mapped to `white-clean` but not presented as
a separate option. **White Clean intentionally has a softly tinted page
background, not a pure-white page; content surfaces are white.**

Explicit theme selection must take precedence over OS/browser light/dark
preference. Tests must inspect computed styles — confirming
`data-els-theme` alone is not enough.

The same theme must persist after page refresh and when navigating from
Chapter 5 to Chapter 6 and back. The selected palette must not interfere with
language mode, numerical models, plots, or the 62 shared progress IDs.

## Implementation contract

- `assets/els-theme-v2.css`, `assets/els-theme-v2.js`: shared palette and
  selection state (do not fork).
- `assets/ss-four-step-standard.css`: Chapter 5/6 stage marker and final
  semantic palette normalization, loaded last on native pages.
- `assets/ss-reading-rhythm.css`: shared body hierarchy and reading rhythm.
- `assets/ss-ch5-standalone.css`, `assets/ss-ch6-standalone.css`: only
  Chapter-specific layout rules; do not reintroduce theme-specific color
  constants after the shared normalization stylesheet.
- For Chapter 6, the workbench spans the outer experiment width and the
  following interpretation, derivation and next-lesson sections use full width.
- Keep original graph canvases and input node identities. No cloning or
  reinitializing input event handlers while changing layout.

## Browser verification and release conditions

`tests/ss-ch5-ch6-standard-qa.mjs` checks:
- Chapter 5 and Chapter 6.
- All five palettes.
- OS dark and light preference independently.
- Chromium and Microsoft Edge (when installed by CI).
- Computed body/main/surface colors, stage numbering, 2/3 workbench and
  Step 4 full-left positioning, absence of page overflow, slider input,
  persistence across refresh, and JavaScript errors.

The dedicated gate is **G2b** in the visual-audit workflow and must be green
before treating the theme/layout regression as verified. The test's Edge
installation or execution failure is a test failure, not evidence of a pass.
The standard is not a claim of complete WCAG conformance, nor does it replace
manual inspection of graphs, equations, and reading comfort.
