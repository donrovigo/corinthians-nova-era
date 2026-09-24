const Game = {

  state: {

    career: null,

    date: new Date("2026-01-01T00:00:00"),

    money: 0,

    politicalSupport: 0,

    councilTrust: 20,

    fanMood: 50,

    pressPressure: 10,

    dressingRoomMorale: 60,

    coachConfidence: 50,

    leakRisk: 5,

    reputation: 50,

    election: {
      candidate: false,
      vice: null,
      coalition: null,
      won: false
    },

    club: {
      debt: 0,
      cash: 0,
      transferBan: true
    },

    history: []
  },

  initialized: false,

  start(career) {

    this.state.career = career;

    this.state.date =
      new Date("2026-01-01T00:00:00");

    this.state.history = [];

    this.state.election = {
      candidate: false,
      vice: null,
      coalition: null,
      won: false
    };

    this.state.politicalSupport = 0;
    this.state.councilTrust = 20;
    this.state.fanMood = 50;
    this.state.fanApproval = 50;
    this.state.councilMood = 50;
    this.state.pressPressure = 10;
    this.state.dressingRoomMorale = 60;
    this.state.coachConfidence = 50;
    this.state.leakRisk = 5;
    this.state.reputation = 50;

    this.state.club = {
      debt: 0,
      cash: 0,
      transferBan: true
    };

    this.state.narrativeHistory = [];
    this.state.news = [];
    this.state.mail = [];
    this.state.decisions = [];
    this.state.infoProcessed = {};

    if (typeof Tasks !== "undefined" && Tasks.reset) {
      Tasks.reset();
    }

    if (typeof DepartmentHub !== "undefined" && DepartmentHub.reset) {
      DepartmentHub.reset();
    }

    /*
     * Inicializa o motor financeiro
     */

    if (
      typeof FINANCE !== "undefined" &&
      FINANCE.initialize
    ) {

      FINANCE.initialize();

    }

    /*
     * Inicializa o motor central
     */

    if (
      typeof GameEngine !== "undefined" &&
      GameEngine.initialize
    ) {

      GameEngine.initialized = false;

      GameEngine.initialize();

    }

    /*
     * Configura carreira
     */

    if (career === "presidente") {

      this.state.election.candidate = true;

      this.state.politicalSupport = 10;

      this.state.councilTrust = 20;

      this.state.reputation = 50;

      this.log(
        "Você iniciou sua trajetória como candidato à presidência."
      );

      this.log(
        "A temporada começa em 1º de janeiro de 2026."
      );

      this.log(
        "A eleição está prevista para 28 de novembro de 2026."
      );

    }

    else {

      this.log(
        `Carreira iniciada: ${career}.`
      );

    }

    this.render();

    if (
      typeof updateDashboard === "function"
    ) {
      updateDashboard();
    }

    if (
      typeof renderGameLog === "function"
    ) {
      renderGameLog();
    }
  },

  advanceDays(days = 1) {

    days = Number(days);

    if (!Number.isFinite(days)) {
      days = 1;
    }

    days = Math.max(
      1,
      Math.floor(days)
    );

    /*
     * Usa o novo motor central.
     */

    if (
      typeof GameEngine !== "undefined" &&
      GameEngine.advanceDays
    ) {

      GameEngine.advanceDays(days);

      return;
    }

    /*
     * Fallback de segurança.
     */

    for (
      let i = 0;
      i < days;
      i++
    ) {

      this.state.date.setDate(
        this.state.date.getDate() + 1
      );

    }

    this.render();
  },

  advanceDay() {

    this.advanceDays(1);

  },

  change(variable, amount) {

    if (
      typeof this.state[variable] === "number"
    ) {

      this.state[variable] += Number(amount);

    }

    /*
     * Variáveis de relacionamento e pressão
     * ficam entre 0 e 100.
     */

    const boundedVariables = [

      "politicalSupport",
      "councilTrust",
      "fanMood",
      "pressPressure",
      "dressingRoomMorale",
      "coachConfidence",
      "leakRisk",
      "reputation"

    ];

    if (
      boundedVariables.includes(variable)
    ) {

      this.state[variable] =
        Math.max(
          0,
          Math.min(
            100,
            this.state[variable]
          )
        );

    }

  },

  log(message) {

    if (!this.state.history) {
      this.state.history = [];
    }

    this.state.history.unshift({

      date:
        this.formatDate(),

      message

    });

    /*
     * Limita o histórico para evitar crescimento
     * infinito durante partidas longas.
     */

    if (
      this.state.history.length > 300
    ) {

      this.state.history =
        this.state.history.slice(
          0,
          300
        );

    }

    if (
      typeof renderGameLog === "function"
    ) {

      renderGameLog();

    }

  },

  formatDate() {

    return this.state.date.toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );

  },

  render() {

    /*
     * Atualiza data
     */

    const dateElements = [
      document.getElementById("game-date"),
      document.getElementById("current-date"),
      document.getElementById("dashboard-date")
    ];

    dateElements.forEach(element => {

      if (element) {
        element.textContent =
          this.formatDate();
      }

    });

    /*
     * Atualiza indicadores
     */

    const variables = {

      "political-support":
        this.state.politicalSupport,

      "council-trust":
        this.state.councilTrust,

      "fan-mood":
        this.state.fanMood,

      "press-pressure":
        this.state.pressPressure,

      "dressing-room":
        this.state.dressingRoomMorale,

      "coach-confidence":
        this.state.coachConfidence,

      "leak-risk":
        this.state.leakRisk,

      "reputation":
        this.state.reputation

    };

    Object.entries(variables).forEach(
      ([id, value]) => {

        const element =
          document.getElementById(id);

        if (element) {

          element.textContent =
            Math.round(value);

        }

      }
    );

    /*
     * Sincroniza finanças
     */

    if (
      typeof FINANCE !== "undefined" &&
      FINANCE.syncGameState
    ) {

      FINANCE.syncGameState();

    }

    if (
      typeof updateDashboard === "function"
    ) {

      updateDashboard();

    }

  },

  renderLog() {

    if (
      typeof renderGameLog === "function"
    ) {

      renderGameLog();

    }

  },

  ensureInformationCenter() {
    const s = this.state;
    if (!Array.isArray(s.news)) s.news = [];
    if (!Array.isArray(s.mail)) s.mail = [];
    if (!Array.isArray(s.decisions)) s.decisions = [];
  },

  addNews(title, message, category = "CLUBE") {
    this.ensureInformationCenter();
    this.state.news.unshift({
      id: "news-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      date: this.formatDate(),
      title, message, category, read: false
    });
    this.state.news = this.state.news.slice(0, 30);
  },

  addMail(from, subject, message, department = "DIRETORIA", action = null) {
    this.ensureInformationCenter();
    this.state.mail.unshift({
      id: "mail-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      date: this.formatDate(),
      from, subject, message, department, action, read: false
    });
    this.state.mail = this.state.mail.slice(0, 30);
  },

  addDecision(title, description, options) {
    this.ensureInformationCenter();
    this.state.decisions = this.state.decisions.filter(item => item.id !== title);
    this.state.decisions.unshift({
      id: title,
      date: this.formatDate(),
      title, description, options: Array.isArray(options) ? options : [],
      resolved: false
    });
  },

  processInformationCenter() {
    this.ensureInformationCenter();
    const date = this.state.date;
    const key = date.toISOString().slice(0, 10);
    this.state.infoProcessed = this.state.infoProcessed || {};

    const once = (id, fn) => {
      if (this.state.infoProcessed[id]) return;
      this.state.infoProcessed[id] = true;
      fn();
    };

    const day = date.getDate();
    const month = date.getMonth() + 1;

    if (day === 1) {
      once("month-" + key, () => {
        this.addNews("Novo mês no clube", "A diretoria recebeu o fechamento do período e os principais compromissos do mês.", "CALENDÁRIO");
        this.addMail("Diretoria Financeira", "Fechamento mensal", "O relatório financeiro do mês está disponível para revisão.", "FINANÇAS");
      });
    }

    if (day === 5 || day === 20) {
      once("salary-" + key, () => {
        this.addMail("Financeiro", "Folha de pagamento", "A folha entra no ciclo de pagamentos. Verifique caixa e obrigações antes de assumir novos compromissos.", "FINANÇAS");
      });
    }

    if (month === 2 && day === 1) {
      once("season-" + key, () => {
        this.addNews("Temporada ganha ritmo", "O calendário esportivo começa a pressionar planejamento, elenco e comissão técnica.", "FUTEBOL");
        this.addMail("Departamento de Futebol", "Planejamento esportivo", "Precisamos alinhar preparação, elenco e próximos jogos.", "FUTEBOL");
      });
    }

    if (month === 6 && day === 1) {
      once("midyear-" + key, () => {
        this.addNews("Janela e orçamento entram no radar", "Mercado e planejamento financeiro passam a disputar espaço nas próximas decisões.", "MERCADO");
        this.addMail("Mercado", "Relatório de oportunidades", "Scouting atualizou nomes e custos. A decisão agora depende do orçamento disponível.", "MERCADO");
      });
    }

    if (month === 11 && day === 20 && this.state.career === "presidente" && !this.state.election.won) {
      once("election-week-" + key, () => {
        this.addNews("Semana decisiva", "A eleição presidencial se aproxima. Conselho, imprensa e torcida acompanham cada movimento.", "POLÍTICA");
        this.addMail("Secretaria do Conselho", "Eleição presidencial", "A reunião eleitoral está próxima. Sua articulação política entra na reta final.", "POLÍTICA");
      });
    }

    if (typeof FINANCE !== "undefined" && FINANCE.getFinancialHealth) {
      const health = FINANCE.getFinancialHealth();
      if (health === "critica" || health === "muito_fragil") {
        once("finance-alert-" + key, () => {
          this.addNews("🚨 Alerta financeiro", "O caixa e as obrigações exigem atenção imediata.", "FINANÇAS");
          this.addMail("Diretoria Financeira", "AÇÃO NECESSÁRIA: caixa sob pressão", "Recomendamos revisar despesas, receitas e compromissos antes de avançar.", "FINANÇAS", "finance-review");
          this.addDecision("finance-" + key, "Como você quer reagir à pressão financeira?", [
            { id: "review", text: "Revisar imediatamente", effects: { pressPressure: -2, reputation: 1 } },
            { id: "communicate", text: "Comunicar transparência", effects: { reputation: 2, pressPressure: 2 } },
            { id: "ignore", text: "Adiar a decisão", effects: { pressPressure: 5, reputation: -2 } }
          ]);
        });
      }
    }

    const pending = typeof Tasks !== "undefined" && Tasks.getPending ? Tasks.getPending() : [];
    const urgent = pending.find(task => task.daysRemaining !== null && task.daysRemaining <= 1);
    if (urgent) {
      once("task-alert-" + urgent.id + "-" + key, () => {
        this.addMail("Central de Compromissos", "Prazo crítico: " + urgent.title, "Este compromisso vence hoje ou amanhã. Uma decisão pode evitar perda de confiança.", "AGENDA");
      });
    }

    if (typeof updateDashboard === "function") updateDashboard();
  },

  getStatus() {

    if (
      typeof GameEngine !== "undefined" &&
      GameEngine.getStatus
    ) {

      return GameEngine.getStatus();

    }

    return {

      career:
        this.state.career,

      date:
        this.state.date,

      history:
        this.state.history

    };

  }

};

window.Game = Game;
