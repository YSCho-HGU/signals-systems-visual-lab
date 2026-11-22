import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const script=fs.readFileSync('assets/ss-studio-redirect.js','utf8');
for(const page of ['index.html',...Array.from({length:8},(_,i)=>'chapter'+(i+1)+'.html')]){
 assert.match(fs.readFileSync(page,'utf8'),/ss-studio-redirect\.js/);
}
function run(pathname,search='',hash='',hostname='yscho-hgu.github.io'){
 const origin='https://'+hostname;
 const loc={hostname,origin,pathname,search,hash,href:origin+pathname+search+hash,replaced:null,
   replace(url){this.replaced=url}};
 vm.runInNewContext(script,{location:loc});
 return loc.replaced;
}
assert.equal(run('/signals-systems-visual-lab/chapter5.html','?lang=en','#lab3'),
 'https://yscho-hgu.github.io/engineering-learning-studio/signals-systems/chapter5.html?lang=en#lab3');
assert.equal(run('/signals-systems-visual-lab/'),
 'https://yscho-hgu.github.io/engineering-learning-studio/signals-systems/');
assert.equal(run('/signals-systems-visual-lab/chapter8.html'),
 'https://yscho-hgu.github.io/engineering-learning-studio/signals-systems/chapter8.html');
assert.equal(run('/signals-systems-visual-lab/unknown.html'),null);
assert.equal(run('/signals-systems-visual-lab/chapter1.html','','','localhost'),null);
console.log('Redirect staging contract passed: routes, query/hash and nonproduction host.');
