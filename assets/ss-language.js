/* Language presentation policy v1: mixed (default), English, Korean-first explanations.
   Preserve formulas, diagrams, graph canvases and live simulation state.
   Text updates are performed in-place; never reload a lab on language change. */
(()=>{
"use strict";
const KEY="els-language", SELECT=document.getElementById("ss-language-select");
if(!SELECT)return;
const modes=["mixed","en","ko"];
let mode="mixed";try{const saved=localStorage.getItem(KEY);if(modes.includes(saved))mode=saved}catch(e){}
SELECT.value=mode;
const T={
 "Display":["Display","화면","Display · 화면"],
 "Loading interactive experiments…":["Loading interactive experiments…","인터랙티브 실험 불러오는 중…","Loading interactive experiments… · 실험 불러오는 중"],
 "Learning Map":["Learning Map","학습 지도","Learning Map · 학습 지도"],
 "Core recommended":["Core recommended","핵심 권장","Core recommended · 핵심 권장"],
 "Optional advanced":["Optional advanced","선택 심화","Optional advanced · 선택 심화"],
 "Explore":["Explore","탐색","Explore · 탐색"],
 "Focus":["Focus","집중 화면","Focus · 집중 화면"],
 "Feedback":["Feedback","오류 제보","Feedback · 오류 제보"]
};
const goals=[
 ["Interpret basic signals and operations and test system properties.","신호의 표현과 기본 연산을 해석하고, 시스템 성질을 신호로 검증합니다."],
 ["Understand how an input and impulse response combine through LTI convolution.","LTI 시스템의 임펄스 응답과 컨벌루션 계산을 시간축·범위와 연결합니다."],
 ["Express periodic signals with Fourier coefficients and partial sums.","주기 신호를 Fourier 계수와 합성 파형으로 표현하고 CTFS/DTFS를 연결합니다."],
 ["Interpret continuous spectra of nonperiodic signals using the CTFT.","CTFT의 정의·기본 변환쌍·이동 및 시스템 응용을 시간·주파수 관점에서 비교합니다."],
 ["Explain complex frequency, ROC, poles, causality and stability.","Laplace 변환의 ROC와 극점·안정성 및 역변환의 의미를 이해합니다."],
 ["Explore DTFT periodicity, phase changes, and digital filtering.","DTFT의 주기성, 이동, 변환쌍과 필터의 주파수응답을 해석합니다."],
 ["Explain sampling, spectral replication, aliasing and reconstruction.","샘플링 정리·스펙트럼 반복·앨리어싱·복원 원리를 설명합니다."],
 ["Analyze the Z-transform, ROC, poles/zeros, causality and stability.","Z변환의 ROC·역변환·극점/영점과 인과성·안정성의 관계를 판단합니다."]
];
const descriptions=[
 ["Visualize signal domains, elementary signals, time transformations, periodicity, energy, power, and system properties.","신호의 domain, 기본 신호, 시간 변환, 주기성, 에너지·전력, 시스템 성질을 시각적으로 이해합니다."],
 ["See how a system output is formed from an input and its impulse response.","시간영역에서 입력과 임펄스 응답이 출력으로 결합되는 과정을 이해합니다."],
 ["Explore periodic signals as sums of harmonically related components.","주기신호가 조화 성분의 합으로 표현되는 원리를 관찰합니다."],
 ["Interpret continuous frequency spectra of nonperiodic continuous-time signals.","비주기 연속신호의 연속 주파수 스펙트럼을 해석합니다."],
 ["Analyze causality and stability using complex frequency, ROC, and poles.","복소주파수, ROC, 극점으로 시스템의 인과성과 안정성을 분석합니다."],
 ["Explore periodic frequency response and digital filters for discrete-time signals.","이산시간 신호의 주기적인 주파수 응답과 디지털 필터를 탐구합니다."],
 ["Explore sampling, spectral replicas, aliasing, sinc reconstruction, and ADC/DAC.","표본화 정리, 스펙트럼 복제, aliasing, sinc 복원, ADC/DAC를 실험합니다."],
 ["Analyze ROC, inverse transform, stability and FIR/IIR filtering in the z-plane.","ROC, 역변환, 인과성·안정성, FIR/IIR 필터를 복소 z-평면에서 이해합니다."]
];
const choice=([en,ko])=>mode==="en"?en:mode==="ko"?ko:en+" · "+ko;
function setText(node,arr){if(node && node.textContent!==choice(arr))node.textContent=choice(arr)}
const cleanTitle=s=>{
 const parts=s.split(/\s+\/\s+/);
 if(parts.length!==2)return s;
 return mode==="en"?parts[0]:mode==="ko"?parts[0]+" ("+parts[1]+")":parts[0]+" / "+parts[1];
};
function updateGuide(){
 const guide=document.getElementById("ss-study-guide");
 if(!guide||guide.hidden)return;
 const ch=Number((/^#chapter=(\d+)$/.exec(location.hash)||[])[1]);
 if(!(ch>=1&&ch<=8))return;
 const strong=guide.querySelector(".ss-path-heading strong");
 setText(strong,["Chapter "+ch+" · Recommended learning path","Chapter "+ch+" · 권장 학습 경로","Chapter "+ch+" · Recommended path / 권장 학습 경로"]);
 setText(guide.querySelector(".ss-path-heading p"),goals[ch-1]);
 const core=guide.querySelectorAll('[data-level="core"]').length,advanced=guide.querySelectorAll('[data-level="advanced"]').length;
 setText(guide.querySelector(".ss-path-count"),["Core "+core+" · Advanced "+advanced,"핵심 "+core+"개 · 심화 "+advanced+"개","Core "+core+" / 핵심 · Advanced "+advanced+" / 심화 "+advanced]);
 setText(guide.querySelector(".ss-path-help"),[
 "This is a recommended order. All experiments remain freely available. Start with core experiments and explore advanced topics when ready.",
 "순서는 권장안입니다. 모든 실험에 자유롭게 접근할 수 있습니다. 핵심 실험을 먼저 수행하고 심화 항목을 탐구하세요.",
 "Recommended order / 권장 순서입니다. Start with Core experiments(핵심 실험), then explore Advanced(심화) topics."
 ]);
 const summaries=guide.querySelectorAll("summary");
 setText(summaries[0],["Core recommended "+core+" · Start here","핵심 권장 "+core+"개 · 먼저 학습하기","Core recommended / 핵심 권장 "+core+"개"]);
 setText(summaries[1],["Optional advanced "+advanced+" · Explore further","선택 심화 "+advanced+"개 · 더 탐구하기","Optional advanced / 선택 심화 "+advanced+"개"]);
 const names=guide.querySelectorAll(".ss-path-name");
 names.forEach(node=>{if(!node.dataset.originalName)node.dataset.originalName=node.textContent;node.textContent=cleanTitle(node.dataset.originalName)});
 guide.querySelectorAll(".ss-path-kind").forEach(node=>setText(node,node.parentElement?.dataset.level==="core"?["Core","핵심","Core / 핵심"]:["Advanced","심화","Advanced / 심화"]));
}
function updateShell(){
 document.documentElement.lang=mode==="en"?"en":"ko";
 const langLabel=document.querySelector('label[for="ss-language-select"]');
 setText(langLabel,["Language","언어","Language · 언어"]);
 document.querySelectorAll(".chapter-card").forEach((card,index)=>{
  const id=Number(card.dataset.chapter||card.querySelector(".chapter-no")?.textContent);
  if(id>=1&&id<=8)setText(card.querySelector("p"),descriptions[id-1]);
 });
 const loading=document.querySelector("#lab-loading span");setText(loading,T["Loading interactive experiments…"]);
 const mapBtn=document.querySelector('#lab-view [data-route="map"]');if(mapBtn)setText(mapBtn,T["Learning Map"]);
 updateGuide();
}
function updateFrame(){
 const iframe=document.getElementById("lab-frame");
 let doc;try{doc=iframe?.contentDocument}catch(e){return}
 if(!doc||!doc.body)return;
 doc.documentElement.dataset.language=mode;
 doc.documentElement.lang=mode==="en"?"en":"ko";
 // Translate only verified paired headings, never erase arbitrary Korean-only instructional text.
 doc.querySelectorAll("h1,h2,h3,nav button,.tabs button").forEach(node=>{
   if(node.children.length)return;
   if(!node.dataset.languageOriginal)node.dataset.languageOriginal=node.textContent;
   const s=node.dataset.languageOriginal;
   if(s.includes(" / "))node.textContent=cleanTitle(s);
 });
}
function apply(){updateShell();updateFrame();document.dispatchEvent(new CustomEvent("ss-language-change",{detail:{mode}}))}
SELECT.addEventListener("change",()=>{mode=SELECT.value;try{localStorage.setItem(KEY,mode)}catch(e){}apply()});
const guide=document.getElementById("ss-study-guide");
if(guide)new MutationObserver(()=>{if(!guide.hidden)updateGuide()}).observe(guide,{childList:true,subtree:false,attributes:true,attributeFilter:["hidden"]});
window.addEventListener("hashchange",()=>setTimeout(apply,0));
window.__ssApplyLanguage=apply;
apply();
})();