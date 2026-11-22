import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=read('assets/ss-content-model.js');
const example={id:'example',title:'Harmonically Related Sinusoids / 조화 정현파',
 desc:'CT는 모든 실수 시간 t에서 정의되고, DT는 정수 index n에서만 정의됩니다. Stem 사이의 선은 새 sample을 만들지 않습니다.',
 defaults:{frequency:30},controls:[{key:'frequency',label:'Sampling rate / 표본화율'}]};
for(const mode of ['en','mixed','ko']){
 const window={ELSLanguage:{get:()=>mode}};
 new Function('window','localStorage',source)(window,{getItem:()=>mode});
 const model=window.SSContentModel.model(example);
 assert.equal(model.id,example.id);
 assert.equal(model.defaults.frequency,30);
 assert.equal(example.title,'Harmonically Related Sinusoids / 조화 정현파','Canonical content is not mutated');
 if(mode==='en'){
  assert.equal(model.title,'Harmonically Related Sinusoids');
  assert.ok(model.desc.startsWith('A continuous-time'));
  assert.doesNotMatch(model.desc+model.title+model.controls[0].label,/[가-힣]/);
 }else if(mode==='ko'){
  assert.equal(model.title,'조화 정현파');
  assert.ok(model.desc.startsWith('CT는'));
 }else{
  assert.ok(model.desc.startsWith('A continuous-time'));
  assert.ok(model.desc.includes('\nCT는'));
  assert.ok(model.title.indexOf('Harmonically')<model.title.indexOf('조화'));
 }
}
// Rendering the same text through model() and html() must not duplicate
// English or Korean prose. This used to recur in Mixed mode.
for(const selected of ['en','mixed','ko']){
 const fakeWindow={ELSLanguage:{get:()=>selected}};
 new Function('window','localStorage',source)(fakeWindow,{getItem:()=>selected});
 const m=fakeWindow.SSContentModel;
 const text='CT는 모든 실수 시간 t에서 정의되고, DT는 정수 index n에서만 정의됩니다. Stem 사이의 선은 새 sample을 만들지 않습니다.';
 const localized=m.model({desc:text}).desc;
 const rendered=m.html('<p>'+localized+'</p>');
 assert.equal(rendered,'<p>'+localized+'</p>','HTML pass must not append a duplicate translation');
 assert.equal(m.pair('English explanation','한국어 설명','en'),'English explanation');
 assert.equal(m.pair('English explanation','한국어 설명','ko'),'한국어 설명');
 assert.equal(m.pair('English explanation','한국어 설명','mixed'),'English explanation · 한국어 설명');
 const chart={title:'Time waveform / 시간 파형',series:[{label:'Output / 출력',xy:[[0,1],[1,2]]}]};
 const graph=m.graph(chart);
 assert.deepEqual(graph.series[0].xy,chart.series[0].xy,'Graph numerical data must remain unchanged');
 assert.equal(chart.title,'Time waveform / 시간 파형','Original graph remains unchanged');
}
for(let ch=1;ch<=8;ch++){
 const page=read('chapter'+ch+'.html');
 assert.match(page,/ss-content-model\.js\?v=20261122-unified-v7/);
 if(ch>1)assert.match(page,/SSContentModel\.model/);
 assert.match(page,/els-language-change/);
 assert.ok(page.indexOf('ss-content-model.js')<page.indexOf('<body>'),'Model must load before the lesson controller');
}
const markup='<strong>Explain</strong> — CT/DT 구분은 그래프의 모양이 아니라 independent-variable domain입니다.';
const window={ELSLanguage:{get:()=> 'en'}};
new Function('window','localStorage',source)(window,{getItem:()=> 'en'});
assert.doesNotMatch(window.SSContentModel.html(markup),/[가-힣]/,'Dynamic HTML is translated before insertion');
console.log('PASS: Chapter 1-8 immutable English/Korean model, HTML generation and numeric state');
