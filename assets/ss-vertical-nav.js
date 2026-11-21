/* Normalize chapter 1, 7, 8 into the same left vertical navigation pattern as 5.1/6.1.
   Move existing nodes only: preserve their event handlers, student state and plot DOM. */
(function(){
 'use strict';
 function normalize(){
  const nav=document.querySelector('main > nav#nav');
  const main=nav?.parentElement;
  if(!nav||!main||main.querySelector('.ss-vertical-layout'))return;
  const layout=document.createElement('div');
  layout.className='ss-vertical-layout';
  const sidebar=document.createElement('aside');
  sidebar.className='ss-vertical-sidebar';
  sidebar.setAttribute('aria-label','Chapter experiments');
  const content=document.createElement('div');
  content.className='ss-vertical-main';
  const title=document.createElement('div');
  title.className='ss-vertical-heading';
  title.textContent='LEARNING EXPERIMENTS';
  sidebar.append(title,nav);
  for(const child of [...main.children])content.append(child);
  layout.append(sidebar,content);
  main.append(layout);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',normalize,{once:true});
 else normalize();
})();