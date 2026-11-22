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
 ['h(t) (1/s)','h(t)\\;(\\mathrm{s}^{-1})'],
 ['xₜ(t)','x_T(t)'],['x(nΔt)','x(n\\Delta t)'],
 ['xw[n]','x_w[n]'],['Sₘ(t)','S_m(t)'],
 ['|aₖ|','|a_k|'],['aₖ (signed)','a_k\\;(\\text{signed})'],
 ['|X_N|/N','\\frac{|X_N|}{N}'],['|X|','|X|'],['|X|, |Y|','|X|,\\ |Y|'],
 ['2|X| / Σw','\\frac{2|X|}{\\sum_n w[n]}'],
 ['S_K = Σ|h[k]|','S_K=\\sum_{k=-K}^{K}|h[k]|'],
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
 ['t (s)','t\\;(\\mathrm{s})'],['R (s)','R\\;(\\mathrm{s})'],
 ['n','n'],['k','k'],['M (terms)','M\\;(\\text{terms})']
];
const mapping=new Map(entries);
const latexFor=value=>mapping.get(String(value||'').trim())||null;
const ready=()=>typeof window.katex?.render==='function';
function typeset(el,tex){
 try{window.katex.render(tex,el,{throwOnError:true,strict:'ignore',trust:false,output:'htmlAndMathml'});return true}
 catch(e){return false}
}
const canvasSpans=new Set(),svgSpans=new Set();
function alignCanvas(node){
 const canvas=node._canvas;if(!canvas?.isConnected||!node.isConnected)return;
 const pos=node._position,c=canvas.getBoundingClientRect(),p=node.parentElement.getBoundingClientRect();
 node.style.left=(c.left-p.left+pos.x*c.width/pos.w)+'px';
 node.style.top=(c.top-p.top+pos.y*c.height/pos.h)+'px';
}
function renderCanvas(ref,side,value,position){
 const canvas=typeof ref==='string'?document.getElementById(ref):ref;
 if(!canvas?.parentElement)return false;
 const tex=latexFor(value),host=canvas.parentElement;
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
function enhanceCaptions(){
 if(!ready())return;
 document.querySelectorAll('.figure .sub').forEach(el=>{
  if(el.dataset.ssMathCaption==='1')return;
  const source=el.textContent||'',match=source.match(/^\s*F\(T\)\s*=\s*∫₀ᵀ\s*e\^\(−σt\)\s*dt/);
  if(!match)return;
  const node=document.createElement('span');
  if(!typeset(node,'F(T)=\\int_0^T e^{-\\sigma t}\\,dt'))return;
  node.className='ss-graph-caption-math';el.replaceChildren(node,document.createTextNode(source.slice(match[0].length)));
  el.dataset.ssMathCaption='1';
 });
}
let queued=false;
function enhanceAll(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;enhanceSvg();enhanceCaptions()});
}
function resize(){
 for(const node of canvasSpans){if(node.isConnected)alignCanvas(node);else canvasSpans.delete(node)}
 for(const node of svgSpans){if(node.isConnected)alignSvg(node);else svgSpans.delete(node)}
}
function init(){new MutationObserver(enhanceAll).observe(document.body,{subtree:true,childList:true});enhanceAll();window.addEventListener('resize',resize,{passive:true})}
window.SSGraphMath=Object.freeze({latexFor,renderCanvas,enhanceAll});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();