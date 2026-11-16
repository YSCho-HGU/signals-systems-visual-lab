#!/usr/bin/env node
// Phase 0 source-code inventory only: NEVER reads browser values or student data.
import {readdirSync,readFileSync,statSync,mkdirSync,writeFileSync} from "node:fs";
import {join,relative} from "node:path";
const roots=["index.html","assets","c-programming","progress","admin"].filter(x=>{try{statSync(x);return true}catch(e){return false}});
const skip=new Set(["node_modules",".git","qa-output","qa-phase0",".github","docs","tests"]);
const rows=[];
function inspect(file){
 if(!/\.(?:html|js|mjs)$/.test(file))return;
 const source=readFileSync(file,"utf8"),lines=source.split("\n");
 for(let i=0;i<lines.length;i++){
  const line=lines[i],re=/\b(?:window\.)?(localStorage|sessionStorage)\.(getItem|setItem|removeItem)\s*\(\s*([^,)]{1,180})/g;
  let m;
  while((m=re.exec(line))!==null){
   const expression=m[3].trim().slice(0,135);
   const constant=/^(["'`])((?:(?!\1).)*)\1$/.exec(expression);
   rows.push({path:file,line:i+1,store:m[1],operation:m[2],keyExpression:expression,literalKey:constant?constant[2]:null});
  }
 }
}
function walk(path){
 const st=statSync(path);
 if(st.isDirectory()){
  for(const ent of readdirSync(path,{withFileTypes:true})){
   if(skip.has(ent.name))continue;
   walk(join(path,ent.name));
  }
 }else inspect(path);
}
for(const x of roots)walk(x);
const result={schemaVersion:1,generatedAt:new Date().toISOString(),scope:"Source-code references only; no user/localStorage values accessed",filesScanned:roots,referenceCount:rows.length,literalKeys:[...new Set(rows.filter(x=>x.literalKey).map(x=>x.literalKey))].sort(),dynamicKeyExpressions:[...new Set(rows.filter(x=>!x.literalKey).map(x=>x.keyExpression))].sort(),references:rows};
mkdirSync("qa-phase0",{recursive:true});writeFileSync("qa-phase0/storage-access-inventory.json",JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({status:"PASS",references:result.referenceCount,literalKeys:result.literalKeys.length,dynamicExpressions:result.dynamicKeyExpressions.length},null,2));
