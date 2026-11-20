#!/usr/bin/env node
/* Chapter 6.1 browser QA: real Chromium, two viewports, three learning steps,
   and no unnecessary fixed UI blocking the experiment.
   Run via node tests/ch6-viewport-e2e.mjs (Playwright installed).
*/
import {chromium} from "playwright";
import {spawn} from "node:child_process";
import {mkdirSync} from "node:fs";
const BASE=process.env.SS_BASE_URL||"http://127.0.0.1:8767/";
const DIR=process.env.SS_QA_DIR||"qa-ch6-viewport";
mkdirSync(DIR,{recursive:true});
let server;
if(!process.env.SS_BASE_URL){
  server=spawn("python3",["-m","http.server","8767","--bind","127.0.0.1"],{stdio:"ignore"});
  await new Promise(resolve=>setTimeout(resolve,1200));
}
const browser=await chromium.launch({headless:true});
const errors=[],report=[];
const check=(condition,message)=>{if(!condition)throw Error(message)};
try{
for(const [label,width] of [["desktop",1280],["mobile",390]]){
 const page=await browser.newPage({viewport:{width,height:840},deviceScaleFactor:1});
 page.on("pageerror",err=>errors.push(label+" page error: "+String(err)));
 await page.goto(BASE+"#chapter=6",{waitUntil:"domcontentloaded",timeout:45000});
 await page.locator("#lab-loading").waitFor({state:"hidden",timeout:45000});
 const iframe=page.frameLocator("#lab-frame");
 await iframe.locator(".ss6-step-nav").waitFor({state:"visible",timeout:30000});
 const chrome=await page.evaluate(()=>{
   const frame=document.getElementById("lab-frame").getBoundingClientRect();
   const top=document.querySelector(".topbar").getBoundingClientRect();
   const header=document.querySelector(".lab-head").getBoundingClientRect();
   return {frameH:frame.height,topH:top.height,headerH:header.height,viewportH:innerHeight};
 });
 check(chrome.frameH>=chrome.viewportH*.75,label+": experiment viewport under 75% of page height: "+JSON.stringify(chrome));
 check(chrome.topH<=46&&chrome.headerH<=50,label+": fixed top chrome too tall: "+JSON.stringify(chrome));
 const setup=await iframe.locator("body").evaluate(()=>{
   const e=document.documentElement,box=document.querySelector(".experiment").getBoundingClientRect();
   return {wide:e.classList.contains("ss6-wide-experiment"),experimentWidth:box.width,
      sidebar:document.querySelector(".sidebar")&&getComputedStyle(document.querySelector(".sidebar")).display,
      note:document.querySelector("#frequency-learning-note")?.textContent||""};
 });
 check(setup.wide,label+": wide experiment layout not applied");
 check(setup.sidebar==="none",label+": duplicate embedded chapter sidebar visible");
 const steps=iframe.locator(".ss6-step-button");
 check(await steps.count()===3,label+": expected 3 directly visible learning steps");
 for(const i of [0,1,2]){
   await steps.nth(i).click();
   await iframe.locator(".ss6-step-button.is-current").waitFor({state:"visible"});
   await page.waitForTimeout(140);
   const state=await iframe.locator("body").evaluate(()=>{
     const simulation=window.__dtftApp?.state?.periodic||{};
     return {mode:simulation.mode,fs:simulation.fs,f:simulation.f,
       plot0:!!document.getElementById("plot0"),plot1:!!document.getElementById("plot1"),
       lockFs:document.getElementById("ctrl_fs")?.disabled,
       lockF:document.getElementById("ctrl_f")?.disabled};
   });
   check(state.plot0&&state.plot1,label+": graphs missing in step "+i);
   check(state.mode===["frequency","rate","alias"][i],label+": unexpected mode after click");
   if(i===0)check(state.lockFs,label+": fs must be fixed while f varies");
   if(i===1)check(state.lockF,label+": f must be fixed while fs varies");
 }
 await steps.nth(1).click();
 const slider=iframe.locator("#ctrl_fs");
 await slider.evaluate(el=>{el.value="200";el.dispatchEvent(new Event("input",{bubbles:true}))});
 await page.waitForTimeout(120);
 const rate=await iframe.locator("body").evaluate(()=>({
   fs:window.__dtftApp?.state?.periodic.fs,f:window.__dtftApp?.state?.periodic.f,
   samplesPhysical:Math.floor(.2*(window.__dtftApp?.state?.periodic.fs||0)+1e-9)+1,
   sampleCountN:21,wide:document.documentElement.classList.contains("ss6-wide-experiment")
 }));
 check(rate.fs===200&&rate.f===10,label+": sampling-rate experiment changed f or ignored fs");
 check(rate.samplesPhysical===41,label+": 200 Hz should produce 41 physical samples over 200 ms");
 await page.screenshot({path:DIR+"/"+label+"-page.png",fullPage:false});
 await iframe.locator("body").screenshot({path:DIR+"/"+label+"-chapter6.png"});
 report.push({label,chrome,setup,rate});
 await page.close();
}
} catch(error){errors.push(String(error))}
finally{await browser.close();if(server)server.kill();}
console.log(JSON.stringify({checks:report,errors},null,2));
if(errors.length)process.exitCode=1;
