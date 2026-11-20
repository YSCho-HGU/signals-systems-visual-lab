/* Chapter 5 standalone navigation + settings + native progress.
 * No modifications to the Laplace simulation's numerical model or handlers.
 */
(function(){
"use strict";
const chapter=document.getElementById("ss5-chapter-picker");
const language=document.getElementById("ss5-language-picker");
const progress=document.getElementById("ss5-progress");
const key="els-ss-lab-progress-v1";
const names=["weight","roc","pairs","props","inverse","stability","rc","second"];
const counts=[9,9,7,8,8,6,7,8];
const total=counts.reduce((a,b)=>a+b,0);
const txt={
 en:{review:"Mark this lab reviewed",undo:"Undo reviewed",count:"My Lab Progress",note:"Self-reported study, not a graded result."},
 ko:{review:"이 실습 학습 확인",undo:"학습 확인 취소",count:"나의 실습 진도",note:"학습 확인은 채점 결과가 아닙니다."},
 mixed:{review:"Mark this lab reviewed · 학습 확인",undo:"Undo review · 취소",count:"My Lab Progress · 학습 진도",note:"Self-reported study · 채점 아님"}
};
function mode(){return window.ELSLanguage?window.ELSLanguage.get():"mixed";}
function read(){
 try{const value=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(value)?value.filter(x=>typeof x==="string"):[]}catch(e){return[]}
}
function current(){
 const id=window.__laplaceVisualLab&&window.__laplaceVisualLab.active;
 const index=names.indexOf(id);return index<0?0:index;
}
function repaint(){
 if(!progress)return;
 const list=read(),idx=current(),id="5:"+(idx+1),t=txt[mode()]||txt.mixed;
 const reviewed=list.filter(k=>/^[1-8]:[1-9]\d*$/.test(k)).length;
 progress.querySelector(".ss5-progress-caption").textContent=t.count+" "+reviewed+"/"+total;
 const button=progress.querySelector("button");
 button.textContent=list.includes(id)?t.undo:t.review;
 button.setAttribute("aria-pressed",String(list.includes(id)));
 progress.querySelector(".ss5-progress-note").textContent=t.note;
}
function mark(){
 const idx=current(),id="5:"+(idx+1),data=read();
 let next=data.includes(id)?data.filter(k=>k!==id):data.concat(id);
 try{localStorage.setItem(key,JSON.stringify(next))}catch(e){}
 repaint();
}
if(chapter){
 chapter.value="5";
 chapter.addEventListener("change",()=>{
  const target=Number(chapter.value);
  if(target===5)return;
  location.href=target===6?"./chapter6.html":"./index.html#chapter="+target;
 });
}
if(language&&window.ELSLanguage){
 window.ELSLanguage.bindSelect(language);
 window.ELSLanguage.subscribe(()=>repaint());
}
if(progress){
 progress.querySelector("button").addEventListener("click",mark);
 repaint();
}
// The Laplace renderer changes active lab without replacing the sidebar.
// Repaint once the native tab or Next button has triggered its existing handler.
const nav=document.getElementById("tabs");
if(nav)nav.addEventListener("click",()=>queueMicrotask(repaint));
const page=document.getElementById("page");
if(page)page.addEventListener("click",e=>{
 if(e.target.closest("#next"))queueMicrotask(repaint);
});
window.addEventListener("popstate",repaint);
window.addEventListener("storage",e=>{if(e.key===key)repaint()});
// Read-only status for regression checks.
window.__ss5Native={get active(){return current()},get reviewed(){return read()},
 get layout(){return document.querySelector(".ss5-site-header")?"native":"missing"}};
})();
