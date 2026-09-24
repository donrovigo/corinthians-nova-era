const DepartmentHub = {
  departments: [
    { id: "futebol", name: "Futebol", icon: "⚽", description: "Elenco, comissão, desempenho e planejamento esportivo." },
    { id: "financeiro", name: "Financeiro", icon: "💰", description: "Caixa, dívida, salários, orçamento e compromissos." },
    { id: "marketing", name: "Marketing", icon: "📣", description: "Patrocínios, marca, campanhas, torcida e receitas comerciais." },
    { id: "politico", name: "Político / Conselho", icon: "🏛️", description: "Conselheiros, grupos, alianças e ambiente institucional." },
    { id: "juridico", name: "Jurídico", icon: "⚖️", description: "Contratos, processos, bloqueios e riscos legais." },
    { id: "base", name: "Base", icon: "🌱", description: "Categorias de base, captação e desenvolvimento." },
    { id: "comunicacao", name: "Comunicação", icon: "📰", description: "Imprensa, posicionamento e gestão de crise." }
  ],
  meetings: [],
  reset() { this.meetings = []; },
  get(id) { return this.departments.find(d => d.id === id) || null; },
  align(id) {
    const d = this.get(id);
    if (!d || typeof Game === "undefined") return { success:false, message:"Departamento indisponível." };
    const effects = {
      futebol: [["coachConfidence",2],["dressingRoomMorale",1]],
      financeiro: [["reputation",1],["pressPressure",-1]],
      marketing: [["reputation",2],["fanApproval",1]],
      politico: [["councilTrust",2],["councilMood",2]],
      juridico: [["reputation",1],["leakRisk",-1]],
      base: [["reputation",1],["dressingRoomMorale",1]],
      comunicacao: [["pressPressure",-2],["reputation",1]]
    };
    (effects[id] || []).forEach(([k,v]) => Game.change(k,v));
    const meeting = {
      id: "DEP-" + Date.now(),
      department: id,
      title: "Alinhamento com " + d.name,
      date: new Date(Game.state.date).toISOString(),
      status: "concluída"
    };
    this.meetings.unshift(meeting);
    this.meetings = this.meetings.slice(0,30);
    Game.log("🤝 Alinhamento realizado com o departamento " + d.name + ".");
    return { success:true, meeting };
  },
  createFollowUp(id, topic) {
    const d=this.get(id);
    if (!d || typeof Tasks==="undefined" || !Tasks.create || typeof Game==="undefined") return null;
    const deadline=new Date(Game.state.date);
    deadline.setDate(deadline.getDate()+5);
    return Tasks.create({
      title:"Retorno: " + d.name + (topic ? " — " + topic : ""),
      description:"Reunião de acompanhamento para manter a diretoria alinhada com o departamento.",
      type:"gestao",
      deadline:deadline.toISOString(),
      priority:6,
      career:Game.state.career,
      requiresDecision:true,
      data:{department:id,topic:topic||"alinhamento"}
    });
  },
  getMeetings() { return this.meetings.slice(); }
};
window.DepartmentHub=DepartmentHub;