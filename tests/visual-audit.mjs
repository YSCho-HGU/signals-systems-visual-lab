#!/usr/bin/env node
/* Reproducible visual+interaction QA for all 62 existing experiments.
   Run: npm install && npx playwright install chromium && npm run qa:visual
   Requires site HTTP server. Does not claim mathematical correctness.
*/
import {chromium} from "playwright";
import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";

const BASE=process.env.SS_BASE_URL||"http://127.0.0.1:8765/";
const ROOT=process.env.SS_QA_DIR||"qa-output";
const WATCH=[390,1280];
const MODES=["warm-neutral","neutral-dark"];
const EXP_COUNTS=[9,9,7,8,8,6,7,8];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
mkdirSync(ROOT,{recursive:true});
const record=[],errors=[];
let server=null;
if(!process.env.SS_BASE_URL){
 server=spawn("python3",["-m","http.server","8765","--bind","127.0.0.1"],{stdio:"ignore"});
 await sleep(1200);
}
const browser=await chromium.launch({headless:true});
try{
 for(const width of WATCH){
  for(const theme of MODES){
   const page=await browser.newPage({viewport:{width,height:820},deviceScaleFactor:1,reducedMotion:"reduce"});
   page.on("pageerror",err=>errors.push({width,theme,chapter:"page",error:String(err)}));
   page.on("console",message=>{if(message.type()==="error"&&!/favicon/i.test(message.text()))errors.push({width,theme,chapter:"console",error:message.text().slice(0,150)})});
   await page.goto(BASE,{waitUntil:"domcontentloaded"});
   await page.locator("#theme-select").selectOption(theme);
   await page.waitForTimeout(100);
   const dir=join(ROOT,theme,String(width));mkdirSync(dir,{recursive:true});
   await page.screenshot({path:join(dir,"overview.png"),fullPage:true});
   await page.locator('[data-route="map"]').first().click();
   await page.screenshot({path:join(dir,"map.png"),fullPage:true});
   for(let ch=1;ch<=8;ch++){
    if(ch===5){
      await page.goto(BASE+"chapter5.html",{waitUntil:"domcontentloaded",timeout:45000});
      await page.locator("#ss5-theme-picker").selectOption(theme);
      const names=["weight","roc","pairs","props","inverse","stability","rc","second"];
      const tabs=page.locator("#tabs [data-lab]");
      const found=await tabs.count(),expected=EXP_COUNTS[ch-1];
      if(found!==expected)errors.push({width,theme,chapter:ch,error:"Native Chapter 5 nav count "+found+" vs "+expected});
      const chDir=join(dir,"ch5");mkdirSync(chDir,{recursive:true});
      for(let n=1;n<=Math.min(found,expected);n++){
        await tabs.nth(n-1).click();
        await page.waitForFunction(id=>window.__laplaceVisualLab?.active===id,names[n-1],{timeout:10000});
        await page.waitForTimeout(150);
        const result=await page.evaluate(()=>{
          const root=document.documentElement,body=document.body;
          const input=[...document.querySelectorAll('input[type="range"],select')];
          const unlabeled=input.filter(x=>!(x.labels?.length||x.hasAttribute("aria-label")||x.hasAttribute("title")));
          const rgb=s=>(s.match(/[0-9]+(?:[.][0-9]+)?/g)||[]).slice(0,3).map(Number);
          const light=x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4};
          const luminance=s=>{const [r,g,b]=rgb(s).map(light);return .2126*r+.7152*g+.0722*b};
          const style=getComputedStyle(body);
          const contrast=(Math.max(luminance(style.color),luminance(style.backgroundColor))+.05)/(Math.min(luminance(style.color),luminance(style.backgroundColor))+.05);
          return {overflow:root.scrollWidth>innerWidth+6,overflowWidth:root.scrollWidth,viewport:innerWidth,
            inputs:input.length,unlabeled:unlabeled.length,bodyTextContrast:Number(contrast.toFixed(2)),
            active:window.__laplaceVisualLab?.active||"",theme:root.dataset.theme,
            iframes:document.querySelectorAll("iframe").length,plots:document.querySelectorAll(".plots canvas").length};
        });
        if(result.iframes)errors.push({width,theme,chapter:ch,experiment:n,error:"Chapter 5 native page unexpectedly contains iframe"});
        if(result.plots<2)errors.push({width,theme,chapter:ch,experiment:n,error:"Chapter 5 missing plots"});
        if(result.unlabeled)errors.push({width,theme,chapter:ch,experiment:n,error:"Unlabeled Chapter 5 input "+result.unlabeled});
        if(result.theme!==(theme==="warm-neutral"?"light":"dark"))errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 5 theme "+result.theme});
        if(result.overflow)errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 5 overflow "+result.overflowWidth+"/"+result.viewport});
        if(result.bodyTextContrast<4.5)errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 5 text contrast "+result.bodyTextContrast});
        record.push({...result,width,theme,chapter:ch,experiment:n,scheme:result.theme});
        await page.screenshot({path:join(chDir,String(n).padStart(2,"0")+".png"),fullPage:false});
      }
      continue;
    }
    if(ch===6){
      await page.goto(BASE+"chapter6.html",{waitUntil:"domcontentloaded",timeout:45000});
      await page.locator(".ss6-sequence-overview").waitFor({state:"visible",timeout:30000});
      await page.locator("#ss6-theme-picker").selectOption(theme);
      const chDir=join(dir,"ch6");mkdirSync(chDir,{recursive:true});
      const buttons=page.locator(".sidebar [data-nav]");
      const found=await buttons.count(),expected=EXP_COUNTS[ch-1];
      if(found!==expected)errors.push({width,theme,chapter:ch,error:"Native Chapter 6 nav count "+found+" vs "+expected});
      for(let n=1;n<=Math.min(found,expected);n++){
        await buttons.nth(n-1).click();
        await page.waitForFunction(i=>window.__dtftApp?.active===["periodic","pairs","phase","phasor","filter","fft"][i],n-1,{timeout:10000});
        await page.waitForTimeout(120);
        const result=await page.evaluate(()=>{
          const root=document.documentElement,body=document.body;
          const input=[...document.querySelectorAll('input[type="range"],select')];
          const unlabeled=input.filter(x=>!(x.labels?.length||x.hasAttribute("aria-label")||x.hasAttribute("title")));
          const rgb=s=>(s.match(/[0-9]+(?:[.][0-9]+)?/g)||[]).slice(0,3).map(Number);
          const light=x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4};
          const luminance=s=>{const [r,g,b]=rgb(s).map(light);return .2126*r+.7152*g+.0722*b};
          const style=getComputedStyle(body);
          const contrast=(Math.max(luminance(style.color),luminance(style.backgroundColor))+.05)/(Math.min(luminance(style.color),luminance(style.backgroundColor))+.05);
          return {overflow:root.scrollWidth>innerWidth+6,overflowWidth:root.scrollWidth,viewport:innerWidth,
            inputs:input.length,unlabeled:unlabeled.length,bodyTextContrast:Number(contrast.toFixed(2)),
            active:window.__dtftApp?.active||"",theme:root.dataset.theme,
            iframes:document.querySelectorAll("iframe").length,plots:document.querySelectorAll(".charts canvas").length};
        });
        if(result.iframes)errors.push({width,theme,chapter:ch,experiment:n,error:"Chapter 6 native page unexpectedly contains iframe"});
        if(result.plots<2)errors.push({width,theme,chapter:ch,experiment:n,error:"Chapter 6 missing charts"});
        if(result.unlabeled)errors.push({width,theme,chapter:ch,experiment:n,error:"Unlabeled Chapter 6 input "+result.unlabeled});
        if(result.theme!==(theme==="warm-neutral"?"light":"dark"))errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 6 theme "+result.theme});
        if(result.overflow)errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 6 overflow "+result.overflowWidth+"/"+result.viewport});
        if(result.bodyTextContrast<4.5)errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 6 text contrast "+result.bodyTextContrast});
        record.push({...result,width,theme,chapter:ch,experiment:n,scheme:result.theme});
        await page.screenshot({path:join(chDir,String(n).padStart(2,"0")+".png"),fullPage:false});
      }
      continue;
    }
    if(ch===7){
      await page.goto(BASE+"chapter7.html",{waitUntil:"load",timeout:45000});
      await page.waitForFunction(()=>window.__ss7Standard?.ready&&window.__ss7Native?.ready);
      await page.locator("#ss7-theme-picker").selectOption(theme);
      const chDir=join(dir,"ch7");mkdirSync(chDir,{recursive:true});
      const tabs=page.locator("#ss7-lesson-nav button");
      const found=await tabs.count(),expected=EXP_COUNTS[ch-1];
      if(found!==expected)errors.push({width,theme,chapter:ch,error:"Native Chapter 7 nav count "+found+" vs "+expected});
      for(let n=1;n<=Math.min(found,expected);n++){
        await tabs.nth(n-1).click();
        await page.waitForFunction(i=>window.SSChapter7?.currentExperiment===i,n);
        const result=await page.evaluate(()=>{
         const root=document.documentElement,body=document.body;
         const input=[...document.querySelectorAll('#controls input[type="range"],#controls select')];
         const unlabeled=input.filter(x=>!(x.labels?.length||x.hasAttribute("aria-label")||x.hasAttribute("title")));
         const style=getComputedStyle(body);
         const rgb=value=>(value.match(/[0-9]+(?:[.][0-9]+)?/g)||[]).slice(0,3).map(Number);
         const light=x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4};
         const lum=value=>{const [red,green,blue]=rgb(value).map(light);return .2126*red+.7152*green+.0722*blue};
         const ink=lum(style.color),paper=lum(style.backgroundColor);
         const contrast=(Math.max(ink,paper)+.05)/(Math.min(ink,paper)+.05);
         return {overflow:root.scrollWidth>innerWidth+6,overflowWidth:root.scrollWidth,viewport:innerWidth,
          inputs:input.length,unlabeled:unlabeled.length,bodyTextContrast:Number(contrast.toFixed(2)),
          active:window.SSChapter7?.currentExperiment,theme:root.dataset.theme,
          iframes:document.querySelectorAll("iframe").length,plots:document.querySelectorAll("#plots svg").length,
          stages:document.querySelectorAll(".ss7-stage-head").length};
        });
        if(result.iframes)errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 7 unexpectedly contains iframe"});
        if(result.plots<1)errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 7 missing plot"});
        if(result.stages!==4)errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 7 missing learning stages"});
        if(result.unlabeled)errors.push({width,theme,chapter:ch,experiment:n,error:"Unlabeled Chapter 7 input "+result.unlabeled});
        if(result.theme!==(theme==="warm-neutral"?"light":"dark"))errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 7 theme "+result.theme});
        if(result.overflow)errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 7 overflow "+result.overflowWidth+"/"+result.viewport});
        if(result.bodyTextContrast<4.5)errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 7 contrast "+result.bodyTextContrast});
        record.push({...result,width,theme,chapter:ch,experiment:n,scheme:result.theme});
        await page.screenshot({path:join(chDir,String(n).padStart(2,"0")+".png"),fullPage:false});
      }
      continue;
    }
    if(ch===8){
      await page.goto(BASE+"chapter8.html",{waitUntil:"load",timeout:45000});
      await page.waitForFunction(()=>window.__ss8Native?.ready&&window.SSChapter8?.experimentCount===8,{timeout:20000});
      await page.locator("#ss8-theme-picker").selectOption(theme);
      const chDir=join(dir,"ch8");mkdirSync(chDir,{recursive:true});
      const tabs=page.locator("#nav [data-exp]");
      const found=await tabs.count(),expected=EXP_COUNTS[ch-1];
      if(found!==expected)errors.push({width,theme,chapter:ch,error:"Native Chapter 8 nav count "+found+" vs "+expected});
      for(let n=1;n<=Math.min(found,expected);n++){
        await tabs.nth(n-1).click();
        await page.waitForFunction(i=>window.SSChapter8?.currentExperiment===i,n,{timeout:10000});
        const result=await page.evaluate(()=>{
          const root=document.documentElement,body=document.body;
          const input=[...document.querySelectorAll('#controls input[type="range"],#controls select')];
          const unlabeled=input.filter(x=>!(x.labels?.length||x.hasAttribute('aria-label')||x.hasAttribute('title')));
          const rgb=value=>(value.match(/[0-9]+(?:[.][0-9]+)?/g)||[]).slice(0,3).map(Number);
          const light=x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4};
          const lum=value=>{const [red,green,blue]=rgb(value).map(light);return .2126*red+.7152*green+.0722*blue};
          const style=getComputedStyle(body),ink=lum(style.color),paper=lum(style.backgroundColor);
          const contrast=(Math.max(ink,paper)+.05)/(Math.min(ink,paper)+.05);
          return {overflow:root.scrollWidth>innerWidth+6,overflowWidth:root.scrollWidth,viewport:innerWidth,
            inputs:input.length,unlabeled:unlabeled.length,bodyTextContrast:Number(contrast.toFixed(2)),
            active:window.SSChapter8?.currentExperiment,theme:root.dataset.theme,
            iframes:document.querySelectorAll('iframe').length,plots:document.querySelectorAll('#plots svg').length,
            stages:document.querySelectorAll('.ss8-stage-head').length,
            guided:document.querySelectorAll('#step-content .step .math .katex').length};
        });
        if(result.iframes)errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 8 unexpectedly contains iframe"});
        if(result.plots<1)errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 8 missing plot"});
        if(result.stages!==4)errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 8 missing learning stages"});
        if(result.guided!==1)errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 8 missing guided KaTeX"});
        if(result.unlabeled)errors.push({width,theme,chapter:ch,experiment:n,error:"Unlabeled Chapter 8 input "+result.unlabeled});
        if(result.theme!==(theme==="warm-neutral"?"light":"dark"))errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 8 theme "+result.theme});
        if(result.overflow)errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 8 overflow "+result.overflowWidth+"/"+result.viewport});
        if(result.bodyTextContrast<4.5)errors.push({width,theme,chapter:ch,experiment:n,error:"Native Chapter 8 contrast "+result.bodyTextContrast});
        record.push({...result,width,theme,chapter:ch,experiment:n,scheme:result.theme});
        await page.screenshot({path:join(chDir,String(n).padStart(2,"0")+".png"),fullPage:false});
      }
      continue;
    }
    await page.goto(BASE+"#chapter="+ch,{waitUntil:"domcontentloaded",timeout:45000});
    await page.locator("#lab-loading").waitFor({state:"hidden",timeout:45000});
    const iframe=page.frameLocator("#lab-frame");
    // The legacy iframe nav is intentionally hidden by unified navigation.
    // Use the same visible chapter sidebar students interact with.
    const buttons=page.locator("#ss-unified-nav .ss-unified-link");
    const openSidebar=async()=>{
      const collapsed=await page.locator("#ss-unified-nav").evaluate(node=>node.classList.contains("collapsed"));
      if(collapsed)await page.locator("#ss-unified-nav .ss-unified-toggle").click();
    };
    await openSidebar();
    await buttons.first().waitFor({state:"visible",timeout:20000});
    const found=await buttons.count(),expected=EXP_COUNTS[ch-1];
    if(found!==expected)errors.push({width,theme,chapter:ch,error:"Experiment nav count "+found+" vs "+expected});
    const data=await page.evaluate(()=>{
      const e=document.documentElement,guide=document.getElementById("ss-study-guide");
      return {theme:e.dataset.theme,documentWidth:e.scrollWidth,windowWidth:innerWidth,
        guide:!!guide&&guide.hidden===false,navCurrent:!!document.querySelector('.navbtn[aria-current="page"]')};
    });
    if(data.theme!==(theme==="warm-neutral"?"light":"dark"))errors.push({width,theme,chapter:ch,error:"Incorrect parent theme "+data.theme});
    if(data.documentWidth>data.windowWidth+5)errors.push({width,theme,chapter:ch,error:"Parent horizontal overflow "+JSON.stringify(data)});
    if(!data.guide||!data.navCurrent)errors.push({width,theme,chapter:ch,error:"Missing learning route/current page"});
    const chDir=join(dir,"ch"+ch);mkdirSync(chDir,{recursive:true});
    for(let n=1;n<=Math.min(found,expected);n++){
      await openSidebar();
      await buttons.nth(n-1).click();
      await page.waitForTimeout(110);
      const result=await iframe.locator("body").evaluate(body=>{
       const root=document.documentElement;
       const input=[...document.querySelectorAll('input[type="range"],select')];
       const unlabeled=input.filter(x=>!(x.labels?.length||x.hasAttribute("aria-label")||x.hasAttribute("title")));
       const rgb=s=>(s.match(/[0-9]+(?:[.][0-9]+)?/g)||[]).slice(0,3).map(Number);
       const light=x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4};
       const luminance=s=>{const [r,g,b]=rgb(s).map(light);return .2126*r+.7152*g+.0722*b};
       const color=getComputedStyle(body),l1=luminance(color.color),l2=luminance(color.backgroundColor);
       const contrast=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
       return {overflow:root.scrollWidth>innerWidth+6,overflowWidth:root.scrollWidth,
         viewport:innerWidth,inputs:input.length,unlabeled:unlabeled.length,bodyTextContrast:Number(contrast.toFixed(2)),
         active:document.querySelector("nav .active")?.textContent?.trim().slice(0,45)||"",
         theme:root.dataset.theme};
      });
      if(result.theme!==(theme==="warm-neutral"?"light":"dark"))errors.push({width,theme,chapter:ch,experiment:n,error:"iframe theme "+result.theme});
      if(result.overflow)errors.push({width,theme,chapter:ch,experiment:n,error:"iframe overflow "+result.overflowWidth+"/"+result.viewport});
      if(result.bodyTextContrast<4.5)errors.push({width,theme,chapter:ch,experiment:n,error:"Body text contrast "+result.bodyTextContrast+" < 4.5"});
      record.push({width,theme,chapter:ch,experiment:n,...result,theme,scheme:result.theme});
      await page.locator("#lab-frame").screenshot({path:join(chDir,String(n).padStart(2,"0")+".png")});
    }
   }
   await page.close();
  }
 }
}finally{
 await browser.close();
 if(server)server.kill();
}
const summary={experimentScreens:record.length,expectedScreens:62*2*2,errors:errors.length,
 themes:MODES,widths:WATCH,records:record,failures:errors};
writeFileSync(join(ROOT,"results.json"),JSON.stringify(summary,null,2));
console.log(JSON.stringify({experimentScreens:record.length,expected:248,issues:errors.length,issueExamples:errors.slice(0,15),output:ROOT},null,2));
if(record.length!==248||errors.length>0)process.exitCode=1;
