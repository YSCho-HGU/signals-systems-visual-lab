/* Collapsible chapter sidebar; does not change exercise state or calculations. */
(function(){
'use strict';
const KEY='ss-sidebar-collapsed-v1',root=document.documentElement;
function saved(){try{return localStorage.getItem(KEY)==='1'}catch{return false}}
function persist(value){try{localStorage.setItem(KEY,value?'1':'0')}catch{}}
function update(){
 const collapsed=root.dataset.ssSidebar==='collapsed';
 document.querySelectorAll('.ss-side-toggle').forEach(b=>{
  if(b.getAttribute('aria-expanded')!==String(!collapsed))b.setAttribute('aria-expanded',String(!collapsed));
  const label=collapsed?'Expand chapter navigation':'Collapse chapter navigation';if(b.getAttribute('aria-label')!==label)b.setAttribute('aria-label',label);
  const icon=b.querySelector('.ss-toggle-icon');
  if(icon&&icon.textContent!==(collapsed?'»':'«'))icon.textContent=collapsed?'»':'«';
 });
}
function setup(){
 const side=document.querySelector('.ss-vertical-layout>.ss-vertical-sidebar,.shell>aside.nav,.shell>aside.sidebar,#app>aside.sidebar');
 if(!side)return;
 if(!side.querySelector('.ss-side-toggle')){
  const b=document.createElement('button');
  b.type='button';b.className='ss-side-toggle';
  b.innerHTML='<span class="ss-toggle-icon" aria-hidden="true">«</span><span class="ss-toggle-text">목차 접기 / Collapse</span>';
  b.addEventListener('click',()=>{
   const collapsed=root.dataset.ssSidebar!=='collapsed';
   root.dataset.ssSidebar=collapsed?'collapsed':'expanded';persist(collapsed);update();
   window.dispatchEvent(new Event('resize'));
  });
  side.prepend(b);
 }
 update();
}
root.dataset.ssSidebar=saved()?'collapsed':'expanded';
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);
else setup();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{const app=document.getElementById('app');if(app)new MutationObserver(setup).observe(app,{childList:true});});else{const app=document.getElementById('app');if(app)new MutationObserver(setup).observe(app,{childList:true});}
})();