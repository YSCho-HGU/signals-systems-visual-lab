/** Reproducible browser QA for the DFT-vs-FFT application.
 * Run: npm run qa:dft-fft (requires npm install + Playwright Chromium).
 * Default file:// mode needs no local web server.
 */
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const browser=await chromium.launch({headless:true});
const errors=[];
function expectContains(text,part,label){assert.ok(text.includes(part),label+": "+text);}
function makeWav({rate=8000,n=1024,f1=250,f2=750}={}){
 const bytes=Buffer.alloc(44+n*2);
 bytes.write("RIFF",0);bytes.writeUInt32LE(bytes.length-8,4);bytes.write("WAVEfmt ",8);
 bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);
 bytes.writeUInt32LE(rate,24);bytes.writeUInt32LE(rate*2,28);
 bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write("data",36);bytes.writeUInt32LE(n*2,40);
 for(let i=0;i<n;i++){
  const v=.65*Math.sin(2*Math.PI*f1*i/rate)+.22*Math.sin(2*Math.PI*f2*i/rate);
  bytes.writeInt16LE(Math.round(Math.max(-1,Math.min(1,v))*32767),44+i*2);
 }
 return bytes;
}
let page;
try{
 page=await browser.newPage();
 page.on("pageerror",error=>errors.push(error.message));
 await page.goto(pathToFileURL(path.join(root,"dft-fft-lab.html")).href);
 await page.locator("#peak-analysis").count();
 assert.ok(await page.locator("#guide-title").isVisible(),"Guided mission hidden");
 expectContains(await page.locator("#guide-question").innerText(),"bin 64","Stage 1 prediction");
 await page.locator("#guide-reveal").click();
 expectContains(await page.locator("#guide-feedback").innerText(),"k=fN/fₛ","Stage 1 explanation");
 assert.equal(await page.locator("#guide-reveal").getAttribute("aria-expanded"),"true");
 await page.locator("#guide-next").click();
 expectContains(await page.locator("#guide-title").innerText(),"Same spectrum","Stage 2 navigation");
 assert.equal(await page.locator("#guide-reveal").getAttribute("aria-expanded"),"false");
 await page.locator('[data-step="1"]').click();
 await page.locator("#size").selectOption("512");
 await page.locator("#signal").selectOption("one");
 await page.locator("#tone").fill("128");
 await page.locator("#fs").fill("1024");
 await page.locator("#run").click();
 const discrepancy=Number(await page.locator("#error").innerText());
 assert.ok(Number.isFinite(discrepancy)&&discrepancy<1e-7,"Direct DFT differs from FFT: "+discrepancy);
 console.log("PASS direct DFT = FFT, max complex error",discrepancy);

 await page.locator('[data-step="3"]').click();
 assert.ok(await page.locator("#upload").isVisible(),"Upload section hidden");
 const csv=await readFile(path.join(root,"tests/fixtures/dft-fft-vibration-64-160hz.csv"));
 await page.locator("#file").setInputFiles({name:"vibration.csv",mimeType:"text/csv",buffer:csv});
 await page.locator("#size").selectOption("512");
 await page.locator("#run").click();
 let result=await page.locator("#peak-results").innerText();
 expectContains(result,"64.00 Hz","Sensor peak 64 Hz");
 expectContains(result,"160.00 Hz","Sensor peak 160 Hz");
 expectContains(await page.locator("#file-info").innerText(),"1024","CSV timestamp sampling rate");
 console.log("PASS CSV sensor peaks 64 Hz + 160 Hz and auto sample rate");
 await page.locator("#physics-peak").selectOption("32"); // 64 Hz at N=512, fs=1024
 await page.locator("#events-per-rev").fill("1");
 expectContains(await page.locator("#physics-hz").innerText(),"64.00 Hz","Physical frequency");
 expectContains(await page.locator("#physics-period").innerText(),"15.625 ms","Period T=1/f");
 expectContains(await page.locator("#physics-rpm").innerText(),"3840.00 RPM","1 event/revolution");
 await page.locator("#events-per-rev").fill("2");
 expectContains(await page.locator("#physics-rpm").innerText(),"1920.00 RPM","2 events/revolution");
 expectContains(await page.locator("#physics-note").innerText(),"conditional speed estimate","Conditional speed caveat");
 console.log("PASS sensor physical units, period and event-count-aware RPM");
 await page.locator("#fs").fill("2048");
 await page.locator("#run").click();
 expectContains(await page.locator("#physics-hz").innerText(),"128.00 Hz","Sampling-rate override frequency");
 expectContains(await page.locator("#physics-rpm").innerText(),"3840.00 RPM","Sampling-rate override conditional RPM");
 await page.locator("#fs").fill("1024");
 await page.locator("#run").click();
 console.log("PASS uploaded sample-rate override recalculates physical units");



 const single=Array.from({length:512},(_,i)=>Math.sin(2*Math.PI*32*i/512).toFixed(8)).join("\n");
 await page.locator("#file").setInputFiles({name:"unknown-rate.txt",mimeType:"text/plain",buffer:Buffer.from(single)});
 await page.locator("#run").click();
 expectContains(await page.locator("#peak-results").innerText(),"cycles/sample","Unknown sample rate unit");
 expectContains(await page.locator("#peak-caution").innerText(),"Sample rate unknown","Unknown sampling rate caveat");
 expectContains(await page.locator("#physics-hz").innerText(),"cycles/sample","Unknown fs normalized frequency");
 assert.equal(await page.locator("#physics-rpm").innerText(),"—","Unknown fs must not create RPM");

 console.log("PASS unknown sampling rate never invents Hz");

 await page.locator("#file").setInputFiles({name:"two-notes.wav",mimeType:"audio/wav",buffer:makeWav()});
 await page.locator("#size").selectOption("1024");
 await page.locator("#run").click();
 result=await page.locator("#peak-results").innerText();
 expectContains(result,"250.00 Hz","Audio 250 Hz");
 // 750 Hz bin may be smaller, but should be selected as a second local peak.
 expectContains(result,"750.00 Hz","Audio 750 Hz");
 expectContains(result,"For audio","Audio-specific physical interpretation");
 console.log("PASS WAV decoder and two audio peaks");

 await page.locator("#size").selectOption("2048");
 await page.locator("#run").click();
 expectContains(await page.locator("#status").innerText(),"Not enough remaining samples","Truncated frame rejected");
 console.log("PASS oversized selected frame is rejected");

 await page.locator("#dft-language").selectOption("en");
 await page.locator('[data-step="0"]').click();
 assert.ok(!(await page.locator("#step-desc").innerText()).includes("DFT는"),"English mode leaked Korean into step description");
 await page.locator("#dft-language").selectOption("ko");
 expectContains(await page.locator("#step-desc").innerText(),"샘플","Korean step explanation");
 await page.locator("#guide-reveal").click();
 expectContains(await page.locator("#guide-feedback").innerText(),"bin","Korean feedback technical term");
 console.log("PASS EN/KR content switching");
 await page.locator("#dft-theme").selectOption("white-clean");
 assert.equal(await page.locator("html").getAttribute("data-els-theme"),"white-clean");
 await page.locator("#dft-theme").selectOption("neutral-dark");
 assert.equal(await page.locator("html").getAttribute("data-els-theme"),"neutral-dark");
 console.log("PASS shared theme contract");
 await page.locator('[data-step="2"]').click();
 assert.ok(await page.locator("#complexity").isVisible(),"Complexity chart unavailable");
 const chartPixels=await page.locator("#complexity").evaluate(el=>{
  const ctx=el.getContext("2d"),data=ctx.getImageData(0,0,el.width,el.height).data;
  let changed=0;for(let i=3;i<data.length;i+=4)if(data[i])changed++;return changed;
 });
 assert.ok(chartPixels>500,"Complexity chart is empty");
 console.log("PASS DFT and FFT comparison chart renders");


 assert.deepEqual(errors,[],"Browser uncaught errors");
 // UX contracts: controls stay directly above paired charts, and upload controls appear in the same workspace.
 await page.setViewportSize({width:1366,height:900});
 await page.locator('[data-step="3"]').click();
 assert.ok(await page.locator("#upload-setup").isVisible(),"Upload controls not shown for Discover");
 assert.ok(await page.locator("#file").isVisible(),"Upload input hidden");
 assert.ok(await page.locator("#signal-graphs").isVisible(),"Signal graphs hidden");
 const positions=await page.evaluate(()=>{const a=document.querySelector("#upload-setup").getBoundingClientRect(),b=document.querySelector("#signal-graphs").getBoundingClientRect();return {setupTop:a.top,setupBottom:a.bottom,graphTop:b.top}});
 assert.ok(positions.graphTop>=positions.setupBottom&&positions.graphTop-positions.setupBottom<85,"Graph is detached from upload controls");
 await page.locator('[data-step="1"]').click();
 assert.ok(await page.locator("#intro").isHidden(),"Full formula introduction consumes space in stage 2");
 assert.ok(await page.locator("#upload-setup").isHidden(),"Stage 2 contains unrelated upload controls");
 await page.setViewportSize({width:390,height:844});
 await page.locator('[data-step="3"]').click();
 assert.ok(await page.locator("#file").isVisible(),"Mobile upload missing");
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3);
 assert.equal(overflow,false,"Mobile page has horizontal overflow");
 
 // Stage-specific display contract: suppress irrelevant graphs and data in every mission.
 await page.setViewportSize({width:1366,height:900});
 await page.locator('[data-step="0"]').click();
 assert.ok(await page.locator("#intro").isVisible(),"Stage 1 DFT concept absent");
 assert.ok(await page.locator("#time-graph-panel").isVisible(),"Stage 1 time-domain plot absent");
 assert.ok(await page.locator("#spectrum-graph-panel").isVisible(),"Stage 1 spectrum absent");
 assert.ok(await page.locator("#compare").isHidden(),"Stage 1 should not display numerical benchmark");
 await page.locator('[data-step="1"]').click();
 assert.ok(await page.locator("#time-graph-panel").isHidden(),"Stage 2 should focus on spectrum");
 assert.ok(await page.locator("#spectrum-graph-panel").isVisible(),"Stage 2 spectrum absent");
 assert.ok(await page.locator("#accuracy-metric").isVisible(),"Stage 2 complex error absent");
 assert.ok(await page.locator("#dft-speed-metric").isHidden(),"Stage 2 runtime metric must be hidden");
 assert.ok(await page.locator("#growth").isHidden(),"Stage 2 work graph must be hidden");
 await page.locator('[data-step="2"]').click();
 assert.ok(await page.locator("#signal-graphs").isHidden(),"Stage 3 signal plots distract from runtime analysis");
 assert.ok(await page.locator("#accuracy-metric").isHidden(),"Stage 3 error metric should be hidden");
 assert.ok(await page.locator("#dft-speed-metric").isVisible(),"Stage 3 direct time absent");
 assert.ok(await page.locator("#fft-speed-metric").isVisible(),"Stage 3 FFT time absent");
 assert.ok(await page.locator("#growth").isVisible(),"Stage 3 cost comparison absent");
 assert.ok(await page.locator("#control-fs").isHidden(),"Stage 3 irrelevant sampling-rate input visible");
 await page.locator('[data-step="3"]').click();
 assert.ok(await page.locator("#time-graph-panel").isVisible(),"Stage 4 time-domain plot absent");
 assert.ok(await page.locator("#spectrum-graph-panel").isVisible(),"Stage 4 spectrum plot absent");
 assert.ok(await page.locator("#control-fs").isVisible(),"Stage 4 needs sampling-rate correction");
 assert.ok(await page.locator("#peak-analysis").isVisible(),"Stage 4 peak analysis absent");
 assert.ok(await page.locator("#sensor-physics").isVisible(),"Stage 4 physical interpretation absent");
 assert.ok(await page.locator("#compare").isHidden(),"Stage 4 numerical comparison should be hidden");
 console.log("PASS focused content visibility across all four stages");
 // Stage 1: N, fs and bin-index/Hz mapping must stay mathematically consistent.
 await page.locator('[data-step="0"]').click();
 await page.locator("#axis-reset").click();
 assert.ok(await page.locator("#frequency-axis-lab").isVisible(),"Stage 1 frequency axis explorer missing");
 expectContains(await page.locator("#axis-df").innerText(),"2.000 Hz","Baseline df=1024/512");
 expectContains(await page.locator("#axis-nyquist").innerText(),"512.00 Hz","Baseline Nyquist");
 expectContains(await page.locator("#axis-duration").innerText(),"0.5000 s","Baseline observation time");
 expectContains(await page.locator("#axis-bin").innerText(),"64.00 bins","Baseline bin index");
 await page.locator("#axis-double-n").click();
 expectContains(await page.locator("#axis-df").innerText(),"1.000 Hz","Double N halves spacing");
 expectContains(await page.locator("#axis-bin").innerText(),"128.00 bins","Double N doubles bin index");
 expectContains(await page.locator("#axis-duration").innerText(),"1.000 s","Double N doubles observation");
 await page.locator("#axis-reset").click();
 await page.locator("#axis-double-fs").click();
 expectContains(await page.locator("#axis-df").innerText(),"4.000 Hz","Double fs doubles spacing");
 expectContains(await page.locator("#axis-nyquist").innerText(),"1024.0 Hz","Double fs increases Nyquist");
 expectContains(await page.locator("#axis-bin").innerText(),"32.00 bins","Double fs halves bin index");
 await page.locator("#axis-reset").click();
 await page.locator("#tone").fill("129");
 await page.locator("#run").click();
 expectContains(await page.locator("#axis-insight").innerText(),"between DFT bins","Off-bin leakage explanation");
 await page.locator("#tone").fill("700");
 await page.locator("#run").click();
 expectContains(await page.locator("#axis-insight").innerText(),"above Nyquist","Aliasing warning");
 await page.locator('[data-step="1"]').click();
 assert.ok(await page.locator("#frequency-axis-lab").isHidden(),"Stage 1 frequency axis must not clutter Stage 2");
 console.log("PASS Stage 1 bin index / Hz mapping, N, fs, leakage and aliasing");
 await page.locator("#axis-reset").click();
 assert.ok(await page.locator("#padding-comparison").isVisible(),"Zero-padding comparison not visible in stage 1");
 expectContains(await page.locator("#padding-long-stats").innerText(),"1.0000 s","2N observation duration");
 expectContains(await page.locator("#padding-zero-stats").innerText(),"0.5000 s","Zero-padded duration remains N/fs");
 expectContains(await page.locator("#padding-long-stats").innerText(),"1.000 Hz","2N observation grid");
 expectContains(await page.locator("#padding-zero-stats").innerText(),"1.000 Hz","Zero padding grid matches 2N FFT");
 expectContains(await page.locator("#padding-conclusion").innerText(),"without lengthening","Zero padding must not claim better resolution");
 await page.locator("#padding-offbin").click();
 assert.equal(await page.locator("#tone").inputValue(),"129","Off-bin comparison preset");
 const coverage=await page.locator("#padding-zero-plot").evaluate(canvas=>{
  const data=canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height).data;
  let nonempty=0;for(let i=3;i<data.length;i+=4)if(data[i]!==0)nonempty++;return nonempty;
 });
 assert.ok(coverage>500,"Zero-padded spectrum was not rendered");
 await page.locator("#padding-coherent").click();
 assert.equal(await page.locator("#tone").inputValue(),"128","Coherent-tone comparison preset");
 await page.locator('[data-step="1"]').click();
 assert.ok(await page.locator("#padding-comparison").isHidden(),"Padding comparison must not clutter step 2");
 const overlayTable=await page.locator("#padding-teaching").innerText();
 expectContains(overlayTable,"1024","Measured-sample scenario");
 expectContains(overlayTable,"512","Padded-sample scenario");
 expectContains(overlayTable,"0.5000 s","Zero-padding preserves physical observation time");
 expectContains(overlayTable,"1.0000 s","2N true observation duration");
 expectContains(overlayTable,"2.000 Hz","Original observation resolution remains 1/T");
 const overlayText=await page.locator("#padding-overlay-result").innerText();
 const errorMatch=overlayText.match(/\d+(?:\.\d+)?e[+-]\d+/i);
 assert.ok(errorMatch,"Overlay did not report its original-bin numerical error");
 assert.ok(Number(errorMatch[0])<1e-8,"Original-bin FFT mismatch after padding: "+errorMatch[0]);
 const overlayPixels=await page.locator("#padding-overlay-plot").evaluate(canvas=>{
  const rgba=canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height).data;
  let visible=0;for(let i=3;i<rgba.length;i+=4)if(rgba[i]>0)visible++;return visible;
 });
 assert.ok(overlayPixels>300,"Zero-padding overlay graph is blank");
 await page.locator("#padding-offbin").click();
 const offbinText=await page.locator("#padding-overlay-result").innerText();
 assert.ok(/\d+(?:\.\d+)?e[+-]\d+/i.test(offbinText),"Off-bin overlay did not recalculate");
 console.log("PASS longer observation vs zero-padding comparison and spectral plots");


 console.log("PASS desktop/mobile learning layout and contextual upload controls");
 console.log("PASS no uncaught page errors");
 console.log("ALL DFT/FFT REGRESSION CHECKS PASSED");
}finally{
 await page?.close();
 await browser.close();
}
