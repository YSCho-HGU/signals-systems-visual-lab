/* Shared chapter header controller; preserve each page's existing language/theme selectors. */
(function(){
'use strict';
const CHAPTERS=["Signals & Systems","LTI Systems","Fourier Series","CTFT","Laplace Transform","DTFT","Sampling","Z-Transform"];
function buildLinks(nav){
 if(nav.dataset.ssLinksBuilt)return;
 const fragment=document.createDocumentFragment();
 CHAPTERS.forEach((name,i)=>{
  const number=i+1;
  const link=document.createElement('a');
  link.href=number===5?'./chapter5.html':number===6?'./chapter6.html':number===7?'./chapter7.html':number===8?'./chapter8.html':'./index.html#chapter='+number;
  link.dataset.ssChapter=String(number);
  link.textContent='Chapter '+number+' · '+name;
  fragment.appendChild(link);
 });
 nav.replaceChildren(fragment);
 nav.dataset.ssLinksBuilt='true';
}
function init(){
 const header=document.querySelector('.ss-common-header');
 if(!header)return;
 const menu=header.querySelector('.ss-common-menu');
 const title=header.querySelector('.ss-common-title');
 const links=header.querySelector('.ss-common-links');
 if(!menu||!title||!links)return;
 buildLinks(links);
 const path=location.pathname;
 function sync(){
  const ch=path.endsWith('/chapter5.html')?5:path.endsWith('/chapter6.html')?6:path.endsWith('/chapter7.html')?7:path.endsWith('/chapter8.html')?8:Number((location.hash.match(/^#chapter=(\d+)/)||[])[1])||0;
  for(const link of links.querySelectorAll('a')){
   const n=Number(link.dataset.ssChapter||((link.textContent||'').match(/Chapter\s+(\d+)/)||[])[1]);
   if(n===ch)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  }
 }
 sync();
 window.addEventListener('hashchange',()=>{sync();menu.open=false});
 document.addEventListener('pointerdown',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;title.focus()}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
