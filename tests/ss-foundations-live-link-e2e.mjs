/* Chromium QA: every Chapter 1-4 lesson links its current ② settings,
 * native ③ computed metrics and ④ interpretation. No simulation code is mocked.
 * Usage: npm run qa:foundations-live
 * To audit deployed Pages instead: SS_BASE_URL=https://yscho-hgu.github.io/signals-systems-visual-lab/ npm run qa:foundations-live
 */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const external=!!process.env.SS_BASE_URL;
const base=process.env.SS_BASE_URL||'http://127.0.0.1:8803/';
const server=external?null:spawn('python3',['-m','http.server','8803','--bind','127.0.0.1'],{stdio:'ignore'});
if(server)await new Promise(r=>setTimeout(r,1100));
const browser=await chromium.launch({headless:true});
const out='qa-foundations-live';
mkdirSync(out,{recursive:true});
const results=[];
const nav={1:'#nav button[data-exp]',2:'#app .sidebar nav [data-nav]',3:'#app .sidebar nav [data-nav]',4:'#app .sidebar nav [data-nav]'};
const countByChapter={1:9,2:9,3:7,4:8};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function snapshot(page){
 return page.evaluate(()=>{
  const group=document.querySelector('.ss-found-four-step');
  const panel=group?.querySelector('.ss-found-explain .ss-found-live-link');
  if(!group||!panel)return {missing:true};
  const controls=[...group.querySelectorAll('.ss-found-controls input[data-key],.ss-found-controls select[data-key]')];
  const summary=[...panel.querySelectorAll('.ss-found-live-column:first-child .ss-found-live-item dd')].map(x=>x.textContent.trim());
  const source=[...group.querySelectorAll('.ss-found-observe .metric')].map(el=>el.querySelector('.v,strong')?.textContent?.trim()||'').filter(x=>x&&x!=='-').slice(0,3);
  const linked=[...panel.querySelectorAll('.ss-found-live-column:nth-child(2) .ss-found-live-item dd')].map(x=>x.textContent.trim());
  const title=panel.querySelector('.ss-found-live-title')?.textContent?.trim()||'';
  const caption=panel.querySelector('.ss-found-live-caption')?.textContent?.trim()||'';
  const conclusion=panel.querySelector('.ss-found-live-conclusion')?.textContent?.trim()||'';
  const mathNodes=[...panel.querySelectorAll('.ss-found-live-equation')];
  const params=Object.fromEntries(controls.map(el=>[el.dataset.key,el.value]));
  const metricRows=[...group.querySelectorAll('.ss-found-observe .metric')].map(el=>({
   key:el.querySelector('.k,b')?.textContent?.trim()||'',
   value:el.querySelector('.v,strong')?.textContent?.trim()||'',
   detail:el.querySelector('.detail')?.textContent?.trim()||''
  })).filter(row=>row.value&&row.value!=='-').slice(0,3);
  const expected=window.SSFoundationEquations?.get(
   Number(document.documentElement.dataset.ssFoundationChapter),Number(panel.dataset.lesson)-1,params,metricRows
  );
  const math={
   sources:mathNodes.map(el=>el.dataset.ssMath||''),
   expected:expected?[expected.general,expected.now]:null,
   katexReady:!!window.katex?.render,
   rendered:mathNodes.filter(el=>el.querySelector('.katex')&&el.dataset.ssMathState==='rendered').length,
   failed:mathNodes.filter(el=>el.dataset.ssMathState==='error').length
  };
  const box=panel.getBoundingClientRect();
  return {
   lesson:Number(panel.dataset.lesson),controlCount:controls.length,settingCount:summary.length,
   source,linked,settings:summary,title,caption,conclusion,math,
   horizontalOverflow:panel.scrollWidth>panel.clientWidth+8||box.right>innerWidth+8||box.left< -8
  };
 });
}
function verify(item,{chapter,index,mode,width}){
 assert.ok(!item.missing,'Missing ④ live card');
 assert.equal(item.lesson,index+1,'Wrong lesson summary');
 assert.equal(item.settingCount,item.controlCount,'Current controls are not mirrored');
 assert.ok(item.controlCount>=1,'No native controls');
 assert.ok(item.source.length>=1,'No computed observations in ③');
 assert.deepEqual(item.linked,item.source,'④ observations differ from native ③ metrics');
 assert.ok(!item.horizontalOverflow,'④ card overflows viewport');
 assert.ok(item.math.expected,'Missing lesson-specific mathematical model');
 assert.deepEqual(item.math.sources,item.math.expected,'④ formula does not match current ② settings / ③ metrics');
 assert.equal(item.math.sources.length,2,'④ must show symbolic and numerical equations');
 assert.equal(item.math.failed,0,'KaTeX equation rendering failed');
 assert.ok(item.math.katexReady,'KaTeX unavailable; formulas cannot be rendered');
 assert.equal(item.math.rendered,2,'Both formulas must render as KaTeX');
 const authored=item.title+item.caption+item.conclusion;
 if(mode==='en')assert.doesNotMatch(authored,/[가-힣]/,'English explanation contains Korean');
 if(mode==='ko')assert.match(authored,/[가-힣]/,'Korean explanation missing');
 if(mode==='mixed'){assert.match(authored,/[가-힣]/,'Mixed missing Korean');assert.match(authored,/[A-Za-z]/,'Mixed missing English')}
}
try{
 for(const width of [1440,390])for(const mode of ['mixed','en','ko'])for(let chapter=1;chapter<=4;chapter++){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.addInitScript(language=>{localStorage.setItem('els-language',language);localStorage.setItem('els-theme-v2','white-clean');localStorage.setItem('ss-sidebar-collapsed-v1','1')},mode);
  try{
   await page.goto(base+'chapter'+chapter+'.html',{waitUntil:'domcontentloaded',timeout:45000});
   const buttons=page.locator(nav[chapter]);
   await page.waitForFunction(()=>!!document.querySelector('.ss-found-explain .ss-found-live-link'),null,{timeout:25000});
   const n=await buttons.count();
   assert.equal(n,countByChapter[chapter],'Wrong lesson count');
   for(let i=0;i<n;i++){
    try{
     await buttons.nth(i).evaluate(el=>el.click());
     await page.waitForFunction(expected=>Number(document.querySelector('.ss-found-live-link')?.dataset.lesson)===expected,i+1,{timeout:12000});
     await sleep(110);
     let first=await snapshot(page);
     verify(first,{chapter,index:i,mode,width});
     // Every section: modify an existing numerical control (or a selector) and
     // confirm that ④ now shows that exact current state and native metrics.
     const control=page.locator('.ss-found-controls input[type="range"][data-key],.ss-found-controls select[data-key]').first();
     if(await control.count()){
      await control.evaluate(el=>{
       if(el.tagName==='SELECT'){
        if(el.options.length>1)el.selectedIndex=(el.selectedIndex+1)%el.options.length;
       }else{
        const n=Number(el.value),low=Number(el.min),high=Number(el.max),step=Number(el.step)||1;
        el.value=String(n+step<=high+1e-8?Math.min(high,n+step):Math.max(low,n-step));
       }
       el.dispatchEvent(new Event('input',{bubbles:true}));
       el.dispatchEvent(new Event('change',{bubbles:true}));
      });
      await page.waitForFunction(()=>{
       const root=document.querySelector('.ss-found-four-step'),panel=root?.querySelector('.ss-found-live-link');
       if(!root||!panel)return false;
       const src=[...root.querySelectorAll('.ss-found-observe .metric')].map(x=>x.querySelector('.v,strong')?.textContent?.trim()||'').filter(x=>x&&x!=='-').slice(0,3);
       const linked=[...panel.querySelectorAll('.ss-found-live-column:nth-child(2) dd')].map(x=>x.textContent.trim());
       const ctl=root.querySelector('.ss-found-controls input[type="range"][data-key],.ss-found-controls select[data-key]');
       const displayed=panel.querySelector('.ss-found-live-column:first-child dd')?.textContent||'';
       const state=ctl?.tagName==='SELECT'?window.SSContentModel?.text(ctl.selectedOptions?.[0]?.textContent?.trim()||ctl.value):ctl?.value;
       return src.length>0&&JSON.stringify(src)===JSON.stringify(linked)&&!!state&&displayed.includes(String(state));
      },null,{timeout:12000});
      const updated=await snapshot(page);
      verify(updated,{chapter,index:i,mode,width});
     }
     results.push({chapter,lesson:i+1,width,mode,pass:true,metricCount:first.source.length,settingCount:first.settingCount});
    }catch(e){
     results.push({chapter,lesson:i+1,width,mode,pass:false,error:String(e)});
     if(results.filter(x=>!x.pass).length<=12)await page.screenshot({path:out+'/failure-ch'+chapter+'-lab'+(i+1)+'-'+mode+'-'+width+'.png',fullPage:true});
    }
   }
  }catch(e){results.push({chapter,width,mode,pass:false,error:'page load: '+String(e)})}
  if(errors.length)results.push({chapter,width,mode,pass:false,error:'JS runtime errors: '+errors.join(' | ').slice(0,1200)});
  await page.close();
 }
}finally{
 await browser.close();
 if(server)server.kill();
}
writeFileSync(out+'/results.json',JSON.stringify({base,results},null,2));
const fail=results.filter(x=>!x.pass);
console.log('Foundation live-link QA: '+(results.length-fail.length)+'/'+results.length+' passes; '+fail.length+' failures');
for(const item of fail.slice(0,30))console.log(JSON.stringify(item));
assert.equal(fail.length,0,'Live current-settings/graph-metrics/Explain contract failed');
