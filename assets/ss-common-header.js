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
  link.href='./chapter'+number+'.html';
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
 // Four controls: previous chapter, previous section, next section, next chapter.
 const chapterMatch=location.pathname.match(/chapter([1-8])\.html$/);
 const chapterNumber=chapterMatch?Number(chapterMatch[1]):0;
 if(chapterNumber){
  const existing=header.querySelector('.ss-chapter-arrows');
  if(existing)existing.remove();
  const arrows=document.createElement('nav');
  arrows.className='ss-chapter-arrows ss-four-navigation';
  arrows.setAttribute('aria-label','Chapter and section navigation');
  const make=(kind,direction,glyph,label)=>{
   const el=document.createElement(kind==='chapter'?'a':'button');
   el.className='ss-chapter-arrow ss-nav-'+kind;
   el.textContent=glyph;el.title=label;el.setAttribute('aria-label',label);
   if(kind==='section'){el.type='button';el.dataset.ssSectionDirection=String(direction);}
   else{
    const target=chapterNumber+direction;
    if(target<1||target>8){el.setAttribute('aria-disabled','true');el.removeAttribute('href');}
    else el.href='./chapter'+target+'.html';
   }
   arrows.append(el);return el;
  };
  make('chapter',-1,'⇤','Previous chapter');
  const prevSection=make('section',-1,'←','Previous section');
  const nextSection=make('section',1,'→','Next section');
  make('chapter',1,'⇥','Next chapter');
  const actions=header.querySelector('.ss-common-actions');
  if(actions)header.insertBefore(arrows,actions);else header.append(arrows);

  const findNav=()=>{
   const side=document.querySelector('.ss-layout-sidebar');
   if(!side)return null;
   return side.querySelector('#ss7-lesson-nav,#tabs,nav.ss8-lab-nav,nav.tabs,nav.nav,nav#nav');
  };
  const sections=()=>Array.from(findNav()?.querySelectorAll(':scope > button')||[])
   .filter(button=>!button.hidden && !button.disabled);
  const currentIndex=items=>{
   let i=items.findIndex(button=>button.matches('.active,.on,[aria-current="page"],[aria-current="true"],[aria-pressed="true"]'));
   if(i<0)i=items.findIndex(button=>button.classList.contains('selected'));
   return i<0?0:i;
  };
  const refresh=()=>{
   const items=sections(),i=currentIndex(items);
   prevSection.disabled=!items.length||i<=0;
   nextSection.disabled=!items.length||i>=items.length-1;
   prevSection.setAttribute('aria-disabled',String(prevSection.disabled));
   nextSection.setAttribute('aria-disabled',String(nextSection.disabled));
  };
  arrows.addEventListener('click',event=>{
   const button=event.target.closest('[data-ss-section-direction]');
   if(!button||button.disabled)return;
   const items=sections(),index=currentIndex(items);
   const target=items[index+Number(button.dataset.ssSectionDirection)];
   if(target){target.click();requestAnimationFrame(refresh);}
  });
  let observed=null;
  const observe=()=>{
   const nav=findNav();
   if(!nav||observed===nav)return;
   observed=nav;
   new MutationObserver(()=>requestAnimationFrame(refresh)).observe(nav,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-current','aria-pressed','disabled']});
   nav.addEventListener('click',()=>requestAnimationFrame(refresh));
   refresh();
  };
  observe();
  const container=document.querySelector('.ss-layout-root');
  if(container)new MutationObserver(observe).observe(container,{childList:true});
  window.addEventListener('ss:sidebar-resized',refresh);
  refresh();
 }
 // Synchronize all chapter language pickers using the shared language preference.
 const languagePicker=header.querySelector('.ss-common-language-select');
 if(languagePicker){
  if(window.ELSLanguage?.bindSelect)window.ELSLanguage.bindSelect(languagePicker);
  else{
   const KEY='els-language';
   try{languagePicker.value=localStorage.getItem(KEY)||'mixed';}catch(e){}
   languagePicker.addEventListener('change',()=>{
    try{localStorage.setItem(KEY,languagePicker.value)}catch(e){}
    document.documentElement.dataset.language=languagePicker.value;
   });
  }
 }
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
