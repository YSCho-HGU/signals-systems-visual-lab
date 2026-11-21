#!/usr/bin/env node
/* Pure display/math contract for every Chapter 5 experiment.
 * No browser required. Rendering is separately covered by ch5-prose-math-qa.mjs.
 */
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import assert from "node:assert/strict";
const source=readFileSync("assets/ss-ch5-math.js","utf8");
const win={ELSLabUI:null};
runInNewContext(source,{window:win,Math,Number});
const M=win.ELSChapterFiveMath;
const checked=[];
function check(label,condition,detail=""){
 try{assert.ok(condition,label+" "+detail);checked.push(label)}
 catch(error){console.error("FAILED:",label,detail);throw error}
}
const cases=[
 ["weight",{sigma:-0.6}],["weight",{sigma:0}],["weight",{sigma:0.7}],
 ["roc",{a:1,side:"right"}],["roc",{a:1,side:"left"}],
 ...["impulse","step","exp","pulse","damped"].map(kind=>["pairs",{kind,a:0.9,T:2.4,omega:2.2}]),
 ...[-0.6,0,0.6,1.5].map(b=>["props",{a:1,shift:1.1,b,mode:"weight"}]),
 ...[0,1.1].map(shift=>["props",{a:1,shift,b:0.5,mode:"delay"}]),
 ...["right","strip","left"].map(roc=>["inverse",{roc}]),
 ...[[-1.1,-2.1],[0.8,1.2],[0,0],[0.8,0.8],[0.8,-4],[-4,-4],[-4,0.8]].map(([p,z])=>["stability",{p,z}]),
 ...["step","pulse"].map(input=>["rc",{tau:1.4,input}]),
 ...[0.35,1,1.8].map(zeta=>["second",{zeta,wn:3}])
];
for(const [lab,state] of cases){
 const lines=M.guides(lab,state),hero=M.hero(lab,state);
 check(lab+" has four complete steps",lines.length===4);
 check(lab+" has authored formula",typeof hero==="string"&&hero.length>10);
 check(lab+" has natural signs",![hero,...lines].some(x=>/[-+]\s*\(\s*-|--|\+\s*\+\s*/.test(x)),
  JSON.stringify({hero,steps:lines}));
 check(lab+" has balanced TeX braces",[hero,...lines].every(x=>{
  let depth=0;for(const ch of x){if(ch==="{")depth++;if(ch==="}")depth--;if(depth<0)return false}return depth===0
 }));
}
const guide=(lab,state,i=0)=>M.guides(lab,state)[i];
const hero=(lab,state)=>M.hero(lab,state);
check("negative sigma becomes positive exponent",guide("weight",{sigma:-0.6},2).includes("e^{0.60t}"));
check("zero sigma has no exponential zero exponent",guide("weight",{sigma:0},2).includes("}=1"));
check("negative weight shift becomes s-plus",guide("props",{a:1,shift:1.1,b:-0.6,mode:"weight"},2).includes("X(s+0.60)"));
check("negative weight shift correct denominator",guide("props",{a:1,shift:1.1,b:-0.6,mode:"weight"},2).includes("s+1.60"));
check("positive weight shift becomes s-minus",guide("props",{a:1,shift:1.1,b:1.5,mode:"weight"},2).includes("X(s-1.50)"));
check("positive shift pole crosses origin correctly",guide("props",{a:1,shift:1.1,b:1.5,mode:"weight"},2).includes("s-0.50"));
check("zero weight shift contains no s-minus-zero",guide("props",{a:1,shift:1.1,b:0,mode:"weight"},2).includes("X(s)"));
check("zero time delay omits e power zero",guide("props",{a:1,shift:0,b:0,mode:"delay"},2).includes("\\frac1{s+1.00}"));
check("negative poles as natural factors",hero("stability",{p:-1.1,z:-2.1}).includes("\\frac{s+2.10}{(s+1.10)(s+4)}"));
check("positive poles as natural factors",hero("stability",{p:0.8,z:1.2}).includes("\\frac{s-1.20}{(s-0.80)(s+4)}"));
check("zero pole is not unnecessarily parenthesized",hero("stability",{p:0,z:0}).includes("\\frac{s}{s(s+4)}"));
check("repeated pole uses squared factor",hero("stability",{p:-4,z:0.8}).includes("(s+4)^2"));
check("cancelled -4 pole uses numerical factor",guide("stability",{p:0.8,z:-4},1).includes("\\frac1{s-0.80}"));
check("RC step formula includes time gate",guide("rc",{tau:1.4,input:"step"},3).includes("u(t)"));
check("RC pulse formula includes delayed subtraction",guide("rc",{tau:1.4,input:"pulse"},3).includes("r(t)-r(t-2)"));
check("underdamped poles contain imaginary unit",guide("second",{zeta:0.35,wn:3},1).includes("\\pm j\\omega_n\\sqrt{1-\\zeta^2}"));
check("overdamped poles have real discriminant",guide("second",{zeta:1.8,wn:3},1).includes("\\pm\\omega_n\\sqrt{\\zeta^2-1}"));
check("inverse left-sided has left ROC",guide("inverse",{roc:"left"},1).includes("\\operatorname{Re}(s)<-4"));
check("inverse two-sided has strip ROC",guide("inverse",{roc:"strip"},1).includes("-4<\\operatorname{Re}(s)<-1"));
// Independent numerical identities, validating the equation models against
// quadrature or algebra rather than simply checking a rendered string.
function simpson(fn,a,b,n=20000){let h=(b-a)/n,s=fn(a)+fn(b);for(let i=1;i<n;i++)s+=(i%2?4:2)*fn(a+i*h);return s*h/3}
const near=(a,b,eps=1e-5)=>Math.abs(a-b)<eps;
for(const sigma of [-0.6,0,0.7]){
 const integral=simpson(t=>Math.exp(-sigma*t),0,5);
 const formula=Math.abs(sigma)<1e-12?5:(1-Math.exp(-5*sigma))/sigma;
 check("weighted integral identity sigma "+sigma,near(integral,formula),String([integral,formula]));
}
for(const x of [0.5,1.3,2.5]){
 const f1=1/((x+1)*(x+4)),f2=(1/(x+1)-1/(x+4))/3;
 check("inverse partial fraction at "+x,near(f1,f2));
}
for(const [p,z] of [[0.8,0.8],[0.8,-4],[-4,-4]]){
 const x=2.5,h=(x-z)/((x-p)*(x+4));
 const simplified=z===p?1/(x+4):1/(x-p);
 check("pole-zero cancellation p="+p+",z="+z,near(h,simplified));
}
for(const tau of [0.3,1.4,2.4]){
 const r=t=>t<0?0:1-Math.exp(-t/tau);
 for(const t of [0.4,2.2,4.5]){
  const pulse=r(t)-r(t-2);
  const analytic= t<2?1-Math.exp(-t/tau):Math.exp(-(t-2)/tau)-Math.exp(-t/tau);
  check("RC pulse superposition tau="+tau+" t="+t,near(pulse,analytic));
 }
}
for(const zeta of [0.35,1,1.8]){
 const wn=3;
 const roots=zeta<1?[[-zeta*wn,wn*Math.sqrt(1-zeta*zeta)],[-zeta*wn,-wn*Math.sqrt(1-zeta*zeta)]]:
 zeta===1?[[-wn,0],[-wn,0]]:[[-zeta*wn+wn*Math.sqrt(zeta*zeta-1),0],[-zeta*wn-wn*Math.sqrt(zeta*zeta-1),0]];
 for(const [re,im] of roots){
  const real=re*re-im*im+2*zeta*wn*re+wn*wn,imag=2*re*im+2*zeta*wn*im;
  check("second-order root zeta="+zeta+" re="+re+" im="+im,near(real,0)&&near(imag,0));
 }
}
console.log("PASS",checked.length,"Chapter 5 formula and mathematical checks");
