/* Shared, state-preserving language presentation for Chapter 1–8.
 * Translates explicitly bilingual fragments and common instructional labels.
 * Unpaired prose is never erased or guessed: author translations with data-i18n-*.
 */
(function(){
'use strict';
if(!window.ELSLanguage)return;
const saved=new WeakMap();
const dictionary={
 'Predict':'예측하기','Change':'변경하기','Observe':'관찰하기','Explain':'설명하기',
 'Prediction':'예측','Observation':'관찰','Explanation':'설명',
 'Reset':'초기화','Reset Lab':'실습 초기화','Try it':'직접 실험하기',
 'Check Yourself':'스스로 확인하기','Learning Objective':'학습 목표',
 'Learning Objectives':'학습 목표','Key idea':'핵심 개념',
 'Why it matters':'왜 중요한가?','What to notice':'관찰 포인트',
 'Previous':'이전','Next':'다음','Input':'입력','Output':'출력',
 'Experiment':'실험','Experiments':'실험','Interactive Lab':'대화형 실습',
 '예측하기':'Predict','변경하기':'Change','관찰하기':'Observe','설명하기':'Explain',
 '초기화':'Reset','실습 초기화':'Reset Lab','스스로 확인하기':'Check Yourself',
 '학습 목표':'Learning Objectives','핵심 개념':'Key idea',
 '관찰 포인트':'What to notice',
 '목차 접기':'Collapse contents','목차 펼치기':'Expand contents',
 '오류 제보':'Report an issue','해설 보기':'Reveal explanation',
 '시간 신호':'Time-domain signal','복소평면':'Complex plane',
 '이산 표본':'Discrete samples','계산 표본 (보간 없음)':'Computed samples (no interpolation)',
 'f(x) 직접 계산':'Direct evaluation of f(x)',
 'ROC 내부 (boundary excluded)':'Inside ROC (boundary excluded)',
 'ROC 외부 또는 경계':'Outside ROC or on boundary',
 '표시 범위 밖':'Outside display range',
 '복소평면 좌표':'Complex-plane coordinates','그래프 값 읽기':'Read graph values',
 '수식 함수가 제공된 경우 커서 x에서 직접 계산한 값입니다.':'When a formula is available, the value is evaluated directly at the cursor position x.',
 '복소평면 좌표는 위치값이며, pole/zero는 가까운 경우에만 표시합니다.':'Complex-plane coordinates indicate position; poles and zeros appear only when nearby.',
 '원래 신호':'Original signal','변환된 신호':'Transformed signal',
 '수렴영역':'Region of convergence','극점':'Pole','영점':'Zero',
 '신호와 시스템':'Signals and Systems','예측은 자기 점검용이며 채점되지 않습니다':'Predictions are for self-checking and are not graded.'
};
const authoredTranslations={
 "가중 인자 e^(−σt)가 적분의 수렴 여부를 어떻게 바꾸는지 확인합니다. (교재 §5.1)": "Examine how the exponential weighting factor e^(−σt) affects convergence of the integral (Section 5.1).",
 "x(t)=u(t)에 대해 σ=0이면 왜 일반적인 양방향 Laplace 적분이 수렴하지 않을까요?": "For x(t)=u(t), why does the bilateral Laplace integral fail to converge when σ=0?",
 "σ=0, ω=0에서 적분 ∫₀^∞1dt가 발산합니다. u(t)의 양방향 Laplace 변환 X(s)=1/s는 Re(s)>0에서만 수렴합니다. ROC에는 경계 σ=0이 포함되지 않습니다.": "At σ=0 and ω=0, the integral ∫₀^∞1dt diverges. The bilateral Laplace transform X(s)=1/s of u(t) converges only when Re(s)>0; the boundary σ=0 is excluded from the ROC.",
 "같은 유리함수라도 ROC가 달라지면 시간 신호의 방향과 모양이 달라집니다. (교재 §§5.2, 5.4)": "Even with the same rational expression, different ROCs yield different time-domain signals and sidedness (Sections 5.2 and 5.4).",
 "X(s)=1/(s+1)만 주어졌을 때 x(t)를 하나로 결정할 수 있나요?": "Can X(s)=1/(s+1) alone uniquely determine x(t)?",
 "결정할 수 없습니다. Re(s)>−1이면 e^(−t)u(t), Re(s)<−1이면 −e^(−t)u(−t)입니다. 두 경우의 대수식은 같지만 수렴영역과 시간 방향이 다릅니다.": "No. Re(s)>−1 corresponds to e^(−t)u(t), while Re(s)<−1 corresponds to −e^(−t)u(−t). The algebraic expressions match, but the ROCs and time-domain sidedness differ.",
 "정의·적분구간·극점·ROC를 함께 관찰합니다. (교재 §5.3)": "Examine the definition, integration limits, poles, and ROC together (Section 5.3).",
 "유한 길이 직사각형 펄스의 X(s)=(1−e^(−sT))/s에서 s=0이 pole인가요?": "For a finite rectangular pulse with X(s)=(1−e^(−sT))/s, is s=0 a pole?",
 "아닙니다. s=0에서 분자와 분모가 함께 0이 되고 극한값은 T입니다. 이는 제거 가능한 특이점이며 ROC는 전체 유한 s-평면입니다.": "No. The numerator and denominator both vanish at s=0, and the limit is T. The singularity is removable, and the ROC is the entire finite s-plane.",
 "시간 지연과 지수 가중치를 구별합니다. 하나는 ROC를 유지하고, 다른 하나는 pole과 ROC를 이동시킵니다. (교재 §5.5)": "Distinguish time delay from exponential weighting: one preserves the ROC; the other shifts the poles and ROC (Section 5.5).",
 "시간 지연 x(t−t₀)과 e^(bt)x(t)가 ROC에 미치는 영향은 각각 무엇인가요?": "How do time delay x(t−t₀) and multiplication by e^(bt) affect the ROC?",
 "유한한 시간 이동은 e^(−st₀)만 곱하고 ROC를 그대로 유지합니다. 반면 e^(bt) 곱셈은 X(s−b)가 되어 모든 pole과 ROC가 실수축으로 b만큼 이동합니다.": "A finite time shift multiplies the transform by e^(−st₀) without changing the ROC. Multiplication by e^(bt) yields X(s−b), shifting the poles and ROC by b along the real axis.",
 "부분분수 결과를 ROC와 결합하면 한 대수식에서 세 가지 시간 신호가 나타납니다. (교재 §§5.4, 5.6)": "Combining partial fractions with an ROC can give three different time-domain signals from one rational expression (Sections 5.4 and 5.6).",
 "−4<Re(s)<−1의 ROC에서는 왜 양쪽 방향 신호가 생기나요?": "Why does the ROC −4<Re(s)<−1 produce a two-sided signal?",
 "1/(s+1) 항은 ROC가 −1보다 왼쪽이므로 −e^(−t)u(−t)로, −1/(s+4) 항은 ROC가 −4보다 오른쪽이므로 −e^(−4t)u(t)로 해석됩니다. 각 항의 ROC의 교집합이 (−4,−1)입니다.": "The term 1/(s+1) uses a left-sided inverse −e^(−t)u(−t), while −1/(s+4) uses the right-sided inverse −e^(−4t)u(t). Their ROCs intersect in the strip (−4,−1).",
 "Pole과 zero를 움직여 인과 LTI 시스템의 임펄스 응답과 BIBO 안정성을 판단합니다. (교재 §5.7)": "Move poles and zeros to examine the impulse response and BIBO stability of a causal LTI system (Section 5.7).",
 "양의 실수부에 pole이 있어도 zero와 정확히 상쇄되면 안정성 판단은 어떻게 달라질까요?": "How does an exact pole-zero cancellation in the right half-plane affect a stability conclusion?",
 "약분되지 않은 분모만 보고 안정성을 판단하면 안 됩니다. 정확히 상쇄된 pole은 전달함수의 진정한 pole이 아니므로 reduced H(s)의 활성 pole과 ROC를 사용합니다. 실제 내부 상태 안정성은 별도 문제일 수 있습니다.": "Do not infer input-output stability from an uncancelled denominator alone. An exactly cancelled pole is not a pole of the reduced transfer function: use the remaining poles and ROC. Internal-state stability is a separate question.",
 "한 개의 pole로 충전 속도, 63.2% 시간, 차단 주파수 및 위상을 예측합니다. (교재 §§5.8, 5.10, 5.11)": "Use a single pole to predict charging speed, the 63.2% rise time, cutoff frequency, and phase (Sections 5.8, 5.10, 5.11).",
 "τ가 2배 커지면 충전 속도와 차단 주파수는 어떻게 되나요?": "If τ doubles, how do charging speed and cutoff frequency change?",
 "충전 속도는 느려집니다. 63.2%에 도달하는 시간 τ는 2배가 되고, 차단 각주파수 ωc=1/τ는 절반이 됩니다. pole은 허수축에 더 가까워집니다.": "Charging becomes slower: the time to reach 63.2% doubles, the cutoff angular frequency ωc=1/τ is halved, and the pole moves closer to the imaginary axis.",
 "ζ와 ωₙ을 조절하여 under/critical/over damping을 비교합니다. (교재 §§5.9, 5.11)": "Vary ζ and ωₙ to compare underdamped, critically damped, and overdamped responses (Sections 5.9 and 5.11).",
 "복소 켤레 pole의 실수부와 허수부는 각각 어떤 물리적인 의미를 갖나요?": "What do the real and imaginary parts of complex-conjugate poles represent physically?",
 "실수부(−ζωₙ)는 감쇠의 지수 속도이며, 허수부(±ωₙ√(1−ζ²))는 감쇠된 진동 각주파수입니다. ζ가 1 이상이면 pole들이 실수축에 놓이고 자유 진동이 사라집니다.": "The real part −ζωₙ controls exponential decay, while the imaginary part ±ωₙ√(1−ζ²) gives the damped oscillation frequency. For ζ≥1 the poles are real and the free response does not oscillate.",
 "정수 주기와 비정수 주기 관측을 비교하고, Hann window와 zero padding이 스펙트럼에 주는 영향을 확인합니다.": "Compare integer- and non-integer-cycle observations and examine how the Hann window and zero padding affect the spectrum.",
 "N=512, fs=128 Hz일 때 4.00 Hz와 4.15 Hz의 차이는 무엇인가요? Hann window와 zero padding은 leakage를 제거하나요?": "For N=512 and fs=128 Hz, how do 4.00 Hz and 4.15 Hz differ? Do the Hann window and zero padding eliminate spectral leakage?",
 "4.00 Hz는 16주기가 관측되어 DFT bin k=16과 일치합니다. 4.15 Hz는 16.6주기로 DFT 주파수 격자 사이에 놓여 여러 bin에 값이 나타납니다(leakage). Hann window는 먼 sidelobe를 줄이는 대신 중심 main lobe를 넓히며, zero padding은 동일한 유한 신호의 스펙트럼을 더 촘촘하게 표시할 뿐 측정 정보는 늘리지 않습니다.": "A 4.00 Hz tone completes 16 cycles and aligns with DFT bin k=16. A 4.15 Hz tone completes 16.6 cycles and leaks across bins. A Hann window lowers distant sidelobes but broadens the main lobe; zero padding samples the same finite-data spectrum more densely without adding information.",
 "같은 아날로그 정현파를 서로 다른 sampling rate로 관찰합니다. 시간축은 항상 0–0.20 s로 고정합니다.": "Observe the same analog sinusoid at different sampling rates. Keep the time axis fixed at 0–0.20 s.",
 "시간 샘플링이 주파수축에서 스펙트럼의 반복을 만드는 이유를 관찰합니다. 주파수축은 −500~500 Hz로 고정합니다.": "Observe why time-domain sampling causes periodic copies of a spectrum in frequency. Keep the frequency axis at −500 to 500 Hz.",
 "아날로그 원래 파형과 alias 파형이 다르지만 표본 지점에서는 일치하는 현상을 관찰합니다. 시간축은 고정합니다.": "Observe how an original analog waveform and a distinct alias waveform agree at the sampling instants. Keep the time axis fixed.",
 "유한 개의 표본을 이용한 sinc 보간 근사를 확인합니다. 표본 수가 유한하므로 가장자리에서 작은 오차가 남을 수 있습니다.": "Examine sinc-interpolation approximation using finitely many samples. Small edge errors may remain because the sample count is finite.",
 "원하는 25 Hz 성분과 140 Hz 간섭 성분을 fₛ=160 Hz로 샘플링합니다. 간섭을 ADC 전에 감쇠시키는 효과를 확인합니다.": "Sample a desired 25 Hz component and a 140 Hz interferer at fs=160 Hz. Observe the benefit of attenuating interference before the ADC.",
 "시간 표본화와 진폭 양자화는 별개입니다. 동일한 샘플링률에서 bit depth만 변경하여 양자화 오차를 확인합니다.": "Time sampling and amplitude quantization are distinct operations. Change only the bit depth at a fixed sample rate to examine quantization error.",
 "실제 DAC의 계단형 출력(ZOH)과 이상적 sinc 복원을 비교합니다. 시간축을 0–0.25 s로 고정합니다.": "Compare a DAC's staircase zero-order-hold output with ideal sinc reconstruction. Keep the time axis fixed at 0–0.25 s.",
 "감쇠·증가하는 이산 지수수열의 pole과 ROC를 연결합니다. 시간축 n=0…15를 고정합니다.": "Relate poles and ROC to decaying and growing discrete-time exponentials. Keep the index range at n=0…15.",
 "n 영역의 완전히 다른 두 수열을 선택하고 각 Z-transform의 합과 수렴조건을 직접 추적합니다. 결과 대수식은 같지만 ROC가 다릅니다.": "Select two very different sequences and trace their Z-transform sums and convergence conditions. The algebraic expressions agree, but their ROCs differ.",
 "우측수열과 좌측수열을 합하면 두 수렴영역의 교집합인 annular ROC가 만들어집니다.": "Combining right- and left-sided sequences gives an annular ROC equal to the intersection of their convergence regions.",
 "두 pole의 유리함수를 부분분수로 전개하고, ROC에 따라 항별로 역변환하여 x[n]을 복원합니다.": "Expand a two-pole rational function into partial fractions and reconstruct x[n] by inverting each term according to its ROC.",
 "인과적 1-pole 저역통과 필터에서 pole을 단위원에 가깝게 이동하며 impulse response와 frequency response를 함께 관찰합니다.": "Move the pole of a causal one-pole low-pass filter toward the unit circle and compare its impulse and frequency responses.",
 "평균으로 시간영역의 진동이 상쇄되는 현상을 관찰하고, 같은 주파수의 notch와 단위원 영점을 연결합니다. Ω는 0…2π 범위에서 표시합니다.": "Observe cancellation of oscillations by averaging, and relate a notch frequency to zeros on the unit circle. Display Ω over 0…2π.",
 "pole과 ROC의 위치만 확인하지 않고, 임펄스응답의 절대합이 실제로 수렴하는지 관찰하여 BIBO 안정성을 판정합니다.": "Check not only pole and ROC locations but also convergence of the impulse response's absolute sum to assess BIBO stability.",
 "차분방정식을 실제 센서 표본 처리에 적용합니다. 측정 잡음과 입력 변화에 대한 평활화·지연의 절충을 관찰합니다.": "Apply a difference equation to sensor samples and observe the smoothing-versus-delay tradeoff for measurement noise and input changes.",
 "CT는 모든 실수 시간 t에서 정의되고, DT는 정수 index n에서만 정의됩니다. Stem 사이의 선은 새 sample을 만들지 않습니다.": "A continuous-time (CT) signal is defined for every real t, whereas a discrete-time (DT) signal is defined only at integer indices n. Connecting stems does not create new samples.",
 "원래 physical waveform은 CT입니다. x[n]은 nTₛ 시각에서 얻은 sequence이며 n 사이에 새로운 sample은 존재하지 않습니다.": "The original physical waveform is continuous-time. The sequence x[n] is sampled at t=nTₛ; no additional samples exist between integer indices.",
 "DT stem을 직선으로 연결하면 CT signal이 될까요?": "Does connecting DT stems with straight lines turn the sequence into a continuous-time signal?",
 "아닙니다. 별도의 interpolation rule을 정의하지 않는 한 x[n]은 integer n에서만 정의됩니다.": "No. Without an explicitly defined interpolation rule, x[n] remains defined only at integer indices n.",
 "Unit step, rectangular pulse, exponential, ramp, CT unit-area impulse approximation과 DT impulse를 비교합니다.": "Compare the unit step, rectangular pulse, exponential, ramp, a continuous-time unit-area impulse approximation, and the discrete-time impulse.",
 "CT impulse approximation에서 ε를 절반으로 줄이면 높이와 면적은 어떻게 되나요?": "If ε is halved in a continuous-time impulse approximation, what happens to its height and area?",
 "높이는 두 배(A/ε → 2A/ε)가 되고, 전체 면적은 A로 유지됩니다. 이는 pulse model의 성질이며 δ(t) 자체의 유한 높이를 뜻하지 않습니다.": "The height doubles (A/ε → 2A/ε), while the total area remains A. This property belongs to the pulse approximation, not to a finite height of δ(t) itself.",
 "x(at+b)의 각 주요 시점을 (τ−b)/a로 이동합니다. a<0은 reversal, |a|>1은 compression입니다.": "Map each landmark of x(at+b) to time (τ−b)/a. Negative a reverses time, and |a|>1 compresses the signal.",
 "x(2t−2)의 원래 support [0,3]은 어디로 이동할까요?": "Where does the original support [0,3] move under x(2t−2)?",
 "0≤2t−2≤3 ⇒ 1≤t≤2.5. 폭 3→1.5로 압축되고, 오른쪽으로 이동합니다. x(2t−2)=x(2(t−1)).": "From 0≤2t−2≤3 we obtain 1≤t≤2.5. The support width compresses from 3 to 1.5 and shifts right: x(2t−2)=x(2(t−1)).",
 "CT sinusoid는 ω₀≠0이면 주기적입니다. DT complex exponential은 Ω/(2π)가 유리수일 때만 주기적이며, 실제부·허수부를 함께 표시합니다.": "A continuous-time sinusoid is periodic when ω₀≠0. A discrete-time complex exponential is periodic only when Ω/(2π) is rational; observe both its real and imaginary parts.",
 "e^{jπn/4}의 fundamental period는?": "What is the fundamental period of e^{jπn/4}?",
 "Ω=π/4 ⇒ Ω/(2π)=1/8. ΩN=2πm을 만족하는 최소 N은 8입니다.": "Since Ω=π/4, Ω/(2π)=1/8. The smallest positive integer N satisfying ΩN=2πm is N=8.",
 "유한 관찰 구간의 E(T), P(T)와 무한 시간에서의 signal classification을 구분합니다.": "Distinguish finite-window energy E(T) and power P(T) from classifications based on infinite time.",
 "진폭 A를 2배로 바꾸면 동일한 pulse의 energy는?": "What happens to the energy of a pulse when amplitude A is doubled?",
 "E=A²W이므로 amplitude를 2배로 하면 energy는 4배입니다. 1 Ω 정규화가 아닌 일반 신호에서 E와 P는 수학적 척도입니다.": "Because E=A²W, doubling amplitude multiplies energy by four. For general signals without the 1 Ω normalization, E and P are mathematical measures.",
 "Linearity와 Time Invariance를 두 경로의 그래프로 직접 검증합니다. 모든 성질은 입력 클래스와 정의역을 명시하고 독립적으로 판정해야 합니다.": "Test linearity and time invariance using two signal paths. Assess each system property independently, stating the input class and domain.",
 "y(t)=x(2t)는 식에 t의 coefficient가 없으므로 time-invariant일까요?": "Is y(t)=x(2t) time-invariant simply because there is no separate coefficient multiplying t outside the argument?",
 "아닙니다. T{x(t−t₀)}=x(2t−t₀)이고 y(t−t₀)=x(2t−2t₀)로 일반적으로 다릅니다. t>0에서는 미래 입력 x(2t)를 사용하므로 noncausal입니다.": "No. T{x(t−t₀)}=x(2t−t₀), whereas y(t−t₀)=x(2t−2t₀); they generally differ. For t>0 the output uses future input x(2t), so the system is noncausal.",
 "임의 신호를 even part와 odd part로 분리하고 x(t)=xₑ(t)+xₒ(t)를 직접 검산합니다.": "Decompose a signal into even and odd parts and verify x(t)=xₑ(t)+xₒ(t).",
 "짝수성 xₑ(−t)=xₑ(t), 홀수성 xₒ(−t)=−xₒ(t). 이 분해는 Fourier analysis에서 symmetry를 활용하는 기초입니다.": "Even symmetry means xₑ(−t)=xₑ(t); odd symmetry means xₒ(−t)=−xₒ(t). This decomposition supports symmetry arguments in Fourier analysis.",
 "x(t)=t+2의 even part와 odd part는?": "What are the even and odd parts of x(t)=t+2?",
 "x(−t)=−t+2. 따라서 xₑ(t)=[(t+2)+(−t+2)]/2=2, xₒ(t)=[(t+2)−(−t+2)]/2=t.": "Since x(−t)=−t+2, the even part is xₑ(t)=[(t+2)+(−t+2)]/2=2, and the odd part is xₒ(t)=[(t+2)−(−t+2)]/2=t.",
 "입력 신호 두 개를 조합하거나 시간 미분·적분한 결과를 비교합니다. 미분과 적분은 단순한 amplitude 변환이 아닙니다.": "Compare combinations of two input signals and the effects of time differentiation and integration. Neither operation is merely an amplitude change.",
 "x(t)=cos(2t)의 도함수는?": "What is the derivative of x(t)=cos(2t)?",
 "dx/dt=−2sin(2t). 각주파수 ω가 커질수록 derivative amplitude는 ω배 커집니다.": "The derivative is dx/dt=−2sin(2t). In general, differentiation multiplies sinusoidal amplitude by the angular frequency ω.",
 "스마트폰 오디오, ECG, 모터 진동, 가속도 센서의 예시를 생성하고 CT/DT domain 및 physical units를 읽습니다. 모두 교육용 합성 신호입니다.": "Generate educational synthetic examples of smartphone audio, ECG, motor vibration, and accelerometer signals. Identify their CT/DT domains and physical units.",
 "마이크로폰 전압을 ADC로 변환하면 원래 sound pressure 자체가 DT가 되나요?": "Does converting microphone voltage with an ADC turn the original sound pressure into a discrete-time quantity?",
 "아닙니다. 원래 pressure와 microphone analog voltage는 CT physical quantities입니다. ADC가 생성한 x[n]은 DT sequence입니다.": "No. The original sound pressure and analog microphone voltage are continuous-time physical quantities. The ADC produces a discrete-time sequence x[n].",
 "연속시간 t에서 정수 sample index n으로 변환합니다.": "Convert continuous time t into integer sample index n.",
 "디지털 주파수는 Ω=2πf/fₛ rad/sample입니다.": "Digital angular frequency is Ω=2πf/fₛ rad/sample.",
 "신호가 fmax 아래로 대역 제한되어 있으면 복제 스펙트럼이 겹치지 않습니다.": "If the sampling rate exceeds twice the signal bandwidth limit fmax, spectral replicas do not overlap.",
 "이상적인 sinc interpolation은 대역제한 조건에서 연속신호를 복원합니다.": "Ideal sinc interpolation reconstructs a continuous-time signal under the bandlimited sampling assumptions.",
 "시간축을 바꾸지 않아 sampling density만 달라지는 것을 직접 비교합니다.": "Compare changes in sampling density while keeping the time axis fixed.",
 "Nyquist rate=2fmax; Nyquist frequency=fₛ/2입니다.": "The Nyquist rate is 2fmax, and the Nyquist frequency is fₛ/2.",
 "fₛ=2fmax에서는 경계 정현파의 위상·진폭 복원이 모호할 수 있습니다.": "At fs=2fmax, recovery of amplitude and phase for a sinusoid at the boundary can be ambiguous.",
 "30 Hz 성분을 포함하는 bandlimited 센서에 fₛ=50 Hz를 사용하면 충분한가요?": "Is fs=50 Hz sufficient for a bandlimited sensor signal containing a 30 Hz component?",
 "아닙니다. 2×30=60 Hz보다 큰 fₛ가 필요합니다. 실제로는 필터 전이대역을 고려하여 여유를 둡니다.": "No. The sampling rate must exceed 2×30=60 Hz, with additional margin in practice for filter transition bands.",
 "이상적 sampling을 impulse train의 곱셈으로 표현합니다.": "Represent ideal sampling as multiplication by an impulse train.",
 "ωₛ=2π/Tₛ이며 CTFS를 통해 유도할 수 있습니다.": "The sampling angular frequency is ωs=2π/Ts, as can be derived using CTFS.",
 "시간영역의 곱은 주파수영역의 convolution에 대응합니다.": "Multiplication in time corresponds to convolution in frequency.",
 "원본 스펙트럼이 kωₛ마다 반복되며 겹치지 않으면 이상적 복원이 가능합니다.": "The original spectrum repeats at integer multiples of ωs; ideal reconstruction is possible when the copies do not overlap.",
 "샘플링률이 바뀌면 복제본 사이의 거리만 변합니다.": "Changing the sampling rate changes the spacing between spectral replicas.",
 "ADC 전에 고주파 성분을 제거해야 겹침을 예방할 수 있습니다.": "High-frequency components should be attenuated before the ADC to prevent spectral overlap.",
 "최대 주파수 80 Hz의 대역제한 신호를 fₛ=140 Hz로 표본화하면?": "What happens when a signal bandlimited to 80 Hz is sampled at fs=140 Hz?",
 "140 Hz는 160 Hz보다 작으므로 복제 스펙트럼이 겹쳐 aliasing이 발생할 수 있습니다.": "Because 140 Hz is below 160 Hz, the spectral replicas may overlap and aliasing can occur.",
 "연속시간에서는 원래 주파수 f가 파형의 빠르기를 결정합니다.": "In continuous time, frequency f determines how rapidly the waveform oscillates.",
 "표본화 후에는 정수 n에서의 위상만 남습니다.": "After sampling, only the phase evaluated at integer indices n remains.",
 "2πmn은 정수 회전이므로 모든 표본이 같습니다.": "Since 2πmn is an integer number of full rotations, the samples agree.",
 "실수 코사인은 Nyquist 범위 안의 주파수와 구별되지 않을 수 있습니다.": "A sampled real cosine may be indistinguishable from another frequency within the Nyquist interval.",
 "연속 곡선은 다르지만 표본은 동일할 수 있습니다.": "The continuous-time curves can differ while their sample values coincide.",
 "표본 수열에 원래 아날로그 주파수를 식별할 정보가 남지 않습니다.": "The sampled sequence may no longer retain enough information to identify the original analog frequency.",
 "오디오, 모터 진동, 영상 moiré 등에서 같은 원리가 발생합니다.": "The same phenomenon appears in audio, motor vibration, and image moiré patterns.",
 "fₛ=100 Hz에서 90 Hz 코사인은 몇 Hz처럼 보이나요?": "At fs=100 Hz, what frequency does a 90 Hz cosine appear to have?",
 "10 Hz입니다. cos(2π·90n/100)=cos(2π·10n/100)입니다.": "It appears at 10 Hz: cos(2π·90n/100)=cos(2π·10n/100).",
 "복소 z의 반지름과 위상이 수열을 가중합니다.": "The magnitude and phase of complex z weight the sequence.",
 "u[n] 때문에 합은 n=0에서 시작합니다.": "The sum starts at n=0 because of u[n].",
 "무한 기하급수는 |az⁻¹|<1에서만 수렴합니다.": "The infinite geometric series converges only when |az⁻¹|<1.",
 "단위원이 ROC 안에 있을 때에만 통상적인 DTFT를 얻습니다.": "The conventional DTFT exists when the unit circle lies inside the ROC.",
 "a가 1에 가까울수록 시간응답이 천천히 감소합니다.": "As a approaches 1 from below, the time-domain response decays more slowly.",
 "우측수열은 극점의 바깥쪽 ROC를 가집니다.": "A right-sided sequence has an ROC outside its outermost pole.",
 "인과적 rational LTI 시스템에서는 모든 실제 pole이 단위원 안에 있어야 안정합니다.": "A causal rational LTI system is BIBO stable only if every uncancelled pole lies inside the unit circle.",
 "a=1.05인 인과적 x[n]=aⁿu[n]의 DTFT가 일반적인 합으로 존재하나요?": "Does the ordinary DTFT sum exist for the causal sequence x[n]=aⁿu[n] with a=1.05?",
 "아닙니다. ROC |z|>1.05에 단위원이 포함되지 않습니다.": "No. Its ROC is |z|>1.05, which excludes the unit circle.",
 "Change에서 수열을 선택합니다. 오른쪽은 n≥0, 왼쪽은 n≤−1에만 존재합니다.": "Use Change to select a sequence: the right-sided signal exists only for n≥0 and the left-sided signal only for n≤−1.",
 "선택한 h[n]을 H(z)=Σh[n]z⁻ⁿ에 대입하고 구간을 결정합니다.": "Substitute the selected h[n] into H(z)=Σh[n]z⁻ⁿ and identify the summation range.",
 "왼쪽에서는 k=−n으로 치환합니다. 결과는 같은 1/(1−az⁻¹)입니다.": "For the left-sided case, substitute k=−n. The result simplifies to the same expression 1/(1−az⁻¹).",
 "수렴조건이 서로 반대이므로 동일한 H(z) 대수식이어도 역변환이 다릅니다.": "Opposite convergence conditions lead to different inverse transforms even with the same algebraic H(z).",
 "Pole z=0.8은 같으나 ROC 방향이 다릅니다. 단위원은 Right-sided ROC에만 포함됩니다.": "Both have pole z=0.8, but the ROC directions differ. Only the right-sided ROC includes the unit circle.",
 "a=0.8인 두 신호를 각각 Z-transform하면 무엇이 같고 무엇이 다를까요?": "What is the same, and what differs, when taking the Z-transform of the two sequences with a=0.8?",
 "유리식 H(z)=1/(1−0.8z⁻¹)과 pole z=0.8은 같지만, Right-sided의 ROC는 |z|>0.8, Left-sided는 |z|<0.8입니다.": "The rational expression H(z)=1/(1−0.8z⁻¹) and pole z=0.8 are identical, but the right-sided ROC is |z|>0.8 and the left-sided ROC is |z|<0.8.",
 "첫 번째 성분은 바깥쪽 ROC입니다.": "The first component has an exterior ROC.",
 "두 번째 성분은 안쪽 ROC입니다.": "The second component has an interior ROC.",
 "합의 ROC는 각 성분의 공통 수렴영역입니다.": "The ROC of the sum is the common convergence region of its components, barring cancellation.",
 "양측수열도 절대합이 유한하여 안정적인 LTI impulse response가 될 수 있습니다.": "A two-sided absolutely summable sequence can also be a stable LTI impulse response.",
 "두 경계 원은 ROC에 포함되지 않습니다. Zero z=0과 z=(a+b)/2도 직접 확인하세요.": "Neither boundary circle belongs to the ROC. Also inspect the zeros at z=0 and z=(a+b)/2.",
 "n≥0과 n≤−1 양쪽에 성분이 있습니다.": "The signal has components for both n≥0 and n≤−1.",
 "인과성은 우측 지지, 안정성은 절대합/단위원 ROC와 관련됩니다.": "Causality concerns right-sided support; BIBO stability concerns absolute summability and whether the ROC contains the unit circle.",
 "a=0.4, b=1.8이면 ROC가 단위원을 포함하나요?": "When a=0.4 and b=1.8, does the ROC contain the unit circle?",
 "네. 0.4<1<1.8이므로 포함합니다.": "Yes. The inequality 0.4<1<1.8 places the unit circle in the ROC.",
 "중간 출력값이 우연히 0이 되면 출력 길이도 짧아지나요?": "Does the output length shrink if an intermediate output sample happens to be zero?",
 "두 사각 펄스의 폭이 다르면 왜 삼각형이 아니라 사다리꼴이 되나요?": "Why does convolving rectangular pulses of unequal widths produce a trapezoid rather than a triangle?",
 "두 신호가 t=0에서 1이어도 컨벌루션 출력 y(0)은 왜 0인가요?": "Why is the convolution output y(0)=0 even if both signals equal 1 at t=0?",
 "시정수 τ를 크게 하면 출력이 더 빨리 상승하나요, 느리게 상승하나요?": "Does increasing time constant τ make the output rise faster or slower?",
 "이동평균 필터가 일정한 입력값을 그대로 유지하는 이유는 무엇인가요?": "Why does a moving-average filter preserve a constant input?",
 "두 LTI 시스템을 직렬 연결할 때 순서를 바꿔도 출력이 같은 이유는 무엇인가요?": "Why does reversing the order of two cascaded LTI systems preserve the output?",
 "인과적이지 않지만 BIBO 안정적인 LTI 시스템이 존재할까요?": "Can an LTI system be noncausal yet BIBO stable?",
 "실수 cosine의 진폭이 A인데 복소 푸리에 계수 크기는 왜 A/2인가요?": "Why does a real cosine with amplitude A yield complex Fourier coefficients of magnitude A/2?",
 "펄스의 높이를 일정하게 유지하고 폭 τ를 늘리면 DC 계수는 어떻게 변할까요?": "How does the DC coefficient change as pulse width τ increases at fixed amplitude?",
 "조화 항을 계속 늘리면 Gibbs overshoot의 높이가 0으로 줄어들까요?": "Does the Gibbs overshoot height approach zero as more harmonics are added?",
 "크기 스펙트럼만 보고 시간 이동이 있었는지 판단할 수 있나요?": "Can a time shift be detected from the magnitude spectrum alone?",
 "이산시간에서는 왜 DTFS 계수 종류가 N개뿐인가요?": "Why are there only N distinct DTFS coefficients for an N-periodic sequence?",
 "RC 시정수 τ가 커지면 출력 파형이 부드러워지는 이유는 무엇인가요?": "Why does increasing the RC time constant τ smooth the output waveform?",
 "불연속점 한 곳의 값 x(0)을 10으로 바꾸어도 Fourier 계수는 변하지 않나요?": "Do the Fourier coefficients remain unchanged if x(0) at one discontinuity is set to 10?",
 "주기 T를 늘릴 때 Fourier Series 계수 aₖ를 그대로 그래프로 그리면 왜 잘못된 비교가 되나요?": "Why is plotting unscaled Fourier-series coefficients aₖ misleading when the period T increases?",
 "높이를 유지한 채 펄스 폭을 2배로 늘리면 spectrum의 main lobe는 어떻게 되나요?": "What happens to the spectral main lobe when pulse width doubles at constant amplitude?",
 "α가 증가하면 시간 신호는 더 빨리 감쇠하는데 왜 주파수 스펙트럼의 폭은 커질까요?": "Why does the spectrum broaden as α increases and the time-domain signal decays faster?",
 "펄스의 폭과 위치를 조절할 때 스펙트럼 크기·위상이 각각 어떻게 변하나요?": "How do pulse width and pulse position separately affect spectral magnitude and phase?",
 "부호가 음수인 sidelobe에서 magnitude도 음수가 되나요?": "Is the magnitude negative in a sidelobe where the signed spectrum is negative?",
 "입력 펄스가 0이 된 후에도 출력이 즉시 0이 되지 않는 이유는 무엇인가요?": "Why does the output not immediately return to zero when the input pulse ends?",
 "cos(ωct)를 곱하면 주파수영역에 왜 두 복사본이 생기나요?": "Why does multiplication by cos(ωct) create two copies in the frequency domain?",
 "샘플 간격 Δt를 줄이거나 zero padding만 하면 유한 관측 구간 밖의 정보를 복원할 수 있나요?": "Can decreasing sample spacing Δt or adding zero padding recover information outside a finite observation window?",
 "주기적 impulse train의 line spectrum과 원신호 스펙트럼을 convolution하기 때문입니다.": "Because the line spectrum of the periodic impulse train is convolved with the original signal spectrum.",
 "이상적 LPF는 baseband를 선택하고 impulse-train sampling의 1/Tₛ 배율을 보상합니다.": "An ideal low-pass filter selects the baseband and compensates for the 1/Tₛ scaling of impulse-train sampling.",
 "정규화 sinc(x)=sin(πx)/(πx)를 사용합니다.": "Use the normalized sinc function, sinc(x)=sin(πx)/(πx).",
 "각 표본이 shifted sinc 함수를 만들고 모두 더해집니다.": "Each sample contributes a shifted sinc function, and the contributions are summed.",
 "대역제한과 fₛ>2fmax 등 이상적 가정 아래 무한합이 원신호를 복원합니다.": "Under ideal bandlimiting and fs>2fmax, the infinite sum reconstructs the original signal.",
 "sinc(k)=0 for nonzero integer k이므로 다른 표본의 기여가 사라집니다.": "Because sinc(k)=0 for every nonzero integer k, all other sample contributions vanish at a sampling instant.",
 "단순 직선 연결이 아니라 주변 모든 표본의 sinc 가중합입니다.": "Reconstruction is a weighted sum of sinc functions from all samples, not a simple straight-line connection.",
 "이 그래프는 101개 표본만 사용한 근사입니다. 가장자리 오차는 truncation 때문일 수 있습니다.": "This graph approximates reconstruction with only 101 samples; edge errors may result from truncation.",
 "왜 직선 보간과 sinc interpolation은 다를까요?": "Why do linear interpolation and sinc interpolation produce different results?",
 "sinc는 이상적 대역제한 조건에 맞는 LPF impulse response를 사용하지만, 직선 보간은 다른 주파수 응답을 갖습니다.": "Sinc interpolation uses the ideal bandlimited low-pass impulse response; linear interpolation has a different frequency response.",
 "ADC의 Nyquist frequency는 80 Hz입니다.": "The ADC's Nyquist frequency is 80 Hz.",
 "140 Hz 간섭은 20 Hz 저주파 간섭으로 나타납니다.": "The 140 Hz interferer aliases to a 20 Hz low-frequency component.",
 "아날로그 anti-alias filter가 간섭의 크기를 줄입니다.": "An analog anti-aliasing filter attenuates the interference before sampling.",
 "ADC 이후 디지털 필터는 이미 겹친 원래 성분을 식별하지 못합니다.": "A digital filter after the ADC cannot recover the identities of frequency components that have already aliased together.",
 "아날로그 필터 → ADC → 디지털 필터의 순서가 중요합니다.": "The order matters: analog filter → ADC → digital filter.",
 "필터의 통과대역과 전이대역은 Nyquist frequency 아래에서 설계합니다.": "Design the filter passband and transition band with the Nyquist frequency in mind.",
 "기계 센서의 고주파 진동이 저주파 고장 성분처럼 보이는 오류를 막습니다.": "Prevent high-frequency sensor vibration from masquerading as a low-frequency fault component.",
 "왜 디지털 LPF만으로 140 Hz 간섭을 제거하지 못하나요?": "Why cannot a digital low-pass filter alone remove the 140 Hz interferer?",
 "ADC 뒤에는 간섭이 20 Hz로 접혀 원하는 25 Hz와 가까운 저주파 성분이 되기 때문입니다.": "After the ADC the interference has folded to 20 Hz, near the desired 25 Hz component.",
 "시간축에서 언제 측정할지를 결정합니다.": "Sampling determines when the signal is measured along the time axis.",
 "이 예제는 입력 범위 [−1,1]에서 2ᴮ개 균일한 레벨을 사용합니다.": "This example uses 2ᴮ uniformly spaced quantization levels over the input range [−1,1].",
 "포화되지 않고 최근접 레벨로 반올림할 때의 오차 상한입니다.": "This is the error bound when rounding to the nearest level without saturation.",
 "Sampling은 시간 분해능, Quantization은 진폭 분해능과 관련됩니다.": "Sampling concerns temporal resolution; quantization concerns amplitude resolution.",
 "비트 수를 늘리면 레벨 간격이 줄어듭니다.": "Increasing the bit depth reduces the spacing between quantization levels.",
 "실제 ADC에는 열잡음, 지터, 비선형성, 포화 등 다른 오차도 있습니다.": "Real ADCs also exhibit thermal noise, jitter, nonlinearity, saturation, and other errors.",
 "4-bit ADC와 8-bit ADC 중 어느 쪽이 더 많은 진폭 레벨을 갖나요?": "Which has more amplitude levels: a 4-bit ADC or an 8-bit ADC?",
 "Right-sided 선택 시 n≥0 합, Left-sided 선택 시 n≤−1 합이 나타납니다.": "Selecting Right-sided displays the sum for n≥0; selecting Left-sided displays the sum for n≤−1.",
 "서로 다른 수열을 변환해도 H(z)=1/(1−0.8z⁻¹)로 정리됩니다.": "The transforms of the different sequences simplify to the same expression H(z)=1/(1−0.8z⁻¹).",
 "서로 다른 두 pole z=a, z=b를 확인합니다. a<b입니다.": "Identify the two distinct poles z=a and z=b, where a<b.",
 "상수항과 z⁻¹항을 비교합니다. B=1−A를 대입하면 (b−a)A=−a, 따라서 A=−a/(b−a), B=b/(b−a)입니다. 예: a=0.5, b=2이면 A=−1/3, B=4/3.": "Compare the constant and z⁻¹ coefficients. Substituting B=1−A gives (b−a)A=−a, hence A=−a/(b−a) and B=b/(b−a). For a=0.5 and b=2, A=−1/3 and B=4/3.",
 "같은 대수식도 ROC에 따라 두 항의 시간 방향이 달라집니다.": "Even for the same algebraic expression, the ROC determines the sidedness of each inverse-transform term.",
 "항별 계수를 합하고, 각 항의 변환쌍과 ROC 교집합을 다시 검사합니다.": "Combine the term coefficients and check each transform pair and the intersection of the ROCs.",
 "A=−a/(b−a), B=b/(b−a): Pole만 선택하는 것이 아니라 부분분수의 계수도 계산합니다.": "A=−a/(b−a), B=b/(b−a): calculate the partial-fraction coefficients, not just the pole locations.",
 "외부 ROC는 두 우측수열, 고리형 ROC는 양측수열, 내부 ROC는 두 좌측수열입니다.": "An exterior ROC gives two right-sided terms; an annular ROC gives a two-sided sequence; an interior ROC gives two left-sided terms.",
 "각 항의 수열이 어떻게 합쳐져 최종 x[n]이 되는지 같은 y축으로 비교합니다.": "Compare on the same vertical scale how the component sequences combine into the final x[n].",
 "a=0.5, b=2일 때 a<|z|<b에서 x[n]은?": "For a=0.5 and b=2, what is x[n] when a<|z|<b?",
 "A=−1/3, B=4/3이므로 x[n]=−(1/3)(0.5)ⁿu[n]−(4/3)(2)ⁿu[−n−1]입니다.": "Since A=−1/3 and B=4/3, x[n]=−(1/3)(0.5)ⁿu[n]−(4/3)(2)ⁿu[−n−1].",
 "피드백 항은 이전 출력을 저장하는 delay입니다.": "The feedback term contains a delay that stores the previous output.",
 "초기조건 0에서 전달함수를 구합니다.": "Find the transfer function under zero initial conditions.",
 "a<1이면 단위원이 ROC에 포함됩니다.": "For the causal filter with 0≤a<1, the ROC contains the unit circle.",
 "pole이 +1에 가까워지면 저주파 응답은 상대적으로 뚜렷해집니다.": "As the pole approaches +1, the response becomes increasingly concentrated near low frequencies.",
 "a가 커지면 impulse response가 천천히 감소합니다.": "As a increases toward 1, the impulse response decays more slowly.",
 "동시에 높은 주파수의 억제 정도가 달라집니다.": "The attenuation at higher frequencies also changes.",
 "IoT 센서의 온도·습도 smoothing과 노이즈 저감에 사용됩니다.": "This filter can smooth temperature and humidity measurements and reduce sensor noise in IoT systems.",
 "a=0.95와 a=0.2 중 어떤 필터가 더 긴 기억을 갖나요?": "Which filter has a longer memory, a=0.95 or a=0.2?",
 "a=0.95입니다. impulse response aⁿ이 더 천천히 감소합니다.": "The a=0.95 filter has longer memory because its impulse response aⁿ decays more slowly.",
 "N개의 연속된 표본이 평균되는 동안 양·음 성분이 서로 상쇄될 수 있습니다.": "Positive and negative contributions may cancel when N consecutive samples are averaged."
};
const nodeFilter='script,style,textarea,option,svg,canvas,math,.katex,.katex-display,code,pre,[contenteditable],[data-no-translate]';
const roots=()=>[document.querySelector('.ss-layout-root'),document.querySelector('main'),document.querySelector('#page'),document.querySelector('.ss-layout-sidebar')].filter((x,i,a)=>x&&a.indexOf(x)===i).filter(x=>!rootsAncestor(x));
function rootsAncestor(el){return !!(el.parentElement&&el.parentElement.closest('.ss-layout-root,main,#page'));}
function bilingual(raw,mode){
 const trimmed=raw.trim();
 if(!trimmed)return raw;
 const direct=authoredTranslations[trimmed];
 if(direct){
  const content=mode==='en'?direct:mode==='mixed'?(trimmed.length>70?direct+'\n'+trimmed:direct+' · '+trimmed):trimmed;
  return raw.replace(trimmed,content);
 }
 // Explicitly bilingual passages are normalized to English-first in mixed mode.
 const split=trimmed.match(/^(.+?)\\s+\\/\\s+(.+)$/);
 if(split&&/[가-힣]/.test(split[1])!==/[가-힣]/.test(split[2])){
  const ko=/[가-힣]/.test(split[1])?split[1].trim():split[2].trim();
  const en=/[가-힣]/.test(split[1])?split[2].trim():split[1].trim();
  const value=mode==='en'?en:mode==='ko'?ko:(trimmed.length>70?en+'\n'+ko:en+' · '+ko);
  return raw.replace(trimmed,value);
 }
 if(mode==='mixed')return raw;
 if(dictionary[trimmed]){
  const candidate=dictionary[trimmed];
  if(mode==='en'&&/[가-힣]/.test(trimmed))return raw.replace(trimmed,candidate);
  if(mode==='ko'&&!/[가-힣]/.test(trimmed))return raw.replace(trimmed,candidate);
 }
 if(mode==='en'){
  const trailing=trimmed.match(/^(.+?)\\s*\\(([가-힣][^()]*)\\)$/);
  if(trailing)return raw.replace(trimmed,trailing[1].trim());
  const leading=trimmed.match(/^([가-힣][^()]*)\\s*\\(([A-Za-z][^()]*)\\)$/);
  if(leading)return raw.replace(trimmed,leading[2].trim());
 }
 return raw;
}
let observers=[],running=false,pending=false;
function run(){
 if(running){pending=true;return;}
 running=true;
 for(const observer of observers)observer.disconnect();
 observers=[];
 const mode=window.ELSLanguage.get();
 document.documentElement.dataset.language=mode;
 document.documentElement.dataset.elsLanguage=mode;
 const targets=roots();
 for(const root of targets){
  // Explicitly authored translations take priority over heuristics.
  for(const el of root.querySelectorAll('[data-i18n-en],[data-i18n-ko],[data-i18n-mixed]')){
   if(!saved.has(el))saved.set(el,el.textContent);
   const translated=el.getAttribute('data-i18n-'+mode);
   if(translated!=null&&el.textContent!==translated)el.textContent=translated;
   else if(translated==null&&el.textContent!==saved.get(el))el.textContent=saved.get(el);
  }
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
   const p=node.parentElement;
   if(!p||p.closest(nodeFilter)||p.closest('[data-i18n-en],[data-i18n-ko],[data-i18n-mixed]'))continue;
   if(!saved.has(node))saved.set(node,node.nodeValue);
   const original=saved.get(node);
   const next=bilingual(original,mode);
   if(p.childNodes.length===1){p.classList.toggle('ss-i18n-mixed-paragraph',mode==='mixed'&&next.includes('\n'));}
   if(node.nodeValue!==next)node.nodeValue=next;
  }
 }
 for(const root of targets){
  const o=new MutationObserver(()=>{if(!running)requestAnimationFrame(run);});
  o.observe(root,{subtree:true,childList:true,characterData:true});
  observers.push(o);
 }
 running=false;
 if(pending){pending=false;requestAnimationFrame(run);}
}
window.ELSLanguage.subscribe(run);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
else run();
// Audit visible Korean in English mode without deleting scientific explanations.
function audit(){
 const entries=[];
 for(const root of roots()){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
   const node=walker.currentNode,el=node.parentElement;
   if(!el||el.closest(nodeFilter)||!el.getClientRects().length)continue;
   const value=(node.nodeValue||'').trim();
   if(/[가-힣]/.test(value))entries.push({text:value.slice(0,180),tag:el.tagName});
  }
 }
 return {chapter:(location.pathname.match(/chapter([1-8])\\.html/)||[])[1]||null,mode:window.ELSLanguage.get(),untranslatedCount:entries.length,samples:entries.slice(0,40)};
}
window.ELSSharedLanguage={refresh:run,audit:audit};
})();