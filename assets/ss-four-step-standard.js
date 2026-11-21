/* Signals & Systems four-step learning layout adapter.
 * Chapter 6.1 is the reference. Embedded chapters retain all existing numerical
 * models, controls, charts, derivation handlers, navigation, and progress storage.
 * Only existing DOM nodes are moved; no cloned input or canvas nodes.
 */
(()=>{"use strict";
const HEAD=(n,en,ko)=>{const d=document.createElement("div");d.className="ss-standard-stage-head";d.innerHTML='<span class="ss-standard-number" aria-hidden="true">'+n+'</span><strong>'+en+' / '+ko+'</strong>';return d};
function titleKey(){const h=document.querySelector(".heading h2,#title");return (h?.textContent||"lab").replace(/\s+/g," ").trim().slice(0,70)}
function predict(){
 const p=document.createElement("section");p.className="ss-standard-predict ss-standard-stage";p.dataset.ssStep="1";p.append(HEAD(1,"Predict","예측"));
 const detail=document.createElement("p");detail.className="ss-standard-instruction";
 detail.textContent="Before changing a control, predict how the plotted signal or spectrum will respond. / 변수를 변경하기 전에 그래프가 어떻게 변할지 예측해 보세요.";p.append(detail);
 const area=document.createElement("textarea");area.className="ss-standard-prediction-note";area.rows=2;
 area.setAttribute("aria-label","My prediction / 나의 예측");
 area.placeholder="My prediction / 나의 예측";p.append(area);
 const key="els-ss-predict-v1:"+location.pathname+":"+titleKey();
 try{area.value=localStorage.getItem(key)||""}catch(_){}
 area.addEventListener("input",()=>{try{localStorage.setItem(key,area.value)}catch(_){}});
 return p;
}
function enhanceNativeGrid(){
 const exp=document.querySelector("#content>.experiment"),left=exp?.querySelector(":scope>.controls"),right=exp?.querySelector(":scope>.body-col");
 if(!exp||!left||!right||exp.dataset.ssStandardApplied)return false;
 exp.dataset.ssStandardApplied="true";
 exp.before(predict());
 left.classList.add("ss-standard-stage","ss-standard-controls");left.dataset.ssStep="2";
 left.insertBefore(HEAD(2,"Adjust","변수 조절"),left.firstChild);
 right.classList.add("ss-standard-stage","ss-standard-observe");right.dataset.ssStep="3";
 right.insertBefore(HEAD(3,"Observe","그래프 관찰"),right.firstChild);
 const follow=document.createElement("div");follow.className="ss-standard-followup";
 follow.dataset.ssStep="4";follow.append(HEAD(4,"Explain & Check","수식 유도 · 해석 · 확인"));
 let moved=0;
 for(const name of [".derivation-panel",".reading-panel",".learning",".question"]){
  const section=right.querySelector(":scope>"+name);
  if(section){follow.append(section);moved++}
 }
 if(moved)exp.after(follow);
 return true;
}
function enhanceLegacyGrid(){
 const exp=document.querySelector("main>.experiment"),left=exp?.querySelector(":scope>.card:first-child"),right=exp?.querySelector(":scope>aside.card");
 if(!exp||!left||!right||exp.dataset.ssStandardApplied)return false;
 const controls=left.querySelector("#controls"),plots=left.querySelector("#plots");
 if(!controls||!plots)return false;
 exp.dataset.ssStandardApplied="true";exp.classList.add("ss-standard-intro-only");
 const predictStage=predict();
 const work=document.createElement("div");work.className="ss-standard-workspace";
 const controlStage=document.createElement("section");controlStage.className="ss-standard-stage ss-standard-controls";
 controlStage.dataset.ssStep="2";controlStage.append(HEAD(2,"Adjust","변수 조절"),controls);
 const plotStage=document.createElement("section");plotStage.className="ss-standard-stage ss-standard-observe";
 plotStage.dataset.ssStep="3";plotStage.append(HEAD(3,"Observe","그래프 관찰"),plots);
 for(const selector of ["#metrics"]){const el=left.querySelector(selector);if(el)plotStage.append(el)}
 work.append(controlStage,plotStage);
 const follow=document.createElement("section");follow.className="ss-standard-stage ss-standard-followup";
 follow.dataset.ssStep="4";follow.append(HEAD(4,"Explain & Check","수식 유도 · 해석 · 확인"));
 const insight=left.querySelector("#insight");
 if(insight)follow.append(insight);
 const hint=left.querySelector(".hint");if(hint)plotStage.append(hint);
 follow.append(right);
 exp.after(predictStage,work,follow);
 return true;
}
function apply(){
 if(document.querySelector("#content>.experiment>.body-col"))return enhanceNativeGrid();
 if(document.querySelector("main>.experiment>.card:first-child"))return enhanceLegacyGrid();
 return false;
}
function ready(){
 apply();
 const root=document.getElementById("content");
 // Chapter 2-4 replace #content on every experiment, but not the page itself.
 if(root){
  const observer=new MutationObserver(()=>apply());
  observer.observe(root,{childList:true});
 }
 window.__ssLearningStandard={apply,version:"1.0",reference:"Chapter 6.1"};
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready,{once:true});else ready();
})();