/* Chapter 8 native standalone UI bridge: preserve original experiments and state. */
(function(){
'use strict';
const KEY='els-ss-lab-progress-v1';
const TOTAL=62;
const $=id=>document.getElementById(id);
const names=['Why Z?','Same X(z), different ROC','Two-sided ROC','Inverse Z-Transform','Pole & frequency','FIR moving average','Causality & stability','Digital sensor smoother'];
function active(){return window.SSChapter8?.currentExperiment||1}
function stored(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x.filter(v=>typeof v==='string'):[]}catch{return[]}}
function updateProgress(){
 const saved=stored(),lab=active(),id='8:'+lab;
 const num=$('ss8-progress-count'),mark=$('ss8-mark-reviewed');
 if(num)num.textContent='My Lab Progress · '+saved.filter(x=>/^[1-8]:[1-9]\d*$/.test(x)).length+'/'+TOTAL;
 if(mark){mark.textContent=saved.includes(id)?'Undo reviewed · 확인 취소':'Mark lab reviewed · 학습 확인';mark.setAttribute('aria-pressed',String(saved.includes(id)))}
}
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
   const span=document.createElement('span');span.className='ss8-lab-number';span.textContent=String(i+1);
   button.prepend(span);
   const title=document.createElement('span');title.className='ss8-lab-label';
   const heading=document.createElement('strong');heading.textContent=names[i];
   const topic=button.querySelector('small');
   title.appendChild(heading);if(topic)title.appendChild(topic);
   button.appendChild(title);
  }
 });
 const heading=$('title'),prompt=$('ss8-predict-question');
 if(prompt&&heading)prompt.textContent='Before changing the values, predict how the sequence, z-plane and ROC will respond in '+heading.textContent.split(' · ')[0]+'. Check your prediction using the graphs.';
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