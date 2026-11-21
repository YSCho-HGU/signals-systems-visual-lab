/* Shared theme: one localStorage key for Studio and both courses. */
(()=>{"use strict";
const KEY="els-theme-v2",VALID=["neutral-dark","warm-dark","navy-dark","warm-neutral","white-clean"],DEFAULT="neutral-dark";
const root=document.documentElement;
function safeGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function inferLegacy(){
 const ss=safeGet("ss-visual-lab-theme");
 if(ss==="light")return "warm-neutral";
 if(ss==="dark")return "navy-dark";
 const c=safeGet("els-theme");
 if(c==="light")return "warm-neutral";
 if(c==="dark")return "navy-dark";
 return DEFAULT;
}
function selected(){
 const v=safeGet(KEY);
 // Migrate the retired pure-white option without losing user preference.
 return v==="white"?"white-clean":VALID.includes(v)?v:inferLegacy();
}
function apply(value,persist=true){
 const normalized=value==="white"?"white-clean":value;
 const v=VALID.includes(normalized)?normalized:DEFAULT;
 const light=["warm-neutral","white-clean"].includes(v);
 root.dataset.elsTheme=v;
 root.dataset.theme=light?"light":"dark";
 root.dataset.mode=light?"light":"dark";
 root.style.colorScheme=light?"only light":"dark";
 if(persist||safeGet(KEY)==="white")try{localStorage.setItem(KEY,v)}catch(e){}
 document.querySelectorAll("[data-els-theme-picker]").forEach(s=>{if(s.value!==v)s.value=v});
 const schemeMeta=document.querySelector('meta[name="color-scheme"]');
 if(schemeMeta)schemeMeta.content=light?"only light":"dark";
 const meta=document.querySelector('meta[name="theme-color"]');
 if(meta)meta.content={"neutral-dark":"#101010","warm-dark":"#1d2323","navy-dark":"#101827","warm-neutral":"#f7f6f2","white-clean":"#f4f6f7"}[v];
 window.dispatchEvent(new CustomEvent("els:themechange",{detail:{theme:v,scheme:light?"light":"dark"}}));
 return v;
}
window.ELSTheme={get:()=>root.dataset.elsTheme||selected(),set:apply,options:VALID};
function setup(){
 if(safeGet(KEY)==="white")try{localStorage.setItem(KEY,"white-clean")}catch(e){}
 const old=document.getElementById("theme-select"),portal=document.getElementById("theme");
 if(old&&old.tagName==="SELECT"&&!(old.hasAttribute("data-els-theme-picker")))old.setAttribute("data-els-theme-picker","");
 if(portal&&portal.tagName==="SELECT"&&!portal.hasAttribute("data-els-theme-picker"))portal.setAttribute("data-els-theme-picker","");
 if(!document.querySelector("[data-els-theme-picker]")){
  const top=document.querySelector(".toplinks,.topbar,.topnav,header .wrap,header,.links,.hero");
  if(top){
   const wrapper=document.createElement("label");wrapper.className="els-theme-control";
   const title=document.createElement("span");title.textContent="Theme";wrapper.append(title);
   const select=document.createElement("select");select.setAttribute("data-els-theme-picker","");select.setAttribute("aria-label","Theme / 화면 테마");
   wrapper.append(select);top.append(wrapper);
  }
 }
 document.querySelectorAll("[data-els-theme-picker]").forEach(select=>{
  select.replaceChildren();
  for(const [value,label] of [["neutral-dark","Neutral Dark (기본)"],["warm-dark","Warm Dark"],["navy-dark","Navy Dark"],["warm-neutral","Warm Neutral"],["white-clean","White Clean"]]){
   const o=document.createElement("option");o.value=value;o.textContent=label;select.append(o);
  }
  select.value=selected();
  select.addEventListener("change",()=>apply(select.value));
 });
 apply(selected(),false);
}
apply(selected(),false);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
window.addEventListener("storage",e=>{if(e.key===KEY)apply(selected(),false)});
})();
