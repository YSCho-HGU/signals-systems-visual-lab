/* Full Chapter 1-8 visual navigation and theme regression.
 * Run from repository root: npm run qa:navigation:visual
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
const base=process.env.SS_BASE_URL||'http://127.0.0.1:8788/';
const own=!process.env.SS_BASE_URL;
const server=own?spawn('python3',['-m','http.server','8788','--bind','127.0.0.1'],{stdio:'ignore'}):null;
const folder='qa-navigation';mkdirSync(folder,{recursive:true});
if(own)await new Promise(r=>setTimeout(r,1250));
const browser=await chromium.launch({headless:true});
const results=[];
function record(ok,name,details=''){results.push({pass:!!ok,name,details});console.log((ok?'PASS ':'FAIL ')+name+(details?' '+details:''))}
const selectors={
 1:['#ch1-app>.sidebar','#ch1-app>.sidebar nav#nav button','#ch1-app>.sidebar .num'],
 2:['.app>.sidebar','.app>.sidebar nav.nav button','.app>.sidebar .num'],
 3:['.app>.sidebar','.app>.sidebar nav.nav button','.app>.sidebar .num'],
 4:['.app>.sidebar','.app>.sidebar nav.nav button','.app>.sidebar .num'],
 5:['.shell>aside.nav','.shell .tabs button','.shell .tabs .num'],
 6:['.app>.sidebar','.app>.sidebar nav.nav button','.app>.sidebar .num'],
 7:['.ss7-sidebar','#ss7-lesson-nav button','.ss7-lab-number'],
 8:['.ss8-sidebar','#nav button','.ss8-lab-number']
};
function luminance(rgb){
 const a=(rgb.match(/[\d.]+/g)||[]).slice(0,3).map(v=>{
  const n=Number(v)/255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)
 });
 return a[0]*.2126+a[1]*.7152+a[2]*.0722
}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
try{
 for(const width of [1440,980]){
  for(let ch=1;ch<=8;ch++){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   page.on('pageerror',e=>record(false,'chapter-'+ch+'-page-error',e.message));
   await page.addInitScript(()=>{try{localStorage.setItem('els-theme-v2','neutral-dark');localStorage.setItem('ss-sidebar-collapsed-v1','0')}catch{}});
   await page.goto(base+'chapter'+ch+'.html',{waitUntil:'domcontentloaded',timeout:45000});
   const [side,buttons,badge]=selectors[ch];
   try{
    await page.locator(buttons).first().waitFor({state:'visible',timeout:25000});
    await page.locator('.ss-side-toggle').waitFor({state:'visible',timeout:12000});
    const before=await page.evaluate(({side,buttons,badge})=>{
     const el=document.querySelector(side),button=document.querySelector(buttons),num=document.querySelector(badge);
     const panel=el?.parentElement?.querySelector(':scope > main, :scope > .ss7-workspace, :scope > .ss8-workspace, :scope > .ss-found-four-step');
     const chosen=document.querySelector(buttons+'[aria-current="page"],'+buttons+'[aria-current="true"],'+buttons+'.on,'+buttons+'.active')||button;
     const x=getComputedStyle(chosen);
     return {
      width:el?.getBoundingClientRect().width||0,number:num?.textContent?.trim()||'',
      font:parseFloat(getComputedStyle(button).fontSize),
      panelWidth:panel?.getBoundingClientRect().width||0,
      foreground:x.color,background:x.backgroundColor,
      overflow:document.documentElement.scrollWidth-innerWidth
     };
    },{side,buttons,badge});
    record(before.width>=160&&before.width<=270,'ch'+ch+'-'+width+'-expanded-width',JSON.stringify(before.width));
    const layout=await page.evaluate(({side,ch})=>{
      const aside=document.querySelector(side);
      const root=aside?.parentElement;
      const content=ch===1?document.querySelector('#ch1-app>.ss-ch1-workspace'):
        ch===7?document.querySelector('.ss7-workspace>main'):
        ch===8?document.querySelector('.ss8-workspace>main'):
        root?.querySelector(':scope>.main');
      const ar=aside?.getBoundingClientRect(),mr=content?.getBoundingClientRect();
      const style=content?getComputedStyle(content):null;
      const nav=aside?.querySelector('nav');
      return {
        rail:ar?.width||0,
        bodyStart:mr?.left||0,
        bodyRight:mr?.right||0,
        padTop:parseFloat(style?.paddingTop||'0'),
        padLeft:parseFloat(style?.paddingLeft||'0'),
        padRight:parseFloat(style?.paddingRight||'0'),
        gap:nav?getComputedStyle(nav).rowGap:'',
        first:content?.firstElementChild?.tagName||'',
        available:!!content
      };
    },{side,ch});
    record(layout.available&&layout.bodyStart>=layout.rail-2&&layout.bodyRight<=width+2,
      'ch'+ch+'-'+width+'-chapter5-content-alignment',JSON.stringify(layout));
    record(Math.abs(layout.padTop-(width<=780?12:15))<1&&Math.abs(layout.padLeft-layout.padRight)<1,
      'ch'+ch+'-'+width+'-chapter5-content-padding',JSON.stringify(layout));
    record(layout.gap==='5px','ch'+ch+'-'+width+'-chapter5-nav-gap',layout.gap);
    const inner=await page.evaluate((ch)=>{
      const cardSelector={
        1:'.ss-found-four-step .ss-found-observe',
        2:'.ss-found-four-step .ss-found-observe',
        3:'.ss-found-four-step .ss-found-observe',
        4:'.ss-found-four-step .ss-found-observe',
        5:'#page .panel',
        6:'.ss6-step-card',
        7:'.ss7-card',
        8:'.ss8-card'
      }[ch];
      const graphSelector={
        1:'.ss-found-observe .plotbox',
        2:'.ss-found-observe .figure',
        3:'.ss-found-observe .figure',
        4:'.ss-found-observe .figure',
        5:'#page .figure',
        6:'.ss6-control-plot-workspace .figure',
        7:'.ss7-stage-observe #plots .plot-card',
        8:'.ss8-stage-observe #plots .plot-card'
      }[ch];
      const measure=(el)=>{
        if(!el)return null;
        const c=getComputedStyle(el);
        return {top:parseFloat(c.paddingTop),left:parseFloat(c.paddingLeft),
          radius:parseFloat(c.borderTopLeftRadius),width:el.getBoundingClientRect().width};
      };
      const card=document.querySelector(cardSelector);
      const graph=document.querySelector(graphSelector);
      const title=ch>=7?graph?.querySelector('.plot-title'):null;
      return {card:measure(card),graph:measure(graph),
        title:measure(title),
        chartCount:document.querySelectorAll(graphSelector).length};
    },ch);
    record(inner.card?.radius===12,'ch'+ch+'-'+width+'-chapter5-card-corners',JSON.stringify(inner));
    record(inner.card?.top===14,'ch'+ch+'-'+width+'-chapter5-card-padding',JSON.stringify(inner));
    record(inner.graph?.radius===12,'ch'+ch+'-'+width+'-chapter5-graph-corners',JSON.stringify(inner));
    record(ch>=7?(inner.title?.left===12):(inner.graph?.left===(width<=780?11:12)),
      'ch'+ch+'-'+width+'-chapter5-graph-padding',JSON.stringify(inner));


    record(before.number==='01','ch'+ch+'-'+width+'-two-digit-first-number',before.number);
    if(ch===1){
     const names=await page.locator('#ch1-app>.sidebar .tabname').allTextContents();
     record(names.length===9&&names[1]==='Step, Impulse & Ramp'&&names[8]==='Sensor-to-Digital Chain','ch1-'+width+'-revised-lesson-titles',JSON.stringify(names));
     record(!names.some(name=>/^Elementary$/.test(name)),'ch1-'+width+'-no-ambiguous-elementary');
     const navReadability=await page.evaluate(()=>{
       const rail=document.querySelector('#ch1-app>.sidebar');
       const brand=rail.querySelector('.brand');
       const heading=rail.querySelector('.navlabel');
       const title=brand.querySelector('h1');
       const nav=rail.querySelector('#nav');
       const buttons=[...nav.querySelectorAll('button')];
       const rect=e=>e.getBoundingClientRect();
       const hr=rect(heading),br=rect(brand),nr=rect(nav);
       return {
         headingText:heading.textContent.trim(),headingHeight:hr.height,
         headingFits:heading.scrollWidth<=heading.clientWidth+1,
         brandHeight:br.height,brandTitle:title.textContent.trim(),
         headingBeforeNav:hr.bottom<=nr.top+2,
         labelFonts:buttons.map(b=>parseFloat(getComputedStyle(b.querySelector('.tabname')).fontSize)),
         menuWrap:buttons.filter(b=>b.scrollWidth>b.clientWidth+2).length
       };
     });
     record(navReadability.headingText==='LEARNING EXPERIMENTS'&&navReadability.headingFits&&navReadability.headingBeforeNav,
       'ch1-'+width+'-chapter5-sidebar-section-heading',JSON.stringify(navReadability));
     record(navReadability.labelFonts.every(x=>x>=12)&&navReadability.menuWrap===0,
       'ch1-'+width+'-chapter5-typography-no-overflow',JSON.stringify(navReadability));

     const shape=await page.evaluate(()=>{
       const app=document.querySelector('#ch1-app');
       const sidebar=app?.querySelector(':scope > aside.sidebar');
       const main=app?.querySelector(':scope > .main');
       const first=sidebar?.querySelector('#nav button');
       const num=first?.querySelector('.num');
       return {app:app?.tagName,sidebar:!!sidebar,main:!!main,firstNumber:num?.textContent,
         class:sidebar?.className,navLayout:getComputedStyle(sidebar?.querySelector('#nav')).flexDirection,
         positions:{sidebar:sidebar?.getBoundingClientRect().left,main:main?.getBoundingClientRect().left}};
     });
     record(shape.sidebar&&shape.main&&shape.navLayout==='column'&&shape.firstNumber==='01'
        &&shape.positions.main>shape.positions.sidebar,'ch1-'+width+'-chapter4-native-sidebar-structure',JSON.stringify(shape));
    }
    record(before.font>=12&&before.font<=14,'ch'+ch+'-'+width+'-nav-font',String(before.font));
    record(before.overflow<15,'ch'+ch+'-'+width+'-no-horizontal-overflow',String(before.overflow));
    record(contrast(before.foreground,before.background)>=4.5,'ch'+ch+'-'+width+'-selected-contrast',String(contrast(before.foreground,before.background).toFixed(2)));
    await page.locator('.ss-side-toggle').click();
    const after=await page.evaluate(({side})=>{
     const el=document.querySelector(side);
     return {width:el.getBoundingClientRect().width,grid:getComputedStyle(el.parentElement).gridTemplateColumns};
    },{side});
    record(after.width<=60,'ch'+ch+'-'+width+'-collapsed-width',JSON.stringify(after));
    record(after.grid.startsWith('52px'),'ch'+ch+'-'+width+'-collapsed-grid',after.grid);
    const menu=page.locator('.ss-common-menu');
    await menu.locator('summary').click();
    const links=menu.locator('.ss-common-links a');
    record(await links.count()===10,'ch'+ch+'-'+width+'-menu-10-entries');
    await links.first().hover();
    const dropdown=await links.first().evaluate(el=>{
      const cs=getComputedStyle(el);
      return {fg:cs.color,bg:cs.backgroundColor}
    });
    record(contrast(dropdown.fg,dropdown.bg)>=4.5,'ch'+ch+'-'+width+'-dropdown-contrast',String(contrast(dropdown.fg,dropdown.bg).toFixed(2)));
    await page.screenshot({path:folder+'/ch'+ch+'-'+width+'.png'});
   }catch(e){record(false,'ch'+ch+'-'+width+'-setup',String(e))}
   await page.close();
  }
 }
 const overview=await browser.newPage({viewport:{width:1440,height:900}});
 await overview.addInitScript(()=>{try{localStorage.setItem('els-theme-v2','neutral-dark')}catch{}});
 await overview.goto(base+'index.html#overview',{waitUntil:'domcontentloaded',timeout:45000});
 record(await overview.locator('.ss-common-links a').count()===10,'overview-menu-count');
 record(await overview.locator('#chapter-grid .chapter-card').count()===8,'overview-eight-chapter-cards');
 await overview.screenshot({path:folder+'/overview-dark.png'});
 await overview.goto(base+'index.html#map',{waitUntil:'domcontentloaded'});
 record(await overview.locator('#tm-detail .tm-formula').count()===1,'learning-map-math-panel');
 record(await overview.locator('.ss-curriculum-steps > div').count()===4,'learning-map-four-curriculum-phases');
 record(await overview.locator('.ss-application-preview').count()===1,'learning-map-future-applications');
 const themes=['neutral-dark','warm-dark','navy-dark','warm-neutral','white-clean'];
 for(const theme of themes){
  await overview.locator('[data-els-theme-picker]').selectOption(theme);
  const values=await overview.evaluate(()=>{
   const sample=(selector)=>{
    const el=document.querySelector(selector);
    if(!el)return null;
    const own=getComputedStyle(el);
    const parent=getComputedStyle(el.parentElement);
    return {size:parseFloat(own.fontSize),fg:own.color,bg:own.backgroundColor,containerBg:parent.backgroundColor}
   };
   return {
    theme:document.documentElement.dataset.elsTheme,
    node:sample('#map-view .tm-node small'),
    edge:sample('#map-view .tm-edge-btn'),
    description:sample('#map-view .tm-sub'),
    control:sample('#map-view .tm-control label'),
    application:document.querySelector('.ss-application-preview')?.textContent||'',
    legend:document.querySelector('#tm-root .tm-badges')?.textContent||'',
    scrollWidth:document.documentElement.scrollWidth-innerWidth
   };
  });
  record(values.theme===theme,'map-'+theme+'-theme-selected',values.theme);
  record(values.node?.size>=12&&values.edge?.size>=12&&values.description?.size>=14&&values.control?.size>=13,
    'map-'+theme+'-readable-typography',JSON.stringify([values.node?.size,values.edge?.size,values.description?.size,values.control?.size]));
  record(values.legend.includes('FFT algorithm')&&values.application.includes('Problem'),
    'map-'+theme+'-full-curriculum-and-applications');
  record(values.scrollWidth<20,'map-'+theme+'-no-page-overflow',String(values.scrollWidth));
  const visual=await overview.evaluate(()=>{
   const svg=document.querySelector('#tm-demo-chart svg');
   const rect=svg?.querySelector(':scope > rect:first-child');
   const text=svg?.querySelector('text');
   const root=getComputedStyle(document.documentElement);
   const surface=root.getPropertyValue('--els-surface').trim();
   const ink=root.getPropertyValue('--els-ink').trim();
   const muted=root.getPropertyValue('--els-muted').trim();
   const rgb=(value)=>{
    const elem=document.createElement('span');elem.style.color=value;document.body.appendChild(elem);
    const color=getComputedStyle(elem).color;elem.remove();return color;
   };
   return {chart:!!svg,labels:svg?.querySelectorAll('text').length||0,
    fill:rect?getComputedStyle(rect).fill:null,desiredSurface:rgb(surface),
    axisColor:text?getComputedStyle(text).fill:null,desiredInk:rgb(ink),desiredMuted:rgb(muted),
    detailMath:!!document.querySelector('#tm-detail .tm-formula'),
    labelCount:document.querySelectorAll('.tm-node').length};
  });
  record(visual.chart&&visual.labels>3&&visual.labelCount===8,
    'map-'+theme+'-eight-nodes-and-labeled-graph',JSON.stringify(visual));
  record(visual.fill===visual.desiredSurface&&[visual.desiredInk,visual.desiredMuted].includes(visual.axisColor)
    &&contrast(visual.axisColor,visual.fill)>=4.5,
    'map-'+theme+'-chart-surface-and-accessible-axis-color',JSON.stringify(visual));
  record(visual.detailMath,'map-'+theme+'-math-detail-present');
  await overview.screenshot({path:folder+'/learning-map-'+theme+'.png',fullPage:true});
 }
 await overview.screenshot({path:folder+'/learning-map-dark.png'});
 await overview.close();
}finally{
 await browser.close();if(server)server.kill();
}
writeFileSync(folder+'/results.json',JSON.stringify(results,null,2));
const failed=results.filter(x=>!x.pass);
console.log('Navigation visual QA: '+(results.length-failed.length)+'/'+results.length+' checks passed');
assert.equal(failed.length,0,'Navigation visual regressions found: '+failed.map(x=>x.name).join(', '));
