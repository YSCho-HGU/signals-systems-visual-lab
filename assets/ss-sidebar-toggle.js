/* One sidebar header/toggle component for Signals & Systems Chapters 1–8.
 * The chapter-specific experiment controls remain owned by their original scripts.
 */
(function(){
'use strict';
const KEY='ss-sidebar-collapsed-v1';
const root=document.documentElement;
function saved(){try{return localStorage.getItem(KEY)==='1'}catch{return false}}
function persist(v){try{localStorage.setItem(KEY,v?'1':'0')}catch{}}
function findSidebar(){
 return document.querySelector('.ss-layout-root > .ss-layout-sidebar');
}
function redraw(){
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  window.dispatchEvent(new Event('resize'));
  document.dispatchEvent(new CustomEvent('ss:sidebar-resized',{detail:{collapsed:root.dataset.ssSidebar==='collapsed'}}));
 }));
}
function sync(){
 const collapsed=root.dataset.ssSidebar==='collapsed';
 const side=findSidebar();
 if(side){
  // Stronger than legacy chapter nav CSS (including rules with !important).
  // Restore all native component styles on expand.
  for(const child of side.children){
   if(child.classList.contains('ss-sidebar-topline'))continue;
   if(collapsed)child.style.setProperty('display','none','important');
   else child.style.removeProperty('display');
  }
  if(collapsed)side.scrollTop=0;
 }
 document.querySelectorAll('.ss-side-toggle').forEach(button=>{
  button.setAttribute('aria-expanded',String(!collapsed));
  button.setAttribute('aria-label',collapsed?'목차 펼치기':'목차 접기');
  button.title=collapsed?'Expand chapter navigation / 목차 펼치기':'Collapse chapter navigation / 목차 접기';
  const icon=button.querySelector('.ss-toggle-icon');
  if(icon)icon.textContent=collapsed?'≫':'≪';
 });
}
function setup(){
 const side=findSidebar();if(!side)return;
 const brand=side.querySelector(':scope > .brand');
 if(!brand)return;
 let row=side.querySelector(':scope > .ss-sidebar-topline');
 if(!row){
  row=document.createElement('div');
  row.className='ss-sidebar-topline';
  side.prepend(row);
 }
 let button=row.querySelector('.ss-side-toggle');
 if(!button){
  button=document.createElement('button');
  button.type='button';button.className='ss-side-toggle';
  button.innerHTML='<span class="ss-toggle-icon" aria-hidden="true">≪</span>';
  row.prepend(button);
 }
 const eyebrow=brand.querySelector(':scope > .over,:scope > .eyebrow');
 if(eyebrow && eyebrow.parentElement!==row){
  eyebrow.classList.add('ss-sidebar-chapter-label');
  const m=eyebrow.textContent.match(/CHAPTER\s*0?([1-8])/i);
  if(m)eyebrow.textContent='Signals & Systems · Ch '+String(m[1]).padStart(2,'0');
  row.append(eyebrow);
 }
 sync();
}
document.addEventListener('click',event=>{
 const button=event.target.closest?.('.ss-side-toggle');
 if(!button||!button.closest('.ss-layout-sidebar'))return;
 const collapsed=root.dataset.ssSidebar!=='collapsed';
 root.dataset.ssSidebar=collapsed?'collapsed':'expanded';
 persist(collapsed);
 sync();
 redraw();
});
root.dataset.ssSidebar=saved()?'collapsed':'expanded';
function init(){
 setup();
 const app=document.getElementById('app');
 if(app)new MutationObserver(setup).observe(app,{childList:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.addEventListener('storage',e=>{
 if(e.key===KEY){root.dataset.ssSidebar=saved()?'collapsed':'expanded';sync();redraw()}
});
})();