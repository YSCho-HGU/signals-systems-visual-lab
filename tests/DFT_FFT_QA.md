# DFT vs FFT regression and reference datasets

## Run
```bash
npm install
npx playwright install chromium
npm run qa:dft-fft
```

Automated GitHub Actions workflow: `.github/workflows/dft-fft-regression.yml`.

## Reference signals
- `fixtures/dft-fft-vibration-64-160hz.csv`: 512 rows after header, time in seconds, sample rate 1024 Hz, normalized accelerometer-style signal with 64 Hz (amplitude 1.0) and 160 Hz (amplitude 0.35). The values are synthetic, not measured acceleration.
- The learning page can generate and download a mono 16-bit PCM WAV, sample rate 8000 Hz, length 1024 samples, with 250 Hz (0.65 amplitude) and 750 Hz (0.22 amplitude). This is an **original synthesized tone**, not recorded human speech.
- The Playwright test also generates a text-only single-frequency 32/512 cycles/sample record with **unknown** physical sample rate.

## Assertions
- Direct DFT and radix-2 FFT complex results agree within 1e-7 at N=512.
- CSV timestamp-based fs inference, peaks at 64 and 160 Hz.
- WAV decoding and peaks at 250 and 750 Hz.
- No invented Hz for sample-rate-unknown TXT input.
- Rejects an N-point frame extending beyond the available samples.
- English and Korean step descriptions, shared light/dark theme state.
- No uncaught browser page exceptions.

## Interpretation and limits
The regression covers known-bin sinusoids, not all real recordings. The top spectral peak is not necessarily the fundamental frequency; harmonic relationships are only hypotheses. Results may change with finite record length, leakage, aliasing, compression or noisy sensors. Runtime timings are not hardware-independent benchmarks.

The test needs a Playwright-compatible Chromium browser. If the CI workflow does not complete, check the Actions run logs rather than treating the existence of test files as evidence of a passing run.

## Sensor physics extension
The Discover / Upload panel supports selecting a detected peak, interpreting its frequency as a measured periodic-event rate, computing oscillation period `T=1/f`, and conditionally estimating shaft RPM as `60 f / events_per_revolution`. For the provided 64 Hz fixture, the expected period is 15.625 ms, and the conditional speeds are 3840 RPM for 1 event/revolution or 1920 RPM for 2 events/revolution. Neither value is a direct shaft speed measurement: a bearing, gear mesh, blade-pass, or structural mode may produce a different frequency. Candidate harmonics are labeled as possibilities only.

Additional Playwright assertions cover those calculations, the count-dependent RPM change, and suppression of RPM when the sample rate is unknown.

## Comprehensive QA review (2026-11-23)
- Independently executed the direct DFT and radix-2 FFT numerical kernels in Node on N=32,64,128,512,1024 synthetic two-tone records. Largest observed maximum complex coefficient discrepancy: 5.883e-11, below 1e-7.
- Improved the complexity canvas to display distinct N² and N log₂N curves, rather than a single ambiguous curve. These are growth terms, not measured instruction counts.
- Adjusted the one-sided magnitude plot to use a true zero baseline. Distinguished x-axis units from vertical signal amplitude labels.
- Allowed the uploaded sample rate to be corrected through the fₛ control, and reprocessed CSV files when time-column or CSV rate controls change.
- Added QA assertions for sample-rate override and nonempty comparison plot.

**Verification scope:** Node numerical-kernel checks were executed. Browser Playwright e2e and GitHub Actions results have not been confirmed in this review; do not treat the existence of the tests as a passing CI run.

## Guided four-step learning experience
The page now exposes a compact mission at each step: learning objective, a reproducible manipulation, a prediction/explanation question, and an opt-in answer reveal. A Next step control advances without resetting the experiment inputs.

1. **Understand:** predict the bin index (64) of a 128 Hz sinusoid with fs=1024 Hz and N=512.
2. **Observe:** compare direct DFT and FFT complex values rather than only visual magnitudes; interpret floating-point discrepancy.
3. **Experiment:** vary N to compare measured runtime against two asymptotic growth curves; direct DFT is capped at 2048 samples.
4. **Discover:** upload the provided sensor CSV, identify peaks, and distinguish conditional RPM estimates from measured shaft speed.

The regression checks stage-1 prediction, answer reveal accessibility state, stage navigation, and localized feedback. These checks are authored but browser execution success remains to be verified.

## Student-centered layout refinement
- Shortened title/introduction area and tightened step navigation and mission cards to place experimentation earlier on screen.
- Stage 1 retains the DFT formula explanation; later stages hide it, without removing the learning-mission question and optional answer reveal.
- Waveform and spectrum remain side by side on desktop and stack on narrow screens.
- Discover's file controls and reference-dataset controls are moved into the signal workspace immediately above the paired graphs, while peak interpretation and RPM remain underneath.
- Added responsive Playwright checks for presence of file controls, a short control-to-chart gap, appropriate hiding on other stages, and no mobile horizontal overflow.
- HTML inline script parse check was performed successfully; actual Chromium visual regression remains unverified in this environment.

## Step-specific information hierarchy
- Step 1 (Understand): input controls, waveform, spectrum and DFT definition; no runtime or complexity panels.
- Step 2 (Observe): spectrum and complex direct-DFT-vs-FFT error; no time plot, elapsed-time metrics or complexity chart.
- Step 3 (Experiment): record length, measured runtimes, and N² vs N log₂N growth curves; no time/spectrum plots. Direct DFT is capped at 2048 points.
- Step 4 (Discover): upload controls, sample-rate correction, waveform/spectrum, peak table, and conditional physical units; no DFT/FFT timing cards.

The Playwright regression now asserts step-specific visibility. Inline JavaScript syntax compilation succeeded. Actual Chromium end-to-end execution was not available because the execution environment could not resolve github.com; browser pass status remains unverified.

## Stage 1 synchronized frequency-axis explorer
The beginner screen defaults to one pure tone. It presents dual frequency scales (DFT bin index k and physical Hz), plus four linked quantities:
- Δf = fs/N,
- fNyquist = fs/2,
- observation duration T = N/fs,
- predicted tone bin k = fN/fs.

Comparison controls double N or fs independently, or reset to N=512, fs=1024 Hz, f=128 Hz. At baseline: Δf=2 Hz, Nyquist=512 Hz, T=0.5 s, and k=64. Doubling N gives Δf=1 Hz, T=1 s, k=128. Doubling fs instead gives Δf=4 Hz, Nyquist=1024 Hz, T=0.25 s, k=32. A noninteger-bin tone triggers a rectangular-window spectral leakage explanation; a tone above Nyquist triggers an aliasing warning.

The new regression assertions check these values and step-specific visibility. Static inline-JavaScript syntax compilation passed after the change. Full headless Chromium tests have been authored but their success has not been verified in this session.

## N-observation versus FFT zero-padding — Stage 1 (2026-11-23)
A two-panel matched-grid comparison was added under the main time-domain and spectrum graphs.

- **Actual longer record:** generate 2N real samples at fixed fs, compute a 2N-point FFT and normalize one-sided amplitude by 2N.
- **Zero-padding:** keep the same original N real samples, append N zeros, compute a 2N-point FFT and normalize by N.
- Both FFT grids have displayed spacing fs/(2N), but only the 2N-observation case has 2N/fs observation time and improved nominal physical frequency resolution (1/T). Padding interpolates the finite-record spectrum and does not resolve closer frequencies.
- 128 Hz is a coherent-bin demonstration at baseline fs=1024 and N=512; 129 Hz is an off-bin example that helps students see leakage and differing spectral widths.
- Safety: comparison restricts N to 8192; if N exceeds the cap, the two additional plots are cleared rather than showing stale results.
- Playwright assertions were added for both observation durations, identical displayed FFT spacing, off-bin/coherent presets, the absence of comparison panels in stage 2, and spectrum rendering.
- Inline JS syntax was checked successfully. A full Playwright/Chromium end-to-end passing run has not been confirmed.

## Original versus zero-padded spectrum overlay (Stage 1)
The page now includes an observation-vs-padding comparison table and an overlaid spectrum beneath the two comparison panels. Gold dots show the N-point FFT of the original N samples. The cyan curve shows the 2N-point FFT of the same samples followed by N zeros. Both spectra use amplitude normalization N and share the same physical Hz axis. The overlay zooms around the selected tone.

Every original coefficient X_N[k] matches the padded FFT coefficient X_2N[2k] within floating-point error. The UI reports maximum amplitude difference at those common bins. This is evidence that zero-padding fills in intermediate frequency samples but does not create new measurements or improve frequency resolving power.

The two displayed 2N-point grids have equal interval fs/(2N), but the real-2N observation has duration 2N/fs while the padded-N observation retains N/fs. Thus nominal resolution scales differ: fs/(2N) versus fs/N. 128 Hz and 129 Hz presets illustrate on-bin and off-bin cases.

Playwright regression assertions now check the table values, overlaid-plot visibility, nonempty canvas and original-bin agreement. Inline JavaScript syntax check passed; a complete browser QA run has not been confirmed.
