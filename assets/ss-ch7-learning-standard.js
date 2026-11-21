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
 function syncSampling(){
  var isFirst=/^7\\.1(?:\\D|$)/.test((document.getElementById('title')||{}).textContent||'');
  layout.classList.toggle('ss7-sampling-active',isFirst);
  if(!isFirst)return;
  var sliders=Array.from(controls.querySelectorAll('input[type="range"]'));
  var f=Number(sliders[0]&&sliders[0].value),fs=Number(sliders[1]&&sliders[1].value);
  var metrics=concept.querySelector('.ss7-sampling-metrics');
  if(!Number.isFinite(f)||!Number.isFinite(fs)||fs<=0){metrics.textContent='Adjust the frequency and sampling-rate controls.';return}
  var omega=2*Math.PI*f/fs,cycles=f/fs;
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
