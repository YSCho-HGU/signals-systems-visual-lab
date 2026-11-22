/* Independent reference equations for Signals and Systems Ch1–8.
 * Unlike visual QA, this compares production samples against separate
 * closed-form identities, numerical integration, and direct DFT sums.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const own=!process.env.SS_BASE_URL,base=process.env.SS_BASE_URL||'http://127.0.0.1:8792/';
const server=own?spawn('python3',['-m','http.server','8792','--bind','127.0.0.1'],{stdio:'ignore'}):null;
if(own)await new Promise(r=>setTimeout(r,1050));
const browser=await chromium.launch({headless:true}),rows=[],folder='qa-math-reference';
mkdirSync(folder,{recursive:true});
function check(ch,id,actual,expected,tol=1e-5){
 const delta=Math.abs(actual-expected),ok=Number.isFinite(actual)&&delta<=tol;
 rows.push({ch,id,actual,expected,delta,tol,ok});
 console.log((ok?'PASS ':'FAIL ')+'ch'+ch+' '+id+' actual='+actual+' expected='+expected+' delta='+delta);
}
try{
 for(let ch=1;ch<=8;ch++){
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  try{
   await page.goto(base+'chapter'+ch+'.html',{waitUntil:'load',timeout:40000});
   const values=await page.evaluate(ch=>{
    const out=[],push=(id,a,e,t=1e-5)=>out.push({id,a,e,t});
    const PI=Math.PI,TAU=2*PI;
    const integrate=(f,a,b,N=16000)=>{const h=(b-a)/N;let v=(f(a)+f(b))/2;for(let k=1;k<N;k++)v+=f(a+k*h);return v*h};
    if(ch===1){
     const p={A:1.2,f:0.8,Ts:0.6,phase:0.3};
     const m=EXPS[0].compute(p),n=2;
     const expected=p.A*Math.exp(-.18*Math.abs(n*p.Ts))*Math.cos(TAU*p.f*n*p.Ts+p.phase);
     push('sample-x2',m.plots[1].series[0].fn(n),expected,1e-12);
     push('ct-dt-consistency',m.plots[0].series[0].fn(n*p.Ts),m.plots[1].series[0].fn(n),1e-12);
    }
    if(ch===2){
     const a=[2,-1,3],b=[1,.25];
     const actual=conv(a,b),expected=[2,-.5,2.75,.75];
     expected.forEach((v,i)=>push('dt-convolution-'+i,actual[i],v,1e-12));
     const t=1.3,A=.6,B=1.1;
     const ref=integrate(u=>Math.exp(-A*u)*Math.exp(-B*(t-u)),0,t);
     push('ct-exp-convolution',expconv(t,A,B),ref,4e-8);
     const T=.8,tau=1.2,v=1.7;
     const input=u=>u>=0&&u<T?1:0;
     const kernel=u=>u<0?0:Math.exp(-u/tau)/tau;
     const c=integrate(u=>input(u)*kernel(v-u),0,v);
     push('rc-pulse-convolution',rcPulse(v,T,tau),c,1e-4);
     push('constant-geometric-absolute-sum',sumAbsFamily('two',.5,3),1+2*(.5+.25+.125),1e-12);
    }
    if(ch===3){
     const T=4,tau=1.2;
     for(const k of [0,1,2,4]){
      const expected=integrate(t=>Math.cos(TAU*k*t/T),-tau/2,tau/2)/T;
      push('pulse-ctfs-a'+k,fsRect(k,T,tau),expected,1e-8);
     }
     push('square-midpoint',squarePartial(0,16),0,1e-12);
     push('square-wave-quarter',squarePartial(.5,180),1,0.005);
     push('rect-train-periodicity',rectTrain(0.4,4,1),rectTrain(4.4,4,1),1e-12);
    }
    if(ch===4){
     const tau=1.3;
     for(const w of [0,1.4,2.8,4.3]){
      const ref=integrate(t=>Math.cos(w*t),-tau/2,tau/2);
      push('rect-ctft-w'+w,rectFT(w,tau),ref,2e-8);
     }
     push('rect-ft-origin-area',rectFT(0,tau,2),2*tau,1e-12);
    }
    if(ch===5){
     for(const tau of [.5,1,2]){
      const t=1.3;
      const ref=integrate(u=>Math.exp(-u/tau)/tau,0,t);
      push('rc-step-tau'+tau,rcRise(t,tau),ref,3e-8);
     }
     for(const z of [.4,1,1.6]){
      const poles=secondPoles(z,2.4);
      for(const p of poles){
       // Natural roots satisfy s^2+2 z wn s+wn^2=0.
       const a=p.re,b=p.im,w=2.4;
       push('second-pole-real-'+z+'-'+a,a*a-b*b+2*z*w*a+w*w,0,1e-10);
       push('second-pole-imag-'+z+'-'+b,2*a*b+2*z*w*b,0,1e-10);
      }
      push('second-step-initial-'+z,secondStep(0,z,2.4),0,1e-11);
      push('second-step-final-'+z,secondStep(20,z,2.4),1,.003);
     }
    }
    if(ch===6){
     for(const M of [3,5,8]){
      const omega=.7,result=maH(M,omega);
      let real=0,imag=0;
      for(let k=0;k<M;k++){real+=Math.cos(omega*k);imag-=Math.sin(omega*k)}
      push('moving-average-real-'+M,result[0],real/M,1e-12);
      push('moving-average-imag-'+M,result[1],imag/M,1e-12);
     }
     const n=8,re=new Float64Array(n),im=new Float64Array(n);
     for(let k=0;k<n;k++){re[k]=Math.sin(.8*k)+.25*Math.cos(2*k);im[k]=.3*Math.sin(1.3*k)}
     const original=Array.from(re),originalIm=Array.from(im);
     fft(re,im);
     for(let k=0;k<n;k++){
      let dr=0,di=0;for(let t=0;t<n;t++){const a=-TAU*k*t/n;dr+=original[t]*Math.cos(a)-originalIm[t]*Math.sin(a);di+=original[t]*Math.sin(a)+originalIm[t]*Math.cos(a)}
      push('fft-vs-direct-real-bin'+k,re[k],dr,1e-10);
      push('fft-vs-direct-imag-bin'+k,im[k],di,1e-10);
     }
    }
    if(ch===7){
     const result=EXPERIMENTS[0].draw({f:30,fs:90});
     push('sampling-nyquist-decision',Number(result.insight.includes('fₛ > 2f')),1,0);
     push('sampling-omega-radians',Number(result.insight.includes((TAU*30/90).toFixed(3))),1,0);
     const aliased=EXPERIMENTS[0].draw({f:60,fs:90});
     push('sampling-aliased-warning',Number(aliased.insight.includes('fₛ ≤ 2f')),1,0);
    }
    if(ch===8){
     const model=EXPERIMENTS[0].draw({a:.8});
     const doc=new DOMParser().parseFromString(model.plots,'text/html');
     const circles=[...doc.querySelectorAll('.plot-card:first-child svg circle')];
     // If the first chart shows causal samples a^n, its 16 stems end at a^15.
     const expectedY=29+(4.3-.8**15)*(310-29-62)/4.3;
     const yvalues=circles.map(el=>Number(el.getAttribute('cy')));
     push('causal-exp-last-stem',Math.min(...yvalues.map(y=>Math.abs(y-expectedY))),0,.01);
     const stable=EXPERIMENTS[0].draw({a:.8});
     const unstable=EXPERIMENTS[0].draw({a:1.1});
     push('causal-roc-unit-circle-inside',Number(stable.insight.includes('Unit circle lies in ROC')),1,0);
     push('causal-roc-unit-circle-outside',Number(unstable.insight.includes('Unit circle is not inside ROC')),1,0);
    }
    return out;
   },ch);
   for(const row of values)check(ch,row.id,row.a,row.e,row.t);
  }catch(e){
   rows.push({ch,id:'runtime/reference-evaluation',ok:false,error:String(e)});
   console.log('FAIL ch'+ch+' '+String(e));
  }finally{await page.close()}
 }
}finally{await browser.close();if(server)server.kill()}
writeFileSync(folder+'/results.json',JSON.stringify(rows,null,2));
const failing=rows.filter(x=>!x.ok);
console.log('Independent math QA: '+(rows.length-failing.length)+'/'+rows.length+' checks passed');
assert.equal(failing.length,0,JSON.stringify(failing.slice(0,12)));
