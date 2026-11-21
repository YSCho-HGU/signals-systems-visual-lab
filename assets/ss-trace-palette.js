/* Shared graph series palette. Semantic hue mapping preserves distinctions when changing theme. */
(function(){
 'use strict';
 function colorValue(input){
  if(typeof input!=='string')return null;
  const x=input.trim();
  if(/^#[0-9a-f]{3}$/i.test(x))return '#'+[...x.slice(1)].map(c=>c+c).join('');
  if(/^#[0-9a-f]{6}$/i.test(x))return x.toLowerCase();
  return null;
 }
 function role(color,position=0){
  const hex=colorValue(color);
  if(!hex)return ['teal','coral','gold','violet','blue','gray'][position%6];
  const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b),delta=mx-mn;
  if(delta<0.11)return 'gray';
  let hue=mx===r?((g-b)/delta)%6:mx===g?(b-r)/delta+2:(r-g)/delta+4;
  hue=(hue*60+360)%360;
  if(hue<22||hue>=345)return 'coral';
  if(hue<73)return 'gold';
  if(hue<185)return 'teal';
  if(hue<252)return 'blue';
  if(hue<345)return 'violet';
  return 'gray';
 }
 window.ssTraceColor=function(color,position=0){
  const selected=role(color,position);
  const computed=getComputedStyle(document.documentElement).getPropertyValue('--ss-trace-'+selected).trim();
  return computed||color||'#00747d';
 };

 window.ssPlotColors=function(){
  const root=document.documentElement;
  const style=getComputedStyle(root);
  const theme=root.dataset.elsTheme||'neutral-dark';
  const dark=['neutral-dark','warm-dark','navy-dark'].includes(theme);
  const token=(name,fallback)=>style.getPropertyValue(name).trim()||fallback;
  return {
   background:token('--ss-plot-background',token('--els-surface',dark?'#1c1c1c':'#ffffff')),
   ink:token('--els-ink',dark?'#f0f0ed':'#1b2730'),
   muted:token('--els-muted',dark?'#c1c5c1':'#455663'),
   axis:token('--ss-plot-axis',dark?'#d0dbd7':'#344f62'),
   grid:token('--ss-plot-grid',dark?'#56615d':'#c6d2da'),
   rocFill:dark?'rgba(89,185,157,0.18)':'rgba(19,133,120,0.13)',
   rocLabel:dark?'#a8e3d5':'#14736d',
   label:token('--ss-plot-label',token('--els-muted',dark?'#c1c5c1':'#455663'))
  };
 };
 window.ssTraceRole=role;
})();