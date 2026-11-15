# Signals & Systems — Three-axis release acceptance (v2, 2026-11-15)

**Decision principle:** A browser automation PASS is *not* permission to label the site VERIFIED. Release certification requires evidence for each independent gate: V (visual clarity), M (mathematical correctness) and L (learning outcomes). Unexamined gates remain PENDING. Never equate source review, screenshot collection or experiment clicks with successful student learning.

## Scope and evidence
- Eight chapters, 62 experiments, 132 documented graph panels.
- Existing Chromium sweep: 62 × 2 themes × 2 viewport widths (390/1280 px) = **248 experiment screens** plus overview/transform map captures.
- New `tests/quality-gates.mjs` verifies every expected screenshot is present and nonempty, all 248 unique records are present, theme and overflow/contrast checks did not fail, and emits `qa-output/quality-gates.json`.
- **Important:** Programmatic screenshot presence cannot determine whether dark plot curves, thin axes or phase labels are visually distinguishable. Human screenshot review remains mandatory.
- Site calculations, graph palettes, canvas/SVG drawing and graph-probe calculations must not be rewritten merely to pass CSS checks.

## V — Visual clarity (all 132 graph panels; Light and Dark)
For each panel, inspect a Chromium screenshot, then verify the interactive state in the browser:
1. Signal curve distinct from background/grid/axes and from other curves; dash or marker patterns distinguish multi-series traces beyond hue alone.
2. Axis line and origin, positive/negative directions, units, ticks and labels remain legible and non-overlapping.
3. Legend symbols/color match the graph, no clipping or collision with plot or controls.
4. Phase: numeric or π-based ticks, phase wrapping/discontinuities and sign are explicit; a discontinuity should not appear as an incorrect continuous ramp.
5. Complex plane: pole ×, zero ○, unit circle and ROC boundary distinct; hover/focus probe labels do not hide plotted points.
6. Formulas: subscripts, fractions, exponents, absolute value, ω and π not clipped. Long expressions scroll locally rather than widening the page.
7. Recheck when controls change and graph probe activates; verify keyboard focus/arrow-keys as well as mouse/touch.
8. In addition to 390/1280 widths, examine 768 px tablet and 200% zoom for every distinct graph/layout family.

**Failure policy:** invisible/misleading axes, false phase connection, inaccurate legend or clipped essential formula = BLOCKER. Minor cosmetic issues = FIX_BEFORE_RELEASE unless documented as non-instructional.

**Priority panels:** Ch3 Fourier Series spectral lines/time-shift phase; Ch4 CTFT signed sinc and magnitude/phase; Ch5 Laplace pole/ROC; Ch6 DTFT 2π periodicity, phase wrap and DFT leakage; Ch7 aliasing/spectral copies; Ch8 pole-zero/unit circle/ROC and frequency response.

## M — Mathematical accuracy (independent expected-value oracle)
Use independent analytic predictions, not the plotted array itself, for representative parameter settings and boundary cases. Required cases include:
- Ch1: u(t) and δ representation, x(at+b), CT/DT periodicity, energy vs average power.
- Ch2: convolution support [n₀+m₀,n₁+m₁], impulse identity, 3-point moving-average DC gain = 1.
- Ch3: time shift aₖ' = aₖ exp(-jkω₀t₀); Fourier magnitude unchanged, phase changes.
- Ch4: rectangular pulse of width T has transform T sinc(ωT/2), with signed zero crossings; time shift multiplies exp(-jωt₀).
- Ch5: causal exp(-at)u(t) has X(s)=1/(s+a), ROC Re(s)>-a (a>0); pole at -a.
- Ch6: DTFT 2π periodic; x[n-n₀] gives exp(-jωn₀)X(e^{jω}); amplitude unchanged.
- Ch7: f and f+mfₛ produce identical ideal samples for integer m, subject to stated assumptions.
- Ch8: causal aⁿu[n] has X(z)=1/(1-az⁻¹), ROC |z|>|a|; stability when |a|<1 for a causal realization.

For each case: record model parameters, independent computation, measured display/trace, tolerance and PASS/FAIL. Add numerical tolerances for approximation methods (finite truncation, sample density). **Do not** treat a screenshot as numerical evidence.

## L — Student learning evidence (2nd-year audience)
Use the same 4-step task within core experiments: **Predict → manipulate one parameter → observe/compare → explain or sketch an unseen variant**.
- Test at least one core experiment per chapter and a representative advanced experiment in Ch3/4/6/8.
- Score each task on 0–2 per dimension: prediction (0–2), signal/transform interpretation (0–2), parameter-effect explanation (0–2), transfer to new case (0–2). Maximum 8.
- Suggested *pilot* threshold (requires instructor approval): individual task ≥6/8 AND transfer ≥1/2. Collect errors, hesitation and misinterpretations; a completion click never equals mastery.
- Navigation test: student can identify the recommended core item, enter the right experiment, state the axes and infer a graph change without procedural assistance.
- Only report verified learning impact once actual student attempts are recorded and evaluated; author/instructor desk review is formative, not a student-outcome pass.

## Release decision
| Gate | Evidence needed | Status after committing this specification |
|---|---|---|
| Browser automation | 248 real screenshots, no failing console/theme/overflow/contrast checks; inspect `quality-gates.json` | **PENDING RUN** |
| Visual (V) | Reviewed 132 panels in both themes + representative responsive/probe states, reviewer signoff | **PENDING REVIEW** |
| Math (M) | Independently calculated regression table and boundary cases | **PENDING EXECUTION** |
| Learning (L) | Scored student attempts and transfer questions | **PENDING PILOT** |
| Overall | All required gates supported by retained evidence | **NOT VERIFIED** |

**Review record template:** chapter/experiment/panel; browser/version; viewport/theme; formula or graph reference; expected; observed; defect severity; screenshot/file link; reviewer/date; PASS/FAIL; correction commit and retest.

## Running
```sh
npm install
npx playwright install chromium
npm run qa:visual
```
The CI workflow now runs the postprocessing quality gate after the Chromium sweep and archives both `results.json` and `quality-gates.json`. A workflow green check is only **automated evidence PASS**, not the overall release gate.
