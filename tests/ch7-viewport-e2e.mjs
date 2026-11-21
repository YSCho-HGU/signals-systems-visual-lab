#!/usr/bin/env node
/* Chapter 7 native regression: compare Chapter 5 shell contract; cover all seven lessons. */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const base=process.env.SS_BASE_URL||'http://127.0.0.1:8765/';
const widths=[390,900,1280,1440];
const themes=['white-clean','neutral-dark'];
const checks=[],failures=[];let server,browser;
function check(label,ok,data){checks.push({label,pass:Boolean(ok),data});if(!ok)failures.push({label,data})}
function snapshot(page){return page.evaluate(()=>{
 const root=document.documentElement,stage=document.querySelector('.ss7-standard-layout'),pair=document.querySelector('.ss7-stage-pair');
 const change=document.querySelector('.ss7-stage-change'),observe=document.querySelector('.ss7-stage-observe'),explain=document.querySelector('.ss7-stage-explain');
 const rect=x=>x?.getBoundingClientRect().toJSON();
 return {ready:!!window.__ss7Standard?.ready,lab:window.SSChapter7?.currentExperiment,iframe:document.querySelectorAll('iframe').length,
 plots:document.querySelectorAll('#plots .plot-card svg').length,series:document.querySelectorAll('#plots svg polyline,#plots svg path').length,
 panels:[...document.querySelectorAll('.ss7-stage-head')].map(x=>x.textContent.trim()),
 stage:rect(stage),pair:rect(pair),change:rect(change),observe:rect(observe),explain:rect(explain),
 supplementary:rect(document.querySelector('.ss7-periodicity')),content:document.querySelector('#insight')?.textContent?.length,
 documentWidth:root.scrollWidth,viewport:innerWidth,theme:root.dataset.elsTheme,
 unsupportedTopBar:!!document.querySelector('.ss7-topbar'),sidebar:!!document.querySelector('#ss7-lesson-nav'),
 navCount:document.querySelectorAll('#ss7-lesson-nav button').length,
 currentNav:document.querySelectorAll('#ss7-lesson-nav button[aria-current="true"]').length};
})}
try{
 if(!process.env.SS_BASE_URL){server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});await new Promise(r=>setTimeout(r,1200))}
 browser=await chromium.launch({headless:true});
 for(const width of widths){
  const page=await browser.newPage({viewport:{width,height:820},deviceScaleFactor:1,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'chapter7.html',{waitUntil:'load'});
  await page.waitForFunction(()=>window.__ss7Standard?.ready&&window.__ss7Native?.ready,{timeout:20000});
  const initial=await snapshot(page);
  check(width+' native shell',initial.ready&&initial.iframe===0&&initial.sidebar&&initial.navCount===7&&!initial.unsupportedTopBar,initial);
  check(width+' initial graph visible without touching controls',initial.plots>0&&initial.content>10&&initial.series>0,initial);
  check(width+' shared palette loaded before plot computation',await page.evaluate(()=>typeof window.ssTraceColor==='function'));
  check(width+' shared numbered stages',initial.panels.length===4&&initial.panels.every((v,i)=>v.startsWith(String(i+1))),initial.panels);
  check(width+' audited equation dataset',await page.evaluate(()=>window.__ss7EquationAudit?.formulas===28));
  const initialKey=await page.evaluate(()=>{
   const host=document.getElementById('ss7-key-equation');
   const card=document.querySelector('.ss7-key-formula');
   const style=host&&getComputedStyle(host);
   return {count:document.querySelectorAll('#ss7-key-equation .katex').length,
    font:style?parseFloat(style.fontSize):0,scroll:style?.overflowX,
    between:!!(card&&card.previousElementSibling?.classList.contains('ss7-chapter-lead')
      &&card.nextElementSibling?.classList.contains('ss7-stage-predict'))};
  });
  check(width+' Chapter 5-style key relation under the lesson introduction',
    initialKey.between&&initialKey.count===1&&initialKey.font>=18&&initialKey.scroll==='auto',initialKey);
  await page.waitForFunction(()=>window.__ss7ProseMath&&document.querySelectorAll('#insight .ss7-prose-math .katex').length>0,{timeout:15000});
  check(width+' prose math renderer loaded',await page.evaluate(()=>window.__ss7ProseMath?.rendered>0));
  check(width+' math renderer has no failed expressions',await page.evaluate(()=>window.__ss7ProseMath?.failed===0));
  check(width+' no horizontal overflow',initial.documentWidth<=width+6,initial.documentWidth);
  const typography=await page.evaluate(()=>{
    const css=x=>{const n=document.querySelector(x);return n?getComputedStyle(n):null};
    const header=css('.ss7-stage-head'),intro=css('#intro'),label=css('.control label'),plot=css('#plots svg'),title=css('#title');
    return {header:parseFloat(header?.fontSize||'0'),intro:parseFloat(intro?.fontSize||'0'),label:parseFloat(label?.fontSize||'0'),
      title:parseFloat(title?.fontSize||'0'),svgHeight:document.querySelector('#plots svg')?.getBoundingClientRect().height||0};
  });
  check(width+' Chapter 5-equivalent title and body sizes',typography.title>=21&&typography.intro>=16,typography);
  check(width+' readable stage-heading size',typography.header>=18,typography);
  check(width+' readable control size',typography.label>=14,typography);
  if(width>=900)check(width+' chart legibility',typography.svgHeight>=150,typography);
  for(const theme of themes){
   await page.locator('#ss7-theme-picker').selectOption(theme);
   check(width+' theme '+theme,await page.evaluate(()=>document.documentElement.dataset.elsTheme)===theme);
   for(let index=1;index<=7;index++){
    await page.locator('#ss7-lesson-nav button').nth(index-1).click();
    await page.waitForFunction(n=>window.SSChapter7?.currentExperiment===n,index);
    const before=await snapshot(page);
    check(width+'/'+theme+'/lesson'+index+' stage and plot',before.ready&&before.panels.length===4&&before.plots>0&&before.content>10&&before.currentNav===1,before);
    check(width+'/'+theme+'/lesson'+index+' guided formula present',await page.locator('#step-content .step .math').count()===1&&Boolean((await page.locator('#step-content .step .math').textContent())?.trim()));
    await page.waitForFunction(()=>document.querySelectorAll('#insight .ss7-prose-math .katex').length>0,{timeout:10000});
    check(width+'/'+theme+'/lesson'+index+' prose equations typeset',
      await page.locator('#insight .ss7-prose-math .katex').count()>0);
    const equationCount=await page.locator('#step-content .step .math .katex').count();
    check(width+'/'+theme+'/lesson'+index+' guided derivation typeset',equationCount===1,equationCount);
    const mathVisual=await page.evaluate(()=>{
     const key=document.getElementById('ss7-key-equation');
     const step=document.querySelector('#step-content .step .math');
     const keyStyle=key?getComputedStyle(key):null;
     const mathStyle=step?getComputedStyle(step):null;
     const card=document.querySelector('.ss7-key-formula');
     const rect=x=>x?.getBoundingClientRect();
     const kr=rect(key),sr=rect(step),cr=rect(card);
     return {
      rendered:key?.querySelectorAll('.katex').length||0,
      chapter:key?.dataset.ss7Key,
      aria:key?.getAttribute('aria-label')||'',
      keyFont:keyStyle?parseFloat(keyStyle.fontSize):0,
      stepFont:mathStyle?parseFloat(mathStyle.fontSize):0,
      keyScroll:keyStyle?.overflowX,
      stepScroll:mathStyle?.overflowX,
      withinCard:!!(kr&&cr&&kr.left>=cr.left&&kr.right<=cr.right+2),
      keyBeforeDerivation:!!(kr&&sr&&kr.bottom<sr.top)
     };
    });
    check(width+'/'+theme+'/lesson'+index+' lesson-specific key equation and alignment',
      mathVisual.rendered===1&&mathVisual.chapter===String(index)&&mathVisual.aria.length>8
      &&mathVisual.withinCard&&mathVisual.keyBeforeDerivation,mathVisual);
    check(width+'/'+theme+'/lesson'+index+' Chapter 5-equivalent math sizes',
      mathVisual.keyFont>=18&&mathVisual.keyFont<=22.5&&mathVisual.stepFont>=18&&mathVisual.stepFont<=22.5
      &&mathVisual.keyScroll==='auto'&&mathVisual.stepScroll==='auto',mathVisual);
    if(width===1280&&theme==='neutral-dark'){
      mkdirSync('qa-ch7/screens',{recursive:true});
      await page.screenshot({path:'qa-ch7/screens/ch7-'+index+'-native-math.png',fullPage:false});
    }
    // Exercise every derivation, not just the first one, in each of the 7 labs.
    for(let step=2;step<=4;step++){
      await page.locator('#next').click();
      await page.waitForFunction(n=>document.querySelector('#step-num')?.textContent?.includes('Step '+n+' /')&&document.querySelectorAll('#step-content .step .math .katex').length===1,step,{timeout:9000});
      const rendered=await page.locator('#step-content .step .math .katex').count();
      check(width+'/'+theme+'/lesson'+index+' step'+step+' TeX output',rendered===1,rendered);
    }
    await page.locator('#all').click();
    await page.waitForFunction(()=>document.querySelectorAll('#step-content .step .math .katex').length===4,{timeout:9000});
    check(width+'/'+theme+'/lesson'+index+' all 4 derivations',
      await page.locator('#step-content .step .math .katex').count()===4);
    check(width+'/'+theme+'/lesson'+index+' complete prose math in live insight',
      await page.locator('#insight .ss7-prose-math .katex').count()>0);
    check(width+'/'+theme+'/lesson'+index+' KaTeX/inline parser no failures',
      await page.evaluate(()=>window.__ss7ProseMath?.failed===0&&document.querySelectorAll('.katex-error,.ss7-prose-math-error').length===0));

    check(width+'/'+theme+'/lesson'+index+' no KaTeX parse errors',
      await page.evaluate(()=>!document.querySelector('.katex-error')&&window.__ss7ProseMath?.failed===0));
    const mathSize=await page.locator('#step-content .step .math').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
    check(width+'/'+theme+'/lesson'+index+' equation legibility',mathSize>=17,mathSize);
    check(width+'/'+theme+'/lesson'+index+' overflow',before.documentWidth<=width+6,before.documentWidth);
    if(width>760){
     check(width+'/'+theme+'/lesson'+index+' change and observe aligned',
      Math.abs(before.change.y-before.observe.y)<8&&before.change.x<before.observe.x,before);
    }else{
     check(width+'/'+theme+'/lesson'+index+' mobile stack',before.observe.y>=before.change.y+before.change.height-8,before);
    }
    check(width+'/'+theme+'/lesson'+index+' explain below pair',
      before.explain.y>=before.pair.y+before.pair.height-8,before);
    const slider=page.locator('#controls input[type="range"]').first();
    if(await slider.count()){
     const outputBefore=await page.locator('#insight').textContent();
     await slider.evaluate(el=>{el.value=el.max===el.value?el.min:el.max;el.dispatchEvent(new Event('input',{bubbles:true}))});
     const outputAfter=await page.locator('#insight').textContent();
     check(width+'/'+theme+'/lesson'+index+' reactive update',outputBefore!==outputAfter);
    }
   }
  }
  check(width+' no JS exceptions',errors.length===0,errors);
  if(width===1280){
   await page.locator('#ss7-lesson-nav button').first().click();
   await page.locator('#ss7-mark-reviewed').click();
   check('progress state persisted',await page.evaluate(()=>JSON.parse(localStorage.getItem('els-ss-lab-progress-v1')||'[]').includes('7:1')));
   await page.reload();await page.waitForFunction(()=>window.__ss7Native?.ready);
   check('progress state survives reload',await page.locator('#ss7-mark-reviewed').getAttribute('aria-pressed')==='true');
   await page.locator('#ss7-mark-reviewed').click();
  }
  await page.close();
 }
}finally{if(browser)await browser.close();if(server)server.kill()}
mkdirSync('qa-ch7',{recursive:true});
writeFileSync('qa-ch7/report.json',JSON.stringify({checks:checks.length,failures},null,2));
console.log(JSON.stringify({checks:checks.length,failures:failures.slice(0,25)},null,2));
if(failures.length)process.exitCode=1;
