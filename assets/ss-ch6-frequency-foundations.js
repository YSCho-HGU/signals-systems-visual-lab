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
      ["frequency","1 · Change f (fixed f_s)"],
      ["rate","2 · Change f_s (fixed f)"],
      ["alias","3 · Aliasing (after fundamentals)"]
    ]});
  m.controls.find(function(x){return x.key==="fs";}).min=100;

  var originalControl = ctlHTML;
  ctlHTML = function(c,s) {
    if(active==="periodic" && c.key==="ns" && s.mode!=="alias")return "";
    var markup=originalControl(c,s);
    if(active==="periodic" &&
        ((s.mode==="frequency"&&c.key==="fs")||(s.mode==="rate"&&c.key==="f"))) {
      markup=markup.replace("<input ","<input disabled ");
      markup=markup.replace("<label for=","<label data-fixed-control=\"true\" for=");
    }
    return markup;
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
      plots:[[lang("CT 신호 x(t) · 실제 시간 (ms)","Continuous-Time x(t) · Physical Time (ms)"),
              lang("위 파형은 0–200 ms의 동일한 실제 시간 범위를 사용합니다.","The physical time range always stays 0–200 ms.")],
             [lang("DT 신호 x[n] · 샘플 인덱스","Discrete-Time Sequence x[n]"),
              lang("n=0,1,2,…의 간격은 언제나 1 sample입니다.","Integer sample indices always have spacing 1.")]],
      labels:["Digital F (cycles/sample)","Digital Ω (rad/sample)","DT fundamental period N₀"],
      subtitle:isF?lang("1단계: f_s를 고정하고 CT 주파수 f를 증가시키면서 x(t), x[n], F, Ω를 관찰합니다.",
                        "Step 1: Hold f_s constant and increase analog f. Observe x(t), x[n], F and Ω.")
                  :lang("2단계: 동일한 x(t)를 유지한 채 f_s를 바꾸세요. 실제 샘플 시간과 x[n]이 변합니다.",
                        "Step 2: Keep exactly the same x(t) and vary f_s. Sample times and x[n] change."),
      q:isF?lang("f_s를 고정하고 f만 높이면 x[n]의 인덱스 간격과 디지털 주파수는 각각 어떻게 되나요?",
                 "At fixed f_s, what happens to the spacing of n and to digital frequency when f increases?")
            :lang("아날로그 신호 x(t)가 동일한데도 f_s를 변경하면 x[n]이 왜 달라지나요?",
                  "Why does x[n] change when f_s changes even though x(t) stays the same?"),
      a:isF?lang("n의 간격은 1 sample로 그대로이며 T_s도 고정입니다. F=f/f_s와 Ω=2πF가 증가하여 x[n]이 더 빠르게 진동합니다.",
                 "The index spacing stays 1 sample and T_s is fixed. F=f/f_s and Ω=2πF increase, making x[n] oscillate faster.")
            :lang("각 샘플의 실제 시간 t=n/f_s가 달라집니다. n은 여전히 정수 간격 1이지만 T_s는 변하고 F와 Ω도 달라집니다.",
                  "The physical sampling instants t=n/f_s change. Index n still advances by 1, but T_s, F and Ω change."),
      note:isF?lang("관찰 1 · f_s=100 Hz 고정: f를 10→20→40 Hz로 올리세요. 검은 샘플 점의 실제 시간 간격과 n축 간격은 변하지 않습니다. 대신 x[n]이 더 빨리 진동합니다.",
                   "Experiment 1 · f_s fixed at 100 Hz: increase f from 10 to 20 to 40 Hz. The sample-time spacing and integer n spacing stay fixed, while x[n] oscillates faster.")
              :lang("관찰 2 · f=10 Hz 고정: f_s를 100→120→200 Hz로 바꾸세요. 위쪽 CT 파형은 그대로이지만 검은 샘플 위치와 아래쪽 첫 21개 x[n]은 바뀝니다. n축은 항상 0–20으로 고정됩니다.",
                   "Experiment 2 · f fixed at 10 Hz: vary f_s from 100 to 120 to 200 Hz. The top CT waveform stays the same, but sample instants and the first 21 samples x[n] change. The lower n-axis stays fixed at 0–20.")
    };
  }

  var originalRender=renderModule;
  renderModule=function() {
    if(active==="periodic") {
      var cfg=copyFor(state.periodic);
      m.plots=cfg.plots;
      m.metric=cfg.labels;
      m.subtitle=cfg.subtitle;
      m.q=cfg.q; m.a=cfg.a;
    }
    originalRender();
    if(active==="periodic") {
      var note=document.querySelector(".periodic-reading-note");
      if(note){
        note.id="frequency-learning-note";
        note.setAttribute("aria-live","polite");
        note.textContent=copyFor(state.periodic).note;
      }
    }
  };

  var oldDrawing=drawPeriodic;
  drawPeriodic=function(s) {
    if(s.mode==="alias") {
      oldDrawing(s);
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
    for(var n=0;n<N;n++){
      var time=n/fs;
      var amplitude=Math.cos(TAU*f*time);
      sampleByTime.push([time*1000,amplitude]);
      samples.push([n,amplitude]);
    }
    drawChart("plot0",{
      xmin:0,xmax:200,ymin:-1.15,ymax:1.15,
      xlabel:"physical time t (ms)",ylabel:"x(t)",
      xticks:5,series:[
        {xy:ct,color:C.teal,width:2.2},
        {xy:sampleByTime,color:C.ink,type:"stem",radius:3.4}
      ]});
    setLegend(0,[
      {color:C.teal,kind:"line",label:"CT signal x(t) = cos(2πft), f = "+f+" Hz"},
      {color:C.ink,kind:"stem",label:"Samples at t = nT_s, T_s = "+clean(Ts*1000,2)+" ms"}
    ]);
    drawChart("plot1",{
      xmin:0,xmax:N-1,ymin:-1.15,ymax:1.15,
      xlabel:"integer sample index n",ylabel:"x[n]",
      xticks:6,series:[{xy:samples,color:C.ink,type:"stem",radius:4.0}]
    });
    setLegend(1,[
      {color:C.ink,kind:"stem",label:"x[n] = cos(2π(f/f_s)n), n = 0,1,2,…"}
    ]);
    var F=f/fs,Omega=TAU*F,N0=fs/gcd(fs,f);
    setFormula("x(t)=cos(2πft) &nbsp;→&nbsp; x[n]=x(nT<sub>s</sub>)=cos(2π(f/f<sub>s</sub>)n)<br>"
       +"T<sub>s</sub>="+clean(Ts*1000,2)+" ms &nbsp;·&nbsp; F=f/f<sub>s</sub>="+clean(F,4)+" cycles/sample"
       +" &nbsp;·&nbsp; Ω=2πF="+clean(Omega,4)+" rad/sample");
    setMetrics([
      [clean(F,4),"f / f_s = "+f+" / "+fs+" cycles/sample"],
      [clean(Omega,4),"Ω = 2πF rad/sample"],
      [String(N0),"smallest integer N₀ with F N₀ ∈ ℤ"]
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
    +"#wrap_fs [disabled],#wrap_f [disabled]{opacity:.50;cursor:not-allowed}label[data-fixed-control]{font-weight:750}.legend{flex-wrap:wrap;gap:9px 16px}";
  document.head.appendChild(css);
  renderModule();
})();