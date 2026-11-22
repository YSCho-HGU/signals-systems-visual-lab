/* Chapter 1–8 exhaustive visible English-language audit.
 * npm run qa:english
 * Set SS_BASE_URL to audit a deployed build.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
const base=process.env.SS_BASE_URL||'http://127.0.0.1:8788/';
const server=process.env.SS_BASE_URL?null:spawn('python3',['-m','http.server','8788','--bind','127.0.0.1'],{stdio:'ignore'});
if(server)await new Promise(resolve=>setTimeout(resolve,1300));
const browser=await chromium.launch({headless:true});
const findings=[];
try{
 for(let ch=1;ch<=8;ch++){
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   try{localStorage.setItem('els-language','en')}catch{}
  });
  await page.goto(base+'chapter'+ch+'.html',{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.ss-layout-sidebar nav button').first().waitFor({state:'visible',timeout:20000});
  await page.waitForFunction(()=>!!window.SSContentModel?.model,null,{timeout:15000});
  if(ch===1){
   const first=await page.locator('#desc').textContent();
   const prompt=await page.locator('.ss-found-intro').textContent();
   assert.ok(first.includes('A continuous-time (CT) signal'), 'Chapter 1 description must render in English');
   assert.ok(prompt.includes('How do sample spacing'), 'Chapter 1 Predict prompt must render in English');
   assert.doesNotMatch(first+prompt,/[가-힣]/, 'Chapter 1 first lab must be English-only');
  }
  const buttons=page.locator('.ss-layout-sidebar nav button:visible');
  const count=await buttons.count();
  for(let section=0;section<count;section++){
   await buttons.nth(section).click();
   await page.waitForTimeout(120);
   // Trigger a dynamic update where a range control is available.
   const range=page.locator('main input[type="range"]:visible').first();
   if(await range.count()){
    await range.evaluate(el=>{
     let v=Number(el.value),max=Number(el.max),min=Number(el.min);
     el.value=String(v<max?Math.min(max,v+Number(el.step||1)):Math.max(min,v-Number(el.step||1)));
     el.dispatchEvent(new Event('input',{bubbles:true}));
     el.dispatchEvent(new Event('change',{bubbles:true}));
    });
    await page.waitForTimeout(80);
   }
   const result=await page.evaluate(()=>{
    const root=document.querySelector('.ss-layout-root')||document.querySelector('main')||document.body;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const remaining=[];
    while(walker.nextNode()){
     const node=walker.currentNode,el=node.parentElement;
     if(!el||el.closest('script,style,option,textarea,svg,canvas,.katex,.katex-display,[hidden],[aria-hidden="true"]'))continue;
     const rect=el.getBoundingClientRect();
     if(!rect.width||!rect.height)continue;
     const value=node.nodeValue.trim();
     if(/[가-힣]/.test(value))remaining.push({tag:el.tagName,text:value.slice(0,180)});
    }
    return {untranslatedCount:remaining.length,samples:remaining.slice(0,40)};
   });
   if(result.untranslatedCount) findings.push({chapter:ch,section:section+1,...result});
  }
  if(errors.length)findings.push({chapter:ch,pageErrors:errors});
  console.log('AUDIT Chapter '+ch+': '+count+' sections; '+errors.length+' page errors');
  await page.close();
 }
}finally{
 await browser.close();
 if(server)server.kill();
}
if(findings.length){
 console.log(JSON.stringify(findings,null,2));
}
assert.equal(findings.length,0,'English-mode audit found untranslated visible text or runtime errors');
console.log('PASS: Chapter 1–8 all sections have English-only visible text and no JS page errors');
