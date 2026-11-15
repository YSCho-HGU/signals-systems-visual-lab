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
const MODES=["light","dark"];
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
    await page.goto(BASE+"#chapter="+ch,{waitUntil:"domcontentloaded",timeout:45000});
    await page.locator("#lab-loading").waitFor({state:"hidden",timeout:45000});
    const iframe=page.frameLocator("#lab-frame");
    const selector=ch===1?"#nav button":ch===5?"#tabs button":ch>=7?"#nav button":"nav.nav button[data-nav]";
    const buttons=iframe.locator(selector);
    await buttons.first().waitFor({state:"visible",timeout:20000});
    const found=await buttons.count(),expected=EXP_COUNTS[ch-1];
    if(found!==expected)errors.push({width,theme,chapter:ch,error:"Experiment nav count "+found+" vs "+expected});
    const data=await page.evaluate(()=>{
      const e=document.documentElement,guide=document.getElementById("ss-study-guide");
      return {theme:e.dataset.theme,documentWidth:e.scrollWidth,windowWidth:innerWidth,
        guide:!!guide&&guide.hidden===false,navCurrent:!!document.querySelector('.navbtn[aria-current="page"]')};
    });
    if(data.theme!==theme)errors.push({width,theme,chapter:ch,error:"Incorrect parent theme "+data.theme});
    if(data.documentWidth>data.windowWidth+5)errors.push({width,theme,chapter:ch,error:"Parent horizontal overflow "+JSON.stringify(data)});
    if(!data.guide||!data.navCurrent)errors.push({width,theme,chapter:ch,error:"Missing learning route/current page"});
    const chDir=join(dir,"ch"+ch);mkdirSync(chDir,{recursive:true});
    for(let n=1;n<=Math.min(found,expected);n++){
      await buttons.nth(n-1).click({force:true});
      await page.waitForTimeout(110);
      const result=await iframe.locator("body").evaluate(body=>{
       const root=document.documentElement;
       const input=[...document.querySelectorAll('input[type="range"],select')];
       const unlabeled=input.filter(x=>!(x.labels?.length||x.hasAttribute("aria-label")||x.hasAttribute("title")));
       const rgb=s=>(s.match(/\\d+(?:\\.\\d+)?/g)||[]).slice(0,3).map(Number);
       const light=x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4};
       const luminance=s=>{const [r,g,b]=rgb(s).map(light);return .2126*r+.7152*g+.0722*b};
       const color=getComputedStyle(body),l1=luminance(color.color),l2=luminance(color.backgroundColor);
       const contrast=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
       return {overflow:root.scrollWidth>innerWidth+6,overflowWidth:root.scrollWidth,
         viewport:innerWidth,inputs:input.length,unlabeled:unlabeled.length,bodyTextContrast:Number(contrast.toFixed(2)),
         active:document.querySelector("nav .active")?.textContent?.trim().slice(0,45)||"",
         theme:root.dataset.theme};
      });
      if(result.theme!==theme)errors.push({width,theme,chapter:ch,experiment:n,error:"iframe theme "+result.theme});
      if(result.overflow)errors.push({width,theme,chapter:ch,experiment:n,error:"iframe overflow "+result.overflowWidth+"/"+result.viewport});
      if(result.bodyTextContrast<4.5)errors.push({width,theme,chapter:ch,experiment:n,error:"Body text contrast "+result.bodyTextContrast+" < 4.5"});
      record.push({width,theme,chapter:ch,experiment:n,...result});
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
console.log(JSON.stringify({experimentScreens:record.length,expected:248,issues:errors.length,output:ROOT},null,2));
if(record.length!==248||errors.length>0)process.exitCode=1;
