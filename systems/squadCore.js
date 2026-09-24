window.SquadCore={
 init:function(G){
  var s=G.state;s.squad=s.squad&&s.squad.length?s.squad:(window.PLAYERS||[]).map(function(p){return Object.assign({},p,{condition:90,morale:70,form:70,fitness:90,injured:false,suspended:false,minutes:0});});
  s.lineup=s.lineup||{};return s;
 },
 selectXI:function(G,ids){
  var s=this.init(G);s.lineup={};ids.slice(0,11).forEach(function(id,i){s.lineup[i]=id;});
  if(G.addNews)G.addNews("Escalação definida","Onze inicial atualizado para o próximo compromisso.","FUTEBOL");
 },
 tick:function(G){
  var s=this.init(G);var load=(s.training&&s.training.intensity)||55;
  s.squad.forEach(function(p){p.condition=Math.max(35,Math.min(100,(p.condition||90)+(load>75?-2:load<40?2:0)));if(p.form>0&&Math.random()<.08)p.form=Math.max(1,p.form+(Math.random()<.5?-1:1));});
 },
 getXI:function(G){var s=this.init(G);return Object.keys(s.lineup).map(function(k){return s.squad.find(function(p){return p.id===s.lineup[k];});}).filter(Boolean)}
};