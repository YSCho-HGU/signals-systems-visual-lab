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
 bar.hidden=!(ch()>=1&&ch()<=8);btn.textContent=lang()==="en"?"Need a hint?":lang()==="ko"?"개념 힌트 보기":"Need a hint? · 힌트 보기";
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
    if(input.dataset.ssFineControls)return;
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
frame.addEventListener("load",()=>{revealed=false;render();try{instrument(frame.contentDocument)}catch(e){}});
window.addEventListener("hashchange",()=>{revealed=false;render();setTimeout(()=>{try{instrument(frame.contentDocument)}catch(e){}},80)});
window.ELSLanguage?.subscribe(render);render();
})();
