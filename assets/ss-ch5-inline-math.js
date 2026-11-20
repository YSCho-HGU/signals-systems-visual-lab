(function inlineModule(global){
"use strict";
const pairs=[
 [/X\(s\)\s*=\s*1\/\(s\+a\)/g,"X(s)=\\frac{1}{s+a}"],
 [/X\(s\)\s*=\s*1\/s\b/g,"X(s)=\\frac1s"],
 [/Y\(s\)\s*=\s*X\(s−b\)/g,"Y(s)=X(s-b)"],
 [/Y\(s\)\s*=\s*e\^\(−st₀\)X\(s\)/g,"Y(s)=e^{-st_0}X(s)"],
 [/∫₋∞\^∞/g,"\\int_{-\\infty}^{\\infty}"],
 [/Re\(s\)\s*[<>≥≤]\s*[−-]?(?:a|\d+(?:\.\d+)?)/g,null],
 [/e\^\(−σt\)/g,"e^{-\\sigma t}"],
 [/e\^\(−at\)/g,"e^{-at}"],
 [/e\^\(−st\)/g,"e^{-st}"],
 [/e\^\(−st₀\)/g,"e^{-st_0}"],
 [/e\^\(bt\)/g,"e^{bt}"],
 [/e\^\(−t\/τ\)/g,"e^{-t/\\tau}"],
 [/e\^\(−t\)/g,"e^{-t}"],
 [/e\^\(−4t\)/g,"e^{-4t}"],
 [/∫₀ᵀ\s*e\^\(−σt\)dt/g,"\\int_0^T e^{-\\sigma t}\\,dt"],
 [/∫₀\^∞\s*1dt/g,"\\int_0^\\infty 1\\,dt"],
 [/\|H\(jω\)\|\s*=\s*1\/√2/g,"|H(j\\omega)|=\\frac1{\\sqrt2}"],
 [/ωc\s*=\s*1\/τ/g,"\\omega_c=\\frac1\\tau"],
 [/\|H\(jω\)\|/g,"|H(j\\omega)|"],
 [/\b[XYH]\(s\)/g,null],
 [/\b[xyuhF]\([tT]\)/g,null],
 [/[σζτω∞]/g,null]
];
const matcher=new RegExp(pairs.map(p=>"(?: "+p[0].source+")".replace("(?: ","(?:")).join("|"),"g");
function tex(x){
for(const [re,v] of pairs){re.lastIndex=0;if(!(new RegExp("^(?:"+re.source+")$")).test(x))continue;if(v!==null)return v;
if(x.startsWith("Re("))return x.replace("Re(s)","\\operatorname{Re}(s)").replace("−","-");
return ({"σ":"\\sigma","ζ":"\\zeta","τ":"\\tau","ω":"\\omega","∞":"\\infty"})[x]||x}
return x;
}
function render(root){
if(!root||!global.katex?.renderToString)return 0;
const nodes=[],walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
const p=node.parentElement;
if(!p||p.closest("script,style,textarea,input,select,option,button,code,pre,svg,.katex,.math,.deriv-math,[contenteditable]"))return NodeFilter.FILTER_REJECT;
if(!p.closest(".heading,.figure .sub,.reading-panel,.insight,.quiz,.smallnote,.ss5-predict,.ss5-observe,.metric,.legend,.deriv-step p"))return NodeFilter.FILTER_REJECT;
matcher.lastIndex=0;return matcher.test(node.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
}});
while(walker.nextNode())nodes.push(walker.currentNode);
let count=0;
for(const node of nodes){
const text=node.nodeValue,frag=document.createDocumentFragment();let start=0;matcher.lastIndex=0;
for(const match of text.matchAll(matcher)){
const i=match.index,raw=match[0];if(i>start)frag.appendChild(document.createTextNode(text.slice(start,i)));
let html="";try{html=global.katex.renderToString(tex(raw),{displayMode:false,throwOnError:true,output:"htmlAndMathml",strict:"ignore"})}catch(e){}
if(html){const span=document.createElement("span");span.className="ss5-inline-equation";span.innerHTML=html;frag.appendChild(span);count++}
else frag.appendChild(document.createTextNode(raw));
start=i+raw.length;
}
if(start<text.length)frag.appendChild(document.createTextNode(text.slice(start)));
node.replaceWith(frag);
}
return count;
}
global.ELSChapterFiveInlineMath=Object.freeze({render,tex});
})(window);
