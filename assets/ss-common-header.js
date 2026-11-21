/* Shared chapter header controller; preserve each page's existing language/theme selectors. */
(function(){
'use strict';
function init(){
 const header=document.querySelector('.ss-common-header');
 if(!header)return;
 const menu=header.querySelector('.ss-common-menu');
 const title=header.querySelector('.ss-common-title');
 const links=header.querySelector('.ss-common-links');
 if(!menu||!title||!links)return;
 const path=location.pathname;
 const chapter=path.endsWith('/chapter5.html')?5:path.endsWith('/chapter6.html')?6:Number((location.hash.match(/^#chapter=(\d+)/)||[])[1])||0;
 function sync(){
  const ch=path.endsWith('/chapter5.html')?5:path.endsWith('/chapter6.html')?6:Number((location.hash.match(/^#chapter=(\d+)/)||[])[1])||0;
  for(const link of links.querySelectorAll('a')){
   const n=Number(link.dataset.ssChapter||((link.textContent||'').match(/Chapter\\s+(\d+)/)||[])[1]);
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
