/* Chapter 6.2–6.6: explicit math models for every guided step. */
(function(w){"use strict";
const C=(v,d=3)=>Number(v).toFixed(d);
function models(id,s){
 const M=Number(s.m),N=Number(s.n),n0=Number(s.n0),a=C(s.a,2);
 if(id==="pairs"){
  const z={
   impulse:['x[n]=\\delta[n]','X(e^{j\\Omega})=\\sum_{n=-\\infty}^{\\infty}\\delta[n]e^{-j\\Omega n}','X(e^{j\\Omega})=e^0=1','|X|=1,\\quad\\angle X=0'],
   shift:['x[n]=\\delta[n-'+n0+']','X(e^{j\\Omega})=\\sum_{k=-\\infty}^{\\infty}\\delta[k-'+n0+']e^{-j\\Omega k}','X(e^{j\\Omega})=e^{-j\\Omega '+n0+'}','|X|=1,\\quad\\angle X=-'+n0+'\\Omega\\pmod{2\\pi}'],
   exp:['x[n]=('+a+')^n u[n],\\quad |a|<1','X(e^{j\\Omega})=\\sum_{n=0}^{\\infty}('+a+'e^{-j\\Omega})^n','\\sum_{n=0}^{\\infty}r^n=\\frac1{1-r},\\quad |r|<1','X(e^{j\\Omega})=\\frac1{1-'+a+'e^{-j\\Omega}}'],
   rect:['x[n]=\\begin{cases}1,&0\\le n\\le '+(M-1)+'\\\\0,&\\text{otherwise}\\end{cases}','X(e^{j\\Omega})=\\sum_{n=0}^{'+(M-1)+'}e^{-j\\Omega n}','X(e^{j\\Omega})=e^{-j\\Omega('+ (M-1)+')/2}\\frac{\\sin('+M+'\\Omega/2)}{\\sin(\\Omega/2)}','X(e^{j0})='+M+',\\quad\\Omega_{\\mathrm{first\\ zero}}=\\frac{2\\pi}{'+M+'}'],
   sym:['x[n]=('+a+')^{|n|},\\quad |a|<1','X=1+\\sum_{n=1}^{\\infty}('+a+')^n(e^{-j\\Omega n}+e^{j\\Omega n})','X=1+2\\sum_{n=1}^{\\infty}('+a+')^n\\cos(\\Omega n)','X(e^{j\\Omega})=\\frac{1-('+a+')^2}{1-2('+a+')\\cos\\Omega+('+a+')^2}']
  };
  return z[s.kind]||z.exp;
 }
 if(id==="phase")return ['x[n]=\\begin{cases}1,&0\\le n\\le '+(M-1)+'\\\\0,&\\text{otherwise}\\end{cases}','y[n]=x[n-'+n0+']','Y(e^{j\\Omega})=e^{-j\\Omega '+n0+'}X(e^{j\\Omega})','|Y|=|X|,\\quad\\angle Y-\\angle X=-'+n0+'\\Omega\\ (X\\ne0)'];
 if(id==="phasor"){
  let re=0,im=0,om=Number(s.w)*Math.PI;
  for(let k=0;k<M;k++){re+=Math.cos(k*om)/M;im-=Math.sin(k*om)/M}
  return ['h[k]=\\begin{cases}\\frac1{'+M+'},&0\\le k\\le '+(M-1)+'\\\\0,&\\text{otherwise}\\end{cases}','H(e^{j\\Omega})=\\frac1{'+M+'}\\sum_{k=0}^{'+(M-1)+'}e^{-jk\\Omega}','v_k=\\frac1{'+M+'}e^{-jk\\Omega},\\quad|v_k|=\\frac1{'+M+'},\\quad\\angle v_k=-k\\Omega','\\Omega='+C(s.w,2)+'\\pi,\\quad|H(e^{j\\Omega})|='+C(Math.hypot(re,im),4)];
 }
 if(id==="filter"){
  const fs=100,wu=2*Math.PI*Number(s.fu)/fs,wn=2*Math.PI*Number(s.fn)/fs;
  function gain(om){let re=0,im=0;for(let k=0;k<M;k++){re+=Math.cos(k*om)/M;im-=Math.sin(k*om)/M}return C(Math.hypot(re,im),4)}
  return ['y[n]=\\frac1{'+M+'}\\sum_{k=0}^{'+(M-1)+'}x[n-k]','Y(e^{j\\Omega})=H(e^{j\\Omega})X(e^{j\\Omega})','\\Omega_u='+C(wu/Math.PI)+'\\pi,\\quad\\Omega_n='+C(wn/Math.PI)+'\\pi','|H(\\Omega_u)|='+gain(wu)+',\\quad|H(\\Omega_n)|='+gain(wn)+',\\quad\\tau_g='+C((M-1)*5,1)+'\\,\\mathrm{ms}'];
 }
 if(id==="fft"){
  const fs=128,L=N*Number(s.pad),cycles=Number(s.f)*N/fs;
  return ['x_w[n]=w[n]\\cos(2\\pi fn/'+fs+'),\\quad0\\le n<'+N,'fN/f_s='+C(cycles,3)+'\\,\\mathrm{cycles}\\quad('+((Math.abs(cycles-Math.round(cycles))<1e-5)?'\\mathrm{on\\ bin}':'\\mathrm{off\\ bin}')+')','\\Delta f_{DFT}=\\frac{'+fs+'}{'+N+'}='+C(fs/N,4)+'\\,\\mathrm{Hz},\\quad L='+N+'\\cdot'+Number(s.pad)+'='+L,'\\Delta f_{display}=\\frac{'+fs+'}{'+L+'}='+C(fs/L,5)+'\\,\\mathrm{Hz}'];
 }
 return [];
}
const hero={
 pairs:'X(e^{j\\Omega})=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\Omega n}',
 phase:'x[n-n_0]\\longleftrightarrow e^{-j\\Omega n_0}X(e^{j\\Omega})',
 phasor:'H(e^{j\\Omega})=\\frac1M\\sum_{k=0}^{M-1}e^{-jk\\Omega}',
 filter:'y[n]=\\frac1M\\sum_{k=0}^{M-1}x[n-k]',
 fft:'x_w[n]=w[n]\\cos(2\\pi fn/f_s),\\quad X[k]=\\sum_{n=0}^{N-1}x_w[n]e^{-j2\\pi kn/L}'
};
function renderGuide(id,s,pane){
 if(!pane||id==="periodic")return;
 const eq=models(id,s);
 renderHero(id,s);
 pane.querySelectorAll('.deriv-math').forEach(function(el,i){if(eq[i])w.ELSLabUI.renderMath(el,eq[i],{fallbackHTML:el.innerHTML})});
}
function renderHero(id,s){
 const el=document.getElementById('formula');
 if(el&&hero[id])w.ELSLabUI.renderMath(el,hero[id],{fallbackHTML:el.innerHTML});
}
w.ELSChapterSixMath=Object.freeze({models:models,hero:hero,renderGuide:renderGuide,renderHero:renderHero});
})(window);
