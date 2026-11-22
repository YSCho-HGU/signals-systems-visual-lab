/* Language presentation policy v1: mixed (default), English, Korean-first explanations.
   Preserve formulas, diagrams, graph canvases and live simulation state.
   Text updates are performed in-place; never reload a lab on language change. */
(()=>{
"use strict";
const language=window.ELSLanguage;
if(!language)throw Error("Load assets/els-language.js before ss-language.js");
const SELECT=document.getElementById("ss-language-select");
if(!SELECT)return;
const modes=language.modes;
const stored=(()=>{try{return localStorage.getItem(language.key)}catch(e){return null}})();
if(!modes.includes(stored)){
 try{const requested=new URLSearchParams(location.search).get("lang");
 if(modes.includes(requested))language.set(requested)}catch(e){}
}
let mode=language.get();
language.bindSelect(SELECT);
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

/* Mode-safe translation of existing bilingual text within experiments.
   Never hide untranslated instructional text: language QA flags any remaining Hangul. */
const TEXT_ORIGINAL=new WeakMap(),OBSERVERS=new WeakMap(),HANGUL=/[가-힣]/;
const COMMON={
 "✎ 오류 제보":["Report an issue","오류 제보"],
 "GUIDED EXPLANATION · 단계별 이해":["GUIDED EXPLANATION","단계별 이해"],
 "CHECK YOURSELF · 스스로 확인":["CHECK YOURSELF","스스로 확인"],
 "Show answer / 해설 보기":["Show answer","해설 보기"],
 "LEARNING EXPERIMENTS / 학습 주제":["LEARNING EXPERIMENTS","학습 주제"],
 "Learning sequence / 학습 순서":["Learning sequence","학습 순서"],
 "Graph probe / 그래프 값 읽기":["Graph probe","그래프 값 읽기"],
 "Complex-plane probe / 복소평면 좌표":["Complex-plane probe","복소평면 좌표"],
 "Sampled Signals / 샘플 신호":["Sampled Signals","샘플 신호"],
 "DTFT Periodicity / 주기성":["DTFT Periodicity","주기성"],
 "ROC 내부 (boundary excluded)":["Inside ROC (boundary excluded)","ROC 내부 (경계 제외)"],
 "ROC 외부 또는 경계":["Outside ROC or on boundary","ROC 외부 또는 경계"],
 "이산 표본":["Discrete sample","이산 표본"],
 "계산 표본 (보간 없음)":["Computed sample (no interpolation)","계산 표본 (보간 없음)"],
 "f(x) 직접 계산":["Direct evaluation of f(x)","f(x) 직접 계산"],
 "표시 범위 밖":["Outside displayed range","표시 범위 밖"],
 "먼저 학습하기":["Start here","먼저 학습하기"],
 "선택 심화":["Optional advanced","선택 심화"],
 "핵심 권장":["Core recommended","핵심 권장"]
};
const EXACT=new Map(Object.entries(COMMON));
function translatedText(original){
 const t=original.trim();
 if(!HANGUL.test(t))return original;
 const lead=original.match(/^\s*/)?.[0]||"",tail=original.match(/\s*$/)?.[0]||"";
 if(EXACT.has(t)){
  const [en,ko]=EXACT.get(t);
  return lead+(mode==="en"?en:mode==="ko"?en+" ("+ko+")":en+" / "+ko)+tail;
 }
 // Only infer alignment when English and Korean are separated by an unambiguous slash.
 const slash=t.match(/^(.+?)\s+\/\s+(.+)$/);
 if(slash && !HANGUL.test(slash[1]) && HANGUL.test(slash[2])){
  return lead+(mode==="en"?slash[1]:mode==="ko"?slash[1]+" ("+slash[2]+")":slash[1]+" / "+slash[2])+tail;
 }
 // Untranslated Korean stays visible for educational integrity, and is reported by QA.
 return original;
}
function translateTextNode(node){
 const host=node.parentElement;
 if(!host||host.closest("script,style,textarea,code,pre,math,svg"))return;
 let record=TEXT_ORIGINAL.get(node);
 if(!record||record.last!==node.nodeValue){
  record={original:node.nodeValue,last:node.nodeValue};
  TEXT_ORIGINAL.set(node,record);
 }
 const next=translatedText(record.original);
 if(node.nodeValue!==next)node.nodeValue=next;
 record.last=next;
}
function translateTree(root){
 if(!root||!root.createTreeWalker)return;
 const view=root.defaultView;
 const walker=root.createTreeWalker(root.body||root,view?.NodeFilter?.SHOW_TEXT||4);
 let node;while((node=walker.nextNode()))translateTextNode(node);
 // Never update value of any live input, selected item, plot, or simulator control.
 const elements=(root.body||root).querySelectorAll?.("[title],[aria-label]")||[];
 for(const el of elements){
  for(const attr of ["title","aria-label"]){
   if(!el.hasAttribute(attr))continue;
   const key="data-ss-orig-"+attr;
   if(!el.hasAttribute(key))el.setAttribute(key,el.getAttribute(attr));
   const translated=translatedText(el.getAttribute(key));
   if(el.getAttribute(attr)!==translated)el.setAttribute(attr,translated);
  }
 }
}
function watchFrame(doc){
 if(!doc?.body)return;
 if(OBSERVERS.has(doc))return;
 let scheduled=false;
 const observer=new MutationObserver(mutations=>{
  if(scheduled)return;
  if(!mutations.some(m=>m.type==="characterData"||m.type==="childList"))return;
  scheduled=true;
  queueMicrotask(()=>{scheduled=false;translateTree(doc)});
 });
 observer.observe(doc.body,{subtree:true,childList:true,characterData:true});
 OBSERVERS.set(doc,observer);
}

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
 document.documentElement.lang=mode==="en"?"en":"ko";document.documentElement.dataset.language=mode;
 const langLabel=document.querySelector('label[for="ss-language-select"]');
 // Never replace label.textContent: the select is a child of this label.
 const labelText=langLabel?.querySelector('.ss-language-label-text');
 if(labelText)setText(labelText,["Language","언어","Language · 언어"]);
 document.querySelectorAll(".chapter-card").forEach((card,index)=>{
  const id=Number(card.dataset.chapter||card.querySelector(".chapter-no")?.textContent);
  if(id>=1&&id<=8)setText(card.querySelector("p"),descriptions[id-1]);
 });
 const loading=document.querySelector("#lab-loading span");setText(loading,T["Loading interactive experiments…"]);
 const mapBtn=document.querySelector('#lab-view [data-route="map"]');if(mapBtn)setText(mapBtn,T["Learning Map"]);
 updateGuide();
}

const originalText=new WeakMap();
const korean=/[가-힣]/;
let frameObserver=null,observedDoc=null,translationBusy=false;
const KO_ONLY={
 "전체 초기화":"Reset all",
 "초기화":"Reset",
 "다음 실험 →":"Next experiment →",
 "이전 실험":"Previous experiment",
 "학습 주제":"Learning topics",
 "학습 순서":"Learning sequence",
 "스스로 확인":"Check yourself",
 "해설 보기":"Reveal explanation",
 "핵심 이해":"Key insight",
 "실험 변수":"Experiment controls",
 "결과 관찰":"Observe the result",
 "정답 및 설명 보기":"Reveal answer and explanation",
 "자동 재생":"Auto play",
 "일시 정지":"Pause",
 "설치 불필요":"No installation needed",
 "오류 제보":"Report an issue"
};
function translateText(s){
 if(!korean.test(s))return s;
 const trim=s.trim();
 if(KO_ONLY[trim])return mode==="en"?s.replace(trim,KO_ONLY[trim]):mode==="mixed"?s.replace(trim,KO_ONLY[trim]+" / "+trim):s;
 const paired=/^([\s\S]*?[A-Za-z][\s\S]*?)\s+\/\s+([^\/]*[가-힣][\s\S]*)$/;
 const m=trim.match(paired);
 if(!m)return s; // Never silently hide unpaired instructional Korean.
 const english=m[1].trim(),ko=m[2].trim(), leading=s.slice(0,s.indexOf(trim));
 const rendered=mode==="en"?english:mode==="ko"?english+" ("+ko+")":english+" / "+ko;
 return leading+rendered+s.slice(s.indexOf(trim)+trim.length);
}
function applyTextTree(doc){
 const walker=doc.createTreeWalker(doc.body,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){
  const owner=node.parentElement;
  if(!owner || owner.closest('script,style,svg,canvas,math,textarea,code,pre,[contenteditable],.katex'))continue;
  const source=originalText.get(node)??node.nodeValue;
  // An experiment redraw can reuse the same element with new content; capture it.
  const previous=translateText(source);
  if(originalText.has(node)&&node.nodeValue!==previous&&node.nodeValue!==source){
   originalText.set(node,node.nodeValue);
  }else if(!originalText.has(node))originalText.set(node,source);
  const current=originalText.get(node);
  const translated=translateText(current);
  if(node.nodeValue!==translated)node.nodeValue=translated;
 }
}
function installFrameTranslations(doc){
 if(observedDoc!==doc){
  if(frameObserver)frameObserver.disconnect();
  observedDoc=doc;
  frameObserver=new MutationObserver(()=>{
   if(translationBusy)return;
   translationBusy=true;
   queueMicrotask(()=>{translationBusy=false;if(observedDoc===doc)applyTextTree(doc)});
  });
  frameObserver.observe(doc.body,{subtree:true,childList:true,characterData:true});
 }
 applyTextTree(doc);
}

function updateFrame(){
 const iframe=document.getElementById("lab-frame");
 let doc;try{doc=iframe?.contentDocument}catch(e){return}
 if(!doc||!doc.body)return;
 doc.documentElement.dataset.language=mode;
 doc.documentElement.lang=mode==="en"?"en":"ko";
 // Translate verified bilingual instructional strings in place, including dynamic panels.
 translateTree(doc);
 watchFrame(doc);
 // Preserve original interactive elements, plots, inputs and their state.
 // Dynamic lessons update labels after each control change. Keep their original
 // bilingual text so toggling languages is reversible and never resets input state.
 installFrameTranslations(doc);

}
function apply(){updateShell();updateFrame();document.dispatchEvent(new CustomEvent("ss-language-change",{detail:{mode}}))}
language.subscribe(next=>{
 if(next===mode)return;
 mode=next;
 apply();
});
const guide=document.getElementById("ss-study-guide");
if(guide)new MutationObserver(()=>{if(!guide.hidden)updateGuide()}).observe(guide,{childList:true,subtree:false,attributes:true,attributeFilter:["hidden"]});
window.addEventListener("hashchange",()=>setTimeout(apply,0));
window.__ssApplyLanguage=apply;
apply();
})();