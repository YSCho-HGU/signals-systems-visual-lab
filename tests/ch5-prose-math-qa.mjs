#!/usr/bin/env node
/* Eight-Lab Chapter 5 math coverage: actual browser rendering after KaTeX load.
 * Only teaching prose and KaTeX nodes are checked, not select option strings.
 */
import {chromium} from "playwright";
import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
const PORT=8878,BASE=process.env.SS_BASE_URL||"http://127.0.0.1:"+PORT+"/";
const labs=["weight","roc","pairs","props","inverse","stability","rc","second"];
const output="qa-ch5-math";mkdirSync(output,{recursive:true});
let server,browser;const checks=[],failures=[];
const check=(id,ok,detail)=>{checks.push({id,ok:!!ok,detail});if(!ok)failures.push({id,detail})};
try{
 if(!process.env.SS_BASE_URL){server=spawn("python3",["-m","http.server",String(PORT),"--bind","127.0.0.1"],{stdio:"ignore"});await new Promise(r=>setTimeout(r,1100))}
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1366,height:850},colorScheme:"dark"});
 const runtime=[];page.on("pageerror",e=>runtime.push(String(e)));
 await page.goto(BASE+"chapter5.html",{waitUntil:"load"});
 await page.waitForFunction(()=>!!window.katex?.render&&!!window.ELSChapterFiveProseMath);
 check("math-engine",await page.evaluate(()=>!!window.ELSChapterFiveProseMath?.render&&!!window.ELSChapterFiveMath?.renderAll));

 const signed=await page.evaluate(()=>{
  const math=window.ELSChapterFiveMath, cases=[
   {p:-1.1,z:-2.1,expect:["s+2.10","s+1.10"]},
   {p:0.8,z:1.2,expect:["s-1.20","s-0.80"]},
   {p:0,z:0,expect:["{s}{s(s+4)}"]},
   {p:0.8,z:-4,expect:["s+4","s-0.80"]}
  ];
  return cases.map(({p,z,expect})=>{
   const steps=math.guides("stability",{p,z}),hero=math.hero("stability",{p,z});
   return {p,z,steps,hero,valid:expect.every(x=>steps[0].includes(x))&&
      !steps[0].includes("-(-")&&!hero.includes("-(-")};
  });
 });
 for(const item of signed)check("stability-natural-factor-p"+item.p+"-z"+item.z,item.valid,
  {hero:item.hero,first:item.steps[0]});
 const canceled=await page.evaluate(()=>window.ELSChapterFiveMath.guides("stability",{p:0.8,z:-4})[1]);
 check("stability-cancel-four-natural-factor",canceled.includes("s-0.80")&&!canceled.includes("s-p"),canceled);

 for(const lab of labs){
  await page.locator('#tabs [data-lab="'+lab+'"]').click();
  await page.waitForFunction(id=>window.__laplaceVisualLab?.active===id,lab);
  const snap=await page.evaluate(()=>{
   const text=sel=>[...document.querySelectorAll(sel)].map(e=>e.textContent).join(" ");
   const heading=document.querySelector(".heading p");
   const sections=[".heading p",".figure .sub",".reading-panel",".quiz",".derivation-panel"];
   const all=sections.map(selector=>({selector,katex:document.querySelectorAll(selector+" .katex").length,
    errors:document.querySelectorAll(selector+" .ss5-prose-math-error, "+selector+" [data-math-error]").length}));
   const prose=text(".heading p,.figure .sub,.reading-note p,.guide-check,.deriv-step p,.quiz p,.quiz .answer");
   return {heading:heading?.innerHTML.slice(0,190),headingMath:heading?.querySelectorAll(".katex").length,
      all,rawExponent:(prose.match(/e\^\([−-][^)]+\)/g)||[]).slice(0,7),
      rawRelation:(prose.match(/(?:<=|>=|&lt;|&gt;)/g)||[]).slice(0,7),
      mathFailures:document.querySelectorAll(".ss5-prose-math-error").length,
      guides:[...document.querySelectorAll(".deriv-math")].map(e=>e.dataset.mathRendered),
      plots:document.querySelectorAll(".plots canvas").length};
  });
  check(lab+"-heading-math",["weight","second"].includes(lab)?snap.headingMath>0:!!snap.heading,snap.heading);
  check(lab+"-caption-or-explanation-math",snap.all.some(x=>x.selector!==".heading p"&&x.katex>0),snap.all);
  check(lab+"-no-exponent-literals",snap.rawExponent.length===0,snap.rawExponent);
  check(lab+"-no-raw-comparators",snap.rawRelation.length===0,snap.rawRelation);
  check(lab+"-no-prose-math-error",snap.mathFailures===0,snap.mathFailures);
  check(lab+"-native-graphs",snap.plots>=2,snap.plots);
  await page.locator("#allSteps").click();
  const steps=await page.locator(".deriv-math").evaluateAll(nodes=>nodes.map(e=>({engine:e.dataset.mathRendered,error:e.dataset.mathError||"",katex:e.querySelectorAll(".katex").length})));
  check(lab+"-four-guided-formulas",steps.length===4&&steps.every(x=>x.engine==="katex"&&x.katex>0&&!x.error),steps);
 }
 check("no-page-errors",runtime.length===0,runtime.slice(0,8));
 await page.screenshot({path:output+"/eight-labs-math.png",fullPage:false});
 await page.close();
}catch(err){failures.push({id:"runner",detail:String(err.stack||err)})}
finally{if(browser)await browser.close();if(server)server.kill()}
const report={status:failures.length?"FAIL":"PASS",checks:checks.length,failures,items:checks};
writeFileSync(output+"/results.json",JSON.stringify(report,null,2));
console.log(JSON.stringify({status:report.status,checks:checks.length,failures:failures.slice(0,20)},null,2));
if(failures.length)process.exitCode=1;
