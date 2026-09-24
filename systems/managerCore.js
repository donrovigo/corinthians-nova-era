window.ManagerCore = {
  init(Game) {
    const s=Game.state;
    s.training=s.training||{focus:"equilibrado",intensity:55};
    s.dynamics=s.dynamics||{dressingRoom:60,leadership:50,playerSupport:60,staffSupport:60};
    s.board=s.board||{confidence:55,patience:50};
    s.injuries=s.injuries||[];
    s.suspensions=s.suspensions||[];
    s.managerHistory=s.managerHistory||[];
    return s;
  },
  train(Game,focus,intensity){
    const s=this.init(Game);
    const valid=["equilibrado","ataque","defesa","transição","bolas-paradas","recuperação"];
    s.training.focus=valid.includes(focus)?focus:"equilibrado";
    s.training.intensity=Math.max(20,Math.min(90,Number(intensity)||55));
    if(Game.addNews) Game.addNews("Treino atualizado","Foco "+s.training.focus+" · intensidade "+s.training.intensity+"/100","FUTEBOL");
    if(Game.autoSave) Game.autoSave();
  },
  tick(Game){
    const s=this.init(Game);
    const load=s.training.intensity||55;
    if(load>80) s.dynamics.dressingRoom=Math.max(0,s.dynamics.dressingRoom-1);
    if(load<35) s.dynamics.dressingRoom=Math.min(100,s.dynamics.dressingRoom+1);
    if(s.board.confidence<30 && Game.addNews) Game.addNews("Conselho preocupado","A confiança da diretoria caiu para "+s.board.confidence+".","DIRETORIA");
  },
  snapshot(Game){
    const s=this.init(Game);
    return {date:s.date,training:s.training,dynamics:s.dynamics,board:s.board,manager:s.manager||{},matches:(s.matches||[]).length};
  }
};