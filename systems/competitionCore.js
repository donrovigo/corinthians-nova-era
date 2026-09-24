window.CompetitionCore={
  init:function(G){
    var s=G.state;
    s.competitions=s.competitions||{};
    ["brasileirao","libertadores","paulista","copa_do_brasil"].forEach(function(id){
      s.competitions[id]=s.competitions[id]||{played:0,points:0,wins:0,draws:0,losses:0,gf:0,ga:0,position:0,form:[]};
    });
    s.officialFixtures=s.officialFixtures||[];
    s.competitionTables=s.competitionTables||{};
    return s;
  },

  onDay:function(G){
    var s=this.init(G);
    var d=G.formatDate?G.formatDate():new Date(s.date).toISOString().slice(0,10);
    var all=[];
    if(window.getBrasileiraoFixtures) all=all.concat(window.getBrasileiraoFixtures().map(function(m){return Object.assign({competition:"brasileirao"},m);}));
    if(window.getLibertadoresFixtures) all=all.concat(window.getLibertadoresFixtures().map(function(m){return Object.assign({competition:"libertadores"},m);}));
    all.filter(function(m){return m.date===d;}).forEach(function(m){
      var id="official-"+m.competition+"-"+m.date+"-"+m.opponent+"-"+(m.home?"H":"A");
      if(!s.matches) s.matches=[];
      if(!s.matches.some(function(x){return String(x.id)===id;})){
        var f={
          id:id,date:m.date,home:m.home?"Corinthians":m.opponent,
          away:m.home?m.opponent:"Corinthians",opponent:m.opponent,
          homeTeam:m.home,competition:m.competition,stage:m.stage||null,
          round:m.round||null,status:"scheduled",played:false,stadium:m.stadium,
          homeScore:null,awayScore:null
        };
        s.matches.push(f); s.officialFixtures.push(id);
        if(G.addNews) G.addNews("Calendário oficial", "Corinthians x "+m.opponent+" em "+m.date+" ("+f.competition+").", "CALENDÁRIO");
      }
    });
    this.rebuildTables(G);
  },

  registerResult:function(G,competition,gf,ga,fixtureId){
    var s=this.init(G), c=s.competitions[competition];
    if(!c || !fixtureId || s._registeredResults && s._registeredResults[fixtureId]) return;
    s._registeredResults=s._registeredResults||{};
    s._registeredResults[fixtureId]=true;
    c.played++; c.gf+=gf; c.ga+=ga;
    if(gf>ga){c.wins++;c.points+=3;c.form.unshift("V");}
    else if(gf===ga){c.draws++;c.points++;c.form.unshift("E");}
    else {c.losses++;c.form.unshift("D");}
    c.form=c.form.slice(0,5);
    this.rebuildTables(G);
  },

  rebuildTables:function(G){
    var s=this.init(G);
    var st={};
    Object.keys(s.competitions).forEach(function(id){st[id]=Object.assign({},s.competitions[id]);});
    s.competitionTables=st;
    return st;
  },

  getTable:function(G,id){
    this.rebuildTables(G);
    return G.state.competitionTables[id]||null;
  }
};