window.CompetitionCore={
  init:function(G){
    var s=G.state;
    s.competitions=s.competitions||{};
    s.competitions.brasileirao=s.competitions.brasileirao||{played:0,points:0,wins:0,draws:0,losses:0,gf:0,ga:0};
    s.competitions.libertadores=s.competitions.libertadores||{played:0,points:0,wins:0,draws:0,losses:0,gf:0,ga:0};
    s.competitions.paulista=s.competitions.paulista||{played:0,points:0,wins:0,draws:0,losses:0,gf:0,ga:0};
    s.officialFixtures=s.officialFixtures||[];
    return s;
  },
  onDay:function(G){
    var s=this.init(G), d=G.formatDate?G.formatDate():new Date(s.date).toISOString().slice(0,10);
    var all=[];
    if(window.getBrasileiraoFixtures)all=all.concat(window.getBrasileiraoFixtures());
    if(window.getLibertadoresFixtures)all=all.concat(window.getLibertadoresFixtures());
    var found=all.filter(function(m){return m.date===d;});
    found.forEach(function(m){
      var id="official-"+m.date+"-"+m.opponent+"-"+(m.home?"H":"A");
      if(!s.matches)s.matches=[];
      if(!s.matches.some(function(x){return String(x.id)===id;})){
        var f={id:id,date:m.date,home:m.home?"Corinthians":m.opponent,away:m.home?m.opponent:"Corinthians",opponent:m.opponent,homeTeam:m.home,competition:m.stage?"Libertadores":"Brasileirão",status:"scheduled",played:false,stadium:m.stadium};
        s.matches.push(f);
        s.officialFixtures.push(id);
        if(G.addNews)G.addNews("Calendário oficial","Corinthians x "+m.opponent+" em "+m.date+" ("+f.competition+").","CALENDÁRIO");
      }
    });
  },
  registerResult:function(G,competition,gf,ga){
    var s=this.init(G),c=s.competitions[competition];
    if(!c)return;
    c.played++;c.gf+=gf;c.ga+=ga;
    if(gf>ga){c.wins++;c.points+=3;}else if(gf===ga){c.draws++;c.points++;}else c.losses++;
  }
};