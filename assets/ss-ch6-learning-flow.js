/* Chapter 6 learning flow, scoped to native (non-iframe) chapter page.
 * Keeps the original numerical model and its input handlers unchanged.
 */
(function(){
"use strict";
if(typeof renderModule!=="function"||typeof MODULES==="undefined")return;
var MODULE_ORDER=["periodic","pairs","phase","phasor","filter","fft"];
var L={
 periodic:{title:["01 · CT에서 DT 주파수로","01 · From CT to DT frequency"],goal:["신호를 표본화한 후 디지털 주파수와 복원 주파수가 어떻게 정해지는지 설명합니다.","Explain how sampling determines digital frequency and reconstructed frequency."],read:["CT와 DT의 시간축을 구분하고 검은 샘플점, 복원 파형을 비교하세요.","Separate physical time and sample index; compare samples and the reconstructed curve."]},
 pairs:{title:["02 · DTFT 핵심 변환쌍","02 · Essential DTFT pairs"],goal:["임펄스, 지연, 지수, 직사각 신호의 시간형태가 스펙트럼과 어떻게 연결되는지 관찰합니다.","Connect impulse, shift, exponential and rectangular sequences to their spectra."],do:["먼저 Signal을 바꾸고, 해당 신호에서 필요한 파라미터 하나만 변경하세요.","Choose one signal, then vary only a relevant parameter."],read:["왼쪽 x[n]의 변화를 오른쪽 X(e^{jΩ})의 크기·위상과 연결하세요.","Link the sequence x[n] to the magnitude or phase of X(e^{jΩ})."]},
 phase:{title:["03 · 지연과 위상의 관계","03 · Delay and phase"],goal:["시간 지연은 DTFT 크기를 유지하지만 위상에 선형 항을 추가함을 확인합니다.","See that delay preserves DTFT magnitude while adding linear phase."],do:["Pulse length M을 고정하고 Delay n0만 증가시켜 보세요.","Hold M fixed and increase delay n0."],read:["시간 이동, 두 크기 스펙트럼, 위상 차이의 기울기를 차례로 관찰하세요.","Observe the delayed signal, unchanged magnitudes, then the phase-difference slope."]},
 phasor:{title:["04 · 페이저 합과 필터의 영점","04 · Phasor sums and filter zeros"],goal:["복소 페이저들이 상쇄될 때 이동평균 응답이 작아지는 원리를 이해합니다.","Understand why rotating tap phasors cancel at filter zeros."],do:["M을 고정하고 Ω/π를 0부터 1까지 움직여 보세요.","Fix M and sweep Ω/π from 0 to 1."],read:["페이저의 벡터 합 길이와 주파수응답 |H|를 같은 Ω에서 비교하세요.","Compare vector-sum magnitude and |H| at the same Ω."]},
 filter:{title:["05 · 센서에서의 디지털 필터","05 · Digital filtering of a sensor"],goal:["원하는 저주파와 간섭 성분이 이동평균필터를 지나며 어떻게 달라지는지 분석합니다.","Analyze how averaging changes a useful signal and interference."],do:["주파수·진폭을 고정한 채 Filter length M부터 바꿔 보세요.","Hold frequencies and amplitude fixed; vary filter length M first."],read:["입출력 파형을 비교한 다음, 유효 성분과 잡음 성분의 이득을 읽으세요.","Compare input/output waveforms, then useful/noise gains."]},
 fft:{title:["06 · 유한 데이터와 FFT 누설","06 · Finite records and FFT leakage"],goal:["On-bin과 Off-bin을 비교해 누설의 원인을 찾고 Hann window, zero padding의 역할을 구분합니다.","Compare on-bin and off-bin tones, then distinguish Hann windowing from zero padding."],do:["1 On-bin → 2 Off-bin → 3 Hann → 4 Zero padding 버튼을 순서대로 실행하세요.","Run 1 On-bin → 2 Off-bin → 3 Hann → 4 Zero padding in order."],read:["원래 데이터 길이는 유지하면서 스펙트럼의 sidelobe와 bin 간격을 비교하세요.","Compare sidelobes and bin spacing without confusing padding with new measurements."]}
};
function lang(ko,en){var v=window.ELSLanguage&&window.ELSLanguage.get();return v==="en"?en:v==="ko"?ko:en+" · "+ko}
function lookup(id){return L[id]||L.periodic}
function periodicDo(){
 var s=state.periodic;
 if(s.mode==="rate")return lang("f=10 Hz를 고정하고 fs만 100→120→200 Hz로 변경하세요.","Fix f=10 Hz and change fs: 100→120→200 Hz.");
 if(s.mode==="alias")return lang("f Hz와 (fs−f) Hz를 비교하고 동일한 샘플에서 복원되는 주파수를 찾으세요.","Compare f Hz and (fs−f) Hz and identify the reconstructed baseband frequency.");
 return lang("fs=100 Hz를 고정한 채 f만 10→20→40 Hz로 변경하세요.","Hold fs=100 Hz and change f: 10→20→40 Hz.");
}
var predictions=Object.create(null);
function applyFlow(){
 var root=document.getElementById("content"),experiment=root&&root.querySelector(".experiment");
 if(!experiment)return;
 var data=lookup(active);
 var question=root.querySelector(".ss6-top-question");
 if(question){
   var qh=question.querySelector("h3");
   if(qh)qh.textContent=lang("01 · 먼저 예측하세요","01 · Predict");
   question.classList.add("ss6-step-card","ss6-step-predict");
   var note=document.createElement("p");
   note.className="ss6-no-gate-note";
   note.textContent=lang("정답을 입력하지 않아도 실습을 시작할 수 있습니다. 예상 결과를 기록하는 것은 선택 사항입니다.","You can start immediately. Writing a prediction is optional; no answer unlocks the sliders.");
   var details=question.querySelector("details");
   if(details)question.insertBefore(note,details);
   else question.appendChild(note);
   var field=document.createElement("textarea");
   field.className="ss6-prediction-note";
   field.rows=2;
   field.setAttribute("aria-label",lang("예측 메모 (선택)","Optional prediction note"));
   field.placeholder=lang("어떤 변화가 예상되나요? (선택)","What do you predict? (Optional)");
   field.value=predictions[active]||"";
   field.addEventListener("input",function(){predictions[active]=field.value});
   question.insertBefore(field,details||null);
 }
 var overview=document.createElement("div");overview.className="ss6-sequence-overview";
 overview.setAttribute("aria-label","Learning goal");
 overview.innerHTML='<div class="ss6-lesson-title"></div><p class="ss6-lesson-purpose"></p>';
 root.insertBefore(overview,question||experiment);
 var controls=experiment.querySelector(".controls");
 if(controls){
   controls.classList.add("ss6-step-card","ss6-step-controls");
   var controlHeading=controls.querySelector("h3");
   if(controlHeading)controlHeading.textContent=lang("02 · 값을 조절하세요","02 · Adjust parameters");
   var instruction=document.createElement("p");instruction.className="ss6-compact-instruction";
   instruction.id="ss6-compact-instruction";
   var h3=controls.querySelector("h3");
   if(h3)h3.insertAdjacentElement("afterend",instruction);
 }
 var charts=experiment.querySelector(".charts");
 if(charts){
   var observation=document.createElement("section");
   observation.className="ss6-observation-header ss6-step-card";
   observation.innerHTML='<h3>'+lang("03 · 그래프를 관찰하세요","03 · Observe the graphs")+'</h3><p class="ss6-reading-cue" id="ss6-reading-cue"></p>';
   charts.insertAdjacentElement("beforebegin",observation);
   charts.classList.add("ss6-step-graphs");
   var metrics=experiment.querySelector(".metrics");
   var learning=experiment.querySelector(".learning");
   if(metrics||learning){
     var interpret=document.createElement("section");
     interpret.className="ss6-interpretation ss6-step-card";
     interpret.innerHTML='<h3>'+lang("04 · 결과를 해석하세요","04 · Interpret the result")+'</h3>'
         +'<p class="ss6-interpretation-hint">'+lang("표시된 수치와 그래프를 비교하여 예측이 맞았는지 설명해 보세요.","Compare the values with the plots, then explain whether your prediction matched.")+'</p>';
     if(metrics)metrics.parentNode.insertBefore(interpret,metrics);
     else if(learning)learning.parentNode.insertBefore(interpret,learning);
     if(metrics)interpret.appendChild(metrics);
     if(learning)interpret.appendChild(learning);
   }
 }
 var guided=[["derivationPanel","Detailed derivation · 상세 수식 유도"],["readingPanel","Graph interpretation guide · 그래프 읽기 안내"]];
 guided.forEach(function(item){
   var panel=document.getElementById(item[0]);if(!panel)return;
   var fold=document.createElement("details");fold.className="ss6-guide-details";
   var heading=document.createElement("summary");heading.textContent=item[1];
   panel.parentNode.insertBefore(fold,panel);fold.appendChild(heading);fold.appendChild(panel);
 });
 var last=MODULE_ORDER.indexOf(active);
 if(last>=0&&last<MODULE_ORDER.length-1){
   var next=document.createElement("div");next.className="ss6-next-lesson";
   var button=document.createElement("button");button.type="button";
   button.textContent=lang("다음 실습으로 →","Next experiment →");
   button.addEventListener("click",function(){switchModule(MODULE_ORDER[last+1])});
   next.appendChild(button);experiment.appendChild(next);
 }
 var progress=document.createElement("div");progress.className="ss6-progress";
 var value=document.createElement("span"),mark=document.createElement("button");
 mark.type="button";
 var key="els-ss-lab-progress-v1",id="6:"+(last+1);
 function get(){try{var d=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(d)?d:[]}catch(e){return []}}
 function paint(){var list=get();mark.textContent=list.includes(id)?lang("학습 확인 취소","Undo reviewed"):lang("이 실습 학습 확인 ✓","Mark this lab reviewed ✓");value.textContent=lang("학습 확인","Reviewed")+": "+MODULE_ORDER.filter(function(_,i){return list.includes("6:"+(i+1))}).length+"/6"}
 mark.addEventListener("click",function(){var list=get();list=list.includes(id)?list.filter(function(x){return x!==id}):list.concat([id]);try{localStorage.setItem(key,JSON.stringify(list))}catch(e){}paint()});
 progress.appendChild(value);progress.appendChild(mark);
 if(last>=0){experiment.appendChild(progress);paint()}
 refreshFlow();
}
function refreshFlow(){
 var data=lookup(active),overview=document.querySelector(".ss6-sequence-overview");
 if(overview){overview.querySelector(".ss6-lesson-title").textContent=lang(data.title[0],data.title[1]);overview.querySelector(".ss6-lesson-purpose").textContent=lang(data.goal[0],data.goal[1]);}
 var instruct=document.getElementById("ss6-compact-instruction");
 if(instruct)instruct.textContent=(active==="periodic"?periodicDo():lang(data.do[0],data.do[1]));
 var cue=document.getElementById("ss6-reading-cue");
 if(cue)cue.textContent=lang(data.read[0],data.read[1]);
}
var previousRender=renderModule;
renderModule=function(){previousRender();applyFlow();document.dispatchEvent(new CustomEvent("ss-ch6-module-changed",{detail:{module:active}}))};
var previousUpdate=update;
update=function(){previousUpdate();refreshFlow()};
function setupToolbar(){
 var language=document.getElementById("ss6-language-picker");
 if(language&&window.ELSLanguage){
   window.ELSLanguage.bindSelect(language);
   language.addEventListener("change",function(){renderModule()});
 }
 var chapter=document.getElementById("ss6-chapter-picker");
 if(chapter)chapter.addEventListener("change",function(){
   if(chapter.value!=="6")location.href="./index.html#chapter="+chapter.value;
 });
}
setupToolbar();
renderModule();
})();