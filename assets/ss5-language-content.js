/* Chapter 5 language presentation: preserves interactive DOM and numerical state. */
(function(){
"use strict";
const root=document.getElementById("page"),nav=document.getElementById("tabs");
if(!root||!window.ELSLanguage)return;
const original=new WeakMap();
const dictionary=[
 [/가중 인자.*?교재 §5\.1\)/,"Observe how exponential weighting changes convergence (Section 5.1)."],
 [/변수를 조절하기 전에 변할 것과 유지될 것을 예측하세요\./,"Predict what changes and what remains unchanged before moving the slider."],
 [/변수 하나를 바꾸고 시간 신호와 s-plane을 비교하세요\./,"Change one variable and compare the time-domain signal with the s-plane."],
 [/변환식·ROC·pole 위치를 근거로 설명해 보세요\./,"Explain using the transform, ROC, and pole locations."],
 [/예측은 자기 점검용이며 채점되지 않습니다\./,"This prediction is optional and is not graded."],
 [/정답을 입력하지 않아도 실습을 시작할 수 있습니다\./,"You can start without entering an answer."],
 [/예상 결과를 기록하는 것은 선택 사항입니다\./,"Recording a prediction is optional."],
 [/그래프로 확인해 보세요/,"Explore the graphs"],
 [/예측하기/,"Predict"],[/관찰하기/,"Observe"],
 [/어떤 변화가 예상되나요\? \(선택\)/,"What change do you expect? (optional)"]
];
function translate(text,mode){
 if(mode==="mixed")return text;
 if(mode==="en"){
  let x=text;
  for(const [re,v] of dictionary)x=x.replace(re,v);
  x=x.replace(/\s*\/\s*[^\n|]*[가-힣][^\n|]*/g,"");
  x=x.replace(/[가-힣][^\n]*?(?=\s*\/\s*[A-Za-z])/g,"");
  x=x.replace(/[가-힣][가-힣\s·,.:()?!—–-]*/g,"");
  return x.replace(/\s{2,}/g," ").trim()||text.replace(/[가-힣]/g,"").trim();
 }
 let x=text;
 // Korean-first, retaining technical English terms when no translation exists.
 if(x.includes(" / ")){
  const parts=x.split(" / ");
  if(parts.length===2&&/[가-힣]/.test(parts[1]))return parts[1].trim();
 }
 return x;
}
let observer=null;
function run(){
 if(observer)observer.disconnect();
 const mode=window.ELSLanguage.get();
 const targets=[root,nav,document.querySelector(".ss5-progress")].filter(Boolean);
 for(const target of targets){
  const walker=document.createTreeWalker(target,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
   const p=node.parentElement;
   if(!p||p.closest("script,style,textarea,input,select,option,svg,canvas,.katex,.katex-display,.ss5-inline-equation,.ss5-explicit-math,.els-inline-math,.math,.deriv-math,code,pre,[contenteditable]"))continue;
   const prior=original.get(node),source=prior!==undefined?prior:node.nodeValue;
   if(prior===undefined)original.set(node,source);
   const next=translate(source,mode);
   if(node.nodeValue!==next)node.nodeValue=next;
  }
 }
 if(observer)for(const target of targets)observer.observe(target,{subtree:true,childList:true,characterData:true});
}
observer=new MutationObserver(()=>{run()});
window.ELSLanguage.subscribe(run);
run();
window.ELSChapterFiveLanguage={refresh:run};
})();
