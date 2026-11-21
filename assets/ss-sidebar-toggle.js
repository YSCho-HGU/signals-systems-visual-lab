/* Shared collapsible navigation across Chapters 1–8.
 * Retains the established localStorage key and never rebuilds experiment buttons.
 */
(function(){
'use strict';
const KEY='ss-sidebar-collapsed-v1',root=document.documentElement;
function saved(){try{return localStorage.getItem(KEY)==='1'}catch{return false}}
function persist(v){try{localStorage.setItem(KEY,v?'1':'0')}catch{}}
function chapterOneSidebar(){
 if(root.dataset.ssFoundationChapter!=='1')return;
 const nav=document.querySelector('main > nav#nav');
 if(!nav)return;
 const side=document.createElement('aside');
 side.className='ss-ch1-sidebar';
 side.setAttribute('aria-label','Chapter 1 learning navigation');
 const brand=document.createElement('div');brand.className='ss-ch1-brand';
 const over=document.createElement('span');over.textContent='SIGNALS & SYSTEMS / CHAPTER 01';
 const title=document.createElement('h2');title.textContent='Signals & Systems';
 const desc=document.createElement('p');desc.textContent='Foundations · Visual Lab';
 brand.append(over,title,desc);
 const label=document.createElement('div');label.className='ss-ch1-sidebar-title';
 label.textContent='LEARNING EXPERIMENTS / 학습 주제';
 nav.parentNode.insertBefore(side,nav);
 side.append(brand,label,nav);
}
function findSidebar(){
 return document.querySelector('main>.ss-ch1-sidebar,.ss-vertical-layout>.ss-vertical-sidebar,.ss7-shell>.ss7-sidebar,.ss8-shell>.ss8-sidebar,.shell>aside.nav,.app>aside.sidebar,#app>aside.sidebar');
}
function redraw(){
 // Layout first, then notify existing graph resize listeners after the new width is applied.
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  window.dispatchEvent(new Event('resize'));
  document.dispatchEvent(new CustomEvent('ss:sidebar-resized',{
   detail:{collapsed:root.dataset.ssSidebar==='collapsed'}
  }));
 }));
}
function sync(){
 const collapsed=root.dataset.ssSidebar==='collapsed';
 document.querySelectorAll('.ss-side-toggle').forEach(button=>{
  button.setAttribute('aria-expanded',String(!collapsed));
  button.setAttribute('aria-label',collapsed?'Expand chapter navigation':'Collapse chapter navigation');
  button.title=collapsed?'Expand navigation / 목차 펼치기':'Collapse navigation / 목차 접기';
  const icon=button.querySelector('.ss-toggle-icon');
  if(icon)icon.textContent=collapsed?'»':'«';
  const text=button.querySelector('.ss-toggle-text');
  if(text)text.textContent=collapsed?'목차 펼치기 / Expand':'목차 접기 / Collapse';
 });
}
function setup(){
 chapterOneSidebar();
 const side=findSidebar();if(!side)return;
 if(!side.querySelector('.ss-side-toggle')){
  const button=document.createElement('button');
  button.type='button';button.className='ss-side-toggle';
  button.innerHTML='<span class="ss-toggle-icon" aria-hidden="true">«</span><span class="ss-toggle-text">목차 접기 / Collapse</span>';
  button.addEventListener('click',()=>{
   const collapsed=root.dataset.ssSidebar!=='collapsed';
   root.dataset.ssSidebar=collapsed?'collapsed':'expanded';
   persist(collapsed);sync();redraw();
  });
  side.prepend(button);
  redraw();
 }
 sync();
}
root.dataset.ssSidebar=saved()?'collapsed':'expanded';
function init(){
 setup();
 const app=document.getElementById('app');
 if(app)new MutationObserver(setup).observe(app,{childList:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.addEventListener('storage',e=>{if(e.key===KEY){root.dataset.ssSidebar=saved()?'collapsed':'expanded';sync();redraw()}});
})();
