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

    if (typeof Tasks !== "undefined" && Tasks.reset) {
      Tasks.reset();
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
