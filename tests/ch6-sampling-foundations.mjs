#!/usr/bin/env node
/* Chapter 6 Experiment 01: sampling fundamentals -> aliasing.
   Static contract and independent numerical checks. */
import {readFileSync} from "node:fs";
import {Script} from "node:vm";
const src=readFileSync("assets/ss-ch6-frequency-foundations.js","utf8");
const page=readFileSync("index.html","utf8");
const match=page.match(/<script id="lab-payload" type="application\/json">([\s\S]*?)<\/script>/);
if(!match)throw Error("Missing lab payload");
const chapter=Buffer.from(JSON.parse(match[1])["6"],"base64").toString("utf8");
const errors=[];
function check(ok,msg){if(!ok)errors.push(msg)}
new Script(src,{filename:"ss-ch6-frequency-foundations.js"});
const standalone=readFileSync("chapter6.html","utf8");
check(/ss-ch6-frequency-foundations\.js\?v=\d+/.test(standalone),"Native Chapter 6 does not load teaching extension");
check(/ss-ch6-learning-flow\.js\?v=\d+/.test(standalone),"Native Chapter 6 learning sequence missing");
check(!standalone.includes("<iframe"),"Native Chapter 6 must not use iframe");
check(src.includes('["frequency"')&&src.includes('["rate"')&&src.includes('["alias"'),"Three ordered learning modes missing");
check(src.includes("duration=0.2, N=21"),"Fixed first 21 displayed samples missing");
check(src.includes("xmin:0,xmax:200"),"CT physical time axis not fixed");
check(src.includes("xmin:0,xmax:N-1"),"DT sample-index axis not fixed");
check(!src.includes('markup.replace("<input ","<input disabled "'),"Step-controlled slider lock must not return");
check(src.includes('renderFrequencyMath(s)')&&src.includes('setMetrics('),"Digital F and Ω formulas or metrics missing");
check(src.includes('oldDrawing(s)')&&src.includes('oldGuide(s)'),"Original aliasing comparison or derivation lost");
check(src.includes("N0=fs/gcd(fs,f)"),"Discrete fundamental period calculation missing");
check(!src.includes("localStorage.setItem"),"New chapter experiment must not overwrite progress storage");
for(const fs of [100,120,140,160,180,200]){
  const f=10, N=21, F=f/fs, Om=2*Math.PI*F, Ts=1/fs;
  const n0=fs/((a,b)=>{while(b){[a,b]=[b,a%b]}return a})(fs,f);
  check(Number.isInteger(n0)&&n0>=1,"Invalid DT fundamental period");
  for(let n=0;n<N;n++){
   const x=Math.cos(2*Math.PI*f*n/fs);
   check(Math.abs(x-Math.cos(Om*n))<1e-11,"CT samples disagree with digital sinusoid");
   check(Math.abs(x-Math.cos(2*Math.PI*(fs-f)*n/fs))<1e-11,"Aliasing equality failed");
   check(n*Ts<=0.2+1e-12,"Sample time outside fixed 0–200ms CT viewport");
   check(Math.abs(x-Math.cos(Om*(n+n0)))<1e-10,"DT period identity failed");
  }
}
console.log("Chapter 6: checked 3 ordered modes, 21 fixed-index samples, 6 sampling rates, alias identity, and exact DT periodicity.");
if(errors.length){console.error(errors.join("\n"));process.exitCode=1}else console.log("PASS: sampling fundamentals source and mathematics");
