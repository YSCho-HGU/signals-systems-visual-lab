// Run: node tests/ss6-math-regression.mjs
// Static and executable model tests; browser rendering still requires visual QA.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const read = path => readFileSync(new URL("../"+path,import.meta.url),"utf8");
const window = {
  ELSLabUI: {
    renderMath: (element,tex)=>{element.lastLatex=tex;return true;}
  }
};
runInNewContext(read("assets/ss-ch6-math.js"),{window,Math,Number,Object});
const math=window.ELSChapterSixMath;
assert.ok(math);
const states={
  phase:{m:7,n0:3},phasor:{m:4,w:.5},
  filter:{m:4,fu:2,fn:45},fft:{n:"512",pad:"4",f:4.15,window:"hann"}
};
const pairs={kind:"exp",m:8,n0:3,a:.7};
let tested=0;
for(const kind of ["impulse","shift","exp","rect","sym"]){
  const arr=math.models("pairs",{...pairs,kind});
  assert.equal(arr.length,4);
  assert.ok(arr.every(x=>typeof x==="string"&&x.length>3&&!x.includes("undefined")&&!x.includes("NaN")));
  tested++;
}
for(const [name,state] of Object.entries(states)){
  const arr=math.models(name,state);
  assert.equal(arr.length,4);
  assert.ok(arr.every(x=>typeof x==="string"&&!x.includes("undefined")&&!x.includes("NaN")));
  tested++;
}
assert.match(math.models("fft",states.fft)[3],/0\.06250/);
assert.match(math.models("filter",states.filter)[3],/0\.9902/);
assert.match(math.models("phasor",states.phasor)[3],/0\.0000/);
const flow=read("assets/ss-ch6-learning-flow.js");
const page=read("chapter6.html");
const css=read("assets/els-lab-components.css");
assert.ok(flow.includes("ELSLabUI.mountWorkbench("));
assert.ok(page.includes("ELSChapterSixMath.renderGuide("));
assert.ok(page.includes("els-lab-components.js?v=1"));
assert.ok(page.includes("ss-ch6-math.js?v=1"));
assert.ok(css.includes(".els-lab-workbench"));
assert.ok(flow.includes('stepBadge.textContent="2"'));
console.log("Chapter 6 math model and shared workbench checks passed:",tested,"states");
