/* Chapter 7 audited display math: 7 lessons × 4 derivations. Source computation untouched. */
(function(){'use strict';
const EQ=[["t=nT_s,\\qquad T_s=\\frac{1}{f_s}","x[n]=x_c(nT_s)=\\cos\\!\\left(2\\pi\\frac{f}{f_s}n\\right)","f_s>2f_{\\max}","x_c(t)=\\sum_{n=-\\infty}^{\\infty}x[n]\\operatorname{sinc}(f_st-n)"],["p(t)=\\sum_{n=-\\infty}^{\\infty}\\delta(t-nT_s)","P(j\\omega)=\\frac{2\\pi}{T_s}\\sum_{k=-\\infty}^{\\infty}\\delta(\\omega-k\\omega_s)","X_p(j\\omega)=\\frac{1}{2\\pi}\\bigl(X_c(j\\omega)*P(j\\omega)\\bigr)","X_p(j\\omega)=\\frac{1}{T_s}\\sum_{k=-\\infty}^{\\infty}X_c\\!\\left(j(\\omega-k\\omega_s)\\right)"],["x_c(t)=\\cos(2\\pi ft)","x[n]=\\cos\\!\\left(2\\pi\\frac{f}{f_s}n\\right)","\\cos\\!\\left(2\\pi\\frac{f+mf_s}{f_s}n\\right)=\\cos\\!\\left(2\\pi\\frac{f}{f_s}n\\right),\\quad m,n\\in\\mathbb Z","f_{\\mathrm{alias}}=\\min_{m\\in\\mathbb Z}|f-mf_s|\\leq\\frac{f_s}{2}"],["H_r(j\\omega)=\\begin{cases}T_s,&|\\omega|<\\omega_s/2\\\\0,&|\\omega|>\\omega_s/2\\end{cases}","h_r(t)=\\operatorname{sinc}(t/T_s)","\\hat x(t)=\\sum_{n=-\\infty}^{\\infty}x[n]h_r(t-nT_s)","x_c(t)=\\sum_{n=-\\infty}^{\\infty}x[n]\\operatorname{sinc}(f_st-n)"],["f_{\\mathrm{wanted}}=25\\,\\mathrm{Hz},\\quad f_{\\mathrm{noise}}=140\\,\\mathrm{Hz}","f_{\\mathrm{alias}}=|140-160|=20\\,\\mathrm{Hz}","x_{\\mathrm{filtered}}(t)=x_{\\mathrm{wanted}}(t)+\\alpha x_{\\mathrm{noise}}(t)","x[n]=x_{\\mathrm{filtered}}(n/f_s)"],["x[n]=x_c(nT_s)","Q(x)=\\Delta\\,\\operatorname{round}\\!\\left(\\frac{x+1}{\\Delta}\\right)-1,\\quad\\Delta=\\frac{2}{2^B-1}","|e_q[n]|\\leq\\Delta/2","\\mathrm{SQNR}\\approx6.02B+1.76\\,\\mathrm{dB}"],["x[n]=x_c(nT_s)","y_{\\mathrm{ZOH}}(t)=x[n],\\quad nT_s\\leq t<(n+1)T_s","H_{\\mathrm{ZOH}}(j\\omega)=T_se^{-j\\omega T_s/2}\\operatorname{sinc}\\!\\left(\\frac{\\omega T_s}{2\\pi}\\right)","\\mathrm{ZOH+LPF}\\not\\equiv\\mathrm{ideal\\ sinc\\ interpolation}"]];

function setup(){
const host=document.getElementById('step-content');if(!host)return;
const hero=document.getElementById('ss7-key-equation');
const keyIndices=[1,3,3,3,1,1,2];
let pending=false;
function render(){
 pending=false;
 if(!window.katex?.render)return;
 const chapter=window.SSChapter7?.currentExperiment||1,eq=EQ[chapter-1];
 if(hero&&eq){
  const latex=eq[keyIndices[chapter-1]];
  if(hero.dataset.ss7Key!==String(chapter)&&typeof latex==='string'){
   try{
    window.katex.render(latex,hero,{displayMode:true,throwOnError:true,strict:'ignore',trust:false});
    hero.dataset.ss7Key=String(chapter);
    hero.setAttribute('aria-label',latex);
   }catch(error){
    hero.textContent=latex;
    console.warn('Chapter 7 key equation fallback',chapter,error);
   }
  }
 }
 const info=document.getElementById('step-num')?.textContent||'';
 const all=/^All\s/i.test(info);
 const index=Number(info.match(/Step\s+(\d+)/)?.[1]||1)-1;
 host.querySelectorAll('.step .math').forEach((node,i)=>{
  const k=all?i:index;
  if(node.dataset.ss7Math===chapter+':'+k)return;
  try{
   window.katex.render(eq[k],node,{displayMode:true,throwOnError:true,strict:'ignore',trust:false});
   node.dataset.ss7Math=chapter+':'+k;
   node.setAttribute('aria-label',eq[k]);
  }catch(error){console.warn('Chapter 7 equation fallback',chapter,k,error)}
 });
}
function schedule(){if(!pending){pending=true;queueMicrotask(render)}}
new MutationObserver(schedule).observe(host,{childList:true,subtree:false});
document.addEventListener('ss-ch7-experiment-change',schedule);
window.addEventListener('load',schedule);
schedule();
window.__ss7EquationAudit={lessons:EQ.length,formulas:EQ.flat().length,render};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();