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
    this.state.matches = [];
    this.state.results = [];
    this.state.standings = { points: 0, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0 };
    this.state.transferWindow = { open: false, lastChecked: null };
    this.state.lastCalendarDate = null;
    this.state.manager = { reputation: 50, tacticalKnowledge: 50, authority: 50, relationship: 50, style: "equilibrado" };
    this.state.tactics = { inPossession: { formation: "4-3-3", width: 55, tempo: 55, passing: 55, pressing: 50 }, outOfPossession: { formation: "4-1-4-1", line: 55, press: 55, compactness: 55 } };
    this.state.squad = [];
    this.state.recruitment = { focuses: [], shortlist: [], reports: [] };

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

  formatDate(date = this.state.date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().slice(0, 10);
  },

  ensureManagerModel() {
    const s = this.state;
    s.manager = s.manager || {
      reputation: 50,
      tacticalKnowledge: 50,
      authority: 50,
      relationship: 50,
      style: "equilibrado"
    };
    s.tactics = s.tactics || {
      inPossession: { formation: "4-3-3", width: 55, tempo: 55, passing: 55, pressing: 50 },
      outOfPossession: { formation: "4-1-4-1", line: 55, press: 55, compactness: 55 }
    };
    s.squad = Array.isArray(s.squad) ? s.squad : [];
    s.recruitment = s.recruitment || { focuses: [], shortlist: [], reports: [] };
  },

  applyTacticalPlan(plan = {}) {
    this.ensureManagerModel();
    const t = this.state.tactics;
    if (plan.inPossession) Object.assign(t.inPossession, plan.inPossession);
    if (plan.outOfPossession) Object.assign(t.outOfPossession, plan.outOfPossession);
    if (plan.style) this.state.manager.style = plan.style;
    this.addNews("🧠 Plano tático atualizado", "A equipe recebeu novas orientações com bola e sem bola.", "TÁTICA");
    this.addMail("Comissão Técnica", "Novo plano de jogo", `Plano ${this.state.manager.style}: ${t.inPossession.formation} com posse / ${t.outOfPossession.formation} sem posse.`, "FUTEBOL");
    this.change("coachConfidence", 1);
  },

  createRecruitmentFocus(position, role = "titular", priority = 50) {
    this.ensureManagerModel();
    const focus = { id: "focus-" + Date.now(), position, role, priority, created: this.formatDate(), active: true };
    this.state.recruitment.focuses.push(focus);
    this.addNews("🔎 Novo foco de recrutamento", `Scouting recebeu uma busca por ${position} (${role}).`, "MERCADO");
    this.addMail("Chefe de Scouting", "Novo foco de recrutamento", `Vamos procurar ${position} com prioridade ${priority}/100.`, "MERCADO");
    return focus;
  },

  ensureSeasonSystems() {
    const s = this.state;
    s.season = s.season || 2026;
    s.matches = Array.isArray(s.matches) ? s.matches : [];
    s.results = Array.isArray(s.results) ? s.results : [];
    s.standings = s.standings || { points: 0, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0 };
    s.transferWindow = s.transferWindow || { open: false, lastChecked: null };
    s.clubReputation = Number(s.clubReputation ?? s.reputation ?? 50);
    s.lastCalendarDate = s.lastCalendarDate || null;
  },

  getSeasonSummary() {
    this.ensureSeasonSystems();
    const st = this.state.standings;
    return {
      played: st.played, points: st.points, wins: st.wins, draws: st.draws,
      losses: st.losses, gd: st.gf - st.ga
    };
  },

  processSeasonCalendar() {
    this.ensureSeasonSystems();
    const key = this.formatDate();
    if (this.state.lastCalendarDate === key) return;
    this.state.lastCalendarDate = key;

    const d = this.state.date;
    const month = d.getMonth() + 1;
    const day = d.getDate();

    const windowsOpen = (month === 1 && day >= 5) || (month === 7 && day >= 3 && day <= 31);
    const wasOpen = this.state.transferWindow.open;
    this.state.transferWindow.open = windowsOpen;

    if (windowsOpen && !wasOpen) {
      this.addNews("🛒 Janela de transferências aberta", "O mercado está oficialmente aberto. Scouting, propostas e orçamento passam a ter prioridade.", "MERCADO");
      this.addMail("Departamento de Futebol", "Janela de mercado", "A janela está aberta. Revise necessidades do elenco e o orçamento antes de avançar.", "MERCADO");
    }
    if (!windowsOpen && wasOpen) {
      this.addNews("🔒 Janela de transferências fechada", "O mercado foi encerrado. Operações pendentes precisam aguardar a próxima janela.", "MERCADO");
    }

    const weekday = d.getDay();
    if ((weekday === 0 || weekday === 3) && Math.random() < 0.42) {
      this.generateScheduledMatch();
    }

    if (month === 12 && day === 31) {
      const summary = this.getSeasonSummary();
      this.addNews("🏁 Temporada encerrada", `Campanha: ${summary.played} jogos, ${summary.points} pontos, ${summary.wins} vitórias, ${summary.draws} empates e ${summary.losses} derrotas.`, "TEMPORADA");
      this.addMail("Secretaria do Clube", "Relatório anual", "A temporada foi encerrada. O desempenho esportivo e financeiro está pronto para avaliação.", "DIRETORIA");
    }
  },

  ensureMatchEngine() {
    const s = this.state;
    s.matchEngine = s.matchEngine || { active: false, fixtureId: null, minute: 0, home: null, away: null, events: [], stats: { home: { shots: 0, shotsOnTarget: 0, possession: 50, xg: 0 }, away: { shots: 0, shotsOnTarget: 0, possession: 50, xg: 0 } }, score: { home: 0, away: 0 } };
  },

  buildMatchProfile(club = "Corinthians", strength = 78) {
    this.ensureManagerModel();
    return {
      club, strength,
      attack: Math.round(strength + (this.state.tactics.inPossession.tempo - 50) * 0.12),
      control: Math.round(strength + (this.state.tactics.inPossession.passing - 50) * 0.10),
      defense: Math.round(strength + (this.state.tactics.outOfPossession.compactness - 50) * 0.12),
      press: Math.round(strength + (this.state.tactics.outOfPossession.press - 50) * 0.10)
    };
  },

  startMatchday(fixture) {
    if (!fixture) return false;
    this.ensureMatchEngine();
    const home = fixture.home || "Corinthians", away = fixture.away || fixture.opponent || "Adversário";
    this.state.matchEngine = {
      active: true, fixtureId: fixture.id || Date.now(), minute: 0, home, away,
      events: [{ minute: 0, type: "system", text: "Apito inicial. O plano de jogo está valendo." }],
      stats: { home: { shots: 0, shotsOnTarget: 0, possession: 50, xg: 0 }, away: { shots: 0, shotsOnTarget: 0, possession: 50, xg: 0 } },
      score: { home: 0, away: 0 }
    };
    fixture.status = "live";
    this.addNews("🏟️ Matchday", `${home} x ${away} começou.`, "JOGO");
    return true;
  },

  simulateMatchMinutes(minutes = 5) {
    this.ensureMatchEngine();
    const m = this.state.matchEngine;
    if (!m.active) return false;
    this.ensureManagerModel();
    const homeProfile = this.buildMatchProfile(m.home, m.home === "Corinthians" ? 78 : 74);
    const awayProfile = this.buildMatchProfile(m.away, m.away === "Corinthians" ? 78 : 74);
    for (let i = 0; i < minutes && m.minute < 90; i++) {
      m.minute++;
      const hBias = homeProfile.attack + homeProfile.control + 5 + (this.state.fanMood - 50) * 0.15;
      const aBias = awayProfile.attack + awayProfile.control;
      const total = Math.max(1, hBias + aBias);
      const homePoss = Math.max(30, Math.min(70, Math.round(50 + (hBias-aBias) / total * 35)));
      m.stats.home.possession = homePoss; m.stats.away.possession = 100-homePoss;
      const eventRoll = Math.random() * 100;
      const chance = 5.2 + Math.max(0, (hBias-aBias) / 80);
      if (eventRoll < chance) {
        const side = Math.random() < hBias / total ? "home" : "away";
        const team = side === "home" ? m.home : m.away;
        const st = m.stats[side];
        st.shots++;
        const onTarget = Math.random() < 0.34;
        if (onTarget) st.shotsOnTarget++;
        const xg = onTarget ? (0.05 + Math.random()*0.20) : (0.01 + Math.random()*0.07);
        st.xg += xg;
        if (Math.random() < (onTarget ? 0.11 : 0.015)) {
          m.score[side]++;
          m.events.unshift({ minute: m.minute, type: "goal", text: `⚽ GOL! ${team}` });
          this.addNews("⚽ Gol no Matchday", `${team} marcou aos ${m.minute}'.`, "JOGO");
        } else {
          m.events.unshift({ minute: m.minute, type: "chance", text: `${m.minute}' — ${team} criou uma oportunidade` });
        }
      }
    }
    if (m.minute >= 90) this.finishMatchday();
    return true;
  },

  applyMatchInstruction(type) {
    this.ensureManagerModel();
    const map = {
      attacking: { tempo: 72, passing: 58, pressing: 68 },
      balanced: { tempo: 55, passing: 55, pressing: 55 },
      defensive: { tempo: 42, passing: 52, pressing: 43 }
    };
    const p = map[type] || map.balanced;
    this.applyTacticalPlan({ style: type, inPossession: { tempo: p.tempo, passing: p.passing }, outOfPossession: { press: p.pressing } });
    this.addNews("📋 Instrução de jogo", `Plano alterado para ${type}.`, "JOGO");
  },

  finishMatchday() {
    const m = this.state.matchEngine;
    if (!m.active) return false;
    const fixture = (this.state.matches || []).find(x => String(x.id) === String(m.fixtureId));
    if (fixture) {
      fixture.status = "played"; fixture.played = true; fixture.homeScore = m.score.home; fixture.awayScore = m.score.away;
    }
    const isHome = m.home === "Corinthians";
    const gf = isHome ? m.score.home : m.score.away, ga = isHome ? m.score.away : m.score.home;
    this.state.results = this.state.results || [];
    this.state.results.push({ date: this.formatDate(), opponent: isHome ? m.away : m.home, gf, ga, competition: fixture?.competition || "Jogo" });
    this.change("reputation", gf > ga ? 2 : gf === ga ? 0 : -2);
    this.change("fanMood", gf > ga ? 4 : gf === ga ? 0 : -5);
    this.addNews("🏁 Fim de jogo", `${m.home} ${gf} x ${ga} ${m.away}`, "JOGO");
    this.addMail("Comissão Técnica", "Relatório pós-jogo", `Resultado: ${m.home} ${gf} x ${ga} ${m.away}. xG ${m.stats.home.xg.toFixed(2)}–${m.stats.away.xg.toFixed(2)}.`, "FUTEBOL");
    m.active = false;
    return true;
  },

  generateScheduledMatch() {
    this.ensureSeasonSystems();
    const date = this.formatDate();
    if (this.state.matches.some(m => m.date === date && !m.played)) return;

    const opponents = ["Palmeiras", "São Paulo", "Santos", "Flamengo", "Grêmio", "Internacional", "Bahia", "Cruzeiro"];
    const opponent = opponents[Math.floor(Math.random() * opponents.length)];
    const home = Math.random() >= 0.48;
    const base = 1 + (Number(this.state.coachConfidence || 50) + Number(this.state.dressingRoomMorale || 50)) / 100;
    const strength = Math.max(0.45, Math.min(2.1, base / 1.8));
    const opponentStrength = 0.85 + Math.random() * 0.45;
    const homeBoost = home ? 0.18 : 0;
    const lambdaFor = Math.max(0.2, 1.15 * strength + homeBoost);
    const lambdaAgainst = Math.max(0.15, 1.0 * opponentStrength - (this.state.reputation || 50) / 500);
    const goalsFor = Math.min(7, Math.floor(-Math.log(Math.random()) * lambdaFor));
    const goalsAgainst = Math.min(6, Math.floor(-Math.log(Math.random()) * lambdaAgainst));

    const match = {
      id: "match-" + date + "-" + Math.random().toString(36).slice(2, 8),
      date, competition: "Calendário Nacional", opponent, home, played: true,
      goalsFor, goalsAgainst
    };
    this.state.matches.push(match);
    this.state.results.unshift(match);

    const st = this.state.standings;
    st.played++;
    st.gf += goalsFor;
    st.ga += goalsAgainst;
    if (goalsFor > goalsAgainst) { st.wins++; st.points += 3; }
    else if (goalsFor === goalsAgainst) { st.draws++; st.points += 1; }
    else st.losses++;

    if (goalsFor > goalsAgainst) {
      this.change("fanMood", 3);
      this.change("reputation", 2);
      this.change("coachConfidence", 2);
    } else if (goalsFor === goalsAgainst) {
      this.change("fanMood", 1);
    } else {
      this.change("fanMood", -4);
      this.change("pressPressure", 4);
      this.change("coachConfidence", -2);
    }

    const result = goalsFor > goalsAgainst ? "VITÓRIA" : goalsFor === goalsAgainst ? "EMPATE" : "DERROTA";
    this.addNews(`⚽ ${result}: Corinthians ${goalsFor} x ${goalsAgainst} ${opponent}`, `O resultado entrou automaticamente no histórico da temporada.`, "FUTEBOL");
    this.addMail("Departamento de Futebol", `Pós-jogo: ${result}`, `Placar: Corinthians ${goalsFor} x ${goalsAgainst} ${opponent}. Moral e pressão foram atualizadas automaticamente.`, "FUTEBOL");
    this.log(`⚽ ${result}: Corinthians ${goalsFor} x ${goalsAgainst} ${opponent}.`);

    if (typeof FINANCE !== "undefined") {
      const attendanceRevenue = (home ? 1800000 : 500000) + Math.floor(Math.random() * 900000);
      FINANCE.state.matchdayRevenue = Number(FINANCE.state.matchdayRevenue || 0) + attendanceRevenue;
      FINANCE.state.monthlyRevenue = Number(FINANCE.state.monthlyRevenue || 0) + attendanceRevenue;
      FINANCE.syncGameState?.();
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

    if (this.state.career === "presidente" && this.state.election?.won === true && month === 12 && day === 1) {
      once("president-review-" + key, () => {
        this.addMail("Conselho Fiscal", "Balanço da gestão", "O Conselho solicita uma revisão das metas esportivas, financeiras e institucionais antes do encerramento do ano.", "DIRETORIA");
        this.addNews("📋 Balanço da gestão solicitado", "A presidência entrou no período de avaliação anual.", "DIRETORIA");
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
