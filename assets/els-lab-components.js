/* Engineering Learning Studio — reusable mathematical display and lab workbench.
 * Opt-in component: no automatic DOM migration, no change to saved student data.
 */
(function(global){
  "use strict";
  if(global.ELSLabUI)return;
  function renderMath(target,tex,options){
    options=options||{};
    if(!target||typeof tex!=="string")return false;
    target.dataset.elsLatex=tex;
    var paint=function(){
      if(!target.isConnected)return false;
      if(global.katex&&typeof global.katex.render==="function"){
        try{
          global.katex.render(tex,target,{displayMode:options.display!==false,
            throwOnError:true,output:"htmlAndMathml",strict:"ignore"});
          target.dataset.mathRendered="katex";
          return true;
        }catch(error){
          target.dataset.mathError=String(error.message||error).slice(0,160);
        }
      }
      if(options.fallbackHTML){
        target.innerHTML=options.fallbackHTML;
      }else{
        target.textContent=options.fallbackText||tex;
      }
      target.dataset.mathRendered="fallback";
      return false;
    };
    var success=paint();
    if(!success&&document.readyState!=="complete"){
      global.addEventListener("load",paint,{once:true});
    }
    return success;
  }
  function renderMany(root,values,selector){
    if(!root)return;
    var nodes=root.querySelectorAll(selector||"[data-els-math]");
    nodes.forEach(function(node,index){
      var item=typeof values==="function"?values(index,node):values[index];
      if(typeof item==="string")renderMath(node,item,{display:true,fallbackHTML:node.innerHTML});
    });
  }
  function mountWorkbench(args){
    if(!args||!args.experiment||!args.controls||!args.charts)return null;
    var root=args.experiment,controls=args.controls,charts=args.charts;
    var graphHeader=args.graphHeader,body=args.body||root.querySelector(".body-col");
    if(!body||!graphHeader)return null;
    // Move existing nodes to retain input listeners, canvases, IDs, and state.
    var panel=document.createElement("div");
    panel.className="els-lab-workbench ss6-control-plot-workspace";
    panel.dataset.elsLab=args.module||"unknown";
    panel.dataset.ss6Module=args.module||"unknown";
    var plots=document.createElement("div");
    plots.className="els-lab-graphs ss6-workbench-graphs";
    body.insertBefore(panel,graphHeader);
    panel.appendChild(controls);panel.appendChild(plots);
    if(args.presets){
      args.presets.classList.add("els-lab-presets","ss6-workbench-presets");
      plots.appendChild(args.presets);
    }
    plots.appendChild(graphHeader);
    plots.appendChild(charts);
    return panel;
  }
  function addStepNumber(container,number){
    if(!container)return;
    container.dataset.elsStep=String(number);
    if(container.querySelector(":scope > .els-step-number"))return;
    var badge=document.createElement("span");
    badge.className="els-step-number ss6-controls-number";
    badge.textContent=String(number);
    badge.setAttribute("aria-hidden","true");
    container.insertBefore(badge,container.firstChild);
  }
  global.ELSLabUI=Object.freeze({
    version:"1.0.0",renderMath:renderMath,renderMany:renderMany,
    mountWorkbench:mountWorkbench,addStepNumber:addStepNumber
  });
})(window);
