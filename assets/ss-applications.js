/* Engineering cases + sonification: original synthetic signals, no media uploads.
   Audio starts only from an explicit click and always has a stop control. */
(()=>{"use strict";
const frame=document.getElementById("lab-frame");
const nativeCh6=!!document.querySelector(".ss6-site-header");
const head=document.querySelector("#lab-view .lab-head")||document.querySelector(".ss6-site-header");
if(!head||(!frame&&!nativeCh6))return;
const tr={
 en:{title:"Hear and explore real-world signals",harm:"Harmonic synthesis: hear how adding odd harmonics changes timbre.",filter:"Digital filtering: compare the same signal before and after low/high-pass filtering.",ecg:"Synthetic ECG-like waveform: inspect a simulated pulse pattern and smoothing.",synthetic:"Educational synthetic data, not a patient recording or diagnostic tool.",signal:"Input",output:"Output",mode:"Example",play:"Play 2 s",stop:"Stop",harmonic:"Odd harmonics",cutoff:"Cutoff (Hz)",low:"Low-pass",high:"High-pass",raw:"Unfiltered",filtered:"Filtered",noise:"Added noise",hint:"Try changing the controls, then compare the curves and the sound.",unavailable:"Audio unavailable in this browser.",audioNeed:"Audio plays only after clicking Play.",view:"Waveforms are computed illustrations, not a live microphone signal."},
 ko:{title:"소리와 실생활 신호로 이해하기",harm:"조화파 합성: 홀수 고조파를 추가하며 음색 변화를 들어보세요.",filter:"디지털 필터: 동일 신호를 저역통과/고역통과 전후로 비교하세요.",ecg:"합성 심전도 유사 파형: 모의 맥동 신호와 평활화 효과를 살펴보세요.",synthetic:"교육용 합성 데이터이며 실제 환자 기록이나 진단 도구가 아닙니다.",signal:"입력",output:"출력",mode:"예시",play:"2초 재생",stop:"중지",harmonic:"홀수 고조파 수",cutoff:"차단 주파수 (Hz)",low:"저역통과",high:"고역통과",raw:"필터 전",filtered:"필터 후",noise:"추가 잡음",hint:"조절값을 바꾼 뒤 파형과 소리를 비교하세요.",unavailable:"이 브라우저는 오디오 재생을 지원하지 않습니다.",audioNeed:"재생 버튼을 눌렀을 때만 소리가 납니다.",view:"파형은 계산한 교육용 예시이며 마이크 입력이 아닙니다."},
 mixed:{title:"Hear Signals · 소리와 실생활 신호",harm:"Add harmonics to hear timbre changes · 고조파가 음색을 어떻게 바꾸는지 들어보세요.",filter:"Compare audio before/after low/high-pass filtering · 필터 전후 소리 비교",ecg:"Synthetic ECG-like waveform · 합성 심전도 유사 신호",synthetic:"Synthetic educational data · 실제 심전도 진단용이 아닙니다.",signal:"Input · 입력",output:"Output · 출력",mode:"Example · 예시",play:"Play 2 s · 재생",stop:"Stop · 중지",harmonic:"Odd harmonics · 홀수 고조파",cutoff:"Cutoff (Hz) · 차단주파수",low:"Low-pass · 저역",high:"High-pass · 고역",raw:"Unfiltered · 전",filtered:"Filtered · 후",noise:"Noise · 잡음",hint:"Change controls, compare and explain · 조절 후 결과를 설명하세요.",unavailable:"Audio unavailable · 오디오 미지원",audioNeed:"Play starts on click · 클릭해야 소리가 재생됩니다.",view:"Computed educational signals · 계산된 교육용 신호"}
};
let mode="lowpass",h=5,cutoff=550,audio=null,audioTimer=null;
let nativeModule=window.__dtftApp?.active||"periodic";
const $=id=>document.getElementById(id),language=()=>window.ELSLanguage?.get()||"mixed",t=k=>tr[language()][k];
const style=document.createElement("style");style.textContent=`
#ss-applications{margin:10px 0 15px;padding:13px;border:1px solid var(--els-border,#555);border-radius:12px;background:var(--els-surface,#202220);color:var(--els-ink,#eee);font-size:13px}
#ss-applications .ss-app-controls{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:11px 0}
#ss-applications button,#ss-applications select{padding:8px 11px;min-height:42px;border-radius:8px;border:1px solid var(--els-border,#777);background:var(--els-surface-alt,#333);color:inherit;font:inherit}
#ss-applications label{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
#ss-applications input[type="range"]{min-width:110px;touch-action:pan-y}
#ss-applications canvas{width:100%;height:auto;aspect-ratio:3.6/1;border-radius:7px;background:var(--els-surface-alt,#272727);display:block}
#ss-applications p{line-height:1.5;margin:6px 0;color:var(--els-muted,#bbb)}
#ss-applications .ss-app-note{font-size:11px}
@media(max-width:600px){#ss-applications{padding:10px}#ss-applications .ss-app-controls{gap:8px}#ss-applications button{min-height:44px}}
`;document.head.append(style);
const panel=document.createElement("section");panel.id="ss-applications";panel.hidden=true;
panel.innerHTML='<strong id="ss-app-title"></strong><p id="ss-app-description"></p><div id="ss-app-controls" class="ss-app-controls"></div><canvas id="ss-app-canvas" width="720" height="200" role="img" aria-label="Synthetic signal input and output graph"></canvas><p id="ss-app-status" class="ss-app-note" aria-live="polite"></p><p id="ss-app-disclaimer" class="ss-app-note"></p>';
const anchor=document.getElementById("ss-progress-panel");(anchor||head).after(panel);
const controls=$("ss-app-controls"),ctx=$("ss-app-canvas").getContext("2d");
function parseChapter(){return nativeCh6?6:Number((location.hash.match(/^#chapter=(\d+)/)||[])[1])||0}
function makeSamples(kind,N=720){
 const x=new Float64Array(N),y=new Float64Array(N);
 for(let i=0;i<N;i++){
  const u=i/N;
  if(kind===3){let v=0;for(let k=1;k<=h;k++)v+=Math.sin(2*Math.PI*(2*k-1)*4*u)/(2*k-1);x[i]=v*0.7;y[i]=v*0.7}
  else if(kind===6){const clean=.55*Math.sin(2*Math.PI*5*u);const interference=.32*Math.sin(2*Math.PI*35*u)+.12*Math.sin(2*Math.PI*71*u);x[i]=clean+interference}
  else {const phase=(u*3)%1;const gaussian=(at,sigma,amp)=>amp*Math.exp(-.5*((phase-at)/sigma)**2);x[i]=gaussian(.15,.023,.09)-gaussian(.36,.012,.15)+gaussian(.4,.009,1)-gaussian(.435,.016,.24)+gaussian(.7,.06,.28)+.10*Math.sin(2*Math.PI*67*u)}
 }
 if(kind===6||kind===1){
   // Audio and graph are independent *examples*. This graph applies a
   // windowed-sinc discrete FIR LPF; the sound uses a BiquadFilter.
   // For Chapter 6, 5 cycles correspond to a 220-Hz reference tone.
   const fs=kind===6?N*220/5:N,fc=kind===6?cutoff:fs/18;
   const radius=kind===6?96:12,kernel=[];
   let gain=0;
   for(let j=-radius;j<=radius;j++){
     const ratio=fc/fs;
     const sinc=j===0?2*ratio:Math.sin(2*Math.PI*ratio*j)/(Math.PI*j);
     const window=.5+.5*Math.cos(Math.PI*j/radius);
     kernel.push(sinc*window);gain+=sinc*window;
   }
   for(let i=0;i<N;i++){
     let smoothed=0;for(let j=-radius;j<=radius;j++){
       const index=i+j;
       // Periodic boundary for the demonstration signal.
       smoothed+=x[(index%N+N)%N]*kernel[j+radius]/gain;
     }
     y[i]=kind===6&&mode==="highpass"?x[i]-smoothed:smoothed;
   }
 }
 return {x,y};
}
function plot(kind){
 const cv=$("ss-app-canvas"),d=makeSamples(kind),w=cv.width,H=cv.height;
 ctx.fillStyle="#11211f";ctx.fillRect(0,0,w,H);
 ctx.strokeStyle="rgba(160,170,170,.35)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(w,H/2);ctx.stroke();
 for(const [values,color] of [[d.x,"#d3b77a"],[d.y,"#85ceb8"]]){
  ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=2;
  for(let i=0;i<values.length;i++){const xx=i,yy=H/2-values[i]*H*.33;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}ctx.stroke();
 }
 ctx.font="13px system-ui";ctx.fillStyle="#d3b77a";ctx.fillText(t("signal"),12,19);ctx.fillStyle="#85ceb8";ctx.fillText(t("output"),145,19);
}
function stop(){
 if(audioTimer){clearTimeout(audioTimer);audioTimer=null}
 if(audio){try{audio.stop()}catch(e){}audio=null}
 $("ss-app-status").textContent=t("audioNeed");
}
function play(ch){
 stop();
 const AC=window.AudioContext||window.webkitAudioContext;
 if(!AC){$("ss-app-status").textContent=t("unavailable");return}
 const context=window.__ssAudioContext||(window.__ssAudioContext=new AC());
 if(context.state==="suspended")context.resume();
 // Original harmonic tone; limit gain and ramp to avoid clicks.
 const osc=[],gain=context.createGain(),filter=context.createBiquadFilter(),start=context.currentTime;
 gain.gain.setValueAtTime(0,start);
 gain.gain.linearRampToValueAtTime(.085,start+.045);
 gain.gain.setValueAtTime(.085,start+1.8);
 gain.gain.linearRampToValueAtTime(0,start+2);
 if(ch===6){filter.type=mode==="highpass"?"highpass":"lowpass";filter.frequency.value=cutoff;filter.Q.value=.707;filter.connect(gain)}
 gain.connect(context.destination);
 const harmonics=ch===3?h:10;
 for(let k=1;k<=harmonics;k++){
   const freq=220*(2*k-1);if(freq>=context.sampleRate*.45)break;
   const o=context.createOscillator(),g=context.createGain();o.type="sine";o.frequency.value=freq;g.gain.value=1/(2*k-1);
   o.connect(g);g.connect(ch===6?filter:gain);o.start(start);o.stop(start+2.02);osc.push(o);
 }
 audio={stop(){for(const o of osc)try{o.stop()}catch(e){}}};
 audioTimer=setTimeout(()=>{audio=null;audioTimer=null;$("ss-app-status").textContent=t("audioNeed")},2100);
 $("ss-app-status").textContent=ch===3?t("harm"):t("filter");
}
function control(kind,code){
 const b=document.createElement("button");b.type="button";b.textContent=t(kind);b.addEventListener("click",code);controls.append(b);return b;
}
function render(){
 const ch=parseChapter();stop();controls.replaceChildren();panel.hidden=nativeCh6?(nativeModule!=="filter"):![1,3,6].includes(ch);if(panel.hidden)return;
 $("ss-app-title").textContent=t("title");
 $("ss-app-description").textContent=t(ch===3?"harm":ch===6?"filter":"ecg");
 $("ss-app-disclaimer").textContent=t("synthetic")+" "+t("view");
 if(ch===3){
  const lab=document.createElement("label");lab.textContent=t("harmonic");
  const range=document.createElement("input");range.type="range";range.min="1";range.max="10";range.step="1";range.value=String(h);
  const output=document.createElement("output");output.textContent=h;
  range.addEventListener("input",()=>{h=Number(range.value);output.textContent=h;plot(ch)});
  lab.append(range,output);controls.append(lab);
 }else if(ch===6){
  const select=document.createElement("select");
  for(const [v,name] of [["lowpass",t("low")],["highpass",t("high")]]){const o=new Option(name,v);select.add(o)}
  select.value=mode;select.setAttribute("aria-label",t("mode"));select.addEventListener("change",()=>{mode=select.value;plot(ch)});controls.append(select);
  const lab=document.createElement("label");lab.textContent=t("cutoff");
  const range=document.createElement("input");range.type="range";range.min="130";range.max="3000";range.step="10";range.value=String(cutoff);
  const output=document.createElement("output");output.textContent=cutoff;
  range.addEventListener("input",()=>{cutoff=Number(range.value);output.textContent=cutoff;plot(ch)});
  lab.append(range,output);controls.append(lab);
 }
 if(ch===3||ch===6){control("play",()=>play(ch));control("stop",stop)}
 plot(ch);$("ss-app-status").textContent=t("audioNeed");
}
document.addEventListener("visibilitychange",()=>{if(document.hidden)stop()});
window.addEventListener("hashchange",render);
if(nativeCh6){
  document.addEventListener("ss-ch6-module-changed",event=>{
    nativeModule=event.detail?.module||document.querySelector(".sidebar [data-nav].active")?.dataset.nav||"periodic";
    // This module is an optional real-world sound demonstration for the sensor
    // filter lesson. Move the real node so playback is stopped on lesson exit.
    const anchor=document.querySelector(".ss6-interpretation")||document.querySelector(".ss6-step-graphs");
    if(anchor)anchor.insertAdjacentElement("afterend",panel);
    render();
  });
}
window.ELSLanguage?.subscribe(render);
render();
})();