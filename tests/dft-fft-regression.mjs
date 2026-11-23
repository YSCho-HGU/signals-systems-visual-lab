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
 console.log("PASS no uncaught page errors");
 console.log("ALL DFT/FFT REGRESSION CHECKS PASSED");
}finally{
 await page?.close();
 await browser.close();
}
