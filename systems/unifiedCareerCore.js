/* ============================================================
 * CORINTHIANS NOVA ERA — UNIFIED CAREER CORE
 * Conecta comissão → treino → escalação → partida → competições
 * → mercado → contratos → finanças → diretoria → torcida/imprensa
 * → temporada em um único estado persistente de Game.state.
 * ============================================================ */
(function () {
  "use strict";

  const Core = {
    version: 1,

    init(G) {
      const s = G.state;
      s.season = Number(s.season || 2026);
      s.nextId = Number(s.nextId || 1);
      s.training = s.training || { focus: "equilibrado", intensity: 55, weeklyLoad: 0 };
      s.dynamics = s.dynamics || { dressingRoom: 60, leadership: 50, playerSupport: 60, staffSupport: 60 };
      s.board = s.board || { confidence: 55, patience: 50, objectives: [], warnings: [], lastReview: null };
      s.fans = s.fans || { mood: Number(s.fanMood || 50), patience: 45, expectation: 70, attendance: 70 };
      s.media = s.media || { pressure: Number(s.pressPressure || 10), positive: 30, negative: 70, stories: [] };
      s.finance = s.finance || { revenue: 0, expenses: 0, monthlyRevenue: 0, monthlyExpenses: 0, transferSpend: 0, wageBill: 0, matchdayRevenue: 0, prizeMoney: 0 };
      s.market = s.market || { shortlist: [], negotiations: [], offers: [], completed: [] };
      s.contracts = s.contracts || { renewals: [], expiring: [], active: [] };
      s.competition = s.competition || { fixtures: [], current: null, history: [] };
      s.seasonReview = s.seasonReview || null;
      s.seasonStats = s.seasonStats || { matches: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, trophies: [], objectiveProgress: 0 };
      s.injuries = Array.isArray(s.injuries) ? s.injuries : [];
      s.suspensions = Array.isArray(s.suspensions) ? s.suspensions : [];
      s.lineup = s.lineup || {};
      s.bench = Array.isArray(s.bench) ? s.bench : [];
      s.saveVersion = this.version;
      this.syncMirrors(G);
      return s;
    },

    syncMirrors(G) {
      const s = G.state;
      s.fanMood = Math.max(0, Math.min(100, Number(s.fans.mood ?? s.fanMood ?? 50)));
      s.pressPressure = Math.max(0, Math.min(100, Number(s.media.pressure ?? s.pressPressure ?? 10)));
      s.dressingRoomMorale = Math.max(0, Math.min(100, Number(s.dynamics.dressingRoom ?? s.dressingRoomMorale ?? 60)));
      s.councilTrust = Math.max(0, Math.min(100, Number(s.board.confidence ?? s.councilTrust ?? 20)));
      if (s.club) {
        s.club.cash = Number(s.club.cash ?? s.finance.cash ?? 0);
        s.club.debt = Number(s.club.debt ?? 2800000000);
      }
    },

    hasManagementAccess(G) {
      return !(G.state.career === "presidente" && !G.state.election.won);
    },

    requireAccess(G, label) {
      if (this.hasManagementAccess(G)) return true;
      G.addNews("🔒 Gestão bloqueada", "Você não venceu a eleição e não possui autoridade para executar " + (label || "esta ação") + ".", "DIRETORIA");
      return false;
    },

    prepareSquad(G) {
      if (window.SquadCore && SquadCore.init) SquadCore.init(G);
      const s = G.state;
      s.squad = Array.isArray(s.squad) ? s.squad : [];
      s.squad.forEach((p, i) => {
        p.position = p.position || p.pos || "MEI";
        p.overall = Number(p.overall || 70);
        p.condition = Number(p.condition ?? 90);
        p.morale = Number(p.morale ?? 70);
        p.form = Number(p.form ?? 70);
        p.fitness = Number(p.fitness ?? 90);
        p.injured = !!p.injured;
        p.suspended = !!p.suspended;
        p.minutes = Number(p.minutes || 0);
        p.attributes = p.attributes || {
          pace: p.pace || p.overall, passing: p.passing || p.overall,
          shooting: p.shooting || p.overall, defense: p.defense || p.overall,
          physical: p.physical || p.overall, decision: p.decision || p.overall
        };
        p.squadIndex = i;
      });
      if (!Object.keys(s.lineup).length && s.squad.length) {
        const available = s.squad.filter(p => !p.injured && !p.suspended).slice(0, 11);
        available.forEach((p, i) => { s.lineup[i] = p.id || "player-" + i; });
      }
      return s.squad;
    },

    train(G, focus, intensity) {
      if (!this.requireAccess(G, "treinamento")) return false;
      const s = this.init(G);
      const allowed = ["equilibrado", "ataque", "defesa", "fisico", "tatico", "recuperacao", "bola_parada"];
      s.training.focus = allowed.includes(focus) ? focus : "equilibrado";
      s.training.intensity = Math.max(20, Math.min(90, Number(intensity || 55)));
      s.training.weeklyLoad = Math.round(s.training.intensity * (s.training.focus === "recuperacao" ? 0.5 : 1));
      if (window.SquadCore && SquadCore.tick) SquadCore.tick(G);
      s.squad.forEach(p => {
        const gain = (s.training.intensity - 50) * 0.02;
        p.form = Math.max(20, Math.min(100, p.form + gain));
        p.condition = Math.max(30, Math.min(100, p.condition - Math.max(0, (s.training.intensity - 50) * 0.05)));
      });
      s.dynamics.staffSupport = Math.min(100, s.dynamics.staffSupport + 1);
      G.addNews("🏋️ Treinamento concluído", "Foco: " + s.training.focus + " · intensidade " + s.training.intensity + "/100.", "FUTEBOL");
      return true;
    },

    selectXI(G, ids) {
      if (!this.requireAccess(G, "escalação")) return false;
      this.prepareSquad(G);
      const wanted = Array.isArray(ids) ? ids.slice(0, 11) : [];
      const valid = wanted.filter(id => G.state.squad.some(p => String(p.id) === String(id) && !p.injured && !p.suspended));
      if (valid.length < 11) {
        G.addNews("⚠️ Escalação incompleta", "É necessário selecionar 11 jogadores disponíveis.", "FUTEBOL");
        return false;
      }
      G.state.lineup = {};
      valid.forEach((id, i) => G.state.lineup[i] = id);
      G.state.bench = G.state.squad.filter(p => !valid.includes(p.id) && !p.injured && !p.suspended).slice(0, 9).map(p => p.id);
      G.addNews("📋 Escalação definida", "XI titular e banco foram atualizados.", "FUTEBOL");
      return true;
    },

    teamStrength(G) {
      this.prepareSquad(G);
      const ids = Object.values(G.state.lineup);
      const xi = G.state.squad.filter(p => ids.includes(p.id));
      if (!xi.length) return 70;
      const avg = xi.reduce((n, p) => n + Number(p.overall || 70), 0) / xi.length;
      const cond = xi.reduce((n, p) => n + Number(p.condition || 80), 0) / xi.length;
      const form = xi.reduce((n, p) => n + Number(p.form || 70), 0) / xi.length;
      return Math.round(avg * 0.7 + cond * 0.15 + form * 0.15);
    },

    beforeMatch(G, fixture) {
      if (!this.requireAccess(G, "a preparação da partida")) return false;
      this.prepareSquad(G);
      if (G.state.matchEngine && G.state.matchEngine.active) return false;
      fixture = fixture || (G.state.matches || []).find(m => m.status === "scheduled" || (!m.played && m.date === G.formatDate()));
      if (!fixture) return false;
      fixture.status = "pre_match";
      fixture.prepared = true;
      G.state.competition.current = fixture.id;
      this.train(G, G.state.training.focus, G.state.training.intensity);
      G.addMail("Comissão Técnica", "Pré-jogo preparado", "Escalação, condição física e plano tático foram sincronizados para " + (fixture.home || "Corinthians") + " x " + (fixture.away || fixture.opponent) + ".", "FUTEBOL");
      return true;
    },

    registerResult(G, fixture) {
      if (!fixture) return;
      const s = G.state;
      const gf = Number(fixture.home === "Corinthians" ? fixture.homeScore : fixture.awayScore || 0);
      const ga = Number(fixture.home === "Corinthians" ? fixture.awayScore : fixture.homeScore || 0);
      s.seasonStats.matches++;
      s.seasonStats.goalsFor += gf;
      s.seasonStats.goalsAgainst += ga;
      if (gf > ga) s.seasonStats.wins++;
      else if (gf === ga) s.seasonStats.draws++;
      else s.seasonStats.losses++;
      s.finance.matchdayRevenue += Math.round(800000 + (s.fans.attendance || 70) * 12000);
      const delta = gf > ga ? 4 : gf === ga ? 0 : -5;
      s.fans.mood += delta;
      s.board.confidence += gf > ga ? 2 : gf === ga ? 0 : -3;
      s.media.pressure += gf > ga ? -2 : gf === ga ? 1 : 5;
      s.dynamics.dressingRoom += gf > ga ? 2 : gf === ga ? 0 : -3;
      this.syncMirrors(G);
      if (window.SquadCore && SquadCore.tick) SquadCore.tick(G);
    },

    processDay(G) {
      const s = this.init(G);
      if (window.CareerCore && CareerCore.tick) CareerCore.tick(G);
      if (window.SquadCore && SquadCore.tick) SquadCore.tick(G);

      const d = G.state.date;
      const day = d.getDate(), month = d.getMonth() + 1;
      const key = G.formatDate();
      const last = s.lastUnifiedDay;
      if (last === key) return;
      s.lastUnifiedDay = key;

      const windowOpen = (month === 1 && day >= 5 && day <= 31) || (month === 7 && day >= 3 && day <= 31);
      s.transferWindow.open = windowOpen;
      if (windowOpen && !s.transferWindow.lastOpenNotice) {
        s.transferWindow.lastOpenNotice = key;
        G.addNews("🛒 Mercado aberto", "Scouting, negociações e renovações estão ativos.", "MERCADO");
      }
      if (!windowOpen) s.transferWindow.lastOpenNotice = null;

      if (day === 1) this.monthlyFinance(G);
      this.contractTick(G);
      this.mediaTick(G);
      this.boardTick(G);
      this.seasonTick(G);
      this.syncMirrors(G);
    },

    monthlyFinance(G) {
      const s = this.init(G);
      const wage = (s.squad || []).reduce((n, p) => n + Number(p.salary || 0), 0);
      const revenue = Math.round(2500000 + (s.fans.mood || 50) * 25000);
      const expenses = Math.round(1600000 + wage);
      s.finance.wageBill = wage;
      s.finance.monthlyRevenue = revenue;
      s.finance.monthlyExpenses = expenses;
      s.finance.revenue += revenue;
      s.finance.expenses += expenses;
      if (s.club) s.club.cash = Number(s.club.cash || 0) + revenue - expenses;
      G.log("💰 Fechamento mensal: receita R$ " + revenue.toLocaleString("pt-BR") + " · despesas R$ " + expenses.toLocaleString("pt-BR") + ".");
      if (s.club && s.club.cash < 0) {
        s.board.confidence -= 3;
        s.media.pressure += 4;
        G.addNews("🚨 Caixa pressionado", "O fechamento mensal terminou no vermelho.", "FINANCEIRO");
      }
    },

    makeTransferOffer(G, playerId, fee, salary) {
      if (!this.requireAccess(G, "negociação de mercado")) return false;
      const s = this.init(G);
      if (!s.transferWindow.open || s.club.transferBan) {
        G.addNews("🔒 Negociação bloqueada", "A janela pode estar fechada ou o clube possui impedimento de registro.", "MERCADO");
        return false;
      }
      const offer = { id: "OFF-" + Date.now(), playerId, fee: Number(fee || 0), salary: Number(salary || 0), status: "proposta", date: G.formatDate() };
      s.market.offers.push(offer);
      s.finance.transferSpend += offer.fee;
      G.addNews("📨 Proposta enviada", "Oferta registrada no mercado para análise.", "MERCADO");
      return offer;
    },

    renewContract(G, playerId, salary, years) {
      if (!this.requireAccess(G, "renovação contratual")) return false;
      const s = this.init(G);
      const p = s.squad.find(x => String(x.id) === String(playerId));
      if (!p) return false;
      const until = new Date(G.state.date);
      until.setFullYear(until.getFullYear() + Number(years || 2));
      p.salary = Number(salary || p.salary || 0);
      p.contractUntil = until.toISOString().slice(0, 10);
      s.contracts.renewals.push({ playerId, salary: p.salary, years: Number(years || 2), date: G.formatDate() });
      G.addNews("📝 Contrato renovado", p.name + " renovou até " + p.contractUntil + ".", "CONTRATOS");
      return true;
    },

    boardTick(G) {
      const s = G.state;
      s.board.confidence = Math.max(0, Math.min(100, Number(s.board.confidence)));
      s.board.patience = Math.max(0, Math.min(100, Number(s.board.patience)));
      if (s.seasonStats.matches && s.seasonStats.matches % 10 === 0 && s.board.lastReview !== s.seasonStats.matches) {
        s.board.lastReview = s.seasonStats.matches;
        const winRate = s.seasonStats.wins / Math.max(1, s.seasonStats.matches);
        if (winRate >= 0.55) s.board.confidence += 4;
        else if (winRate < 0.35) s.board.confidence -= 5;
        G.addMail("Diretoria", "Reunião de avaliação", "Confiança atual: " + Math.round(s.board.confidence) + "/100. A diretoria reavaliou o desempenho recente.", "DIRETORIA");
      }
    },

    mediaTick(G) {
      const s = G.state;
      if (s.media.pressure > 75) {
        s.media.negative = Math.min(100, s.media.negative + 1);
        if (Math.random() < 0.08) G.addNews("📰 Pressão da imprensa", "O ambiente externo está cobrando respostas da diretoria.", "IMPRENSA");
      }
    },

    contractTick(G) {
      const s = G.state;
      const now = new Date(G.state.date);
      s.contracts.expiring = (s.squad || []).filter(p => {
        if (!p.contractUntil) return false;
        const until = new Date(p.contractUntil);
        return Math.ceil((until - now) / 86400000) <= 180;
      }).map(p => p.id);
    },

    seasonTick(G) {
      const s = G.state;
      const d = G.state.date;
      if (d.getMonth() === 11 && d.getDate() === 31 && !s.seasonReview) {
        const st = s.seasonStats;
        const review = {
          season: s.season,
          record: st.wins + "V " + st.draws + "E " + st.losses + "D",
          goals: st.goalsFor + "-" + st.goalsAgainst,
          board: Math.round(s.board.confidence),
          fans: Math.round(s.fans.mood),
          finance: Number(s.club && s.club.cash || 0),
          trophies: st.trophies.slice()
        };
        s.seasonReview = review;
        G.addNews("🏁 Temporada encerrada", "Relatório " + s.season + ": " + review.record + " · gols " + review.goals + ".", "TEMPORADA");
        G.addMail("Diretoria", "Relatório anual", "A temporada foi encerrada. Revise desempenho, finanças, elenco e objetivos antes do próximo ano.", "TEMPORADA");
      }
    },

    dashboard(G) {
      const s = this.init(G);
      return {
        season: s.season,
        date: G.formatDate(),
        training: s.training,
        teamStrength: this.teamStrength(G),
        lineup: Object.values(s.lineup),
        nextMatch: (s.matches || []).find(m => !m.played),
        boardConfidence: s.board.confidence,
        fanMood: s.fans.mood,
        mediaPressure: s.media.pressure,
        cash: s.club ? s.club.cash : 0,
        debt: s.club ? s.club.debt : 0,
        seasonStats: s.seasonStats
      };
    }
  };

  window.UnifiedCareerCore = Core;

  function wire() {
    if (!window.Game) return;
    const G = window.Game;
    const originalStart = G.start.bind(G);
    const originalAdvanceDays = G.advanceDays.bind(G);

    G.start = function(career) {
      const result = originalStart(career);
      Core.init(G);
      Core.prepareSquad(G);
      return result;
    };

    G.advanceDays = function(days) {
      const result = originalAdvanceDays(days);
      Core.processDay(G);
      if (G.render) G.render();
      return result;
    };

    const originalProcessCalendar = G.processSeasonCalendar;
    G.processSeasonCalendar = function() {
      Core.init(G);
      const s = G.state;
      const d = s.date;
      const day = d.getDate(), month = d.getMonth() + 1;
      s.transferWindow = s.transferWindow || { open: false };
      s.transferWindow.open = (month === 1 && day >= 5 && day <= 31) || (month === 7 && day >= 3 && day <= 31);
      if (window.CompetitionCore && CompetitionCore.onDay) CompetitionCore.onDay(G);
    };

    const originalFinish = G.finishMatchday ? G.finishMatchday.bind(G) : null;
    if (originalFinish) {
      G.finishMatchday = function() {
        const before = G.state.matchEngine && G.state.matchEngine.active;
        const result = originalFinish();
        if (before) {
          const fixture = (G.state.matches || []).find(m => m.status === "played" && String(m.id) === String(G.state.matchEngine && G.state.matchEngine.fixtureId));
          if (fixture) Core.registerResult(G, fixture);
        }
        Core.syncMirrors(G);
        return result;
      };
    }

    const oldChange = G.change.bind(G);
    G.change = function(k, v) {
      const r = oldChange(k, v);
      Core.syncMirrors(G);
      return r;
    };

    G.hasClubManagementAccess = function() { return Core.hasManagementAccess(G); };
    G.requireClubManagementAccess = function(label) { return Core.requireAccess(G, label); };

    if (window.updateManagementAccess) {
      const oldUpdate = window.updateManagementAccess;
      window.updateManagementAccess = function() {
        oldUpdate();
        const locked = !Core.hasManagementAccess(G);
        document.querySelectorAll("[data-management-action]").forEach(el => {
          el.disabled = locked;
          el.title = locked ? "Gestão disponível apenas após vencer a eleição." : "";
        });
      };
    }

    Core.init(G);
    Core.prepareSquad(G);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
