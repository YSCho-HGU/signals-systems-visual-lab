/* Suggested S&S learning route v1.0 — source-matched experiment catalog.
   Classification = instructor-reviewable recommendation, not a graded prerequisite.
   Uses existing iframe experiment navigation; does not alter simulations. */
(() => {
"use strict";
const CATALOG={"version":"1.0.0","type":"recommended-two-tier-learning-path","audience":"2nd-year Signals and Systems","policy":"교수자에게 제안하는 권장 경로이며 공식 필수/평가 기준은 아닙니다. 장별 전체 실험은 기존대로 모두 이용할 수 있습니다.","chapters":{"1":{"goal":"신호의 표현과 기본 연산을 해석하고, 시스템 성질을 신호로 검증합니다.","experiments":[{"id":"1","name":"Continuous-Time vs Discrete-Time Signals","index":1,"level":"core"},{"id":"2","name":"Elementary Signals · Step, Impulse, Ramp","index":2,"level":"core"},{"id":"3","name":"Time Transformation Explorer","index":3,"level":"core"},{"id":"4","name":"Sinusoids & DT Periodicity","index":4,"level":"core"},{"id":"5","name":"Energy vs Average Power Analyzer","index":5,"level":"core"},{"id":"6","name":"System Properties · Definition Tester","index":6,"level":"core"},{"id":"7","name":"Even & Odd Decomposition","index":7,"level":"advanced"},{"id":"8","name":"Signal Operations · Add, Multiply, Differentiate","index":8,"level":"advanced"},{"id":"9","name":"Real-World Signal Explorer · Four Models","index":9,"level":"advanced"}]},"2":{"goal":"LTI 시스템의 임펄스 응답과 컨벌루션 계산을 시간축·범위와 연결합니다.","experiments":[{"id":"impulse","name":"Impulse Decomposition and LTI Response / 임펄스 분해와 LTI 응답","index":1,"level":"core"},{"id":"dtflip","name":"Flip → Shift → Multiply → Sum / 이산 컨벌루션의 네 단계","index":2,"level":"core"},{"id":"support","name":"Predict Convolution Support / 출력 범위 예측","index":3,"level":"core"},{"id":"ctrect","name":"Rectangular-Pulse Convolution / 사각 펄스의 겹침 면적","index":4,"level":"core"},{"id":"ctexp","name":"Convolution of Two Causal Exponentials / 인과 지수함수의 컨벌루션","index":5,"level":"advanced"},{"id":"rc","name":"RC Low-Pass Pulse Response / RC 저역통과 응답","index":6,"level":"advanced"},{"id":"average","name":"Moving-Average Sensor Filter / 센서 신호 평활화","index":7,"level":"advanced"},{"id":"network","name":"LTI Interconnections / 직렬·병렬 시스템 연결","index":8,"level":"advanced"},{"id":"stability","name":"Causality and BIBO Stability / 인과성과 BIBO 안정성","index":9,"level":"core"}]},"3":{"goal":"주기 신호를 Fourier 계수와 합성 파형으로 표현하고 CTFS/DTFS를 연결합니다.","experiments":[{"id":"harm","name":"Harmonically Related Sinusoids / 조화 정현파","index":1,"level":"core"},{"id":"rectfs","name":"CTFS of a Periodic Pulse / 주기 펄스의 CTFS","index":2,"level":"core"},{"id":"gibbs","name":"Fourier Partial Sums and Gibbs / 부분합과 깁스 현상","index":3,"level":"core"},{"id":"shift","name":"Time Shift Changes Phase / 시간 이동과 위상","index":4,"level":"core"},{"id":"dtfs","name":"Discrete-Time Fourier Series / 이산시간 푸리에 급수","index":5,"level":"core"},{"id":"filter","name":"LTI Eigenfunctions and RC Filtering / 시스템 응답","index":6,"level":"advanced"},{"id":"midpoint","name":"Value at a Jump / 불연속점의 수렴값","index":7,"level":"advanced"}]},"4":{"goal":"CTFT의 정의·기본 변환쌍·이동 및 시스템 응용을 시간·주파수 관점에서 비교합니다.","experiments":[{"id":"bridge","name":"From Fourier Series to CTFT / 선에서 연속 스펙트럼으로","index":1,"level":"core"},{"id":"rect","name":"Rectangular Pulse and Signed Sinc / 펄스와 sinc","index":2,"level":"core"},{"id":"exp","name":"Exponential Decay and Spectrum / 지수 감쇠","index":3,"level":"core"},{"id":"shiftScale","name":"Shift, Width and Phase / 이동·폭·위상","index":4,"level":"core"},{"id":"signed","name":"Signed X(jω) versus |X(jω)| / 스펙트럼 읽기","index":5,"level":"core"},{"id":"rc","name":"Convolution and RC Lowpass / 필터의 시간·주파수","index":6,"level":"core"},{"id":"mod","name":"Modulation and Spectral Copies / 변조와 이동","index":7,"level":"advanced"},{"id":"numeric","name":"Numerical CTFT from Samples / 적분의 수치 근사","index":8,"level":"advanced"}]},"5":{"goal":"Laplace 변환의 ROC와 극점·안정성 및 역변환의 의미를 이해합니다.","experiments":[{"id":"weight","name":"Fourier → Laplace / 변환의 확장","index":1,"level":"core"},{"id":"roc","name":"ROC & Signal Direction / 신호 방향","index":2,"level":"core"},{"id":"pairs","name":"Laplace Transform Pairs / 변환쌍","index":3,"level":"advanced"},{"id":"props","name":"Transform Properties / 변환 성질","index":4,"level":"core"},{"id":"inverse","name":"Inverse Laplace & ROC / 역변환","index":5,"level":"core"},{"id":"stability","name":"Pole · Zero · Stability / 안정성","index":6,"level":"core"},{"id":"rc","name":"First-Order RC System / 1차 시스템","index":7,"level":"advanced"},{"id":"second","name":"Second-Order Response / 2차 응답","index":8,"level":"advanced"}]},"6":{"goal":"DTFT의 주기성, 이동, 변환쌍과 필터의 주파수응답을 해석합니다.","experiments":[{"id":"periodic","name":"Digital Frequency / 디지털 주파수","index":1,"level":"core"},{"id":"pairs","name":"DTFT Transform Pairs / 변환쌍","index":2,"level":"core"},{"id":"phase","name":"Time Shift & Phase / 위상","index":3,"level":"core"},{"id":"phasor","name":"Phasor Summation / 복소 벡터 합","index":4,"level":"advanced"},{"id":"filter","name":"Digital Filtering / 디지털 필터링","index":5,"level":"core"},{"id":"fft","name":"DFT · FFT · Leakage / 누설","index":6,"level":"advanced"}]},"7":{"goal":"샘플링 정리·스펙트럼 반복·앨리어싱·복원 원리를 설명합니다.","experiments":[{"id":"1","name":"7.1 · Sampling Theorem / 표본화 정리","index":1,"level":"core"},{"id":"2","name":"7.2 · Spectral Replication / 스펙트럼 복제","index":2,"level":"core"},{"id":"3","name":"7.3 · Aliasing / 서로 다른 주파수, 같은 표본","index":3,"level":"core"},{"id":"4","name":"7.4 · Sinc Reconstruction / 이상적 복원","index":4,"level":"core"},{"id":"5","name":"7.5 · Anti-Aliasing Filter / ADC 이전 필터","index":5,"level":"core"},{"id":"6","name":"7.6 · Sampling vs Quantization / ADC 분해능","index":6,"level":"advanced"},{"id":"7","name":"7.7 · Zero-Order Hold vs Ideal Reconstruction","index":7,"level":"advanced"}]},"8":{"goal":"Z변환의 ROC·역변환·극점/영점과 인과성·안정성의 관계를 판단합니다.","experiments":[{"id":"1","name":"8.1 · Why the Z-Transform? / 복소 z-평면","index":1,"level":"core"},{"id":"2","name":"8.2 · Same X(z), Different ROC / 좌우 수열","index":2,"level":"core"},{"id":"3","name":"8.3 · Two-Sided Signals / 고리형 ROC","index":3,"level":"core"},{"id":"4","name":"8.4 · Inverse Z-Transform / 역변환","index":4,"level":"core"},{"id":"5","name":"8.5 · Pole Location & Frequency Response","index":5,"level":"core"},{"id":"6","name":"8.6 · FIR Moving Average / 영점과 노치","index":6,"level":"advanced"},{"id":"7","name":"8.7 · Causality & BIBO Stability / 안정성","index":7,"level":"core"},{"id":"8","name":"8.8 · Digital Sensor Smoother / 차분방정식","index":8,"level":"advanced"}]}}};
const root=document.getElementById("ss-study-guide");
const frame=document.getElementById("lab-frame");
if(!root||!frame)return;
let chapter=0;
const label={core:"핵심 권장",advanced:"선택 심화"};
function el(tag,cls,parent,text){
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(text!==undefined)node.textContent=text;
 if(parent)parent.appendChild(node);
 return node;
}
function currentChapter(){
 const m=/^#chapter=(\d+)$/.exec(location.hash);
 return m?Number(m[1]):0;
}
function lessonList(items,host,ch){
 const list=el("ol","ss-path-list",host);
 for(const exp of items){
   const item=el("li","ss-path-item",list);
   const control=el("button","ss-path-link",item);
   control.type="button";
   control.dataset.experiment=String(exp.index);
   control.dataset.chapter=String(ch);
   control.dataset.level=exp.level;
   const num=el("span","ss-path-number",control,String(exp.index).padStart(2,"0"));
   num.setAttribute("aria-hidden","true");
   el("span","ss-path-name",control,exp.name);
   const status=el("span","ss-path-kind",control,exp.level==="core"?"핵심":"심화");
   status.setAttribute("aria-hidden","true");
 }
}
function showExperiment(ch,index){
 const doc=frame.contentDocument;
 if(!doc)return false;
 if(ch===7){
  if(!frame.contentWindow?.SSChapter7?.openExperiment(index))return false;
 }else{
  const selectors=ch===1?"#nav button":ch===5?"#tabs button":
   ch===8?"#nav button":"nav.nav button[data-nav]";
  const items=[...doc.querySelectorAll(selectors)];
  const target=items[index-1];
  if(!target)return false;
  target.click();
 }
 for(const node of document.querySelectorAll(".ss-path-link")){
   const chosen=Number(node.dataset.experiment)===index;
   node.classList.toggle("selected",chosen);
   if(chosen)node.setAttribute("aria-current","step");
   else node.removeAttribute("aria-current");
 }
 for(const button of document.querySelectorAll("#ss-unified-nav .ss-unified-link")){
   const selected=Number(button.dataset.chapter)===ch&&Number(button.dataset.experiment)===index;
   button.classList.toggle("selected",selected);
   if(selected)button.setAttribute("aria-current","step");else button.removeAttribute("aria-current");
 }
 document.dispatchEvent(new CustomEvent("ss-experiment-change",{detail:{chapter:ch,index}}));
 const info=document.getElementById("ss-path-live");
 if(info)info.textContent="실험 "+index+"을(를) 열었습니다. 아래 실험 화면에서 파라미터를 바꾸고 그래프와 수식 유도를 확인하세요.";
 const interactive=doc.querySelector("main")||doc.querySelector("#content")||doc.body;
 if(interactive && typeof interactive.scrollIntoView==="function")interactive.scrollIntoView({block:"start",behavior:"instant"});
 return true;
}
function render(){
 const ch=currentChapter();
 if(!CATALOG.chapters[String(ch)]){root.hidden=true;chapter=0;return}
 if(ch===chapter&&root.childElementCount)return;
 chapter=ch;
 root.hidden=false;root.replaceChildren();
 const entry=CATALOG.chapters[String(ch)];
 const head=el("div","ss-path-head",root);
 const intro=el("div","ss-path-heading",head);
 el("strong",null,intro,"Chapter "+ch+" · 권장 학습 경로");
 el("p",null,intro,entry.goal);
 const core=entry.experiments.filter(x=>x.level==="core"),adv=entry.experiments.filter(x=>x.level==="advanced");
 el("span","ss-path-count",head,"핵심 "+core.length+"개 · 심화 "+adv.length+"개");
 const lead=el("p","ss-path-help",root,"순서는 권장안입니다. 학생은 모든 실험에 자유롭게 접근할 수 있습니다. 핵심 실험을 먼저 수행하고, 선택 심화는 필요할 때 열어 보세요.");
 const first=el("details","ss-path-core",root);
 // Closed by default: students open a short chapter pathway when needed.
 el("summary",null,first,"핵심 권장 "+core.length+"개 — 먼저 학습하기");
 lessonList(core,first,ch);
 const extra=el("details","ss-path-advanced",root);
 el("summary",null,extra,"선택 심화 "+adv.length+"개 — 더 탐구하기");
 lessonList(adv,extra,ch);
 const live=el("p","ss-path-live",root,"이름을 선택하면 아래의 기존 인터랙티브 실험으로 이동합니다.");
 live.id="ss-path-live";
 live.setAttribute("role","status");
 live.setAttribute("aria-live","polite");
}
root.addEventListener("click",event=>{
 const btn=event.target.closest(".ss-path-link");
 if(!btn)return;
 const ch=Number(btn.dataset.chapter),index=Number(btn.dataset.experiment);
 if(ch!==currentChapter())return;
 if(!showExperiment(ch,index)){
   const msg=document.getElementById("ss-path-live");
   if(msg)msg.textContent="실험 화면을 불러오는 중입니다. 화면이 표시되면 다시 선택하세요.";
 }
});
window.addEventListener("hashchange",()=>setTimeout(render,0));
frame.addEventListener("load",()=>{const msg=document.getElementById("ss-path-live");if(msg)msg.textContent="실험이 준비되었습니다. 핵심 권장 목록에서 원하는 항목을 선택하세요.";});

/* Unified chapter navigation v2: identical side navigation for Chapters 1-8.
   The original experiment buttons remain in the iframe DOM and are clicked
   through; this does not rewrite or reinitialize any simulation. */
const frameWrap=document.querySelector("#lab-view .lab-frame-wrap");
if(frameWrap){
 const css=document.createElement("style");
 css.id="ss-unified-chapter-nav-css";
 css.textContent=String.raw`
 #lab-view .lab-frame-wrap{display:flex;align-items:stretch;min-width:0;overflow:hidden}
 #lab-view .lab-frame{flex:1 1 0;width:0;min-width:0}
 #lab-view .ss-unified-nav{flex:0 0 260px;width:260px;min-width:0;display:flex;flex-direction:column;overflow:hidden;background:var(--els-surface);color:var(--els-ink);border-right:1px solid var(--els-border);transition:width .16s ease,flex-basis .16s ease}
 #lab-view .ss-unified-nav.collapsed{flex-basis:44px;width:44px}
 .ss-unified-head{display:flex;align-items:center;gap:8px;padding:10px 8px;border-bottom:1px solid var(--els-border);flex:0 0 auto}
 .ss-unified-toggle{display:grid;place-items:center;flex:0 0 28px;width:28px;height:34px;min-height:34px;border:1px solid var(--els-border);border-radius:7px;background:var(--els-surface-alt);color:var(--els-ink);font-size:18px;line-height:1}
 .ss-unified-label{font-size:12px;line-height:1.35;font-weight:800;white-space:nowrap}
 .ss-unified-body{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:8px;scrollbar-width:thin}
 .ss-unified-nav.collapsed .ss-unified-body,.ss-unified-nav.collapsed .ss-unified-label{display:none}
 .ss-unified-goal{font-size:12px;line-height:1.5;color:var(--els-muted);padding:5px 5px 12px;margin:0}
 .ss-unified-list{display:flex;flex-direction:column;gap:4px;list-style:none;margin:0;padding:0}
 .ss-unified-link{display:flex;align-items:flex-start;gap:9px;text-align:left;width:100%;min-height:42px;padding:9px 8px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--els-ink);cursor:pointer}
 .ss-unified-link:hover{background:var(--els-surface-alt)}
 .ss-unified-link.selected{background:var(--els-surface-alt);border-color:var(--els-link);box-shadow:inset 3px 0 var(--els-link);font-weight:800}
 .ss-unified-number{flex:0 0 22px;line-height:1.5;font-variant-numeric:tabular-nums;font-weight:800;color:var(--els-link)}
 .ss-unified-name{flex:1;min-width:0;overflow-wrap:anywhere;font-size:12px;line-height:1.55}
 .ss-unified-kind{font-size:10px;color:var(--els-muted);white-space:nowrap;align-self:flex-start;padding-top:2px}
 #lab-view #ss-study-guide,#lab-view #guide-toggle{display:none!important}
 #lab-view .ss-unified-link:focus-visible,.ss-unified-toggle:focus-visible{outline:3px solid var(--els-focus)!important;outline-offset:-2px}
 @media(max-width:760px){
  /* Keep the experiment iframe at viewport width minus 40px. The open
     navigation overlays the iframe instead of taking 220px from its width. */
  #lab-view .lab-frame-wrap{position:relative}
  #lab-view .ss-unified-nav{
   flex:0 0 220px;width:220px;margin-right:-180px;
   position:relative;z-index:6;box-shadow:8px 0 18px rgba(0,0,0,.20)
  }
  #lab-view .ss-unified-nav.collapsed{
   flex:0 0 40px;width:40px;margin-right:0;box-shadow:none
  }
  #lab-view .ss-unified-name{font-size:12px}
 }
 @media(prefers-reduced-motion:reduce){#lab-view .ss-unified-nav{transition:none}}
`;
 document.head.appendChild(css);
 const sidebar=el("aside","ss-unified-nav",null);
 sidebar.id="ss-unified-nav";
 sidebar.setAttribute("aria-label","Chapter experiment navigation");
 const bar=el("div","ss-unified-head",sidebar);
 const toggle=el("button","ss-unified-toggle",bar,"☰");
 toggle.type="button";
 toggle.setAttribute("aria-controls","ss-unified-body");
 const heading=el("span","ss-unified-label",bar,"Chapter experiments");
 const body=el("div","ss-unified-body",sidebar);
 body.id="ss-unified-body";
 frameWrap.insertBefore(sidebar,frame);
 let folded=window.matchMedia("(max-width:760px)").matches;
 try{
   const saved=localStorage.getItem("ss-unified-nav-collapsed");
   if(saved==="1"||saved==="0")folded=saved==="1";
 }catch(e){}
 function applyFold(){
  sidebar.classList.toggle("collapsed",folded);
  body.hidden=folded;
  toggle.textContent=folded?"☰":"‹";
  toggle.setAttribute("aria-expanded",String(!folded));
  toggle.setAttribute("aria-label",folded?"Expand chapter menu / 목차 펼치기":"Collapse chapter menu / 목차 접기");
  toggle.title=folded?"목차 펼치기":"목차 접기";
 }
 toggle.addEventListener("click",()=>{
  folded=!folded;applyFold();
  try{localStorage.setItem("ss-unified-nav-collapsed",folded?"1":"0")}catch(e){}
  try{frame.contentWindow.dispatchEvent(new Event("resize"))}catch(e){}
 });
 applyFold();
 let renderedChapter=0;
 function updateSelected(index){
  for(const button of sidebar.querySelectorAll(".ss-unified-link")){
   const chosen=Number(button.dataset.experiment)===index;
   button.classList.toggle("selected",chosen);
   if(chosen)button.setAttribute("aria-current","step");
   else button.removeAttribute("aria-current");
  }
 }
 function renderSidebar(){
  const ch=currentChapter(),entry=CATALOG.chapters[String(ch)];
  if(!entry){sidebar.hidden=true;renderedChapter=0;return}
  sidebar.hidden=false;
  if(ch===renderedChapter)return;
  renderedChapter=ch;
  heading.textContent="Chapter "+ch+" · Experiments";
  body.replaceChildren();
  el("p","ss-unified-goal",body,entry.goal);
  const list=el("ol","ss-unified-list",body);
  for(const exp of entry.experiments){
   const item=el("li",null,list);
   const button=el("button","ss-unified-link",item);
   button.type="button";
   button.dataset.experiment=String(exp.index);
   button.dataset.chapter=String(ch);
   el("span","ss-unified-number",button,String(exp.index).padStart(2,"0"));
   el("span","ss-unified-name",button,exp.name);
   el("span","ss-unified-kind",button,exp.level==="core"?"핵심":"심화");
  }
  updateSelected(1);
 }
 sidebar.addEventListener("click",e=>{
  const button=e.target.closest(".ss-unified-link");
  if(!button)return;
  const ch=Number(button.dataset.chapter),index=Number(button.dataset.experiment);
  if(ch!==currentChapter())return;
  if(showExperiment(ch,index)){
    updateSelected(index);
    if(window.matchMedia("(max-width:760px)").matches && !folded){
      folded=true;
      applyFold();
      try{localStorage.setItem("ss-unified-nav-collapsed","1")}catch(e){}
    }
  }
 });
 // Source chapter implementations differ: use their existing nav as an
 // invisible control surface, and let the host offer one consistent menu.
 const legacyNavCss=String.raw`
 html[data-ss-unified-nav] body{margin:0!important}
 html[data-ss-unified-nav] #studio-back{display:none!important}
 html[data-ss-unified-nav] .sidebar,html[data-ss-unified-nav] .shell>aside.nav{
  display:none!important
 }
 html[data-ss-unified-nav] .app,html[data-ss-unified-nav] .shell{
  display:block!important;grid-template-columns:minmax(0,1fr)!important;
  width:100%!important;max-width:100%!important;min-width:0!important;
 }
 html[data-ss-unified-nav] main.main{
  width:100%!important;max-width:100%!important;min-width:0!important;
  margin:0!important
 }
 html[data-ss-unified-nav] body>header{display:none!important}
 html[data-ss-unified-nav] body>main>nav#nav,
 html[data-ss-unified-nav] main nav#nav,
 html[data-ss-unified-nav] nav#nav{
  display:none!important
 }
 html[data-ss-unified-nav] body>main{
  max-width:100%!important;width:100%!important;
  margin:0!important;padding:12px!important
 }
 html[data-ss-unified-nav] :is(.grid,.experiment,.content,.workspace){
  min-width:0
 }
 html[data-ss-unified-nav] .topline,html[data-ss-unified-nav] .top{
  padding-top:8px!important
 }
`;
 function applyIframeLayout(){
  if(!currentChapter()||currentChapter()===7)return;
  try{
   const doc=frame.contentDocument;
   if(!doc||!doc.documentElement)return;
   doc.documentElement.dataset.ssUnifiedNav="true";
   if(!doc.getElementById("ss-unified-frame-layout")){
    const style=doc.createElement("style");
    style.id="ss-unified-frame-layout";
    style.textContent=legacyNavCss;
    doc.head.appendChild(style);
   }
  }catch(e){}
 }
 window.addEventListener("hashchange",()=>{renderSidebar();});
 frame.addEventListener("load",()=>{
  renderSidebar();
  applyIframeLayout();
  updateSelected(1);
 });
 renderSidebar();
}

render();
})();
