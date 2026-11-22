/* Chapter 7 native responsive browser regression.
 * The former iframe-based 7.1 test was superseded by chapter7.html native lessons.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const port=8768,base=process.env.SS_BASE_URL||'http://127.0.0.1:'+port+'/';
const server=process.env.SS_BASE_URL?null:spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{stdio:'ignore'});
if(server)await new Promise(resolve=>setTimeout(resolve,1000));
const browser=await chromium.launch({headless:true}),failures=[];
mkdirSync('qa-ch7',{recursive:true});
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport});
  page.on('pageerror',err=>failures.push(viewport.width+': JS '+err.message));
  try{
   const response=await page.goto(base+'chapter7.html',{waitUntil:'domcontentloaded',timeout:45000});
   if(response.status()!==200)throw Error('HTTP '+response.status());
   const nav=page.locator('#ss7-lesson-nav button');
   await nav.first().waitFor({state:'attached',timeout:20000});
   const count=await nav.count();if(count!==7)throw Error('Expected 7 native lessons, found '+count);
   for(let index=0;index<count;index++){
    await nav.nth(index).click();
    await page.waitForTimeout(120);
    const content=await page.locator('.ss7-workspace').innerText();
    if(content.length<100)throw Error('Lesson '+(index+1)+' content missing');
    if(index===0){
     const graphs=await page.locator('.ss7-workspace svg:visible').count();
     if(graphs<1)throw Error('Lesson 7.1 plot missing');
     const slider=page.locator('.ss7-workspace input[type="range"]:visible').first();
     if(await slider.count()){
      const before=await slider.inputValue();
      await slider.evaluate(el=>{
       const min=Number(el.min),max=Number(el.max),step=Number(el.step)||1;
       const value=Math.min(max,Math.max(min,Number(el.value)+step));
       el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));
       el.dispatchEvent(new Event('change',{bubbles:true}));
      });
      if(!(await slider.inputValue()))throw Error('Slider not functional: '+before);
     }
    }
   }
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+8);
   if(overflow)throw Error('Horizontal overflow at '+viewport.width+'px');
   await page.screenshot({path:'qa-ch7/chapter7-native-'+viewport.width+'.png',fullPage:false});
   console.log('PASS Chapter 7 native lessons: '+count+', viewport '+viewport.width);
  }catch(e){failures.push(viewport.width+': '+e.stack)}
  finally{await page.close()}
 }
}finally{await browser.close();server?.kill()}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1}
