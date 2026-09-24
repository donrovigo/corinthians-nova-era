/* CORINTHIANS NOVA ERA — SAVE CORE */
(function(){
"use strict";
const KEY="corinthians-nova-era-save-v2";
const BACKUP=KEY+"-backup";
const SaveCore={
 version:2,
 serialize(G){return JSON.stringify({version:this.version,savedAt:new Date().toISOString(),state:G.state});},
 save(G){try{const raw=this.serialize(G);const old=localStorage.getItem(KEY);if(old)localStorage.setItem(BACKUP,old);localStorage.setItem(KEY,raw);G.state.lastSavedAt=new Date().toISOString();return true;}catch(e){return false;}},
 load(G){try{const raw=localStorage.getItem(KEY);if(!raw)return false;const data=JSON.parse(raw);if(!data?.state)return false;G.state=data.state;G.state.date=new Date(G.state.date);G.state.saveVersion=this.version;G.initialized=true;if(window.UnifiedCareerCore){UnifiedCareerCore.init(G);UnifiedCareerCore.prepareSquad(G);}if(G.render)G.render();return true;}catch(e){return false;}},
 clear(){localStorage.removeItem(KEY);},
 has(){return !!localStorage.getItem(KEY);},
 auto(G){this.save(G);}
};
window.SaveCore=SaveCore;
function wire(){if(!window.Game)return;const G=window.Game;const oldStart=G.start.bind(G),oldAdvance=G.advanceDays.bind(G);G.start=function(c){const r=oldStart(c);SaveCore.save(G);return r;};G.advanceDays=function(n){const r=oldAdvance(n);SaveCore.save(G);return r;};G.saveGame=()=>SaveCore.save(G);G.loadGame=()=>SaveCore.load(G);G.hasSave=()=>SaveCore.has();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",wire);else wire();
})();