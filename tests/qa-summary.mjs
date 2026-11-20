#!/usr/bin/env node
/* Aggregate independent CI outcomes without treating missing tests as PASS. */
import {readFileSync,existsSync,mkdirSync,writeFileSync} from "node:fs";
const policy=JSON.parse(readFileSync("docs/qa/ss-quality-policy.json","utf8"));
const directory="qa-standard";
const gates=policy.automatedGates.map(gate=>{
 const file=directory+"/"+gate.id+".status";
 const value=existsSync(file)?readFileSync(file,"utf8").trim():"NOT_RUN";
 return {id:gate.id,name:gate.name,status:["PASS","FAIL"].includes(value)?value:"NOT_RUN",required:gate.required,script:gate.script};
});
const failures=gates.filter(x=>x.required&&x.status!=="PASS");
let evidence={};
for(const [name,file] of [["contracts","qa-standard/contracts.json"],["visual","qa-output/results.json"],["visualQuality","qa-output/quality-gates.json"],["storage","qa-phase0/ss-baseline.json"],["learning","qa-learning-output/results.json"],["theme","qa-output/ss-theme-qa.json"]]){
 if(!existsSync(file)){evidence[name]={status:"NOT_RUN",path:file};continue;}
 try{
  const data=JSON.parse(readFileSync(file,"utf8"));
  evidence[name]={status:name==="visual"?(data.errors===0?"PASS":"FAIL"):name==="learning"?(data.summary?.failed===0&&data.summary?.jsErrors===0?"PASS":"FAIL"):name==="theme"?(data.failures?.length?"FAIL":data.browserStatus==="RAN"?"PASS":"NOT_RUN"):(data.status||"RECORDED"),
    path:file,
    summary:name==="visual"?{screens:data.experimentScreens,issues:data.errors}:name==="learning"?data.summary:name==="visualQuality"?{screens:data.screens_recorded,failures:data.automated_failures?.length}:undefined};
 }catch(e){evidence[name]={status:"FAIL",path:file,error:String(e)}}
}
const result={
 schemaVersion:1,
 standard:"docs/qa/SS_QA_STANDARD.md",
 generatedAt:new Date().toISOString(),
 chapters:8,labs:policy.labCount,
 automatedStatus:failures.length?"FAIL":"PASS",
 manualStatus:"NOT_VERIFIED",
 releaseStatus:failures.length?"BLOCKED_AUTOMATED":"AUTOMATED_PASS_MANUAL_PENDING",
 gates,evidence,
 blockerCount:failures.length,
 blockers:failures.map(g=>g.id+": "+g.name+" ("+g.status+")")
};
mkdirSync(directory,{recursive:true});
writeFileSync(directory+"/quality-summary.json",JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({status:result.releaseStatus,passed:gates.filter(g=>g.status==="PASS").length,required:gates.length,blockers:result.blockers,evidence:result.evidence},null,2));
if(failures.length)process.exitCode=1;
