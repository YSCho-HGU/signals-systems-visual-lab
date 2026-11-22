import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const header=read('assets/ss-common-header.js');
const model=read('assets/ss-content-model.js');
const foundations=read('assets/ss-foundations-standard.js');
for(const fragment of ['Previous chapter','Next chapter','Previous section','Next section','ss-layout-sidebar','aria-disabled','ss-language-icon','한/영'])
 assert.ok(header.includes(fragment),'Missing shared navigation: '+fragment);
assert.match(header,/prevSection\.disabled=i<=0/);
assert.match(header,/nextSection\.disabled=i<0\|\|i>=items\.length-1/);
for(const name of ['function plain(','function html(','function text(','function model(','ELSLanguage?.get'])assert.ok(model.includes(name),'Missing data model function: '+name);
assert.ok(!foundations.includes('ELSSharedLanguage'), 'Foundations must use native content model');
for(let ch=1;ch<=8;ch++){
 const page=read('chapter'+ch+'.html');
 assert.match(page,/ss-content-model\.js\?v=20261122-unified-v7/);
 assert.doesNotMatch(page,/ss-language-content\.js/,'Do not load the legacy DOM translator');
 assert.match(page,/ss-common-header\.js\?v=20261122-navigation-language-v2/);
 assert.match(page,/ss-common-header\.css\?v=20261122-model-only/);
 assert.match(page,/<option value="mixed">한\/영<\/option>/);
 assert.match(page,/<option value="en">English<\/option>/);
 assert.match(page,/<option value="ko">한국어<\/option>/);
 assert.ok(page.indexOf('ss-content-model.js')<page.indexOf('<body>'),'Model must load before lesson JavaScript');
 if(ch>1)assert.match(page,/SSContentModel\.model/);
}
assert.ok(read('chapter1.html').includes('const ch1Localize=value=>window.SSContentModel.text(value)'));
const supplemental6=read('assets/ss-ch6-learning-flow.js');
assert.ok(supplemental6.includes('window.SSContentModel.pair(en,ko)'),'Chapter 6 supplemental language must use the shared model');
const supplemental7=read('assets/ss-ch7-learning-standard.js');
assert.ok(supplemental7.includes('SSChapter7?.currentCheckQuestion'),'Chapter 7 prompt must come from the authored model, not DOM text');
assert.ok(!supplemental7.includes("q?q.textContent.trim()"),'Chapter 7 prompt should not scrape a rendered question');
assert.ok(!read('chapter7.html').includes('ss-language-content.js'),'Legacy DOM translator should remain disconnected');
console.log('PASS: Chapter 1–8 use the shared data model and common header without DOM text rewriting');
