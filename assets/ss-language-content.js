/* Shared, state-preserving language presentation for Chapter 1–8.
 * Translates explicitly bilingual fragments and common instructional labels.
 * Unpaired prose is never erased or guessed: author translations with data-i18n-*.
 */
(function(){
'use strict';
if(!window.ELSLanguage)return;
const saved=new WeakMap();
const dictionary={
 'Predict':'예측하기','Change':'변경하기','Observe':'관찰하기','Explain':'설명하기',
 'Prediction':'예측','Observation':'관찰','Explanation':'설명',
 'Reset':'초기화','Reset Lab':'실습 초기화','Try it':'직접 실험하기',
 'Check Yourself':'스스로 확인하기','Learning Objective':'학습 목표',
 'Learning Objectives':'학습 목표','Key idea':'핵심 개념',
 'Why it matters':'왜 중요한가?','What to notice':'관찰 포인트',
 'Previous':'이전','Next':'다음','Input':'입력','Output':'출력',
 'Experiment':'실험','Experiments':'실험','Interactive Lab':'대화형 실습',
 '예측하기':'Predict','변경하기':'Change','관찰하기':'Observe','설명하기':'Explain',
 '초기화':'Reset','실습 초기화':'Reset Lab','스스로 확인하기':'Check Yourself',
 '학습 목표':'Learning Objectives','핵심 개념':'Key idea',
 '관찰 포인트':'What to notice'
};
const nodeFilter='script,style,textarea,option,svg,canvas,math,.katex,.katex-display,code,pre,[contenteditable],[data-no-translate]';
const roots=()=>[document.querySelector('.ss-layout-root'),document.querySelector('main'),document.querySelector('#page'),document.querySelector('.ss-layout-sidebar')].filter((x,i,a)=>x&&a.indexOf(x)===i).filter(x=>!rootsAncestor(x));
function rootsAncestor(el){return !!(el.parentElement&&el.parentElement.closest('.ss-layout-root,main,#page'));}
function bilingual(raw,mode){
 if(mode==='mixed')return raw;
 const trimmed=raw.trim();
 if(dictionary[trimmed]){
  const value=dictionary[trimmed];
  if(mode==='en'&&/[가-힣]/.test(trimmed))return raw.replace(trimmed,value);
  if(mode==='ko'&&!/[가-힣]/.test(trimmed))return raw.replace(trimmed,value);
 }
 // Common explicitly translated phrases: "English / 한국어" or "한국어 / English".
 let match=trimmed.match(/^(.+?)\s+\/\s+(.+)$/);
 if(match&&/[가-힣]/.test(match[1])!==/[가-힣]/.test(match[2])){
  const chosen=mode==='ko'?(/[가-힣]/.test(match[1])?match[1]:match[2]):(/[가-힣]/.test(match[1])?match[2]:match[1]);
  return raw.replace(trimmed,chosen.trim());
 }
 match=trimmed.match(/^(.+?)\s*\(([가-힣][^()]*)\)$/);
 if(match&&mode==='en')return raw.replace(trimmed,match[1].trim());
 match=trimmed.match(/^([가-힣][^()]*)\s*\(([A-Za-z][^()]*)\)$/);
 if(match&&mode==='en')return raw.replace(trimmed,match[2].trim());
 return raw;
}
let observers=[],running=false,pending=false;
function run(){
 if(running){pending=true;return;}
 running=true;
 for(const observer of observers)observer.disconnect();
 const mode=window.ELSLanguage.get();
 document.documentElement.dataset.language=mode;
 document.documentElement.dataset.elsLanguage=mode;
 const targets=roots();
 for(const root of targets){
  // Explicitly authored translations take priority over heuristics.
  for(const el of root.querySelectorAll('[data-i18n-en],[data-i18n-ko],[data-i18n-mixed]')){
   if(!saved.has(el))saved.set(el,el.textContent);
   const translated=el.getAttribute('data-i18n-'+mode);
   if(translated!=null&&el.textContent!==translated)el.textContent=translated;
   else if(translated==null&&el.textContent!==saved.get(el))el.textContent=saved.get(el);
  }
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
   const p=node.parentElement;
   if(!p||p.closest(nodeFilter)||p.closest('[data-i18n-en],[data-i18n-ko],[data-i18n-mixed]'))continue;
   if(!saved.has(node))saved.set(node,node.nodeValue);
   const original=saved.get(node);
   const next=bilingual(original,mode);
   if(node.nodeValue!==next)node.nodeValue=next;
  }
 }
 for(const root of targets){
  const o=new MutationObserver(()=>{if(!running)requestAnimationFrame(run);});
  o.observe(root,{subtree:true,childList:true,characterData:true});
  observers.push(o);
 }
 running=false;
 if(pending){pending=false;requestAnimationFrame(run);}
}
window.ELSLanguage.subscribe(run);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
else run();
window.ELSSharedLanguage={refresh:run};
})();