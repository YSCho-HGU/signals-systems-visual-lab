/* Chapter 5-8 guide-card layout and tri-language browser audit.
 * Run with: SS_BASE_URL=https://yscho-hgu.github.io/signals-systems-visual-lab/ node tests/ss-guide-card-layout-language-e2e.mjs
 * Local default: http://127.0.0.1:8793/
 */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const external=!!process.env.SS_BASE_URL;
const base=process.env.SS_BASE_URL||'http://127.0.0.1:8793/';
const server=external?null:spawn('python3',['-m','http.server','8793','--bind','127.0.0.1'],{stdio:'ignore'});
if(server)await new Promise(r=>setTimeout(r,1200));
const browser=await chromium.launch({headless:true});
const dir='qa-guide-card-language';mkdirSync(dir,{recursive:true});
const nav={5:'#tabs button',6:'#app .sidebar .nav button',7:'#ss7-lesson-nav button',8:'#nav button'};
const guides='.insight,.learning,.reading .note,.step,.question,.quiz,.ss-found-intro,.ss-learning-bridge,.ss-guide-card,.ss-learning-card';
const visuals='.plot-card,.plotbox,.figure,.formula,.hero-callout,.katex-display,.math';
const results=[];
function safe(s){return s.replace(/[^a-z0-9_-]/gi,'-')}
try{
 for(const ch of [5,6,7,8])for(const mode of ['mixed','en','ko'])for(const width of [1440,768,390]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push('runtime: '+e.message));
  await page.addInitScript(({language})=>{localStorage.setItem('els-language',language);localStorage.setItem('els-theme-v2','white-clean');localStorage.setItem('ss-sidebar-collapsed-v1','1')},{language:mode});
  try{
   await page.goto(base+'chapter'+ch+'.html',{waitUntil:'load',timeout:45000});
   await page.waitForTimeout(250);
   const buttons=page.locator(nav[ch]);const count=await buttons.count();
   if(!count)errors.push('no sections detected');
   for(let section=0;section<count;section++){
    try{
     await buttons.nth(section).click({timeout:10000});
     await page.waitForTimeout(150);
     const sample=await page.evaluate(({guideSelector,visualSelector,mode})=>{
      const visible=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>1&&r.height>1};
      const box=e=>e.getBoundingClientRect();
      const intersection=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
      const gs=[...document.querySelectorAll(guideSelector)].filter(visible);
      const vs=[...document.querySelectorAll(visualSelector)].filter(visible);
      const hits=[];
      for(const [i,g] of gs.entries()){
       const r=box(g);
       if(g.scrollWidth>g.clientWidth+6)hits.push({type:'guide-overflow',index:i,px:g.scrollWidth-g.clientWidth});
       for(const [j,v] of vs.entries()){
        if(g.contains(v)||v.contains(g))continue;
        const overlap=intersection(r,box(v));
        if(overlap>25)hits.push({type:'guide-visual-overlap',guide:i,visual:j,area:Math.round(overlap)});
       }
      }
      const body=document.querySelector('.ss-layout-root')||document.querySelector('.main')||document.querySelector('main')||document.body;
      if(document.documentElement.scrollWidth>innerWidth+8)hits.push({type:'horizontal-page-overflow',px:document.documentElement.scrollWidth-innerWidth});
      const walker=document.createTreeWalker(body,NodeFilter.SHOW_TEXT);
      let korean=0,english=0,examples=[];
      while(walker.nextNode()){
       const el=walker.currentNode.parentElement;
       if(!el||el.closest('script,style,svg,textarea,[hidden],[aria-hidden="true"],.katex'))continue;
       if(!visible(el))continue;
       const txt=walker.currentNode.nodeValue.trim();
       if(!txt)continue;
       if(/[가-힣]/.test(txt)){korean++;if(mode==='en'&&examples.length<8)examples.push(txt.slice(0,120))}
       if(/[A-Za-z]{4,}/.test(txt))english++;
      }
      if(mode==='en'&&korean)hits.push({type:'untranslated-korean',nodes:korean,examples});
      if(mode==='mixed'&&gs.length&&korean===0)hits.push({type:'mixed-no-visible-korean'});
      if(mode==='ko'&&gs.length&&korean===0)hits.push({type:'korean-mode-no-visible-korean'});
      const broken=[...document.querySelectorAll('.katex-error')].filter(visible).length;
      if(broken)hits.push({type:'katex-error',count:broken});
      return {guides:gs.length,visuals:vs.length,korean,english,hits};
     },{guideSelector:guides,visualSelector:visuals,mode});
     results.push({chapter:ch,section:section+1,sections:count,mode,width,...sample});
     if(sample.hits.length){
      const file=dir+'/ch'+ch+'-s'+(section+1)+'-'+mode+'-'+width+'.png';
      if(results.filter(x=>x.hits?.length).length<=35)await page.screenshot({path:file,fullPage:true});
     }
    }catch(e){results.push({chapter:ch,section:section+1,mode,width,hits:[{type:'section-failed',message:String(e)}]})}
   }
  }catch(e){errors.push(String(e))}
  if(errors.length)results.push({chapter:ch,mode,width,hits:errors.map(message=>({type:'page-error',message}))});
  await page.close();
 }
}finally{await browser.close();if(server)server.kill()}
writeFileSync(dir+'/results.json',JSON.stringify({base,generatedAt:new Date().toISOString(),results},null,2));
const failures=results.filter(r=>r.hits.length);
console.log('Guide-card and language QA: '+(results.length-failures.length)+'/'+results.length+' records passed; '+failures.length+' failed');
for(const r of failures.slice(0,50))console.log(JSON.stringify(r));
if(failures.length)process.exitCode=1;
