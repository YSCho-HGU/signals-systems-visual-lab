/* Contract for Chapter 1-4 formula-to-current-value cards.
 * Independent of browser layout. npm run qa:foundations-formulas
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../assets/ss-foundations-live-equations.js',import.meta.url),'utf8');
const window={};
new Function('window',src)(window);
const mod=window.SSFoundationEquations;
assert.ok(mod?.get);
assert.deepEqual({...mod.chapterCounts},{1:9,2:9,3:7,4:8});
const state={
 Ts:.6,A:2,f:.8,phase:0,kind:'impulse',domain:'CT',width:.5,t0:1,
 a:2,b:-2,omega:2,freq:'1/4',T:4,W:2,alpha:.7,shift:1,
 op:'diff',rate:24,case:'audio',noise:.06,speed:1,
 k:1,n:2,Lx:4,Lh:3,nx:-2,nh:1,t:1.5,M:8,
 tau:1.5,N:8,L:3,phi:0,special:8,wc:6,dt:.25,D:2,mode:'cascade',r:.7
};
const metrics=[{value:'2.500'},{value:'0.750'},{value:'1.250'}];
let cases=0;
for(const [chapter,total] of Object.entries(mod.chapterCounts)){
 for(let index=0;index<total;index++){
  const result=mod.get(chapter,index,state,metrics);
  assert.ok(result,'missing formula for chapter '+chapter+' lesson '+(index+1));
  for(const prop of ['general','now']){
   assert.equal(typeof result[prop],'string');
   assert.ok(result[prop].length>=6,'empty '+prop);
   assert.doesNotMatch(result[prop],/NaN|Infinity|undefined|null/,'invalid formula '+chapter+':'+index);
   assert.doesNotMatch(result[prop],/[가-힣]/,'prose leaked into math '+chapter+':'+index);
  }
  cases++;
 }
}
assert.equal(cases,33);
const get=(chapter,index,overrides={},rows=metrics)=>mod.get(chapter,index,{...state,...overrides},rows);
assert.match(get(1,0).now,/f_s=1\.6667/);
assert.match(get(1,1).now,/4/); // CT impulse: A/epsilon=4
assert.match(get(1,1,{domain:'DT'}).general,/delta/);
assert.match(get(1,2).now,/support/);
assert.match(get(1,3).now,/N_0=4/);
assert.match(get(1,3,{freq:'irr'}).now,/notin/);
assert.match(get(1,4,{},[{value:'4.20'},{value:'0.50'}]).now,/E\(T\)=4\.20/);
assert.match(get(1,7,{op:'int'}).general,/int/);
assert.match(get(2,2).now,/L_y=6/);
assert.match(get(2,4,{a:.8,b:.8}).general,/t e/);
assert.match(get(2,4,{a:.8,b:1.2}).general,/frac/);
assert.match(get(2,7,{mode:'parallel'}).general,/h_1\+h_2/);
assert.match(get(3,0,{A:.8,T:4}).now,/0\.4/);
assert.match(get(3,1,{tau:2,T:8}).now,/0\.25/);
assert.match(get(3,3,{T:4,t0:1}).now,/-1\.5708/);
assert.match(get(4,0,{T:4}).now,/1\.5708/);
assert.match(get(4,3,{t0:1.5}).now,/-1\.5/);
assert.match(get(4,7,{dt:.25}).now,/0\.25/);
console.log('PASS: '+cases+' formula pairs, 18 focused numerical/branch assertions');
