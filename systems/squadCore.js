/* CORINTHIANS NOVA ERA — SQUAD CORE */
(function(){
"use strict";

const FORMATION=[
 {slot:"GK",position:"GOL"},
 {slot:"RB",position:"LD"},
 {slot:"CB1",position:"ZAG"},
 {slot:"CB2",position:"ZAG"},
 {slot:"LB",position:"LE"},
 {slot:"DM1",position:"VOL"},
 {slot:"DM2",position:"VOL"},
 {slot:"AM",position:"MEI"},
 {slot:"RW",position:"PD"},
 {slot:"LW",position:"PE"},
 {slot:"ST",position:"ATA"}
];

const SECONDARY={
 GOL:["GOL"],
 LD:["LD","LE"],
 LE:["LE","LD"],
 ZAG:["ZAG","VOL"],
 VOL:["VOL","MC","MEI"],
 MC:["MC","VOL","MEI"],
 MEI:["MEI","MC","PD","PE"],
 PD:["PD","PE","MEI"],
 PE:["PE","PD","MEI"],
 ATA:["ATA","MEI","PE","PD"]
};

function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

window.SquadCore={
 init:function(G){
  var s=G.state;
  s.squad=s.squad&&s.squad.length?s.squad:(window.PLAYERS||[]).filter(function(p){return p.club==="corinthians"&&p.status==="elenco";}).map(function(p){return Object.assign({},p);});
  s.lineup=s.lineup||{};
  s.bench=Array.isArray(s.bench)?s.bench:[];
  s.squad.forEach(function(p){
   p.condition=Number(p.condition??90);
   p.fitness=Number(p.fitness??90);
   p.morale=Number(p.morale??70);
   p.form=Number(p.form??70);
   p.minutes=Number(p.minutes??0);
   p.developmentXP=Number(p.developmentXP??0);
   p.injured=!!p.injured;
   p.suspended=!!p.suspended;
   p.naturalPositions=Array.isArray(p.naturalPositions)?p.naturalPositions:(SECONDARY[p.position]||[p.position]);
   p.role=p.role||"rotacao";
   p.leadership=Number(p.leadership??clamp(Math.round((p.overall||70)*.72+(p.age||25)*.7),40,90));
  });
  if(!s.squad.length&&window.PLAYERS)s.squad=window.PLAYERS.filter(function(p){return p.club==="corinthians";}).map(function(p){return Object.assign({},p);});
  return s;
 },

 available:function(G){
  return this.init(G).squad.filter(function(p){return !p.injured&&!p.suspended;});
 },

 eligibility:function(G,p,position){
  if(!p||p.injured||p.suspended)return -999;
  var natural=p.naturalPositions||SECONDARY[p.position]||[p.position];
  var fit=natural.indexOf(position)>=0;
  var penalty=p.position===position?0:natural.indexOf(position)===1?4:8;
  return Number(p.overall||70)-penalty+(Number(p.form||70)-70)*.10+(Number(p.condition||80)-80)*.08+(Number(p.morale||70)-70)*.04;
 },

 autoLineup:function(G){
  var s=this.init(G),pool=this.available(G).slice(),chosen=[],lineup={};
  FORMATION.forEach(function(slot,i){
   var best=null,bestScore=-9999;
   pool.forEach(function(p){
    var score=SquadCore.eligibility(G,p,slot.position);
    if(score>bestScore){bestScore=score;best=p;}
   });
   if(best){chosen.push(best);lineup[i]=best.id;pool=pool.filter(function(p){return p.id!==best.id;});}
  });
  if(chosen.length<11)return false;
  s.lineup=lineup;
  s.bench=pool.slice(0,7).map(function(p){return p.id;});
  s.captain=this.selectCaptain(G,chosen).id;
  s.viceCaptain=this.selectViceCaptain(G,chosen).id;
  if(G.addNews)G.addNews("📋 Escalação automática","Melhor XI disponível em 4-2-3-1, com banco de 7 jogadores.","FUTEBOL");
  return chosen;
 },

 selectCaptain:function(G,players){
  return (players||[]).slice().sort(function(a,b){return Number(b.leadership||0)-Number(a.leadership||0)||Number(b.overall||0)-Number(a.overall||0);})[0];
 },
 selectViceCaptain:function(G,players){
  return (players||[]).slice().sort(function(a,b){return Number(b.leadership||0)-Number(a.leadership||0)||Number(b.age||0)-Number(a.age||0);})[1]||(players||[])[0];
 },

 selectXI:function(G,ids){
  var s=this.init(G),wanted=Array.isArray(ids)?ids.slice(0,11):[];
  var valid=wanted.map(function(id){return s.squad.find(function(p){return String(p.id)===String(id);});}).filter(function(p){return p&&!p.injured&&!p.suspended;});
  if(valid.length!==11)return false;
  s.lineup={};
  valid.forEach(function(p,i){s.lineup[i]=p.id;});
  s.bench=s.squad.filter(function(p){return !valid.some(function(x){return x.id===p.id;})&&!p.injured&&!p.suspended;}).slice(0,7).map(function(p){return p.id;});
  s.captain=s.captain&&valid.some(function(p){return p.id===s.captain;})?s.captain:this.selectCaptain(G,valid).id;
  s.viceCaptain=this.selectViceCaptain(G,valid).id;
  if(G.addNews)G.addNews("📋 Escalação definida","XI titular, banco e liderança do grupo atualizados.","FUTEBOL");
  return true;
 },

 getXI:function(G){
  var s=this.init(G);
  return Object.keys(s.lineup).sort(function(a,b){return Number(a)-Number(b);}).map(function(k){return s.squad.find(function(p){return p.id===s.lineup[k];});}).filter(Boolean).filter(function(p){return !p.injured&&!p.suspended;});
 },

 getBench:function(G){
  var s=this.init(G);
  return s.bench.map(function(id){return s.squad.find(function(p){return p.id===id;});}).filter(function(p){return p&&!p.injured&&!p.suspended;});
 },

 tick:function(G){
  var s=this.init(G),load=Number(s.training?.intensity||55),focus=s.training?.focus||"equilibrado";
  s.squad.forEach(function(p){
   if(p.injured||p.suspended){
    p.condition=clamp(Number(p.condition||40)+1.2,20,90);
    return;
   }
   var recovery=focus==="recuperacao"?1.8:load<45?1.0:.2;
   var fatigue=load>75?.8:load>60?.4:0;
   p.condition=clamp(Number(p.condition||80)+recovery-fatigue,25,100);
   p.fitness=clamp(Number(p.fitness||80)+(p.condition>70?.15:-.15),35,100);
   if(Math.random()<.045)p.form=clamp(Number(p.form||70)+(Math.random()<.5?-1:1),20,100);
   var selected=Object.values(s.lineup||{}).some(function(id){return id===p.id;});
   if(selected)p.morale=clamp(Number(p.morale||70)+(p.form>=75?.05:-.03),20,100);
   else p.morale=clamp(Number(p.morale||70)+(p.form>=75?.02:-.02),20,100);
  });
 },

 matchEligibility:function(G){
  var xi=this.getXI(G);
  return {valid:xi.length===11,missing:11-xi.length,xi:xi,bench:this.getBench(G)};
 }
};

window.Game=window.Game||{};
if(window.Game){
 Game.autoLineup=function(){return SquadCore.autoLineup(Game);};
 Game.getSquadXI=function(){return SquadCore.getXI(Game);};
 Game.getSquadBench=function(){return SquadCore.getBench(Game);};
 Game.selectXI=function(ids){return SquadCore.selectXI(Game,ids);};
}
})();