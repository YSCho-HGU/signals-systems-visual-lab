/* Progressive enhancement for ④ Explain: Chapters 5-8. */
(function advancedLiveBridge(){
 'use strict';
 const script=document.querySelector('script[data-ss-advanced-live]');
 const chapter=Number(script?.dataset.ssAdvancedLive||0);
 if(chapter<5||chapter>8)return;
 const eq=()=>window.SSAdvancedLiveEquations;
 const L=(en,ko)=>window.SSContentModel?.pair?.(en,ko,undefined,true)||en+' / '+ko;
 const tr=v=>window.SSContentModel?.text?.(v)||String(v);
 const controlSelector=chapter===5?'#page [data-key]':chapter===6?'#content [data-ctrl]':'#controls [data-param]';
 const panelClass='ss-adv-live-panel';
 const signatures=new WeakMap();
 let pending=false,lastEvent=null;
 function selectValue(el){
  if(el.tagName!=='SELECT')return el.value;
  const option=el.selectedOptions?.[0];
  const value=(option?.textContent||el.value).trim();
  const human={right:['Right-sided','우측'],left:['Left-sided','좌측'],strip:['Two-sided','양측'],
   annulus:['Annular','고리형'],outer:['Exterior','바깥쪽'],inner:['Interior','안쪽'],
   causal:['Causal','인과적'],rect:['Rectangular','직사각형'],hann:['Hann','Hann 창']};
  const simple=human[el.value];
  return simple?L(...simple):tr(value);
 }
 function controls(){
  return [...document.querySelectorAll(controlSelector)].filter(el=>el.dataset.key||el.dataset.ctrl||el.dataset.param)
   .map(el=>({key:el.dataset.key||el.dataset.ctrl||el.dataset.param,value:el.value,
    shown:selectValue(el)}));
 }
 function native(){
  if(chapter===5){const model=window.__laplaceVisualLab;return {lesson:model?.active,params:model?.state?.[model.active]}}
  if(chapter===6){const model=window.__dtftApp;return {lesson:model?.active,params:model?.state?.[model.active]}}
  if(chapter===7){return {lesson:window.SSChapter7?.currentExperiment,params:null}}
  const app=window.SSChapter8;return {lesson:app?.currentExperiment,params:app?.currentState?.()};
 }
 function readMetrics(){
  if(chapter>6)return [];
  const sel=chapter===5?'#page .outputs .metrics .metric':'#content .metrics .metric';
  return [...document.querySelectorAll(sel)].map(el=>({
   key:tr(el.querySelector('.k')?.textContent?.trim()||''),
   value:tr(el.querySelector('.v')?.textContent?.trim()||''),
   detail:tr(el.querySelector('.d,.detail')?.textContent?.trim()||'')
  })).filter(x=>x.value&&x.value!=='-'&&x.value!=='—').slice(0,3);
 }
 function observation(formula){
  const hint=document.querySelector('#insight');
  const original=hint?.textContent?.replace(/\s+/g,' ').trim()||'';
  const localized=tr(original),mode=window.SSContentModel?.mode?.()||'mixed';
  const primary=hint?.querySelector('strong')?.textContent?.replace(/\s+/g,' ').trim()||'';
  let sample=localized;
  // Native Chapter 7/8 insights may contain untranslated prose. Show a grounded,
  // mode-correct explanation rather than leaking Korean into English-only cards.
  if(mode==='en'&&/[가-힣]/.test(sample)){
   sample=(primary&&!/[가-힣]/.test(primary)&&/\d|ROC|Hz/.test(primary))
     ?primary+' — '+(formula?.en||''):(formula?.en||primary);
  }else if(mode==='ko'&&!/[가-힣]/.test(sample)){
   sample=formula?.ko||sample;
  }else if(mode==='mixed'&&!/[가-힣]/.test(sample)){
   sample=L(sample,formula?.ko||'');
  }
  if(sample.length>170)sample=sample.slice(0,167).trimEnd()+'…';
  return sample?[{key:L('Current graph finding','현재 그래프의 관찰 결과'),value:sample}]:[];
 }
 function mount(){
  if(chapter===5){const follow=document.querySelector('#page .ss5-followup');return follow?{host:follow,before:follow.firstElementChild}:null}
  if(chapter===6){
   const target=document.querySelector('#content .ss6-interpretation');
   return target?{host:target,before:target.querySelector('.metrics')}:null;
  }
  const root=document.querySelector(chapter===7?'.ss7-stage-explain':'.ss8-stage-explain');
  const grid=root?.querySelector(chapter===7?'.ss7-explain-grid':'.ss8-explain-grid');
  return root?{host:root,before:grid}:null;
 }
 function el(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node}
 function addDataList(host,items,empty){
  if(!items.length){host.append(el('p','ss-adv-live-empty',empty));return}
  const list=el('dl','ss-adv-live-items');
  for(const item of items){
   const row=el('div','ss-adv-live-item');
   row.append(el('dt','',item.key),el('dd','',item.shown??item.value));
   if(item.detail)row.append(el('small','ss-adv-live-detail',item.detail));
   list.append(row);
  }
  host.append(list);
 }
 function renderMath(host,tex){
  const node=el('div','ss-adv-live-equation',tex);
  node.dataset.ssMath=tex;
  node.dataset.ssMathFallback=tex;
  node.dataset.ssMathDisplay='block';
  node.setAttribute('aria-label',tex);
  host.append(node);
  if(typeof window.katex?.render==='function'){
   try{
    window.katex.render(tex,node,{displayMode:true,throwOnError:true,strict:'ignore',trust:false,output:'htmlAndMathml'});
    node.dataset.ssMathState='rendered';
   }catch(error){
    node.dataset.ssMathState='error';
    node.dataset.ssMathError=String(error.message||error).slice(0,180);
    node.textContent=tex;
   }
  }else node.dataset.ssMathState='waiting';
 }
 function draw(){
  const loc=mount(),nativeState=native(),info=lastEvent?.chapter===chapter?lastEvent:null;
  if(!loc||!eq()?.get)return;
  const controlsNow=controls();
  const params={...Object.fromEntries(controlsNow.map(c=>[c.key,c.value])),...(nativeState.params||{}),...(info?.state||{})};
  const lesson=info?.lesson??nativeState.lesson;
  if(lesson===undefined||lesson===null)return;
  const metrics=readMetrics();
  const formula=eq().get(chapter,lesson,params,metrics);
  const observationNow=metrics.length?metrics:observation(formula);
  if(!formula)return;
  let panel=loc.host.querySelector(':scope > .'+panelClass);
  if(!panel){panel=el('section',panelClass);panel.setAttribute('aria-live','off');loc.host.insertBefore(panel,loc.before||null)}
  const mode=window.SSContentModel?.mode?.()||'mixed';
  const signature=JSON.stringify([chapter,lesson,mode,controlsNow,observationNow,formula]);
  if(signatures.get(panel)===signature && panel.querySelectorAll('.ss-adv-live-equation[data-ss-math-state="waiting"]').length===0)return;
  signatures.set(panel,signature);
  panel.dataset.ssAdvancedChapter=String(chapter);
  panel.dataset.ssAdvancedLesson=String(lesson);
  const title=el('h3','ss-adv-live-title',L('Current result · ② → ③','현재 결과 · ② → ③'));

  const cols=el('div','ss-adv-live-columns');
  for(const [label,items,empty] of [
   [L('② Settings','② 설정값'),controlsNow,L('Adjust a variable in ②','②에서 변수를 조절하세요')],
   [L('③ Observed','③ 관찰값'),observationNow,L('Review the current graph','현재 그래프를 확인하세요')]
  ]){
   const col=el('div','ss-adv-live-column');
   col.append(el('h4','ss-adv-live-column-title',label));
   addDataList(col,items,empty);cols.append(col);
  }
  const math=el('section','ss-adv-live-math');
  math.append(el('h4','ss-adv-live-math-title',L('Equation check','수식으로 확인')));
  for(const [head,tex] of [[L('Core relationship','핵심 관계식'),formula.general],[L('At current settings','현재 설정값 대입'),formula.now]]){
   const row=el('div','ss-adv-live-math-row');
   row.append(el('p','ss-adv-live-math-label',head));
   renderMath(row,tex);math.append(row);
  }
  const note=el('p','ss-adv-live-note',L(formula.en,formula.ko));
  panel.replaceChildren(title,cols,math,note);
 }
 function queue(event){
  if(event?.detail?.chapter===chapter)lastEvent=event.detail;
  if(pending)return;pending=true;
  requestAnimationFrame(()=>{pending=false;try{draw()}catch(e){console.warn('Advanced live evidence',e)}});
 }
 document.addEventListener('ss-advanced-live-update',queue);
 document.addEventListener('els-language-change',()=>{lastEvent=null;queue()});
 window.addEventListener('load',()=>queue());
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>queue(),{once:true});else queue();
})();
