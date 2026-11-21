(function(global){
"use strict";
const common=[
["X(s)=1/(s+a)","X(s)=\\frac1{s+a}"],["X(s)=1/s","X(s)=\\frac1s"],
["Re(s)>0","\\operatorname{Re}(s)>0"],["e^(−σt)","e^{-\\sigma t}"],
["F(T)","F(T)"],["F(5)","F(5)"],["1/σ","\\frac1\\sigma"],
["T→∞","T\\to\\infty"],["σ=0","\\sigma=0"],
["t≥0","t\\ge0"],["t<0","t<0"],["t>0","t>0"],
["s=0","s=0"],["X(0)=T","X(0)=T"],
["Y(s)=X(s−b)","Y(s)=X(s-b)"],["Y(s)=e^(−st₀)X(s)","Y(s)=e^{-st_0}X(s)"],
["x(t)=0","x(t)=0"],["x(t)","x(t)"],
["e^(−t)u(−t)","e^{-t}u(-t)"],["e^(−4t)u(t)","e^{-4t}u(t)"],
["u(t)","u(t)"],["H(s)","H(s)"],
["Re(s)","\\operatorname{Re}(s)"],["jω","j\\omega"],
["ωc=1/τ","\\omega_c=\\frac1\\tau"],["1/√2","\\frac1{\\sqrt2}"],
["τ","\\tau"],["ζ≥1","\\zeta\\ge1"],["ζ<1","\\zeta<1"],
["ζ","\\zeta"],["σ","\\sigma"],["ω","\\omega"],
["±","\\pm"],["∞","\\infty"]
];
function dynamic(id,s){
 const f=x=>Number(x).toFixed(2),tokens=common.slice();
 if(id==="roc"){tokens.unshift(["s="+f(-s.a),"s="+f(-s.a)]);}
 if(id==="stability"){
  const cp=Math.abs(s.p-s.z)<1e-8,c4=Math.abs(s.z+4)<1e-8,p=cp?-4:c4?s.p:Math.max(s.p,-4);
  tokens.unshift(["Re(s)>"+f(p),"\\operatorname{Re}(s)>"+f(p)]);
 }
 if(id==="rc")tokens.unshift(["ωc=1/τ="+f(1/s.tau),"\\omega_c=\\frac1\\tau="+f(1/s.tau)]);
 return tokens;
}
function apply(id,s,root){
 if(!root||!global.ELSLabUI?.renderInlineMath)return 0;
 const tokens=dynamic(id,s);let count=0;
 root.querySelectorAll(".reading-note p,.guide-check").forEach(function(node){
  if(!node.dataset.elsOriginalText)node.dataset.elsOriginalText=node.textContent;
  count+=global.ELSLabUI.renderInlineMath(node,node.dataset.elsOriginalText,tokens);
 });
 return count;
}
global.ELSChapterFiveReadingMath=Object.freeze({apply,dynamic});
})(window);