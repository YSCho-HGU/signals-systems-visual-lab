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
 root.replaceChildren(layout);
 var main=root.closest('main'),navPanel=document.getElementById('nav');
 if(main&&navPanel){
  var work=node('div','ss7-workspace'),workspaceMain=node('div','ss7-workspace-content');
  var foot=main.querySelector(':scope > .foot');
  main.insertBefore(work,navPanel);work.appendChild(navPanel);work.appendChild(workspaceMain);
  workspaceMain.appendChild(root);if(foot)workspaceMain.appendChild(foot);
 }
 var chapterHeader=document.querySelector('body > header > p');
 if(chapterHeader)chapterHeader.textContent='Predict → Change → Observe → Explain · Interactive Sampling Lab';
 function updatePrompt(){var q=document.getElementById('check-q');prompt.textContent=q?q.textContent.trim():'Predict how the output changes when a parameter moves.'}
 updatePrompt();
 var nav=document.getElementById('nav');if(nav)nav.addEventListener('click',function(){queueMicrotask(updatePrompt)});
 window.__ss7Standard={ready:true,stages:4,chapter:7,experiments:document.querySelectorAll('#nav button').length};
}
window.addEventListener('DOMContentLoaded',init);
})();
