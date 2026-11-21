/* Chapter 7 structural UI standard. Preserve existing render/draw and control IDs. */
(function(){
"use strict";
function node(tag,cls,html){var el=document.createElement(tag);el.className=cls;if(html!=null)el.innerHTML=html;return el}
function addHead(stage,n,label,detail){stage.appendChild(node('div','ss7-stage-head','<span class="ss7-stage-index">'+n+'</span><span>'+label+' <small>'+detail+'</small></span>'))}
function init(){
 if(document.documentElement.classList.contains('ss7-standard'))return;
 var root=document.querySelector('.experiment'),left=root&&root.querySelector(':scope > section.card'),aside=root&&root.querySelector(':scope > aside.card');
 if(!root||!left||!aside)return;
 document.documentElement.classList.add('ss7-standard');
 var layout=node('div','ss7-standard-layout'),lead=node('section','ss7-card ss7-chapter-lead');
 var eyebrow=left.querySelector('.eyebrow'),title=document.getElementById('title'),intro=document.getElementById('intro');
 if(eyebrow)lead.appendChild(eyebrow);lead.appendChild(title);lead.appendChild(intro);
 var predict=node('section','ss7-card ss7-stage-predict');addHead(predict,1,'Predict','Think before changing parameters');
 var prompt=node('p','ss7-predict-prompt');predict.appendChild(prompt);
 var pair=node('div','ss7-stage-pair');
 var change=node('section','ss7-card ss7-stage-change');addHead(change,2,'Change','Adjust parameters');
 var controls=document.getElementById('controls');change.appendChild(controls);
 var observe=node('section','ss7-card ss7-stage-observe');addHead(observe,3,'Observe','Read the graphs');
 for(var id of ['plots','insight']){var el=document.getElementById(id);if(el)observe.appendChild(el)}
 var hint=left.querySelector('.hint');if(hint)observe.appendChild(hint);
 pair.appendChild(change);pair.appendChild(observe);
 var explain=node('section','ss7-card ss7-stage-explain');addHead(explain,4,'Explain','Guided derivation and interpretation');
 var grid=node('div','ss7-explain-grid'),deriv=node('div','ss7-derivation'),interpret=node('div','ss7-interpret');
 for(var cls of ['deriv-top','progress']){var el=aside.querySelector('.'+cls);if(el)deriv.appendChild(el)}
 for(var id of ['step-content']){var el=document.getElementById(id);if(el)deriv.appendChild(el)}
 var buttons=aside.querySelector('.step-buttons');if(buttons)deriv.appendChild(buttons);
 var reading=aside.querySelector('.reading'),check=document.getElementById('check');if(reading)interpret.appendChild(reading);if(check)interpret.appendChild(check);
 grid.appendChild(deriv);grid.appendChild(interpret);explain.appendChild(grid);
 layout.appendChild(lead);layout.appendChild(predict);layout.appendChild(pair);layout.appendChild(explain);
 // Sampling 7.1: keep controls adjacent to both synchronized CT/DT plots.
 // No numerical simulation code is replaced; the existing draw() owns both graphs.
 var concept=node('div','ss7-sampling-concepts');
 concept.innerHTML='<strong>From x(t) to x[n]</strong><p>Sample at t = nTₛ, where Tₛ = 1/fₛ. Then x[n] = cos(Ωn), Ω = 2πf/fₛ rad/sample.</p><div class="ss7-sampling-metrics" aria-live="polite"></div><p class="ss7-sampling-guidance">Change f with fₛ fixed: the discrete-time frequency changes although the index spacing stays at one sample. Change fₛ with f fixed: the sampling instants and x[n] change together. Compare frequencies that differ by an integer multiple of fₛ to investigate aliasing.</p>';
 change.appendChild(concept);
 // Periodicity demonstration: identical DT samples for Ω and Ω+2πk.
 var periodic=node('section','ss7-periodicity');
 periodic.innerHTML='<div class="ss7-periodicity-title">Discrete-time frequency periodicity</div><label for="ss7-period-k">Integer frequency shift k</label><select id="ss7-period-k"><option value="-2">−2</option><option value="-1">−1</option><option value="0">0</option><option value="1" selected>+1</option><option value="2">+2</option></select><div class="ss7-period-equation" aria-live="polite"></div><div class="ss7-ct-compare"><div class="ss7-ct-title">Continuous-time signals: f, f + fₛ, f − fₛ</div><div class="ss7-ct-plot"></div><div class="ss7-ct-legend"><span>● f</span><span>● f + fₛ</span><span>● f − fₛ</span><span>◆ sampled values</span></div></div><div class="ss7-period-plot"></div><p class="ss7-period-note">The orange circles (Ω) and teal crosses (Ω + 2πk) coincide at every integer n. This is discrete-time frequency periodicity, not an assertion that the underlying continuous-time frequencies are identical.</p>';
 observe.appendChild(periodic);
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
   graph+='<circle cx="'+x+'" cy="'+y+'" r="3.8" fill="#111" stroke="#fff" stroke-width="1.3"/>';
   if(n%2===0)graph+='<text x="'+x+'" y="'+(h-9)+'" font-size="10" text-anchor="middle" fill="currentColor">'+n+'</text>';
  }
  periodic.querySelector('.ss7-ct-plot').innerHTML='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Three different continuous-time cosines with coincident samples at t equals n divided by sampling frequency">'+graph+'<text x="'+(w-r)+'" y="'+(h-9)+'" font-size="11" text-anchor="end" fill="currentColor">nTₛ</text></svg>';
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
  layout.classList.toggle('ss7-sampling-active',isFirst);
  if(!isFirst)return;
  var sliders=Array.from(controls.querySelectorAll('input[type="range"]'));
  var f=Number(sliders[0]&&sliders[0].value),fs=Number(sliders[1]&&sliders[1].value);
  var metrics=concept.querySelector('.ss7-sampling-metrics');
  if(!Number.isFinite(f)||!Number.isFinite(fs)||fs<=0){metrics.textContent='Adjust the frequency and sampling-rate controls.';return}
  var omega=2*Math.PI*f/fs,cycles=f/fs;
  drawPeriodicity(omega);
  drawCTAliases(f,fs);
  metrics.textContent='f = '+f+' Hz   ·   fₛ = '+fs+' Hz   ·   Tₛ = '+(1000/fs).toFixed(2)+' ms   ·   f/fₛ = '+cycles.toFixed(3)+' cycles/sample   ·   Ω = '+omega.toFixed(3)+' rad/sample';
 }
 controls.addEventListener('input',syncSampling);
 document.addEventListener('ss-ch7-experiment-change',syncSampling);
 syncSampling();

 root.replaceChildren(layout);
 // Keep the shared ss-vertical-layout sidebar. A second sidebar causes the toggle to occupy a separate column.
 var chapterHeader=document.querySelector('body > header > p');
 if(chapterHeader)chapterHeader.textContent='Predict → Change → Observe → Explain · Interactive Sampling Lab';
 function updatePrompt(){var q=document.getElementById('check-q');prompt.textContent=q?q.textContent.trim():'Predict how the output changes when a parameter moves.'}
 updatePrompt();
 document.addEventListener('ss-ch7-experiment-change',updatePrompt);
 window.__ss7Standard={ready:true,stages:4,chapter:7,experiments:window.SSChapter7?.experimentCount||0,sidebarColumns:1};
}
window.addEventListener('DOMContentLoaded',init);
})();
