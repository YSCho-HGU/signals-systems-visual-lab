/* Chapter 1-4: formula-to-current-state explanations.
 * Presentation-only: the native laboratory owns all calculations.
 * The displayed observation values are read from native experiment metrics.
 */
(function(global){
'use strict';
const round=value=>{
 const x=Number(value);
 if(!Number.isFinite(x))return null;
 return String(Math.abs(x)<0.00000001?0:Number(x.toFixed(4)));
};
const n=(state,key,fallback=0)=>{
 const value=round(state?.[key]);
 return value===null?fallback:Number(value);
};
const metric=(rows,index)=>{
 const value=String(rows?.[index]?.value??'').replaceAll(',','').trim();
 const match=value.match(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)/);
 return match?match[0]:null;
};
const printed=(value)=>value===null?'\\text{--}':String(value);
const label=(general,now)=>({general,now});
const pi=Math.PI;
const funcs={
 1:[
  (v)=>{const ts=n(v,'Ts',1);return label(
   'x[n]=x(nT_s),\\quad f_s=\\frac1{T_s}',
   'T_s='+round(ts)+'\\ \\mathrm{s},\\quad f_s='+round(1/ts)+'\\ \\mathrm{Hz}'
  )},
  (v)=>{
   const a=n(v,'A',1),w=n(v,'width',1),t=n(v,'t0',0),k=Math.round(t),kind=v.kind||'step',dt=v.domain==='DT';
   if(kind==='impulse')return dt
    ?label('x[n]=A\\delta[n-k]','k='+k+',\\quad A='+round(a))
    :label('p_\\varepsilon(t)=\\frac{A}{\\varepsilon},\\quad\\int p_\\varepsilon(t)\\,dt=A',
      'A='+round(a)+',\\ \\varepsilon='+round(w)+',\\ \\frac{A}{\\varepsilon}='+round(a/w));
   const arg=dt?'n-k':'t-t_0',head=dt?'x[n]':'x(t)';
   if(kind==='step')return label(head+'=A\\,u('+arg+')','A='+round(a)+',\\quad '+(dt?'k':'t_0')+'='+round(dt?k:t));
   if(kind==='pulse')return label(head+'=A\\ \\mathrm{for}\\ 0\\le '+arg+'<w','A='+round(a)+',\\quad w='+round(w));
   if(kind==='ramp')return label(head+'=A('+arg+')u('+arg+')','A='+round(a)+',\\quad '+(dt?'k':'t_0')+'='+round(dt?k:t));
   return label(head+'=Ae^{-0.8('+arg+')}u('+arg+')','A='+round(a)+',\\quad '+(dt?'k':'t_0')+'='+round(dt?k:t));
  },
  (v)=>{
   const a=n(v,'a',1),b=n(v,'b',0),lo=Math.min((0-b)/a,(3-b)/a),hi=Math.max((0-b)/a,(3-b)/a);
   return label('y(t)=x(at+b),\\quad t=\\frac{\\tau-b}{a}',
    '\\mathrm{support}(y)=['+round(lo)+','+round(hi)+'],\\quad W='+round(3/Math.abs(a)));
  },
  (v)=>{
   const omega=n(v,'omega',1),s=String(v.freq||'1/4');
   const result=s==='irr'?'\\frac{\\Omega}{2\\pi}=\\frac{\\sqrt2}{2}\\notin\\mathbb Q':('N_0='+s.split('/')[1]);
   return label('T_0=\\frac{2\\pi}{|\\omega_0|},\\quad \\Omega N=2\\pi m',
     'T_0='+round(2*pi/omega)+'\\ \\mathrm{s},\\quad '+result);
  },
  (v,m)=>label('E(T)=\\int_{-T}^{T}|x(t)|^2dt,\\quad P(T)=\\frac{E(T)}{2T}',
     'E(T)='+printed(metric(m,0))+',\\quad P(T)='+printed(metric(m,1))),
  (v,m)=>label('\\Delta_L=T\\{ax_1+bx_2\\}-aT\\{x_1\\}-bT\\{x_2\\}',
     '\\max_{\\mathrm{sampled}}|\\Delta_L|\\approx'+printed(metric(m,0))+',\\quad\\max_{\\mathrm{sampled}}|\\Delta_{TI}|\\approx'+printed(metric(m,1))),
  (v,m)=>label('x_e(t)=\\frac{x(t)+x(-t)}2,\\quad x_o(t)=\\frac{x(t)-x(-t)}2',
     '\\Delta_e='+printed(metric(m,0))+',\\quad\\Delta_o='+printed(metric(m,1))),
  (v,m)=>{
   const type=v.op||'add';
   const expressions={add:'y(t)=x(t)+h(t)',mul:'y(t)=x(t)h(t)',diff:"y(t)=\\frac{dx(t)}{dt}",int:'y(t)=\\int_{-4}^{t}x(\\tau)d\\tau'};
   return label(expressions[type]||expressions.add,'y(0)='+printed(metric(m,1)));
  },
  (v,m)=>label('x[n]=x(nT_s),\\quad T_s=\\frac{1}{f_s}',
     'f_s='+round(n(v,'rate',1))+'\\ \\mathrm{Hz},\\quad T_s='+printed(metric(m,0))+'\\ \\mathrm{s}')
 ],
 2:[
  (v,m)=>label('y[n]=\\sum_k x[k]h[n-k]',
     'k='+round(n(v,'k',0))+',\\quad x[k]h[0]='+printed(metric(m,0))),
  (v,m)=>label('y[n]=\\sum_k x[k]h[n-k]',
     'n='+round(n(v,'n',0))+',\\quad y[n]='+printed(metric(m,0))),
  (v)=>{
   const nx=n(v,'nx',0),nh=n(v,'nh',0),lx=n(v,'Lx',1),lh=n(v,'Lh',1);
   return label('n_{\\mathrm{start}}=n_x+n_h,\\quad L_y=L_x+L_h-1',
     'n_{\\mathrm{start}}='+round(nx+nh)+',\\ L_y='+round(lx+lh-1)+',\\ n_{\\mathrm{end}}='+round(nx+nh+lx+lh-2));
  },
  (v,m)=>label('y(t)=\\int_{-\\infty}^{\\infty}x(\\tau)h(t-\\tau)\\,d\\tau',
     't='+round(n(v,'t',0))+',\\quad y(t)='+printed(metric(m,1))),
  (v,m)=>{
   const a=n(v,'a',1),b=n(v,'b',1);
   return label(Math.abs(a-b)<1e-9?
     'y(t)=t e^{-at}u(t)\\quad(a=b)':
     'y(t)=\\frac{e^{-at}-e^{-bt}}{b-a}u(t)',
     't='+round(n(v,'t',0))+',\\quad y(t)='+printed(metric(m,0)));
  },
  (v,m)=>label('h(t)=\\frac1\\tau e^{-t/\\tau}u(t)',
     '\\tau='+round(n(v,'tau',1))+',\\ T='+round(n(v,'T',1))+',\\ y(T)='+printed(metric(m,0))),
  (v,m)=>label('h[k]=\\frac1M,\\quad 0\\le k<M',
     'M='+round(n(v,'M',1))+',\\ \\frac1M='+round(1/n(v,'M',1))+',\\ \\sum_k h[k]=1'),
  (v,m)=>label(v.mode==='parallel'?'h_{eq}=h_1+h_2':'h_{eq}=h_1*h_2',
     '\\max|y_{\\mathrm{direct}}-y_{\\mathrm{eq}}|\\approx'+printed(metric(m,1))),
  (v)=>label('\\mathrm{BIBO}\\iff\\sum_n|h[n]|<\\infty',
     'r='+round(n(v,'r',0.7)))
 ],
 3:[
  (v,m)=>label('x(t)=\\cos(\\omega_0 t)+A\\cos(2\\omega_0t+\\phi),\\quad |a_2|=\\frac A2',
     'f_0='+round(1/n(v,'T',1))+'\\ \\mathrm{Hz},\\quad |a_2|='+round(n(v,'A',0)/2)),
  (v,m)=>label('a_0=\\frac{\\tau}{T},\\quad a_k=\\frac{\\sin(k\\pi\\tau/T)}{k\\pi}\\ (k\\ne0)',
     'a_0=\\frac{'+round(n(v,'tau',1))+'}{'+round(n(v,'T',1))+'}='+round(n(v,'tau',1)/n(v,'T',1))),
  (v,m)=>label('S_M(t)=\\frac4\\pi\\sum_{j=0}^{M-1}\\frac{\\sin((2j+1)\\pi t)}{2j+1}',
     'M='+round(n(v,'M',1))+',\\quad S_M(0)='+printed(metric(m,2))),
  (v,m)=>label('b_k=a_k e^{-jk\\omega_0 t_0},\\quad |b_k|=|a_k|',
     '\\omega_0='+round(2*pi/n(v,'T',1))+',\\quad -\\omega_0t_0='+round(-2*pi*n(v,'t0',0)/n(v,'T',1))),
  (v,m)=>label('a_k=\\frac1N\\sum_{n=0}^{N-1}x[n]e^{-j2\\pi kn/N}',
     'N='+round(n(v,'N',8))+',\\quad a_0='+printed(metric(m,0))),
  (v,m)=>label('b_k=H(jk\\omega_0)a_k,\\quad H(j\\omega)=\\frac1{1+j\\omega\\tau}',
     '|H(j\\omega_0)|='+printed(metric(m,0))+',\\quad |H(j3\\omega_0)|='+printed(metric(m,1))),
  (v,m)=>label('S(0)=\\frac{x(0^-)+x(0^+)}2',
     'x(0)='+round(n(v,'special',0))+',\\quad S_M(0)='+printed(metric(m,2)))
 ],
 4:[
  (v,m)=>label('\\Delta\\omega=\\frac{2\\pi}T,\\quad X(j\\omega_k)=T a_k',
     '\\Delta\\omega='+round(2*pi/n(v,'T',1))+',\\quad T a_0='+printed(metric(m,2))),
  (v,m)=>label('X(j\\omega)=A\\tau\\frac{\\sin(\\omega\\tau/2)}{\\omega\\tau/2}',
     'X(j0)='+printed(metric(m,0))+',\\quad\\omega_{\\mathrm{zero}}='+printed(metric(m,1))),
  (v,m)=>label('X(j\\omega)=\\frac{2\\alpha}{\\alpha^2+\\omega^2}',
     '\\alpha='+round(n(v,'a',1))+',\\quad X(j0)='+printed(metric(m,0))),
  (v,m)=>label('X(j\\omega)=e^{-j\\omega t_0}\\tau\\frac{\\sin(\\omega\\tau/2)}{\\omega\\tau/2}',
     't_0='+round(n(v,'t0',0))+',\\quad\\frac{d\\phi_{\\mathrm{shift}}}{d\\omega}='+round(-n(v,'t0',0))),
  (v,m)=>label('|X(j\\omega)|\\ge0,\\quad X(j\\omega)\\in\\mathbb R',
     'X(j0)='+printed(metric(m,0))+',\\quad\\omega_{\\mathrm{zero}}='+printed(metric(m,1))),
  (v,m)=>label('Y(j\\omega)=H(j\\omega)X(j\\omega),\\quad H(j\\omega)=\\frac1{1+j\\omega\\tau}',
     '\\omega_c='+printed(metric(m,0))+',\\quad y(D)='+printed(metric(m,1))),
  (v,m)=>label('Y(j\\omega)=\\frac12[X(j(\\omega-\\omega_c))+X(j(\\omega+\\omega_c))]',
     '\\omega_c='+round(n(v,'wc',0))+',\\quad Y(j0)='+printed(metric(m,2))),
  (v,m)=>label('X(j\\omega)\\approx\\Delta t\\sum_n x(n\\Delta t)e^{-j\\omega n\\Delta t}',
     '\\Delta t='+round(n(v,'dt',0.1))+',\\quad N='+printed(metric(m,0)))
 ]
};
function get(chapter,index,params,metrics){
 const fn=funcs[Number(chapter)]?.[Number(index)];
 if(!fn)return null;
 const result=fn(params||{},metrics||[]);
 return result&&typeof result.general==='string'&&typeof result.now==='string'?result:null;
}
global.SSFoundationEquations=Object.freeze({
 get,chapterCounts:Object.freeze({1:9,2:9,3:7,4:8}),version:'20261127-formula-state-v1'
});
})(window);
