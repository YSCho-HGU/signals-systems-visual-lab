# Chapter-by-Chapter Manual Quality Review Template

**Scope:** Signals & Systems · Chapters 1–8, 62 interactive lessons.  
**Automation is necessary, but not sufficient for release.** Fill this table with direct observation rather than inferring approval from GitHub Actions.

## Review status by chapter

| Chapter | Experiments | M1 Graphs / scales / units / legends | M2 Reference mathematics | M3 Learning clarity | Reviewer / date | Notes |
|---|---:|---|---|---|---|---|
| 1 | 9 | PENDING | PENDING | PENDING | — | CT/DT domains, energy/power, system properties |
| 2 | 9 | PENDING | PENDING | PENDING | — | Convolution index/support, LTI, impulse response |
| 3 | 7 | PENDING | PENDING | PENDING | — | Fourier coefficients, harmonics, phase and synthesis |
| 4 | 8 | PENDING | PENDING | PENDING | — | CTFT axes, transforms and phase relationships |
| 5 | 8 | PENDING | PENDING | PENDING | — | Laplace ROC, poles, causality, stability |
| 6 | 6 | PENDING | PENDING | PENDING | — | DTFT, sampling foundations, filter response, FFT |
| 7 | 7 | PENDING | PENDING | PENDING | — | Sampling theorem, aliases and reconstruction |
| 8 | 8 | PENDING | PENDING | PENDING | — | Z-transform ROC, pole-zero, stability |

Use `PASS`, `FAIL`, or `PENDING` for each review; record every issue with chapter/lab ID, reproduction steps, actual/expected result and affected graph screenshot.

## M1: Visual evidence checklist

- [ ] Correct CT seconds / DT integer sample index / angular frequency (radians per sample).
- [ ] Axes origin, direction, tick spacing, dynamic bounds and scientific units are readable.
- [ ] Nyquist/alias/wrapping/phase representations match the selected model and assumptions.
- [ ] Color, line style, sample markers and legend identify every displayed curve.
- [ ] Sliders, their values and the resulting graph are visible together on a laptop viewport.
- [ ] No duplicated headers; no loss of scroll access to interpretation or Predict & Check.
- [ ] Light and Neutral Dark preserve minimum 4.5:1 text contrast; axes must be inspected separately.

## M2: Independent engineering mathematics checklist

- [ ] State an equation and initial parameters **before** comparing outputs.
- [ ] Include at least one exact or independently computed reference point, tolerance and units.
- [ ] Test a limiting/boundary case and a parameter change, not just the default screenshot.
- [ ] Distinguish idealized model assumptions from hardware or real-data behavior.
- [ ] Keep frequency units distinct (f in Hz, F in cycles/sample, Ω in radians/sample).

## M3: Student learning checklist

- [ ] The lesson asks one clear question before introducing multiple controls.
- [ ] Prediction is optional and does not prevent manipulating the experiment.
- [ ] Change-one-variable instructions say exactly which parameter to hold fixed.
- [ ] The first plot depicts the question; secondary plots have clear educational justification.
- [ ] Live measurements and explanatory sentences match the selected parameter values.
- [ ] Interpretation, optional derivation and next lesson are discoverable but not overwhelming.
- [ ] Check English-only / Korean / Mixed rendering and accessible controls.

## Approval record

- **Automated report:** GitHub Actions run URL and commit SHA
- **Screenshots:** `qa-output/` and `qa-ch6-viewport/`
- **Manual reviewer / date:**
- **Modules reviewed and mathematical reference:**
- **Accepted exceptions (document rationale):**
- **Final status:** `AUTOMATED_PASS_MANUAL_PENDING` until M1–M3 documented; `APPROVED` only after all required gates

The checklist intentionally leaves all items **PENDING**; CI alone cannot establish classroom effectiveness or an independent mathematical proof.
