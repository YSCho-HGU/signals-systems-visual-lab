#!/usr/bin/env node
// Post-process actual Chromium visual-audit artifacts. This does not certify graph legibility.
import {readFileSync,existsSync,statSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const root=process.env.SS_QA_DIR||'qa-output';
const source=JSON.parse(readFileSync(join(root,'results.json'),'utf8'));
const failures=[],cases=[];
const expected=[9,9,7,8,8,6,7,8];
const themes=['warm-neutral','neutral-dark'],widths=[390,1280];
const map=new Map();
for(const r of source.records||[]){
 const key=[r.width,r.theme,r.chapter,r.experiment].join(':');
 if(map.has(key)) failures.push('Duplicate experiment: '+key);
 map.set(key,r);
}
for(const width of widths) for(const theme of themes){
 const folder=join(root,theme,String(width));
 for(const name of ['overview.png','map.png']){
  const f=join(folder,name);
  if(!existsSync(f)||statSync(f).size<1000) failures.push('Missing/empty screenshot: '+f);
 }
 for(let chapter=1;chapter<=8;chapter++) for(let experiment=1;experiment<=expected[chapter-1];experiment++){
  const key=[width,theme,chapter,experiment].join(':');
  const record=map.get(key),file=join(folder,'ch'+chapter,String(experiment).padStart(2,'0')+'.png');
  if(!record) failures.push('Missing result: '+key);
  if(!existsSync(file)||statSync(file).size<1000) failures.push('Missing/empty screenshot: '+file);
  if(record && (!Number.isFinite(record.bodyTextContrast)||record.bodyTextContrast<4.5)) failures.push('Insufficient body contrast: '+key);
  if(record?.overflow) failures.push('Horizontal overflow: '+key);
  if(record?.scheme!==(theme==='warm-neutral'?'light':'dark')) failures.push('Theme mismatch: '+key);
  cases.push({width,theme,chapter,experiment,screenshot:file,
    visual_graph_review:'PENDING_HUMAN_REVIEW',
    math_reference_review:'PENDING_INDEPENDENT_ORACLE',
    student_learning_review:'PENDING_STUDENT_EVIDENCE'});
 }
}
if(source.errors) for(const e of source.failures||[]) failures.push('Chromium: '+JSON.stringify(e));
const result={
 schema_version:1,gate:'automated-browser-evidence',status:failures.length?'FAIL':'PASS',
 screens_expected:248,screens_recorded:map.size,screen_files_checked:cases.length,
 automated_failures:failures,
 release_status:'NOT_VERIFIED',
 release_reason:'Visual line/axis/phase readability, independent mathematical cases and student learning evidence must be approved separately.',
 manual_review_cases:cases
};
writeFileSync(join(root,'quality-gates.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({gate:result.gate,status:result.status,screens:map.size,failures:failures.length,release_status:result.release_status,examples:failures.slice(0,20)},null,2));
if(failures.length) process.exitCode=1;
