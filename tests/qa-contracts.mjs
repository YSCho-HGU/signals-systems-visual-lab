#!/usr/bin/env node
/* Source-of-truth quality gates: no browser data read, no localStorage mutation. */
import {readFileSync,existsSync,mkdirSync,writeFileSync} from "node:fs";
import {Script} from "node:vm";
const read=path=>readFileSync(path,"utf8");
const json=path=>JSON.parse(read(path));
const policy=json("docs/qa/ss-quality-policy.json");
const learning=json("assets/ss-learning-path.v1.json");
const course=json("course-catalog.json"),chapters=json("chapter-catalog.json");
const page=read("index.html"),native=read("chapter6.html"),flow=read("assets/ss-ch6-learning-flow.js");
const checks=[];
function check(id,ok,detail=""){checks.push({id,pass:!!ok,detail})}
function count(ids){return ids.reduce((a,b)=>a+b,0)}
const numbers=Object.keys(learning.chapters).map(Number).sort((a,b)=>a-b);
const actual=numbers.map(n=>learning.chapters[String(n)].experiments.length);
check("G0-01-eight-chapters",numbers.join(",")==="1,2,3,4,5,6,7,8",numbers.join(","));
check("G0-02-stable-chapter-counts",actual.join(",")===policy.chapterCounts.join(","),actual.join(","));
check("G0-03-exact-lab-count",count(actual)===62&&policy.labCount===62,String(count(actual)));
const ids=Object.entries(learning.chapters).flatMap(([chapter,record])=>record.experiments.map(x=>chapter+":"+x.index));
check("G0-04-unique-progress-ids",new Set(ids).size===62&&ids.length===62,String(new Set(ids).size));
for(const [ch,record] of Object.entries(learning.chapters)){
 const idx=record.experiments.map(x=>Number(x.index)).sort((a,b)=>a-b);
 const expected=Array.from({length:record.experiments.length},(_,i)=>i+1);
 check("G0-05-ch"+ch+"-indices",idx.join(",")===expected.join(","),idx.join(","));
}
check("G0-06-catalog-schema",course.schemaVersion===1&&chapters.schemaVersion===1,"Both schemaVersion=1");
check("G0-07-published-8",course.chapters.filter(x=>x.published).length===8&&chapters.chapters.filter(x=>x.published).length===8);
check("G0-08-native-ch6",!native.includes("<iframe")&&native.includes('class="els-ss-chapter-menu ss-common-menu"')&&native.includes('ss-ch6-learning-flow.js')&&page.includes('if(ch===6){location.replace(\'./chapter6.html\');return;}'));
const laplaceNative=read("chapter5.html");
check("G0-08a-native-ch5",policy.chapterRoutes["5"]==="native"&&policy.chapterRoutes["6"]==="native"&&
 !/<iframe(?:\s|>)/i.test(laplaceNative)&&laplaceNative.includes('class="ss5-chapter-menu ss-common-menu"')&&
 laplaceNative.includes("window.__labNumerics")&&laplaceNative.includes("function installPlotInteractions()")&&
 page.includes("if(ch===5){location.replace('./chapter5.html?build=20261121-ch5-formula10');return;}"));
try{new Script(read("assets/ss-ch5-standalone.js"),{filename:"assets/ss-ch5-standalone.js"});check("G0-js-ch5-native",true)}
catch(e){check("G0-js-ch5-native",false,String(e).slice(0,200))}
const ch7=read("chapter7.html");
check("G0-08b-ch7-initial-observe-dependencies",ch7.includes('./assets/ss-trace-palette.js?v=1')&&ch7.includes('id="plots"')&&!ch7.includes("<iframe")&&ch7.includes('ss-ch7-math.js?v=2'));
const sharedFormula=read("assets/ss-formula-standard.css");
check("G0-shared-math-stylesheet-all-three",
 [laplaceNative,native,ch7].every(x=>x.includes('ss-formula-standard.css?v=1')) &&
 sharedFormula.includes(".ss5-prose-math") &&
 sharedFormula.includes(".ss6-inline-math") &&
 sharedFormula.includes(".ss7-prose-math"));
const uiStandard=read("assets/ss-ui-standard.css");
check("G0-ui-standard-ch5-6-7",
 [laplaceNative,native,ch7].every(x=>x.includes('ss-ui-standard.css?v=3')) &&
 uiStandard.includes(".ss5-native .tabs button") &&
 uiStandard.includes(".ss6-compact-workspace .sidebar .nav button") &&
 uiStandard.includes(".ss7-native #ss7-lesson-nav button"));
check("G0-ui-standard-shared-focus-and-step",
 uiStandard.includes(":focus-visible")&&uiStandard.includes(".ss7-stage-index") &&
 uiStandard.includes("neutral-dark")&&uiStandard.includes("white-clean"));
check("G0-no-duplicate-prose-math-css",
 !existsSync("assets/ss-ch5-prose-math.css")&&!existsSync("assets/ss-ch7-prose-math.css")&&
 ![laplaceNative,native,ch7].some(x=>x.includes("ss-ch5-prose-math.css")||x.includes("ss-ch7-prose-math.css")));
const ch8=read("chapter8.html");
check("G0-08d-ch8-native-and-route",
 ch8.includes('class="ss8-shell"')&&!/<iframe(?:\\s|>)/i.test(ch8)&&
 ch8.includes('ss-ui-standard.css?v=4')&&ch8.includes('ss-formula-standard.css?v=2')&&
 page.includes("if(ch===8){location.replace('./chapter8.html');return;}")&&
 (ch8.match(/\\{short:'/g)||[]).length===8&&
 (ch8.match(/class="ss8-stage-head"/g)||[]).length===4);
for(const path of ["assets/ss-ch8-native.js","assets/ss-ch8-math.js"]){
 try{new Script(read(path),{filename:path});check("G0-js-"+path,true)}
 catch(e){check("G0-js-"+path,false,String(e).slice(0,200))}
}
check("G0-08c-ch7-7-lessons",(ch7.match(/\{short:'/g)||[]).length===7);
for(const path of ["assets/ss-ch7-math.js","assets/ss-ch7-learning-standard.js","assets/ss-ch7-standalone.js"]){
 try{new Script(read(path),{filename:path});check("G0-js-"+path,true)}
 catch(e){check("G0-js-"+path,false,String(e).slice(0,200))}
}
check("G0-09-six-modules",flow.includes('["periodic","pairs","phase","phasor","filter","fft"]'));
check("G0-10-no-prediction-gate",flow.includes("Writing a prediction is optional")&&read("assets/ss-ch6-frequency-foundations.js").includes("return originalControl(c,s);"));
check("G0-11-native-audio",native.includes('ss-applications.js')&&read("assets/ss-applications.js").includes("ss-ch6-module-changed"));
check("G0-12-screenshot-matrix",policy.screenshotMatrix.widths.length*policy.screenshotMatrix.themes.length*policy.labCount===policy.screenshotMatrix.expected);
check("G0-13-theme-modes",policy.screenshotMatrix.themes.join(",")==="warm-neutral,neutral-dark");
check("G0-14-progress-contract",policy.stableStorageKeys.includes("els-ss-lab-progress-v1")&&read("assets/ss-progress.js").includes("els-ss-lab-progress-v1"));
check("G0-15-no-iframe-assumption-in-ch6-e2e",read("tests/ch6-viewport-e2e.mjs").includes('overview.iframes===0'));
check("G0-16-automatic-gate-list",policy.automatedGates.map(x=>x.id).join(",")==="G0,G1,G2,G2b,G3,G4,G5,G6,G7");
for(const file of ["assets/ss-ch6-frequency-foundations.js","assets/ss-ch6-learning-flow.js","assets/ss-applications.js"]){
 try{new Script(read(file),{filename:file});check("G0-js-"+file,true)}
 catch(e){check("G0-js-"+file,false,String(e).slice(0,200))}
}
for(const gate of policy.automatedGates)check("G0-script-"+gate.id,existsSync(gate.script),gate.script);
const failures=checks.filter(x=>!x.pass);
const report={schemaVersion:1,gate:"G0",status:failures.length?"FAIL":"PASS",passed:checks.length-failures.length,total:checks.length,checks};
mkdirSync("qa-standard",{recursive:true});
writeFileSync("qa-standard/contracts.json",JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({gate:"G0",status:report.status,passed:report.passed,total:report.total,failures:failures.slice(0,12)},null,2));
if(failures.length)process.exitCode=1;
