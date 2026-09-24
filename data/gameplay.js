const Gameplay = {

  ensureTask(data) {
    if (typeof Tasks === "undefined" || !Tasks.create) return null;
    return Tasks.create(data);
  },

  politicalMeeting(group = "Conselheiros") {
    if (!Game?.state) return { success: false, message: "Jogo não iniciado." };

    const trustCost = group === "Oposição" ? 3 : 1;
    Game.change("councilTrust", 3);
    Game.change("politicalSupport", 2);
    Game.change("pressPressure", 1);

    const deadline = new Date(Game.state.date);
    deadline.setDate(deadline.getDate() + 3);

    this.ensureTask({
      title: "Retornar à reunião com " + group,
      description: "Definir encaminhamentos políticos e registrar os compromissos assumidos.",
      type: "politica",
      deadline: deadline.toISOString(),
      priority: 6,
      career: Game.state.career,
      requiresDecision: true,
      data: { group }
    });

    Game.log("🤝 Reunião política realizada com " + group + ".");
    return { success: true };
  },

  pressStrategy(strategy = "transparencia") {
    if (!Game?.state) return { success: false };

    if (strategy === "transparencia") {
      Game.change("pressPressure", -4);
      Game.change("reputation", 2);
      Game.log("📰 Você adotou uma postura pública mais transparente.");
    } else if (strategy === "ofensiva") {
      Game.change("fanMood", 3);
      Game.change("pressPressure", 6);
      Game.change("reputation", -1);
      Game.log("📰 Você adotou uma estratégia de comunicação mais ofensiva.");
    } else {
      Game.change("pressPressure", -1);
      Game.log("📰 Você reduziu a exposição pública e manteve comunicação institucional.");
    }

    return { success: true };
  },

  scoutingMission() {
    if (!Game?.state) return { success: false };

    const deadline = new Date(Game.state.date);
    deadline.setDate(deadline.getDate() + 7);

    const task = this.ensureTask({
      title: "Concluir relatório de scouting",
      description: "Avaliar opções de mercado, custo, salário, idade, potencial e encaixe no elenco.",
      type: "mercado",
      deadline: deadline.toISOString(),
      priority: 7,
      career: Game.state.career,
      requiresDecision: true,
      data: { mission: "scouting" }
    });

    Game.change("coachConfidence", 1);
    Game.log("🔎 Missão de scouting aberta. O departamento tem 7 dias para apresentar o relatório.");
    return { success: true, task };
  },

  sponsorNegotiation() {
    if (!Game?.state) return { success: false };

    const deadline = new Date(Game.state.date);
    deadline.setDate(deadline.getDate() + 10);

    const value = 15000000 + Math.floor(Math.random() * 15000001);

    const task = this.ensureTask({
      title: "Negociar novo patrocinador",
      description: "Avaliar proposta comercial estimada entre R$ 15 milhões e R$ 30 milhões.",
      type: "financeiro",
      deadline: deadline.toISOString(),
      priority: 8,
      career: Game.state.career,
      requiresDecision: true,
      data: { estimatedValue: value }
    });

    Game.log("💼 Nova oportunidade comercial entrou na agenda.");
    return { success: true, task, estimatedValue: value };
  },

  financialReview() {
    if (!Game?.state || typeof FINANCE === "undefined") return { success: false };

    const health = FINANCE.getFinancialHealth ? FINANCE.getFinancialHealth() : null;
    const pending = FINANCE.state.salaryPending || 0;

    if (pending > 0) {
      Game.change("pressPressure", 4);
      Game.log("💰 A revisão financeira identificou obrigações salariais pendentes.");
    } else {
      Game.change("reputation", 1);
      Game.log("💰 Revisão financeira concluída sem nova pendência salarial.");
    }

    return { success: true, health };
  },

  settleTransferBan() {
    if (typeof FINANCE === "undefined") return { success: false, message: "Financeiro indisponível." };

    const active = FINANCE.getActiveTransferBans ? FINANCE.getActiveTransferBans() : [];
    if (!active.length) {
      Game.log("✅ Não há transfer ban ativo para quitar.");
      return { success: false, message: "Nenhum bloqueio ativo." };
    }

    const ban = active[0];
    const amount = Number(ban.amount || 0);

    const result = FINANCE.payTransferBan ? FINANCE.payTransferBan(ban.id || ban.creditor, amount) : null;

    if (result?.success) {
      Game.change("reputation", 3);
      Game.change("pressPressure", -2);
      Game.log("🔓 Um transfer ban foi resolvido.");
    }

    return result || { success: false, message: "Não foi possível processar o pagamento." };
  },

  matchPreparation() {
    if (!Game?.state) return { success: false };

    Game.change("coachConfidence", 3);
    Game.change("dressingRoomMorale", 2);
    Game.log("⚽ Preparação especial de jogo realizada pelo departamento de futebol.");

    const deadline = new Date(Game.state.date);
    deadline.setDate(deadline.getDate() + 2);

    this.ensureTask({
      title: "Revisar plano para o próximo jogo",
      description: "Checar escalação, preparação física, estratégia e ambiente do vestiário.",
      type: "futebol",
      deadline: deadline.toISOString(),
      priority: 6,
      career: Game.state.career,
      requiresDecision: true,
      data: { mission: "match-prep" }
    });

    return { success: true };
  },

  academyMeeting() {
    if (!Game?.state) return { success: false };

    Game.change("reputation", 2);
    Game.change("dressingRoomMorale", 1);

    const deadline = new Date(Game.state.date);
    deadline.setDate(deadline.getDate() + 14);

    this.ensureTask({
      title: "Avaliar relatório da base",
      description: "Revisar jovens, potencial, contratos e próximos passos de desenvolvimento.",
      type: "base",
      deadline: deadline.toISOString(),
      priority: 5,
      career: Game.state.career,
      requiresDecision: true,
      data: { mission: "academy-review" }
    });

    Game.log("🌱 Departamento de base convocado para apresentar relatório.");
    return { success: true };
  },

  resolveTask(taskId) {
    if (typeof Tasks === "undefined" || !Tasks.get) return { success: false };

    const task = Tasks.get(taskId);
    if (!task) return { success: false, message: "Compromisso não encontrado." };

    if (task.type === "politica") {
      Game.change("councilTrust", 2);
      Game.change("politicalSupport", 1);
    } else if (task.type === "financeiro") {
      Game.change("reputation", 1);
      Game.change("pressPressure", -1);
    } else if (task.type === "mercado") {
      Game.change("coachConfidence", 1);
    } else if (task.type === "contrato") {
      Game.change("dressingRoomMorale", 2);
    } else if (task.type === "futebol") {
      Game.change("fanMood", 1);
      Game.change("coachConfidence", 2);
    } else if (task.type === "base") {
      Game.change("reputation", 1);
    }

    const result = Tasks.complete(taskId, "Decisão executada pelo gestor.");
    Game.log("✅ Decisão concluída: " + task.title + ".");
    return result;
  },

  advanceWeek() {
    if (!Game?.advanceDays) return;
    Game.advanceDays(7);
    return { success: true };
  },

  getActions() {
    return [
      { id: "politica", title: "Reunião política", description: "Conselheiros e grupos", action: () => this.politicalMeeting() },
      { id: "imprensa", title: "Estratégia de imprensa", description: "Controlar exposição", action: () => this.pressStrategy("transparencia") },
      { id: "scouting", title: "Abrir scouting", description: "Buscar opções para o futebol", action: () => this.scoutingMission() },
      { id: "patrocinio", title: "Buscar patrocinador", description: "Criar nova oportunidade comercial", action: () => this.sponsorNegotiation() },
      { id: "financas", title: "Revisar finanças", description: "Checar caixa e obrigações", action: () => this.financialReview() },
      { id: "transferban", title: "Resolver transfer ban", description: "Tentar liberar registros", action: () => this.settleTransferBan() },
      { id: "jogo", title: "Preparar próximo jogo", description: "Foco no futebol", action: () => this.matchPreparation() },
      { id: "base", title: "Reunião da base", description: "Desenvolvimento de jovens", action: () => this.academyMeeting() }
    ];
  }
};

window.Gameplay = Gameplay;
