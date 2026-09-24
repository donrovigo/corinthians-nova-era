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
  scenarioIndex: {},
  reset() { this.meetings = []; this.scenarioIndex = {}; },
  get(id) { return this.departments.find(d => d.id === id) || null; },
  getScenario(id) {
    const s = typeof Game !== "undefined" ? Game.state : null;
    const scenarios = {
      financeiro: [
        { title:"O caixa apertou", description:"O diretor financeiro fecha a porta e coloca três documentos na mesa: salários, um compromisso urgente e uma proposta de antecipação de receita. Ele espera sua prioridade.", choices:[
          {text:"Preservar salários primeiro", effects:{reputation:2,pressPressure:-1,dressingRoomMorale:2}, result:"O vestiário ganha previsibilidade, mas outras áreas terão de esperar."},
          {text:"Negociar o compromisso urgente", effects:{reputation:-1,pressPressure:1,leakRisk:-1}, result:"Você compra tempo e exige garantias antes de comprometer o caixa."},
          {text:"Antecipar receita para ganhar fôlego", effects:{reputation:1,pressPressure:2}, result:"O caixa respira agora, mas o departamento alerta que receita futura ficará comprometida."}
        ]},
        { title:"O financeiro pede uma decisão", description:"A projeção do mês piorou. O diretor pergunta se deve cortar despesas, buscar receita comercial ou preservar o orçamento do futebol.", choices:[
          {text:"Cortar despesas administrativas", effects:{reputation:1,councilTrust:1}, result:"A diretoria administrativa recebe a ordem de revisar contratos e despesas."},
          {text:"Abrir uma força-tarefa comercial", effects:{reputation:2,pressPressure:1}, result:"Marketing e financeiro passam a trabalhar juntos para buscar receita."},
          {text:"Proteger o orçamento esportivo", effects:{fanApproval:3,pressPressure:2,reputation:-1}, result:"A torcida percebe prioridade no futebol, enquanto o financeiro avisa que a conta continuará chegando."}
        ]}
      ],
      marketing: [
        { title:"Uma marca quer entrar no Corinthians", description:"O diretor de marketing traz uma proposta comercial. O dinheiro é interessante, mas há exigências de exposição que podem incomodar outras áreas.", choices:[
          {text:"Negociar valor e preservar a identidade do clube", effects:{reputation:2,fanApproval:2}, result:"Marketing volta à mesa buscando uma proposta mais equilibrada."},
          {text:"Aceitar a proposta como está", effects:{reputation:1,pressPressure:2}, result:"A receita entra no radar, mas comunicação e torcida terão de ser administradas."},
          {text:"Recusar e buscar parceiro estratégico", effects:{reputation:2,pressPressure:-1}, result:"Você abre mão de velocidade em troca de mais controle sobre a marca."}
        ]},
        { title:"Marketing e futebol discordam", description:"O comercial quer ativar uma campanha em dia de jogo; o futebol teme desgaste com atletas e comissão. Você precisa desempatar a sala.", choices:[
          {text:"Priorizar o calendário esportivo", effects:{coachConfidence:2,fanApproval:1}, result:"O futebol mantém prioridade e marketing terá de adaptar a ativação."},
          {text:"Exigir que os dois departamentos construam uma solução", effects:{reputation:2}, result:"Você não escolhe um lado e cobra um plano conjunto."},
          {text:"Priorizar a oportunidade comercial", effects:{reputation:1,pressPressure:2}, result:"A campanha avança, mas o futebol registra a interferência."}
        ]}
      ],
      futebol: [
        { title:"O treinador discorda do mercado", description:"O diretor de futebol quer contratar um jogador pronto. O treinador prefere usar a base. Os dois esperam que você defina o processo.", choices:[
          {text:"Seguir o treinador e desenvolver a base", effects:{coachConfidence:4,dressingRoomMorale:2,fanApproval:2}, result:"A comissão ganha respaldo, mas a contratação fica para depois."},
          {text:"Seguir o diretor e buscar o reforço", effects:{coachConfidence:-2,fanApproval:3}, result:"O mercado ganha prioridade e o treinador pede garantias sobre o perfil do jogador."},
          {text:"Mandar os dois apresentarem um plano conjunto", effects:{coachConfidence:2,reputation:2}, result:"Você transforma o conflito em uma obrigação de planejamento conjunto."}
        ]},
        { title:"O vestiário quer falar", description:"Um jogador experiente procura você. Ele não pede cargo nem dinheiro: quer saber se a diretoria tem um plano claro para o elenco.", choices:[
          {text:"Ouvir antes de responder", effects:{dressingRoomMorale:3,coachConfidence:1}, result:"Você descobre que parte da inquietação vem de falta de comunicação."},
          {text:"Reforçar publicamente a autoridade do treinador", effects:{coachConfidence:4,dressingRoomMorale:-1}, result:"A comissão ganha respaldo, mas alguns jogadores sentem que foram afastados da conversa."},
          {text:"Pedir ao diretor um plano de comunicação do elenco", effects:{dressingRoomMorale:2,reputation:1}, result:"A direção passa a tratar o vestiário como parte do planejamento."}
        ]}
      ],
      juridico: [
        { title:"O jurídico acende um alerta", description:"O jurídico encontrou uma cláusula contratual que pode gerar custo relevante se a diretoria agir sem revisar o documento.", choices:[
          {text:"Paralisar a decisão até revisão completa", effects:{reputation:1,leakRisk:-1}, result:"Você reduz o risco imediato, mas perde velocidade."},
          {text:"Negociar uma solução com a outra parte", effects:{reputation:1,councilTrust:1}, result:"O jurídico ganha autorização para tentar um acordo."},
          {text:"Assumir o risco e seguir", effects:{pressPressure:3,reputation:-2}, result:"A decisão avança, mas o jurídico registra formalmente o risco."}
        ]},
        { title:"Contrato importante chegou", description:"O documento está pronto para assinatura, mas jurídico e financeiro discordam sobre uma obrigação futura.", choices:[
          {text:"Pedir revisão conjunta", effects:{reputation:2,pressPressure:-1}, result:"A assinatura é adiada para alinhar as áreas."},
          {text:"Priorizar segurança jurídica", effects:{reputation:3}, result:"Você aceita perder velocidade para reduzir exposição."},
          {text:"Priorizar a oportunidade", effects:{fanApproval:1,pressPressure:2,reputation:-1}, result:"A oportunidade avança com risco formal registrado."}
        ]}
      ],
      politico: [
        { title:"Uma aproximação inesperada", description:"Um conselheiro avisa, em tom baixo, que dois grupos que raramente conversavam começaram a se aproximar. É informação de bastidor, não um fato confirmado.", choices:[
          {text:"Perguntar diretamente aos envolvidos", effects:{councilTrust:2,leakRisk:3}, result:"Você abre a conversa e assume o risco de expor que recebeu a informação."},
          {text:"Observar antes de agir", effects:{leakRisk:-1}, result:"Você não transforma rumor em crise e passa a acompanhar os movimentos."},
          {text:"Convocar uma conversa institucional", effects:{councilMood:3,pressPressure:1}, result:"Você cria um canal formal sem acusar ninguém de qualquer articulação."}
        ]}
      ],
      base: [
        { title:"A base pede espaço", description:"O diretor da base apresenta um jovem que está evoluindo rápido. Futebol quer cautela; o empresário já começa a perguntar sobre contrato.", choices:[
          {text:"Subir o atleta gradualmente", effects:{dressingRoomMorale:1,fanApproval:2,reputation:1}, result:"O jovem passa a ser acompanhado mais de perto pelo profissional."},
          {text:"Renovar antes de promover", effects:{reputation:2}, result:"O clube tenta proteger o ativo antes de aumentar sua exposição."},
          {text:"Manter o plano original de formação", effects:{coachConfidence:1}, result:"A comissão evita acelerar o desenvolvimento."}
        ]}
      ],
      comunicacao: [
        { title:"A imprensa quer uma resposta", description:"Um jornalista recebeu uma informação parcial sobre uma decisão interna e pede uma posição oficial.", choices:[
          {text:"Responder com fatos confirmados", effects:{reputation:2,pressPressure:-2}, result:"A comunicação evita especulação e reduz o espaço para versões contraditórias."},
          {text:"Dizer que o clube ainda avalia", effects:{pressPressure:1}, result:"Você ganha tempo sem confirmar uma informação incompleta."},
          {text:"Responder de forma agressiva", effects:{pressPressure:5,reputation:-2}, result:"A resposta vira assunto por si própria."}
        ]}
      ]
    };
    const list=scenarios[id]||[];
    if(!list.length) return null;
    const key=id+"_"+((this.scenarioIndex[id]||0)%list.length);
    this.scenarioIndex[id]=(this.scenarioIndex[id]||0)+1;
    return list[(this.scenarioIndex[id]-1)%list.length];
  },
  openConversation(id) {
    const d=this.get(id), scenario=this.getScenario(id);
    if(!d||!scenario) return {success:false,message:"Nenhuma pauta disponível."};
    return {success:true,department:d,scenario};
  },
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