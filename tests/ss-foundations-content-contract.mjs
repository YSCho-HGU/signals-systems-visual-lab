/* Chapter 1-4 lesson content: bilingual text, concise checks and stable math.
 * Run: node tests/ss-foundations-content-contract.mjs
 * This static contract does not replace Chromium visual QA.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const source=read('assets/ss-content-model.js');
const fakeWindow={ELSLanguage:{get:()=> 'mixed'}};
new Function('window','localStorage',source)(fakeWindow,{getItem:()=>null});
const local=fakeWindow.SSContentModel;
const getField=(block,key)=>{
 const prefix=key+":'",at=block.indexOf(prefix);
 if(at<0)return null;
 const start=at+prefix.length;
 let end=start;
 while(end<block.length){
  if(block[end]==='\\'&&end+1<block.length){end+=2;continue}
  if(block[end]==="'")break;
  end++;
 }
 return block.slice(start,end).replaceAll("\\'","'");
};
const counts=[9,9,7,8];
let verified=0;
for(let chapter=1;chapter<=4;chapter++){
 const html=read('chapter'+chapter+'.html');
 const lessonPattern=chapter===1?/\{id:(\d+),short:'/g:/\{id:'([^']+)',short:'/g;
 const matches=[...html.matchAll(lessonPattern)];
 assert.equal(matches.length,counts[chapter-1],'Chapter '+chapter+' lesson count');
 assert.match(html,/ss-foundations-standard\.js\?v=20261127-learning-flow-v2/);
 assert.match(html,/ss-content-model\.js\?v=20261127-bilingual-content-v8/);
 for(let i=0;i<matches.length;i++){
  const id=matches[i][1],block=html.slice(matches[i].index,matches[i+1]?.index??html.length);
  for(const field of ['desc','answer']){
   const authored=getField(block,field);
   assert.ok(authored,'Missing '+chapter+'/'+id+'/'+field);
   const english=local.text(authored,'en');
   const korean=local.text(authored,'ko');
   const mixed=local.text(authored,'mixed');
   assert.doesNotMatch(english,/[가-힣]/,'English leaked '+chapter+'/'+id+'/'+field);
   assert.match(korean,/[가-힣]/,'Korean missing '+chapter+'/'+id+'/'+field);
   assert.match(mixed,/[가-힣]/,'Mixed missing Korean '+chapter+'/'+id+'/'+field);
   assert.equal(local.html('<p>'+mixed+'</p>'),'<p>'+mixed+'</p>','Mixed translation repeated '+chapter+'/'+id+'/'+field);
   verified++;
  }
  const question=getField(block,'question');
  assert.ok(question,'Missing check question '+chapter+'/'+id);
  if(chapter===1){
   assert.doesNotMatch(local.text(question,'en'),/[가-힣]/);
   assert.match(local.text(question,'ko'),/[가-힣]/);
   assert.match(block,/steps:v=>/,'Missing guided reasoning '+chapter+'/'+id);
  }else{
   assert.doesNotMatch(question,/[가-힣]/,'English check text '+chapter+'/'+id);
   assert.match(getField(block,'questionKo')||'',/[가-힣]/,'Korean check text '+chapter+'/'+id);
  }
 }
 console.log('PASS Chapter '+chapter+': '+matches.length+' lessons');
}
console.log('PASS: '+verified+' bilingual description/answer fields and all 33 check questions');
