/* Playwright regression for 29 Chapter 5-8 formulas, three languages, desktop/mobile. */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
(async function advancedBrowserQA(){
 const repo='signals-systems-visual-lab';
 const external=!!process.env.SS_BASE_URL;
 const base=process.env.SS_BASE_URL||'http://127.0.0.1:8818/';
 const server=external?null:spawn('python3',['-m','http.server','8818','--bind','127.0.0.1'],{stdio:'ignore'});
 if(server)await new Promise(resolve=>setTimeout(resolve,1100));
 const browser=await chromium.launch({headless:true});
 const folder='qa-advanced-live';
 mkdirSync(folder,{recursive:true});
 const counts={5:8,6:6,7:7,8:8},names={5:['weight','roc','pairs','props','inverse','stability','rc','second'],6:['periodic','pairs','phase','phasor','filter','fft']};
 const results=[];
 const getMode=mode=>mode;
 try{
  for(const width of [1440,390])for(const mode of ['mixed','en','ko'])for(const chapter of [5,6,7,8]){
   const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});
   const errors=[];
   page.on('pageerror',e=>errors.push(String(e.message)));
   await page.addInitScript(language=>{localStorage.setItem('els-language',language);localStorage.setItem('els-theme-v2','white-clean')},mode);
   try{
    await page.goto(base+'chapter'+chapter+'.html',{waitUntil:'load',timeout:50000});
    await page.waitForSelector('.ss-adv-live-panel',{timeout:18000});
    for(let i=0;i<counts[chapter];i++){
     const id=chapter<=6?names[chapter][i]:i+1;
     try{
      if(chapter===5)await page.locator('#tabs [data-lab]').nth(i).evaluate(btn=>btn.click());
      else if(chapter===6)await page.locator('[data-nav]').nth(i).evaluate(btn=>btn.click());
      else if(chapter===7)await page.evaluate(j=>window.SSChapter7.openExperiment(j),i+1);
      else await page.evaluate(j=>window.SSChapter8.openExperiment(j),i+1);
      await page.waitForFunction(expected=>document.querySelector('.ss-adv-live-panel')?.dataset.ssAdvancedLesson===String(expected),id,{timeout:13000});
      await page.waitForTimeout(180);
      const snapshot=async()=>page.evaluate(({mode,chapter})=>{
       const card=document.querySelector('.ss-adv-live-panel'),native=card?.querySelectorAll('.ss-adv-live-equation')||[];
       const details=[...native].map(x=>({tex:x.dataset.ssMath||'',state:x.dataset.ssMathState||'',rendered:!!x.querySelector('.katex')}));
       const title=card?.querySelector('.ss-adv-live-title')?.textContent||'';
       const intro=card?.querySelector('.ss-adv-live-caption')?.textContent||'';
       const note=card?.querySelector('.ss-adv-live-note')?.textContent||'';
       const controls=[...card.querySelectorAll('.ss-adv-live-column:first-child dd')].map(x=>x.textContent.trim());
       const observation=[...card.querySelectorAll('.ss-adv-live-column:nth-child(2) dd')].map(x=>x.textContent.trim());
       const values=[...document.querySelectorAll(chapter===5?'#page .metrics .v':chapter===6?'#content .metrics .v':'#insight strong')].map(x=>x.textContent.trim()).filter(x=>x&&x!=='-'&&x!=='—');
       const r=card.getBoundingClientRect();
       const plots=[...document.querySelectorAll('#plots canvas,#plots svg,.plots canvas,.charts canvas')].filter(x=>{
        const r=x.getBoundingClientRect();return r.width>1&&r.height>1
       });
       const overlap=plots.some(g=>{
        const x=g.getBoundingClientRect();
        return Math.min(r.right,x.right)-Math.max(r.left,x.left)>2&&Math.min(r.bottom,x.bottom)-Math.max(r.top,x.top)>2;
       });
       return {card:!!card,mode,chapter,lesson:card.dataset.ssAdvancedLesson,details,title,intro,note,controls,observation,values,
        overflow:card.scrollWidth>card.clientWidth+8||r.right>innerWidth+8||r.left< -8,overlap,ready:!!window.katex?.render};
      },{chapter,mode});
      let before=await snapshot();
      assert.equal(before.card,true,'card missing');
      assert.equal(before.details.length,2,'expected symbolic and substituted equations');
      assert.ok(before.details.every(x=>x.tex.length>5&&!/NaN|undefined|Infinity/.test(x.tex)),'equation source invalid');
      assert.ok(before.details.every(x=>x.state==='rendered'&&x.rendered),'KaTeX equations not rendered');
      assert.ok(before.controls.length>=1,'current settings absent');
      assert.ok(before.observation.length>=1,'native observation absent');
      assert.ok(!before.overflow&&!before.overlap,'card overflows or overlaps graph');
      const wording=before.title+' '+before.intro+' '+before.note;
      if(mode==='en')assert.doesNotMatch(wording,/[가-힣]/,'English contains Korean');
      if(mode==='ko')assert.match(wording,/[가-힣]/,'Korean missing');
      if(mode==='mixed'){assert.match(wording,/[가-힣]/,'Mixed Korean missing');assert.match(wording,/[A-Za-z]{3}/,'Mixed English missing')}
      if(chapter<=6)assert.equal(before.observation[0],before.values[0],'native computed metric mismatch');
      const ctrl=page.locator(chapter===5?'#page [data-key]':chapter===6?'#content [data-ctrl]':'#controls [data-param]').first();
      if(await ctrl.count()){
       await ctrl.evaluate(el=>{
        if(el.tagName==='SELECT'){if(el.options.length>1)el.selectedIndex=(el.selectedIndex+1)%el.options.length}
        else{const x=Number(el.value),min=Number(el.min),max=Number(el.max),step=Number(el.step)||1;el.value=String(x+step<=max+1e-8?Math.min(max,x+step):Math.max(min,x-step))}
        el.dispatchEvent(new Event('input',{bubbles:true}));
       });
       await page.waitForFunction(previous=>{
        const card=document.querySelector('.ss-adv-live-panel');
        return !!card&&[...card.querySelectorAll('.ss-adv-live-column:first-child dd')].map(x=>x.textContent).join('|')!==previous;
       },before.controls.join('|'),{timeout:10000});
       const after=await snapshot();
       assert.ok(after.details.every(x=>x.state==='rendered'&&x.rendered),'KaTeX failed after slider change');
       assert.ok(!after.overlap&&!after.overflow,'card overlap/overflow after update');
       if(chapter<=6)assert.equal(after.observation[0],after.values[0],'native metric not synchronized');
      }
      results.push({chapter,id,mode,width,pass:true});
     }catch(err){
      results.push({chapter,id,mode,width,pass:false,error:String(err)});
      if(results.filter(x=>!x.pass).length<=12)await page.screenshot({path:folder+'/ch'+chapter+'-'+i+'-'+mode+'-'+width+'.png',fullPage:true});
     }
    }
    if(errors.length)results.push({chapter,mode,width,pass:false,error:'JS error '+errors.slice(0,4).join(' | ')});
   }catch(err){results.push({chapter,mode,width,pass:false,error:'page '+String(err)})}
   await page.close();
  }
 }finally{await browser.close();if(server)server.kill()}
 writeFileSync(folder+'/results.json',JSON.stringify({base,results},null,2));
 const fail=results.filter(x=>!x.pass);
 console.log('Ch5-8 math-to-live QA: '+(results.length-fail.length)+'/'+results.length+' passed, '+fail.length+' failures');
 for(const x of fail.slice(0,35))console.log(JSON.stringify(x));
 assert.equal(fail.length,0,'Advanced live evidence browser QA failed');
})();
