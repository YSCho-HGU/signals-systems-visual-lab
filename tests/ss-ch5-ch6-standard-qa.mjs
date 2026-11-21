#!/usr/bin/env node
/* Native Chapter 5/6 release contract.
 * Real browser computed styles, 5 palettes x 2 OS preferences x 2 chapters,
 * step badges, horizontal flow, persistence, reload and slider interaction.
 * Chromium always. Edge is additionally tested when msedge is installed.
 */
import {chromium} from "playwright";
import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
const PORT=8879,BASE=process.env.SS_BASE_URL||"http://127.0.0.1:"+PORT+"/";
const output="qa-ch5-ch6-standard/"+(process.env.SS_BROWSER_CHANNEL||"chromium");mkdirSync(output,{recursive:true});
const palettes={
 "neutral-dark":{page:"rgb(16, 16, 16)",surface:"rgb(28, 28, 28)"},
 "warm-dark":{page:"rgb(29, 35, 35)",surface:"rgb(41, 49, 48)"},
 "navy-dark":{page:"rgb(16, 24, 39)",surface:"rgb(28, 41, 58)"},
 "warm-neutral":{page:"rgb(247, 246, 242)",surface:"rgb(255, 254, 250)"},
 "white-clean":{page:"rgb(244, 246, 247)",surface:"rgb(255, 255, 255)"}
};
const findings=[],errors=[];const check=(name,ok,observed)=>{findings.push({name,pass:!!ok,observed});if(!ok)errors.push(name)};
const named=(ch,theme,os,k)=>"Ch"+ch+" "+theme+" / OS "+os+" / "+k;
const rgb=value=>{
 const t=/rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(value);
 return t?"rgb("+t.slice(1,4).join(", ")+")":value
};
let server,browser;
try{
 if(!process.env.SS_BASE_URL){server=spawn("python3",["-m","http.server",String(PORT),"--bind","127.0.0.1"],{stdio:"ignore"});await new Promise(r=>setTimeout(r,1100))}
 const channel=process.env.SS_BROWSER_CHANNEL||"chromium";
 browser=await chromium.launch(channel==="chromium"?{headless:true}:{headless:true,channel});
 for(const chapter of [5,6]){
  for(const os of ["dark","light"]){
   const context=await browser.newContext({viewport:{width:1366,height:850},colorScheme:os,reducedMotion:"reduce"});
   for(const [theme,colors] of Object.entries(palettes)){
    const page=await context.newPage();const runtimeErrors=[];page.on("pageerror",e=>runtimeErrors.push(e.message));
    await page.goto(BASE+"chapter"+chapter+".html",{waitUntil:"load",timeout:30000});
    await page.waitForSelector("[data-els-theme-picker]",{timeout:15000});
    const selector=page.locator("[data-els-theme-picker]").first();
    await selector.selectOption(theme);
    await page.waitForFunction(v=>document.documentElement.dataset.elsTheme===v,theme);
    const snapshot=await page.evaluate(chapter=>{
     const q=s=>document.querySelector(s),style=s=>{const el=q(s);return el?getComputedStyle(el):null};
     const card=chapter===5?".ss5-predict":".ss6-sequence-overview";
     return {root:document.documentElement.dataset.elsTheme,mode:document.documentElement.dataset.theme,
       colorScheme:getComputedStyle(document.documentElement).colorScheme,
       page:style("body")?.backgroundColor,
       card:style(card)?.backgroundColor,
       main:style(".main")?.backgroundColor,
       ink:style("body")?.color,
       htmlWidth:document.documentElement.scrollWidth,viewport:innerWidth,
       controls:q(chapter===5?".lab .controlgrid":".ss6-control-plot-workspace .control-grid")?.getBoundingClientRect().toJSON(),
       plots:q(chapter===5?".plots":".ss6-control-plot-workspace .charts")?.getBoundingClientRect().toJSON(),
       follow:q(chapter===5?".ss5-followup":".ss6-interpretation")?.getBoundingClientRect().toJSON(),
       stages:chapter===5?[...document.querySelectorAll(".ss5-flow-label")].map(e=>e.textContent.trim()):[...document.querySelectorAll(".ss6-step-card[data-ss6-step]")].map(e=>e.dataset.ss6Step)};
    },chapter);
    const id=k=>named(chapter,theme,os,k);
    check(id("selected-value"),snapshot.root===theme,snapshot.root);
    check(id("browser-OS-independent-page"),rgb(snapshot.page)===colors.page,snapshot.page);
    check(id("correct-surface"),rgb(snapshot.card)===colors.surface,snapshot.card);
    check(id("main-page-matches"),rgb(snapshot.main)===colors.page,snapshot.main);
    check(id("mode"),snapshot.mode===(["warm-neutral","white-clean"].includes(theme)?"light":"dark"),snapshot.mode);
    check(id("color-scheme"),snapshot.colorScheme.includes(["warm-neutral","white-clean"].includes(theme)?"light":"dark"),snapshot.colorScheme);
    check(id("horizontal-overflow"),snapshot.htmlWidth<=snapshot.viewport+8,[snapshot.htmlWidth,snapshot.viewport]);
    if(chapter===5){
     check(id("four-numbered-stages"),["Predict","Adjust","Observe","Explain"].every(v=>snapshot.stages.some(t=>t.includes(v))),snapshot.stages);
    }else{
     check(id("four-numbered-stages"),["1","2","3","4"].every(v=>snapshot.stages.includes(v)),snapshot.stages);
    }
    check(id("controls-and-plots"),!!snapshot.controls?.width&&!!snapshot.plots?.width,snapshot.controls);
    check(id("followup-extends-to-left"),!snapshot.follow||snapshot.follow.left<=snapshot.controls?.left+20,[snapshot.follow?.left,snapshot.controls?.left]);

    if(chapter===5){
     // Inspect every Chapter 5 experiment: the axis guidance was previously
     // hardcoded to a light background, even in Neutral/Warm/Navy Dark.
     for(const lab of ["weight","roc","pairs","props","inverse","stability","rc","second"]){
      await page.locator('#tabs [data-lab="'+lab+'"]').click();
      await page.waitForFunction(x=>window.__laplaceVisualLab?.active===x,lab);
      const a=await page.evaluate(()=>{
       const pick=sel=>{const el=document.querySelector(sel);if(!el)return null;
        const st=getComputedStyle(el),r=el.getBoundingClientRect();
        return {background:st.backgroundColor,color:st.color,border:st.borderTopColor,
         x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
       };
       return {axis:pick(".figure .axis-key"),hint:pick(".ss-hover-hint"),
        predict:pick("#page>.ss5-predict"),panel:pick(".lab>.panel"),
        outputs:pick(".lab>.outputs"),plots:pick(".lab .plots"),follow:pick("#page>.ss5-followup"),
        guide:pick(".deriv-math"),reading:pick(".reading-note"),button:pick(".guide-actions button"),
        bodySize:getComputedStyle(document.querySelector(".reading-note p")||document.querySelector(".heading p")).fontSize,
        bodyLine:getComputedStyle(document.querySelector(".reading-note p")||document.querySelector(".heading p")).lineHeight,
        steps:[...document.querySelectorAll(".ss5-flow-label")].map(el=>el.textContent.trim())};
      });
      check(id(lab+" axis-palette"),!!a.axis&&rgb(a.axis.background)===({"neutral-dark":"rgb(41, 41, 41)","warm-dark":"rgb(52, 65, 61)","navy-dark":"rgb(39, 57, 78)","warm-neutral":"rgb(237, 241, 235)","white-clean":"rgb(237, 242, 244)"}[theme]),a.axis);
      check(id(lab+" axis-legible"),!!a.axis&&rgb(a.axis.color)===({"neutral-dark":"rgb(240, 240, 237)","warm-dark":"rgb(229, 233, 227)","navy-dark":"rgb(237, 243, 250)","warm-neutral":"rgb(40, 49, 47)","white-clean":"rgb(27, 39, 48)"}[theme]),a.axis);
      check(id(lab+" predict-full-width-above"),!!a.predict&&!!a.panel&&!!a.plots&&
       a.predict.x<=a.panel.x+4&&a.predict.right>=a.plots.right-4&&
       a.predict.bottom<=a.panel.y+4&&a.predict.bottom<=a.plots.y+4,[a.predict,a.panel,a.plots]);
      check(id(lab+" controls-plots-parallel"),!!a.panel&&!!a.plots&&
       a.panel.right<=a.outputs.x+4&&Math.abs(a.panel.y-a.outputs.y)<24,[a.panel,a.outputs]);
      check(id(lab+" derivation-full-left"),!!a.follow&&!!a.panel&&
       a.follow.x<=a.panel.x+4&&a.follow.width>=a.plots.right-a.panel.x-8,[a.follow,a.panel]);
      check(id(lab+" four-stages"),["Predict","Adjust","Observe","Explain"].every(z=>a.steps.some(t=>t.includes(z))),a.steps);
      check(id(lab+" body-size-6.1"),parseFloat(a.bodySize)>=16&&parseFloat(a.bodyLine)>=25,[a.bodySize,a.bodyLine]);
      check(id(lab+" reading-theme"),!!a.reading&&rgb(a.reading.background)===colors.surface,a.reading);
      check(id(lab+" derivation-ink"),!!a.guide&&a.guide.color===({"neutral-dark":"rgb(240, 240, 237)","warm-dark":"rgb(229, 233, 227)","navy-dark":"rgb(237, 243, 250)","warm-neutral":"rgb(40, 49, 47)","white-clean":"rgb(27, 39, 48)"}[theme]),a.guide);
      if(["roc","pairs","props","inverse","stability","second"].includes(lab)){
       const px=await page.locator("#plot1").evaluate(canvas=>{
        const x=Math.round(canvas.width*.79),y=Math.round(canvas.height*.36);
        const data=canvas.getContext("2d").getImageData(x,y,1,1).data;
        return {rgb:[data[0],data[1],data[2]],location:[x,y]};
       });
       const dark=["neutral-dark","warm-dark","navy-dark"].includes(theme);
       const brightness=px.rgb.reduce((sum,v)=>sum+v,0)/3;
       check(id(lab+" ROC-canvas-palette"),dark?brightness<145:brightness>170,{...px,brightness,dark});
      }

     }
    }
    const oldTheme=await page.evaluate(()=>localStorage.getItem("els-theme-v2"));
    check(id("stored-theme"),oldTheme===theme,oldTheme);
    await page.reload({waitUntil:"load"});
    await page.waitForFunction(v=>document.documentElement.dataset.elsTheme===v,theme);
    check(id("reload-persists"),await page.locator("[data-els-theme-picker]").first().inputValue()===theme);
    const slider=chapter===5?'.panel input[type="range"]':'.ss6-control-plot-workspace input[type="range"]';
    if(await page.locator(slider).count()){
     const value=await page.locator(slider).first().evaluate(el=>{
      const prior=Number(el.value),min=Number(el.min),max=Number(el.max),step=Number(el.step)||1;
      const newValue=Math.min(max,prior+step)<=prior?Math.max(min,prior-step):prior+step;
      el.value=String(newValue);el.dispatchEvent(new Event("input",{bubbles:true}));
      return {prior,newValue,actual:Number(el.value)};
     });
     check(id("slider-operable"),value.actual===value.newValue,value);
    }else check(id("slider-present"),false);
    check(id("runtime-errors"),runtimeErrors.length===0,runtimeErrors.slice(0,4));
    if((theme==="white-clean"||theme==="neutral-dark")&&os==="dark"){
     await page.screenshot({path:output+"/ch"+chapter+"-"+theme+"-os"+os+".png",fullPage:false});
    }
    await page.close();
   }
   await context.close();
  }
 }
} catch(e){errors.push("RUNNER: "+String(e.stack||e))}
finally{if(browser)await browser.close();if(server)server.kill()}
const result={status:errors.length?"FAIL":"PASS",engine:process.env.SS_BROWSER_CHANNEL||"chromium",checks:findings.length,failures:errors,findings};
writeFileSync(output+"/results.json",JSON.stringify(result,null,2));
console.log(JSON.stringify({status:result.status,checks:result.checks,failures:errors.slice(0,30)},null,2));
if(errors.length)process.exitCode=1;
