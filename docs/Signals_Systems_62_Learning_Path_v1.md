# Signals & Systems Chapter 1–8 — 62-Experiment Learning Path v1.0

**Audience:** 2nd-year university Signals & Systems learners.  
**Source evidence:** Exact experiment titles and order were extracted from the eight existing embedded Chapter HTML programs in `index.html` (62 total), not invented or reconstructed from a textbook table of contents.  
**Recommendation:** 42 core (필수 권장) / 20 advanced (선택 심화). This is a **pedagogical recommendation awaiting instructor approval**, not an official grading or prerequisite policy.

## Selection rationale

- **Core**: exercises that are indispensable for the chapter's central signal interpretation, defining transformation, system property, or fundamental proof/derivation.
- **Advanced**: optional engineering applications, numerical edge cases, secondary transform demonstrations, or extensions that can follow the core explanation.
- Core does not imply mastery from clicking: students should **predict → change one parameter → inspect graph/value → explain reason**.
- Every experiment stays freely available. A student may open any item directly and the previous learning content is not deleted.
- The site lists recommended paths in a collapsible Chapter guidance panel. Experiment buttons link to existing Chapter navigation; no numerical algorithms were altered.

## Chapter-by-chapter index

## Chapter 1

**Core learning goal:** 신호의 표현과 기본 연산을 해석하고, 시스템 성질을 신호로 검증합니다.

| # | Experiment (source title) | Recommended level |
|---|---|---|
| 1 | Continuous-Time vs Discrete-Time Signals | Core / 필수 권장 |
| 2 | Elementary Signals · Step, Impulse, Ramp | Core / 필수 권장 |
| 3 | Time Transformation Explorer | Core / 필수 권장 |
| 4 | Sinusoids & DT Periodicity | Core / 필수 권장 |
| 5 | Energy vs Average Power Analyzer | Core / 필수 권장 |
| 6 | System Properties · Definition Tester | Core / 필수 권장 |
| 7 | Even & Odd Decomposition | Advanced / 선택 심화 |
| 8 | Signal Operations · Add, Multiply, Differentiate | Advanced / 선택 심화 |
| 9 | Real-World Signal Explorer · Four Models | Advanced / 선택 심화 |

## Chapter 2

**Core learning goal:** LTI 시스템의 임펄스 응답과 컨벌루션 계산을 시간축·범위와 연결합니다.

| # | Experiment (source title) | Recommended level |
|---|---|---|
| 1 | Impulse Decomposition and LTI Response / 임펄스 분해와 LTI 응답 | Core / 필수 권장 |
| 2 | Flip → Shift → Multiply → Sum / 이산 컨벌루션의 네 단계 | Core / 필수 권장 |
| 3 | Predict Convolution Support / 출력 범위 예측 | Core / 필수 권장 |
| 4 | Rectangular-Pulse Convolution / 사각 펄스의 겹침 면적 | Core / 필수 권장 |
| 5 | Convolution of Two Causal Exponentials / 인과 지수함수의 컨벌루션 | Advanced / 선택 심화 |
| 6 | RC Low-Pass Pulse Response / RC 저역통과 응답 | Advanced / 선택 심화 |
| 7 | Moving-Average Sensor Filter / 센서 신호 평활화 | Advanced / 선택 심화 |
| 8 | LTI Interconnections / 직렬·병렬 시스템 연결 | Advanced / 선택 심화 |
| 9 | Causality and BIBO Stability / 인과성과 BIBO 안정성 | Core / 필수 권장 |

## Chapter 3

**Core learning goal:** 주기 신호를 Fourier 계수와 합성 파형으로 표현하고 CTFS/DTFS를 연결합니다.

| # | Experiment (source title) | Recommended level |
|---|---|---|
| 1 | Harmonically Related Sinusoids / 조화 정현파 | Core / 필수 권장 |
| 2 | CTFS of a Periodic Pulse / 주기 펄스의 CTFS | Core / 필수 권장 |
| 3 | Fourier Partial Sums and Gibbs / 부분합과 깁스 현상 | Core / 필수 권장 |
| 4 | Time Shift Changes Phase / 시간 이동과 위상 | Core / 필수 권장 |
| 5 | Discrete-Time Fourier Series / 이산시간 푸리에 급수 | Core / 필수 권장 |
| 6 | LTI Eigenfunctions and RC Filtering / 시스템 응답 | Advanced / 선택 심화 |
| 7 | Value at a Jump / 불연속점의 수렴값 | Advanced / 선택 심화 |

## Chapter 4

**Core learning goal:** CTFT의 정의·기본 변환쌍·이동 및 시스템 응용을 시간·주파수 관점에서 비교합니다.

| # | Experiment (source title) | Recommended level |
|---|---|---|
| 1 | From Fourier Series to CTFT / 선에서 연속 스펙트럼으로 | Core / 필수 권장 |
| 2 | Rectangular Pulse and Signed Sinc / 펄스와 sinc | Core / 필수 권장 |
| 3 | Exponential Decay and Spectrum / 지수 감쇠 | Core / 필수 권장 |
| 4 | Shift, Width and Phase / 이동·폭·위상 | Core / 필수 권장 |
| 5 | Signed X(jω) versus \|X(jω)\| / 스펙트럼 읽기 | Core / 필수 권장 |
| 6 | Convolution and RC Lowpass / 필터의 시간·주파수 | Core / 필수 권장 |
| 7 | Modulation and Spectral Copies / 변조와 이동 | Advanced / 선택 심화 |
| 8 | Numerical CTFT from Samples / 적분의 수치 근사 | Advanced / 선택 심화 |

## Chapter 5

**Core learning goal:** Laplace 변환의 ROC와 극점·안정성 및 역변환의 의미를 이해합니다.

| # | Experiment (source title) | Recommended level |
|---|---|---|
| 1 | Fourier → Laplace / 변환의 확장 | Core / 필수 권장 |
| 2 | ROC & Signal Direction / 신호 방향 | Core / 필수 권장 |
| 3 | Laplace Transform Pairs / 변환쌍 | Advanced / 선택 심화 |
| 4 | Transform Properties / 변환 성질 | Core / 필수 권장 |
| 5 | Inverse Laplace & ROC / 역변환 | Core / 필수 권장 |
| 6 | Pole · Zero · Stability / 안정성 | Core / 필수 권장 |
| 7 | First-Order RC System / 1차 시스템 | Advanced / 선택 심화 |
| 8 | Second-Order Response / 2차 응답 | Advanced / 선택 심화 |

## Chapter 6

**Core learning goal:** DTFT의 주기성, 이동, 변환쌍과 필터의 주파수응답을 해석합니다.

| # | Experiment (source title) | Recommended level |
|---|---|---|
| 1 | Digital Frequency / 디지털 주파수 | Core / 필수 권장 |
| 2 | DTFT Transform Pairs / 변환쌍 | Core / 필수 권장 |
| 3 | Time Shift & Phase / 위상 | Core / 필수 권장 |
| 4 | Phasor Summation / 복소 벡터 합 | Advanced / 선택 심화 |
| 5 | Digital Filtering / 디지털 필터링 | Core / 필수 권장 |
| 6 | DFT · FFT · Leakage / 누설 | Advanced / 선택 심화 |

## Chapter 7

**Core learning goal:** 샘플링 정리·스펙트럼 반복·앨리어싱·복원 원리를 설명합니다.

| # | Experiment (source title) | Recommended level |
|---|---|---|
| 1 | 7.1 · Sampling Theorem / 표본화 정리 | Core / 필수 권장 |
| 2 | 7.2 · Spectral Replication / 스펙트럼 복제 | Core / 필수 권장 |
| 3 | 7.3 · Aliasing / 서로 다른 주파수, 같은 표본 | Core / 필수 권장 |
| 4 | 7.4 · Sinc Reconstruction / 이상적 복원 | Core / 필수 권장 |
| 5 | 7.5 · Anti-Aliasing Filter / ADC 이전 필터 | Core / 필수 권장 |
| 6 | 7.6 · Sampling vs Quantization / ADC 분해능 | Advanced / 선택 심화 |
| 7 | 7.7 · Zero-Order Hold vs Ideal Reconstruction | Advanced / 선택 심화 |

## Chapter 8

**Core learning goal:** Z변환의 ROC·역변환·극점/영점과 인과성·안정성의 관계를 판단합니다.

| # | Experiment (source title) | Recommended level |
|---|---|---|
| 1 | 8.1 · Why the Z-Transform? / 복소 z-평면 | Core / 필수 권장 |
| 2 | 8.2 · Same X(z), Different ROC / 좌우 수열 | Core / 필수 권장 |
| 3 | 8.3 · Two-Sided Signals / 고리형 ROC | Core / 필수 권장 |
| 4 | 8.4 · Inverse Z-Transform / 역변환 | Core / 필수 권장 |
| 5 | 8.5 · Pole Location & Frequency Response | Core / 필수 권장 |
| 6 | 8.6 · FIR Moving Average / 영점과 노치 | Advanced / 선택 심화 |
| 7 | 8.7 · Causality & BIBO Stability / 안정성 | Core / 필수 권장 |
| 8 | 8.8 · Digital Sensor Smoother / 차분방정식 | Advanced / 선택 심화 |


## Proposed essential competency evidence

- **Chapter 1**: explain CT vs DT sampling distinctions and verify time shift/compression and periodicity.
- **Chapter 2**: calculate and identify convolution range and demonstrate one complete flip–shift–multiply–sum example.
- **Chapter 3**: predict how pulse duty cycle and partial-sum order affect Fourier coefficients and Gibbs phenomenon.
- **Chapter 4**: relate CTFS spacing to CTFT and explain time shift, scaling and signed-vs-magnitude spectrum.
- **Chapter 5**: specify ROC with the Laplace transform, relate pole location to causality and stability.
- **Chapter 6**: explain DTFT 2π-periodicity, time shift and simple digital filtering.
- **Chapter 7**: justify aliasing and Nyquist rate with an explicit sampling example, and understand ideal reconstruction.
- **Chapter 8**: distinguish identical Z-transform algebra with different ROCs, analyze inverse transform and BIBO stability.

## UX acceptance points

1. Open Chapter; see goal and core count before experiments.
2. Expand core list and select a named experiment.
3. Observe the **same existing** experiment in the iframe (not a new model).
4. Return to chapter index or select an advanced item without losing access.
5. Check selected navigation, keyboard focus and graph probe at desktop and mobile.
6. Avoid imposing a progress percentage or grade based only on route clicks.

## Validation limits

The 62-source experiment catalog, 8 chapter-level goals, unique order/index data and core/advanced classification were inspected at source level. Real student learning effectiveness and live-browser visual state are separate requirements.  
