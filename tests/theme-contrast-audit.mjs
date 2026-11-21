/** Static WCAG 2.2 AA contrast regression for shared Engineering Learning Studio palette.
 * Run: node tests/theme-contrast-audit.mjs
 * Dynamic backgrounds and canvas trace colors require a browser visual audit.
 */
import fs from 'node:fs';
const css=fs.readFileSync(new URL('../assets/els-theme-v2.css',import.meta.url),'utf8');
const themes=['neutral-dark','warm-dark','navy-dark','warm-neutral','white-clean'];
const luminance=hex=>{
 const rgb=hex.slice(1).match(/../g).map(h=>parseInt(h,16)/255)
  .map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4);
 return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;
};
const contrast=(fg,bg)=>{
 const a=luminance(fg),b=luminance(bg);
 return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
};
const cases=[
 ['body text','ink','page',4.5],
 ['card text','ink','surface',4.5],
 ['secondary text','muted','surface',4.5],
 ['link text','link','surface',4.5],
 ['button text','primary-text','primary',4.5],
 ['information text','info-ink','info-bg',4.5],
 ['code text','code-ink','code-bg',4.5]
];
let failed=0;
for(const theme of themes){
 const block=css.match(new RegExp(':root\\[data-els-theme="'+theme+'"\\]\\{([^}]+)\\}'));
 if(!block){console.error('MISSING THEME:',theme);failed++;continue}
 const pick=name=>{
  const match=block[1].match(new RegExp('--els-'+name+':(#[0-9a-fA-F]{6})'));
  if(!match)throw Error(theme+' missing '+name);
  return match[1];
 };
 for(const [description,fg,bg,min] of cases){
  const value=contrast(pick(fg),pick(bg));
  const ok=value+1e-8>=min;
  console.log((ok?'PASS':'FAIL'),theme,description,value.toFixed(2)+':1','min',min+':1');
  if(!ok)failed++;
 }
}
if(failed){console.error('Contrast audit failed:',failed);process.exitCode=1}
else console.log('PASS: all 35 shared-theme text pairs meet WCAG 2.2 AA >=4.5:1');
