import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const own=!process.env.SS_BASE_URL,base=process.env.SS_BASE_URL||'http://127.0.0.1:8791/';
const server=own?spawn('python3',['-m','http.server','8791','--bind','127.0.0.1'],{stdio:'ignore'}):null;
if(own)await new Promise(r=>setTimeout(r,1100));
const browser=await chromium.launch({headless:true}),folder='qa-graph-geometry';
mkdirSync(folder,{recursive:true});
const output=[];
const nav={1:'#ch1-app #nav button',2:'#app .sidebar .nav button',3:'#app .sidebar .nav button',4:'#app .sidebar .nav button',5:'#tabs button',6:'#app .sidebar .nav button',7:'#ss7-lesson-nav button',8:'#nav button'};
try{
 for(const theme of ['neutral-dark','white-clean'])for(let ch=1;ch<=8;ch++)for(const width of (ch===1?[1440,768,390]:[1440,390])){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  await page.addInitScript(({t,c})=>{localStorage.setItem('els-theme-v2',t);localStorage.setItem('ss-sidebar-collapsed-v1',c?'1':'0')},{t:theme,c:width<=780});
  try{
   await page.goto(base+'chapter'+ch+'.html',{waitUntil:'load',timeout:40000});
   await page.waitForTimeout(180);
   const b=page.locator(nav[ch]),n=await b.count();
   const labs=ch===1?[...Array(n).keys()]:[...new Set([0,n-1])].filter(x=>x>=0);
   for(const ix of labs){
    await b.nth(ix).click({timeout:10000});
    await page.waitForTimeout(120);
    const item=await page.evaluate(()=>{
     const box=el=>{const r=el.getBoundingClientRect();return {l:r.left,r:r.right,t:r.top,b:r.bottom,w:r.width,h:r.height}};
     const overlap=(a,b)=>Math.max(0,Math.min(a.r,b.r)-Math.max(a.l,b.l))*Math.max(0,Math.min(a.b,b.b)-Math.max(a.t,b.t));
     const problems=[];
     const hosts=[...document.querySelectorAll('.plotbox,.figure,.plot-card')].filter(h=>h.querySelector('canvas,svg')&&h.getBoundingClientRect().width>90);
     for(let i=0;i<hosts.length;i++){
      const h=hosts[i],g=h.querySelector('svg,canvas'),gb=box(g),hb=box(h);
      const title=h.querySelector(':scope>h3,:scope>.plot-title'),legend=h.querySelector(':scope>.legend');
      const labels=[...h.querySelectorAll('.ss-graph-axis-math')].filter(x=>x.querySelector('.katex'));
      if(h.scrollWidth-h.clientWidth>4)problems.push({i,type:'overflow',amount:h.scrollWidth-h.clientWidth});
      if(gb.w>hb.w+4)problems.push({i,type:'chart-width'});
      for(const x of labels){
       const v=box(x);
       if(v.l<gb.l-5||v.r>gb.r+5||v.t<gb.t-5||v.b>gb.b+5)problems.push({i,type:'outside',side:x.dataset.ssAxis,formula:x.dataset.ssFormula,delta:[Math.round(gb.l-v.l),Math.round(v.r-gb.r),Math.round(gb.t-v.t),Math.round(v.b-gb.b)]});
       if(title&&overlap(v,box(title))>5)problems.push({i,type:'title-overlap',side:x.dataset.ssAxis});
       if(legend&&overlap(v,box(legend))>5)problems.push({i,type:'legend-overlap',side:x.dataset.ssAxis});
      }
      if(labels.length===2&&overlap(box(labels[0]),box(labels[1]))>10)problems.push({i,type:'labels-overlap'});
     }
     return{graphs:hosts.length,problems};
    });
    output.push({ch,lab:ix+1,width,theme,...item});
    if(item.problems.length&&output.filter(x=>x.problems?.length).length<=12)await page.screenshot({path:folder+'/fail-'+ch+'-'+(ix+1)+'-'+width+'-'+theme+'.png',fullPage:true});
    console.log((item.problems.length?'FAIL ':'PASS ')+'ch'+ch+'/'+(ix+1)+'/'+width+'/'+theme+' '+JSON.stringify(item).slice(0,1250));
   }
  }catch(err){output.push({ch,width,theme,problems:[{type:'exception',message:String(err)}]});console.log('FAIL ch'+ch+' '+String(err))}
  finally{await page.close()}
 }
}finally{await browser.close();if(server)server.kill()}
writeFileSync(folder+'/results.json',JSON.stringify(output,null,2));
const fails=output.filter(x=>x.problems.length);
console.log('Graph geometry QA: '+(output.length-fails.length)+'/'+output.length+' cases passed, '+fails.length+' failing cases');
assert.equal(fails.length,0,JSON.stringify(fails.slice(0,8)));
