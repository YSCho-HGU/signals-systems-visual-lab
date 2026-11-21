/* Chapter 8 inline prose mathematics — visual presentation only.
 * Convert complete expressions in teaching text to common LaTeX math nodes.
 * Preserve source text, controls, code, canvas, SVG and simulation math.
 */
(function(global){
'use strict';
const RULES=[
 // Full equations first: preserve their mathematical relation as a single unit.
 // Chart titles and the lesson heading show the entire selected h[n] formula.
 [/h\[n\]\s*=\s*[−-]?0\.8ⁿu\[(?:n|[−-]n[−-]1)\]/gu,
  x=>x.includes('−')||x.includes('-')?String.raw`h[n]=-(0.8)^nu[-n-1]`:String.raw`h[n]=(0.8)^nu[n]`],
 [/h\[n\]\s*=\s*[−-]aⁿu\[(?:n|[−-]n[−-]1)\]/gu,
  x=>x.includes('−')||x.includes('-')?String.raw`h[n]=-a^nu[-n-1]`:String.raw`h[n]=a^nu[n]`],
 [/y\[n\]\s*=\s*ay\[n−1\]\s*\+\s*\(1−a\)x\[n\]/gu,
  ()=>String.raw`y[n]=ay[n-1]+(1-a)x[n]`],
 [/h_R\[n\]\s*=\s*0\.8ⁿu\[n\]/gu,
  ()=>String.raw`h_R[n]=(0.8)^n u[n]`],
 [/h_L\[n\]\s*=\s*[−-]0\.8ⁿu\[−n−1\]/gu,
  ()=>String.raw`h_L[n]=-(0.8)^n u[-n-1]`],
 [/H\(z\)\s*=\s*1\s*\/\s*\(1[−-]az⁻¹\)/gu,
  ()=>String.raw`H(z)=\frac{1}{1-az^{-1}}`],
 [/X\(z\)\s*=\s*1\s*\/\s*\(1[−-]az⁻¹\)/gu,
  ()=>String.raw`X(z)=\frac{1}{1-az^{-1}}`],
 [/X\(z\)\s*=\s*A\/\(1[−-]az⁻¹\)\s*\+\s*B\/\(1[−-]bz⁻¹\)/gu,
  ()=>String.raw`X(z)=\frac{A}{1-az^{-1}}+\frac{B}{1-bz^{-1}}`],
 [/H\(z\)\s*=\s*\(1[−-]a\)\/\(1[−-]az⁻¹\)/gu,
  ()=>String.raw`H(z)=\frac{1-a}{1-az^{-1}}`],
 [/\|H\(eʲΩ\)\|\s*=\s*0/gu,
  ()=>String.raw`|H(e^{j\Omega})|=0`],
 [/S\(M\)\s*=\s*Σ\|h\[n\]\|/gu,
  ()=>String.raw`S(M)=\sum_n|h[n]|`],
 [/Σ\|h\[n\]\|\s*<\s*∞/gu,
  ()=>String.raw`\sum_n|h[n]|<\infty`],
 [/H\(1\)\s*=\s*1/gu,
  ()=>String.raw`H(1)=1`],
 [/n\s*=\s*0…15/gu,
  ()=>String.raw`n=0,\ldots,15`],
 [/n\s*=\s*20→25/gu,
  ()=>String.raw`n:\ 20\to25`],
 [/\|\s*z\s*\|\s*[<>]\s*(?:\d+(?:\.\d+)?|a|b)/gu,
  x=>x.replace(/\s/g,'')],
 // Complete examples before isolated identifiers
 [/X\(z\)\s*=\s*1\s*\/\s*\[\s*\(1[−-]az⁻¹\)\s*\(1[−-]bz⁻¹\)\s*\]/gu,
  ()=>String.raw`X(z)=\frac{1}{(1-az^{-1})(1-bz^{-1})}`],
 [/H\(z\)\s*=\s*1\/\(1[−-](?:\d+(?:\.\d+)?|a)z⁻¹\)/gu,
  x=>String.raw`H(z)=\frac{1}{1-`+x.match(/1[−-]([\da.]+)z⁻¹/)?.[1]+String.raw`z^{-1}}`],
 [/H\(z\)\s*=\s*Σh\[n\]z⁻ⁿ/gu,
  ()=>String.raw`H(z)=\sum_n h[n]z^{-n}`],
 [/x\[n\]\s*=\s*[−-]?\(1\/3\)\(0\.5\)ⁿu\[n\][−-]\(4\/3\)\(2\)ⁿu\[−n−1\]/gu,
  ()=>String.raw`x[n]=-\frac13(0.5)^n u[n]-\frac43(2)^n u[-n-1]`],
 [/Σₖ₌₁∞1\.2⁻ᵏ\s*=\s*1\/\(1\.2[−-]1\)\s*=\s*5/gu,
  ()=>String.raw`\sum_{k=1}^{\infty}(1.2)^{-k}=\frac{1}{1.2-1}=5`],
 [/A\s*=\s*[−-]a\/\(b[−-]a\)\s*,\s*B\s*=\s*b\/\(b[−-]a\)/gu,
  ()=>String.raw`A=-\frac{a}{b-a},\quad B=\frac{b}{b-a}`],
 [/A\s*=\s*[−-]1\/3\s*,\s*B\s*=\s*4\/3/gu,
  ()=>String.raw`A=-\frac13,\quad B=\frac43`],
 [/A\s*=\s*[−-]a\/\(b[−-]a\)|B\s*=\s*b\/\(b[−-]a\)|B\s*=\s*1[−-]A/gu,
  x=>x.replaceAll('−','-').replace(/-a\/\(b-a\)/,String.raw`-\frac{a}{b-a}`)
      .replace(/b\/\(b-a\)/,String.raw`\frac{b}{b-a}`)],
 [/\(b[−-]a\)A\s*=\s*[−-]a/gu,()=>String.raw`(b-a)A=-a`],
 [/A\+B\s*=\s*1\s*,\s*bA\+aB\s*=\s*0/gu,
  ()=>String.raw`A+B=1,\quad bA+aB=0`],
 [/a\s*<\s*\|z\|\s*<\s*b|\d+(?:\.\d+)?\s*<\s*\|z\|\s*<\s*\d+(?:\.\d+)?/gu,
  x=>x.replace(/\s/g,'')],
 [/\|z\|\s*[<>]=?\s*(?:\d+(?:\.\d+)?|a|b|\|a\|)|\|z\|\s*=\s*1/gu,
  x=>x.replace(/\s/g,'')],
 [/\|az⁻¹\|\s*<\s*1/gu,()=>String.raw`|az^{-1}|<1`],
 [/Ω\s*=\s*2πm\/N\s*\(m=1,…,N[−-]1\)/gu,
  ()=>String.raw`\Omega=\frac{2\pi m}{N},\quad m=1,\ldots,N-1`],
 [/Ω\s*=\s*2πm\/N/gu,()=>String.raw`\Omega=\frac{2\pi m}{N}`],
 [/Ω\s*=\s*π\/2/gu,()=>String.raw`\Omega=\frac{\pi}{2}`],
 [/z\s*=\s*eʲΩ/gu,()=>String.raw`z=e^{j\Omega}`],
 [/z\s*=\s*\(a\+b\)\/2/gu,()=>String.raw`z=\frac{a+b}{2}`],
 [/z\s*=\s*(?:\d+(?:\.\d+)?|a|b)/gu,x=>x.replace(/\s/g,'')],
 [/N\s*=\s*\d+(?:\.\d+)?\s*,\s*Ω\s*=\s*π\/2/gu,
  x=>String.raw`N=`+x.match(/\d+/)[0]+String.raw`,\quad\Omega=\frac{\pi}{2}`],
 [/N\s*=\s*\d+(?:\.\d+)?|M\s*=\s*\d+(?:\.\d+)?/gu,x=>x.replace(/\s/g,'')],
 [/n\s*[≥≤]\s*[−]?\d+|n\s*=\s*[−]?\d+/gu,x=>x.replaceAll('≥',String.raw`\ge`).replaceAll('≤',String.raw`\le`).replaceAll('−','-').replace(/\s/g,'')],
 [/[ab]\s*=\s*\d+(?:\.\d+)?/gu,x=>x.replace(/\s/g,'')],
 [/[ab]\s*<\s*1|[ab]\s*>\s*1|a\s*<\s*b/gu,x=>x.replace(/\s/g,'')],
 [/0\.4\s*<\s*1\s*<\s*1\.8/gu,x=>x.replace(/\s/g,'')],
 [/y\[−1\]\s*=\s*20/gu,()=>String.raw`y[-1]=20`],
 [/y\[n−1\]|x\[n−k\]|h_R\[n\]|h_L\[n\]|[xhysv]\[n\]/gu,
  x=>x.replaceAll('−','-')],
 [/H\(eʲΩ\)|H\(z\)|X\(z\)|X_R\(z\)|X_L\(z\)/gu,
  x=>x.replace('ʲ',String.raw`^{j`).replace('Ω)',String.raw`\Omega})`)],
 [/\|H\(eʲΩ\)\||\|H\|/gu,
  x=>x.includes('e')?String.raw`|H(e^{j\Omega})|`:String.raw`|H|`],
 [/z⁻¹|az⁻¹|bz⁻¹/gu,
  x=>x.replaceAll('⁻¹',String.raw`^{-1}`)],
 [/aⁿu\[n\]|aⁿ/gu,x=>x.replaceAll('ⁿ','^n')],
 [/\(0\.5\)ⁿ|\(2\)ⁿ/gu,x=>x.replace('ⁿ','^n')],
 [/N[−-]1|n≤−1/gu,x=>x.replace('−','-').replace('≤',String.raw`\le`)],
 [/S\(M\)|H\(1\)|h\[n\]|u\[n\]|X\(0\)|Y\(z\)/gu,x=>x],
 [/Ω\s*=\s*\d+(?:\.\d+)?|[ΩπΣ]/gu,
  x=>x.replaceAll('Ω',String.raw`\Omega`).replaceAll('π',String.raw`\pi`).replaceAll('Σ',String.raw`\sum`)],
 [/z⁻ⁿ/gu,()=>String.raw`z^{-n}`]
].map(([re,make],priority)=>({re,make,priority}));
const CONTAINERS=[
 '#intro','#insight','#reading','#check-q','#check-a',
 '#ss8-predict-question','#step-content .step p','#plots .plot-title',
 '#plots .legend','#plots .axis-key','#plots .ss8-compare-result',
 '#controls .control label','#plots .ss8-82-stage h3'
].join(',');
const EXCLUDE='script,style,textarea,select,option,input,svg,canvas,code,pre,.katex,[data-ss-math],[data-latex],[contenteditable],.ss8-prose-math,.ss8-math-source';
let scheduled=false,converted=0,failures=[];
function findMatches(text){
 const matches=[];
 for(const rule of RULES){
  rule.re.lastIndex=0;
  for(const match of text.matchAll(rule.re)){
   let latex='';
   try{latex=rule.make(match[0])}catch(e){failures.push(String(e));continue}
   if(latex)matches.push({start:match.index,end:match.index+match[0].length,latex,priority:rule.priority});
  }
 }
 matches.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start)||a.priority-b.priority);
 const selected=[];let last=0;
 for(const m of matches)if(m.start>=last){selected.push(m);last=m.end}
 return selected;
}
function convertText(node){
 if(node.nodeType!==Node.TEXT_NODE)return;
 const parent=node.parentElement;
 if(!parent||parent.closest(EXCLUDE))return;
 const raw=node.nodeValue;
 if(!raw||!raw.trim())return;
 const matches=findMatches(raw);
 if(!matches.length)return;
 const fragment=document.createDocumentFragment();let prev=0;
 for(const item of matches){
  if(item.start>prev)fragment.appendChild(document.createTextNode(raw.slice(prev,item.start)));
  const original=raw.slice(item.start,item.end);
  const span=document.createElement('span');
  span.className='ss8-prose-math';
  // Use text-style fractions inside sentences; display-style fractions belong to
  // separate key and derivation blocks, where height is not constrained.
  const inlineLatex=item.latex.replace(/\\frac\b/g,'\\tfrac');
  span.setAttribute('data-ss-math',inlineLatex);
  span.setAttribute('data-ss-math-display','inline');
  span.setAttribute('data-ss-math-fallback',original);
  span.textContent=original;
  fragment.appendChild(span);
  converted++;
  prev=item.end;
 }
 if(prev<raw.length)fragment.appendChild(document.createTextNode(raw.slice(prev)));
 node.replaceWith(fragment);
}
function scan(){
 scheduled=false;
 const roots=document.querySelectorAll(CONTAINERS);
 for(const root of roots){
  if(root.closest(EXCLUDE))continue;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const texts=[];while(walker.nextNode())texts.push(walker.currentNode);
  for(const node of texts)convertText(node);
 }
 global.SSMathCore?.queue();
}
function schedule(){
 if(scheduled)return;
 scheduled=true;
 queueMicrotask(scan);
}
function audit(){
 const nodes=document.querySelectorAll('.ss8-prose-math');
 const failed=Array.from(nodes).filter(n=>n.dataset.ssMathState!=='rendered');
 return {converted:converted,visible:nodes.length,rendered:nodes.length-failed.length,
  failures:failed.map(n=>({text:n.textContent.slice(0,60),source:n.dataset.ssMath})),conversionErrors:failures.slice()};
}
function setup(){
 const root=document.querySelector('main')||document.body;
 if(root)new MutationObserver(mutations=>{
  if(mutations.some(m=>m.type==='childList'&&Array.from(m.addedNodes)
   .some(n=>n.nodeType===1&&(
    n.matches?.(CONTAINERS)||n.querySelector?.(CONTAINERS)
   ))))schedule();
 }).observe(root,{childList:true,subtree:true});
 ['ss-ch8-experiment-change','ss-ch8-state-change','ss-ch8-content-rendered'].forEach(n=>document.addEventListener(n,schedule));
 global.addEventListener('load',schedule);
 schedule();
}
global.__ss8ProseMath=Object.freeze({scan,schedule,audit,get converted(){return converted}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})(window);
