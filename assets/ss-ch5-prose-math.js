/* Chapter 5 prose math. Display-only; preserves lab input and canvas nodes.
 * Renders complete expressions, not individual Greek letters within a formula.
 */
(function(global){
"use strict";
function normalize(s){
 return s.replace(/<=/g,"\\le ").replace(/>=/g,"\\ge ")
 .replace(/≤/g,"\\le ").replace(/≥/g,"\\ge ").replace(/−/g,"-")
 .replace(/ωc/g,"\\omega_c ").replace(/σ/g,"\\sigma ").replace(/ζ/g,"\\zeta ").replace(/τ/g,"\\tau ")
 .replace(/ω/g,"\\omega ").replace(/∞/g,"\\infty ")
 .replace(/₀/g,"_0").replace(/ₙ/g,"_n").replace(/²/g,"^2")
 .replace(/e\^\(([^)]+)\)/g,"e^{$1}").trim();
}
const specs=[
 [/[−-]4\s*<\s*Re\(s\)\s*<\s*[−-]1/gu,()=>"-4<\\operatorname{Re}(s)<-1"],
 [/X\(s\)\s*=\s*\(1[−-]e\^\([−-]sT\)\)\/s/gu,()=>"X(s)=\\frac{1-e^{-sT}}{s}"],
 [/F\(T\)\s*=\s*∫₀ᵀ\s*e\^\([−-]σt\)dt/gu,()=>"F(T)=\\int_0^T e^{-\\sigma t}\\,dt"],
 [/∫₀\^∞\s*1dt/gu,()=>"\\int_0^\\infty 1\\,dt"],
 [/±ωₙ√\(1[−-]ζ²\)/gu,()=>"\\pm\\omega_n\\sqrt{1-\\zeta^2}"],
 [/1[−-]e\^\([−-]t\/τ\)/gu,()=>"1-e^{-t/\\tau}"],
 [/(?:ωc|ω_c)\s*=\s*1\/τ\s*=\s*\d+(?:\.\d+)?/gu,x=>"\\omega_c=\\frac1\\tau="+x.split("=").pop()],
 [/(?:ωc|ω_c)\s*=\s*1\/τ/gu,()=>"\\omega_c=\\frac1\\tau"],
 [/\|H\(jω\)\|\s*=\s*1\/√2/gu,()=>"\\lvert H(j\\omega)\\rvert=\\frac1{\\sqrt2}"],
 [/\|H\(jω\)\|/gu,()=>"\\lvert H(j\\omega)\\rvert"],
 [/1\/√2/gu,()=>"\\frac1{\\sqrt2}"],
 [/1\/σ/gu,()=>"\\frac1{\\sigma}"],
 [/1\/τ/gu,()=>"\\frac1{\\tau}"],
 [/X\(s\)\s*=\s*1\/\(s\+a\)/gu,()=>"X(s)=\\frac1{s+a}"],
 [/X\(s\)\s*=\s*1\/\(s\+1\)/gu,()=>"X(s)=\\frac1{s+1}"],
 [/X\(s\)\s*=\s*1\/s\b/gu,()=>"X(s)=\\frac1s"],
 [/Y\(s\)\s*=\s*X\(s[−-]b\)/gu,()=>"Y(s)=X(s-b)"],
 [/Y\(s\)\s*=\s*e\^\([−-]st₀\)X\(s\)/gu,()=>"Y(s)=e^{-st_0}X(s)"],
 [/X\(0\)\s*=\s*T/gu,()=>"X(0)=T"],
 [/Re\(s\)\s*(?:<=|>=|[<>≤≥=])\s*[−-]?(?:\d+(?:\.\d+)?|a|p)/gu,x=>"\\operatorname{Re}(s)"+normalize(x.replace(/^Re\(s\)\s*/,""))],
 [/(?:σ|ζ|t)\s*(?:<=|>=|[<>≤≥=])\s*[−-]?(?:\d+(?:\.\d+)?|a|p|T)/gu,normalize],
 [/(?:[−-])?e\^\((?:[−-])?[a-zA-Zστωζ₀ₙ0-9\/.+−*]+\)(?:u\([−-]?t\))?/gu,normalize],
 [/x\(t[−-]t₀\)|X\(s[−-]b\)/gu,normalize],
 [/ωₙ²|ωₙ|ω₀|ωc|jω|ζ²|[−-]ζωₙ/gu,normalize],
 [/\b(?:X|Y|H|F)\([stT0jω]+\)|\b[xyuh]\([tTjω−-]+\)/gu,normalize],
 [/[σζτω∞]/gu,normalize]
];
const allowed=".heading p,.figure .sub,.figure .legend,.reading-panel p,.reading-note p,.guide-check,.deriv-step p,.quiz p,.quiz .answer,.metric .k,.metric .d,.smallnote,.compare-head span,.compare-sub,.compare-footer,.plot-instruction,.controlgrid label,.presets button,.ss5-observe p,.ss5-predict p,.ss5-predict small,.ss5-flow-intro,.ss5-check label";
const excluded="script,style,textarea,input,select,option,canvas,svg,code,pre,.katex,.math,.deriv-math,.ss5-inline-equation,.ss5-explicit-math,.els-inline-math,.ss5-prose-math,[data-els-math-inline],[data-els-math-display],[contenteditable]";
function matches(text){
 const all=[];
 for(let i=0;i<specs.length;i++){
  const [re,fn]=specs[i];re.lastIndex=0;
  for(const m of text.matchAll(re))all.push({start:m.index,end:m.index+m[0].length,raw:m[0],tex:fn(m[0]),order:i});
 }
 all.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start)||a.order-b.order);
 const result=[];let end=0;
 for(const item of all){if(item.start<end)continue;result.push(item);end=item.end;}
 return result;
}
function render(root){
 if(!root||typeof global.katex?.render!=="function")return 0;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
  const p=node.parentElement;
  return p&&!p.closest(excluded)&&p.closest(allowed)&&matches(node.nodeValue||"").length
   ?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
 }}),nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 let count=0;
 for(const node of nodes){
  const src=node.nodeValue,found=matches(src);let pos=0;
  if(!found.length)continue;
  const frag=document.createDocumentFragment();
  for(const part of found){
   if(part.start>pos)frag.appendChild(document.createTextNode(src.slice(pos,part.start)));
   const span=document.createElement("span");span.className="ss5-prose-math";
   span.dataset.ss5Source=part.raw;
   try{global.katex.render(part.tex,span,{displayMode:false,throwOnError:true,output:"htmlAndMathml",strict:"ignore"});count++}
   catch(error){span.className="ss5-prose-math-error";span.textContent=part.raw;span.title=String(error)}
   frag.appendChild(span);pos=part.end;
  }
  if(pos<src.length)frag.appendChild(document.createTextNode(src.slice(pos)));
  node.replaceWith(frag);
 }
 return count;
}
global.ELSChapterFiveProseMath=Object.freeze({render,matches,version:"2.0"});
})(window);
