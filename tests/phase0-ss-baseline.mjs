#!/usr/bin/env node
// Phase 0 S&S state-preservation and catalog smoke test.
// Fixture exists only in new Playwright browser contexts.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {spawn} from "node:child_process";
import {chromium} from "playwright";

const reportDir="qa-phase0";mkdirSync(reportDir,{recursive:true});
const baseline=JSON.parse(readFileSync("docs/phase0/ss-storage-baseline.json","utf8"));
const pathData=JSON.parse(readFileSync("assets/ss-learning-path.v1.json","utf8"));
const course=JSON.parse(readFileSync("course-catalog.json","utf8"));
const chapter=JSON.parse(readFileSync("chapter-catalog.json","utf8"));
const checks=[],issues=[],errors=[];
const expect=(ok,name,detail="")=>{
 checks.push({name,pass:!!ok,detail});if(!ok)issues.push(name+" "+detail);
};
const n=Object.values(pathData.chapters).reduce((sum,c)=>sum+c.experiments.length,0);
expect(n===62,"lab-count-62",String(n));
expect(pathData.version==="1.0.0","learning-path-version");
expect(baseline.chapters.map(x=>x.labs).join(",")===Object.values(pathData.chapters).map(x=>x.experiments.length).join(","),"chapter-experiment-counts");
expect(course.schemaVersion===1&&chapter.schemaVersion===1,"catalog-schema-v1");
expect(course.chapters.filter(c=>c.published).length===8&&chapter.chapters.filter(c=>c.published).length===8,"eight-published-chapters");
expect(new Set(Object.entries(pathData.chapters).flatMap(([ch,data])=>data.experiments.map(e=>ch+":"+e.index))).size===62,"stable-unique-lab-ids");
const BASE=process.env.PHASE0_BASE||"http://127.0.0.1:8766/";
let server=null,browser;
if(!process.env.PHASE0_BASE){
 server=spawn("python3",["-m","http.server","8766","--bind","127.0.0.1"],{stdio:"ignore"});
 await new Promise(resolve=>setTimeout(resolve,1200));
}
try{
 browser=await chromium.launch({headless:true});
 for(const viewport of [{width:390,height:844},{width:1280,height:900}]){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  const page=await context.newPage();
  page.on("pageerror",error=>errors.push({viewport:viewport.width,error:error.message,url:page.url()}));
  const fixture={
   "els-language":"mixed",
   "els-theme-v2":"neutral-dark",
   "els-ss-lab-progress-v1":JSON.stringify(["1:1","3:2"]),
   "ss-unified-nav-collapsed":"1",
   "phase0-custom-key":"keep-exactly-this"
  };
  await page.goto(BASE+"#chapter=1",{waitUntil:"load"});
  await page.evaluate(fixture=>{for(const [key,value] of Object.entries(fixture))localStorage.setItem(key,value)},fixture);
  await page.reload({waitUntil:"load"});
  await page.locator("#ss-progress-panel").waitFor({state:"visible"});
  const before=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),Object.keys(fixture));
  const prefix="ss-"+viewport.width;
  expect((await page.locator("#ss-progress-panel").innerText()).includes("2/62"),prefix+"-saved-progress");
  expect((await page.locator("#ss-unified-nav .ss-unified-link").count())===9,prefix+"-chapter1-navigation");
  expect(await page.locator("#ss-unified-nav").evaluate(e=>e.classList.contains("collapsed")),prefix+"-collapsed-pref-restored");
  expect((await page.locator("#lab-frame").evaluate(e=>e.getBoundingClientRect().width))>=300,prefix+"-frame-width");
  for(const mode of ["en","ko","mixed"]){
   await page.evaluate(mode=>window.ELSLanguage.set(mode),mode);
   expect((await page.evaluate(()=>window.ELSLanguage.get()))===mode,prefix+"-language-"+mode);
   expect((await page.locator("#ss-progress-panel").innerText()).includes("2/62"),prefix+"-progress-survives-language-"+mode);
  }
  await page.evaluate(()=>window.ELSLanguage.set("mixed"));
  await page.locator("#ss-unified-nav .ss-unified-toggle").click();
  const first=page.locator("#ss-unified-nav .ss-unified-link").first();
  await first.waitFor({state:"visible"});
  await first.click();
  if(await page.locator("#ss-unified-nav").evaluate(e=>!e.classList.contains("collapsed")))
   await page.locator("#ss-unified-nav .ss-unified-toggle").click();
  await page.waitForTimeout(120);
  expect((await page.locator("#lab-frame").evaluate(e=>e.getBoundingClientRect().width))>=300,prefix+"-frame-width-after-nav");
  // Explicit review and undo must not damage existing progress fixture.
  const control=page.locator("#ss-progress-panel button");
  if((await control.innerText()).includes("취소")||(await control.innerText()).includes("Undo")){
   await control.click();
   expect((await page.locator("#ss-progress-panel").innerText()).includes("1/62"),prefix+"-review-undo");
   await control.click();
   expect((await page.locator("#ss-progress-panel").innerText()).includes("2/62"),prefix+"-review-restored");
  }else{
   expect(false,prefix+"-review-toggle-initial-state","Unexpected UI state");
  }
  const after=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),Object.keys(fixture));
  expect(after["phase0-custom-key"]===before["phase0-custom-key"],prefix+"-unknown-storage-preserved");
  expect(after["els-ss-lab-progress-v1"]===before["els-ss-lab-progress-v1"],prefix+"-progress-bytes-restored");
  expect(after["els-theme-v2"]===before["els-theme-v2"],prefix+"-theme-unchanged");
  for(const ch of [1,3,5,6,8]){
   await page.goto(BASE+"#chapter="+ch,{waitUntil:"load"});
   if(ch===5){
     await page.locator("#ss5-progress").waitFor({state:"visible"});
     expect(page.url().includes("/chapter5.html"),prefix+"-native-ch5-route");
     expect(await page.locator("iframe").count()===0,prefix+"-native-ch5-no-iframe");
     expect(await page.locator("#tabs [data-lab]").count()===baseline.chapters[ch-1].labs,prefix+"-native-ch5-eight-labs");
     expect(await page.locator("#ss5-progress button").count()===1,prefix+"-native-ch5-progress-control");
     expect((await page.evaluate(()=>JSON.parse(localStorage.getItem("els-ss-lab-progress-v1")||"[]"))).length===2,prefix+"-native-ch5-storage-preserved");
     continue;
   }
   if(ch===6){
     await page.locator(".ss6-sequence-overview").waitFor({state:"visible"});
     expect(page.url().includes("/chapter6.html"),prefix+"-native-ch6-route");
     expect(await page.locator("iframe").count()===0,prefix+"-native-ch6-no-iframe");
     expect(await page.locator(".sidebar [data-nav]").count()===baseline.chapters[ch-1].labs,prefix+"-native-ch6-six-labs");
     expect(await page.locator(".ss6-progress").count()===1,prefix+"-native-ch6-progress-control");
     expect((await page.evaluate(()=>JSON.parse(localStorage.getItem("els-ss-lab-progress-v1")||"[]"))).length===2,prefix+"-native-ch6-storage-preserved");
     continue;
   }
   await page.locator("#ss-progress-panel").waitFor({state:"visible"});
   expect((await page.locator("#ss-unified-nav .ss-unified-link").count())===baseline.chapters[ch-1].labs,prefix+"-route-ch"+ch);
   if(ch===3)expect(await page.locator("#ss-applications").isVisible(),prefix+"-sonification-ch"+ch);
   if(ch===1)expect(await page.locator("#ss-applications").isVisible(),prefix+"-synthetic-ecg-ch1");
  }
  await page.screenshot({path:reportDir+"/ss-"+viewport.width+".png",fullPage:true});
  await context.close();
 }
}finally{
 if(browser)await browser.close();
 if(server)server.kill();
}
expect(errors.length===0,"no-unhandled-browser-errors",JSON.stringify(errors.slice(0,5)));
const result={schemaVersion:1,createdAt:new Date().toISOString(),repository:"signals-systems-visual-lab",status:issues.length?"FAIL":"PASS",passed:checks.filter(x=>x.pass).length,total:checks.length,issues,errors,checks,scope:"Isolated Chromium, 62-lab catalog, 2 widths, preferences, progress, layout and entry points"};
writeFileSync(reportDir+"/ss-baseline.json",JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({status:result.status,passed:result.passed,total:result.total,issues:issues.slice(0,20)},null,2));
if(issues.length)process.exitCode=1;
