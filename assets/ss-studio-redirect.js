/* Activate only after target Studio monorepo has passed all release gates.
 * Preserves chapter file, query and hash; leaves browser storage untouched.
 */
(function(){
  "use strict";
  var from="/signals-systems-visual-lab/";
  var to="/engineering-learning-studio/signals-systems/";
  if(location.hostname!=="yscho-hgu.github.io")return;
  if(location.pathname.indexOf(from)!==0)return;
  var suffix=location.pathname.slice(from.length);
  if(!/^(?:index\.html|chapter[1-8]\.html)?$/.test(suffix))return;
  var url=location.origin+to+suffix+location.search+location.hash;
  if(url!==location.href)location.replace(url);
})();
