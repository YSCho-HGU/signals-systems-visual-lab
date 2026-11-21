/* Chapter 5 Laplace equation models. These are display-only.
 * Never mutate the original ROC, inverse, pole, or convolution state.
 */
(function(global){
 "use strict";
 const f=(v,d=2)=>{const rounded=Number(v).toFixed(d);return Number(rounded)===0?(0).toFixed(d):rounded;};
 // Present pole and zero locations as natural factors (p=-1.10 -> s+1.10).
 const factor=(value)=>{const n=Number(f(value));return n<0?'s+'+f(-n):n>0?'s-'+f(n):'s';};
 // Factor of s-root, with parentheses only when an addition/subtraction requires them.
 const groupedFactor=(value)=>Math.abs(Number(f(value)))<1e-10?'s':'('+factor(value)+')';
 const stabilityDenominator=(p)=>Math.abs(p+4)<1e-10?'(s+4)^2':groupedFactor(p)+'(s+4)';
 const exponential=(v,variable='t')=>Math.abs(Number(f(v)))<1e-10?'1':'e^{'+f(v)+variable+'}';
 const L=String.raw;
 const E=global.ELSLabUI;
 function guides(id,s){
  if(id==="weight"){
   const v=Number(s.sigma),finite=Math.abs(v)<1e-8?5:(1-Math.exp(-5*v))/v;
   return [
    'X(s)=\\int_{-\\infty}^{\\infty}x(t)e^{-st}\\,dt,\\quad s=\\sigma+j\\omega',
    'u(t)=1\\ (t\\ge0)\\ \\Longrightarrow\\ X(s)=\\int_0^\\infty e^{-st}\\,dt',
    'e^{-\\sigma t}='+exponential(-v)+',\\quad F(5)='+f(finite,3)+',\\quad\\sigma'+(v>0?'>0':v<0?'<0':'=0'),
    'X(s)=\\left[-\\frac{e^{-st}}{s}\\right]_0^\\infty=\\frac1s,\\quad\\mathrm{ROC}:\\operatorname{Re}(s)>0'
   ];
  }
  if(id==="roc"){
   const a=f(s.a),pole=f(-s.a),r=s.side==="right";
   return [
    'X(s)=\\frac{1}{s+'+a+'},\\quad \\mathrm{pole}:s='+pole,
    r?'x(t)=e^{-'+a+'t}u(t)':'x(t)=-e^{-'+a+'t}u(-t)',
    (r?'\\int_0^\\infty':'-\\int_{-\\infty}^0')+'\\,e^{-(s+'+a+')t}\\,dt\\text{ converges if }\\operatorname{Re}(s)'+(r?'>':'<')+pole,
    'X(s)=\\frac{1}{s+'+a+'},\\quad\\mathrm{ROC}:\\operatorname{Re}(s)'+(r?'>':'<')+pole
   ];
  }
  if(id==="pairs"){
   const a=f(s.a),T=f(s.T),w=f(s.omega);
   if(s.kind==="impulse")return [
    'x(t)=\\delta(t)',
    'X(s)=\\int_{-\\infty}^\\infty\\delta(t)e^{-st}\\,dt=e^0',
    'X(s)=1',
    '\\mathrm{ROC}:\\ s\\in\\mathbb{C}\\quad(\\text{no finite poles})'];
   if(s.kind==="step")return [
    'x(t)=u(t)',
    'X(s)=\\int_0^\\infty e^{-st}\\,dt',
    'X(s)=\\left[-\\frac{e^{-st}}s\\right]_0^\\infty=\\frac1s',
    '\\mathrm{ROC}:\\operatorname{Re}(s)>0,\\quad\\mathrm{pole}:s=0'];
   if(s.kind==="exp")return [
    'x(t)=e^{-'+a+'t}u(t)',
    'X(s)=\\int_0^\\infty e^{-(s+'+a+')t}\\,dt',
    'X(s)=\\frac1{s+'+a+'}',
    '\\mathrm{pole}:s=-'+a+',\\quad\\mathrm{ROC}:\\operatorname{Re}(s)>-'+a];
   if(s.kind==="pulse")return [
    'x(t)=u(t)-u(t-'+T+')',
    'X(s)=\\int_0^{'+T+'}e^{-st}\\,dt',
    'X(s)=\\frac{1-e^{-'+T+'s}}{s}',
    'X(0)=\\lim_{s\\to0}X(s)='+T+',\\quad\\mathrm{ROC}:s\\in\\mathbb C'];
   return [
    'x(t)=e^{-'+a+'t}\\cos('+w+'t)u(t)',
    '\\cos(\\omega_0t)=\\frac{e^{j\\omega_0t}+e^{-j\\omega_0t}}2',
    'X(s)=\\frac12\\left[\\frac1{s+'+a+'-j'+w+'}+\\frac1{s+'+a+'+j'+w+'}\\right]',
    'X(s)=\\frac{s+'+a+'}{(s+'+a+')^2+'+w+'^2},\\quad p_{1,2}=-'+a+'\\pm j'+w
   ];
  }
  if(id==="props"){
   const a=f(s.a),t=f(s.shift),b=f(s.b),d=s.mode==="delay",pole=f(d?-s.a:s.b-s.a);
   return [
    'x(t)=e^{-'+a+'t}u(t),\\quad X(s)=\\frac1{s+'+a+'}',
    d?'y(t)=x(t-'+t+')':'y(t)='+(Math.abs(s.b)<1e-10?'x(t)':exponential(s.b)+'x(t)'),
    d?(Math.abs(s.shift)<1e-10?'Y(s)=\\frac1{s+'+a+'}':'Y(s)=\\frac{'+exponential(-s.shift,'s')+'}{s+'+a+'}'):'Y(s)=X('+factor(s.b)+')=\\frac1{'+factor(s.b-s.a)+'}',
    '\\mathrm{pole}:s='+pole+',\\quad\\mathrm{ROC}:\\operatorname{Re}(s)>'+pole
   ];
  }
  if(id==="inverse"){
   const r=s.roc==="right",l=s.roc==="left";
   return [
    'X(s)=\\frac1{(s+1)(s+4)}=\\frac13\\left(\\frac1{s+1}-\\frac1{s+4}\\right)',
    '\\mathrm{ROC}:\\ '+(r?'\\operatorname{Re}(s)>-1':l?'\\operatorname{Re}(s)<-4':'-4<\\operatorname{Re}(s)<-1'),
    r?'x(t)=\\frac13(e^{-t}-e^{-4t})u(t)':l?'x(t)=-\\frac13e^{-t}u(-t)+\\frac13e^{-4t}u(-t)':'x(t)=-\\frac13e^{-t}u(-t)-\\frac13e^{-4t}u(t)',
    r?'x(0^+)=\\frac13(1-1)=0,\\quad x(t)=0\\ (t<0)':l?'x(0^-)=\\frac13(-1+1)=0,\\quad x(t)=0\\ (t>0)':'x(0^-)=-\\frac13,\\quad x(0^+)=-\\frac13'
   ];
  }
  if(id==="stability"){
   const p=Number(s.p),z=Number(s.z),cancelP=Math.abs(p-z)<1e-8,cancel4=Math.abs(z+4)<1e-8,
    active=cancelP?-4:cancel4?p:Math.max(p,-4);
   return [
    'H(s)=\\frac{'+factor(z)+'}{'+stabilityDenominator(p)+'}',
    cancelP?'z=p='+f(p)+'\\Longrightarrow H_{\\mathrm{red}}(s)=\\frac1{s+4}':cancel4?'z=-4\\Longrightarrow H_{\\mathrm{red}}(s)=\\frac1{'+factor(p)+'}':
     'z\\neq p,\\quad z\\neq-4\\Longrightarrow\\text{two active poles}',
    '\\mathrm{ROC}:\\operatorname{Re}(s)>'+f(active)+'\\quad(\\text{causal})',
    'j\\omega\\text{ axis }'+(active<0?'\\subset\\mathrm{ROC}':'\\not\\subset\\mathrm{ROC}')+'\\ \\Longrightarrow\\ \\text{BIBO '+(active<0?'stable':'unstable')+'}'
   ];
  }
  if(id==="rc"){
   const tau=Number(s.tau),cut=1/tau;
   return [
    '\\tau\\frac{dy(t)}{dt}+y(t)=x(t),\\quad\\tau=RC',
    'H(s)=\\frac{Y(s)}{X(s)}=\\frac1{\\tau s+1}',
    'p=-\\frac1\\tau='+f(-cut,3)+',\\quad |H(j\\omega)|=\\frac1{\\sqrt{1+(\\omega\\tau)^2}}',
    s.input==='pulse'?
      'x(t)=u(t)-u(t-2),\\quad y(t)=r(t)-r(t-2),\\quad r(t)=(1-e^{-t/'+f(tau)+'})u(t)':
      'y_{\\mathrm{step}}(t)=(1-e^{-t/'+f(tau)+'})u(t),\\quad y(\\tau)=1-e^{-1}\\approx0.632'
   ];
  }
  if(id==="second"){
   const z=Number(s.zeta),w=Number(s.wn),r=-z*w,
    wd=z<1?w*Math.sqrt(1-z*z):0,over=z<1?Math.exp(-Math.PI*z/Math.sqrt(1-z*z))*100:0;
   return [
    'H(s)=\\frac{\\omega_n^2}{s^2+2\\zeta\\omega_ns+\\omega_n^2},\\quad\\zeta='+f(z)+',\\quad\\omega_n='+f(w),
    z<1?'s^2+2\\zeta\\omega_ns+\\omega_n^2=0,\\quad p_{1,2}=-\\zeta\\omega_n\\pm j\\omega_n\\sqrt{1-\\zeta^2}':
       's^2+2\\zeta\\omega_ns+\\omega_n^2=0,\\quad p_{1,2}=-\\zeta\\omega_n\\pm\\omega_n\\sqrt{\\zeta^2-1}',
    z<1?'0<\\zeta<1,\\quad p_{1,2}='+f(r)+'\\pm j'+f(wd)+',\\quad\\omega_d='+f(wd):
       Math.abs(z-1)<1e-8?'\\zeta=1,\\quad p_{1,2}='+f(r)+'\\ (\\text{repeated})':
       '\\zeta>1,\\quad p_1='+f(-z*w+w*Math.sqrt(z*z-1))+',\\quad p_2='+f(-z*w-w*Math.sqrt(z*z-1)),
    z<1?'M_p=100e^{-\\pi\\zeta/\\sqrt{1-\\zeta^2}}\\approx'+f(over)+'\\%':
       '\\zeta\\ge1\\quad\\Longrightarrow\\quad M_p=0\\%\\ (\\text{no oscillatory overshoot})'
   ];
  }
  return [];
 }
 function hero(id,s){
  if(id==="weight")return 'X(s)=\\int_{-\\infty}^{\\infty}x(t)e^{-st}\\,dt,\\quad s=\\sigma+j\\omega';
  if(id==="roc")return 'X(s)=\\frac1{s+'+f(s.a)+'},\\quad p=-'+f(s.a)+',\\quad\\operatorname{Re}(s)'+(s.side==="right"?'>':'<')+f(-s.a);
  if(id==="pairs"){
   const steps=guides(id,s);
   return steps[2]+',\\quad '+(s.kind==="pulse"?'\\mathrm{ROC}:s\\in\\mathbb C':s.kind==="impulse"?'\\mathrm{ROC}:s\\in\\mathbb C':
    s.kind==="step"?'\\operatorname{Re}(s)>0':s.kind==="exp"?'\\operatorname{Re}(s)>-'+f(s.a):
    '\\operatorname{Re}(s)>-'+f(s.a));
  }
  if(id==="props")return guides(id,s)[2]+',\\quad '+guides(id,s)[3];
  if(id==="inverse")return guides(id,s)[0]+',\\quad '+guides(id,s)[1];
  if(id==="stability")return guides(id,s)[0]+',\\quad '+guides(id,s)[2];
  if(id==="rc")return guides(id,s)[1]+',\\quad\\omega_c=\\frac1\\tau='+f(1/Number(s.tau),3)+'\\,\\mathrm{rad/s}';
  if(id==="second")return guides(id,s)[0];
  return null;
 }
 function render(target,latex){
   if(!target||!latex||!E)return;
   E.renderMath(target,latex,{display:true,fallbackHTML:target.dataset.originalHtml||target.innerHTML});
 }
 function renderHero(id,s){
   const element=document.getElementById("formula");
   if(element&&!element.dataset.originalHtml)element.dataset.originalHtml=element.innerHTML;
   render(element,hero(id,s));
 }
 function renderGuide(id,s,pane){
   const arr=guides(id,s);
   if(!pane||arr.length!==4)return;
   pane.querySelectorAll(".deriv-math").forEach(function(element,i){
     if(i<4)render(element,arr[i]);
   });
 }
 function renderAll(id,s,pane){
  renderHero(id,s);
  renderGuide(id,s,pane);
 }
 global.ELSChapterFiveMath=Object.freeze({guides:guides,hero:hero,renderHero:renderHero,renderGuide:renderGuide,renderAll:renderAll});
})(window);
