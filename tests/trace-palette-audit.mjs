/** WCAG non-text-contrast guard for six trace roles across five site themes.
 * Run with: node tests/trace-palette-audit.mjs
 * Threshold 3:1 applies to graphical objects needed to understand the plot.
 */
const themes={
 'neutral-dark':['#1c1c1c',true],
 'warm-dark':['#293130',true],
 'navy-dark':['#1c293a',true],
 'warm-neutral':['#fffefa',false],
 'white-clean':['#ffffff',false]
};
const colors={
 dark:{teal:'#56d5d2',coral:'#ff9f85',gold:'#f2ca66',violet:'#c6affa',blue:'#87b9ff',gray:'#d0d8dc'},
 light:{teal:'#006b75',coral:'#b54e35',gold:'#835a00',violet:'#6b4aaa',blue:'#1d5da7',gray:'#4f626b'}
};
const lum=h=>{
 const c=h.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 return .2126*c[0]+.7152*c[1]+.0722*c[2];
};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
let failure=0;
for(const [theme,[bg,dark]] of Object.entries(themes)){
 for(const [role,color] of Object.entries(colors[dark?'dark':'light'])){
  const v=ratio(color,bg),pass=v>=3;
  console.log(pass?'PASS':'FAIL',theme,role,v.toFixed(2)+':1');
  if(!pass)failure++;
 }
}
if(failure)process.exitCode=1;
else console.log('PASS: 30/30 graphical object color pairs satisfy 3:1');
