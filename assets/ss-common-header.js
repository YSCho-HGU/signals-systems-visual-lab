/* Shared chapter header controller; preserve each page's existing language/theme selectors. */
(function(){
'use strict';
const CHAPTERS=["Signals & Systems","LTI Systems","Fourier Series","CTFT","Laplace Transform","DTFT","Sampling","Z-Transform"];
function buildLinks(nav){
 if(nav.dataset.ssLinksBuilt)return;
 const fragment=document.createDocumentFragment();
 const overview=document.createElement('a');
 overview.href='./index.html#overview';overview.dataset.ssView='overview';
 overview.textContent='Overview · Course Home';fragment.appendChild(overview);
 const map=document.createElement('a');
 map.href='./index.html#map';map.dataset.ssView='map';
 map.textContent='Learning Map · Transform Connections';fragment.appendChild(map);
 CHAPTERS.forEach((name,i)=>{
  const number=i+1;
  const link=document.createElement('a');
  link.href='./chapter'+number+'.html?v=20261121e';
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
  const ch=Number((path.match(/chapter([1-8])\.html$/)||[])[1])||Number((location.hash.match(/^#chapter=(\d+)/)||[])[1])||0;
  const onOverview=/index\.html$|\/$/.test(path);
  const view=onOverview?(location.hash==='#map'?'map':'overview'):null;
  for(const link of links.querySelectorAll('a')){
   const n=Number(link.dataset.ssChapter||0);
   const active=link.dataset.ssView?link.dataset.ssView===view:!!ch&&n===ch;
   if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  }
 }
 sync();
 window.addEventListener('hashchange',()=>{sync();menu.open=false});
 document.addEventListener('pointerdown',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;title.focus()}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
