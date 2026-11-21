#!/usr/bin/env node
/* Native Chapter 5 Playwright journey: original Laplace computation and controls
 * must remain functional after removing the embedded iframe.
 */
import {chromium} from "playwright";
import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
const BASE=process.env.SS_BASE_URL||"http://127.0.0.1:8765/";
const output="qa-ch5";mkdirSync(output,{recursive:true});
const failures=[],observations=[];
const labs=["weight","roc","pairs","props","inverse","stability","rc","second"];
const sizes=[{width:390,height:844},{width:1280,height:800},{width:1366,height:768}];
let server=null,browser=null;
const check=(ok,caseId,data)=>{observations.push({caseId,pass:!!ok,data});if(!ok)failures.push(caseId)};
try{
 if(!process.env.SS_BASE_URL){
  server=spawn("python3",["-m","http.server","8765","--bind","127.0.0.1"],{stdio:"ignore"});
  await new Promise(r=>setTimeout(r,1200));
 }
 browser=await chromium.launch({headless:true});
 for(const viewport of sizes){
  const page=await browser.newPage({viewport,deviceScaleFactor:1,reducedMotion:"reduce"});
  const prefix=String(viewport.width);
  const errors=[];
  page.on("pageerror",err=>errors.push(err.message));
  await page.goto(BASE+"chapter5.html",{waitUntil:"load"});
  await page.waitForFunction(()=>Boolean(window.__laplaceVisualLab?.healthy));
  check(await page.locator("iframe").count()===0,prefix+"-no-iframe");
  check(await page.locator(".ss5-site-header").isVisible(),prefix+"-native-header");
  check(await page.locator("#tabs [data-lab]").count()===8,prefix+"-eight-labs");
  check((await page.evaluate(()=>window.__labNumerics?.rcCutoff))>0,prefix+"-numerical-diagnostics");
  const theme=page.locator("#ss5-theme-picker");
  await theme.selectOption("white-clean");
  check(await page.evaluate(()=>document.documentElement.dataset.elsTheme==="white-clean"),prefix+"-white-clean-theme");
  await theme.selectOption("neutral-dark");
  check(await page.evaluate(()=>document.documentElement.dataset.theme==="dark"),prefix+"-dark-theme");
  const lang=page.locator("#ss5-language-picker");
  await lang.selectOption("en");
  check(await page.evaluate(()=>window.ELSLanguage.get()==="en"),prefix+"-language");
  await lang.selectOption("mixed");
  for(let index=0;index<labs.length;index++){
   const lab=labs[index];
   await page.locator('#tabs [data-lab="'+lab+'"]').click();
   await page.waitForFunction(id=>window.__laplaceVisualLab?.active===id,lab);
   const snapshot=await page.evaluate(()=>{
    return {state:window.__laplaceVisualLab?.state,
      canvases:document.querySelectorAll(".plots canvas").length,
      overflow:document.documentElement.scrollWidth>innerWidth+6,
      sticky:getComputedStyle(document.querySelector(".lab .panel")).position,
      hasHeaders:!!document.querySelector(".ss5-site-header"),
      progress:!!document.querySelector("#ss5-progress")};
   });
   check(snapshot.canvases>=2,prefix+"-"+lab+"-plots",snapshot.canvases);
   check(!snapshot.overflow,prefix+"-"+lab+"-no-horizontal-overflow");
   check(snapshot.sticky!=="sticky"&&snapshot.sticky!=="fixed",prefix+"-"+lab+"-controls-not-sticky",snapshot.sticky);
   check(snapshot.hasHeaders&&snapshot.progress,prefix+"-"+lab+"-native-layout");
   const layout=await page.evaluate(()=>{
    const panel=document.querySelector(".lab .panel"),plots=document.querySelector(".plots"),predict=document.querySelector(".ss5-predict");
    const a=panel.getBoundingClientRect(),b=plots.getBoundingClientRect(),p=predict.getBoundingClientRect();
    return {sideBySide:innerWidth>780?a.right<=b.left+4:true,
      predictionIsFullRow:predict.parentElement?.id==="page"&&p.left<=a.left+3&&p.right>=b.right-3,
      predictionAboveWorkbench:p.bottom<=a.top+2&&p.bottom<=b.top+2,
      panelPosition:getComputedStyle(panel).position,plotVisible:b.width>0&&b.height>0};
   });
   check(layout.predictionIsFullRow&&layout.predictionAboveWorkbench,prefix+"-"+lab+"-prediction-full-width-top-row",layout);
   check(layout.sideBySide&&layout.plotVisible&&layout.panelPosition!=="sticky"&&layout.panelPosition!=="fixed",prefix+"-"+lab+"-controls-and-plots-layout",layout);

   const math=await page.evaluate(()=>{
     const hero=document.querySelector("#formula");
     const steps=[...document.querySelectorAll(".deriv-math")];
     return {hero:hero?.dataset.mathRendered||"",steps:steps.map(x=>x.dataset.mathRendered||""),
       expected:window.ELSChapterFiveMath?.guides(window.__laplaceVisualLab.active,window.__laplaceVisualLab.state[window.__laplaceVisualLab.active]).length,
       engine:typeof window.ELSChapterFiveMath?.renderAll==="function"};
   });
   check(math.engine&&math.expected===4,prefix+"-"+lab+"-math-model",math);
   check(math.hero==="katex"&&math.steps.every(x=>x==="katex"),prefix+"-"+lab+"-katex-rendered",math);
   const inline=await page.evaluate(()=>{
     const count=document.querySelectorAll(".ss5-inline-equation .katex, .ss5-prose-math .katex, .els-inline-math .katex").length;
     const reading=document.querySelector(".reading-panel")?.innerText||"";
     const caption=document.querySelector(".figure .sub")?.innerText||"";
     return {count,reading:reading.slice(0,80),caption:caption.slice(0,80)};
   });
   check(inline.count>0,prefix+"-"+lab+"-inline-body-math",inline);
   const readingMath=await page.evaluate(()=>({
     authored:document.querySelectorAll(".reading-panel [data-els-math-inline]").length,
     katex:document.querySelectorAll(".reading-panel [data-els-math-inline][data-math-rendered='katex']").length,
     failed:document.querySelectorAll(".reading-panel [data-math-error], .reading-panel .ss5-prose-math-error").length,
     all:document.querySelectorAll(".reading-panel .katex").length
   }));
   check(readingMath.all>0&&readingMath.authored===readingMath.katex&&readingMath.failed===0,prefix+"-"+lab+"-explicit-reading-katex",readingMath);

   const quizMath=await page.evaluate(()=>({
     count:document.querySelectorAll(".quiz .ss5-explicit-math .katex").length,
     fallback:document.querySelectorAll(".quiz .ss5-explicit-math:not(:has(.katex))").length,
     errors:document.querySelectorAll(".quiz .ss5-explicit-math[data-math-error]").length
   }));
   check(quizMath.count>0&&quizMath.fallback===0&&quizMath.errors===0,prefix+"-"+lab+"-explicit-quiz-math",quizMath);


   const notes=await page.locator(".reading-note p").allTextContents();
   check(notes.length>=2&&notes.some(x=>x.includes(" / ")||x.includes("ROC")||x.includes("pole")||x.includes("τ")),prefix+"-"+lab+"-reading-notes",notes.slice(0,2));


   const steps=await page.locator(".ss5-flow-label").allTextContents();
   check(steps.some(x=>x.includes("Predict"))&&steps.some(x=>x.includes("Observe"))&&steps.some(x=>x.includes("Explain"))&&steps.some(x=>x.includes("Check")),prefix+"-"+lab+"-four-stage-flow",steps);
   await page.locator("#ss5-prediction").fill("ROC/pole prediction: test");
   await page.locator("#ss5-selfcheck").check();
   const range=page.locator('.lab .panel input[type="range"]').first();
   if(await range.count()){
    const change=await range.evaluate(el=>{
     const key=el.dataset.key,old=Number(el.value),min=Number(el.min),max=Number(el.max),step=Number(el.step)||1;
     const next=Math.abs(old-max)<step*.5?Math.max(min,old-step):Math.min(max,old+step);
     el.value=String(next);el.dispatchEvent(new Event("input",{bubbles:true}));
     const state=window.__laplaceVisualLab?.state?.[window.__laplaceVisualLab.active];
     return {key,old,next,actual:state?.[key]};
    });
    check(Math.abs(Number(change.actual)-change.next)<1e-7,prefix+"-"+lab+"-slider-updates-model",change);
   }
   check(await page.locator("#ss5-prediction").inputValue()==="ROC/pole prediction: test",prefix+"-"+lab+"-prediction-retained");
   check(await page.locator("#ss5-selfcheck").isChecked(),prefix+"-"+lab+"-check-retained");
   if(lab==="inverse"){
    const choice=page.locator('[data-compare="strip"]');
    check(await choice.count()===1,prefix+"-inverse-compare-card-exists");
    if(await choice.count()){
     await choice.click();
     check(await page.evaluate(()=>window.__laplaceVisualLab?.state?.inverse?.roc==="strip"),prefix+"-inverse-select-strip-ROC");
    }
   }
  }
  const review=page.locator("#ss5-progress button");
  // Mobile navigation intentionally hides the progress control; test its handler without a Playwright visibility timeout.
  if(await review.isVisible())await review.click();else await review.evaluate(el=>el.click());
  check(await page.evaluate(()=>JSON.parse(localStorage.getItem("els-ss-lab-progress-v1")||"[]").includes("5:8")),prefix+"-progress-recorded");
  if(await review.isVisible())await review.click();else await review.evaluate(el=>el.click());
  check(!(await page.evaluate(()=>JSON.parse(localStorage.getItem("els-ss-lab-progress-v1")||"[]").includes("5:8"))),prefix+"-progress-undo");
  await page.screenshot({path:output+"/ch5-"+prefix+".png",fullPage:false});
  check(errors.length===0,prefix+"-no-page-errors",errors.slice(0,5));
  await page.close();
 }
}finally{
 if(browser)await browser.close();
 if(server)server.kill();
}
const report={status:failures.length?"FAIL":"PASS",count:observations.length,failures,observations};
writeFileSync(output+"/results.json",JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({status:report.status,total:report.count,failures:failures.slice(0,25)}));
if(failures.length)process.exitCode=1;
