/* Chapter 7 native lab navigation; no iframe dependency. */
(function(){
"use strict";
const NAMES=['Sampling theorem','Spectral replicas','Aliasing','Sinc reconstruction','Anti-alias filter','Quantization','DAC / ZOH'];
const PROGRESS_KEY='els-ss-lab-progress-v1';
const TOTAL=62;
const $=id=>document.getElementById(id);
function readProgress(){try{const v=JSON.parse(localStorage.getItem(PROGRESS_KEY)||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string'):[]}catch(_){return[]}}
function mode(){return window.ELSLanguage?.get()||'mixed'}
function current(){return window.SSChapter7?.currentExperiment||1}
function refresh(){
 const active=current(),saved=readProgress(),id='7:'+active;
 document.querySelectorAll('#ss7-lesson-nav button').forEach((b,i)=>{b.setAttribute('aria-current',String(i+1===active));b.setAttribute('aria-label','Lesson 7.'+(i+1)+' '+NAMES[i])});
 const previous=$('ss7-prev-lab'),next=$('ss7-next-lab');
 if(previous)previous.disabled=active<=1;
 if(next)next.disabled=active>=NAMES.length;
 if($('ss7-topbar-title'))$('ss7-topbar-title').textContent='CHAPTER 07 / '+active+' of '+NAMES.length+' · '+NAMES[active-1];
 const mark=$('ss7-mark-reviewed'),count=$('ss7-progress-count');
 if(count)count.textContent='My Lab Progress · '+saved.filter(x=>/^[1-8]:[1-9]\d*$/.test(x)).length+'/'+TOTAL;
 if(mark){mark.textContent=saved.includes(id)?'Undo reviewed · 확인 취소':'Mark lab reviewed · 학습 확인';mark.setAttribute('aria-pressed',String(saved.includes(id)))}
 try{history.replaceState(null,'',location.pathname+location.search+'#lab='+active)}catch(_){}
}
function open(n){if(!window.SSChapter7?.openExperiment(n))return;refresh();window.scrollTo({top:0,behavior:'instant'})}
function setup(){
 const nav=$('ss7-lesson-nav');
 if(!nav||!window.SSChapter7)return;
 NAMES.forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML='<span class="ss7-lab-number">'+(i+1)+'</span><span>'+name+'</span>';b.addEventListener('click',()=>open(i+1));nav.appendChild(b)});
 $('ss7-prev-lab').addEventListener('click',()=>open(current()-1));
 $('ss7-next-lab').addEventListener('click',()=>open(current()+1));
 $('ss7-mark-reviewed').addEventListener('click',()=>{
  const id='7:'+current(),saved=readProgress(),next=saved.includes(id)?saved.filter(x=>x!==id):saved.concat(id);
  try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(next))}catch(_){}
  refresh();
 });
 if(window.ELSLanguage){
  window.ELSLanguage.bindSelect($('ss7-language-picker'));
  window.ELSLanguage.subscribe(()=>refresh());
 }
 document.addEventListener('ss-ch7-experiment-change',refresh);
 window.addEventListener('storage',e=>{if(e.key===PROGRESS_KEY)refresh()});
 const initial=Number((location.hash.match(/lab=(\d+)/)||[])[1]);
 if(initial>=1&&initial<=NAMES.length)window.SSChapter7.openExperiment(initial);
 refresh();
 window.__ss7Native={get ready(){return !!document.querySelector('.ss7-shell')},get current(){return current()},get count(){return NAMES.length},get iframeCount(){return document.querySelectorAll('iframe').length}};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
