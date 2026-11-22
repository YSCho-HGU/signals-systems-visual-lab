/* Chapter 7 structural UI standard. Preserve existing render/draw and control IDs. */
(function(){
"use strict";
function node(tag,cls,html){var el=document.createElement(tag);el.className=cls;if(html!=null)el.innerHTML=html;return el}
function addHead(stage,n,label,detail){stage.appendChild(node('div','ss7-stage-head','<span class="ss7-stage-index">'+n+'</span><span>'+label+' <small>'+detail+'</small></span>'))}
function init(){
 // Static native page owns all four stages. Never detach the authored controls,
 // plots, or derivation: a failed enhancement must not erase the lesson.
 if(window.__ss7Standard?.ready)return;
 var layout=document.querySelector('.ss7-standard-layout');
 var change=layout&&layout.querySelector('.ss7-stage-change');
 var observe=layout&&layout.querySelector('.ss7-stage-observe');
 var controls=document.getElementById('controls');
 var prompt=layout&&layout.querySelector('.ss7-predict-prompt');
 if(!layout||!change||!observe||!controls||!prompt)return;
 if(!document.querySelector('#title')?.textContent.trim())return;
 var concept=node('div','ss7-sampling-concepts');
 concept.innerHTML='<strong>From x(t) to x[n]</strong><p>Sample at t = nTₛ, where Tₛ = 1/fₛ. Then x[n] = cos(Ωn), Ω = 2πf/fₛ rad/sample.</p><div class="ss7-sampling-metrics" aria-live="polite"></div><p class="ss7-sampling-guidance">Change f with fₛ fixed: the discrete-time frequency changes although the index spacing stays at one sample. Change fₛ with f fixed: the sampling instants and x[n] change together. Compare frequencies that differ by an integer multiple of fₛ to investigate aliasing.</p>';
 change.appendChild(concept);
 // Periodicity demonstration: identical DT samples for Ω and Ω+2πk.
 var periodic=node('section','ss7-periodicity');
 periodic.innerHTML='<div class="ss7-periodicity-title">Discrete-time frequency periodicity</div><label for="ss7-period-k">Integer frequency shift k</label><select id="ss7-period-k"><option value="-2">−2</option><option value="-1">−1</option><option value="0">0</option><option value="1" selected>+1</option><option value="2">+2</option></select><div class="ss7-period-equation" aria-live="polite"></div><div class="ss7-ct-compare"><div class="ss7-ct-title">Continuous-time signals: f, f + fₛ, f − fₛ</div><div class="ss7-ct-plot"></div><div class="ss7-ct-legend"><span>● f</span><span>● f + fₛ</span><span>● f − fₛ</span><span>◆ sampled values</span></div></div><div class="ss7-period-plot"></div><p class="ss7-period-note">The orange circles (Ω) and teal crosses (Ω + 2πk) coincide at every integer n. This is discrete-time frequency periodicity, not an assertion that the underlying continuous-time frequencies are identical.</p>';
 // Supplementary alias-family analysis needs the full workspace width, not a third nested column in Observe.

 var animate=node('div','ss7-alias-animate');
 animate.innerHTML='<button type="button" class="ss7-alias-play">Play</button><button type="button" class="ss7-alias-reset">Reset</button><label>n <input type="range" class="ss7-alias-frame" min="0" max="8" value="0" step="1"></label><output class="ss7-alias-status">n = 0</output>';
 periodic.querySelector('.ss7-ct-compare').appendChild(animate);
 var flow=node('div','ss7-learning-flow');
 flow.innerHTML='<strong>One experiment, three connected observations</strong><ol><li>Compare the continuous-time signals f, f + fₛ, and f − fₛ.</li><li>Play or scrub sampling instants t = nTₛ. Their sampled values coincide.</li><li>Change k below: Ω and Ω + 2πk give the same sequence at integer n.</li></ol>';
 periodic.insertBefore(flow,periodic.querySelector('.ss7-ct-compare'));
 layout.insertBefore(periodic,layout.querySelector('.ss7-stage-explain'));


 var frame=0,running=false,raf=0,last=0,sampleF=0,sampleFs=1;
 function paintFrame(){
  var svg=periodic.querySelector('.ss7-ct-plot svg');if(!svg)return;
  svg.querySelectorAll('.ss7-alias-dot').forEach(function(dot,i){dot.setAttribute('opacity',i<=frame?'1':'.12');dot.setAttribute('r',i===frame?'5.5':'4')});
  var cursor=svg.querySelector('.ss7-alias-cursor');if(cursor){var x=38+(520-38-12)*frame/8;cursor.setAttribute('x1',x);cursor.setAttribute('x2',x)}
  animate.querySelector('.ss7-alias-frame').value=frame;
  animate.querySelector('.ss7-alias-status').textContent='n = '+frame+' · t = '+(1000*frame/sampleFs).toFixed(2)+' ms · x[n] = '+Math.cos(2*Math.PI*sampleF*frame/sampleFs).toFixed(3);
 }
 function pauseFrame(){running=false;if(raf)cancelAnimationFrame(raf);raf=0;last=0;animate.querySelector('.ss7-alias-play').textContent='Play'}
 function tickFrame(time){if(!running)return;if(!last)last=time;if(time-last>=600){frame=(frame+1)%9;last=time;paintFrame()}raf=requestAnimationFrame(tickFrame)}
 animate.querySelector('.ss7-alias-play').addEventListener('click',function(){if(running){pauseFrame();return}running=true;this.textContent='Pause';raf=requestAnimationFrame(tickFrame)});
 animate.querySelector('.ss7-alias-reset').addEventListener('click',function(){pauseFrame();frame=0;paintFrame()});
 animate.querySelector('.ss7-alias-frame').addEventListener('input',function(){pauseFrame();frame=Number(this.value);paintFrame()});
 document.addEventListener('visibilitychange',function(){if(document.hidden)pauseFrame()});

 var shiftSelect=periodic.querySelector('#ss7-period-k');

 function drawCTAliases(f,fs){
  var w=520,h=180,l=38,r=12,top=12,bottom=30,mid=(top+h-bottom)/2,amp=48;
  var duration=8/fs,colors=['#168c91','#cc8841','#9864b3'],freqs=[f,f+fs,f-fs];
  var graph='<line x1="'+l+'" y1="'+mid+'" x2="'+(w-r)+'" y2="'+mid+'" stroke="currentColor" opacity=".35"/>';
  for(var j=0;j<3;j++){
   var points=[];
   for(var i=0;i<=700;i++){
    var t=duration*i/700,x=l+(w-l-r)*i/700,y=mid-amp*Math.cos(2*Math.PI*freqs[j]*t);
    points.push(x.toFixed(2)+','+y.toFixed(2));
   }
   graph+='<polyline fill="none" stroke="'+colors[j]+'" stroke-width="'+(j===0?2.5:1.5)+'" '+(j===2?'stroke-dasharray="5 4"':'')+' points="'+points.join(' ')+'"/>';
  }
  for(var n=0;n<=8;n++){
   var x=l+(w-l-r)*n/8,y=mid-amp*Math.cos(2*Math.PI*f*n/fs);
   graph+='<circle class="ss7-alias-dot" cx="'+x+'" cy="'+y+'" r="4" fill="var(--els-ink,#222)" stroke="var(--els-surface,#fff)" stroke-width="1.3"/>';
   if(n%2===0)graph+='<text x="'+x+'" y="'+(h-9)+'" font-size="10" text-anchor="middle" fill="currentColor">'+n+'</text>';
  }
  graph+='<line class="ss7-alias-cursor" x1="'+l+'" x2="'+l+'" y1="'+top+'" y2="'+(h-bottom)+'" stroke="var(--els-ink,#222)" stroke-width="1.3" stroke-dasharray="4 4"/>';
  periodic.querySelector('.ss7-ct-plot').innerHTML='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Three different continuous-time cosines with coincident samples at t equals n divided by sampling frequency">'+graph+'<text x="'+(w-r)+'" y="'+(h-9)+'" font-size="11" text-anchor="end" fill="currentColor">nTₛ</text></svg>';
  sampleF=f;sampleFs=fs;paintFrame();
  periodic.querySelector('.ss7-ct-title').textContent='Continuous time: '+f+' Hz, '+(f+fs)+' Hz, '+(f-fs)+' Hz (t = 0 … '+(1000*duration).toFixed(1)+' ms)';
 }
 function drawPeriodicity(omega){
  var k=Number(shiftSelect.value),shifted=omega+2*Math.PI*k;
  var eq=periodic.querySelector('.ss7-period-equation');
  eq.textContent='Ω = '+omega.toFixed(3)+' rad/sample; Ω + 2π('+k+') = '+shifted.toFixed(3)+' rad/sample';
  var w=520,h=180,l=35,r=15,top=15,bottom=31,mid=(top+h-bottom)/2,scale=(h-bottom-top)*0.38;
  var lines='<line x1="'+l+'" y1="'+mid+'" x2="'+(w-r)+'" y2="'+mid+'" stroke="currentColor" opacity=".4"/>';
  for(var n=0;n<=12;n++){
   var x=l+(w-l-r)*n/12,y=mid-scale*Math.cos(omega*n),y2=mid-scale*Math.cos(shifted*n);
   lines+='<line x1="'+x+'" y1="'+mid+'" x2="'+x+'" y2="'+y+'" stroke="#cc8841" stroke-width="1.4"/>';
   lines+='<circle cx="'+x+'" cy="'+y+'" r="4.1" fill="#cc8841"/>';
   lines+='<path d="M'+(x-3.5)+' '+(y2-3.5)+' l7 7 M'+(x+3.5)+' '+(y2-3.5)+' l-7 7" stroke="#168c91" stroke-width="1.8" fill="none"/>';
   if(n%2===0)lines+='<text x="'+x+'" y="'+(h-9)+'" text-anchor="middle" font-size="11" fill="currentColor">'+n+'</text>';
  }
  periodic.querySelector('.ss7-period-plot').innerHTML='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Coincident samples of cos(Ωn) and cos((Ω+2πk)n) for integer n">'+lines+'<text x="'+(w-r)+'" y="'+(h-9)+'" text-anchor="end" font-size="12" fill="currentColor">n</text></svg><div class="ss7-period-legend"><span><i class="ss7-period-dot"></i>cos(Ωn)</span><span><i class="ss7-period-cross">×</i>cos((Ω+2πk)n)</span></div>';
 }
 shiftSelect.addEventListener('change',syncSampling);
 function syncSampling(){
  var isFirst=/^7\.1(?:\D|$)/.test((document.getElementById('title')||{}).textContent||'');
  if(!isFirst)pauseFrame();
  layout.classList.toggle('ss7-sampling-active',isFirst);
  if(!isFirst)return;
  var sliders=Array.from(controls.querySelectorAll('input[type="range"]'));
  var f=Number(sliders[0]&&sliders[0].value),fs=Number(sliders[1]&&sliders[1].value);
  var metrics=concept.querySelector('.ss7-sampling-metrics');
  if(!Number.isFinite(f)||!Number.isFinite(fs)||fs<=0){metrics.textContent='Adjust the frequency and sampling-rate controls.';return}
  var omega=2*Math.PI*f/fs,cycles=f/fs;
  drawPeriodicity(omega);
  pauseFrame();frame=0;drawCTAliases(f,fs);
  metrics.textContent='f = '+f+' Hz   ·   fₛ = '+fs+' Hz   ·   Tₛ = '+(1000/fs).toFixed(2)+' ms   ·   f/fₛ = '+cycles.toFixed(3)+' cycles/sample   ·   Ω = '+omega.toFixed(3)+' rad/sample';
 }
 controls.addEventListener('input',syncSampling);
 document.addEventListener('ss-ch7-experiment-change',syncSampling);
 syncSampling();

 function updatePrompt(){prompt.textContent=window.SSChapter7?.currentCheckQuestion||window.SSContentModel.text('Predict how the output changes when a parameter moves.')}
 updatePrompt();
 document.addEventListener('ss-ch7-experiment-change',updatePrompt);
 document.addEventListener('els-language-change',()=>requestAnimationFrame(updatePrompt));
 window.__ss7Standard={ready:true,stages:4,chapter:7,experiments:window.SSChapter7?.experimentCount||0,sidebarColumns:1};
}
// The native core installs/render() in its own DOMContentLoaded handler. Initialize after it.
window.addEventListener('DOMContentLoaded',function(){requestAnimationFrame(init)});
})();
