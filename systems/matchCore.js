/* CORINTHIANS NOVA ERA — MATCH CORE */
(function(){
"use strict";

function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

const M={
 init:function(G){
  var s=G.state;
  s.matchEngine=s.matchEngine||{};
  s.playerCards=s.playerCards||{};
  return s;
 },
 players:function(G){
  return window.SquadCore?SquadCore.getXI(G):(G.state.squad||[]).filter(function(p){return Object.values(G.state.lineup||{}).includes(p.id);});
 },
 rating:function(G,team){
  if(team==="Corinthians")return window.UnifiedCareerCore?UnifiedCareerCore.teamStrength(G):76;
  var r={Flamengo:83,Palmeiras:83,"Atlético-MG":81,"Atletico-MG":81,Internacional:79,"São Paulo":79,Fluminense:78,Botafogo:78,Grêmio:77,Bahia:76,Cruzeiro:75,Bragantino:74,Vasco:73,Santos:72,Vitória:71,Ceará:70,Sport:69,Mirassol:68,Chapecoense:66,Remo:65};
  return r[team]||73;
 },
 tactical:function(G){
  var t=G.state.tactics||{},style=String(t.style||"equilibrado");
  var inP=t.inPossession||{},outP=t.outOfPossession||{};
  if(style==="intenso")return {attack:7,defense:-2,tempo:8,press:8};
  if(style==="conservador")return {attack:-6,defense:7,tempo:-5,press:2};
  if(style==="ofensivo")return {attack:8,defense:-4,tempo:6,press:5};
  return {attack:Number(inP.tempo||0)*.06,defense:Number(outP.press||0)*.05,tempo:Number(inP.tempo||50)*.025,press:Number(outP.press||50)*.04};
 },
 start:function(G,f){
  if(!f||G.state.matchEngine?.active)return false;
  if(window.SquadCore&&!SquadCore.matchEligibility(G).valid){
   if(window.SquadCore)SquadCore.autoLineup(G);
   if(!SquadCore.matchEligibility(G).valid){G.addNews("⚠️ Matchday bloqueado","Não há 11 jogadores disponíveis para a partida.","FUTEBOL");return false;}
  }
  var h=f.home||"Corinthians",a=f.away||f.opponent||"Adversário",players=this.players(G);
  var m={active:true,fixtureId:f.id||Date.now(),minute:0,home:h,away:a,events:[{minute:0,type:"system",text:"Apito inicial."}],cards:{home:[],away:[]},substitutions:[],halftime:false,stats:{home:{shots:0,shotsOnTarget:0,possession:50,xg:0,cards:0},away:{shots:0,shotsOnTarget:0,possession:50,xg:0,cards:0}},score:{home:0,away:0},playerRatings:{},playerMinutes:{},tactical:this.tactical(G)};
  players.forEach(function(p){m.playerRatings[p.id]=6.5;m.playerMinutes[p.id]=0;});
  G.state.matchEngine=m;
  f.status="live";f.matchEngineId=m.fixtureId;
  if(G.addNews)G.addNews("🏟️ Matchday",h+" x "+a+" começou.","JOGO");
  return true;
 },
 goalChance:function(side,home,away,m){
  var atk=side==="home"?home:away,opp=side==="home"?away:home;
  var tactical=m.tactical||{};
  var mod=side==="home"?1+(tactical.attack||0)*.012:1;
  var pressure=side==="home"?(tactical.press||0)*.002:0;
  return clamp(.018+(atk/(atk+opp||1))*.05+Math.max(0,atk-opp)*.0008, .012,.085)*mod+pressure;
 },
 minute:function(G){
  var s=G.state,m=s.matchEngine;
  var xi=this.players(G);
  var hs=this.rating(G,m.home),as=this.rating(G,m.away);
  var tactical=m.tactical||{};
  var home=hs+(m.home==="Corinthians"?5:0)+(s.fanMood-50)*.10+(tactical.attack||0)*.25;
  var away=as-(tactical.defense||0)*.12;
  var total=Math.max(1,home+away);
  var poss=clamp(Math.round(home/total*100),28,72);
  m.stats.home.possession=poss;m.stats.away.possession=100-poss;

  ["home","away"].forEach(function(side){
   var prob=M.goalChance(side,home,away,m);
   if(Math.random()<prob){
    var st=m.stats[side];st.shots++;
    var on=Math.random()<.42;if(on)st.shotsOnTarget++;
    st.xg+=on?.16:.045;
    if(on&&Math.random()<.18){
     m.score[side]++;
     m.events.unshift({minute:m.minute,type:"goal",text:"⚽ GOL! "+(side==="home"?m.home:m.away)+" aos "+m.minute+"'.",side:side});
     if(side==="home"&&m.home==="Corinthians"||side==="away"&&m.away==="Corinthians"){
      xi.forEach(function(p){p.morale=clamp(Number(p.morale||70)+1.5,20,100);});
     }
    }else m.events.unshift({minute:m.minute,type:"chance",text:m.minute+"' — chance de "+(side==="home"?m.home:m.away),side:side});
   }
  });

  if(Math.random()<.018){
   var side=Math.random()<home/total?"home":"away",team=side==="home"?m.home:m.away;
   m.stats[side].cards++;
   if(side==="home"&&m.home==="Corinthians"||side==="away"&&m.away==="Corinthians"){
    var target=xi[Math.floor(Math.random()*Math.max(1,xi.length))];
    if(target){
     m.cards[side].push(target.id);
     s.playerCards[target.id]=Number(s.playerCards[target.id]||0)+1;
     target.morale=clamp(Number(target.morale||70)-1,20,100);
     if(s.playerCards[target.id]>=3){
      target.suspended=true;
      s.suspensions=s.suspensions||[];
      s.suspensions.push({playerId:target.id,player:target.name,matches:1});
      m.events.unshift({minute:m.minute,type:"yellow",text:"🟨 "+target.name+" recebeu amarelo e atingiu o limite disciplinar."});
     }else m.events.unshift({minute:m.minute,type:"yellow",text:"🟨 Cartão para "+target.name});
    }
   }else m.events.unshift({minute:m.minute,type:"yellow",text:"🟨 Cartão para "+team});
  }

  if(Math.random()<.004&&xi.length){
   var p=xi[Math.floor(Math.random()*xi.length)];
   if(!p.injured){
    var days=3+Math.floor(Math.random()*21);
    p.injured=true;p.condition=35;
    s.injuries=s.injuries||[];
    s.injuries.push({playerId:p.id,player:p.name,days:days,source:"matchday"});
    var slot=Object.keys(s.lineup||{}).find(function(k){return s.lineup[k]===p.id;});
    if(slot!==undefined){
     var replacement=(s.bench||[]).map(function(id){return s.squad.find(function(x){return x.id===id;});}).find(function(x){return x&&!x.injured&&!x.suspended;});
     if(replacement){
      s.lineup[slot]=replacement.id;s.bench=s.bench.filter(function(id){return id!==replacement.id;});
      m.substitutions.push({minute:m.minute,playerOut:p.id,playerIn:replacement.id,reason:"injury"});
      m.playerRatings[replacement.id]=6.5;
      m.events.unshift({minute:m.minute,type:"injury",text:"🚑 "+p.name+" saiu lesionado. "+replacement.name+" entrou."});
     }else m.events.unshift({minute:m.minute,type:"injury",text:"🚑 "+p.name+" saiu lesionado."});
    }
   }
  }

  if(m.minute===45&&!m.halftime){
   m.halftime=true;
   m.events.unshift({minute:45,type:"halftime",text:"⏸️ Intervalo. Ajustes táticos disponíveis."});
  }

  if((m.minute===60||m.minute===75)&&s.bench?.length){
   var tired=this.players(G).slice().sort(function(a,b){return Number(a.condition||80)-Number(b.condition||80);})[0];
   var replacement=s.bench.map(function(id){return s.squad.find(function(x){return x.id===id;});}).find(function(x){return x&&!x.injured&&!x.suspended;});
   if(tired&&replacement&&Number(tired.condition||80)<48){
    var slot=Object.keys(s.lineup||{}).find(function(k){return s.lineup[k]===tired.id;});
    if(slot!==undefined){
     s.lineup[slot]=replacement.id;s.bench=s.bench.filter(function(id){return id!==replacement.id;});
     m.substitutions.push({minute:m.minute,playerOut:tired.id,playerIn:replacement.id,reason:"fatigue"});
     m.playerRatings[replacement.id]=6.5;
     m.events.unshift({minute:m.minute,type:"substitution",text:"🔄 "+replacement.name+" entrou no lugar de "+tired.name+"."});
    }
   }
  }

  this.players(G).forEach(function(p){
   p.condition=clamp(Number(p.condition||80)-.32,25,100);
   p.minutes=Number(p.minutes||0)+1;
   m.playerMinutes[p.id]=Number(m.playerMinutes[p.id]||0)+1;
   var perf=(Number(p.form||70)-70)*.012+(Number(p.condition||80)-80)*.008+(Number(p.morale||70)-70)*.006;
   m.playerRatings[p.id]=clamp(Number(m.playerRatings[p.id]||6.5)+perf*.01+(Math.random()-.48)*.035,4.5,9.8);
  });
 },
 simulate:function(G,n){
  var m=G.state.matchEngine;
  if(!m?.active)return false;
  var steps=Math.max(1,Number(n)||5);
  for(var i=0;i<steps&&m.minute<90;i++){m.minute++;this.minute(G);}
  if(m.minute>=90){
   m.active=false;
   m.final=true;
   var fixture=(G.state.matches||[]).find(function(x){return String(x.id)===String(m.fixtureId);});
   if(fixture){fixture.homeScore=m.score.home;fixture.awayScore=m.score.away;fixture.status="completed";fixture.played=true;fixture.playerRatings=Object.assign({},m.playerRatings);}
   G.finishMatchday();
  }
  return true;
 }
};

window.MatchCore=M;
function wire(){if(!window.Game)return;Game.startMatchday=function(f){return M.start(Game,f);};Game.simulateMatchMinutes=function(n){return M.simulate(Game,n);};}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",wire);else wire();
})();