/* Published chapter metadata is managed through course-catalog.json.
   Failure to load preserves existing content and navigation (offline fallback). */
(async()=>{
 "use strict";
 try{
  const response=await fetch("./course-catalog.json",{cache:"no-store"});
  if(!response.ok)throw Error("Catalog HTTP "+response.status);
  const catalog=await response.json();
  if(catalog?.schemaVersion!==1||!Array.isArray(catalog.chapters))throw Error("Invalid catalog");
  window.__ssApplyCatalog?.(catalog);
 }catch(error){
  console.warn("S&S catalog unavailable; using original chapter navigation.",error);
 }
})();
