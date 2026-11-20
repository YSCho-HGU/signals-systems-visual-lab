# Engineering Learning Studio — Shared Lab UI v1

## Scope and activation
Reusable, **opt-in** layout and mathematical typesetting for Signals & Systems, later DSP, Python and Logic Design labs. This does not migrate existing user data or alter an existing chapter unless that chapter explicitly imports and calls the components.

Files:
- `assets/els-lab-components.js`: `ELSLabUI.mountWorkbench`, `ELSLabUI.addStepNumber`, `ELSLabUI.renderMath`, `ELSLabUI.renderMany`.
- `assets/els-lab-components.css`: responsive two-column lab workbench and math overflow styles.
- `assets/ss-ch6-math.js`: Chapter 6.2–6.6 dynamic LaTeX models; kept separate from the reusable core.
- `assets/ss-ch6-learning-flow.js`: concrete Chapter 6 learning flow and safe integration.

## Integration pattern
Load KaTeX stylesheet/script (or bundle locally), then the reusable JS and CSS before the chapter's math model. Keep the chapter's own numerical model and input event handlers.

```html
<link rel="stylesheet" href="./assets/els-lab-components.css">
<script src="./assets/els-lab-components.js"></script>
```

To group a chapter's controls and charts without cloning existing elements:

```js
ELSLabUI.mountWorkbench({
  module: "my-lab",
  experiment,
  body: experiment.querySelector(".body-col"),
  controls: experiment.querySelector(".controls"),
  charts: experiment.querySelector(".charts"),
  graphHeader: experiment.querySelector(".observation-header")
});
```

The wrapper spans only variable controls and plots. Interpretation and follow-up sections remain outside, so **controls do not stick across later sections**.

For equations:
```js
ELSLabUI.renderMath(document.getElementById("formula"),
  String.raw`X(e^{j\\Omega})=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\Omega n}`,
  {display:true, fallbackHTML:"Readable equation"});
```

Prefer named LaTeX model functions driven by current slider state, not heuristic parsing of long prose. The renderer supports KaTeX when available and a supplied readable fallback when offline. For a fully offline deployment, locally bundle the compatible KaTeX JS, CSS and assets, subject to dependency licensing.

## Chapter 6 verification checklist
1. Each experiment 6.1–6.6 shows step badges 1, 2, 3, 4; Step 2 controls and Step 3 plots share a workspace.
2. Scroll into Step 4 and guided derivation: controls do not follow.
3. All preset controls still affect numerical graphs. Chapter 6.6 FFT presets remain interactive.
4. Switch EN / KR / Mixed and White / Neutral Dark themes; no invisible equations or clipped panels.
5. Verify guided derivation (first/next/previous/all) and live slider changes on each signal variation.
6. Inspect KaTeX output for 6.2 impulse/shift/causal-exp/rect/symmetric-exp, 6.3 delay, 6.4 phasors, 6.5 filter, 6.6 FFT.
7. Check offline fallback and keyboard operation. Do not change `els-ss-lab-progress-v1`.

The structural/script checks alone do not replace browser-level regression testing.
