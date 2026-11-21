#!/usr/bin/env node
/* Chapter 6 native workspace E2E: no iframe, one page scrollbar, all six labs.
 * Run: node tests/ch6-viewport-e2e.mjs
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
  await new Promise(r=>setTimeout(r,1200));
}
const browser=await chromium.launch({headless:true});
const errors=[],checks=[];
function assert(v,m){if(!v)throw Error(m)}
try{
  for(const [name,width,height] of [["desktop",1280,800],["laptop",1366,768],["mobile",390,844]]){
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    page.on("pageerror",e=>errors.push(name+": "+String(e)));
    await page.goto(BASE+"chapter6.html",{waitUntil:"domcontentloaded",timeout:45000});
    await page.locator(".ss6-sequence-overview").waitFor({state:"visible",timeout:30000});
    await page.waitForFunction(()=>window.__dtftApp?.healthy===true,{timeout:15000});
    const overview=await page.evaluate(()=>{
      const one=(selector)=>{const n=document.querySelector(selector);return n?{y:n.getBoundingClientRect().top+scrollY,h:n.getBoundingClientRect().height}:null};
      return {iframes:document.querySelectorAll("iframe").length,
        title:one(".ss6-sequence-overview"),question:one(".ss6-top-question"),
        controls:one(".controls"),charts:one(".charts"),
        sidebar:getComputedStyle(document.querySelector(".sidebar")).display,
        plots:document.querySelectorAll(".charts canvas").length,
        buttons:document.querySelectorAll(".ss6-adjust-button").length};
    });
    assert(overview.iframes===0,name+": iframe still present");
    assert(overview.sidebar!=="none",name+": native chapter navigation hidden");
    assert(overview.title&&overview.question&&overview.controls&&overview.charts,name+": lesson sections missing");
    assert(overview.title.y<overview.question.y&&overview.question.y<overview.controls.y&&overview.controls.y<overview.charts.y,name+": learning sequence order incorrect");
    assert(overview.plots===3,name+": 6.1 must include CT, DT, and reconstruction charts");
    const theory=page.locator("#ss6-core-theory");
    assert(await theory.count()===1,name+": missing normalized digital frequency theory");
    assert(await theory.locator(".ss6-theory-item").count()===3,name+": missing CT → sampling → normalized frequency concepts");
    const ordered=await page.evaluate(()=>{
      const targets=[".ss6-sequence-overview","#ss6-core-theory",".ss6-lab-intro",".ss6-top-question",".ss6-step-controls",".ss6-observation-header",".ss6-interpretation"];
      return targets.map(x=>document.querySelector(x)?.getBoundingClientRect().top+scrollY);
    });
    assert(ordered.every((y,i)=>Number.isFinite(y)&&(i===0||y>=ordered[i-1]-1)),
      name+": theory-to-visual-lab order broken: "+JSON.stringify(ordered));
    // Steps 2 and 3 intentionally share the same vertical position.
    const labels=await page.locator(".ss6-step-card[data-ss6-step]").evaluateAll(list=>list.map(x=>x.dataset.ss6Step));
    assert(labels.join(",")==="1,2,3,4",name+": step marker hierarchy does not show 1–4");
    await page.locator("#ss6-theme-picker").selectOption("white-clean");
    assert(await page.evaluate(()=>document.documentElement.dataset.elsTheme)==="white-clean",name+": White theme not selectable");
    const white=await page.locator("#ss6-core-theory").evaluate(el=>({body:getComputedStyle(document.body).backgroundColor,
      theory:getComputedStyle(el).backgroundColor,fontSize:getComputedStyle(el.querySelector(".ss6-theory-heading p")).fontSize}));
    assert(white.body==="rgb(244, 246, 247)"&&white.theory==="rgb(255, 255, 255)",name+": White theme not white: "+JSON.stringify(white));
    assert(parseFloat(white.fontSize)>=15,name+": theory body font too small");
    await page.locator("#ss6-language-picker").selectOption("en");
    await page.waitForFunction(()=>document.querySelector(".ss6-top-question details summary")?.textContent==="Show answer and explanation");
    const english=await page.locator(".ss6-top-question details summary").innerText();
    assert(english==="Show answer and explanation",name+": English answer button still Korean");
    assert((await page.locator("#ss6-theory-title").innerText()).includes("Normalized discrete-time frequency"),
      name+": English concept heading absent");
    await page.locator("#ss6-language-picker").selectOption("mixed");
    await page.locator("#ss6-theme-picker").selectOption("neutral-dark");
    assert(overview.buttons>=4,name+": inline +/- buttons missing");
    // Prediction is optional; an unfilled note must never disable an experiment.
    assert(await page.locator(".ss6-prediction-note").count()===1,name+": missing optional prediction field");
    assert(await page.locator("#ctrl_f").isEnabled(),name+": 6.1 analog frequency slider locked");
    assert(await page.locator("#ctrl_fs").isEnabled(),name+": 6.1 sampling frequency slider locked");
    const typography=await page.evaluate(()=>{
      const selectors=[".ss6-step-predict h3",".ss6-step-controls h3",".ss6-observation-header h3",".ss6-interpretation h3"];
      return selectors.map(q=>{
        const el=document.querySelector(q);
        if(!el)return null;
        const style=getComputedStyle(el);
        return {size:style.fontSize,weight:style.fontWeight,margin:style.marginBottom};
      });
    });
    assert(typography.every(v=>v!==null),name+": one of the four step headings is missing");
    assert(typography.every(v=>v.size===typography[0].size&&v.weight===typography[0].weight),
      name+": step headings have inconsistent typography: "+JSON.stringify(typography));
    await page.locator("#ctrl_f").evaluate(e=>{e.value="10";e.dispatchEvent(new Event("input",{bubbles:true}))});
    await page.locator(".ss6-adjust-button").first().click();
    await page.waitForFunction(()=>window.__dtftApp?.state?.periodic?.fs===100);
    assert(await page.locator("#ctrl_f").isEnabled(),name+": first step wrongly requires prediction before adjustment");
    await page.locator("#ctrl_mode").selectOption("rate");
    await page.waitForFunction(()=>window.__dtftApp?.state?.periodic?.mode==="rate");
    assert(await page.locator("#ctrl_f").isEnabled()&&await page.locator("#ctrl_fs").isEnabled(),
      name+": second step has unexpected locked slider");
    await page.locator("#ctrl_mode").selectOption("frequency");
    const mode=await page.locator("#ctrl_mode").inputValue();
    assert(mode==="frequency",name+": initial frequency learning step incorrect");
    await page.locator("#ctrl_f").evaluate(e=>{e.value="20";e.dispatchEvent(new Event("input",{bubbles:true}))});
    await page.waitForFunction(()=>window.__dtftApp?.state?.periodic?.f===20);
    const explanation=await page.locator("#ss6-live-explanation").innerText();
    assert(explanation.includes("20"),name+": live frequency summary did not update");
    const ids=["periodic","pairs","phase","phasor","filter","fft"];
    for(const id of ids){
      await page.locator(`[data-nav="${id}"]`).click();
      await page.waitForFunction(id=>window.__dtftApp?.active===id,id);
      assert(await page.locator(".ss6-sequence-overview").count()===1,name+": overview not updated "+id);
      assert(await page.locator(".ss6-guide-details").count()===2,name+": guided content not collapsible "+id);
      assert(await page.locator(".charts canvas").count()>=2,name+": graph missing "+id);
      assert(await page.locator(".ss6-top-question h3").count()===1,name+": predict step missing "+id);
      assert(await page.locator(".ss6-step-controls h3").count()===1,name+": adjust step missing "+id);
      assert(await page.locator(".ss6-observation-header h3").count()===1,name+": observe step missing "+id);
      assert(await page.locator(".ss6-interpretation > h3").count()===1,name+": interpret primary heading missing "+id);
    }
    await page.locator('[data-nav="periodic"]').click();
    await page.waitForFunction(()=>window.__dtftApp?.active==="periodic");
    await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"}));
    await page.waitForTimeout(200);
    const scroll=await page.evaluate(()=>({
      body:document.documentElement.scrollHeight,
      viewport:innerHeight,
      scrollY,
      reachedBottom:Math.abs(scrollY+innerHeight-document.documentElement.scrollHeight)<=5
    }));
    assert(scroll.body>scroll.viewport,name+": page does not scroll");
    assert(scroll.reachedBottom,name+": cannot scroll to very bottom");
    await page.screenshot({path:`${DIR}/${name}-native-ch6.png`,fullPage:false});
    checks.push({name,overview,scroll});
    await page.close();
  }
}catch(e){errors.push(String(e))}
finally{await browser.close();if(server)server.kill()}
console.log(JSON.stringify({checks,errors},null,2));
if(errors.length)process.exitCode=1;
