/* Native Chapter 5-8 formula contract, no browser dependencies. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
(function testAdvancedFormula(){
 'use strict';


 const source=readFileSync(new URL('../assets/ss-advanced-live-equations.js',import.meta.url),'utf8');
 const sandbox={};new Function('window',source)(sandbox);
 const mod=sandbox.SSAdvancedLiveEquations;
 const counts={5:8,6:6,7:7,8:8};
 const base={
  sigma:.5,a:.8,b:1.8,p:-1.1,z:-2.1,side:'right',kind:'exp',mode:'weight',roc:'annulus',
  shift:1.2,tau:1.3,input:'step',T:4,omega:1,wn:3,zeta:.5,fs:100,f:30,ns:16,
  m:4,n:512,pad:'4',window:'hann',n0:2,showphase:'mag',w:.5,fu:2,fn:45,an:.5,startup:'steady',
  B:80,atten:40,bits:4,direction:'right',N:4,M:12,noise:1
 };
 const metrics=[{key:'a',value:'0.2500'},{key:'b',value:'0.5000'},{key:'c',value:'1.5000'}];
 let checked=0;
 for(let ch=5;ch<=8;ch++){
  assert.equal(mod.counts[ch],counts[ch],'lesson count');
  for(let i=0;i<counts[ch];i++){
   const id=ch<=6?mod.order[ch][i]:i+1;
   const result=mod.get(ch,id,base,metrics);
   assert.ok(result?.general&&result?.now,`missing formula ${ch}.${id}`);
   assert.ok(result.en&&result.ko,`missing explanation ${ch}.${id}`);
   for(const line of [result.general,result.now]){
    assert.doesNotMatch(line,/\b(?:NaN|Infinity|undefined|null)\b/,`invalid formula ${ch}.${id}`);
    assert.doesNotMatch(line,/[가-힣]/,`non-math text in formula ${ch}.${id}`);
   }
   checked++;
  }
 }
 assert.equal(checked,29);
 function now(ch,id,state={}){
  return mod.get(ch,id,{...base,...state},metrics).now;
 }
 const check=(ch,id,state,rx)=>assert.match(now(ch,id,state),rx,`numeric check ${ch}.${id}`);
 check(5,'weight',{sigma:.5},/F\(\\infty\).*2/);
 check(5,'weight',{sigma:-.2},/\\infty/);
 check(5,'roc',{a:2,side:'left'},/<-2/);
 check(5,'pairs',{kind:'pulse',T:2},/X\(0\)=2/);
 check(5,'props',{a:2,b:.5,mode:'weight'},/-1\.5/);
 check(5,'inverse',{roc:'strip'},/-4<\\Re\(s\)<-1/);
 check(5,'rc',{tau:2},/0\.5/);
 check(5,'second',{zeta:.5},/16\.3/);
 check(6,'periodic',{f:20,fs:100},/1\.2566/);
 check(6,'pairs',{kind:'shift',n0:4},/n_0=4/);
 check(6,'phasor',{m:4,w:1},/\|H\|=0/);
 check(6,'fft',{n:512,pad:'4'},/0\.0625/);
 check(7,3,{f:90,fs:100},/f_\\mathrm\{alias\}=10/);
 check(7,6,{bits:4},/0\.13333/);
 check(8,3,{a:.4,b:1.8},/0\.4<\|z\|<1\.8/);
 check(8,4,{a:.5,b:2},/A=-0\.3333/);
 check(8,6,{N:4,omega:1},/\|H\|=0/);
 check(8,7,{a:.8,side:'causal',M:3},/S\(M\)=2\.44/);
 check(8,7,{a:1.2,side:'anti',M:3},/S\(M\)=2\.106/);
 check(8,8,{a:.7},/1-a=0\.3/);
 console.log('PASS: '+checked+' contextual formulas and 20 focused math/branch checks');
})();
