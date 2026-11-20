#!/usr/bin/env node
/* Browser-facing, read-only QA status snapshot. Never export user data or GitHub tokens.
 * The dashboard reads this file through the public GitHub Contents API.
 */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from "node:fs";
import {join} from "node:path";
const read=(f)=>{try{return JSON.parse(readFileSync(f,"utf8"))}catch{return null}};
const policy=read("docs/qa/ss-quality-policy.json");
if(!policy||!Array.isArray(policy.chapterCounts)||policy.chapterCounts.length!==8)throw Error("Missing QA policy");
const summary=read("qa-standard/quality-summary.json");
const visual=read("qa-output/results.json");
const quality=read("qa-output/quality-gates.json");
const gates=(summary?.gates||policy.automatedGates.map(g=>({id:g.id,name:g.name,status:"NOT_RUN"}))).map(g=>({
 id:g.id,label:g.name,status:g.status,required:g.required!==false
}));
const themeCount=policy.screenshotMatrix.themes.length,widthCount=policy.screenshotMatrix.widths.length,scale=themeCount*widthCount;
const records=new Map((visual?.records||[]).map(r=>[[r.chapter,r.experiment,r.width,r.theme].join(":"),r]));
const seenFailures=visual?.failures||[];
const names=["Signals & Systems","Convolution and LTI","Fourier Series","Continuous-Time Fourier Transform","Laplace Transform","Discrete-Time Fourier Transform","Sampling","Z-Transform"];
const chapters=policy.chapterCounts.map((labCount,index)=>{
 const chapter=index+1,errors=[],missing=[],cases=[];
 for(let lab=1;lab<=labCount;lab++){
   for(const width of policy.screenshotMatrix.widths)for(const theme of policy.screenshotMatrix.themes){
     const key=[chapter,lab,width,theme].join(":"),r=records.get(key);
     if(!r){missing.push(key);continue}
     const issues=[];
     if(r.overflow)issues.push("가로 스크롤 초과");
     if(!Number.isFinite(r.bodyTextContrast)||r.bodyTextContrast<policy.rules.basicContrast)issues.push("본문 명암비 미달");
     if(r.scheme!==(theme==="warm-neutral"?"light":"dark"))issues.push("테마 불일치");
     cases.push({lab,width,theme,contrast:r.bodyTextContrast??null,issues});
     for(const issue of issues)errors.push({lab,width,theme,message:issue});
   }
 }
 for(const f of seenFailures){
  if(Number(f.chapter)===chapter)errors.push({lab:f.experiment||null,width:f.width||null,theme:f.theme||null,message:f.error||"Chromium error"});
 }
 const expected=labCount*scale,observed=cases.length;
 const status=!visual?"NOT_RUN":missing.length||errors.length?"FAIL":"PASS";
 return {id:chapter,title:names[index],labCount,visual:{status,expected,observed,issues:errors.length,missing:missing.length},
   issueExamples:errors.slice(0,12),missingExamples:missing.slice(0,8),
   coverage:{dimensions:"2 viewport widths × 2 themes",numericalReference:chapter===6?"6.1 sampling identity only":"PENDING_INDEPENDENT_ORACLE"},
   manual:{axesAndLegends:"PENDING",mathematics:"PENDING",pedagogy:"PENDING"}};
});
const blockers=gates.filter(g=>g.required&&g.status!=="PASS");
const runId=process.env.GITHUB_RUN_ID||null;
const report={
 schemaVersion:1,source:"GitHub Actions / Visual Lab Accessibility and Regression Audit",
 generatedAt:new Date().toISOString(),sourceSha:process.env.GITHUB_SHA||null,
 runId,runUrl:runId?"https://github.com/YSCho-HGU/signals-systems-visual-lab/actions/runs/"+runId:null,
 latestCommitUrl:process.env.GITHUB_SHA?"https://github.com/YSCho-HGU/signals-systems-visual-lab/commit/"+process.env.GITHUB_SHA:null,
 automatedStatus:blockers.length?"BLOCKED_AUTOMATED":"AUTOMATED_PASS",
 manualStatus:"PENDING",releaseStatus:blockers.length?"BLOCKED_AUTOMATED":"AUTOMATED_PASS_MANUAL_PENDING",
 chaptersCount:8,labsCount:62,visual:{
 expected:policy.screenshotMatrix.expected,observed:visual?.experimentScreens||0,
 issues:visual?.errors??null,qualityStatus:quality?.status||"NOT_RUN"
 },
 gates,chapters,
 notes:[
 "초록색 자동 검사 결과는 축·수식·학습 효과에 대한 최종 승인이 아닙니다.",
 "Chapter별 시각 검사 통과와 모든 G0–G7 검사의 전체 통과를 구분합니다.",
 "Chapter 6의 수학 검증은 현재 6.1 관련 사례에 한정됩니다."
 ]};
mkdirSync("qa-dashboard",{recursive:true});
writeFileSync(join("qa-dashboard","latest.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({dashboard:"qa-dashboard/latest.json",release:report.releaseStatus,chapters:chapters.length,visual:report.visual,
   chapterPass:chapters.filter(c=>c.visual.status==="PASS").length,blockers:blockers.map(g=>g.id)},null,2));
