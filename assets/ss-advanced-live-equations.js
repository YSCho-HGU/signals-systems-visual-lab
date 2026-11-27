/* Chapter 5-8: 29 math-to-current-value formula cards. Native simulations are unchanged. */
(function advancedLiveModel(global){
 'use strict';
 const T=String.raw, PI=Math.PI;
 const num=(s,k,d=0)=>{const x=s?.[k];return x!==undefined&&x!==null&&x!==''&&Number.isFinite(Number(x))?Number(x):d};
 const fmt=(x,places=4)=>Number.isFinite(x)?String(Number((Math.abs(x)<1e-10?0:x).toFixed(places))):'--';
 const observed=(m,i)=>String(m?.[i]?.value??'').trim();
 const entry=(general,now,en,ko)=>({general,now,en,ko});
 const data={
  5:{
   weight:(s)=>{const sigma=num(s,'sigma');return entry(T`F(T)=\int_0^T e^{-\sigma t}\,dt,\quad\mathrm{ROC}:\Re(s)>0`,sigma>0?T`\sigma=${fmt(sigma)},\quad F(\infty)=\frac1{\sigma}=${fmt(1/sigma)}`:T`\sigma=${fmt(sigma)},\quad\lim_{T\to\infty}F(T)=\infty`,'At ω=0, the integral converges only for σ>0.','ω=0에서 적분은 σ>0일 때만 수렴합니다.')},
   roc:(s)=>{const a=num(s,'a'),symbol=s.side==='left'?'<':'>';return entry(T`X(s)=\frac1{s+a},\quad\mathrm{pole}=-a`,T`a=${fmt(a)},\quad\mathrm{ROC}:\Re(s)${symbol}${fmt(-a)}`,'The ROC determines the time direction even though the pole is unchanged.','극점은 같아도 ROC가 시간 신호의 방향을 결정합니다.')},
   pairs:(s)=>{
    const a=num(s,'a'),w=num(s,'omega'),width=num(s,'T'),kind=s.kind||'step';
    const cases={
     impulse:entry(T`X(s)=1,\quad\mathrm{ROC}:\mathbb C`,T`X(s)=1`,'The transform of an impulse is 1 everywhere in the finite s-plane.','임펄스의 변환은 모든 유한 s에서 1입니다.'),
     step:entry(T`X(s)=\frac1s,\quad\Re(s)>0`,T`\mathrm{ROC}:\Re(s)>0`,'The step signal requires a right-half-plane ROC.','단위계단 신호에는 우반평면 ROC가 필요합니다.'),
     exp:entry(T`X(s)=\frac1{s+a},\quad\Re(s)>-a`,T`a=${fmt(a)},\quad\Re(s)>${fmt(-a)}`,'Decay sets the pole and the ROC boundary.','감쇠율이 극점과 ROC 경계를 결정합니다.'),
     pulse:entry(T`X(s)=\frac{1-e^{-sT}}s,\quad X(0)=T`,T`T=${fmt(width)},\quad X(0)=${fmt(width)}`,'The apparent singularity at s=0 is removable.','s=0의 겉보기 특이점은 제거 가능합니다.'),
     damped:entry(T`X(s)=\frac{s+a}{(s+a)^2+\omega_0^2}`,T`a=${fmt(a)},\quad\omega_0=${fmt(w)},\quad\Re(s)>${fmt(-a)}`,'Damping shifts the real parts of the complex-conjugate poles.','감쇠는 복소켤레 극점의 실수부를 이동시킵니다.')
    };
    return cases[kind]||cases.step;
   },
   props:(s)=>{const a=num(s,'a'),b=num(s,'b'),delay=s.mode!=='weight';return delay?
    entry(T`x(t-t_0)\longleftrightarrow e^{-st_0}X(s)`,T`t_0=${fmt(num(s,'shift'))},\quad p=${fmt(-a)}`,'Finite time delay preserves the ROC.','유한한 시간 지연은 ROC를 바꾸지 않습니다.'):
    entry(T`e^{bt}x(t)\longleftrightarrow X(s-b)`,T`a=${fmt(a)},\ b=${fmt(b)},\quad p'=${fmt(b-a)}`,'Exponential weighting shifts the pole and ROC by b.','지수 가중은 극점과 ROC를 b만큼 이동시킵니다.')},
   inverse:(s)=>{const rocs={right:T`\Re(s)>-1`,strip:T`-4<\Re(s)<-1`,left:T`\Re(s)<-4`};return entry(T`X(s)=\frac{1/3}{s+1}-\frac{1/3}{s+4}`,T`\mathrm{ROC}:\ ${rocs[s.roc]||rocs.right}`,'The same expression gives different signals for different ROCs.','같은 대수식도 ROC가 다르면 다른 시간 신호가 됩니다.')},
   stability:(s)=>{const p=num(s,'p'),z=num(s,'z'),cancelP=Math.abs(p-z)<1e-8,cancelFour=Math.abs(z+4)<1e-8;const right=cancelP?-4:cancelFour?p:Math.max(p,-4);const stable=right<0;return entry(T`H(s)=\frac{s-z}{(s-p)(s+4)}`,T`p_{\mathrm{active}}=${fmt(right)},\quad\mathrm{BIBO}:\ ${stable?T`\mathrm{stable}`:T`\mathrm{unstable}`}`,cancelP||cancelFour?'After exact cancellation, judge stability from the remaining pole.':'Check the rightmost active pole against the imaginary axis.',cancelP||cancelFour?'완전 소거 후 남은 극점으로 안정성을 판단합니다.':'가장 오른쪽 활성 극점을 허수축과 비교하세요.');},
   rc:(s)=>{const tau=num(s,'tau',1);return entry(T`H(s)=\frac1{1+\tau s},\quad\omega_c=\frac1\tau`,T`\tau=${fmt(tau)}\,\mathrm{s},\quad\omega_c=${fmt(1/tau)}\,\mathrm{rad/s}`,'The time constant and cutoff angular frequency are reciprocal.','시정수와 차단 각주파수는 역수 관계입니다.')},
   second:(s)=>{const z=num(s,'zeta'),w=num(s,'wn'),overshoot=z<1?100*Math.exp(-PI*z/Math.sqrt(1-z*z)):0;return entry(T`H(s)=\frac{\omega_n^2}{s^2+2\zeta\omega_ns+\omega_n^2}`,T`\zeta=${fmt(z)},\quad\omega_n=${fmt(w)},\quad M_p=${fmt(overshoot,2)}\%`,'The damping ratio determines overshoot and the poles determine response shape.','감쇠비는 오버슈트를, 극점은 응답 형태를 결정합니다.')}
  },
  6:{
   periodic:(s)=>{const fs=num(s,'fs',1),f=num(s,'f');return entry(T`\Omega=2\pi\frac{f}{f_s},\quad x[n]=\cos(\Omega n)`,T`f=${fmt(f)},\ f_s=${fmt(fs)},\quad\Omega=${fmt(2*PI*f/fs)}`,'N changes the visible record, not digital frequency for fixed f and fs.','f와 fs를 고정하면 N은 표시 구간만 바꾸고 디지털 주파수는 바꾸지 않습니다.')},
   pairs:(s)=>{
    const k=s.kind||'impulse',a=num(s,'a'),M=num(s,'m',1),n0=num(s,'n0');
    const cases={
     impulse:[T`X(e^{j\Omega})=1`,T`X(e^{j0})=1`],
     shift:[T`X(e^{j\Omega})=e^{-j\Omega n_0}`,T`n_0=${fmt(n0)},\quad|X|=1`],
     exp:[T`X(e^{j\Omega})=\frac1{1-ae^{-j\Omega}}`,T`a=${fmt(a)},\quad X(e^{j0})=${fmt(1/(1-a))}`],
     rect:[T`X(e^{j\Omega})=\sum_{n=0}^{M-1}e^{-j\Omega n}`,T`M=${fmt(M)},\quad X(e^{j0})=${fmt(M)}`],
     sym:[T`X(e^{j\Omega})=\frac{1-a^2}{1-2a\cos\Omega+a^2}`,T`a=${fmt(a)},\quad X(e^{j0})=${fmt((1+a)/(1-a))}`]
    };
    const x=cases[k]||cases.impulse;return entry(x[0],x[1],'Compare the selected time sequence with its spectrum.','선택한 시간 수열과 주파수 스펙트럼을 비교하세요.');
   },
   phase:(s)=>entry(T`x[n-n_0]\longleftrightarrow e^{-j\Omega n_0}X(e^{j\Omega})`,T`n_0=${fmt(num(s,'n0'))},\quad\frac{d\phi}{d\Omega}=${fmt(-num(s,'n0'))}`,'Time delay preserves spectral magnitude and adds linear phase.','시간 지연은 크기를 보존하고 선형 위상을 추가합니다.'),
   phasor:(s)=>{const M=num(s,'m',1),w=num(s,'w')*PI,den=Math.sin(w/2),mag=Math.abs(den)<1e-9?1:Math.abs(Math.sin(M*w/2)/(M*den));return entry(T`H(e^{j\Omega})=\frac1M\sum_{k=0}^{M-1}e^{-j\Omega k}`,T`M=${fmt(M)},\quad\Omega=${fmt(w)},\quad|H|=${fmt(mag)}`,'Small |H| means the rotating tap phasors cancel.','|H|가 작을수록 탭 페이저들이 서로 상쇄됩니다.')},
   filter:(s,m)=>entry(T`H(e^{j\Omega})=\frac1M\sum_{k=0}^{M-1}e^{-j\Omega k}`,T`M=${fmt(num(s,'m'))},\quad|H_\mathrm{useful}|=${observed(m,0).match(/[0-9.]+/)?.[0]||'0'}`,'Compare the useful and interference gains calculated in the native experiment.','기존 실습에서 계산된 유효 신호와 간섭 신호의 이득을 비교하세요.'),
   fft:(s)=>{const N=num(s,'n',512),p=num(s,'pad',1),fs=128;return entry(T`\Delta f_\mathrm{record}=\frac{f_s}{N},\quad\Delta f_\mathrm{grid}=\frac{f_s}{Np}`,T`N=${fmt(N)},\ p=${fmt(p)},\quad\Delta f_\mathrm{grid}=${fmt(fs/(N*p))}\,\mathrm{Hz}`,'Zero padding creates a finer frequency grid, not new data.','제로 패딩은 주파수 눈금을 촘촘히 할 뿐 새로운 데이터를 만들지 않습니다.')}
  },
  7:[
   (s)=>{const f=num(s,'f'),fs=num(s,'fs',1);return entry(T`x[n]=\cos\!\left(2\pi\frac{f}{f_s}n\right)`,T`f=${fmt(f)},\ f_s=${fmt(fs)},\quad\Omega=${fmt(2*PI*f/fs)}`,'Sampling maps continuous time to the discrete index n.','표본화는 연속시간을 이산 인덱스 n으로 대응시킵니다.')},
   (s)=>entry(T`X_p(j\omega)=\frac1{T_s}\sum_k X_c\!\left(j(\omega-k\omega_s)\right)`,T`f_s=${fmt(num(s,'fs'))},\quad 2B=${fmt(2*num(s,'B'))}`,'Compare the replica spacing fs with the doubled signal bandwidth.','복제 간격 fs를 신호 대역폭의 두 배와 비교하세요.'),
   (s)=>{const f=num(s,'f'),fs=num(s,'fs',1),signed=((f+fs/2)%fs+fs)%fs-fs/2;return entry(T`f_\mathrm{alias}=\min_{k\in\mathbb Z}|f-kf_s|`,T`f=${fmt(f)},\ f_s=${fmt(fs)},\quad f_\mathrm{alias}=${fmt(Math.abs(signed))}`,'Different analog frequencies can give identical sample values.','서로 다른 아날로그 주파수도 같은 표본값을 만들 수 있습니다.')},
   (s)=>entry(T`\widehat{x}(t)=\sum_{n=-50}^{50}x[n]\operatorname{sinc}(f_st-n)`,T`f=${fmt(num(s,'f'))},\quad f_s=${fmt(num(s,'fs'))}`,'This 101-sample reconstruction is a finite approximation.','101개 표본을 이용한 복원은 유한합 근사입니다.'),
   (s)=>{const ratio=1-num(s,'atten')/100;return entry(T`x_\mathrm{filtered}(t)=x_\mathrm{wanted}(t)+\alpha x_\mathrm{noise}(t)`,T`\alpha=${fmt(ratio)},\quad A_\mathrm{noise}=${fmt(.7*ratio)}`,'Analog filtering reduces interference before it aliases.','아날로그 필터는 간섭이 에일리어싱되기 전에 크기를 줄입니다.')},
   (s)=>{const bits=num(s,'bits',4),delta=2/(2**bits-1);return entry(T`L=2^B,\quad\Delta=\frac{2}{2^B-1},\quad|e_q|\le\frac{\Delta}{2}`,T`B=${fmt(bits)},\quad L=${fmt(2**bits)},\quad\Delta=${fmt(delta,5)}`,'Bit depth changes amplitude resolution, not sample spacing.','비트 수는 진폭 분해능을 바꿀 뿐 표본 시각을 바꾸지 않습니다.')},
   (s)=>entry(T`y_\mathrm{ZOH}(t)=x[n],\quad nT_s\le t<(n+1)T_s`,T`T_s=${fmt(1000/num(s,'fs',1),2)}\,\mathrm{ms},\quad f=${fmt(num(s,'f'))}`,'ZOH keeps each sampled value until the next sample.','ZOH는 다음 표본까지 현재 표본값을 유지합니다.')
  ],
  8:[
   (s)=>{const a=num(s,'a');return entry(T`X(z)=\frac1{1-az^{-1}},\quad\mathrm{ROC}:|z|>|a|`,T`a=${fmt(a)},\quad|z|>${fmt(Math.abs(a))}`,'The unit circle must lie inside the ROC for the DTFT to exist.','DTFT가 존재하려면 단위원이 ROC에 포함되어야 합니다.')},
   (s)=>entry(T`H(z)=\frac1{1-0.8z^{-1}}`,s.direction==='left'?T`\mathrm{ROC}:|z|<0.8`:T`\mathrm{ROC}:|z|>0.8`,'Right- and left-sided sequences share H(z) but have different ROCs.','우측·좌측 수열은 H(z)는 같고 ROC는 서로 다릅니다.'),
   (s)=>{const a=num(s,'a'),b=num(s,'b');return entry(T`X(z)=\frac1{1-az^{-1}}+\frac1{1-bz^{-1}}`,T`a=${fmt(a)},\ b=${fmt(b)},\quad ${fmt(a)}<|z|<${fmt(b)}`,'The annular ROC is the intersection of component ROCs.','고리형 ROC는 각 성분 ROC의 교집합입니다.')},
   (s)=>{const a=num(s,'a'),b=num(s,'b'),roc=s.roc||'annulus',domain=roc==='outer'?T`|z|>${fmt(b)}`:roc==='inner'?T`|z|<${fmt(a)}`:T`${fmt(a)}<|z|<${fmt(b)}`;return entry(T`X(z)=\frac{A}{1-az^{-1}}+\frac{B}{1-bz^{-1}}`,T`A=${fmt(-a/(b-a))},\ B=${fmt(b/(b-a))},\quad\mathrm{ROC}:\ ${domain}`,'The coefficients stay fixed; the ROC changes the inverse sequence.','계수는 같지만 ROC에 따라 역변환된 시간 수열이 달라집니다.');},
   (s)=>{const a=num(s,'a');return entry(T`H(z)=\frac{1-a}{1-az^{-1}},\quad H(e^{j0})=1`,T`a=${fmt(a)},\quad|H(e^{j\pi})|=${fmt((1-a)/(1+a))}`,'Poles closer to +1 create longer memory and stronger high-frequency attenuation.','극점이 +1에 가까울수록 기억이 길어지고 고주파 감쇠가 커집니다.')},
   (s)=>{const N=num(s,'N',4),omega=2*PI*num(s,'omega')/N,den=Math.sin(omega/2),mag=Math.abs(den)<1e-9?1:Math.abs(Math.sin(N*omega/2)/(N*den));return entry(T`H(e^{j\Omega})=\frac1N\sum_{k=0}^{N-1}e^{-j\Omega k}`,T`N=${fmt(N)},\quad\Omega=${fmt(omega)},\quad|H|=${fmt(mag)}`,'Frequency notches arise when delayed phasors cancel.','주파수 노치는 지연된 페이저들이 상쇄될 때 생깁니다.')},
   (s)=>{const a=num(s,'a'),M=num(s,'M',12),causal=s.side!=='anti';let sum=0;for(let i=0;i<M;i++)sum+=Math.abs(causal?a**i:a**(-i-1));return entry(T`\mathrm{BIBO}\iff\sum_n|h[n]|<\infty`,T`M=${fmt(M)},\quad S(M)=${fmt(sum,3)}`,'The absolute partial sums must approach a finite limit.','절댓값 부분합이 유한한 값으로 수렴하는지 확인하세요.')},
   (s)=>{const a=num(s,'a');return entry(T`y[n]=ay[n-1]+(1-a)x[n]`,T`a=${fmt(a)},\quad 1-a=${fmt(1-a)}`,'The previous output forms the IIR filter state.','이전 출력이 IIR 필터의 상태가 됩니다.')}
  ]
 };
 const order={5:['weight','roc','pairs','props','inverse','stability','rc','second'],6:['periodic','pairs','phase','phasor','filter','fft']};
 function get(chapter,lesson,state,metrics){
  const c=Number(chapter),key=c<7?String(lesson):Number(lesson)-1,fn=data[c]?.[key];
  if(typeof fn!=='function')return null;
  return fn(state||{},metrics||[]);
 }
 global.SSAdvancedLiveEquations=Object.freeze({get,order,counts:{5:8,6:6,7:7,8:8},version:'20261127-advanced-live-v1'});
})(window);
