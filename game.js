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

  start(career) {

    this.state.career = career;

    this.log(
      `Carreira iniciada: ${career}`
    );

    this.render();

  },

  advanceDays(days) {

    this.state.date.setDate(
      this.state.date.getDate() + days
    );

    this.render();

  },

  change(variable, amount) {

    if (
      typeof this.state[variable] === "number"
    ) {
      this.state[variable] += amount;
    }

  },

  log(message) {

    this.state.history.unshift({
      date: this.formatDate(),
      message
    });

    this.renderLog();

  },

  formatDate() {

    return this.state.date.toLocaleDateString(
      "pt-BR"
    );

  },

  render() {

    const date =
      document.getElementById("dateStat");

    if (date) {
      date.textContent =
        this.formatDate();
    }

    const topDate =
      document.getElementById("topDate");

    if (topDate) {
      topDate.textContent =
        this.formatDate();
    }

    this.renderLog();

  },

  renderLog() {

    const container =
      document.getElementById("log");

    if (!container) return;

    container.innerHTML = "";

    this.state.history.forEach(entry => {

      const div =
        document.createElement("div");

      div.className = "log-entry";

      div.textContent =
        `[${entry.date}] ${entry.message}`;

      container.appendChild(div);

    });

  }

};


window.Game = Game;
