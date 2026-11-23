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
