/* Chapter 8: source-faithful LaTeX presentation for all 32 derivation steps.
 * The mathematical model, input controls and plots are never modified. */
(function(){
'use strict';
const EQ=[["X(z)=\\sum_{n=-\\infty}^{\\infty}x[n]z^{-n}","X(z)=\\sum_{n=0}^{\\infty}(az^{-1})^n","X(z)=\\frac{1}{1-az^{-1}},\\quad |z|>|a|","z=a,\\quad \\mathrm{ROC}:\\ |z|>|a|"],["X(z)=\\frac{1}{1-az^{-1}}","X(z)=\\sum_{n=0}^{\\infty}a^nz^{-n},\\quad|z|>|a|","X(z)=-\\sum_{k=1}^{\\infty}a^{-k}z^k,\\quad|z|<|a|","(X(z),\\mathrm{ROC})\\longleftrightarrow x[n]"],["a^nu[n]\\longleftrightarrow\\frac{1}{1-az^{-1}},\\quad|z|>|a|","-b^nu[-n-1]\\longleftrightarrow\\frac{1}{1-bz^{-1}},\\quad|z|<|b|","\\mathrm{ROC}:\\quad |a|<|z|<|b|","|a|<1<|b|\\implies |z|=1\\text{ lies within ROC}"],["X(z)=\\frac{1}{1-az^{-1}}","|z|>|a|\\quad\\mathrm{or}\\quad|z|<|a|","X(z)=\\begin{cases}\\sum_{n=0}^\\infty a^nz^{-n},&|z|>|a|\\\\-\\sum_{k=1}^\\infty a^{-k}z^k,&|z|<|a|\\end{cases}","x[n]=\\begin{cases}a^nu[n],&|z|>|a|\\\\-a^nu[-n-1],&|z|<|a|\\end{cases}"],["y[n]=ay[n-1]+(1-a)x[n]","H(z)=\\frac{1-a}{1-az^{-1}}","z_p=a,\\quad\\mathrm{ROC}:\\ |z|>|a|","|H(e^{j\\Omega})|=\\frac{|1-a|}{\\sqrt{1+a^2-2a\\cos\\Omega}}"],["H(z)=\\frac1N\\sum_{k=0}^{N-1}z^{-k}","H(z)=\\frac{1-z^{-N}}{N(1-z^{-1})},\\quad z\\ne1","z^N=1,\\quad z\\ne1","\\Omega_m=\\frac{2\\pi m}{N},\\quad m=1,\\dots,N-1"],["h[n]=0,\\qquad n<0","\\mathrm{ROC}:\\ |z|>\\max_k|p_k|\\quad(\\text{causal rational }H)","\\sum_{n=-\\infty}^{\\infty}|h[n]|<\\infty","\\text{BIBO stable}\\iff |z|=1\\text{ lies in ROC}"],["y[n]=ay[n-1]+(1-a)x[n]","\\mathcal Z\\{y[n-1]\\}=z^{-1}Y(z)","H(z)=\\frac{Y(z)}{X(z)}=\\frac{1-a}{1-az^{-1}}","h[n]=(1-a)a^nu[n],\\quad H(e^{j\\Omega})=H(z)|_{z=e^{j\\Omega}}"]];
const KEY=[0,0,2,2,1,1,3,2];
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