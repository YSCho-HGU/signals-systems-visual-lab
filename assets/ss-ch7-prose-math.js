/* Native Chapter 7 prose math. Uses the Chapter 5 whole-expression strategy.
 * Presentation-only. Never modifies inputs, sampled values, source SVGs or model code.
 */
(function(global){
"use strict";
const RULE_DATA=[["x\\[n\\]\\s*=\\s*cos\\(Ωn\\)\\s*,?\\s*Ω\\s*=\\s*2πf\\/fₛ","x[n]=\\cos(\\Omega n),\\quad \\Omega=\\frac{2\\pi f}{f_s}"],["x\\[n\\]\\s*=\\s*cos\\(2π\\(f\\/fₛ\\)n\\)","x[n]=\\cos\\left(2\\pi\\frac{f}{f_s}n\\right)"],["cos\\(2π[·⋅]\\s*(\\d+)n\\/(\\d+)\\)\\s*=\\s*cos\\(2π[·⋅]\\s*(\\d+)n\\/(\\d+)\\)","\\cos\\left(\\frac{2\\pi\\cdot $1n}{$2}\\right)=\\cos\\left(\\frac{2\\pi\\cdot $3n}{$4}\\right)"],["cos\\(\\(Ω\\+2πk\\)n\\)","\\cos((\\Omega+2\\pi k)n)"],["cos\\(Ωn\\)","\\cos(\\Omega n)"],["cos\\(2π\\(f\\/fₛ\\)n\\)","\\cos\\left(2\\pi\\frac{f}{f_s}n\\right)"],["Tₛ\\s*=\\s*1\\s*\\/\\s*fₛ","T_s=\\frac1{f_s}"],["t\\s*=\\s*nTₛ","t=nT_s"],["x\\[n\\]\\s*=\\s*x꜀\\(nTₛ\\)","x[n]=x_c(nT_s)"],["Ω\\s*\\+\\s*2π\\(([+-]?\\d+)\\)\\s*=\\s*(-?\\d+(?:\\.\\d+)?)\\s*rad\\/sample","\\Omega+2\\pi($1)=$2\\ \\mathrm{rad/sample}"],["Ω\\s*=\\s*(-?\\d+(?:\\.\\d+)?)\\s*rad\\/sample","\\Omega=$1\\ \\mathrm{rad/sample}"],["Ω\\s*=\\s*2πf\\/fₛ","\\Omega=\\frac{2\\pi f}{f_s}"],["Ω\\s*\\+\\s*2πk","\\Omega+2\\pi k"],["f\\s*\\/\\s*fₛ\\s*=\\s*(\\d+(?:\\.\\d+)?)\\s*cycles\\/sample","\\frac{f}{f_s}=$1\\ \\mathrm{cycles/sample}"],["f\\s*\\/\\s*fₛ","\\frac{f}{f_s}"],["fₛ\\s*=\\s*(\\d+(?:\\.\\d+)?)\\s*samples\\/s","f_s=$1\\ \\mathrm{samples/s}"],["fₛ\\s*=\\s*(\\d+(?:\\.\\d+)?)\\s*Hz","f_s=$1\\ \\mathrm{Hz}"],["f\\s*=\\s*(\\d+(?:\\.\\d+)?)\\s*Hz","f=$1\\ \\mathrm{Hz}"],["Tₛ\\s*=\\s*(\\d+(?:\\.\\d+)?)\\s*ms","T_s=$1\\ \\mathrm{ms}"],["fₛ\\s*>\\s*2fmax","f_s>2f_{\\max}"],["fₛ\\s*>\\s*2f\\b","f_s>2f"],["fₛ\\s*≤\\s*2fmax","f_s\\le 2f_{\\max}"],["fₛ\\s*≤\\s*2f\\b","f_s\\le 2f"],["fₛ\\s*>\\s*2B","f_s>2B"],["fₛ\\s*≤\\s*2B","f_s\\le 2B"],["fₛ\\s*\\/\\s*2","\\frac{f_s}{2}"],["fₛ\\s*=\\s*(\\d+(?:\\.\\d+)?)","f_s=$1"],["Tₛ\\s*=\\s*(\\d+(?:\\.\\d+)?)","T_s=$1"],["(\\d+(?:\\.\\d+)?)\\s*×\\s*(\\d+(?:\\.\\d+)?)\\s*=\\s*(\\d+(?:\\.\\d+)?)\\s*Hz","$1\\times $2=$3\\ \\mathrm{Hz}"],["sinc\\(fₛt[−-]n\\)","\\operatorname{sinc}(f_st-n)"],["sinc\\(k\\)\\s*=\\s*0","\\operatorname{sinc}(k)=0"],["sinc\\(([^)]+)\\)","\\operatorname{sinc}($1)"],["x꜀\\(nTₛ\\)","x_c(nT_s)"],["x꜀\\(t\\)","x_c(t)"],["x\\[n\\]","x[n]"],["x\\(t\\)","x(t)"],["f\\s*\\+\\s*fₛ","f+f_s"],["f\\s*[−-]\\s*fₛ","f-f_s"],["fₛ\\s*[−-]\\s*f","f_s-f"],["f_alias|f<sub>alias<\\/sub>","f_{\\mathrm{alias}}"],["fmax|f_max","f_{\\max}"],["2ᴮ","2^B"],["2πf\\/fₛ","\\frac{2\\pi f}{f_s}"],["2πk","2\\pi k"],["2πf","2\\pi f"],["2π","2\\pi"],["Ω","\\Omega"],["ωₛ","\\omega_s"],["Δ\\/2","\\frac{\\Delta}{2}"],["Δ","\\Delta"],["Tₛ","T_s"],["fₛ","f_s"]];
;
const specs=RULE_DATA.map(([pattern,template])=>[new RegExp(pattern,"gu"),template]);
const include="#intro,.ss7-predict-prompt,#controls label,#insight,#reading,#check-q,#check-a,.step p,.ss7-sampling-concepts,.ss7-periodicity,.ss7-learning-flow,.ss7-period-note,.ss7-alias-status,#plots .plot-title,#plots .legend,#plots .axis-key";
const excluded="script,style,textarea,select,option,button,output,svg,math,code,pre,.katex,.ss7-prose-math,.ss7-prose-math-error,.step .math,[contenteditable]";
function ranges(src){
 const found=[];
 for(let priority=0;priority<specs.length;priority++){
  const [re,template]=specs[priority];re.lastIndex=0;
  for(const m of src.matchAll(re)){
    const latex=template.replace(/\$(\d+)/g,(_,i)=>m[Number(i)]||"");
    found.push({start:m.index,end:m.index+m[0].length,raw:m[0],latex,priority});
  }
 }
 found.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start)||a.priority-b.priority);
 const kept=[];let end=0;
 for(const item of found){if(item.start<end)continue;kept.push(item);end=item.end}
 return kept;
}
let rendered=0,failed=0;
function replace(node){
 const src=node.nodeValue,found=ranges(src);if(!found.length)return;
 const frag=document.createDocumentFragment();let pos=0;
 for(const item of found){
  if(item.start>pos)frag.appendChild(document.createTextNode(src.slice(pos,item.start)));
  const span=document.createElement("span");span.className="ss7-prose-math";
  span.dataset.ss7Source=item.raw;
  try{
   global.katex.render(item.latex,span,{displayMode:false,throwOnError:true,strict:"ignore",trust:false,output:"htmlAndMathml"});
   rendered++;
  }catch(e){failed++;span.className="ss7-prose-math-error";span.textContent=item.raw;span.title=String(e)}
  frag.appendChild(span);pos=item.end;
 }
 if(pos<src.length)frag.appendChild(document.createTextNode(src.slice(pos)));
 node.replaceWith(frag);
}
function scan(){
 if(typeof global.katex?.render!=="function")return 0;
 const host=document.querySelector("main .ss7-standard-layout");if(!host)return 0;
 const walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT,{acceptNode(node){
  const parent=node.parentElement;
  if(!parent||!node.nodeValue?.trim()||parent.closest(excluded)||!parent.closest(include))return NodeFilter.FILTER_REJECT;
  return ranges(node.nodeValue).length?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
 }});
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(replace);return nodes.length;
}
function init(){
 const host=document.querySelector("main .ss7-standard-layout");if(!host)return;
 let pending=false,working=false;
 function schedule(){
  if(pending)return;
  pending=true;queueMicrotask(()=>{pending=false;if(working)return;working=true;try{scan()}finally{working=false}});
 }
 const observer=new MutationObserver(records=>{
  if(records.some(record=>{
   const target=record.target.nodeType===Node.ELEMENT_NODE?record.target:record.target.parentElement;
   return target&&!target.closest(".ss7-prose-math,.ss7-prose-math-error,.katex,svg");
  }))schedule();
 });
 observer.observe(host,{childList:true,subtree:true,characterData:true});
 document.addEventListener("ss-ch7-experiment-change",schedule);
 window.addEventListener("load",schedule);
 schedule();
 global.__ss7ProseMath={version:"1.0",get rendered(){return rendered},get failed(){return failed},scan};
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})(window);
