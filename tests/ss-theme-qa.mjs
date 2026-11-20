#!/usr/bin/env node
/* S&S Neutral Dark palette and live lab-state regression. */
import fs from 'node:fs';
import {spawn} from 'node:child_process';
const report=[],failures=[];
function check(ok,msg){report.push({pass:!!ok,msg});if(!ok)failures.push(msg)}
const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('assets/els-theme-v2.css','utf8'),js=fs.readFileSync('assets/els-theme-v2.js','utf8');
for(const q of ['els-theme-v2.css','els-theme-v2.js','ss-set-theme','__ssApplyTheme','iframe.srcdoc=decodeLab(ch)']){
 check(html.includes(q),'S&S page preserves '+q);
}
for(const theme of ['neutral-dark','warm-dark','navy-dark','warm-neutral']){
 check(css.includes('data-els-theme="'+theme+'"'),'S&S theme colors '+theme);
 check(js.includes('"'+theme+'"'),'S&S selector supports '+theme);
}
check(html.includes('assets/els-theme-v2.css?v=')&&js.includes('dataset.elsTheme'),'Lab and site include shared theme CSS');
check(html.includes('localStorage.getItem(\'els-theme-v2\')'),'prepaint theme persistence');
let browserStatus='NOT_RUN',browser,server;
if(process.env.C_JOURNEY_BROWSER==='1'){
 try{
  const {chromium}=await import('playwright');
  server=spawn('python3',['-m','http.server','8892','--bind','127.0.0.1'],{stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  browser=await chromium.launch({headless:true});
  for(const width of [390,1280]){
   const page=await browser.newPage({viewport:{width,height:850}});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8892/',{waitUntil:'domcontentloaded'});
   const select=page.locator('[data-els-theme-picker]');
   check(await select.count()===1,'S&S theme selector visible at '+width);
   check(await page.evaluate(()=>document.documentElement.dataset.elsTheme)==='neutral-dark','S&S Neutral Dark default at '+width);
   const appearance=await page.evaluate(()=>({bg:getComputedStyle(document.body).backgroundColor,ink:getComputedStyle(document.body).color}));
   check(appearance.bg==='rgb(16, 16, 16)','S&S computed neutral background at '+width);
   check(appearance.ink==='rgb(240, 240, 237)','S&S computed neutral text at '+width);
   await select.selectOption('warm-neutral');
   check(await page.evaluate(()=>document.documentElement.dataset.theme)==='light','S&S light theme applied at '+width);
   await select.selectOption('neutral-dark');
   check(await page.evaluate(()=>document.documentElement.dataset.theme)==='dark','S&S dark theme applied at '+width);
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+8),'S&S no horizontal overflow '+width);
   check(errors.length===0,'S&S no exceptions '+width+' '+errors.join(';'));
   if(width===1280){
    await page.goto('http://127.0.0.1:8892/#chapter=1',{waitUntil:'domcontentloaded'});
    const frame=page.locator('#lab-frame');
    await frame.waitFor({state:'visible'});
    await page.waitForFunction(()=>!!document.querySelector('#lab-frame')?.contentDocument?.body?.children.length);
    check(await page.locator('#ss-chapter-select').count()===1,'Compact chapter dropdown is available');
    check(await page.locator('#guide-toggle').getAttribute('aria-expanded')==='false','Study guide collapsed by default');
    const topbarHeight=await page.locator('.topbar').evaluate(e=>e.getBoundingClientRect().height);
    const labHeaderHeight=await page.locator('.lab-head').evaluate(e=>e.getBoundingClientRect().height);
    check(topbarHeight<=56&&labHeaderHeight<=72,'Lab chrome height reduced: '+topbarHeight+'+'+labHeaderHeight);
    const guide=page.locator('#guide-toggle');
    if(await guide.isVisible()){
      await guide.click();
      check(await guide.getAttribute('aria-expanded')==='true','Learning path can expand');
      await guide.click();
      check(await guide.getAttribute('aria-expanded')==='false','Learning path collapses again');
    }else{
      const navigation=page.locator('#ss-unified-nav');
      check(await navigation.count()===1,'Unified experiment navigation replaces hidden legacy guide');
      const toggle=navigation.locator('.ss-unified-toggle');
      check(await toggle.count()===1,'Unified navigation has a toggle control');
    }
    const srcBefore=await frame.evaluate(e=>e.srcdoc.length);
    await select.selectOption('warm-dark');
    const srcAfter=await frame.evaluate(e=>e.srcdoc.length);
    check(srcBefore===srcAfter&&srcBefore>1000,'S&S theme switch does not reload chapter source');
    check(await frame.evaluate(e=>e.contentDocument?.documentElement?.dataset.elsTheme)==='warm-dark','S&S chapter iframe receives selected palette');
    await page.locator('#ss-chapter-select').selectOption('2');
    check(await page.evaluate(()=>location.hash)==='#chapter=2','Chapter dropdown navigates to Chapter 2');
    check(await page.locator('#ss-chapter-select').inputValue()==='2','Chapter selector synchronizes with route');
    check(await page.locator('#lab-frame').count()===1,'Chapter navigation preserves lab iframe element');
   }
   await page.close();
  }
  browserStatus='RAN';
 }catch(e){check(false,'S&S browser theme QA failed: '+String(e))}
 finally{if(browser)await browser.close();if(server)server.kill()}
}
fs.mkdirSync('qa-output',{recursive:true});
fs.writeFileSync('qa-output/ss-theme-qa.json',JSON.stringify({browserStatus,report,failures},null,2));
console.log(JSON.stringify({status:failures.length?'FAIL':'PASS',browserStatus,checks:report.length,failures},null,2));
if(failures.length)process.exitCode=1;
