/* Engineering Learning Studio — shared math renderer.
 * Used by the Chapter 8 adapter; intentionally chapter-agnostic.
 * Sources: data-ss-math="LaTeX" (preferred), data-latex (legacy).
 * KaTeX errors never leave empty equation placeholders.
 */
(function(global){
'use strict';
const SELECTOR='[data-ss-math],[data-latex]';
const VERSION='1.0.0';
let beforeRender=null;
let queued=false;
let installed=false;
let observer=null;
let lastReport=null;
const errors=[];

function source(el){
 return el.getAttribute('data-ss-math')||el.getAttribute('data-latex')||'';
}
function renderNode(el){
 const latex=source(el).trim();
 if(!latex){
  el.dataset.ssMathState='missing';
  if(!el.textContent.trim())el.textContent='Equation source unavailable';
  return;
 }
 if(el.dataset.ssMathSourceDone===latex && el.querySelector('.katex') &&
    !el.querySelector('.katex-error')){
  el.dataset.ssMathState='rendered';
  return;
 }
 if(!global.katex||typeof global.katex.render!=='function'){
  el.dataset.ssMathState='waiting';
  if(!el.textContent.trim())el.textContent=el.dataset.ssMathFallback||latex;
  return;
 }
 try{
  global.katex.render(latex,el,{
   displayMode:el.dataset.ssMathDisplay!=='inline',
   throwOnError:true,strict:'ignore',trust:false,
   output:'htmlAndMathml'
  });
  el.dataset.ssMathSourceDone=latex;
  el.dataset.ssMathState='rendered';
  el.setAttribute('aria-label',latex);
  el.removeAttribute('data-ss-math-error');
 }catch(e){
  el.dataset.ssMathState='error';
  el.setAttribute('data-ss-math-error',String(e.message||e).slice(0,180));
  el.textContent=el.dataset.ssMathFallback||latex;
  errors.push({source:latex.slice(0,130),error:String(e).slice(0,200)});
  if(errors.length>100)errors.shift();
 }
}
function nodes(){
 return Array.from(document.querySelectorAll(SELECTOR));
}
function auditVisible(){
 const all=nodes(),results={total:all.length,rendered:0,waiting:0,missing:0,errors:0,unrendered:0,failures:[]};
 for(const el of all){
  const status=el.dataset.ssMathState||'unrendered';
  if(status==='rendered'&&el.querySelector('.katex')&&!el.querySelector('.katex-error'))results.rendered++;
  else{
   if(status==='error')results.errors++;
   else if(status==='waiting')results.waiting++;
   else if(status==='missing')results.missing++;
   else results.unrendered++;
   results.failures.push({status,id:el.id||null,source:source(el).slice(0,100),className:el.className||''});
  }
 }
 results.passed=results.total>0&&results.rendered===results.total;
 return results;
}
function renderNow(){
 queued=false;
 if(typeof beforeRender==='function')beforeRender();
 for(const el of nodes())renderNode(el);
 lastReport=auditVisible();
 document.documentElement.dataset.ssMathStatus=lastReport.passed?'ready':(lastReport.errors||lastReport.missing?'error':'pending');
 document.dispatchEvent(new CustomEvent('ss-math-audited',{detail:lastReport}));
 return lastReport;
}
function queue(){
 if(queued)return;
 queued=true;
 queueMicrotask(renderNow);
}
function install(options){
 if(options&&typeof options.beforeRender==='function')beforeRender=options.beforeRender;
 if(installed){queue();return;}
 installed=true;
 if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',setup,{once:true});
 }else setup();
}
function setup(){
 const root=document.querySelector('main')||document.body;
 if(!root)return;
 observer=new MutationObserver(mutations=>{
  if(mutations.some(m=>m.type==='childList'&&
     Array.from(m.addedNodes).some(n=>
      n.nodeType===1 && (n.matches?.(SELECTOR)||n.querySelector?.(SELECTOR)||
        n.matches?.('#step-content,#plots,#ss8-predict-question,#reading,#check'))
     )))queue();
 });
 observer.observe(root,{childList:true,subtree:true});
 ['ss-ch8-experiment-change','ss-ch8-state-change','ss-ch8-content-rendered'].forEach(n=>
  document.addEventListener(n,queue));
 window.addEventListener('load',queue);
 // Remote math assets may arrive after DOMContentLoaded. Keep readable fallback
 // until loaded, and stop retrying after a bounded window.
 if(!global.katex?.render){
  let attempts=0;
  const retry=global.setInterval(()=>{
   attempts++;
   if(global.katex?.render || attempts>=40){
    global.clearInterval(retry);
    queue();
   }
  },250);
 }
 queue();
}
global.SSMathCore=Object.freeze({
 version:VERSION,install,queue,renderNow,auditVisible,
 get report(){return lastReport},
 get recentErrors(){return errors.slice()}
});
})(window);
