#!/usr/bin/env node
/* Browser E2E for 2026-11-16 SS learning enhancements.
 * Runs Chromium against local HTTP server, not static text or inferred behavior.
 * Each failing assertion records name, message and screenshot.
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const BASE=process.env.SS_BASE_URL||"http://127.0.0.1:8766/";
const OUT=process.env.SS_QA_DIR||"qa-learning-output";
mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let server;
if(!process.env.SS_BASE_URL){server=spawn("python3",["-m","http.server","8766","--bind","127.0.0.1"],{stdio:"ignore"});await sleep(1400)}
const browser=await chromium.launch({headless:true});
const results=[],jsErrors=[];
async function testcase(name,fn,page){
 try{await fn();results.push({name,status:"pass"});console.log("PASS",name)}
 catch(e){
  results.push({name,status:"fail",message:String(e).slice(0,700)});console.error("FAIL",name,String(e).slice(0,700));
  if(page)try{await page.screenshot({path:join(OUT,name.replace(/[^a-zA-Z0-9-]/g,"-")+".png"),fullPage:true})}catch(_){}
 }
}
function assert(ok,message){if(!ok)throw Error(message)}
async function go(page,ch){
 await page.goto(BASE+"#chapter="+ch,{waitUntil:"domcontentloaded",timeout:45000});
 if(ch===6){
   await page.locator(".ss6-sequence-overview").waitFor({state:"visible",timeout:20000});
   return;
 }
 await page.locator("#lab-loading").waitFor({state:"hidden",timeout:45000});
 await page.locator("#ss-progress-panel").waitFor({state:"visible",timeout:20000});
}
try{
 for(const [device,viewport] of [["desktop",{width:1280,height:800}],["mobile",{width:390,height:844}]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:1,isMobile:device==="mobile",hasTouch:device==="mobile",reducedMotion:"reduce"});
  const page=await context.newPage();
  page.on("pageerror",e=>jsErrors.push({device,kind:"pageerror",message:String(e).slice(0,500)}));
  page.on("console",m=>{if(m.type()==="error"&&!/favicon/i.test(m.text()))jsErrors.push({device,kind:"console",message:m.text().slice(0,500)})});
  await testcase(device+"-progress-save-reload",async()=>{
   await go(page,1);
   const btn=page.locator("#ss-progress-panel button");
   assert(await btn.isEnabled(),"Review button disabled");
   await btn.click();
   assert((await page.evaluate(()=>JSON.parse(localStorage.getItem("els-ss-lab-progress-v1")||"[]"))).includes("1:1"),"1:1 not persisted");
   await page.reload({waitUntil:"domcontentloaded"});
   await page.locator("#lab-loading").waitFor({state:"hidden",timeout:45000});
   assert((await page.locator("#ss-progress-panel").innerText()).includes("1/62"),"1/62 not restored");
   await page.locator("#ss-progress-panel button").click();
   assert((await page.evaluate(()=>JSON.parse(localStorage.getItem("els-ss-lab-progress-v1")||"[]"))).length===0,"unmark didn't persist");
  },page);
  await testcase(device+"-chapter-sidebar-hit-testing",async()=>{
   await go(page,3);
   const button=page.locator("#ss-unified-nav .ss-unified-link").first();
   if(device==="mobile"&&await page.locator("#ss-unified-nav").evaluate(x=>x.classList.contains("collapsed")))
     await page.locator("#ss-unified-nav .ss-unified-toggle").click();
   await button.scrollIntoViewIfNeeded();
   const geo=await button.evaluate(node=>{
     const r=node.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
     const hit=document.elementFromPoint(x,y);
     const overlay=document.getElementById("ss-predict-check")?.getBoundingClientRect();
     const wrapper=document.querySelector("#lab-view .lab-frame-wrap")?.getBoundingClientRect();
     return {button:{x:r.x,y:r.y,width:r.width,height:r.height},point:{x,y},hit:hit?.tagName+"#"+(hit?.id||"")+"."+(hit?.className||""),predict:overlay?{x:overlay.x,y:overlay.y,width:overlay.width,height:overlay.height}:null,wrapper:wrapper?{x:wrapper.x,y:wrapper.y,width:wrapper.width,height:wrapper.height}:null};
   });
   console.log("NAV_GEOMETRY "+device+" "+JSON.stringify(geo));
   assert(await button.isVisible(),"Sidebar button hidden");
   await button.click({timeout:5000});
   if(device==="mobile"){
     const frameWidth=await page.locator("#lab-frame").evaluate(x=>x.getBoundingClientRect().width);
     assert(frameWidth>=300,"Mobile iframe too narrow: "+frameWidth);
     const toggle=page.locator("#ss-unified-nav .ss-unified-toggle");
     const isCollapsed=await page.locator("#ss-unified-nav").evaluate(x=>x.classList.contains("collapsed"));
     if(isCollapsed)await toggle.click();
     const second=page.locator("#ss-unified-nav .ss-unified-link").nth(1);
     await second.click({timeout:5000});
     assert(await page.locator("#ss-unified-nav").evaluate(x=>x.classList.contains("collapsed")),"Mobile overlay did not auto-close after selection");
     assert((await page.locator("#lab-frame").evaluate(x=>x.getBoundingClientRect().width))>=300,"Iframe shrank after overlay selection");
   }
  },page);
  await testcase(device+"-chapter-3-harmonic-audio",async()=>{
   await go(page,3);
   const panel=page.locator("#ss-applications");
   assert(await panel.isVisible(),"harmonic panel not visible");
   const range=panel.locator('input[type="range"]');
   await range.fill("9");
   assert((await panel.locator("output").innerText()).includes("9"),"harmonic count not updated");
   const before=await panel.locator("canvas").evaluate(c=>c.toDataURL());
   await range.fill("2");
   const after=await panel.locator("canvas").evaluate(c=>c.toDataURL());
   assert(before!==after,"harmonic plot did not respond");
   await panel.locator("button").first().click();
   assert(await page.evaluate(()=>Boolean(window.__ssAudioContext)),"AudioContext not created after user click");
   await panel.locator("button").nth(1).click();
   await page.screenshot({path:join(OUT,device+"-chapter3.png"),fullPage:true});
  },page);
  await testcase(device+"-chapter-6-filter",async()=>{
   await go(page,6);
   await page.locator('[data-nav="filter"]').click();
   await page.locator("#ss-applications").waitFor({state:"visible",timeout:15000});
   const panel=page.locator("#ss-applications");
   assert(await panel.isVisible(),"filter panel not visible");
   const first=await panel.locator("canvas").evaluate(c=>c.toDataURL());
   await panel.locator("select").selectOption("highpass");
   await panel.locator('input[type="range"]').fill("1400");
   const second=await panel.locator("canvas").evaluate(c=>c.toDataURL());
   assert(first!==second,"low/high filtering did not change plot");
   await panel.locator("button").first().click();
   assert(await page.evaluate(()=>Boolean(window.__ssAudioContext)),"AudioContext missing for filter");
   await panel.locator("button").nth(1).click();
   await page.screenshot({path:join(OUT,device+"-chapter6.png"),fullPage:true});
  },page);
  await testcase(device+"-ecg-synthetic-label",async()=>{
   await go(page,1);
   const panel=page.locator("#ss-applications");
   assert(await panel.isVisible(),"Ch1 application hidden");
   assert(/synthetic|합성/i.test(await panel.innerText()),"ECG not labeled synthetic");
   const pixels=await panel.locator("canvas").evaluate(c=>new Set([...c.getContext("2d").getImageData(0,0,120,100).data].filter((_,i)=>i%4===0)).size);
   assert(pixels>1,"Canvas waveform appears blank");
  },page);
  await testcase(device+"-prediction-two-hints",async()=>{
   await go(page,8);
   const section=page.locator("#ss-predict-check");assert(await section.isVisible(),"predict missing");
   const input=section.locator('input[type="number"]'),button=section.locator("button");
   await input.fill("9");await button.click();const first=await section.locator("#ss-pc-feedback").innerText();assert(/hint|try again|다시|다시 확인/i.test(first),"first hint absent");
   await input.fill("8");await button.click();const second=await section.locator("#ss-pc-feedback").innerText();assert(second!==first,"progressive hint not different");
   await input.fill("0.5");await button.click();const correct=await section.locator("#ss-pc-feedback").innerText();assert(/correct|정답/i.test(correct),"correct result missing");
  },page);
  await testcase(device+"-iframe-touch-stepper",async()=>{
   await go(page,3);
   const state=await page.locator("#lab-frame").evaluate(frame=>{
    const d=frame.contentDocument,sliders=[...d.querySelectorAll('input[type="range"]')];
    return {sliders:sliders.length,steppers:d.querySelectorAll(".ss-touch-stepper").length,first:sliders[0]?.value||null};
   });
   assert(state.sliders>0,"No existing iframe range sliders found");
   assert(state.steppers===state.sliders,"Not all iframe sliders have steppers: "+JSON.stringify(state));
   const changed=await page.locator("#lab-frame").evaluate(frame=>{
     const d=frame.contentDocument,input=d.querySelector('input[type="range"]'),old=input.value;
     const button=input.nextElementSibling?.querySelector('button:last-child');if(!button)return {old,now:null};
     button.click();return {old,now:input.value};
   });
   assert(changed.old!==changed.now,"Fine step did not change slider: "+JSON.stringify(changed));
  },page);
  await page.close();await context.close();
 }
}finally{
 await browser.close();if(server)server.kill();
}
const fail=results.filter(r=>r.status==="fail");
writeFileSync(join(OUT,"results.json"),JSON.stringify({timestamp:new Date().toISOString(),summary:{passed:results.length-fail.length,failed:fail.length,jsErrors:jsErrors.length},results,jsErrors},null,2));
console.log(JSON.stringify({passed:results.length-fail.length,failed:fail.length,jsErrors:jsErrors.length},null,2));
if(fail.length||jsErrors.length)process.exitCode=1;
