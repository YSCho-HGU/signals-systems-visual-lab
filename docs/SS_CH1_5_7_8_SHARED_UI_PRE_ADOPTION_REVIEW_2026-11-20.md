# Signals & Systems: Chapter 1–5, 7–8 공통 UI 사전 구조 검토

**검토일:** 2026-11-20  
**범위:** Chapter 1~5 및 7~8, 총 56개 기존 실습 (전체 62개 중 Chapter 6의 6개 제외)  
**상태:** SOURCE_REVIEWED / BROWSER_NOT_VERIFIED / NOT_DEPLOYED  
**목적:** Chapter 6의 시각 설계·KaTeX·controls↔plots workbench를 기존 장에 안전하게 확산하는 방법 결정  
**이번 작업:** 소스 감사와 적용 설계만 수행. 기존 장 코드는 변경하지 않음.

## 1. 실제 코드 위치와 중요한 구조 차이

- 주 소스는 `index.html`의 `<script id="lab-payload" type="application/json">` 안에 존재하는 장별 **Base64 HTML 페이지**다. 별도의 `chapter1.html`, `chapter2.html`, ..., `chapter8.html`를 수정하는 방식이 아니다.
- `decodeLab(ch)`에서 Base64를 UTF-8로 해독하고 기존 `</head>` 앞에 `assets/design-system.css`, `assets/ss-lab-theme.css`, `assets/els-theme-v2.css`를 삽입한다. 그 결과는 `iframe#lab-frame.srcdoc`으로 제공된다.
- **Chapter 6만** `./chapter6.html`로 직접 이동하는 네이티브 구조다. 이에 따라 Ch6 전용 전역 객체와 selector를 다른 장에 그대로 복사하면 동작하지 않는다.
- 상위 페이지가 테마/언어/진도/장 탐색을 담당하며, 실습 내부에는 자체 상태 객체가 있다. 부모 UI 상태와 iframe 내부 수치 시뮬레이션 상태는 보존 대상으로 분리한다.
- `assets/els-lab-components.js`/`.css`는 현재 Chapter 6에서 사용할 수 있도록 도입된 **opt-in 컴포넌트**이며 기존 iframe 안에 자동 주입되지 않는다.

## 2. 장별 구현 감사

| Ch | 기존 실습 | 실습 엔진/DOM 및 시각화 | 주요 보호 대상 | 난이도 |
|---|---:|---|---|---|
| 1 | 9 | `EXPS`; `render()`; 메인 `section.card` 안에 `#controls`, `#plots`; 옆 `aside.card`에 기존 4단계 안내; Canvas | 9개 신호·시스템 실험, 버튼식 단계 안내, `renderSteps()`, CT/DT 축과 그래프 probe | 중 |
| 2 | 9 | `MODULES`; `renderModule()`; `.experiment > .controls + .body-col`, `.charts`; Canvas | convolution Flip→Shift→Multiply→Sum 애니메이션, `motionMarkup`과 재생/시각 상태, 범례·축 프로브 | 중~상 |
| 3 | 7 | Ch2와 동일 계열의 `MODULES/renderModule` + Canvas, 유도·해석 패널 | CTFS/DTFS, harmonics/Gibbs, phase, `a_k` 표기와 수치 모델 | 하 |
| 4 | 8 | Ch3와 사실상 같은 `MODULES/renderModule` 템플릿 + Canvas | FS→CTFT, sinc 부호, 위상·스케일링·수치 CTFT, 축 단위 | 하 |
| 5 | 8 | 독립 `LABS`; `render()`; `.lab > .panel + .outputs`, `.plots`; Canvas | ROC 경계/탐침 드래그, 역라플라스 RS·LS·two-sided 비교 카드 클릭, pole-zero, stable/unstable | 중~상 |
| 7 | 7 | `EXPERIMENTS`; `render()/draw()/renderStep()`; `#controls`와 `#plots.plot-grid`; **SVG string 갱신** | 표본화·aliasing·sinc 복원, 그래프 커서/probe, 단계 버튼, SVG 다시 그리기 | 상 |
| 8 | 8 | Ch7과 같은 `EXPERIMENTS` 엔진, **SVG** `chart()/zplot()` | 복소 z-plane, pole-zero/ROC, 역변환 선택, 안정성/IIR 해석, SVG 커서/probe | 상 |

실습 수는 `chapter-catalog.json`, `assets/ss-learning-path.v1.json`, `docs/phase0/ss-storage-baseline.json`과 일치한다. 대상은 56개이며 Chapter 6까지 합쳐 총 62개다.

## 3. 코드 수준의 UI 적용 문제점과 위험

1. **그룹별 DOM 형태가 다르다.** Ch2–4는 Ch6과 동일 계열 `.controls/.charts/.body-col` 구조다. Ch5는 `.panel/.plots/.outputs`, Ch1·7·8은 고정 `#controls/#plots`가 있는 별도 `.card` 구조다. 공통 `mountWorkbench`에 chapter-specific selector adapter가 필수다.
2. **sticky가 존재하는 장이 다르다.** Ch2–4 `.controls{position:sticky;top:16px}`, Ch5 `.panel{position:sticky;top:16px}`가 있다. Ch1·7·8은 같은 sticky 패턴이 없다. Ch6에서 경험한 '설명 섹션까지 변수창 따라옴' 재발을 막기 위해, 새 wrapper는 controls+plots 범위에 한정하고 각 장의 sticky를 그 wrapper에 대해 비활성화해야 한다.
3. **Ch2만의 컨벌루션 모션 레이아웃**을 일반 그래프 카드로 취급하면 Flip/Shift/Multiply/Sum 학습 흐름이 깨질 수 있다. Motion panel은 원래 이벤트와 이동 요소를 보존해야 한다.
4. **Ch5의 특별한 인터랙션**: ROC 그림의 클릭/드래그 및 비교 카드 `data-compare`, `cmp_right/strip/left`는 DOM 이동만 하고 새 canvas로 교체하지 않아야 한다. 단순 2×2 그래프 카드화는 권장하지 않는다.
5. **Ch7·8은 `draw()`마다 `#plots.innerHTML=out.plots`**로 SVG를 새로 만든다. 바깥 `#plots` wrapper만 한 번 이동하고, 내부 SVG 이벤트/graph probe는 기존 reattach 경로에 맡겨야 한다.
6. **수식은 HTML markup(\`<sup>\`, \`<sub>\`, Unicode) 중심**으로 제공되고, 전체 장에 KaTeX 또는 MathML이 설치된 것은 아니다. 표시용 수식만 typed LaTeX 모델로 변환하고, 설명 한글/영문은 유지한다.
7. **iframe 접속 구조**: Chapter 6 파일에서처럼 JS를 페이지 맨 아래에 붙이는 방식은 7개 srcdoc에 바로 적용되지 않는다. `decodeLab(ch)`의 opt-in script/style 주입과 각 엔진의 post-render hook을 따로 설계한다.
8. **기존 공통 기능 중복 위험**: `ss-lab-theme.css`, `els-theme-v2.css`, `ss-language.js`, `ss-progress.js`, `ss-learning-aids.js`, `ss-learning-path.js`가 이미 존재한다. 공통 UI는 이 기능들을 재구현하거나 새 localStorage key를 만들지 않아야 한다.
9. **모바일 공간 문제**: 원형 side navigation이 넓고, Ch2–4는 내부 sidebar가 별도로 있으며, Ch1·7·8은 메인/유도 패널의 2열 구성이다. viewport width와 최상단 고정요소를 실제 390px/1280px로 확인해야 한다.

## 4. 권장 어댑터 계층

| 어댑터 | 대상 | 기본 호출 구조 | 적용 원칙 |
|---|---|---|---|
| `ss-module-canvas-adapter` | Ch3·Ch4, 이후 Ch2 | `renderModule` 완료 후 `.experiment`, `.controls`, `.body-col`, `.charts`를 연결 | 이벤트 복제 금지, plot resize 재평가, 유도식 인라인 상태 유지 |
| `ss-lti-motion-adapter` | Ch2 특수 모션 | 위 어댑터에 `motionMarkup` 예외 추가 | 애니메이션 상태·중단·재시작 테스트 |
| `ss-laplace-adapter` | Ch5 | `.lab .panel`과 `.outputs .plots`만 묶고 compare sections 독립 보존 | `canvas` 교체 및 ROC 이벤트 훼손 금지 |
| `ss-basic-grid-adapter` | Ch1 | `#controls`와 `#plots`를 장의 왼쪽 `section.card` 내부에서 그룹화 | 오른쪽 guided explanation 위치는 보존 |
| `ss-svg-step-adapter` | Ch7·Ch8 | `#controls`과 `#plots`의 wrapper만 이동 | SVG `innerHTML` 갱신, cursor probe, next/previous/all steps 유지 |

공통 사용 부분은 `ELSLabUI.renderMath`, `ELSLabUI.mountWorkbench`와 테마 토큰에 한정한다. 사용자가 요청한 **'조절 중 CT/DT 그래프를 동시에 보기'**는 plot이 3개 이상이거나 상호작용 그래프가 큰 경우 크기보다 정보 손실이 발생하지 않도록 모듈별 예외 규칙을 둔다.

## 5. 안전한 단계별 확산 순서

1. **Phase A — Ch3 1개 대표 실습**: 4단계 번호·controls↔graphs 위치·non-sticky·수식 렌더링을 시범 적용하고 기존 그래프 모델과 학습 진도를 검사한다.
2. **Phase B — Ch3 전체 + Ch4 전체**: 동일 템플릿 어댑터 재사용. 모든 15개 실습을 모듈별 screenshot과 interaction에서 비교한다.
3. **Phase C — Ch2 전체**: Ch2 공통 구조 적용, convolution motion 실습은 별도 특수 시나리오로 검증.
4. **Phase D — Ch1**: 기존 Predict→Change→Observe→Explain 가이드를 중복 생성하지 않고 controls+plots 레이아웃만 개선한다.
5. **Phase E — Ch5**: inverse Laplace, ROC 3-way comparison, 클릭/드래그 상호작용을 먼저 테스트한 뒤 일반 실습을 통합한다.
6. **Phase F — Ch7·Ch8**: SVG 엔진 공통 어댑터를 각각 1개 시범 실습 후 확장한다. Ch7 sampling/aliasing, Ch8 ROC/pole-zero에 별도 수치 oracle을 추가한다.

각 단계는 시범 적용 → 회귀 검증 → 복구 가능성 확인 → 다음 장 순서로 진행한다. 56개 실습 전체를 한 번에 변경하지 않는다.

## 6. 필수 보존·QA 계약

- **Stable IDs:** 9, 9, 7, 8, 8, 6, 7, 8 = 62. URL `#chapter=N` 보존; Ch6 네이티브 예외 유지.
- **Storage keys:** `els-ss-lab-progress-v1`, `els-language`, `els-theme-v2`, `ss-unified-nav-collapsed`; 구형 키 및 알 수 없는 키 삭제 금지. 셀프 학습 확인을 채점 인증으로 오인하지 말 것.
- **Theme:** 현재 공통 테마 JS가 neutral-dark/warm-dark/navy-dark/warm-neutral/**white**를 허용한다. 각 프레임에서 실제 색상 토큰·라벨·plot 배경을 검증한다.
- **Language:** EN/KR/Mixed 변경 중 현재 슬라이더 및 화면 수학 모델 보존. 언어 교체를 이유로 `render()`을 강제 reset하지 말 것.
- **Mathematics:** Oppenheim 표기 CTFS `a_k`, CTFT `X(jω)`, LT `X(s)`, DTFT `X(e^{jΩ})`, Z `X(z)` 등 해당 장의 기호를 보존한다. KaTeX parse 오류 0, 수식 범례와 plot 일치, 축/단위 검증.
- **Viewports:** 390×844, 1280×800 (추가 1366×768), Neutral Dark/White 또는 기존 QA matrix; 조절 중 그래프 동시 가시성, 수평 overflow 없음, 일반 텍스트 명도비 4.5:1 이상.
- **Existing gates:** `tests/qa-contracts.mjs`, `tests/phase0-ss-baseline.mjs`, `tests/ss-theme-qa.mjs`, `tests/learning-aids-qa.mjs`, `tests/visual-audit.mjs`; 62×2×2 = 248 screenshot matrix. 새로운 예외 모듈에 숫자 기준의 independent oracle 추가.
- **Manual gate:** M1 그래프/축/범례, M2 독립적 수치 검산, M3 2학년 학습자 설명의 선후관계는 브라우저와 교수자 검토까지 `NOT_VERIFIED` 상태 유지.

## 7. 최종 권고

**구현 우선순위는 Ch3 → Ch4 → Ch2 → Ch1 → Ch5 → Ch7 → Ch8**이며, Ch7과 Ch8은 2단계 SVG pilot을 공통으로 설계할 수 있다. 모든 Chapter에 동일 레이아웃을 강제하기보다 공통 **언어/테마/수식/step 번호/workbench 역할**을 표준화하고, 기존 계산·모션·그래프 렌더러와 장별 학습 맥락은 보존하는 방식이 적절하다.

본 보고서는 저장소 원본 `main` 브랜치 소스, 장별 Base64 payload, 기존 QA 문서에 근거한 **정적 코드 감사** 결과다. 브라우저 스크린샷 또는 런타임 수치 재검증을 완료한 결과로 간주하지 않는다.
