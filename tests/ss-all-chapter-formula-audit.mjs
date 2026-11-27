/* Audit all Chapter 1–8 equations with native defaults and control ranges. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const limits={1:9,2:9,3:7,4:8,5:8,6:6,7:7,8:8};
function getLiteral(source,start){
 const open=source[start],close=open==='{'?'}':']';
 assert.ok(open==='{'||open==='[','Expected data literal');
 let depth=0,quote='',escape=false;
 for(let k=start;k<source.length;k++){
  const c=source[k];
  if(quote){
   if(escape){escape=false;continue}
   if(c==='\\'){escape=true;continue}
   if(c===quote)quote='';
   continue;
  }
  if(c==="'"||c==='"'){quote=c;continue}
  if(c===open)depth++;
  if(c===close&&!--depth)return source.slice(start,k+1);
 }
 throw new Error('Unclosed native data literal');
}
const asObject=src=>new Function('return ('+src+')')();
const native={};
for(let chapter=1;chapter<=8;chapter++){
 const source=read('chapter'+chapter+'.html');
 const head=chapter===1?'const EXPS=[':chapter===5?'const LABS=[':
  chapter>=7?'const EXPERIMENTS=[':'const MODULES=[';
 const begin=source.indexOf(head);
 assert.ok(begin>=0,'Native chapter modules missing '+chapter);
 const part=source.slice(begin);
 const regex=chapter===1?/\{id:(\d+),short:'/g:
  chapter===5?/\{id:'([^']+)',num:'/g:
  chapter<7?/\{id:'([^']+)',short:'/g:/\{short:'([^']+)'/g;
 const matches=[...part.matchAll(regex)].slice(0,limits[chapter]);
 const globals=chapter===5||chapter===6?(()=>{
  const key=chapter===5?'const DEF=':'const defaults=';
  const at=source.indexOf(key);
  assert.ok(at>=0,'Native defaults missing Ch'+chapter);
  return asObject(getLiteral(source,at+key.length));
 })():null;
 native[chapter]=matches.map((m,i)=>{
  const block=part.slice(m.index,matches[i+1]?.index??part.length);
  const id=m[1];
  const ci=block.indexOf('controls:[');
  assert.ok(ci>=0,'Missing controls '+chapter+'/'+id);
  const controls=asObject(getLiteral(block,ci+'controls:'.length));
  const di=block.indexOf('defaults:{');
  const defaults=chapter===1?Object.fromEntries(controls.map(c=>[c[0],c[c.length-1]])):
   globals?globals[id]:asObject(getLiteral(block,di+'defaults:'.length));
  assert.ok(defaults&&typeof defaults==='object','Missing defaults '+chapter+'/'+id);
  return {id,controls,defaults};
 });
 assert.equal(native[chapter].length,limits[chapter],'Native lesson count for Chapter '+chapter);
}
const foundation={};new Function('window',read('assets/ss-foundations-live-equations.js'))(foundation);
const advanced={};new Function('window',read('assets/ss-advanced-live-equations.js'))(advanced);
const F=foundation.SSFoundationEquations,A=advanced.SSAdvancedLiveEquations;
const metrics=[{value:'2.5'},{value:'1.25'},{value:'0.5'}];
let lessonCount=0,stateCount=0;
function formula(ch,i,state){
 const lesson=ch<=4?i:ch<=6?native[ch][i].id:i+1;
 return ch<=4?F.get(ch,i,state,metrics):A.get(ch,lesson,state,metrics);
}
function verify(ch,i,state){
 const item=formula(ch,i,state),name='Ch'+ch+'.'+(i+1);
 assert.ok(item&&item.general&&item.now,'Missing formula '+name);
 for(const entry of [item.general,item.now]){
  assert.doesNotMatch(entry,/NaN|Infinity|undefined|null/,'Invalid value '+name);
  assert.doesNotMatch(entry,/[가-힣]/,'Non-TeX text in formula '+name);
 }
 if(ch>=5){assert.ok(item.en&&item.ko);assert.match(item.ko,/[가-힣]/);
  assert.doesNotMatch(item.en,/[가-힣]/)}
 stateCount++;
}
for(let ch=1;ch<=8;ch++){
 for(let i=0;i<native[ch].length;i++){
  const {controls,defaults}=native[ch][i];
  verify(ch,i,defaults);lessonCount++;
  for(const c of controls){
   const key=ch===1?c[0]:c.key;
   let samples=[];
   if(ch===1){samples=typeof c[2]==='number'?[c[2],c[3]]:
    Array.isArray(c[2])?[c[2][0]?.[0],c[2].at(-1)?.[0]]:[]}
   else if(typeof c.min==='number'&&typeof c.max==='number')samples=[c.min,c.max];
   else {const options=c.options||c.values||[];
    if(options.length)samples=[options[0][0],options.at(-1)[0]]}
   for(const value of samples.filter(x=>x!==undefined))verify(ch,i,{...defaults,[key]:value});
  }
 }
}
assert.equal(lessonCount,62);
const now=(ch,index,overrides={})=>formula(ch,index-1,{...native[ch][index-1].defaults,...overrides}).now;
const includes=(ch,index,params,value)=>assert.ok(now(ch,index,params).includes(value),
 'Independent identity Ch'+ch+'.'+index+' expected '+value+' in '+now(ch,index,params));
includes(1,1,{Ts:0.5},'f_s=2');
includes(1,2,{kind:'impulse',domain:'CT',A:2,width:0.5},'\\frac{A}{\\varepsilon}=4');
includes(1,3,{a:'2',b:-2},'[1,2.5]');
includes(1,4,{freq:'2/5'},'N_0=5');
includes(2,3,{nx:-2,nh:1,Lx:4,Lh:3},'L_y=6');
includes(2,5,{a:.8,b:.8},'t e^{-at}');
includes(2,7,{M:8},'\\frac1M=0.125');
includes(3,1,{A:.8},'|a_2|=0.4');
includes(3,2,{tau:2,T:6},'0.3333');
includes(3,4,{T:6,t0:1.5},'-1.5708');
includes(4,1,{T:4},'1.5708');
includes(4,3,{a:.5},'\\alpha=0.5');
includes(4,4,{t0:1.5},'-1.5');
includes(5,1,{sigma:0.5},'F(\\infty)=\\frac1{\\sigma}=2');
includes(5,1,{sigma:0},'\\infty');
includes(5,6,{p:0.8,z:0.8},'p_{\\mathrm{active}}=-4');
includes(5,6,{p:0.8,z:-2},'p_{\\mathrm{active}}=0.8');
includes(5,7,{tau:2},'\\omega_c=0.5');
includes(5,8,{zeta:0.5},'16.3');
includes(6,1,{f:20,fs:100},'\\Omega=1.2566');
includes(6,4,{m:4,w:1},'|H|=0');
includes(6,6,{n:'512',pad:'4'},'0.0625');
includes(7,3,{f:90,fs:100},'f_\\mathrm{alias}=10');
includes(7,6,{bits:4},'\\Delta=0.13333');
includes(8,3,{a:.4,b:1.8},'0.4<|z|<1.8');
includes(8,4,{a:.5,b:2,roc:'outer'},'|z|>2');
includes(8,4,{a:.5,b:2,roc:'inner'},'|z|<0.5');
includes(8,5,{a:.7},'0.1765');
includes(8,6,{N:4,omega:1},'|H|=0');
includes(8,7,{a:.8,M:3,side:'causal'},'S(M)=2.44');
includes(8,7,{a:1.2,M:3,side:'anti'},'S(M)=2.106');
includes(8,8,{a:.7},'1-a=0.3');
console.log('PASS '+lessonCount+' lessons, '+stateCount+' native control states, 32 math identities');
