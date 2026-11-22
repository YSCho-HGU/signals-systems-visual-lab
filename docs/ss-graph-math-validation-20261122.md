# Signals & Systems — Graph and Mathematical Verification (2026-11-22)

## Scope and order

1. **Q3 graph geometry first:** Chapter 1 all nine experiments at five viewport widths, and Chapters 2–8 representative experiments at three widths, in neutral-dark and white-clean themes. The original 216-case Chromium run reported zero math-overlay clipping, title/legend overlap, or horizontal overflow issues. Follow-on work separated the Chapter 1 x-axis tick row from its axis title, increased the plot gutters, made tick density width-adaptive, and shortened its mathematical energy-axis label to `E(R)` while preserving detailed accessible axis descriptions.
2. **Q1 numerical correctness second:** 70 independent comparison assertions exercised selected numerical outputs in Chapters 1–8. The standalone GitHub Action passed all **70/70** tests. References use explicit closed-form solutions, numeric trapezoidal quadrature, and an independent direct DFT.

## Mathematically independent reference cases

| Chapter | Computed quantity | Independent reference or invariant |
|---|---|---|
| 1 | CT signal versus its DT samples | Evaluate the specified analog function at `t=nTs`; check identical discrete values |
| 2 | DT convolution, CT exponentials, RC pulse, two-sided absolute sum | Hand-calculated finite sequence; independent quadrature of convolution; geometric-series finite sum |
| 3 | Rectangular-pulse CTFS coefficients, square wave, periodic extension | Independent one-period integration, midpoint convergence and periodicity |
| 4 | Rectangular-pulse CTFT | Direct real-part integration of the Fourier integral, area at zero frequency |
| 5 | RC step, second-order step and poles | Integrate RC impulse response, second-order characteristic equation, initial and final values |
| 6 | Moving-average DTFT, FFT | Independent complex exponential sum and eight-bin direct DFT |
| 7 | Sampling/Nyquist and digital angular frequency | `Omega=2*pi*f/fs`, correct threshold classifications |
| 8 | Exponential response, ROC and BIBO condition | Known `a^n` at late sample, unit-circle containment for `|a|<1` versus `|a|>1` |

## Interpretation and limitations

Passing the QA is evidence for the **tested parameter combinations**, not a formal proof that every graph in every experiment is mathematically perfect. Lab rendering and math verification use separate tests so styling regressions do not mask numerical failures. Preserve the tests when changing algorithms and enlarge the reference matrix when a new lab or special parameter regime is introduced.

## Commands

- `npm run qa:graph-geometry` — geometry and clipping
- `npm run qa:graph-math` — KaTeX axis representation across five themes
- `npm run qa:graph-all-labs` — navigate and render every existing lab
- `npm run qa:math-independent` — independent numerical references

The graphical geometry tests are viewport-dependent. The independent numerical suite has explicit tolerances for quadrature error (up to `1e-4`) and much tighter tolerances for closed-form identities/DFT (`1e-10`–`1e-12`).
