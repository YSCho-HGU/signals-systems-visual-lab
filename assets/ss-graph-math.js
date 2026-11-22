/* Theme-aware mathematical axis labels for Canvas and SVG.
 * Graph coordinates and numerical calculations are unchanged.
 */
(function(){
'use strict';
const entries=[
 ['∫₀ᵀ e^(−σt)dt','\\int_{0}^{T}e^{-\\sigma t}\\,dt'],
 ['e^(−σt)','e^{-\\sigma t}'],
 ['x(t)','x(t)'],['x[n]','x[n]'],['y(t)','y(t)'],['y[n]','y[n]'],
 ['h(t)','h(t)'],['h[n]','h[n]'],['h[k]','h[k]'],
 ['h_eq[k]','h_{\\mathrm{eq}}[k]'],
 ['Accumulated energy E(R)','E(R)'],
 ['h(t) (1/s)','h(t)\\;(\\mathrm{s}^{-1})'],
 ['xₜ(t)','x_T(t)'],['x(nΔt)','x(n\\Delta t)'],
 ['xw[n]','x_w[n]'],['Sₘ(t)','S_m(t)'],
 ['|aₖ|','|a_k|'],['aₖ (signed)','a_k\\;(\\text{signed})'],
 ['|X_N|/N','\\frac{|X_N|}{N}'],['|X|','|X|'],['|X|, |Y|','|X|,\\ |Y|'],
 ['2|X| / Σw','\\frac{2|X|}{\\sum_n w[n]}'],
 ['S_K = Σ|h[k]|','S_K=\\sum_k|h[k]|'],
 ['X(jω)','X(j\\omega)'],
 ['signed X(jω)','X(j\\omega)\\;(\\text{signed})'],
 ['X(jω), signed','X(j\\omega)\\;(\\text{signed})'],
 ['signed Xmod(jω)','X_{\\mathrm{mod}}(j\\omega)\\;(\\text{signed})'],
 ['Re{X(jω)}','\\operatorname{Re}\\{X(j\\omega)\\}'],
 ['|X(jω)|','|X(j\\omega)|'],['|H(jω)|','|H(j\\omega)|'],
 ['|H|','|H|'],['|X(e^{jΩ})|','|X(e^{j\\Omega})|'],
 ['step response y[n]','\\text{Step response }y[n]'],
 ['y[n] / partial sum','y[n]\\;/\\;\\text{partial sum}'],
 ['y(t) / partial area','y(t)\\;/\\;\\text{partial area}'],
 ['Δphase (rad)','\\Delta\\phi\\;(\\mathrm{rad})'],
 ['additional phase (rad)','\\Delta\\phi\\;(\\mathrm{rad})'],
 ['Ω/π','\\Omega/\\pi'],['digital frequency Ω/π','\\Omega/\\pi'],
 ['ω (rad/s)','\\omega\\;(\\mathrm{rad/s})'],
 ['angular frequency ω (rad/s)','\\omega\\;(\\mathrm{rad/s})'],
 ['Ω (rad/sample)','\\Omega\\;(\\mathrm{rad/sample})'],
 ['Ω (rad/sample, 0…2π)','\\Omega\\;(\\mathrm{rad/sample},0\\ldots2\\pi)'],
 ['normalized time t/T_s','t/T_s'],
 ['Re(s) = σ','\\operatorname{Re}(s)=\\sigma'],
 ['Im(s) = ω','\\operatorname{Im}(s)=\\omega'],
 ['Re(z)','\\operatorname{Re}(z)'],['Im(z)','\\operatorname{Im}(z)'],
 ['Re','\\operatorname{Re}'],['Im','\\operatorname{Im}'],
 ['upper integration bound T','T\\;(\\text{integration bound})'],
 ['time t (s)','t\\;(\\mathrm{s})'],['t (s)','t\\;(\\mathrm{s})'],['R (s)','R\\;(\\mathrm{s})'],
 ['sample index n','n\\;(\\text{sample index})'],
 ['output index n','n\\;(\\text{output index})'],
 ['dummy index k','k\\;(\\text{summation index})'],
 ['tap index k','k\\;(\\text{tap index})'],
 ['harmonic index k','k\\;(\\text{harmonic index})'],
 ['integration variable τ (s)','\\tau\\;(\\mathrm{s})'],
 ['output time t (s)','t\\;(\\mathrm{s})'],
 ['time near t=0','t\\;(\\text{near }0)'],
 ['time near the jump','t\\;(\\text{near jump})'],
 ['time t','t'],
 ['n (samples)','n'],['n (integer)','n'],
 ['Sample index n','n'],['f (Hz)','f\\;(\\mathrm{Hz})'],
 ['frequency (Hz)','f\\;(\\mathrm{Hz})'],
 ['step response','\\text{Step response}'],
 ['n','n'],['k','k'],['M (terms)','M\\;(\\text{terms})']
];
const mapping=new Map(entries);
const latexFor=value=>mapping.get(String(value||'').trim())||null;
const ready=()=>typeof window.katex?.render==='function';
function typeset(el,tex){
 try{window.katex.render(tex,el,{throwOnError:true,strict:'ignore',trust:false,output:'htmlAndMathml'});return true}
 catch(e){return false}
}
const canvasSpans=new Set(),svgSpans=new Set(),pendingCanvas=new Map();
/* Use actual transformed label geometry, not a guessed string-length width.
 * A long vertical formula on a 220px chart must shrink/reposition inside
 * the canvas, while remaining KaTeX (and preserving complete semantic text).
 */
function fitInside(node,chartBox,minFont=11){
 if(!node.isConnected||chartBox.width<50||chartBox.height<50)return;
 const side=node.dataset.ssAxis;
 const maxExtent=side==='y'?chartBox.height-16:chartBox.width-16;
 const base=side==='y'?16:16;
 node.style.fontSize=base+'px';
 let b=node.getBoundingClientRect();
 let loops=0;
 while((side==='y'?b.height:b.width)>maxExtent&&loops++<8){
  const factor=Math.max(.72,maxExtent/(side==='y'?b.height:b.width));
  const next=Math.max(minFont,parseFloat(node.style.fontSize)*factor*.97);
  node.style.fontSize=next+'px';
  b=node.getBoundingClientRect();
  if(next<=minFont+.01)break;
 }
 const inset=4;
 let dx=0,dy=0;
 if(b.left<chartBox.left+inset)dx=chartBox.left+inset-b.left;
 else if(b.right>chartBox.right-inset)dx=chartBox.right-inset-b.right;
 if(b.top<chartBox.top+inset)dy=chartBox.top+inset-b.top;
 else if(b.bottom>chartBox.bottom-inset)dy=chartBox.bottom-inset-b.bottom;
 node.style.left=(parseFloat(node.style.left||'0')+dx)+'px';
 node.style.top=(parseFloat(node.style.top||'0')+dy)+'px';
}
function alignCanvas(node){
 const canvas=node._canvas;if(!canvas?.isConnected||!node.isConnected)return;
 const pos=node._position,c=canvas.getBoundingClientRect(),p=node.parentElement.getBoundingClientRect();
 node.style.left=(c.left-p.left+pos.x*c.width/pos.w)+'px';
 node.style.top=(c.top-p.top+pos.y*c.height/pos.h)+'px';
 fitInside(node,c);
}
function renderCanvas(ref,side,value,position){
 const canvas=typeof ref==='string'?document.getElementById(ref):ref;
 if(!canvas?.parentElement)return false;
 const tex=latexFor(value),host=canvas.parentElement;
 if(tex)pendingCanvas.set(canvas.id+'|'+side,{ref:canvas,side,value,position});
 let node=Array.from(host.querySelectorAll('.ss-graph-axis-math')).find(el=>el.dataset.ssCanvas===canvas.id&&el.dataset.ssAxis===side);
 if(!tex||!ready()){if(node)node.remove();return false}
 if(getComputedStyle(host).position==='static')host.style.position='relative';
 if(!node){node=document.createElement('span');node.className='ss-graph-axis-math ss-graph-axis-'+side;
  node.dataset.ssCanvas=canvas.id;node.dataset.ssAxis=side;node.setAttribute('aria-hidden','true');host.appendChild(node)}
 if(node.dataset.ssTex!==tex){if(!typeset(node,tex)){node.remove();return false}node.dataset.ssTex=tex}
 node.dataset.ssFormula=String(value);node._canvas=canvas;node._position=position;
 alignCanvas(node);canvasSpans.add(node);return true;
}
function alignSvg(node){
 const svg=node._svg,source=node._source;if(!svg?.isConnected||!source?.isConnected||!node.isConnected)return;
 const v=svg.viewBox.baseVal,s=svg.getBoundingClientRect(),p=node.parentElement.getBoundingClientRect();
 const match=(source.getAttribute('transform')||'').match(/translate\(\s*([\d.]+)[,\s]+([\d.]+)/);
 const x=match?+match[1]:+(source.getAttribute('x')||v.width/2);
 const y=match?+match[2]:+(source.getAttribute('y')||v.height-6);
 node.style.left=(s.left-p.left+x/v.width*s.width)+'px';
 node.style.top=(s.top-p.top+y/v.height*s.height)+'px';
 fitInside(node,s);
}
function enhanceSvg(){
 if(!ready())return;
 document.querySelectorAll('.plot-card svg').forEach(svg=>{
  const host=svg.closest('.plot-card');if(!host)return;
  if(getComputedStyle(host).position==='static')host.style.position='relative';
  svg.querySelectorAll('text.ss-plot-axis-title').forEach(source=>{
   const tex=latexFor(source.textContent);if(!tex)return;
   const side=source.hasAttribute('transform')?'y':'x';
   let node=host.querySelector('.ss-graph-axis-math[data-ss-axis="'+side+'"]');
   if(!node){node=document.createElement('span');node.className='ss-graph-axis-math ss-graph-axis-'+side;
    node.dataset.ssAxis=side;node.setAttribute('aria-hidden','true');host.appendChild(node)}
   if(node.dataset.ssTex!==tex){if(!typeset(node,tex))return;node.dataset.ssTex=tex}
   node.dataset.ssFormula=source.textContent;node._svg=svg;node._source=source;
   source.style.visibility='hidden';alignSvg(node);svgSpans.add(node);
  });
 });
}
let queued=false;
function enhanceAll(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;enhanceSvg();if(ready()){for(const row of pendingCanvas.values())renderCanvas(row.ref,row.side,row.value,row.position)}});
}
function resize(){
 for(const node of canvasSpans){if(node.isConnected)alignCanvas(node);else canvasSpans.delete(node)}
 for(const node of svgSpans){if(node.isConnected)alignSvg(node);else svgSpans.delete(node)}
}
function init(){new MutationObserver(enhanceAll).observe(document.body,{subtree:true,childList:true});enhanceAll();window.addEventListener('resize',resize,{passive:true});
 requestAnimationFrame(()=>{if(ready())window.dispatchEvent(new Event('resize'))});}
window.SSGraphMath=Object.freeze({latexFor,renderCanvas,enhanceAll});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.addEventListener('load',enhanceAll,{once:true});
})();