(function(){
'use strict';
const C=Number((location.pathname.match(/chapter([5-8])\.html/)||[])[1]);if(!C)return;
const map={
'5:roc':[8,2,'ROC: a common concept','Laplace ROC selects a CT signal in a half-plane. Z-transform ROC selects a DT sequence inside or outside a circle.'],
'5:inverse':[8,4,'Inverse transforms: same calculation strategy','Factor the rational function, compute partial fraction coefficients, then use ROC to select right- or left-sided terms.'],
'5:rc':[8,8,'From analog RC to digital IIR','A sampled first-order analog RC system with ZOH input has a discrete pole a = exp(-Ts/tau).'],
'6:periodic':[7,3,'Digital periodicity becomes aliasing','Chapter 6 proves 2pi periodicity on an integer sample index. Chapter 7 applies this to the loss of uniqueness in recovering a CT frequency.'],
'6:phasor':[8,6,'Phasor cancellation becomes a Z-plane zero','The moving-average phasor sum is exactly H(z) evaluated on the unit circle. A zero sum at frequency Omega corresponds to a unit-circle zero.'],
'6:filter':[7,5,'Before versus after the ADC','A digital filter cannot undo aliasing that happened in the ADC. An anti-aliasing filter must act before sampling.'],
'7:Sampling theorem':[6,1,'Review DT angular frequency','Sampling at t=nTs produces digital frequency Omega=2pi f/fs. The integer index makes Omega periodic.'],
'7:Aliasing':[6,1,'CT ambiguity follows DT periodicity','Use the frequency periodicity derived in Chapter 6 to explain why f and f+k fs produce identical samples.'],
'7:Anti-alias filter':[6,5,'Filter placement is essential','Chapter 7 filters the analog input before ADC. Chapter 6 filters digital samples after ADC.'],
'8:Right / Left inverse':[5,2,'The Laplace ROC principle in discrete time','Same rational function plus different ROC implies different inverse time signals.'],
'8:Partial fractions':[5,5,'Apply the inverse Laplace procedure','Decompose a factored second-order rational expression into first-order terms before using the inverse transform pair and ROC.'],
'8:FIR cancellation':[6,4,'From phasors to unit-circle zeros','Revisit Chapter 6 phasor cancellation and identify the same frequencies as zeros of H(z) on the unit circle.'],
'8:Sensor IIR':[5,7,'RC time constant becomes IIR pole','A zero-order-held input yields a = exp(-Ts/tau); its first-order recurrence is the Chapter 8.8 sensor smoother.']
};
const ids7=['Sampling theorem','Spectral replicas','Aliasing','Sinc reconstruction','Anti-alias filter','Quantization','DAC / ZOH'];
const ids8=['Why Z?','Right / Left inverse','Annular ROC','Partial fractions','Pole–zero filter','FIR cancellation','BIBO test','Sensor IIR'];
const ids5={2:'roc',5:'inverse',7:'rc'},ids6={1:'periodic',4:'phasor',5:'filter'};
function targetLesson(){return C===5?window.__laplaceVisualLab?.active:C===6?window.__dtftApp?.active:C===7?ids7[(window.SSChapter7?.currentExperiment||1)-1]:ids8[(window.SSChapter8?.currentExperiment||1)-1]}
function targetUrl(ch,n){return ch===5?'./chapter5.html?lab='+(ids5[n]||'rc'):ch===6?'./chapter6.html?lab='+(ids6[n]||'periodic'):'./chapter'+ch+'.html#lab='+n}
function makeRCTool(){
 const el=document.createElement('div');el.className='ss-bridge-rc';
 el.innerHTML='<div class="ss-bridge-controls"><label>Time constant tau (s)<output class="tau-out">1.00</output><input class="tau" type="range" min=".2" max="3" step=".1" value="1"></label><label>Sampling Ts (s)<output class="ts-out">0.20</output><input class="ts" type="range" min=".05" max=".8" step=".05" value=".2"></label></div><div class="ss-bridge-rc-readout"></div><svg class="ss-bridge-graph" viewBox="0 0 440 160" role="img" aria-label="Analog response and discrete sampled RC states"><path d="M30 10V130H425" stroke="currentColor" opacity=".4" fill="none"/><path class="ct" fill="none" stroke="#259c91" stroke-width="2.5"/><g class="dt"></g><text x="420" y="153" fill="currentColor" text-anchor="end">t (s)</text></svg><p class="ss-bridge-explain">Green = analog unit-step response. Orange = discrete states at t=(n+1)Ts, with y[-1]=0.</p>';
 const tau=el.querySelector('.tau'),ts=el.querySelector('.ts');
 function update(){const q=+tau.value,T=+ts.value,a=Math.exp(-T/q),duration=Math.max(5*q,8*T),X=t=>30+390*t/duration,Y=y=>130-115*y;el.querySelector('.tau-out').textContent=q.toFixed(2);el.querySelector('.ts-out').textContent=T.toFixed(2);el.querySelector('.ss-bridge-rc-readout').textContent='CT pole: '+(-1/q).toFixed(3)+' rad/s  |  DT pole a: '+a.toFixed(4)+'  |  y[n] = '+a.toFixed(3)+' y[n-1] + '+(1-a).toFixed(3)+' x[n]';el.querySelector('.ct').setAttribute('d',Array.from({length:161},(_,i)=>{const t=duration*i/160;return(i?'L':'M')+X(t).toFixed(1)+' '+Y(1-Math.exp(-t/q)).toFixed(1)}).join(' '));el.querySelector('.dt').innerHTML=Array.from({length:Math.min(80,Math.floor(duration/T))},(_,i)=>{const t=(i+1)*T;return '<circle cx="'+X(t).toFixed(1)+'" cy="'+Y(1-Math.pow(a,i+1)).toFixed(1)+'" r="3" fill="#d49b4b"/>'}).join('')}
 tau.addEventListener('input',update);ts.addEventListener('input',update);update();return el;
}
function render(){
 const key=C+':'+targetLesson(),m=map[key],slot=C===5?document.querySelector('#page'):C===6?document.querySelector('#content'):document.querySelector(C===7?'.ss7-stage-explain':'.ss8-stage-explain');if(!slot)return;
 const old=document.querySelector('.ss-learning-bridge');if(!m){old?.remove();return}if(old?.dataset.key===key)return;old?.remove();
 const el=document.createElement('section');el.className='ss-learning-bridge';el.dataset.key=key;el.setAttribute('aria-label','Cross-chapter bridge');
 const mark=document.createElement('div');mark.className='ss-bridge-tag';mark.textContent='Connect the chapters';
 const h=document.createElement('h3');h.textContent=m[2];const p=document.createElement('p');p.textContent=m[3];
 const link=document.createElement('a');link.className='ss-bridge-link';link.href=targetUrl(m[0],m[1]);link.textContent='Open Chapter '+m[0]+' · Lesson '+m[1];
 el.append(mark,h,p);
 if(key==='5:rc'||key==='8:Sensor IIR')el.append(makeRCTool());
 el.append(link);slot.insertAdjacentElement('afterend',el);
}
let queued=false;function request(){if(queued)return;queued=true;setTimeout(()=>{queued=false;render()},75)}
document.addEventListener('DOMContentLoaded',()=>{new MutationObserver(items=>{if(items.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('#page,#content,.ss7-stage-explain,.ss8-stage-explain')||n.querySelector?.('#page,#content,.ss7-stage-explain,.ss8-stage-explain')))))request()}).observe(document.querySelector('main')||document.body,{childList:true,subtree:true});['ss-ch7-experiment-change','ss-ch8-experiment-change'].forEach(n=>document.addEventListener(n,request));window.addEventListener('load',request);request()});
})();