
(function(global){
"use strict";
const Q={
weight:{
q:[["x(t)=u(t)","x(t)=u(t)"],["σ=0","\\sigma=0"]],
a:[["σ=0","\\sigma=0"],["ω=0","\\omega=0"],["∫₀^∞1dt","\\int_0^\\infty 1\\,dt"],["u(t)","u(t)"],["X(s)=1/s","X(s)=\\frac1s"],["Re(s)>0","\\operatorname{Re}(s)>0"]]},
roc:{
q:[["X(s)=1/(s+1)","X(s)=\\frac1{s+1}"],["x(t)","x(t)"]],
a:[["Re(s)>−1","\\operatorname{Re}(s)>-1"],["Re(s)<−1","\\operatorname{Re}(s)<-1"],["−e^(−t)u(−t)","-e^{-t}u(-t)"],["e^(−t)u(t)","e^{-t}u(t)"]]},
pairs:{
q:[["X(s)=(1−e^(−sT))/s","X(s)=\\frac{1-e^{-sT}}{s}"],["s=0","s=0"]],
a:[["s=0","s=0"]]},
props:{
q:[["x(t−t₀)","x(t-t_0)"],["e^(bt)x(t)","e^{bt}x(t)"]],
a:[["e^(−st₀)","e^{-st_0}"],["e^(bt)","e^{bt}"],["X(s−b)","X(s-b)"]]},
inverse:{
q:[["−4<Re(s)<−1","-4<\\operatorname{Re}(s)<-1"]],
a:[["1/(s+1)","\\frac1{s+1}"],["−e^(−t)u(−t)","-e^{-t}u(-t)"],["−1/(s+4)","-\\frac1{s+4}"],["−e^(−4t)u(t)","-e^{-4t}u(t)"]]},
stability:{
q:[],a:[["H(s)","H(s)"]]},
rc:{
q:[["τ","\\tau"]],
a:[["63.2%","63.2\\%"],["τ","\\tau"],["ωc=1/τ","\\omega_c=\\frac1\\tau"]]},
second:{
q:[],a:[["−ζωₙ","-\\zeta\\omega_n"],["±ωₙ√(1−ζ²)","\\pm\\omega_n\\sqrt{1-\\zeta^2}"],["ζ","\\zeta"]]}
};
function markup(text,items){
 const root=document.createDocumentFragment();
 const ordered=[...(items||[])].sort((a,b)=>b[0].length-a[0].length);
 let i=0;
 while(i<text.length){
  let match=null;
  for(const [raw,tex] of ordered){if(text.startsWith(raw,i)){match=[raw,tex];break}}
  if(!match){let j=i+1;while(j<text.length&&!ordered.some(([raw])=>text.startsWith(raw,j)))j++;
    root.appendChild(document.createTextNode(text.slice(i,j)));i=j;continue}
  const [raw,tex]=match,span=document.createElement("span");
  span.className="ss5-explicit-math";span.dataset.tex=tex;
  if(global.katex?.render){try{global.katex.render(tex,span,{displayMode:false,throwOnError:true,output:"htmlAndMathml",strict:"ignore"})}
   catch(e){span.textContent=raw;span.dataset.mathError=String(e)}}
  else span.textContent=raw;
  root.appendChild(span);i+=raw.length;
 }
 return root;
}
function apply(id,lab){
 const item=Q[id];if(!item||!lab)return;
 const quiz=document.querySelector(".quiz");
 if(!quiz)return;
 const q=quiz.querySelector("p"),a=quiz.querySelector(".answer");
 if(q)q.replaceChildren(markup(lab.q,item.q));
 if(a)a.replaceChildren(markup(lab.a,item.a));
}
global.ELSChapterFiveExplicitMath=Object.freeze({apply,markup});
})(window);
