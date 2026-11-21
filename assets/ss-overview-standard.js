/* KaTeX enhancement for Chapter 1–8 Overview cards. Preserve formulas
 * as readable HTML until the math engine is ready; never affect lab state. */
(function(){
'use strict';
const formulas={
 1:String.raw`y(t)=x(at+b),\quad x[n]=x(nT_s)`,
 2:String.raw`y(t)=x(t)*h(t)`,
 3:String.raw`x(t)=\sum_{k=-\infty}^{\infty}a_k e^{jk\omega_0t}`,
 4:String.raw`X(j\omega)=\int_{-\infty}^{\infty}x(t)e^{-j\omega t}dt`,
 5:String.raw`X(s)=\int_{-\infty}^{\infty}x(t)e^{-st}dt`,
 6:String.raw`X(e^{j\Omega})=\sum_{n=-\infty}^{\infty}x[n]e^{-j\Omega n}`,
 7:String.raw`x[n]=x_c(nT_s)`,
 8:String.raw`X(z)=\sum_{n=-\infty}^{\infty}x[n]z^{-n}`
};

const mapFormulas={node:{"ctfs":"x(t)=\\sum_{k=-\\infty}^{\\infty}a_k e^{jk\\omega_0t},\\quad\\omega_0=\\frac{2\\pi}{T_0}","ctft":"X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)e^{-j\\omega t}\\,dt","laplace":"X(s)=\\int_{-\\infty}^{\\infty}x(t)e^{-st}\\,dt,\\quad s=\\sigma+j\\omega","dtfs":"x[n]=\\sum_{k=0}^{N-1}a_k e^{j2\\pi kn/N}","dtft":"X(e^{j\\Omega})=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\Omega n}","z":"X(z)=\\sum_{n=-\\infty}^{\\infty}x[n]z^{-n}","dft":"X[k]=\\sum_{n=0}^{N-1}x[n]e^{-j2\\pi kn/N}","fft":"\\mathrm{DFT}:O(N^2),\\qquad\\mathrm{FFT}:O(N\\log_2N)"},edge:{"ctlimit":"\\omega_0=\\frac{2\\pi}{T},\\quad T a_k=X(jk\\omega_0)","ctroc":"X(j\\omega)=X(s)\\big|_{s=j\\omega}\\quad(j\\omega\\text{-axis in ROC})","dtlimit":"N a_k=X(e^{j2\\pi k/N})\\quad\\text{(finite prototype)}","dtroc":"X(e^{j\\Omega})=X(z)\\big|_{z=e^{j\\Omega}}\\quad(|z|=1\\text{ in ROC})","sampling":"\\Omega=\\omega T_s\\pmod{2\\pi},\\quad X_d(e^{j\\Omega})=\\frac1{T_s}\\sum_{m\\in\\mathbb Z}X_c\\!\\left(j\\frac{\\Omega-2\\pi m}{T_s}\\right)","finite":"X_N[k]=X_{\\mathrm{record}}(e^{j2\\pi k/N})","norm":"a_k=\\frac{X[k]}{N},\\quad k=0,\\ldots,N-1","algorithm":"\\mathrm{FFT}(x)=\\mathrm{DFT}(x)\\quad\\text{(same mathematical values)}"}};
function typesetMapDetail(){
 if(!window.katex?.render||typeof TM_STATE==='undefined')return;
 const el=document.querySelector('#tm-detail .tm-formula');
 if(!el||el.dataset.ssOverviewTypeset==='1')return;
 const latex=mapFormulas[TM_STATE.kind]?.[TM_STATE.selected];
 if(!latex)return;
 const fallback=el.innerHTML;
 try{
  window.katex.render(latex,el,{displayMode:true,throwOnError:true,strict:'ignore',trust:false,output:'htmlAndMathml'});
  el.dataset.ssOverviewTypeset='1';
 }catch(error){el.innerHTML=fallback;}
}

function math(){
 if(!window.katex?.render)return;
 for(const card of document.querySelectorAll('#chapter-grid .chapter-card')){
  const id=Number((card.getAttribute('data-route')||'').split('=')[1]);
  const el=card.querySelector('.formula');
  if(!el||!formulas[id]||el.dataset.ssOverviewTypeset==='1')continue;
  const source=el.innerHTML;
  try{
   window.katex.render(formulas[id],el,{displayMode:false,throwOnError:true,strict:'ignore',trust:false,output:'htmlAndMathml'});
   el.dataset.ssOverviewTypeset='1';
  }catch(error){el.innerHTML=source}
 }
}
function typesetCurriculum(){
 if(!window.katex?.render)return;
 for(const el of document.querySelectorAll('#map-view .ss-inline-math[data-tex]')){
  if(el.dataset.typeset==='1')continue;
  const fallback=el.innerHTML;
  try{window.katex.render(el.dataset.tex,el,{displayMode:false,throwOnError:true,strict:'ignore',trust:false,output:'htmlAndMathml'});el.dataset.typeset='1'}
  catch(_){el.innerHTML=fallback}
 }
}
function init(){
 math();typesetMapDetail();typesetCurriculum();
 const detail=document.getElementById('tm-detail');
 if(detail)new MutationObserver(typesetMapDetail).observe(detail,{childList:true});
 const grid=document.getElementById('chapter-grid');
 if(grid)new MutationObserver(math).observe(grid,{childList:true});
 window.addEventListener('load',()=>{math();typesetMapDetail();typesetCurriculum()},{once:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
