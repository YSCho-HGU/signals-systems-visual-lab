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
for(let ch=2;ch<=8;ch++){
 const page=read('chapter'+ch+'.html');
 assert.match(page,/ss-content-model\.js\?v=20261122-data-v2/);
 assert.match(page,/SSContentModel\.model/);
 assert.match(page,/els-language-change/);
 assert.ok(page.indexOf('ss-content-model.js')<page.indexOf('<body>'),'Model must load before the lesson controller');
}
console.log('PASS: Chapter 2-8 use immutable English/Korean display data without changing numeric model state');
