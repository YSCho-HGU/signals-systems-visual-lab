/* Chapter 1–4 common learning stages, navigation and mathematical typography.
 * Runs as progressive enhancement over the unchanged numerical experiments.
 */
(function(){
'use strict';
const chapter=Number(document.documentElement.dataset.ssFoundationChapter||0);if(chapter<1||chapter>4)return;
const T=String.raw;
const keyMath={
 1:[
 'x(t)=Ae^{-\\lambda|t|}\\cos(2\\pi ft+\\phi),\\qquad x[n]=x(nT_s)',
 'p_\\varepsilon(t)=\\begin{cases}1/\\varepsilon,&|t|<\\varepsilon/2\\\\0,&\\mathrm{otherwise}\\end{cases},\\quad\\int p_\\varepsilon(t)dt=1',
 'y(t)=x(at+b),\\qquad t=(\\tau-b)/a',
 'T_0=2\\pi/|\\omega_0|,\\qquad \\Omega N=2\\pi m',
 'E(T)=\\int_{-T}^{T}|x(t)|^2dt,\\quad P(T)=\\frac{E(T)}{2T}',
 'T\\{ax_1+bx_2\\}\\overset{?}=aT\\{x_1\\}+bT\\{x_2\\}',
 'x_e(t)=\\frac{x(t)+x(-t)}2,\\quad x_o(t)=\\frac{x(t)-x(-t)}2',
 'y(t)=x(t)+h(t),\\quad x(t)h(t),\\quad \\frac{dx}{dt},\\quad \\int_{-4}^{t}x(\\tau)d\\tau',
 'x[n]=x(nT_s)\\qquad\\mathrm{sensor}\\to\\mathrm{ADC}\\to\\mathrm{DSP}'
 ],
 2:[
 'x[n]=\\sum_k x[k]\\delta[n-k]\\Longrightarrow y[n]=\\sum_kx[k]h[n-k]',
 'y[n]=\\sum_k x[k]h[n-k]',
 'n_{\\mathrm{start}}=n_{x,0}+n_{h,0},\\quad L_y=L_x+L_h-1',
 'y(t)=\\int_{-\\infty}^{\\infty}x(\\tau)h(t-\\tau)d\\tau',
 'e^{-at}u(t)*e^{-bt}u(t)=\\frac{e^{-at}-e^{-bt}}{b-a}u(t)',
 'h(t)=\\frac1\\tau e^{-t/\\tau}u(t)',
 'y[n]=\\frac1M\\sum_{k=0}^{M-1}x[n-k]',
 'h_{\\mathrm{cascade}}=h_1*h_2,\\quad h_{\\mathrm{parallel}}=h_1+h_2',
 'h[n]\\in\\ell^1\\Longleftrightarrow\\mathrm{BIBO\\ stable}'
 ],
 3:[
 'x(t)=\\cos(\\omega_0t)+A\\cos(2\\omega_0t+\\phi)',
 'a_k=\\frac\\tau T\\operatorname{sinc}(k\\pi\\tau/T)',
 'S_M(t)=\\frac4\\pi\\sum_{n=0}^{M-1}\\frac{\\sin((2n+1)\\pi t)}{2n+1}',
 'x(t-t_0)\\longleftrightarrow a_ke^{-jk\\omega_0t_0}',
 'a_k=\\frac1N\\sum_{n=0}^{N-1}x[n]e^{-j2\\pi kn/N}',
 'H(j\\omega)=\\frac1{1+j\\omega\\tau},\\quad b_k=H(jk\\omega_0)a_k',
 'S(0)=\\frac{x(0^-)+x(0^+)}2'
 ],
 4:[
 '\\omega_k=k\\frac{2\\pi}T,\\quad T a_k=X(j\\omega_k),\\quad\\Delta\\omega=\\frac{2\\pi}T',
 'x(t)=A\\operatorname{rect}(t/\\tau),\\quad X(j\\omega)=A\\tau\\operatorname{sinc}(\\omega\\tau/2)',
 'x(t)=e^{-\\alpha|t|},\\quad X(j\\omega)=\\frac{2\\alpha}{\\alpha^2+\\omega^2}',
 '\\operatorname{rect}((t-t_0)/\\tau)\\longleftrightarrow e^{-j\\omega t_0}\\tau\\operatorname{sinc}(\\omega\\tau/2)',
 'X(j\\omega)=\\tau\\operatorname{sinc}(\\omega\\tau/2),\\quad|X(j\\omega)|\\ge0',
 'Y(j\\omega)=H(j\\omega)X(j\\omega),\\quad H(j\\omega)=\\frac1{1+j\\omega\\tau}',
 'x(t)\\cos(\\omega_ct)\\longleftrightarrow\\frac12[X(j(\\omega-\\omega_c))+X(j(\\omega+\\omega_c))]',
 'X(j\\omega)\\approx\\Delta t\\sum_{n=-M}^{M}x(n\\Delta t)e^{-j\\omega n\\Delta t}'
 ]
};
const bridgeNotes={
 1:'Chapter 1 establishes the CT/DT domain and LTI prerequisites. Chapter 2 turns these signal properties into convolution and system responses.',
 2:'Convolution and LTI impulse responses introduced here lead to harmonic eigenfunctions in Chapter 3 and multiplication in the Fourier domain in Chapter 4.',
 3:'Fourier-series coefficients represent periodic signals. Chapter 4 extends the representation to non-periodic signals with a continuous frequency axis.',
 4:'CTFT describes frequencies on the jω-axis when it exists. Chapter 5 extends to complex frequency s and the Region of Convergence.'
};
function current(){try{return chapter===1?EXPS[active-1]:MODULES[lab.active]}catch(e){return null}}
function mathFor(i){return keyMath[chapter]?.[i]||''}
function selectedIndex(){try{return chapter===1?active-1:lab.active}catch(e){return 0}}
function typeset(){
 const el=document.querySelector(chapter===1?'#formula':'#content #formula');
 if(!el)return;const tex=mathFor(selectedIndex());if(!tex)return;
 const existing=el.querySelector('.ss-found-katex');if(existing?.getAttribute('data-ss-math')===tex)return;
 if(!el.dataset.ssOriginalFormula)el.dataset.ssOriginalFormula=el.innerHTML;
 const wrap=document.createElement('div');wrap.className='ss-found-katex';wrap.dataset.ssMath=tex;wrap.textContent=tex;
 el.replaceChildren(wrap);
 if(window.SSMathCore)window.SSMathCore.queue();
 else if(window.katex?.render){try{window.katex.render(tex,wrap,{displayMode:true,throwOnError:true,strict:'ignore'})}catch(e){wrap.textContent=tex}}
}
function mathMarkupToLatex(markup){
 const box=document.createElement('div');box.innerHTML=markup;
 function convert(node){
  if(node.nodeType===3)return node.nodeValue||'';
  if(node.nodeType!==1)return '';
  const core=Array.from(node.childNodes).map(convert).join('');
  const tag=node.tagName?.toLowerCase();
  return tag==='sub'?'_{'+core+'}':tag==='sup'?'^{'+core+'}':tag==='br'?'\\quad ':core;
 }
 let val=Array.from(box.childNodes).map(convert).join('');
 val=val.replace(/[\u00a0]/g,' ').replaceAll('−','-').replaceAll('∞','\\infty ')
 .replaceAll('π','\\pi ').replaceAll('ω','\\omega ').replaceAll('Ω','\\Omega ')
 .replaceAll('σ','\\sigma ').replaceAll('τ','\\tau ').replaceAll('α','\\alpha ')
 .replaceAll('β','\\beta ').replaceAll('δ','\\delta ').replaceAll('Δ','\\Delta ')
 .replaceAll('ζ','\\zeta ').replaceAll('φ','\\phi ').replaceAll('θ','\\theta ')
 .replaceAll('λ','\\lambda ').replaceAll('Σ','\\sum ').replaceAll('∑','\\sum ')
 .replaceAll('∫','\\int ').replaceAll('√','\\sqrt ')
 .replaceAll('⇒','\\Rightarrow ').replaceAll('→','\\to ').replaceAll('↔','\\leftrightarrow ')
 .replaceAll('≤','\\le ').replaceAll('≥','\\ge ').replaceAll('≠','\\ne ')
 .replaceAll('≈','\\approx ').replaceAll('∈','\\in ')
 .replaceAll('·','\\cdot ').replaceAll('×','\\times ')
 .replaceAll('²','^2').replaceAll('³','^3').replaceAll('₀','_0')
 .replaceAll('⁻¹','^{-1}').replaceAll('ⁿ','^n')
 .replace(/(^|[^a-zA-Z])(sin|cos|tan|sinc)(?=\()/g,(m,pre,fn)=>pre+'\\'+fn)
 .replace(/\bROC\b/g,'\\mathrm{ROC}')
 .replace(/\s+/g,' ').trim();
 return val;
}
function enhanceGuidedMath(){
 if(chapter===1)return;
 if(!window.katex?.render)return;
 for(const el of document.querySelectorAll('#derivationPanel .deriv-math')){
  if(el.querySelector('.katex')||el.dataset.ssFoundMath==='done')continue;
  const source=el.innerHTML,latex=mathMarkupToLatex(source);
  // Preserve narrative text rather than falsely typeset it as a long sequence
  // of separate algebraic symbols.
  if(!latex||/\b(for|otherwise|where|when|supply|from|with|valid|pole|frequency)\b/i.test(latex)){
   el.dataset.ssFoundMath='narrative';continue;
  }
  try{
   window.katex.render(latex,el,{displayMode:true,throwOnError:true,strict:'ignore',trust:false});
   el.dataset.ssFoundMath='done';
   el.dataset.ssMathSource=latex;
  }catch(e){
   el.innerHTML=source;el.dataset.ssFoundMath='fallback';
  }
 }
}
function stageHeading(num,label){
 const h=document.createElement('div');h.className='ss-found-stage';
 const n=document.createElement('span');n.textContent=String(num);h.append(n,document.createTextNode(label));return h;
}
function refreshPredict(container){
 const m=current();if(!m||!container)return;
 const p=container.querySelector('.ss-found-intro');if(!p)return;
 // The experiment card already displays m.desc. Do not repeat the description
 // or the word Predict in the prediction prompt.
 const language=window.SSContentModel?.mode?.()||'mixed';
 const question=chapter===1?m.steps(states[active])[0]:language==='ko'?(m.questionKo||m.question):language==='mixed'&&m.questionKo?(m.question+' / '+m.questionKo):(m.question||m.questionKo||'');
 const clean=question.replace(/<[^>]+>/g,' ').replace(/^\s*Predict\s*[—:·-]?\s*/i,'').trim();
 p.textContent=window.SSContentModel?.text(clean)||clean;
}
function setNewTitle(){
 const m=current();if(!m)return;
 const tag=document.querySelector('.ss-common-title');
 if(tag)tag.firstChild.textContent='Signals & Systems · Chapter '+chapter+' · '+(['Signals & Systems','LTI Systems','Fourier Series','CTFT'][chapter-1])+' ';
}
function content234(){
 const root=document.querySelector('#content');if(!root||root.querySelector('.ss-found-four-step'))return;
 const experiment=root.querySelector('.experiment'),controls=experiment?.querySelector('.controls'),body=experiment?.querySelector('.body-col');
 if(!experiment||!controls||!body)return;
 const group=document.createElement('section');group.className='ss-found-four-step';
 const pred=document.createElement('section');pred.className='ss-found-predict';pred.append(stageHeading(1,'Predict · Background and your expectation'));const intro=document.createElement('p');intro.className='ss-found-intro';pred.append(intro);
 const pair=document.createElement('div');pair.className='ss-found-23';
 const change=document.createElement('section');change.className='ss-found-controls';change.append(stageHeading(2,'Change · Adjust one parameter'),controls);
 const obs=document.createElement('section');obs.className='ss-found-observe';obs.append(stageHeading(3,'Observe · Compare the graphs'),body);
 pair.append(change,obs);
 const explain=document.createElement('section');explain.className='ss-found-explain';explain.append(stageHeading(4,'Explain · Derivation, interpretation and check'));
 for(const selector of ['#derivationPanel','#readingPanel','.learning','.question']){
  const node=body.querySelector(selector);if(node)explain.append(node);
 }
 group.append(pred,pair,explain);experiment.replaceWith(group);
 requestAnimationFrame(()=>{try{if(typeof updateModule==='function')updateModule()}catch(e){console.warn('Foundations reflow update',e)}});
 refreshPredict(group);typeset();
 const note=document.createElement('p');note.className='ss-found-bridge';note.textContent=bridgeNotes[chapter];explain.append(note);
 const link=document.createElement('a');link.className='ss-bridge-link';link.href='./chapter'+(chapter+1)+'.html';link.textContent='Continue to Chapter '+(chapter+1)+' · '+(['','LTI Systems','Fourier Series','CTFT','Laplace Transform'][chapter]);explain.append(link);
}
function content1(){
 const grid=document.querySelector('#ch1-app .grid');if(!grid||grid.closest('.ss-found-four-step'))return;
 const left=grid.querySelector('section.card'),right=grid.querySelector('aside.card');if(!left||!right)return;
 const block=document.createElement('section');block.className='ss-found-four-step';
 const pre=document.createElement('section');pre.className='ss-found-predict';pre.append(left);pre.insertBefore(stageHeading(1,'Predict · Understand the signal and predict the result'),left);
 const intro=document.createElement('p');intro.className='ss-found-intro';pre.append(intro);
 const pair=document.createElement('div');pair.className='ss-found-23';
 const change=document.createElement('section');change.className='ss-found-controls';change.append(stageHeading(2,'Change · Control the experiment'));
 const observe=document.createElement('section');observe.className='ss-found-observe';observe.append(stageHeading(3,'Observe · Read the signal graphs'));
 for(const selector of ['#controls']){const el=left.querySelector(selector);if(el)change.append(el)}
 for(const selector of ['#plots','#metrics','#insight']){const el=left.querySelector(selector);if(el)observe.append(el)}
 pair.append(change,observe);
 const explain=document.createElement('section');explain.className='ss-found-explain';explain.append(stageHeading(4,'Explain · Guided learning and check'),right);
 const note=document.createElement('p');note.className='ss-found-bridge';note.textContent=bridgeNotes[chapter];explain.append(note);
 const link=document.createElement('a');link.className='ss-bridge-link';link.href='./chapter'+(chapter+1)+'.html';link.textContent='Continue to Chapter '+(chapter+1)+' · '+(['','LTI Systems','Fourier Series','CTFT','Laplace Transform'][chapter]);explain.append(link);
 block.append(pre,pair,explain);grid.replaceWith(block);refreshPredict(block);typeset();
 requestAnimationFrame(()=>{try{if(typeof draw==='function')draw()}catch(e){console.warn('Ch1 reflow graph update',e)}});
}
let busy=false;
function schedule(){if(busy)return;busy=true;queueMicrotask(()=>{busy=false;try{chapter===1?content1():content234();refreshPredict(document.querySelector('.ss-found-four-step'));typeset();enhanceGuidedMath();setNewTitle()}catch(e){console.warn('Foundation standard enhancement',e)}})}
function init(){
 // The native experiment scripts still own every simulation and state change.
 const root=document.querySelector(chapter===1?'#ch1-app':'#app');if(!root)return;
 new MutationObserver(mutations=>{if(mutations.some(m=>m.type==='childList'&&[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.experiment,.grid,.heading,.formula')||n.querySelector?.('.experiment,.grid')))))schedule()}).observe(root,{childList:true,subtree:true});
 const nav=document.querySelector(chapter===1?'#nav':'[data-nav]')?.closest('nav')||document.querySelector('nav');
 nav?.addEventListener('click',()=>setTimeout(schedule,60));
 root.addEventListener('input',()=>setTimeout(schedule,70));
 root.addEventListener('click',e=>{if(e.target.closest('#previousStep,#nextStep,#allSteps,#guidePlay'))setTimeout(enhanceGuidedMath,80)});
 new MutationObserver(ms=>{if(ms.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.deriv-step')||n.querySelector?.('.deriv-step')))))queueMicrotask(enhanceGuidedMath)}).observe(root,{childList:true,subtree:true});
 document.addEventListener('els:themechange',()=>{if(typeof updateModule==='function')updateModule();else if(typeof draw==='function')draw()});
 if(window.katex?.render)typeset();window.addEventListener('load',schedule);schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();