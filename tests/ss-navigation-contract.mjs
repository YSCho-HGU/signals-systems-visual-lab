/* Shared navigation contract: protects layout consistency without changing labs. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const header=read('assets/ss-common-header.js');
const rail=read('assets/ss-sidebar-layout.css');
const controller=read('assets/ss-sidebar-toggle.js');
const overview=read('index.html');
const math=read('assets/ss-overview-standard.js');
assert.match(header,/Learning Map · Transform Connections/);
assert.ok(header.indexOf("overview.textContent")<header.indexOf("map.textContent"));
assert.ok(header.indexOf("map.textContent")<header.indexOf("CHAPTERS.forEach"));
assert.ok(header.includes('const onOverview='));
assert.match(controller,/ss-sidebar-collapsed-v1/);
assert.match(controller,/ss-ch1-sidebar/);
assert.match(controller,/ss:sidebar-resized/);
assert.match(rail,/grid-template-columns:var\(--ss-sidebar-closed\) minmax\(0,1fr\)/);
assert.match(rail,/ss-foundation-chapter="1"/);
assert.match(overview,/ss-overview-standard\.css/);
assert.match(overview,/ss-overview-standard\.js/);
assert.match(overview,/data-els-theme-picker aria-label="Theme"/);
assert.match(overview,/<main id="map-view"/);
assert.match(math,/typesetMapDetail/);
for(let ch=1;ch<=8;ch++){
 const page=read('chapter'+ch+'.html');
 assert.match(page,/ss-sidebar-layout\.css/, 'Chapter '+ch+' is missing layout stylesheet');
 assert.match(page,/ss-sidebar-toggle\.js/, 'Chapter '+ch+' is missing sidebar controller');
 assert.match(page,/ss-common-header\.js/, 'Chapter '+ch+' is missing common header');
 assert.match(page,/ss-common-header/, 'Chapter '+ch+' is missing header style');
 if(ch===1){
  assert.match(page,/data-ss-foundation-chapter="1"/);
  assert.match(page,/id="ch1-app" class="app ss-ch1-app"/);
  assert.match(page,/<aside class="sidebar nav ss-ch1-sidebar"/);
  assert.match(page,/ss-ch1-native-navigation\.css/);
  assert.match(page,/class="num"/);
  assert.doesNotMatch(page,/class="ss-ch1-nav-title"/);
}
}
console.log('PASS: shared header + Learning Map + Overview + Chapters 1–8 sidebar contracts');
