/* Chapter 6 Experiment 01: learn analog-to-digital frequency before aliasing.
 * Loaded only within the Chapter 6 embedded lab, after the original inline app.
 * Does not change any chapter count, state key, or other experiments.
 */
(function () {
  "use strict";
  if (typeof drawPeriodic !== "function" || typeof renderModule !== "function" ||
      typeof MODULES === "undefined" || typeof state === "undefined" || !state.periodic) return;

  function lang(ko, en) {
    try {
      var mode = window.parent.ELSLanguage.get();
      return mode === "en" ? en : mode === "ko" ? ko : en + " / " + ko;
    } catch (e) { return en; }
  }
  function gcd(a, b) {
    a = Math.round(Math.abs(a)); b = Math.round(Math.abs(b));
    while (b) { var t = a % b; a = b; b = t; }
    return a || 1;
  }
  var m = MODULES.find(function (x) { return x.id === "periodic"; });
  if (!m) return;
  state.periodic.mode = "frequency";
  defaults.periodic.mode = "frequency";
  defaults.periodic.fs = 100;
  defaults.periodic.f = 10;
  m.controls.unshift({key:"mode",name:"Learning sequence / 학습 순서",type:"select",
    values:[
      ["frequency","1 · Observe changing f / f 변화"],
      ["rate","2 · Observe changing f_s / f_s 변화"],
      ["alias","3 · Explore aliasing / 에일리어싱"]
    ]});
  m.controls.find(function(x){return x.key==="fs";}).min=100;

  var originalControl = ctlHTML;
  ctlHTML = function(c,s) {
    // Step descriptions are instructional, never a prerequisite or an input lock.
    // Students may explore either frequency slider without submitting an answer.
    if(active==="periodic" && c.key==="ns" && s.mode!=="alias")return "";
    return originalControl(c,s);
  };

  function copyFor(s) {
    var mode=s.mode||"frequency";
    if(mode==="alias")return {
      plots:[["Analog waves with identical samples","Solid and dashed analog curves agree at all sampled instants"],
             ["Finite-record DTFT, periodic in 2π","Magnitude of the DTFT from the same N samples"]],
      labels:["Digital F = f / f_s","Other CT frequency f_s − f","Largest sample mismatch"],
      subtitle:lang("3단계: 이제 서로 다른 두 연속시간 신호가 같은 x[n]을 만들 수 있음을 확인하세요.",
                    "Step 3: Only now compare two different analog signals with the same x[n]."),
      q:lang("서로 다른 주파수 f와 f_s−f의 코사인 신호가 왜 정확히 같은 x[n]을 만들까요?",
             "Why do the two different CT frequencies f and f_s−f yield exactly the same x[n]?"),
      a:lang("정수 n에서 cos(2π(f_s−f)n/f_s) = cos(2πn−2πfn/f_s) = cos(2πfn/f_s)이므로 샘플값이 같습니다.",
             "At integer n, cos(2π(f_s−f)n/f_s)=cos(2πn−2πfn/f_s)=cos(2πfn/f_s), so the samples agree."),
      note:lang("Aliasing: 청록색 실선은 f Hz, 빨간 점선은 (f_s−f) Hz, 검은 점은 두 신호가 공유하는 x[n]입니다. 아래 DTFT는 정확히 N개의 샘플로 계산합니다.",
                "Aliasing: teal solid is f Hz, dashed red is (f_s−f) Hz, and black stems are their identical x[n]. The DTFT below uses exactly N samples.")
    };
    var isF=mode==="frequency";
    return {
      plots:[[lang("CT 신호 x(t) · 실제 시간 (ms)","Continuous-Time x(t) · t (ms)"),
              lang("위 파형은 0–200 ms의 동일한 실제 시간 범위를 사용합니다.","The physical time range always stays 0–200 ms.")],
             [lang("DT 신호 x[n] · 샘플 인덱스","Discrete-Time Sequence x[n]"),
              lang("n=0,1,2,…의 간격은 언제나 1 sample입니다.","Integer sample indices always have spacing 1.")]],
      labels:["Digital F (cycles/sample)","Digital Ω (rad/sample)","DT fundamental period N₀"],
      subtitle:isF?lang("1단계: f_s를 고정하고 CT 주파수 f를 증가시키면서 x(t), x[n], F, Ω를 관찰합니다.",
                        "Step 1: Keep f_s near 100 Hz and vary f. Both sliders remain usable; no answer is required.")
                  :lang("2단계: 동일한 x(t)를 유지한 채 f_s를 바꾸세요. 실제 샘플 시간과 x[n]이 변합니다.",
                        "Step 2: Keep f near 10 Hz and vary f_s. Both sliders remain usable; no answer is required."),
      q:isF?lang("f_s를 고정하고 f만 높이면 x[n]의 인덱스 간격과 디지털 주파수는 각각 어떻게 되나요?",
                 "When you increase f while keeping f_s at 100 Hz, what changes in x[n]?")
            :lang("아날로그 신호 x(t)가 동일한데도 f_s를 변경하면 x[n]이 왜 달라지나요?",
                  "Why does x[n] change when f_s changes even though x(t) stays the same?"),
      a:isF?lang("n의 간격은 1 sample로 그대로이며 T_s도 고정입니다. F=f/f_s와 Ω=2πF가 증가하여 x[n]이 더 빠르게 진동합니다.",
                 "The index spacing stays 1 sample and T_s is fixed. F=f/f_s and Ω=2πF increase, making x[n] oscillate faster.")
            :lang("각 샘플의 실제 시간 t=n/f_s가 달라집니다. n은 여전히 정수 간격 1이지만 T_s는 변하고 F와 Ω도 달라집니다.",
                  "The physical sampling instants t=n/f_s change. Index n still advances by 1, but T_s, F and Ω change."),
      note:isF?lang("관찰 1 · f_s=100 Hz 고정: f를 10→20→40 Hz로 올리세요. 검은 샘플 점의 실제 시간 간격과 n축 간격은 변하지 않습니다. 대신 x[n]이 더 빨리 진동합니다.",
                   "Experiment 1 · f_s fixed at 100 Hz: increase f from 10 to 20 to 40 Hz. The sample-time spacing and integer n spacing stay fixed, while x[n] oscillates faster.")
              :lang("관찰 2 · f=10 Hz 고정: f_s를 100→120→200 Hz로 바꾸세요. 200 ms 동안의 CT 파형은 그대로지만 샘플 점 개수는 많아집니다. 아래 그래프는 처음 21개 x[n]을 n=0–20에 고정해서 비교합니다.",
                   "Experiment 2 · f fixed at 10 Hz: vary f_s from 100 to 120 to 200 Hz. Over 0–200 ms the top CT waveform stays the same, and more sampling instants appear as f_s rises. The lower plot always shows the first 21 x[n] on n=0–20.")
    };
  }


  // Shared compact layout for every Chapter 6 experiment.
  // Move real nodes so the original input listeners, graphs and guides remain intact.
  function arrangeChapter6() {
    var root=document.getElementById("content");
    if(!root)return;
    document.documentElement.classList.add("ss6-compact-workspace");
    var experiment=root.querySelector(".experiment");
    if(!experiment)return;
    var controls=experiment.querySelector(".controls");
    var body=experiment.querySelector(".body-col");
    var charts=body&&body.querySelector(".charts");
    var question=body&&body.querySelector(".question");
    if(question) {
      question.classList.add("ss6-top-question");
      root.insertBefore(question,experiment);
      var heading=question.querySelector("h3");
      if(heading)heading.textContent=lang("먼저 예측한 후 실험으로 확인하세요","Predict, then test your answer");
    }
    if(!controls||!body||!charts)return;
    if(active==="periodic"){
      var live=document.createElement("section");
      live.className="ss6-live-explanation";
      live.id="ss6-live-explanation";
      live.setAttribute("role","status");
      live.setAttribute("aria-live","polite");
      charts.parentNode.insertBefore(live,charts);
    }
    var title=controls.querySelector("h3");
    if(title)title.textContent=lang("실험 설정","Experiment settings");
    var notice=controls.querySelector(".notice");
    if(notice)notice.hidden=true;
    // Place the learning goal immediately above settings, rather than in a banner.
    var note=body.querySelector(".periodic-reading-note");
    if(note)charts.insertAdjacentElement("afterend",note);
    var hero=root.querySelector(".hero-callout");
    if(hero)charts.insertAdjacentElement("afterend",hero);
    var fftGuide=body.querySelector(".fft-guide");
    if(fftGuide)charts.insertAdjacentElement("afterend",fftGuide);
    var actions=controls.querySelector(".btnrow");
    if(actions) {
      actions.classList.add("ss6-short-actions");
      var reset=actions.querySelector("#reset");
      var play=actions.querySelector("#play");
      if(reset)reset.textContent=lang("초기화","Reset");
      if(play)play.textContent=lang("자동 재생","Auto play");
    }
    controls.querySelectorAll(".ctrl").forEach(function(ctrl) {
      var slider=ctrl.querySelector('input[type="range"]');
      if(!slider)return;
      // Remove old +/- controls if a previous rendering hook has placed them.
      Array.from(ctrl.querySelectorAll("button")).forEach(function(button){
        var text=(button.textContent||"").trim();
        if(text==="+"||text==="-"||text==="−")button.remove();
      });
      var row=document.createElement("div");
      row.className="ss6-inline-slider";
      slider.parentNode.insertBefore(row,slider);
      var minus=document.createElement("button"),plus=document.createElement("button");
      minus.type=plus.type="button";
      minus.className=plus.className="ss6-adjust-button";
      minus.textContent="−";plus.textContent="+";
      var label=ctrl.querySelector("label");
      var name=label?label.textContent.trim():"parameter";
      minus.setAttribute("aria-label",lang(name+" 감소","Decrease "+name));
      plus.setAttribute("aria-label",lang(name+" 증가","Increase "+name));
      function adjust(direction){
        if(slider.disabled)return;
        var step=Number(slider.step)||1;
        var min=Number(slider.min),max=Number(slider.max);
        var next=Math.max(min,Math.min(max,Number(slider.value)+direction*step));
        next=min+Math.round((next-min)/step)*step;
        slider.value=String(Number(next.toFixed(8)));
        slider.dispatchEvent(new Event("input",{bubbles:true}));
      }
      minus.addEventListener("click",function(){adjust(-1)});
      plus.addEventListener("click",function(){adjust(1)});
      minus.disabled=plus.disabled=slider.disabled;
      row.appendChild(minus);row.appendChild(slider);row.appendChild(plus);
    });
  }
  var originalRender=renderModule;
  renderModule=function() {
    if(active==="periodic") {
      var cfg=copyFor(state.periodic);
      m.plots=cfg.plots.concat([[lang("이상적 복원 신호 · 주파수 비교","Ideal reconstruction · frequency comparison"),
        lang("표본에서 이상적 저역통과 복원으로 얻는 CT 파형","Continuous-time result of ideal baseband reconstruction")]]);
      m.metric=cfg.labels;
      m.subtitle=cfg.subtitle;
      m.q=cfg.q; m.a=cfg.a;
    }
    originalRender();
    arrangeChapter6();
    // Preserve the chapter's normal standalone layout; maximize the embedded
    // experiment canvas when the host already provides unified chapter navigation.
    document.documentElement.classList.toggle("ss6-wide-experiment",
      active==="periodic" && window.self!==window.parent);
    if(active==="periodic") {
      var note=document.querySelector(".periodic-reading-note");
      if(note){
        note.id="frequency-learning-note";
        note.setAttribute("aria-live","polite");
        note.textContent=copyFor(state.periodic).note;
      }
      var experiment=document.querySelector(".experiment");
      if(experiment) {
        var nav=document.createElement("nav");
        nav.className="ss6-step-nav";
        nav.setAttribute("aria-label",lang("6.1 학습 순서","Chapter 6.1 learning sequence"));
        var items=[
          ["frequency",lang("1 · CT 주파수 f 변화","1 · Change analog f")],
          ["rate",lang("2 · 샘플링 주파수 fₛ 변화","2 · Change sampling fₛ")],
          ["alias",lang("3 · Aliasing 확인","3 · Explore aliasing")]
        ];
        items.forEach(function(item){
          var button=document.createElement("button");
          button.type="button";
          button.className="ss6-step-button";
          button.dataset.frequencyMode=item[0];
          button.textContent=item[1];
          if(state.periodic.mode===item[0]){
            button.classList.add("is-current");
            button.setAttribute("aria-current","step");
          }
          button.addEventListener("click",function(){
            if(state.periodic.mode===item[0])return;
            stopPlay();
            state.periodic.mode=item[0];
            state.periodic.f=10;
            state.periodic.fs=100;
            renderModule();
            var current=document.querySelector('[data-frequency-mode="'+item[0]+'"]');
            if(current)current.focus({preventScroll:true});
          });
          nav.appendChild(button);
        });
        experiment.parentNode.insertBefore(nav,experiment);
      }
    }
  };


  function foldedFrequency(f,fs){
    var r=((f%fs)+fs)%fs;
    return Math.min(r,fs-r);
  }
  function explainLive(s){
    var panel=document.getElementById("ss6-live-explanation");
    if(!panel)return;
    var f=Number(s.f),fs=Number(s.fs),F=f/fs,rec=foldedFrequency(f,fs);
    var other=fs-f;
    var explanation=s.mode==="alias"
      ?lang("두 CT 코사인 "+f+" Hz와 "+other+" Hz는 동일한 이산 신호 x[n]을 만듭니다. 이상적 기저대역 복원 결과는 "+clean(rec,3)+" Hz입니다.",
        "The "+f+" Hz and "+other+" Hz CT cosines create identical x[n]. Ideal baseband reconstruction yields "+clean(rec,3)+" Hz.")
      :lang("현재 x(t)는 "+f+" Hz 코사인입니다. "+fs+" Hz로 표본화한 x[n]의 주파수는 "+clean(F,4)+" cycles/sample입니다. 이상적 저역통과 복원 결과는 "+clean(rec,3)+" Hz입니다.",
        "The current x(t) is a "+f+" Hz cosine. At sampling rate "+fs+" Hz its digital frequency is "+clean(F,4)+" cycles/sample. Ideal low-pass reconstruction yields "+clean(rec,3)+" Hz.");
    panel.innerHTML='<div class="ss6-live-values">'
      +'<span>f = <b>'+clean(f,3)+' Hz</b></span>'
      +'<span>f<sub>s</sub> = <b>'+clean(fs,3)+' Hz</b></span>'
      +'<span>T<sub>s</sub> = <b>'+clean(1000/fs,3)+' ms</b></span>'
      +'<span>F = f/f<sub>s</sub> = <b>'+clean(F,4)+' cycles/sample</b></span>'
      +'<span>Ω = <b>'+clean(TAU*F,4)+' rad/sample</b></span>'
      +'<span>f<sub>rec</sub> = <b>'+clean(rec,3)+' Hz</b></span></div>'
      +'<p>'+explanation+'</p>';
  }
  // Typeset the frequency experiment as mathematics, with an offline MathML fallback.
  function renderFrequencyMath(s){
    var el=document.getElementById("formula"); if(!el)return;
    var fs=Number(s.fs),f=Number(s.f),ts=1000/fs,F=f/fs,om=2*Math.PI*F;
    var tex="\\begin{aligned}"+
      "x(t)&=\\cos(2\\pi f t)\\\\[3pt]"+
      "x[n]&=x(nT_s)=\\cos\\left(2\\pi\\frac{f}{f_s}n\\right)\\\\[5pt]"+
      "T_s&=\\frac{1}{f_s}="+clean(ts,2)+"\\,\\mathrm{ms}\\\\[3pt]"+
      "F&=\\frac{f}{f_s}="+clean(F,4)+"\\,\\mathrm{cycles/sample}\\\\[3pt]"+
      "\\Omega&=2\\pi F="+clean(om,4)+"\\,\\mathrm{rad/sample}"+
      "\\end{aligned}";
    function show(){
      if(!el.isConnected||active!=="periodic")return;
      if(window.katex){
        try{window.katex.render(tex,el,{displayMode:true,throwOnError:false,output:"htmlAndMathml"});el.dataset.mathRendered="katex";return;}catch(err){}
      }
      // Browser-native MathML uses structured fractions, not styled plain text.
      el.innerHTML='<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mtable columnalign="left">'
        +'<mtr><mtd><mrow><mi>x</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mi>cos</mi><mo>(</mo><mn>2</mn><mi>π</mi><mi>f</mi><mi>t</mi><mo>)</mo></mrow></mtd></mtr>'
        +'<mtr><mtd><mrow><mi>x</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mi>x</mi><mo>(</mo><mi>n</mi><msub><mi>T</mi><mi>s</mi></msub><mo>)</mo><mo>=</mo><mi>cos</mi><mo>(</mo><mn>2</mn><mi>π</mi><mfrac><mi>f</mi><msub><mi>f</mi><mi>s</mi></msub></mfrac><mi>n</mi><mo>)</mo></mrow></mtd></mtr>'
        +'<mtr><mtd><mrow><msub><mi>T</mi><mi>s</mi></msub><mo>=</mo><mfrac><mn>1</mn><msub><mi>f</mi><mi>s</mi></msub></mfrac><mo>=</mo><mtext>'+clean(ts,2)+' ms</mtext></mrow></mtd></mtr>'
        +'<mtr><mtd><mrow><mi>F</mi><mo>=</mo><mfrac><mi>f</mi><msub><mi>f</mi><mi>s</mi></msub></mfrac><mo>=</mo><mtext>'+clean(F,4)+' cycles/sample</mtext></mrow></mtd></mtr>'
        +'<mtr><mtd><mrow><mi>Ω</mi><mo>=</mo><mn>2</mn><mi>π</mi><mi>F</mi><mo>=</mo><mtext>'+clean(om,4)+' rad/sample</mtext></mrow></mtd></mtr>'
        +'</mtable></math>';
      el.dataset.mathRendered="mathml";
    }
    show();
    if(!window.katex&&document.readyState!=="complete")window.addEventListener("load",show,{once:true});
  }
  function drawReconstruction(s){
    var fs=Number(s.fs), f=Number(s.f);
    var sourceFrequency=s.mode==="alias"?fs-f:f;
    var rec=foldedFrequency(sourceFrequency,fs);
    var source=[],reconstructed=[],sampled=[],duration=.2;
    for(var i=0;i<=1000;i++){
      var t=duration*i/1000;
      source.push([t*1000,Math.cos(TAU*sourceFrequency*t)]);
      reconstructed.push([t*1000,Math.cos(TAU*rec*t)]);
    }
    for(var n=0;n<=Math.floor(duration*fs+1e-9);n++){
      var sampleTime=n/fs;
      sampled.push([sampleTime*1000,Math.cos(TAU*sourceFrequency*sampleTime)]);
    }
    drawChart("plot2",{
      xmin:0,xmax:200,ymin:-1.15,ymax:1.15,
      xlabel:"t (ms)",ylabel:"amplitude",xticks:5,
      series:[
        ...(Math.abs(sourceFrequency-rec)>1e-9?[{xy:source,color:C.coral,width:2.3,dash:true}]:[]),
        {xy:reconstructed,color:C.teal,width:2.2},
        {xy:sampled,color:C.ink,type:"stem",radius:3.1}
      ]
    });
    setLegend(2,[
      ...(Math.abs(sourceFrequency-rec)>1e-9?[{color:C.coral,kind:"dashed",label:"CT source "+clean(sourceFrequency,3)+" Hz"}]:[]),
      {color:C.teal,kind:"line",label:"Ideal reconstructed cosine "+clean(rec,3)+" Hz"},
      {color:C.ink,kind:"stem",label:"Samples at "+clean(fs,3)+" Hz"}
    ]);
  }

  var oldDrawing=drawPeriodic;
  drawPeriodic=function(s) {
    if(s.mode==="alias") {
      oldDrawing(s);
      drawReconstruction(s);
      explainLive(s);
      var oldLabels=copyFor(s).labels;
      for(var j=0;j<3;j++){var label=document.querySelectorAll(".metric .k")[j];if(label)label.textContent=oldLabels[j]}
      return;
    }
    var fs=s.fs, f=s.f, Ts=1/fs, duration=0.2, N=21; // Fixed first 21 samples and a fixed index axis
    var ct=[], sampleByTime=[], samples=[];
    // A fixed physical 0–200 ms window makes the 'same x(t)' comparison meaningful.
    for(var i=0;i<=1200;i++){
      var t=duration*i/1200;
      ct.push([t*1000,Math.cos(TAU*f*t)]);
    }
    // Show EVERY physical sampling instant across the same 200 ms CT interval,
    // so increasing f_s visibly increases the density of dots in the top chart.
    var totalInWindow=Math.floor(duration*fs+1e-9)+1;
    for(var n=0;n<totalInWindow;n++){
      var time=n/fs;
      sampleByTime.push([time*1000,Math.cos(TAU*f*time)]);
    }
    // Keep the first 21 samples and the n-axis fixed for a fair DT comparison.
    for(var n=0;n<N;n++)samples.push([n,Math.cos(TAU*f*n/fs)]);
    drawChart("plot0",{
      xmin:0,xmax:200,ymin:-1.15,ymax:1.15,
      xlabel:"t (ms)",ylabel:"x(t)",
      xticks:5,series:[
        {xy:ct,color:C.teal,width:2.2},
        {xy:sampleByTime,color:C.ink,type:"stem",radius:3.4}
      ]});
    setLegend(0,[
      {color:C.teal,kind:"line",label:"CT signal x(t) = cos(2πft), f = "+f+" Hz"},
      {color:C.ink,kind:"stem",label:totalInWindow+" sampling instants over 200 ms; T_s = "+clean(Ts*1000,2)+" ms"}
    ]);
    drawChart("plot1",{
      xmin:0,xmax:N-1,ymin:-1.15,ymax:1.15,
      xlabel:"n",ylabel:"x[n]",
      xticks:6,series:[{xy:samples,color:C.ink,type:"stem",radius:4.0}]
    });
    setLegend(1,[
      {color:C.ink,kind:"stem",label:"First 21 samples x[n], n = 0…20 (fixed index axis)"}
    ]);
    var F=f/fs,Omega=TAU*F,N0=fs/gcd(fs,f);
    renderFrequencyMath(s);
    setMetrics([
      [clean(F,4),"f / f_s = "+f+" / "+fs+" cycles/sample"],
      [clean(Omega,4),"Ω = 2πF rad/sample"],
      [String(N0),"smallest integer period; "+(N0>21?"longer than the 21 displayed samples":"visible within the 21-sample index range")]
    ]);
    var change=s.mode==="frequency"
     ?lang("f_s를 고정하고 f를 증가시키면 CT 진동이 빨라지고 DT의 F와 Ω도 증가합니다. n 간격은 1로 유지됩니다.",
           "Increasing f at fixed f_s accelerates the CT oscillations and increases digital F and Ω. The n spacing stays 1.")
     :lang("같은 x(t)에 대해 f_s를 증가시키면 T_s가 줄어 샘플을 더 자주 측정합니다. CT 파형은 변하지 않지만 x[n]과 F가 달라집니다.",
           "Increasing f_s reduces T_s. The CT waveform stays unchanged, while its sampled sequence x[n] and F change.");
    var samplesPerCycle=fs/f;
    setInsight(change+"  f="+f+" Hz, f_s="+fs+" Hz, T_s="+clean(Ts*1000,2)+" ms."
      +"  F="+clean(F,4)+" cycles/sample; Ω="+clean(Omega,3)+" rad/sample."
      +"  f_s/f="+clean(samplesPerCycle,3)+" samples per CT cycle."
      +"  N₀="+N0+" is the exact DT fundamental period in samples for these integer-frequency settings;"
      +" f_s/f need not be an integer and should not be confused with N₀.");
    var note=document.getElementById("frequency-learning-note");
    if(note)note.textContent=copyFor(s).note;
    drawReconstruction(s);
    explainLive(s);
  };

  var oldGuide=GUIDES6.periodic;
  GUIDES6.periodic=function(s) {
    if(s.mode==="alias")return oldGuide(s);
    var fs=s.fs,f=s.f,F=f/fs,Omega=TAU*F,N0=fs/gcd(fs,f);
    return {steps:[
      guideItem("Continuous-time frequency f / 연속시간 주파수",
        "x(t)=cos(2πft), &nbsp; f="+f+" Hz, &nbsp; T₀="+clean(1000/f,2)+" ms",
        "CT의 t는 초 단위입니다. 위쪽 그래프에서는 항상 0–200 ms를 보여줍니다."),
      guideItem("Sampling rate and sampling instants / 샘플링 시점",
        "f<sub>s</sub>="+fs+" Hz, &nbsp; T<sub>s</sub>=1/f<sub>s</sub>="+clean(1000/fs,2)+" ms, &nbsp; t=nT<sub>s</sub>",
        "f_s가 바뀌면 CT 파형 자체가 아니라 샘플을 관찰하는 물리적 시점이 달라집니다."),
      guideItem("Digital frequency F and Ω / 디지털 주파수",
        "x[n]=cos(2πFn), &nbsp; F=f/f<sub>s</sub>="+clean(F,4)+" cycles/sample, &nbsp; Ω="+clean(Omega,4)+" rad/sample",
        "이산 인덱스 n의 증가 간격은 1입니다. F와 Ω는 샘플 하나를 이동할 때의 위상 진행량을 나타냅니다."),
      guideItem("Discrete-time periodicity / 이산시간 주기성",
        "x[n+N₀]=x[n] when F N₀ is an integer; &nbsp; N₀="+N0+" samples",
        "정확한 DT 주기 N₀는 정수입니다. f_s/f가 정수가 아닐 수 있으므로 두 값을 혼동하지 마세요.")
    ],graphs:[
      guidePlot("CT waveform and sampling instants",
        "The upper x-axis is physical milliseconds. Changing f_s moves the sample markers; changing f reshapes x(t).",
        "f 고정 시 위쪽 CT 곡선은 동일합니다. 샘플 시점만 달라지는지 확인하세요."),
      guidePlot("DT sequence and integer period",
        "The lower x-axis always shows the first 21 samples on the same n=0–20 scale. Its index spacing is one while oscillation and N₀ depend on f/f_s.",
        "x[n]의 n 간격은 항상 1이며, 신호의 주기는 F=f/f_s에 따라 달라집니다.")
    ],check:"Is f_s/f necessarily an integer? How does that differ from the fundamental DT period N₀?"};
  };


  // Typeset every visible Chapter 6.1 guided-derivation equation, including
  // steps revealed later by the Previous/Next/Show all controls.
  window.__ss6TypesetGuide=function(pane,s){
    if(!pane||active!=="periodic")return;
    var fs=Number(s.fs),f=Number(s.f),F=f/fs;
    var n0=fs/gcd(fs,f),ts=1000/fs,t0=1000/f,om=2*Math.PI*F;
    var values={f:clean(f,3),fs:clean(fs,3),F:clean(F,4),
      ts:clean(ts,2),t0:clean(t0,2),om:clean(om,4),N0:String(n0)};
    var tex=[
      "x(t)=\\cos(2\\pi ft),\\quad f={f}\\,\\mathrm{Hz},\\quad T_0={t0}\\,\\mathrm{ms}",
      "f_s={fs}\\,\\mathrm{Hz},\\quad T_s=\\frac1{f_s}={ts}\\,\\mathrm{ms},\\quad t=nT_s",
      "x[n]=\\cos(2\\pi Fn),\\quad F=\\frac f{f_s}={F}\\,\\frac{\\mathrm{cycles}}{\\mathrm{sample}},\\quad \\Omega={om}\\,\\frac{\\mathrm{rad}}{\\mathrm{sample}}",
      "x[n+N_0]=x[n],\\quad FN_0\\in\\mathbb{Z},\\quad N_0={N0}\\ \\mathrm{samples}"
    ].map(function(t){return t.replace(/\{(f|fs|F|ts|t0|om|N0)\}/g,function(_,key){return values[key]})});
    var nativeMath=[
      '<mrow><mi>x</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mi>cos</mi><mo>(</mo><mn>2</mn><mi>π</mi><mi>f</mi><mi>t</mi><mo>)</mo><mspace width=".9em"/><mi>f</mi><mo>=</mo><mtext>'+values.f+' Hz</mtext><mspace width=".9em"/><msub><mi>T</mi><mn>0</mn></msub><mo>=</mo><mtext>'+values.t0+' ms</mtext></mrow>',
      '<mrow><msub><mi>f</mi><mi>s</mi></msub><mo>=</mo><mtext>'+values.fs+' Hz</mtext><mspace width=".8em"/><msub><mi>T</mi><mi>s</mi></msub><mo>=</mo><mfrac><mn>1</mn><msub><mi>f</mi><mi>s</mi></msub></mfrac><mo>=</mo><mtext>'+values.ts+' ms</mtext><mspace width=".8em"/><mi>t</mi><mo>=</mo><mi>n</mi><msub><mi>T</mi><mi>s</mi></msub></mrow>',
      '<mrow><mi>x</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mi>cos</mi><mo>(</mo><mn>2</mn><mi>π</mi><mi>F</mi><mi>n</mi><mo>)</mo><mspace width=".8em"/><mi>F</mi><mo>=</mo><mfrac><mi>f</mi><msub><mi>f</mi><mi>s</mi></msub></mfrac><mo>=</mo><mtext>'+values.F+' cycles/sample</mtext><mspace width=".8em"/><mi>Ω</mi><mo>=</mo><mtext>'+values.om+' rad/sample</mtext></mrow>',
      '<mrow><mi>x</mi><mo>[</mo><mi>n</mi><mo>+</mo><msub><mi>N</mi><mn>0</mn></msub><mo>]</mo><mo>=</mo><mi>x</mi><mo>[</mo><mi>n</mi><mo>]</mo><mspace width=".9em"/><mi>F</mi><msub><mi>N</mi><mn>0</mn></msub><mo>∈</mo><mi>ℤ</mi><mspace width=".9em"/><msub><mi>N</mi><mn>0</mn></msub><mo>=</mo><mtext>'+values.N0+' samples</mtext></mrow>'
    ];
    pane.querySelectorAll(".deriv-math").forEach(function(el,i){
      if(i>=tex.length)return;
      if(window.katex){try{window.katex.render(tex[i],el,{displayMode:true,throwOnError:false});el.dataset.mathRendered="katex";return}catch(e){}}
      el.innerHTML='<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">'+nativeMath[i]+'</math>';
      el.dataset.mathRendered="mathml";
    });
  };

  // Existing automatic playback varies f. In step 2 the free control is f_s instead.
  var oldPlay=togglePlay;
  togglePlay=function() {
    if(active!=="periodic"||state.periodic.mode!=="rate")return oldPlay();
    if(playTimer){stopPlay();return}
    var button=$("play");if(button)button.textContent=KO.pause;
    playTimer=setInterval(function() {
      var next=state.periodic.fs+20;
      if(next>200)next=100;
      state.periodic.fs=next;
      var control=$("ctrl_fs");if(control)control.value=String(next);
      var output=$("val_fs");if(output)output.textContent=String(next)+" Hz";
      requestUpdate();
    },900);
  };

  // Use the existing change handler for state mutation; only rebuild the phase UI.
  document.addEventListener("change",function(e) {
    if(active==="periodic" && e.target&&e.target.id==="ctrl_mode") {
      state.periodic.f=10;state.periodic.fs=100;
      renderModule();
    }
  });
  var css=document.createElement("style");
  css.textContent=".periodic-reading-note{margin:0 0 13px;padding:12px 15px;border-left:4px solid #0e8491;background:#eaf6f7;border-radius:9px;line-height:1.7;font-size:13px}"
    +".ss6-step-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:0 0 16px}"
    +".ss6-step-button{border:1px solid #a7c4ca;border-radius:10px;background:#f0f7f8;color:#244859;min-height:48px;font-weight:700;text-align:center;cursor:pointer;padding:9px 12px;line-height:1.35}"
    +".ss6-step-button.is-current{border:2px solid #087f8c;background:#d4edee;color:#0b4852;box-shadow:inset 0 -3px #087f8c}"
    +".ss6-step-button:focus-visible{outline:3px solid #e8a44f;outline-offset:2px}"
    +"#wrap_mode{display:none!important}#wrap_fs [disabled],#wrap_f [disabled]{opacity:.56;cursor:not-allowed}"
    +"label[data-fixed-control]::after{content:' (fixed)';font-size:11px;color:#527687}"
    +"html[data-theme='dark'] .periodic-reading-note{background:#1a3443;color:#edf6f8;border-left-color:#6dcbd4}"
    +"html[data-theme='dark'] .ss6-step-button{background:#1b3344;color:#e7f0f3;border-color:#5d8594}"
    +"html[data-theme='dark'] .ss6-step-button.is-current{background:#245766;color:#fff;border-color:#8dd8dc}"
    +"@media(max-width:680px){.ss6-step-nav{grid-template-columns:1fr}.ss6-step-button{min-height:42px;text-align:left}}"
    +"html.ss6-wide-experiment .app{display:block!important;min-height:0!important}"
    +"html.ss6-wide-experiment .sidebar{display:none!important}"
    +"html.ss6-wide-experiment .main{max-width:none!important;margin:0!important;padding:10px 14px 24px!important}"
    +"html.ss6-wide-experiment .topline{display:none!important}"
    +"html.ss6-wide-experiment .heading{padding:0 0 6px!important;border-bottom:0!important}"
    +"html.ss6-wide-experiment .heading h2{font-size:clamp(19px,2vw,25px)!important;margin:0 0 5px!important;line-height:1.22!important}"
    +"html.ss6-wide-experiment .heading p{font-size:12px!important;line-height:1.5!important;max-width:none!important}"
    +"html.ss6-wide-experiment .hero-callout{margin:8px 0 10px!important;padding:8px 12px!important;min-height:0!important;gap:8px!important}"
    +"html.ss6-wide-experiment .hero-callout .formula{font-size:16px!important;line-height:1.45!important}"
    +"html.ss6-wide-experiment .hero-callout .hint{font-size:11px!important}"
    +"html.ss6-wide-experiment .ss6-step-nav{gap:8px;margin-bottom:10px}"
    +"html.ss6-wide-experiment .ss6-step-button{min-height:39px;padding:6px 10px;font-size:12px}"
    +"html.ss6-wide-experiment .experiment{grid-template-columns:minmax(205px,245px) minmax(0,1fr)!important;gap:12px!important}"
    +"html.ss6-wide-experiment .controls{padding:12px!important;top:0!important;position:static!important}"
    +"html.ss6-wide-experiment .ctrl{margin-bottom:12px!important}"
    +"html.ss6-wide-experiment .controls h3{font-size:16px!important;margin:3px 0 9px!important}"
    +"html.ss6-wide-experiment .body-col{gap:10px!important}"
    +"html.ss6-wide-experiment .charts{gap:10px!important}"
    +"html.ss6-wide-experiment .figure{padding:10px 11px 8px!important}"
    +"html.ss6-wide-experiment .figure canvas{height:clamp(245px,32dvh,365px)!important}"
    +"html.ss6-wide-experiment .periodic-reading-note{padding:9px 12px!important;margin-bottom:8px!important;line-height:1.5!important}"
    +"html.ss6-wide-experiment .footer{margin-top:10px!important}"
    +"@media(max-width:960px){html.ss6-wide-experiment .experiment{grid-template-columns:1fr!important}"
    +"html.ss6-wide-experiment .controls{padding:9px 12px!important}"
    +"html.ss6-wide-experiment .control-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:5px 12px!important}"
    +"html.ss6-wide-experiment .ctrl{margin:0 0 8px!important}"
    +"html.ss6-wide-experiment .charts{grid-template-columns:repeat(2,minmax(0,1fr))!important}}"
    +"@media(max-width:700px){html.ss6-wide-experiment .main{padding:7px 8px 18px!important}"
    +"html.ss6-wide-experiment .heading p{font-size:11px!important}"
    +"html.ss6-wide-experiment .ss6-step-nav{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:4px}"
    +"html.ss6-wide-experiment .ss6-step-button{min-width:0;padding:6px 5px;font-size:11px;text-align:center}"
    +"html.ss6-wide-experiment .charts{grid-template-columns:1fr!important}"
    +"html.ss6-wide-experiment .figure canvas{height:245px!important}}"
    +".legend{flex-wrap:wrap;gap:9px 16px}";
  // Chapter 6 one-screen workspace: controls remain visible next to both plots.
  // This overrides earlier wide-view breakpoint rules without changing math or state.
  css.textContent +=
    "html.ss6-wide-experiment .heading{padding-bottom:3px!important}"
    +"html.ss6-wide-experiment .heading p{margin:2px 0!important}"
    +"html.ss6-wide-experiment .hero-callout{margin:4px 0 7px!important;padding:5px 9px!important}"
    +"html.ss6-wide-experiment .ss6-step-nav{margin-bottom:7px!important}"
    +"html.ss6-wide-experiment .periodic-reading-note{margin-bottom:6px!important;padding:6px 10px!important;font-size:12px!important}"
    +"html.ss6-wide-experiment .experiment{align-items:start!important}"
    +"html.ss6-wide-experiment .charts{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;align-items:start!important}"
    +"html.ss6-wide-experiment .figure{min-width:0!important;padding:8px!important}"
    +"html.ss6-wide-experiment .figure canvas{height:clamp(185px,29dvh,270px)!important;width:100%!important}"
    +"html.ss6-wide-experiment .legend{font-size:11px!important;line-height:1.35!important;gap:4px 8px!important}"
    +"html.ss6-wide-experiment .controls{max-height:calc(100dvh - 125px)!important;overflow-y:auto!important;scrollbar-width:thin}"
    +"@media(min-width:741px) and (max-width:1100px){"
    +"html.ss6-wide-experiment .experiment{grid-template-columns:minmax(190px,23%) minmax(0,1fr)!important;gap:9px!important}"
    +"html.ss6-wide-experiment .control-grid{display:block!important}"
    +"html.ss6-wide-experiment .controls{padding:9px!important}"
    +"html.ss6-wide-experiment .figure canvas{height:clamp(175px,27dvh,245px)!important}"
    +"}"
    +"@media(max-width:740px){"
    +"html.ss6-wide-experiment .experiment{grid-template-columns:1fr!important}"
    +"html.ss6-wide-experiment .controls{max-height:none!important;overflow:visible!important}"
    +"html.ss6-wide-experiment .control-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important}"
    +"html.ss6-wide-experiment .charts{grid-template-columns:1fr!important}"
    +"html.ss6-wide-experiment .figure canvas{height:clamp(175px,27dvh,235px)!important}"
    +"}";

  // Shared Chapter 6: left navigation owns the experiment title. No repeated header row.
  css.textContent +=
    "html.ss6-compact-workspace .sidebar,html.ss6-compact-workspace .topline,html.ss6-compact-workspace .heading{display:none!important}"
    +"html.ss6-compact-workspace .app{display:block!important;min-height:0!important}"
    +"html.ss6-compact-workspace .main{max-width:none!important;margin:0!important;padding:5px 11px 18px!important}"
    +"html.ss6-compact-workspace .ss6-step-nav{display:none!important}"
    +"html.ss6-compact-workspace .experiment{display:block!important;max-width:none!important}"
    +"html.ss6-compact-workspace .controls{position:static!important;max-height:none!important;overflow:visible!important;margin:0 0 7px!important;padding:8px 10px!important}"
    +"html.ss6-compact-workspace .controls>.overlabel{display:none!important}"
    +"html.ss6-compact-workspace .controls h3{font-size:13px!important;line-height:1.3!important;margin:0 0 6px!important}"
    +"html.ss6-compact-workspace .control-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:5px 12px!important}"
    +"html.ss6-compact-workspace .ctrl{min-width:0!important;margin:0!important}"
    +"html.ss6-compact-workspace .ctrl label{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:6px!important;margin:0 0 2px!important;font-size:12px!important}"
    +"html.ss6-compact-workspace .ss6-inline-slider{display:flex!important;align-items:center!important;gap:5px!important;min-width:0!important}"
    +"html.ss6-compact-workspace .ss6-inline-slider input[type=range]{flex:1 1 auto!important;min-width:25px!important;width:100%!important;margin:0!important}"
    +"html.ss6-compact-workspace .ss6-adjust-button{display:flex!important;align-items:center!important;justify-content:center!important;flex:0 0 29px!important;width:29px!important;height:30px!important;min-height:30px!important;padding:0!important;border-radius:7px!important;border:1px solid var(--els-border,#777)!important;background:var(--els-surface,#222)!important;color:var(--els-ink,#fff)!important;font-size:18px!important;cursor:pointer!important}"
    +"html.ss6-compact-workspace .ss6-adjust-button:disabled{opacity:.35!important;cursor:not-allowed!important}"
    +"html.ss6-compact-workspace .ends{font-size:10px!important;margin:0!important;line-height:1.15!important}"
    +"html.ss6-compact-workspace .ss6-short-actions{display:flex!important;justify-content:flex-end!important;gap:6px!important;margin:5px 0 0!important}"
    +"html.ss6-compact-workspace .ss6-short-actions .btn{width:auto!important;flex:0 0 auto!important;min-height:30px!important;padding:3px 12px!important;font-size:12px!important}"
    +"html.ss6-compact-workspace .controls .notice{display:none!important}"
    +"html.ss6-compact-workspace .ss6-top-question{padding:8px 11px!important;margin:0 0 7px!important}"
    +"html.ss6-compact-workspace .ss6-top-question .overlabel{display:none!important}"
    +"html.ss6-compact-workspace .ss6-top-question h3{font-size:13px!important;margin:0 0 2px!important}"
    +"html.ss6-compact-workspace .ss6-top-question p{margin:0!important;font-size:13px!important;line-height:1.45!important}"
    +"html.ss6-compact-workspace .ss6-top-question details{margin:3px 0 0!important}"
    +"html.ss6-compact-workspace .body-col{gap:8px!important}"
    +"html.ss6-compact-workspace .charts{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}"
    +"html.ss6-compact-workspace .figure{min-width:0!important;padding:8px!important}"
    +"html.ss6-compact-workspace .figure h3{font-size:13px!important;line-height:1.3!important;margin:0 0 2px!important}"
    +"html.ss6-compact-workspace .figure p{font-size:11px!important;line-height:1.3!important;margin:0 0 4px!important}"
    +"html.ss6-compact-workspace .figure canvas{height:clamp(180px,28dvh,260px)!important;width:100%!important}"
    +"html.ss6-compact-workspace .hero-callout{padding:7px!important;margin:4px 0!important}"
    +"html.ss6-compact-workspace .periodic-reading-note{margin:4px 0!important;padding:6px 9px!important;font-size:12px!important}"
    +"html.ss6-compact-workspace #wrap_mode{display:block!important}"
    +"html.ss6-compact-workspace #wrap_mode select{width:100%!important;min-height:32px!important;font-size:12px!important}"
    +"html.ss6-compact-workspace .figure.wide{grid-column:1/-1!important}"
    +"@media(max-width:800px){html.ss6-compact-workspace .control-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}"
    +"@media(max-width:620px){html.ss6-compact-workspace .control-grid{grid-template-columns:1fr!important}html.ss6-compact-workspace .charts{grid-template-columns:1fr!important}html.ss6-compact-workspace .main{padding:4px 7px 16px!important}}";

  css.textContent +=
    "html.ss6-compact-workspace .ss6-live-explanation{border:1px solid var(--els-border,#666);border-left:3px solid #41b8ba;border-radius:8px;padding:8px 12px;background:var(--els-surface,#222);margin:0 0 8px}"
    +"html.ss6-compact-workspace .ss6-live-values{display:flex;flex-wrap:wrap;gap:5px 17px;font-size:12px;font-variant-numeric:tabular-nums}"
    +"html.ss6-compact-workspace .ss6-live-values span{white-space:nowrap}"
    +"html.ss6-compact-workspace .ss6-live-explanation p{margin:5px 0 0!important;font-size:12px;line-height:1.5}"
    +"html.ss6-compact-workspace .charts.three .figure.wide{grid-column:1/-1!important}"
    +"html.ss6-compact-workspace .charts.three .figure.wide canvas{height:clamp(190px,28dvh,290px)!important}";
  function fitChapterSixFrame(){
    if(window.self===window.parent||!window.frameElement)return;
    var frame=window.frameElement;
    var main=document.querySelector(".main")||document.getElementById("content");
    var bottom=main?main.getBoundingClientRect().bottom+window.scrollY:document.body.scrollHeight;
    var height=Math.ceil(bottom+14);
    if(height>0&&height<50000){
      var last=Number(frame.dataset.ss6FitHeight||0);
      if(Math.abs(height-last)>3){
        frame.dataset.ss6FitHeight=String(height);
        frame.style.setProperty("--ss6-content-height",height+"px");
      }
    }
  }
  var fitQueued=false;
  function queueFit(){
    if(fitQueued)return;
    fitQueued=true;
    requestAnimationFrame(function(){fitQueued=false;fitChapterSixFrame()});
  }
  if(window.self!==window.parent&&typeof ResizeObserver!=="undefined"){
    var fitObserver=new ResizeObserver(queueFit);
    fitObserver.observe(document.body);
    fitObserver.observe(document.getElementById("content"));
    window.addEventListener("resize",queueFit);
    document.addEventListener("toggle",queueFit,true);
    requestAnimationFrame(queueFit);
  }
  // Final responsive overrides for the actual compact Chapter 6.1 workspace.
  css.textContent +=
    "html.ss6-compact-workspace .ctrl label{font-size:15px!important}"
    +"html.ss6-compact-workspace .ctrl output,html.ss6-compact-workspace .ends{font-size:13px!important}"
    +"html.ss6-compact-workspace .ss6-live-explanation p,html.ss6-compact-workspace .periodic-reading-note{font-size:16px!important;line-height:1.6!important}"
    +"html.ss6-compact-workspace .figure h3{font-size:17px!important}"
    +"html.ss6-compact-workspace .figure p{font-size:14px!important;line-height:1.5!important}"
    +"html.ss6-compact-workspace .legend{font-size:14px!important;line-height:1.5!important}"
    +"html.ss6-compact-workspace .hero-callout .formula{font-size:clamp(17px,1.5vw,23px)!important;line-height:1.6!important;overflow-x:auto!important;color:var(--els-ink,var(--ink))!important}"
    +"html.ss6-compact-workspace .hero-callout .katex-display{margin:0!important;overflow-x:auto!important}"
    +"html.ss6-compact-workspace .hero-callout math{font-size:1em;max-width:100%}"
    +"html.ss6-compact-workspace .hero-callout{padding:11px 13px!important;margin:5px 0 9px!important}"
    +"html.ss6-compact-workspace .ss6-live-values{font-size:14px!important}"
    +"html.ss6-compact-workspace .ss6-top-question p{font-size:16px!important}"
    +"html.ss6-compact-workspace .figure canvas{height:clamp(210px,31dvh,310px)!important}"
    +"html[data-theme='light']{--bg:#fff!important;--paper:#fff!important}"
    +"html[data-theme='light'] body,html[data-theme='light'] .main{background:#fff!important}"
    +"html[data-els-theme='white']{--bg:#fff!important;--paper:#fff!important;--els-bg:#fff!important;--els-surface:#fff!important}"
    +"html[data-els-theme='white'] body,html[data-els-theme='white'] .main{background:#fff!important}"
    +"html.ss6-compact-workspace .experiment .controls{position:static!important;top:auto!important;max-height:none!important;overflow:visible!important;z-index:auto!important}"
    +"@media(max-width:600px){html.ss6-compact-workspace .control-grid{grid-template-columns:1fr!important}html.ss6-compact-workspace .hero-callout .formula{font-size:17px!important}}";
  document.head.appendChild(css);
  renderModule();
})();