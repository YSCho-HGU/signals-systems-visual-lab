/* Chapter 8: source-faithful LaTeX presentation for all 32 derivation steps.
 * The mathematical model, input controls and plots are never modified. */
(function(){
'use strict';
const EQ=[["X(z)=\\sum_{n=-\\infty}^{\\infty}x[n]z^{-n}","X(z)=\\sum_{n=0}^{\\infty}(az^{-1})^n","X(z)=\\frac{1}{1-az^{-1}},\quad |z|>|a|","z=a,\quad \\mathrm{ROC}:\\ |z|>|a|"],["H(z)=\\frac{1}{1-az^{-1}}\quad(\text{same algebraic expression})","h_R[n]=a^nu[n],\\qquad\\mathrm{ROC}:|z|>|a|","h_L[n]=-a^nu[-n-1],\\qquad\\mathrm{ROC}:|z|<|a|","(H(z),\\mathrm{ROC})\\longleftrightarrow h[n]"],["X_R(z)=\\frac{1}{1-az^{-1}},\quad |z|>a","X_L(z)=\\frac{1}{1-bz^{-1}},\quad |z|<b","X(z)=\\frac{z(2z-a-b)}{(z-a)(z-b)},\quad a<|z|<b","0<a<1<b\\ \\Rightarrow\\ |z|=1\text{ lies in ROC}"],["X(z)=\\frac1{(1-az^{-1})(1-bz^{-1})}","\\begin{aligned}1&=A(1-bz^{-1})+B(1-az^{-1})\\\\ A+B&=1,\\qquad bA+aB=0\\\\ A&=-\\frac{a}{b-a},\quad B=\\frac{b}{b-a}\\end{aligned}","\\begin{cases}|z|>b:\\ RR\\\\a<|z|<b:\\ RL\\\\|z|<a:\\ LL\\end{cases}","x[n]=x_1[n]+x_2[n],\quad\\mathcal Z\\{x[n]\\}=X(z)"],["y[n]=ay[n-1]+(1-a)x[n]","H(z)=\\frac{1-a}{1-az^{-1}}","z_p=a,\quad\\mathrm{ROC}:\\ |z|>|a|","|H(e^{j\\Omega})|=\\frac{|1-a|}{\\sqrt{1+a^2-2a\\cos\\Omega}}"],["y[n]=\\frac1N\\sum_{k=0}^{N-1}x[n-k]","H(e^{j\\Omega})=\\frac1N\\sum_{k=0}^{N-1}e^{-j\\Omega k}","H(z)=\\frac1N\\sum_{k=0}^{N-1}z^{-k}","z_m=e^{j2\\pi m/N}\\ (m=1,\\ldots,N-1),\quad\\mathrm{ROC}:|z|>0"],["h[n]=a^nu[n]\quad\\mathrm{or}\quad h[n]=-a^nu[-n-1]","S(M)=\\sum_{k=1}^{M}|h[n_k]|,\quad n_k=\\begin{cases}k-1&\text{causal}\\\\-k&\text{anti-causal}\\end{cases}","\text{Right-sided: }a<1,\quad\text{left-sided: }a>1","\text{BIBO stable}\\iff\\sum_n|h[n]|<\\infty\\iff |z|=1\text{ in ROC}"],["x[n]=s[n]+v[n],\quad y[n]=ay[n-1]+(1-a)x[n]","y\\leftarrow a\\,y_{\\mathrm{prev}}+(1-a)x,\quad y_{\\mathrm{prev}}\\leftarrow y","H(z)=\\frac{1-a}{1-az^{-1}},\quad\\mathrm{ROC}:|z|>|a|","h[n]=(1-a)a^nu[n],\quad H(e^{j\\Omega})=H(z)|_{z=e^{j\\Omega}}"]];
const KEY=[0,0,2,0,1,2,3,2];
const CH82=[String.raw`H(z)=\sum_{n=0}^{\infty}(0.8z^{-1})^n=\frac{1}{1-0.8z^{-1}},\quad|z|>0.8`,String.raw`H(z)=-\sum_{n=-\infty}^{-1}(0.8z^{-1})^n=\frac{1}{1-0.8z^{-1}},\quad|z|<0.8`];
const CH82_STEPS={
 right:[
 String.raw`h_R[n]=(0.8)^n u[n]`,
 String.raw`H_R(z)=\sum_{n=0}^{\infty}(0.8z^{-1})^n`,
 String.raw`H_R(z)=\frac1{1-0.8z^{-1}},\quad |0.8z^{-1}|<1`,
 String.raw`\mathrm{ROC}_R:\quad |z|>0.8`
 ],
 left:[
 String.raw`h_L[n]=-(0.8)^n u[-n-1]`,
 String.raw`H_L(z)=-\sum_{n=-\infty}^{-1}(0.8z^{-1})^n`,
 String.raw`H_L(z)=-\sum_{k=1}^{\infty}(z/0.8)^k=\frac1{1-0.8z^{-1}}`,
 String.raw`\mathrm{ROC}_L:\quad |z|<0.8`
 ]
};
const KEY84=String.raw`X(z)=\frac{1}{(1-az^{-1})(1-bz^{-1})}\quad\xrightarrow{\text{partial fractions}}\quad\frac{A}{1-az^{-1}}+\frac{B}{1-bz^{-1}}`;
let pending=false;
function render(){
 pending=false;
 if(typeof window.katex?.render!=='function'){
  document.documentElement.dataset.ss8MathReady='false';return;
 }
 document.documentElement.dataset.ss8MathReady='true';
 const lesson=window.SSChapter8?.currentExperiment||1;
 const row=EQ[lesson-1];if(!row)return;
 const direction=window.SSChapter8?.currentState?.().direction||'right';
 const keyVersion=lesson===2?lesson+':'+direction:String(lesson);
 const key=document.getElementById('ss8-key-equation');
 if(key&&key.dataset.ss8Math!==keyVersion){
  const latex=lesson===2?CH82[direction==='left'?1:0]:lesson===4?KEY84:row[KEY[lesson-1]];
  try{window.katex.render(latex,key,{displayMode:true,throwOnError:true,strict:'ignore'});key.dataset.ss8Math=keyVersion;key.setAttribute('aria-label',latex)}
  catch(e){key.textContent=latex;console.warn('Ch8 key math fallback',lesson,e)}
 }
 const container=document.getElementById('step-content');
 if(!container)return;
 const all=window.SSChapter8?.showAll;
 const current=window.SSChapter8?.stepIndex||0;
 document.querySelectorAll('#plots .ss8-latex, #plots .ss8-math-source, #ss8-predict-question .ss8-latex').forEach(el=>{
  const latex=el.dataset.latex||'';
  if(!latex||el.dataset.ss8Math===latex)return;
  try{window.katex.render(latex,el,{displayMode:true,throwOnError:true,strict:'ignore'});el.dataset.ss8Math=latex;}
  catch(e){el.textContent=latex;console.warn('Ch8 plot derivation fallback',e)}
 });
 container.querySelectorAll('.step .math').forEach((element,i)=>{
  const index=all?i:current,latex=lesson===2?CH82_STEPS[direction==='left'?'left':'right'][index]:row[index];
  if(!latex)return;
  if(element.dataset.ss8Math===lesson+':'+direction+':'+index)return;
  try{window.katex.render(latex,element,{displayMode:true,throwOnError:true,strict:'ignore'});element.dataset.ss8Math=lesson+':'+direction+':'+index;element.setAttribute('aria-label',latex)}
  catch(e){console.warn('Chapter 8 derivation fallback',lesson,index,e)}
 });
}
function request(){if(pending)return;pending=true;queueMicrotask(render)}
function setup(){
 const steps=document.getElementById('step-content');if(!steps)return;
 const plots=document.getElementById('plots');
 const predict=document.getElementById('ss8-predict-question');
 if(plots)new MutationObserver(request).observe(plots,{childList:true,subtree:false});
 if(predict)new MutationObserver(request).observe(predict,{childList:true,subtree:true});
 new MutationObserver(request).observe(steps,{childList:true,subtree:false});
 const title=document.getElementById('title');
 if(title)new MutationObserver(request).observe(title,{childList:true,characterData:true,subtree:true});
 window.addEventListener('load',request);
 if(!window.katex){let n=0;const retry=window.setInterval(()=>{if(window.katex){window.clearInterval(retry);request()}else if(++n>=30)window.clearInterval(retry)},250)}
 document.addEventListener('ss-ch8-state-change',request);
 document.addEventListener('ss-ch8-experiment-change',request);
 window.__ss8MathAudit={formulas:32,lessons:8,request};
 request();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();