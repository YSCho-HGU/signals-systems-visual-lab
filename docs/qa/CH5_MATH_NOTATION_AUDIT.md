# Chapter 5 — Laplace Math Notation & Correctness Audit

Date: 2026-11-21  
Scope: the eight interactive Laplace labs in `chapter5.html` and the canonical formula models in `assets/ss-ch5-math.js`.

## Canonical rendering rules

- The canonical source of the four Guided Derivation equations and hero formula is `assets/ss-ch5-math.js`. Lesson narrative data supplies headings and explanations, not a competing rendered formula.
- A pole or zero at negative \(a\) appears as \(s+a\), not \(s-(-a)\). A positive root \(a\) appears as \(s-a\), and a root at 0 as \(s\).
- Avoid unnecessary parentheses around a standalone \(s\). Use parentheses for nontrivial product factors; a repeated pole at \(-4\) has \((s+4)^2\).
- Render negative exponential weights and shifts naturally. Example: \(b=-0.60\) yields \(Y(s)=X(s+0.60)\), not \(X(s-(-0.60))\).
- Display zero in the requested numerical precision rather than \(-0.00\).
- Use \(\operatorname{Re}(s)\), \(\omega\), \(\sigma\), \(\tau\), and \(\zeta\) in typeset formulas. State a ROC alongside each relevant rational expression.
- A causal rational system’s ROC is strictly to the right of its *uncancelled* poles. A pole/zero cancellation is algebraic and does not by itself establish internal state stability.

## Audited concepts by experiment

| Lab | Core formula / principle | Verification |
| --- | --- | --- |
| 01 Fourier to Laplace | \(F(T)=\int_0^T e^{-\sigma t}\,dt\); \(X(s)=1/s\) only for \(\operatorname{Re}(s)>0\) for \(u(t)\) | finite integral validated against numerical quadrature for \(\sigma<0\), \(=0\), \(>0\); zero and negative signs normalized |
| 02 ROC & signal direction | The same \(1/(s+a)\) is right-sided for \(\operatorname{Re}(s)>-a\) and left-sided for \(\operatorname{Re}(s)<-a\) | left-sided inverse has the required minus sign; inequality direction verified |
| 03 Transform pairs | Impulse, step, decaying exponential, finite pulse, damped cosine | five branches checked, including removable singularity at \(s=0\) for finite pulse |
| 04 Transform properties | delay: \(Y(s)=e^{-st_0}X(s)\); weighting: \(Y(s)=X(s-b)\) | signed \(b\) cases checked including negative, positive, zero and pole location; no \(s-(-b)\) |
| 05 Inverse Laplace | \(1/[(s+1)(s+4)]=(1/3)[1/(s+1)-1/(s+4)]\) | numeric partial fraction identity and all three ROC/time-direction branches |
| 06 Pole, zero & stability | \(H(s)=(s-z)/[(s-p)(s+4)]\) with simplified factors | negative/positive/zero roots and repeated roots; exact cancellation identity checked; reduced transfer function governs BIBO |
| 07 First-order RC | \(H(s)=1/(\tau s+1)\), \(\omega_c=1/\tau\) | separate step and pulse branches, pulse superposition identity at multiple \(\tau\) and \(t\) values |
| 08 Second-order response | \(p_{1,2}=-\zeta\omega_n\pm j\omega_n\sqrt{1-\zeta^2}\) for \(0<\zeta<1\); real roots for \(\zeta\ge1\) | roots substituted into characteristic polynomial for under-, critically and overdamped cases |

## Test and compatibility

- `tests/ch5-math-contract.mjs`: assertions across formulas, parameter branches, sign formatting, brace balance, and independent numerical algebra/ODE identities.
- `tests/ch5-prose-math-qa.mjs`: opens all 8 labs in Chromium, checks the actual KaTeX markup and the four Guided Derivation steps.
- Existing Chapter 5 viewport and Chapter 5/6 theme-regression tests continue to protect interaction and screen layout.
- The updated Math.js filename version in `chapter5.html` protects Edge against stale cached formulas.

**Boundaries:** Tests verify current implemented models and their stated assumptions. In particular, transfer-function pole-zero cancellation does not imply internal state stability, and a pulse response must not be presented as if its entire trajectory were a step response. The amplitude and periodicity of a graphical cursor depend on selected lab parameters.
