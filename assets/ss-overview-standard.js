/* KaTeX enhancement for Chapter 1–8 Overview cards. Preserve formulas
 * as readable HTML until the math engine is ready; never affect lab state. */
(function(){
'use strict';
const formulas={
 1:String.raw`y(t)=x(at+b),\\quad x[n]=x(nT_s)`,
 2:String.raw`y(t)=x(t)*h(t)`,
 3:String.raw`x(t)=\\sum_{k=-\\infty}^{\\infty}a_k e^{jk\\omega_0t}`,
 4:String.raw`X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)e^{-j\\omega t}dt`,
 5:String.raw`X(s)=\\int_{-\\infty}^{\\infty}x(t)e^{-st}dt`,
 6:String.raw`X(e^{j\\Omega})=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\Omega n}`,
 7:String.raw`x[n]=x_c(nT_s)`,
 8:String.raw`X(z)=\\sum_{n=-\\infty}^{\\infty}x[n]z^{-n}`
};
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
function init(){
 math();
 const grid=document.getElementById('chapter-grid');
 if(grid)new MutationObserver(math).observe(grid,{childList:true});
 window.addEventListener('load',math,{once:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
