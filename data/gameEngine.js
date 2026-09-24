const GameEngine = {

  initialized: false,

  initialize() {

    if (this.initialized) {
      return;
    }

    this.initialized = true;

    if (typeof FINANCE !== "undefined") {
      FINANCE.initialize();
    }

    if (
      typeof Game !== "undefined" &&
      Game.state
    ) {

      if (!Game.state.history) {
        Game.state.history = [];
      }

      Game.state.club = Game.state.club || {};

      if (
        typeof FINANCE !== "undefined" &&
        FINANCE.syncGameState
      ) {
        FINANCE.syncGameState();
      }
    }

    this.log(
      "Motor de simulação inicializado."
    );
  },

  log(message) {

    if (
      typeof Game !== "undefined" &&
      Game.log
    ) {
      Game.log(message);
    }
  },

  advanceDay() {

    if (!Game.state) {
      return;
    }

    /*
     * 1. AVANÇA O CALENDÁRIO
     */

    Game.state.date.setDate(
      Game.state.date.getDate() + 1
    );

    /*
     * 2. EMPRÉSTIMOS
     */

    if (
      typeof Loans !== "undefined" &&
      Loans.advanceDay
    ) {
      Loans.advanceDay();
    }

    /*
     * 3. PROPOSTAS POR JOGADORES
     */

    if (
      typeof PlayerOffers !== "undefined" &&
      PlayerOffers.advanceDay
    ) {
      PlayerOffers.advanceDay();
    }

    /*
     * 4. NEGOCIAÇÕES
     */

    if (
      typeof Negotiations !== "undefined"
    ) {

      if (Negotiations.checkDeadlines) {
        Negotiations.checkDeadlines();
      }

      if (Negotiations.checkLeak) {
        Negotiations.checkLeak();
      }
    }

    /*
     * 5. DELEGAÇÕES
     */

    if (
      typeof Delegation !== "undefined" &&
      Delegation.advanceDay
    ) {
      Delegation.advanceDay();
    }

    /*
     * 6. FINANÇAS
     */

    this.checkFinancialCycle();

    /*
     * 7. EVENTOS
     */

    this.checkRandomEvent();

    /*
     * 8. CALENDÁRIO ESPORTIVO
     */

    this.checkCompetitionEvents();

    /*
     * 9. EQUIPE E CONTRATOS
     */

    this.checkContracts();

    /*
     * 10. ELEIÇÃO
     */

    this.checkElection();

    /*
     * 11. SINCRONIZA ESTADO
     */

    if (
      typeof FINANCE !== "undefined" &&
      FINANCE.syncGameState
    ) {
      FINANCE.syncGameState();
    }

    /*
     * 12. ATUALIZA INTERFACE
     */

    if (
      typeof Game.render === "function"
    ) {
      Game.render();
    }

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

    days = Math.max(
      1,
      Number(days)
    );

    for (
      let i = 0;
      i < days;
      i++
    ) {
      this.advanceDay();
    }
  },

  checkFinancialCycle() {

    if (!Game.state) {
      return;
    }

    const day =
      Game.state.date.getDate();

    /*
     * Fechamento mensal
     */

    if (day === 1) {

      if (
        typeof FINANCE !== "undefined" &&
        FINANCE.closeMonth
      ) {

        FINANCE.closeMonth();

        this.log(
          "Fechamento financeiro mensal realizado."
        );
      }
    }

    /*
     * Pagamento de salários
     */

    if (
      day === 5 ||
      day === 20
    ) {

      if (
        typeof FINANCE !== "undefined" &&
        FINANCE.paySalaries
      ) {

        FINANCE.paySalaries();
      }
    }
  },

  checkRandomEvent() {

    /*
     * Evita eventos todos os dias.
     */

    if (
      Math.random() > 0.18
    ) {
      return;
    }

    if (
      typeof Events === "undefined"
    ) {
      return;
    }

    if (
      typeof Events.getRandomEvent !== "function"
    ) {
      return;
    }

    const event =
      Events.getRandomEvent();

    if (!event) {
      return;
    }

    if (
      typeof Events.triggerEvent === "function"
    ) {

      Events.triggerEvent(
        event.id
      );
    }
  },

  checkCompetitionEvents() {

    if (
      typeof COMPETITIONS === "undefined"
    ) {
      return;
    }

    const date =
      this.formatDate(
        Game.state.date
      );

    /*
     * Procura partidas marcadas
     */

    Object.values(
      COMPETITIONS
    ).forEach(competition => {

      if (
        !competition ||
        !competition.matches
      ) {
        return;
      }

      competition.matches.forEach(match => {

        if (
          match.date === date
        ) {

          this.log(
            `Dia de jogo: ${competition.name || "Competição"}.`
          );

          Game.change(
            "fanMood",
            1
          );
        }
      });
    });
  },

  checkContracts() {

    if (
      typeof Contracts === "undefined"
    ) {
      return;
    }

    /*
     * Jogadores entrando nos últimos
     * 180 dias de contrato.
     */

    const players =
      Contracts.getExpiringPlayers(180);

    players.forEach(player => {

      if (
        player.contractWarningShown
      ) {
        return;
      }

      player.contractWarningShown = true;

      this.log(
        `Contrato de ${player.name} termina em breve.`
      );
    });

    /*
     * Staff
     */

    const staff =
      Contracts.getExpiringStaff(180);

    staff.forEach(member => {

      if (
        member.contractWarningShown
      ) {
        return;
      }

      member.contractWarningShown = true;

      this.log(
        `Contrato de ${member.name} termina em breve.`
      );
    });
  },

  checkElection() {

    if (
      !Game.state ||
      !Game.state.date
    ) {
      return;
    }

    const current =
      this.formatDate(
        Game.state.date
      );

    if (
      typeof POLITICS === "undefined"
    ) {
      return;
    }

    if (
      !POLITICS.election
    ) {
      return;
    }

    const electionDate =
      POLITICS.election.date;

    const alternativeDate =
      POLITICS.election.alternativeDate;

    if (
      current === electionDate
    ) {

      this.log(
        "ELEIÇÃO: chegou o dia da eleição do Corinthians."
      );

      Game.change(
        "pressPressure",
        15
      );

      return;
    }

    if (
      current === alternativeDate
    ) {

      this.log(
        "ELEIÇÃO: calendário eleitoral alternativo ativado."
      );

      Game.change(
        "pressPressure",
        15
      );
    }
  },

  formatDate(date) {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  },

  getStatus() {

    return {

      date:
        Game.state.date,

      career:
        Game.state.career,

      finance:
        typeof FINANCE !== "undefined"
          ? FINANCE.getFinancialHealth()
          : null,

      negotiations:
        typeof Negotiations !== "undefined"
          ? Negotiations.active.length
          : 0,

      delegations:
        typeof Delegation !== "undefined"
          ? Delegation.active.length
          : 0,

      loans:
        typeof Loans !== "undefined"
          ? Loans.getSummary()
          : null,

      offers:
        typeof PlayerOffers !== "undefined"
          ? PlayerOffers.getSummary()
          : null,

      contracts:
        typeof Contracts !== "undefined"
          ? Contracts.getContractSummary()
          : null

    };
  }
};

window.GameEngine = GameEngine;
