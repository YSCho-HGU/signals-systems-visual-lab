# Signals & Systems — Interactive Learning Enhancement (2026-11-16)

## Delivery overview

This update extends the existing 62-experiment Signals & Systems Visual Learning Studio. Existing chapter simulations and textbook mathematical models remain intact; the new controls run alongside the legacy interface.

| Requested improvement | Implemented | Notes |
|---|---|---|
| Sonification | Yes, supplemental Chapter 3 and Chapter 6 controls | Web Audio API, user-click playback only, stop control, about 2-second synthetic signal playback, no copyrighted recordings |
| Local learning progress | Yes | Student explicitly marks reviewed/unreviewed for each existing experiment; storage `els-ss-lab-progress-v1` |
| Real-world use cases | Yes, educational examples | Ch1 synthetic ECG-like waveform, Ch3 harmonic timbre, Ch6 synthetic noisy signal with low/high-pass filtering; never presented as real patient/sensor measurements |
| Mobile fine control | Partially | +/− accessible step controls added beside existing range sliders in iframe lessons; existing canvas touch/zoom interactions unchanged. Real-device pinch-to-zoom QA still required |
| Wrong-answer feedback | Yes for new chapter-level Predict & Check checks; partial for legacy questions | One calibrated numeric question per Ch1–8; wrong inputs return 2 levels of conceptual hints. Existing diverse quiz implementations are not all connected to an automatic grader; a generic chapter hint is always available |

## Experiment progress semantics

- Existing recommended course pathway: 9+9+7+8+8+6+7+8 = **62 labs**.
- Stable lab IDs: `chapter:experimentIndex` (e.g. `3:2`) where numbering follows the existing chapter experiment list.
- Storage: `localStorage["els-ss-lab-progress-v1"] = ["1:1", "3:2", ...]`.
- The progress record is an **explicit self-reported lesson review**. It must never be represented as correct understanding, exam success or verified code execution.
- Data are validated on read; invalid / unknown lab IDs are ignored. No network requests or student records are sent to GitHub.
- Saved data are same-origin browser-local. They can be lost on browser data clearing, and do not follow a student to another device automatically.
- The Engineering Learning Studio read-only dashboard (`/engineering-learning-studio/progress/`) now reads the same key and shows total 62 and 8 chapter subtotals.

## Audio and signal examples

- Playback is opt-in by direct click. Audio starts quietly, ramps in/out to reduce clicks, is brief, and has an explicit Stop button.
- Ch3: the synthesized wave uses an odd-harmonic sum with amplitude proportional to 1/k, demonstrating timbre; learners can change the number of harmonics.
- Ch6: same original harmonic source passes through a low-pass or high-pass Web Audio Biquad filter; the parallel static chart shows a separate educational FIR-filter computation. **The audio and chart are related demonstrations, not identical filter implementations.**
- Ch1: an invented ECG-like pulse is filtered for teaching; no patient data, no medical interpretation.
- Accessibility: canvas has an accessible label; the signal is always accompanied by control and text descriptions. No audio autoplays or microphone permission is requested.

## Predict & Check

Independent short numeric questions cover:
1. CT sinusoid period
2. Discrete convolution
3. Harmonic frequency
4. CTFT time-shift magnitude
5. Laplace ROC
6. DTFT frequency periodicity
7. Nyquist limit
8. Causal Z-transform ROC

Incorrect inputs show a principle clue on first attempt and a more specific clue on repeated attempts. Numeric answers are checked with a small absolute tolerance; this activity is an *ungraded practice aid* and does not write a grade or a completion record. It does not automatically evaluate arbitrary mathematical answers in existing iframe experiments.

## Mobile UX

- Fine adjustment controls operate the same range input as its existing slider, dispatching native `input` and `change` events.
- Large 40px tap buttons and 44px responsive supplemental controls improve accessibility.
- No unverified pinch-to-zoom override is installed, because doing so can break graph-coordinate selection and existing experiment gestures.
- Further real-device testing is required for iOS Safari and Android Chrome (zoom, pointer sampling, fine sliders, responsive panels, orientation changes).

## Acceptance QA

1. Run the site and visit all 8 chapters; choose different experiments from the chapter sidebar. Mark a lab reviewed, unmark it and reload; the count should update and never exceed 62.
2. Visit the Studio progress dashboard in the same browser profile; the count and chapter totals should agree with SS. Confirm C evidence metrics are unchanged.
3. Test ENG, Korean and mixed modes; review labels, challenge feedback, screen-reader labels and audio buttons.
4. Play a 3-harmonic and 9-harmonic tone in Chapter 3; listen to the difference; test stop and navigation to another chapter.
5. In Chapter 6, vary cutoff and low/high-pass mode. Confirm both the synthetic waveforms and optional audio respond.
6. In Chapter 1, confirm ECG-like data is explicitly described as **synthetic** and **not diagnostic**.
7. Check two wrong predictions and then a right prediction in each chapter. Ensure the original lab's own quiz and input state remain unaffected.
8. Test touch stepper buttons on narrow screens; preserve keyboard and numeric slider input. Verify that no old graph gesture is obstructed.
9. Repeat in neutral-dark and warm-neutral themes, including color contrast and focus states.
10. Validate GitHub Pages deployment, open browser console, and inspect errors. No successful browser E2E or device-level pinch test is claimed by this source-level update.

## Files

- `assets/ss-progress.js`: progress controls, sidebar markers and Home progress link
- `assets/ss-applications.js`: harmonics, audio, synthetic cases and waveform display
- `assets/ss-learning-aids.js`: chapter hints, numeric Predict & Check, fine slider controls
- `assets/ss-learning-path.js`: keep sidebar active experiment selection in sync
- `index.html`: load the three new modules
- Studio `progress/index.html` and `progress/dashboard.js`: read-only SS summary
