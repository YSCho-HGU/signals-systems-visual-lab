/* Signals & Systems optional self-reported lab completion.
   Never changes experiment values, grading, or course navigation.
   Stable lab keys are chapter:number using the existing 62-item learning-path catalog. */
(()=>{"use strict";
const KEY="els-ss-lab-progress-v1", chapterSizes=[9,9,7,8,8,6,7,8];
const total=chapterSizes.reduce((a,b)=>a+b,0);
const allowed=new Set(chapterSizes.flatMap((n,i)=>Array.from({length:n},(_,j)=>(i+1)+":"+(j+1))));
const $=id=>document.getElementById(id),frame=$("lab-frame");
if(!frame)return;
const L={en:{label:"My Lab Progress",mark:"Mark this lab reviewed",unmark:"Undo review",notgraded:"Review is self-reported, not a verified solution.",done:"Reviewed labs",selected:"Lab",hint:"Conceptual hint",hintText:"Predict before comparing the graphs. Check the signal domain, parameter units and assumptions before interpreting the result.",audio:"Hear the signal",mobile:"Fine adjust: use − / + beside the focused slider",ss:"Signals & Systems",progress:"Progress"},ko:{label:"나의 실험 진도",mark:"이 실험 학습 확인",unmark:"완료 기록 취소",notgraded:"학습 확인은 자기보고이며 정답 인증이 아닙니다.",done:"학습 확인한 실험",selected:"실험",hint:"개념 힌트",hintText:"그래프를 보기 전에 결과를 예측하고 신호의 영역, 변수 단위, 조건을 확인해 보세요.",audio:"소리로 듣기",mobile:"미세 조절: 슬라이더 선택 후 − / + 사용",ss:"신호 및 시스템",progress:"진도"},mixed:{label:"My Lab Progress · 실험 진도",mark:"Mark reviewed · 학습 확인",unmark:"Undo review · 취소",notgraded:"Self-reported review · 정답이나 평가 점수 인증이 아닙니다.",done:"Reviewed · 완료",selected:"Lab · 실험",hint:"Conceptual hint · 개념 힌트",hintText:"Predict first. Check domain, units and assumptions. · 영역, 단위, 조건을 먼저 점검하세요.",audio:"Hear signal · 소리 듣기",mobile:"Fine adjust · 슬라이더를 선택하고 − / +로 미세 조절",ss:"Signals & Systems · 신호 및 시스템",progress:"Progress · 진도"}};
function lang(){return window.ELSLanguage?.get()||"mixed"}function t(k){return L[lang()][k]}
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||"[]");return new Set(Array.isArray(x)?x.filter(v=>allowed.has(v)):[])}catch(e){return new Set()}}
let done=read();function save(){try{localStorage.setItem(KEY,JSON.stringify([...done].sort()))}catch(e){}}
function current(){
 const ch=Number((location.hash.match(/^#chapter=(\d+)/)||[])[1]);
 if(!chapterSizes[ch-1])return null;
 const selected=document.querySelector("#ss-unified-nav .ss-unified-link.selected");
 const index=selected?Number(selected.dataset.experiment):1;
 return allowed.has(ch+":"+index)?ch+":"+index:null;
}
const style=document.createElement("style");style.textContent=`
#ss-progress-panel{display:flex;align-items:center;gap:9px;flex-wrap:wrap;padding:10px 14px;margin:9px 0;border:1px solid var(--els-border,#555);border-radius:10px;background:var(--els-surface,#222);font-size:12px}
#ss-progress-panel button{font:inherit;min-height:38px;border:1px solid var(--els-border,#777);background:var(--els-surface-alt,#333);border-radius:8px;color:var(--els-ink,#fff);padding:7px 10px;cursor:pointer}
#ss-progress-panel button:focus-visible{outline:3px solid var(--els-link,#b8d7c8);outline-offset:2px}
#ss-progress-panel .ss-progress-meter{width:120px;max-width:100%;height:9px;border-radius:20px;background:var(--els-surface-alt,#444);overflow:hidden}
#ss-progress-panel .ss-progress-meter span{display:block;height:100%;background:var(--els-link,#b8d7c8);width:0}
#ss-progress-panel .ss-progress-note{flex-basis:100%;color:var(--els-muted,#ccc)}
#ss-unified-nav .ss-unified-link[data-reviewed="true"] .ss-unified-number::after{content:" ✓";color:var(--els-link,#b8d7c8)}
@media(max-width:600px){#ss-progress-panel{padding:9px;gap:7px}#ss-progress-panel button{min-height:44px}#ss-progress-panel .ss-progress-meter{flex:1;min-width:80px}}
`;document.head.append(style);
const panel=document.createElement("section");panel.id="ss-progress-panel";panel.setAttribute("aria-label","Self-reported lab progress");
const label=document.createElement("strong"),bar=document.createElement("div"),fill=document.createElement("span"),pct=document.createElement("span"),btn=document.createElement("button"),note=document.createElement("span");
bar.className="ss-progress-meter";bar.setAttribute("role","progressbar");bar.setAttribute("aria-valuemin","0");bar.setAttribute("aria-valuemax",String(total));bar.append(fill);note.className="ss-progress-note";btn.type="button";panel.append(label,bar,pct,btn,note);
const top=document.querySelector("#lab-view .lab-head");if(top)top.after(panel);
const homeActions=document.querySelector("#overview .ss-home-actions");
const homeLink=document.createElement("a");
homeLink.href="https://yscho-hgu.github.io/engineering-learning-studio/progress/";
homeLink.style.cssText="display:inline-flex;align-items:center;gap:6px;margin:8px 0;padding:7px 10px;border:1px solid var(--els-border,#555);border-radius:9px;color:var(--els-link,#b9d7c8);font-size:12px";
if(homeActions)homeActions.after(homeLink);
function placeProgress(){
 const ch=Number((location.hash.match(/^#chapter=(\d+)/)||[])[1]);
 const outer=ch===7?document.querySelector("#ss-unified-nav .ss-unified-body"):null;
 if(panel.ownerDocument!==document)document.adoptNode(panel);
 if(outer){
  if(panel.parentElement!==outer)outer.appendChild(panel);
 }else if(top&&panel.parentElement!==top.parentElement){
  top.after(panel);
 }
}
function update(){
 placeProgress();
 const cur=current();label.textContent=t("label");const n=done.size;
 homeLink.textContent=t("label")+" "+n+"/"+total+" · "+Math.round(100*n/total)+"% ↗";fill.style.width=100*n/total+"%";pct.textContent=n+"/"+total+" · "+Math.round(100*n/total)+"%";
 bar.setAttribute("aria-valuenow",String(n));bar.setAttribute("aria-label",t("progress"));
 btn.disabled=!cur;btn.textContent=cur&&done.has(cur)?t("unmark"):t("mark");
 note.textContent=t("notgraded");
 for(const link of document.querySelectorAll("#ss-unified-nav .ss-unified-link"))link.dataset.reviewed=done.has(link.dataset.chapter+":"+link.dataset.experiment)?"true":"false";
}
btn.addEventListener("click",()=>{const cur=current();if(!cur)return;if(done.has(cur))done.delete(cur);else done.add(cur);save();update()});
document.addEventListener("click",e=>{if(e.target.closest("#ss-unified-nav .ss-unified-link, .ss-path-link"))setTimeout(update,0)});
window.addEventListener("hashchange",()=>setTimeout(update,50));
frame.addEventListener("load",()=>setTimeout(update,50));
window.addEventListener("storage",e=>{if(e.key===KEY){done=read();update()}});
window.ELSLanguage?.subscribe(update);
const obs=new MutationObserver(()=>{if(!document.hidden)update()});const side=document.getElementById("ss-unified-nav");if(side)obs.observe(side,{subtree:true,attributes:true,attributeFilter:["class"]});
update();
})();