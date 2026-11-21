/* Chapter 8: source-faithful LaTeX presentation for all 32 derivation steps.
 * The mathematical model, input controls and plots are never modified. */
(function(){
'use strict';
const EQ=[["X(z)=\\sum_{n=-\\infty}^{\\infty}x[n]z^{-n}","X(z)=\\sum_{n=0}^{\\infty}(az^{-1})^n","X(z)=\\frac{1}{1-az^{-1}},\\quad |z|>|a|","z=a,\\quad \\mathrm{ROC}:\\ |z|>|a|"],["X(z)=\\frac{1}{1-az^{-1}}\\qquad(\\text{same algebraic expression})","x_R[n]=a^nu[n],\\qquad \\mathrm{ROC}:|z|>|a|","x_L[n]=-a^nu[-n-1],\\qquad \\mathrm{ROC}:|z|<|a|","(X(z),\\mathrm{ROC})\\longleftrightarrow x[n]"],["X_R(z)=\\frac{1}{1-az^{-1}},\\quad |z|>a","X_L(z)=\\frac{1}{1-bz^{-1}},\\quad |z|<b","X(z)=\\frac{z(2z-a-b)}{(z-a)(z-b)},\\quad a<|z|<b","0<a<1<b\\ \\Rightarrow\\ |z|=1\\text{ lies in ROC}"],["X(z)=\\frac1{(1-az^{-1})(1-bz^{-1})}","X(z)=\\frac{A}{1-az^{-1}}+\\frac{B}{1-bz^{-1}},\\quad A=\\frac{-a}{b-a},\\ B=\\frac{b}{b-a}","\\begin{cases}|z|>b:\\ RR\\\\a<|z|<b:\\ RL\\\\|z|<a:\\ LL\\end{cases}","x[n]=x_1[n]+x_2[n],\\quad\\mathcal Z\\{x[n]\\}=X(z)"],["y[n]=ay[n-1]+(1-a)x[n]","H(z)=\\frac{1-a}{1-az^{-1}}","z_p=a,\\quad\\mathrm{ROC}:\\ |z|>|a|","|H(e^{j\\Omega})|=\\frac{|1-a|}{\\sqrt{1+a^2-2a\\cos\\Omega}}"],["y[n]=\\frac1N\\sum_{k=0}^{N-1}x[n-k]","H(e^{j\\Omega})=\\frac1N\\sum_{k=0}^{N-1}e^{-j\\Omega k}","H(z)=\\frac1N\\sum_{k=0}^{N-1}z^{-k}","z_m=e^{j2\\pi m/N}\\ (m=1,\\ldots,N-1),\\quad\\mathrm{ROC}:|z|>0"],["h[n]=a^nu[n]\\quad\\mathrm{or}\\quad h[n]=-a^nu[-n-1]","S(M)=\\sum_{k=0}^{M-1}|h[k]|\\quad(\\text{right-sided})","\\text{Right-sided: }a<1,\\quad\\text{left-sided: }a>1","\\text{BIBO stable}\\iff\\sum_n|h[n]|<\\infty\\iff |z|=1\\text{ in ROC}"],["y[n]=ay[n-1]+(1-a)x[n]","\\mathcal Z\\{y[n-1]\\}=z^{-1}Y(z)","H(z)=\\frac{Y(z)}{X(z)}=\\frac{1-a}{1-az^{-1}}","h[n]=(1-a)a^nu[n],\\quad H(e^{j\\Omega})=H(z)|_{z=e^{j\\Omega}}"]];
const KEY=[0,0,2,1,1,2,3,2];
let pending=false;
function render(){
 pending=false;
 if(typeof window.katex?.render!=='function')return;
 const lesson=window.SSChapter8?.currentExperiment||1;
 const row=EQ[lesson-1];if(!row)return;
 const key=document.getElementById('ss8-key-equation');
 if(key&&key.dataset.ss8Math!==String(lesson)){
  const latex=row[KEY[lesson-1]];
  try{window.katex.render(latex,key,{displayMode:true,throwOnError:true,strict:'ignore'});key.dataset.ss8Math=String(lesson);key.setAttribute('aria-label',latex)}
  catch(e){key.textContent=latex;console.warn('Ch8 key math fallback',lesson,e)}
 }
 const container=document.getElementById('step-content');
 if(!container)return;
 const all=window.SSChapter8?.showAll;
 const current=window.SSChapter8?.stepIndex||0;
 container.querySelectorAll('.step .math').forEach((element,i)=>{
  const index=all?i:current,latex=row[index];
  if(!latex)return;
  if(element.dataset.ss8Math===lesson+':'+index)return;
  try{window.katex.render(latex,element,{displayMode:true,throwOnError:true,strict:'ignore'});element.dataset.ss8Math=lesson+':'+index;element.setAttribute('aria-label',latex)}
  catch(e){console.warn('Chapter 8 derivation fallback',lesson,index,e)}
 });
}
function request(){if(pending)return;pending=true;queueMicrotask(render)}
function setup(){
 const steps=document.getElementById('step-content');if(!steps)return;
 new MutationObserver(request).observe(steps,{childList:true,subtree:false});
 const title=document.getElementById('title');
 if(title)new MutationObserver(request).observe(title,{childList:true,characterData:true,subtree:true});
 window.addEventListener('load',request);
 document.addEventListener('ss-ch8-experiment-change',request);
 window.__ss8MathAudit={formulas:32,lessons:8,request};
 request();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();