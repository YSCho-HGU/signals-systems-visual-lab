/* Chapter 8 native standalone UI bridge: preserve original experiments and state. */
(function(){
'use strict';
const KEY='els-ss-lab-progress-v1';
const TOTAL=62;
const $=id=>document.getElementById(id);
const names=['Z-Transform & ROC','Right- vs Left-Sided Signals','Two-Sided ROC','Inverse Z: Partial Fractions','Poles & Frequency Response','FIR Zero Cancellation','BIBO Stability & ROC','IIR Sensor Smoothing'];
function active(){return window.SSChapter8?.currentExperiment||1}
function stored(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x.filter(v=>typeof v==='string'):[]}catch{return[]}}
function updateProgress(){
 const saved=stored(),lab=active(),id='8:'+lab;
 const num=$('ss8-progress-count'),mark=$('ss8-mark-reviewed');
 if(num)num.textContent='My Lab Progress · '+saved.filter(x=>/^[1-8]:[1-9]\d*$/.test(x)).length+'/'+TOTAL;
 if(mark){mark.textContent=saved.includes(id)?'Undo reviewed · 확인 취소':'Mark lab reviewed · 학습 확인';mark.setAttribute('aria-pressed',String(saved.includes(id)))}
}
/* Predict is a learning introduction, not a fixed-length prompt.
   Keep Background and Prediction separate from the 2/3 experiment row. */
const PREDICT=[
 {background:'A discrete exponential x[n]=aⁿu[n] may decay or grow as n increases. The Z-transform weights each sample by z⁻ⁿ. Convergence restricts which complex z are allowed; this set is the ROC. 감쇠와 발산, 그리고 단위원의 포함 여부를 먼저 연결해 보세요.',prompt:'a를 1보다 작게/크게 바꾸면 시간수열과 ROC는 어떻게 변할까요? 단위원이 ROC 안에 있는 경우는 언제일까요?'},
 {background:'For an LTI system, H(z)=1/(1−az⁻¹) alone does not uniquely specify the impulse response h[n]. Its ROC is essential. 같은 대수식 H(z)와 pole z=a라도 바깥쪽 ROC는 인과적 h[n], 안쪽 ROC는 비인과적 h[n]을 뜻합니다. 여기서는 a=0.8로 고정하고 오른쪽 또는 왼쪽 수열을 먼저 선택합니다. 그 수열의 합 범위, 기하급수 전개, H(z)와 ROC가 어떻게 도출되는지 오른쪽에서 비교하세요.',prompt:'같은 H(z)를 갖는 두 임펄스응답이 왜 서로 다른 n 영역에 나타날까요? 각 수열의 합 범위는 무엇인가요? 왜 서로 다른 수열로부터 동일한 H(z)가 나오지만 ROC는 다른가요?'},
 {background:'Two-sided sequences add a right-sided contribution and a left-sided contribution. Each component has its own convergence region, so the result converges where the regions overlap. 합의 Z-transform에서 pole·zero와 실제 ROC를 구분합니다.',prompt:'a<1<b일 때 aⁿu[n]−bⁿu[−n−1]은 어디에서 수렴할까요? 왜 ROC가 고리형이 되며 단위원은 포함될까요?'},
 {background:'Inverse Z-transform is an actual calculation: factor the denominator, determine the partial-fraction coefficients, and then use the given ROC to choose each term’s time direction. 두 pole a<b인 X(z)=1/[(1−az⁻¹)(1−bz⁻¹)]을 사용합니다. 주어진 2차 유리식의 역변환은 먼저 X(z)를 1차 분모를 가진 항들의 합으로 분해한 뒤, 각 1차항에 Z-transform pair와 ROC를 적용해 시간수열을 복원합니다. 계수는 암기할 필요가 없습니다. 1=A(1−bz⁻¹)+B(1−az⁻¹)로 통분하고 상수항과 z⁻¹항의 계수를 비교하여 A+B=1, bA+aB=0을 얻습니다. 이어서 B=1−A를 대입하면 (b−a)A=−a이므로 A=−a/(b−a), B=b/(b−a)입니다.',math:String.raw`\begin{aligned}X(z)&=\frac{1}{(1-az^{-1})(1-bz^{-1})}\\[5pt]&=\frac{A}{1-az^{-1}}+\frac{B}{1-bz^{-1}}\\[5pt]1&=A(1-bz^{-1})+B(1-az^{-1})\\A+B&=1,\quad bA+aB=0\\A&=-\frac{a}{b-a},\quad B=\frac{b}{b-a}\end{aligned}`,prompt:'같은 X(z)에서 ROC를 외부·고리형·내부로 바꿀 때 두 항의 우측/좌측 방향은 어떻게 바뀔까요? 최종 x[n]의 부호도 예측하세요.'},
 {background:'The causal one-pole smoother has H(z)=(1−a)/(1−az⁻¹). Moving the pole toward +1 makes the impulse-response tail longer and changes the unit-circle frequency response. Pole 위치는 시간적 기억과 주파수 선택성에 동시에 영향을 줍니다.',prompt:'a가 커질수록 h[n]의 감소 속도와 고주파 응답은 어떻게 변할까요?'},
 {background:'An N-point moving average computes y[n]=(1/N)Σₖ₌₀ᴺ⁻¹x[n−k]. For a sinusoidal input, averaging N delayed phasors may cancel exactly. 이때 H(eʲΩ)=0이고 같은 지점 z=eʲΩ는 Z-plane의 zero입니다. 본 실험의 입력 정현파는 모든 정수 n에서 존재하므로 정상상태 응답을 봅니다.',prompt:'N=4이고 Ω=π/2라면 네 표본의 평균이 왜 0이 될까요? 시간 파형의 출력, |H(eʲΩ)| notch, 단위원 zero가 어떻게 연결될까요?'},
 {background:'BIBO stability is not decided solely by whether a system is causal. For LTI systems it requires the absolute impulse-response sum Σ|h[n]| to be finite. Partial sums S(M) show how that series behaves as M grows. 우측수열과 좌측수열의 수렴 조건을 pole 및 ROC와 연결합니다.',prompt:'a=0.8과 a=1.2 각각에서 causal/anti-causal 중 어떤 쪽의 S(M)이 유한한 값으로 수렴할까요? M을 늘리면서 확인하세요.'},
 {background:'A sensor smoother implements y[n]=ay[n−1]+(1−a)x[n], where x[n] is a noisy measured signal. The z⁻¹ term is an actual one-sample state delay. a controls both noise reduction and response delay. 실습에서는 n=12에서 실제 환경 값이 변하도록 구성한 모의 센서 데이터를 사용합니다.',prompt:'a=0.9와 a=0.3의 계단응답과 고주파 억제 성능을 비교하면 어떤 차이가 나타날까요?'}
];
function refresh(){
 const lab=active();
 document.querySelectorAll('#nav [data-exp]').forEach((button,i)=>{
  const yes=i+1===lab;
  button.classList.toggle('active',yes);
  button.setAttribute('aria-current',String(yes));
  button.setAttribute('aria-label','Lesson 8.'+(i+1)+' '+names[i]);
  const text=button.firstChild;
  if(text&&text.nodeType===Node.TEXT_NODE)text.textContent='';
  if(!button.querySelector('.ss8-lab-number')){
   const span=document.createElement('span');span.className='ss8-lab-number';span.textContent=String(i+1).padStart(2,'0');
   button.prepend(span);
   const title=document.createElement('span');title.className='ss8-lab-label';
   const heading=document.createElement('strong');heading.textContent=names[i];
   const topic=button.querySelector('small');
   title.appendChild(heading);if(topic)title.appendChild(topic);
   button.appendChild(title);
  }
 });
 const heading=$('title'),prompt=$('ss8-predict-question');
 if(prompt){const p=PREDICT[lab-1];prompt.innerHTML=p?'<div class="ss8-predict-background"><strong>Background / 학습 배경</strong><p>'+p.background+'</p>'+(p.math?'<div class="ss8-latex" data-latex="'+p.math.replaceAll('&','&amp;').replaceAll('"','&quot;')+'"></div>':'')+'</div><div class="ss8-predict-task"><strong>Predict / 먼저 예측해 보세요</strong><p>'+p.prompt+'</p></div>':'Predict the effect of changing parameters.';}
 updateProgress();
 try{history.replaceState(null,'',location.pathname+location.search+'#lab='+lab)}catch(_){}
 document.dispatchEvent(new CustomEvent('ss-ch8-experiment-change',{detail:{lesson:lab}}));
}
function setup(){
 const nav=$('nav');
 if(!nav||!window.SSChapter8)return;
 const observer=new MutationObserver(()=>queueMicrotask(refresh));
 observer.observe(nav,{childList:true,subtree:false});
 const mark=$('ss8-mark-reviewed');
 if(mark)mark.addEventListener('click',()=>{
  const id='8:'+active(),saved=stored(),next=saved.includes(id)?saved.filter(x=>x!==id):saved.concat(id);
  try{localStorage.setItem(KEY,JSON.stringify(next))}catch(_){}
  updateProgress();
 });
 if(window.ELSLanguage){
  window.ELSLanguage.bindSelect($('ss8-language-picker'));
  window.ELSLanguage.subscribe(mode=>{document.documentElement.dataset.elsLanguage=mode});
 }
 window.addEventListener('storage',e=>{if(e.key===KEY)updateProgress()});
 const initial=Number((location.hash.match(/lab=(\d+)/)||[])[1]);
 if(initial>=1&&initial<=8&&initial!==1)window.SSChapter8.openExperiment(initial);
 refresh();
 window.__ss8Native={get ready(){return !!document.querySelector('.ss8-shell')&&nav.querySelectorAll('button').length===8},
 get current(){return active()},get count(){return 8},get iframeCount(){return document.querySelectorAll('iframe').length}};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();