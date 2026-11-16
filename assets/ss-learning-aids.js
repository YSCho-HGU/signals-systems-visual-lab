/* Non-invasive feedback and mobile step controls for existing iframe lessons.
   Not a grader: hints are conceptual. Only an existing explicit "incorrect"
   marker can trigger an automatic hint, otherwise students request it. */
(()=>{"use strict";
const frame=document.getElementById("lab-frame"),head=document.querySelector("#lab-view .lab-head");
if(!frame||!head)return;
const hintByChapter={
 1:{en:"Check the signal domain, time scaling and whether the property must hold for every input.",ko:"신호의 정의역, 시간 변환, 그리고 시스템 성질이 모든 입력에 성립해야 하는지 확인하세요."},
 2:{en:"Find overlap of nonzero supports before computing the convolution integral or sum.",ko:"컨벌루션 적분·합을 계산하기 전에 두 신호의 0이 아닌 구간이 겹치는 범위를 먼저 구하세요."},
 3:{en:"Separate the fundamental frequency from harmonic indices, and check amplitude and phase.",ko:"기본 주파수와 고조파 차수를 구분하고 진폭·위상을 확인하세요."},
 4:{en:"Recheck the CTFT sign convention and how time shifts change the complex phase.",ko:"CTFT 지수 부호 규약과 시간 이동이 복소 위상을 어떻게 바꾸는지 다시 확인하세요."},
 5:{en:"For Laplace transforms, algebraic X(s) alone is insufficient: inspect the ROC and poles.",ko:"라플라스 변환은 X(s)만으로 부족합니다. ROC와 극점을 반드시 함께 확인하세요."},
 6:{en:"DTFT is 2π-periodic. Compare magnitude/phase and the filter's gain at each frequency.",ko:"DTFT는 2π 주기입니다. 각 주파수에서 크기·위상과 필터 이득을 확인하세요."},
 7:{en:"Check Nyquist frequency and the repeated spectrum before deciding whether aliasing occurs.",ko:"에일리어싱을 판단하기 전에 나이퀴스트 주파수와 반복 스펙트럼을 확인하세요."},
 8:{en:"Check the ROC relative to poles. Causality and BIBO stability require different tests.",ko:"ROC가 극점의 어느 쪽인지 확인하고, 인과성과 BIBO 안정성 조건을 구분하세요."}
};
const style=document.createElement("style");style.textContent=`
/* Supplemental panels should extend the document, not squeeze the legacy
   iframe inside the original fixed-height lab-area. Keep its usable height. */
#lab-view .lab-area:not(.focus){height:auto!important;min-height:calc(100dvh - 78px)!important}
#lab-view .lab-area:not(.focus) .lab-frame-wrap{flex:0 0 auto!important;height:min(72dvh,850px)!important;min-height:460px!important}
@media(max-width:760px){#lab-view .lab-area:not(.focus) .lab-frame-wrap{height:65dvh!important;min-height:420px!important}}

#ss-hintbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:9px 13px;margin:8px 0 13px;border:1px solid var(--els-border,#555);border-radius:10px;background:var(--els-surface,#222);font-size:12px}
#ss-hintbar button{min-height:39px;border:1px solid var(--els-border,#777);padding:7px 12px;border-radius:8px;background:var(--els-surface-alt,#333);color:var(--els-ink,#eee);cursor:pointer}
#ss-hintbar p{margin:0;line-height:1.5;flex:1 1 260px}
.ss-touch-stepper{display:inline-flex;gap:5px;align-items:center;margin:0 5px}
.ss-touch-stepper button{min-width:38px;min-height:40px;font-size:17px;border:1px solid currentColor;border-radius:7px;background:transparent;color:inherit}
.ss-touch-stepper button:focus-visible,#ss-hintbar button:focus-visible{outline:3px solid var(--els-link,#b9d7c8);outline-offset:2px}
`;document.head.append(style);
const bar=document.createElement("section");bar.id="ss-hintbar";const btn=document.createElement("button"),txt=document.createElement("p");btn.type="button";bar.append(btn,txt);const target=document.getElementById("ss-applications")||document.getElementById("ss-progress-panel")||head;target.after(bar);
let revealed=false,seenDoc=null,observer=null;
function ch(){return Number((location.hash.match(/^#chapter=(\d+)/)||[])[1])||0}
function lang(){return window.ELSLanguage?.get()||"mixed"}
function text(pair){return lang()==="en"?pair.en:lang()==="ko"?pair.ko:pair.en+" · "+pair.ko}
function render(){
 bar.style.display=(ch()>=1&&ch()<=8)?"flex":"none";btn.textContent=lang()==="en"?"Need a hint?":lang()==="ko"?"개념 힌트 보기":"Need a hint? · 힌트 보기";
 txt.hidden=!revealed;txt.textContent=revealed?text(hintByChapter[ch()]||hintByChapter[1]):"";
}
btn.addEventListener("click",()=>{revealed=!revealed;render()});
function instrument(doc){
 if(!doc?.body)return;
 if(doc===seenDoc)return;
 seenDoc=doc;if(observer)observer.disconnect();
 const style=doc.createElement("style");style.textContent=".ss-touch-stepper{vertical-align:middle}.ss-touch-stepper button{touch-action:manipulation}";doc.head.append(style);
 function enhance(){
  const sliders=[...doc.querySelectorAll('input[type="range"]')];
  for(const input of sliders){
    if(input.dataset.ssFineControls)continue;
    input.dataset.ssFineControls="true";
    const wrapper=doc.createElement("span");wrapper.className="ss-touch-stepper";
    for(const delta of [-1,1]){
      const b=doc.createElement("button");b.type="button";b.textContent=delta<0?"−":"+";b.setAttribute("aria-label",delta<0?"Decrease slider value":"Increase slider value");
      b.addEventListener("click",()=>{
        const min=Number(input.min||"0"),max=Number(input.max||"100"),step=input.step==="any"?(max-min)/100:Number(input.step||"1");
        if(!Number.isFinite(step)||step<=0)return;
        const current=Number(input.value);const value=Math.min(max,Math.max(min,current+delta*step));
        input.value=String(Number(value.toPrecision(12)));
        input.dispatchEvent(new Event("input",{bubbles:true}));input.dispatchEvent(new Event("change",{bubbles:true}));
        input.focus({preventScroll:true});
      });
      wrapper.append(b);
    }
    input.insertAdjacentElement("afterend",wrapper);
  }
 }
 enhance();
 observer=new MutationObserver(()=>{observer.disconnect();enhance();observer.observe(doc.body,{childList:true,subtree:true})});
 observer.observe(doc.body,{childList:true,subtree:true});
 doc.addEventListener("click",event=>{
   const control=event.target.closest('button,input[type="submit"],[role="button"]');
   if(!control)return;
   setTimeout(()=>{
     const incorrect=doc.querySelector('[data-result="incorrect"], [aria-invalid="true"], .quiz-feedback.incorrect, .answer.incorrect');
     if(incorrect){revealed=true;render()}
   },30);
 });
}
// Optional chapter-level prediction check. Independent of existing lab grading.
// Wrong answers show a principle-specific hint rather than the answer.
const challenge={
 1:{en:"For x(t)=sin(2π·3t), what is its fundamental period in seconds?",ko:"x(t)=sin(2π·3t)의 기본 주기는 몇 초인가요?",ans:1/3,h1:"A sinusoid's period is the reciprocal of its frequency.",h2:"Frequency is 3 Hz. Use T=1/f.",k1:"사인파의 기본 주기는 주파수의 역수입니다.",k2:"주파수는 3 Hz입니다. T=1/f를 사용하세요."},
 2:{en:"For x=[1,2] and h=[1,1] (both start at n=0), what is y[1] after convolution?",ko:"x=[1,2], h=[1,1] (두 신호 모두 n=0 시작)일 때 컨벌루션 y[1]은?",ans:3,h1:"Write the sum y[n]=Σ x[k]h[n−k].",h2:"At n=1, there are two nonzero products.",k1:"컨벌루션 합 y[n]=Σx[k]h[n−k]을 적어 보세요.",k2:"n=1에서 0이 아닌 항 두 개를 더해야 합니다."},
 3:{en:"A signal has fundamental frequency 100 Hz. What is the frequency (Hz) of harmonic k=3?",ko:"기본 주파수가 100 Hz인 신호의 k=3 고조파 주파수(Hz)는?",ans:300,h1:"Harmonics occur at integer multiples of the fundamental frequency.",h2:"Multiply the fundamental by k.",k1:"고조파 주파수는 기본 주파수의 정수배입니다.",k2:"기본 주파수에 고조파 차수 k를 곱하세요."},
 4:{en:"A time shift x(t−2) multiplies the CTFT magnitude by what factor?",ko:"시간 이동 x(t−2)은 CTFT 크기에 몇 배를 곱하나요?",ans:1,h1:"Time shifting changes the complex exponential phase.",h2:"The magnitude of e^(−jωt₀) is one.",k1:"시간 이동은 복소지수 위상에 영향을 줍니다.",k2:"e^(−jωt₀)의 크기는 1입니다."},
 5:{en:"For x(t)=e^(−2t)u(t), the ROC is Re(s)>a. Enter a.",ko:"x(t)=e^(−2t)u(t)의 ROC가 Re(s)>a일 때 a는?",ans:-2,h1:"A right-sided exponential converges to the right of its pole.",h2:"Find the pole from s+2.",k1:"우측 지수 신호의 ROC는 극점 오른쪽입니다.",k2:"분모 s+2의 극점을 찾으세요."},
 6:{en:"DTFT repeats every how many units of π radians/sample?",ko:"DTFT의 주기는 π rad/sample 단위로 얼마인가요?",ans:2,h1:"Discrete-time frequency repeats every 2π.",h2:"Divide the period 2π by π.",k1:"이산시간 주파수 스펙트럼은 2π 주기입니다.",k2:"2π를 π로 나누어 보세요."},
 7:{en:"A band-limited signal has maximum frequency 400 Hz. What sampling rate (Hz) meets the Nyquist bound?",ko:"최대 주파수 400 Hz인 대역제한 신호의 나이퀴스트 하한 샘플링 주파수(Hz)는?",ans:800,h1:"Sampling frequency should be at least twice the maximum signal frequency.",h2:"Compute 2×400 Hz; practical designs normally include margin.",k1:"샘플링 주파수는 최대 신호 주파수의 두 배 이상이어야 합니다.",k2:"2×400 Hz를 계산하세요. 실제 설계에서는 여유를 둡니다."},
 8:{en:"For causal H(z)=1/(1−0.5z⁻¹), the ROC is |z|>a. Enter a.",ko:"인과적 H(z)=1/(1−0.5z⁻¹)의 ROC가 |z|>a일 때 a는?",ans:.5,h1:"A causal rational system has ROC outside its outermost pole.",h2:"Solve 1−0.5z⁻¹=0 for the pole.",k1:"인과적인 유리 시스템의 ROC는 가장 바깥 극점 외부입니다.",k2:"1−0.5z⁻¹=0에서 극점을 구하세요."}
};
const predict=document.createElement("section");predict.id="ss-predict-check";
predict.style.cssText="display:flex;gap:9px;align-items:center;flex-wrap:wrap;padding:10px 13px;margin:8px 0 14px;border:1px solid var(--els-border,#555);border-radius:10px;background:var(--els-surface,#222);font-size:12px";
predict.innerHTML='<strong id="ss-pc-label"></strong><label id="ss-pc-question" style="flex-basis:100%"></label><input id="ss-pc-value" type="number" step="any" inputmode="decimal" style="width:100px;min-height:40px;border:1px solid var(--els-border,#777);border-radius:8px;padding:6px;background:var(--els-surface-alt,#333);color:var(--els-ink,#fff)" aria-label="Numeric prediction"><button id="ss-pc-submit" type="button" style="min-height:40px;padding:7px 12px;border:1px solid var(--els-border,#777);border-radius:8px;background:var(--els-surface-alt,#333);color:var(--els-ink,#fff)"></button><p id="ss-pc-feedback" role="status" aria-live="polite" style="flex-basis:100%;margin:0"></p>';
bar.after(predict);
let attempts=0;
function pcRender(){
 const data=challenge[ch()];predict.style.display=data?"flex":"none";if(!data)return;
 const lng=lang();document.getElementById("ss-pc-label").textContent=lng==="ko"?"예측하고 확인하기":lng==="en"?"Predict & Check":"Predict & Check · 예측 확인";
 document.getElementById("ss-pc-question").textContent=lng==="ko"?data.ko:lng==="en"?data.en:data.en+" · "+data.ko;
 document.getElementById("ss-pc-submit").textContent=lng==="ko"?"결과 확인":lng==="en"?"Check prediction":"Check · 확인";
}
document.getElementById("ss-pc-submit").addEventListener("click",()=>{
 const c=challenge[ch()],field=document.getElementById("ss-pc-value"),feedback=document.getElementById("ss-pc-feedback");
 if(!c)return;
 const value=field.value.trim().replace(",",".");if(!value||!Number.isFinite(Number(value))){feedback.textContent=lang()==="en"?"Enter a numeric prediction.":"숫자로 예측값을 입력하세요.";return}
 if(Math.abs(Number(value)-c.ans)<.001){
  feedback.textContent=lang()==="en"?"Correct. Explain which principle supports this result.":lang()==="ko"?"정답입니다. 어떤 원리가 적용되는지 설명해 보세요.":"Correct · 정답입니다. 원리를 설명해 보세요.";
  return;
 }
 attempts++;
 const why=lang()==="ko"?(attempts===1?c.k1:c.k2):(attempts===1?c.h1:c.h2);
 feedback.textContent=(lang()==="ko"?"다시 확인: ":lang()==="en"?"Try again: ":"Hint · 힌트: ")+why;
});
function resetPredict(){
 attempts=0;const field=document.getElementById("ss-pc-value"),feedback=document.getElementById("ss-pc-feedback");field.value="";feedback.textContent="";pcRender();
}
frame.addEventListener("load",()=>{revealed=false;render();try{instrument(frame.contentDocument)}catch(e){}});
window.addEventListener("hashchange",()=>{revealed=false;render();resetPredict();setTimeout(()=>{try{instrument(frame.contentDocument)}catch(e){}},80)});
window.ELSLanguage?.subscribe(()=>{render();pcRender()});render();pcRender();
})();
