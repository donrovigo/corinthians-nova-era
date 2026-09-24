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

  getTeamRating:function(team){
    var ratings={"Flamengo":84,"Palmeiras":84,"Atlético-MG":81,"Internacional":79,"São Paulo":79,"Fluminense":78,"Botafogo":78,"Grêmio":77,"Corinthians":80,"Bahia":76,"Cruzeiro":75,"Bragantino":74,"Vasco":73,"Santos":72,"Vitória":71,"Ceará":70,"Sport":69,"Mirassol":68,"Chapecoense":66,"Remo":65};
    return ratings[team]||70;
  },

  generateRoundPairings:function(G,round){
    var teams=(window.getBrasileiraoTeams?getBrasileiraoTeams():[]).slice();
    if(teams.length!==20) return [];

    // Calendário circular de 20 clubes: 19 rodadas no turno + 19 no returno.
    var base=teams.slice();
    var rounds=[];
    for(var r=0;r<19;r++){
      var pairs=[];
      for(var i=0;i<10;i++){
        var a=base[i], b=base[19-i];
        var home=(r%2===0)?a:b;
        var away=(r%2===0)?b:a;
        pairs.push({home:home,away:away});
      }
      rounds.push(pairs);
      base=[base[0]].concat(base.slice(-1),base.slice(1,-1));
    }

    var pairings=rounds[(Number(round)||1)-1];
    if(!pairings) pairings=rounds[0];
    else if(Number(round)>19){
      pairings=pairings.map(function(p){return {home:p.away,away:p.home};});
    } else {
      pairings=pairings.map(function(p){return {home:p.home,away:p.away};});
    }

    // Quando o arquivo de competições traz um jogo oficial do Corinthians,
    // preservamos esse adversário e ajustamos apenas os dois confrontos afetados.
    var fixed=(window.getBrasileiraoFixtures?getBrasileiraoFixtures():[]).find(function(x){
      return Number(x.round)===Number(round);
    });
    if(fixed && fixed.opponent){
      var cor=pairings.findIndex(function(p){return p.home==="Corinthians"||p.away==="Corinthians";});
      var target=pairings.findIndex(function(p){return p.home===fixed.opponent||p.away===fixed.opponent;});
      if(cor>=0 && target>=0 && cor!==target){
        var currentOpponent=pairings[cor].home==="Corinthians"?pairings[cor].away:pairings[cor].home;
        var targetOpponent=pairings[target].home===fixed.opponent?pairings[target].away:pairings[target].home;
        pairings[cor]=fixed.home
          ? {home:"Corinthians",away:fixed.opponent}
          : {home:fixed.opponent,away:"Corinthians"};
        if(pairings[target].home===fixed.opponent) pairings[target]={home:fixed.opponent,away:currentOpponent};
        else pairings[target]={home:currentOpponent,away:fixed.opponent};
        // Evita que a mesma partida apareça duas vezes no mesmo round.
        if(targetOpponent==="Corinthians") pairings[target]={home:currentOpponent,away:fixed.opponent};
      }
    }
    return pairings;
  },

  simulateScore:function(home,away,round){
    var h=this.getTeamRating(home)+3, a=this.getTeamRating(away);
    var seed=(round*37 + home.length*11 + away.length*17) % 100;
    var diff=h-a;
    var hg=Math.max(0,Math.min(5,Math.floor((h/28)+(seed%3)-1)));
    var ag=Math.max(0,Math.min(4,Math.floor((a/31)+((seed+1)%3)-1)));
    if(diff>=7 && hg<=ag) hg=ag+1;
    if(diff<=-7 && ag<=hg) ag=hg+1;
    return [hg,ag];
  },

  simulateOtherLeagueMatches:function(G,round,date){
    var s=this.init(G);
    s.simulatedRounds=s.simulatedRounds||{};
    var key=String(round);
    if(s.simulatedRounds[key]) return;
    var pairs=this.generateRoundPairings(G,round);
    pairs.forEach(function(pair){
      if(pair.home==="Corinthians" || pair.away==="Corinthians") return;
      var scores=this.simulateScore(pair.home,pair.away,round);
      var fixtureId="sim-brasileirao-"+round+"-"+pair.home+"-"+pair.away;
      if(!s._simulatedFixtures) s._simulatedFixtures={};
      if(s._simulatedFixtures[fixtureId]) return;
      s._simulatedFixtures[fixtureId]=true;
      CompetitionCore.recordLeagueMatch(G,pair.home,pair.away,scores[0],scores[1]);
    });
    s.simulatedRounds[key]=date;
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
    var leagueDates=(window.getBrasileiraoFixtures?getBrasileiraoFixtures():[]).filter(function(m){return m.date===d;});
    leagueDates.forEach(function(m){
      if(m.round!==undefined) CompetitionCore.simulateOtherLeagueMatches(G,m.round,d);
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

  ensureBrasileiraoTable:function(G){
    var s=this.init(G);
    var teams=window.getBrasileiraoTeams?getBrasileiraoTeams():["Corinthians"];
    s.leagueTables=s.leagueTables||{};
    var table=s.leagueTables.brasileirao||{};
    teams.forEach(function(team){
      if(!table[team]) table[team]={team:team,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0};
    });
    s.leagueTables.brasileirao=table;
    return table;
  },

  recordLeagueMatch:function(G,home,away,hg,ag){
    var table=this.ensureBrasileiraoTable(G);
    function apply(team,gf,ga){
      var t=table[team]; if(!t)return;
      t.played++; t.gf+=gf; t.ga+=ga;
      if(gf>ga){t.wins++;t.points+=3;} else if(gf===ga){t.draws++;t.points++} else t.losses++;
    }
    apply(home,hg,ag); apply(away,ag,hg);
    return table;
  },

  getSortedBrasileirao:function(G){
    var table=this.ensureBrasileiraoTable(G);
    var sorted=Object.values(table).sort(function(a,b){
      return b.points-a.points || (b.gf-b.ga)-(a.gf-a.ga) || b.gf-a.gf || a.team.localeCompare(b.team);
    });
    sorted.forEach(function(t,i){ t.position=i+1; t.goalDifference=t.gf-t.ga; });
    var s=G.state;
    if(s.competitions && s.competitions.brasileirao){
      s.competitions.brasileirao.position=(table.Corinthians&&table.Corinthians.position)||0;
    }
    return sorted;
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