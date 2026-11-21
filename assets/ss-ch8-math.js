/* Chapter 8 mathematical source registry.
 * Every hero/key equation and every guided step uses a raw LaTeX source.
 * Shared rendering, fallbacks, change observation and audits: ss-math-core.js.
 */
(function(global){
'use strict';
const R=String.raw;
const EQ=[
 [R`X(z)=\sum_{n=-\infty}^{\infty}x[n]z^{-n}`,
  R`X(z)=\sum_{n=0}^{\infty}(az^{-1})^n`,
  R`X(z)=\frac{1}{1-az^{-1}},\quad |z|>|a|`,
  R`z=a,\quad \mathrm{ROC}:\ |z|>|a|`],
 [R`H(z)=\frac{1}{1-az^{-1}}`,
  R`h_R[n]=a^nu[n],\quad \mathrm{ROC}:|z|>|a|`,
  R`h_L[n]=-a^nu[-n-1],\quad\mathrm{ROC}:|z|<|a|`,
  R`(H(z),\mathrm{ROC})\longleftrightarrow h[n]`],
 [R`X_R(z)=\frac{1}{1-az^{-1}},\quad|z|>a`,
  R`X_L(z)=\frac{1}{1-bz^{-1}},\quad|z|<b`,
  R`X(z)=\frac{z(2z-a-b)}{(z-a)(z-b)},\quad a<|z|<b`,
  R`0<a<1<b\ \Longrightarrow\ |z|=1\text{ lies in ROC}`],
 [R`X(z)=\frac{1}{(1-az^{-1})(1-bz^{-1})}`,
  R`\begin{aligned}
    1&=A(1-bz^{-1})+B(1-az^{-1})\\
    A+B&=1,\quad bA+aB=0\\
    A&=-\frac{a}{b-a},\quad B=\frac{b}{b-a}
   \end{aligned}`,
  R`\begin{cases}|z|>b:\ \mathrm{RR}\\a<|z|<b:\ \mathrm{RL}\\|z|<a:\ \mathrm{LL}\end{cases}`,
  R`x[n]=x_1[n]+x_2[n],\quad\mathcal{Z}\{x[n]\}=X(z)`],
 [R`y[n]=ay[n-1]+(1-a)x[n]`,
  R`H(z)=\frac{1-a}{1-az^{-1}}`,
  R`z_p=a,\quad\mathrm{ROC}:|z|>|a|`,
  R`|H(e^{j\Omega})|=\frac{|1-a|}{\sqrt{1+a^2-2a\cos\Omega}}`],
 [R`y[n]=\frac{1}{N}\sum_{k=0}^{N-1}x[n-k]`,
  R`H(e^{j\Omega})=\frac1N\sum_{k=0}^{N-1}e^{-j\Omega k}`,
  R`H(z)=\frac1N\sum_{k=0}^{N-1}z^{-k}`,
  R`z_m=e^{j2\pi m/N}\ (m=1,\ldots,N-1),\quad \mathrm{ROC}:|z|>0`],
 [R`h[n]=a^nu[n]\quad\mathrm{or}\quad h[n]=-a^nu[-n-1]`,
  R`S(M)=\sum_{k=1}^{M}|h[n_k]|,\quad n_k=\begin{cases}k-1&\mathrm{causal}\\-k&\mathrm{anti\!-\!causal}\end{cases}`,
  R`\mathrm{Right\!-\!sided}:a<1,\quad\mathrm{left\!-\!sided}:a>1`,
  R`\mathrm{BIBO\ stable}\iff\sum_n|h[n]|<\infty\iff |z|=1\text{ is in ROC}`],
 [R`x[n]=s[n]+v[n],\quad y[n]=ay[n-1]+(1-a)x[n]`,
  R`y\leftarrow a\,y_{\mathrm{prev}}+(1-a)x,\quad y_{\mathrm{prev}}\leftarrow y`,
  R`H(z)=\frac{1-a}{1-az^{-1}},\quad\mathrm{ROC}:|z|>|a|`,
  R`h[n]=(1-a)a^nu[n],\quad H(e^{j\Omega})=H(z)|_{z=e^{j\Omega}}`]
];
const KEYS=[0,0,2,0,1,2,3,2];
const KEY84=R`\begin{aligned}
X(z)&=\frac{1}{(1-az^{-1})(1-bz^{-1})}\\[5pt]
&=\frac{A}{1-az^{-1}}+\frac{B}{1-bz^{-1}}
\end{aligned}`;
const CH82={
 right:{
  key:R`H(z)=\frac{1}{1-0.8z^{-1}},\quad \mathrm{ROC}:|z|>0.8`,
  steps:[
   R`h_R[n]=(0.8)^nu[n]`,
   R`H_R(z)=\sum_{n=0}^{\infty}(0.8z^{-1})^n`,
   R`H_R(z)=\frac{1}{1-0.8z^{-1}},\quad|0.8z^{-1}|<1`,
   R`\mathrm{ROC}_R:\quad|z|>0.8`
  ]
 },
 left:{
  key:R`H(z)=\frac{1}{1-0.8z^{-1}},\quad \mathrm{ROC}:|z|<0.8`,
  steps:[
   R`h_L[n]=-(0.8)^nu[-n-1]`,
   R`H_L(z)=-\sum_{n=-\infty}^{-1}(0.8z^{-1})^n`,
   R`H_L(z)=-\sum_{k=1}^{\infty}(z/0.8)^k=\frac{1}{1-0.8z^{-1}}`,
   R`\mathrm{ROC}_L:\quad|z|<0.8`
  ]
 }
};
function state(){
 const api=global.SSChapter8;
 const lesson=api?.currentExperiment||1;
 const direction=api?.currentState?.().direction==='left'?'left':'right';
 return {lesson,direction,showAll:!!api?.showAll,index:api?.stepIndex||0};
}
function eqForKey(st){
 if(st.lesson===2)return CH82[st.direction].key;
 if(st.lesson===4)return KEY84;
 return EQ[st.lesson-1]?.[KEYS[st.lesson-1]]||'';
}
function eqForStep(st,index){
 return st.lesson===2?CH82[st.direction].steps[index]:EQ[st.lesson-1]?.[index];
}
function setSource(el,tex){
 if(!el||!tex)return;
 if(el.getAttribute('data-ss-math')!==tex)el.setAttribute('data-ss-math',tex);
 if(!el.textContent.trim())el.textContent=tex;
}
function attachSources(){
 const st=state();
 setSource(document.getElementById('ss8-key-equation'),eqForKey(st));
 const steps=document.querySelectorAll('#step-content .step .math');
 for(let i=0;i<steps.length;i++){
  const index=st.showAll?i:st.index;
  setSource(steps[i],eqForStep(st,index));
 }
 // Observe and Predict produce data-latex dynamically and are picked up by
 // the same shared core. No extra render implementation is allowed here.
}
function auditVisible(){
 const base=global.SSMathCore?.auditVisible()||{passed:false};
 const st=state();
 const key=document.getElementById('ss8-key-equation');
 const steps=Array.from(document.querySelectorAll('#step-content .step .math'));
 const expectedSteps=st.showAll?4:1;
 const failures=[];
 if(!key||key.dataset.ssMathState!=='rendered')failures.push('Key Relation not typeset');
 if(steps.length!==expectedSteps)failures.push('Guided step count '+steps.length+' != '+expectedSteps);
 for(const [i,el] of steps.entries()){
  if(!el.getAttribute('data-ss-math'))failures.push('Missing LaTeX source for step '+(i+1));
  if(el.dataset.ssMathState!=='rendered')failures.push('Step '+(i+1)+' not typeset');
 }
 if(st.lesson===2){
  const n=document.querySelectorAll('#plots .ss8-math-source').length;
  if(n!==4)failures.push('8.2 expected four Observe math expressions; found '+n);
 }
 if(st.lesson===4&&!document.querySelector('#ss8-predict-question [data-latex]')){
  failures.push('8.4 factored-to-partial-fractions Predict equation absent');
 }
 return {passed:base.passed&&failures.length===0,
  lesson:st.lesson,direction:st.direction,all:st.showAll,
  expectedSteps,failures,math:base};
}
function validateCatalogue(){
 const compile=global.katex?.renderToString;
 if(typeof compile!=='function')return {passed:false,error:'KaTeX not loaded'};
 const cases=[];
 for(let i=0;i<EQ.length;i++)for(let j=0;j<EQ[i].length;j++)
  cases.push({id:'8.'+(i+1)+'/step-'+(j+1),latex:EQ[i][j]});
 for(let i=0;i<KEYS.length;i++)cases.push({id:'8.'+(i+1)+'/key',latex:i===3?KEY84:EQ[i][KEYS[i]]});
 for(const direction of ['right','left']){
  cases.push({id:'8.2/'+direction+'/key',latex:CH82[direction].key});
  CH82[direction].steps.forEach((latex,j)=>cases.push({id:'8.2/'+direction+'/step-'+(j+1),latex}));
 }
 const failures=[];
 for(const item of cases){
  try{compile(item.latex,{throwOnError:true,strict:'ignore',trust:false})}
  catch(e){failures.push({id:item.id,source:item.latex,error:String(e)})}
 }
 return {passed:failures.length===0,checked:cases.length,failures};
}
function setup(){
 if(!global.SSMathCore){
  console.error('Chapter 8 math core is unavailable');
  return;
 }
 global.SSMathCore.install({beforeRender:attachSources});
 global.__ss8MathAudit=Object.freeze({
  request:global.SSMathCore.queue,
  render:global.SSMathCore.renderNow,
  visible:auditVisible,
  catalogue:validateCatalogue,
  get status(){return auditVisible()},
  get chapters(){return 8},
  get guidedEquations(){return 32}
 });
 document.addEventListener('ss-math-audited',()=>{
  const report=auditVisible();
  document.documentElement.dataset.ss8MathAudit=report.passed?'pass':'pending';
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
else setup();
})(window);
