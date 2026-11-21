# Engineering Learning Studio — Typography Standard (2026-11-21)

## Source of truth
The reference is **C Programming → Chapter 17 File I/O** (base prose 16px and line-height 1.7).
Both course repositories contain identical `assets/els-typography-standard.css`. The stylesheet is shared by contract, and must be kept in sync whenever changed.

## Required page tokens
- `--els-body-font: system-ui, -apple-system, "Segoe UI", "Malgun Gothic", Arial, sans-serif`
- `--els-body-size: 16px`
- `--els-body-leading: 1.7`
- `--els-caption-size: 13px`
- `--els-caption-leading: 1.55`
- `--els-axis-size: 12px`
- `--els-subheading-size: 19px`

## Scope
All existing and new C Programming, Signals & Systems and Studio pages must load the typography stylesheet **after** local chapter styles and theme CSS. Embedded Signals & Systems lab content is injected via `decodeLab` in `index.html`, so update that sheet list as well.
Narrative explanations, worked derivations and instructional commentary use base body size.
Graph captions, axis keys, compact plot instructions and legend descriptions may use 13px, and axes inside plots use 12px. Never automatically shrink actual reasoning/explanations because they are inside a graph section.

## Exceptions
- Math rendering (KaTeX/MathJax), code blocks, line numbers, navigation controls and labels retain appropriate domain-specific styling.
- Do not change graph data, canvas scale or chart axis domains as a side effect of typography.
- The browser user zoom setting must remain effective; do not block scaling.

## Before release
1. Verify body computed font-size is 16px and line-height about 27.2px.
2. Inspect Ch5.1, Ch6.1 and at least one lab per embedded chapter 1–4 and 7–8.
3. Verify graph-caption text is 13px and not artificially used for explanations.
4. Verify no text clipping at 125% and 200% browser zoom, desktop and narrow layout.
5. Check Edge dark/light OS settings with White Clean and Neutral Dark.
