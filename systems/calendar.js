const CalendarSystem = {

  getDate() {
    return new Date(Game.state.date);
  },

  formatDate(date) {

    return date.toLocaleDateString(
      "pt-BR",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }
    );

  },

  getSeasonDay() {

    const start =
      new Date("2026-01-01T00:00:00");

    const current =
      this.getDate();

    const difference =
      current - start;

    return Math.floor(
      difference /
      (1000 * 60 * 60 * 24)
    ) + 1;

  },

  getDaysUntil(dateString) {

    const target =
      new Date(dateString);

    const current =
      this.getDate();

    return Math.ceil(
      (target - current) /
      (1000 * 60 * 60 * 24)
    );

  },

  getElectionStatus() {

    if (
      typeof POLITICS === "undefined" ||
      !POLITICS.election
    ) {
      return null;
    }

    const election =
      POLITICS.election;

    const normalDate =
      election.date;

    const alternativeDate =
      election.alternativeDate;

    return {

      normalDate,

      alternativeDate,

      daysUntilNormal:
        this.getDaysUntil(normalDate),

      daysUntilAlternative:
        this.getDaysUntil(alternativeDate),

      finalAdjustment:
        "Se o Corinthians chegar à final da Libertadores, a eleição será realizada em 05/12/2026."

    };

  },

  getNextEvents(limit = 5) {

    const events = [];

    /*
     * ELEIÇÃO
     */

    if (
      typeof POLITICS !== "undefined" &&
      POLITICS.election
    ) {

      const election =
        POLITICS.election;

      const days =
        this.getDaysUntil(
          election.date
        );

      if (days >= 0) {

        events.push({

          type: "politica",

          title:
            "Eleição do Corinthians",

          date:
            election.date,

          days,

          priority: 10

        });

      }

    }

    /*
     * COMPETIÇÕES
     */

    if (
      typeof COMPETITIONS !== "undefined"
    ) {

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

          const days =
            this.getDaysUntil(
              match.date
            );

          if (days < 0) {
            return;
          }

          events.push({

            type: "futebol",

            title:
              competition.name ||
              "Partida",

            opponent:
              match.opponent ||
              match.home ||
              match.away ||
              "Adversário",

            date:
              match.date,

            days,

            priority: 8

          });

        });

      });

    }

    /*
     * CONTRATOS
     */

    if (
      typeof Contracts !== "undefined"
    ) {

      const expiring =
        Contracts.getExpiringPlayers(90);

      expiring.forEach(player => {

        const days =
          Contracts.getRemainingDays(
            player.contractUntil
          );

        events.push({

          type: "contrato",

          title:
            `Contrato de ${player.name}`,

          date:
            player.contractUntil,

          days,

          priority: 7

        });

      });

    }

    /*
     * NEGOCIAÇÕES
     */

    if (
      typeof Negotiations !== "undefined"
    ) {

      const active =
        Negotiations.active || [];

      active.forEach(negotiation => {

        if (!negotiation.deadline) {
          return;
        }

        const days =
          this.getDaysUntil(
            negotiation.deadline
          );

        if (days < 0) {
          return;
        }

        events.push({

          type: "negociacao",

          title:
            "Negociação pendente",

          date:
            negotiation.deadline,

          days,

          priority: 6

        });

      });

    }

    /*
     * ORDENA POR DATA / PRIORIDADE
     */

    events.sort((a, b) => {

      if (a.days !== b.days) {
        return a.days - b.days;
      }

      return b.priority - a.priority;

    });

    return events.slice(0, limit);

  },

  getTodaySummary() {

    const date =
      this.getDate();

    return {

      date:
        this.formatDate(date),

      seasonDay:
        this.getSeasonDay(),

      election:
        this.getElectionStatus(),

      nextEvents:
        this.getNextEvents(5)

    };

  },

  isMatchDay() {

    const today =
      this.formatDateISO(
        this.getDate()
      );

    const events =
      this.getNextEvents(20);

    return events.some(
      event =>
        event.type === "futebol" &&
        event.date === today
    );

  },

  formatDateISO(date) {

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

  }

};

window.CalendarSystem = CalendarSystem;
