# Signals & Systems — Future Applications collection (design contract)

Status: **Planned; not an active chapter.** Do not expose incomplete labs as published lessons.

## Purpose
Apply the concepts of Chapters 1–8 to authentic engineering problems in audio/speech, signals/IoT, images/video, communications and control. The collection supplements — rather than duplicates — the foundational interactive exercises and Learning Map.

## Case structure (not Predict–Change–Observe–Explain)
1. **Problem Definition** — Engineering context, real-world objective, constraints, assumptions, units and success criteria. Name real/simulated datasets.
2. **Theory Applied** — Explicit links to source lessons, transform choice, hypotheses, equations and conditions of validity (including ROC or sampling assumptions).
3. **Solution Process** — Reproducible data pipeline, parameter selection, algorithms/code, processing stages and intermediate checks.
4. **Results** — Before/after signals and spectra, quality measurements, quantitative interpretation, plots with axes/units, optional audio/video comparisons, error and uncertainty.
5. **Reflection** — Limitations, alternative approaches, trade-offs, failure cases, and extensions.

## Core UX and technical rules
- Use Chapter 5's shared site header, language/theme controls, keyboard navigation and readable typography.
- Retain five themes: Neutral Dark, Warm Dark, Navy Dark, Warm Neutral, White Clean.
- Render mathematical expressions with the existing KaTeX/shared math conventions and retain accessible fallbacks.
- Graphs and images must be responsive, labeled with correct units, use theme-adjusted surfaces, and distinguish signal data from analytical predictions.
- Use interactive side-by-side before/after views where beneficial; allow sound playback only on user interaction and make mute/stop explicit.
- Protect page loading, localStorage progress and existing Chapter 1–8 simulations against regressions.
- Do not publish a top-level Applications link until at least one complete validated case exists.

## Suggested case families
- **Signal / IoT:** sensor noise removal, moving-average FIR vs one-pole IIR, sampled accelerometers, RC and discrete models.
- **Audio / speech:** harmonics and timbre, aliasing, low/high-pass filtering, short-time FFT and spectrogram interpretation.
- **Image / video:** 2-D spatial sampling and moire, image filtering, discrete Fourier spectrum; basic frame sampling and temporal aliasing.
- **Communications:** sampled IQ signals, modulation, OFDM/FFT, synchronization and interference.
- **Control / biomedical:** sampled feedback, resonance, ECG/EEG demonstration with clearly identified synthetic or de-identified data.

## Review checklist
A case is complete only when the engineering question, dataset license and provenance, applicable theory, reproducible process, interpreted results, reflection, accessibility, and scientific correctness are all verified.
