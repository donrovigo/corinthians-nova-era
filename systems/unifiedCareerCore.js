/* ============================================================
 * CORINTHIANS NOVA ERA — UNIFIED CAREER CORE
 * Conecta comissão → treino → escalação → partida → competições
 * → mercado → contratos → finanças → diretoria → torcida/imprensa
 * → temporada em um único estado persistente de Game.state.
 * ============================================================ */
(function () {
  "use strict";

  const Core = {
    version: 2,

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
      const xi = window.SquadCore && SquadCore.getXI ? SquadCore.getXI(G) : G.state.squad.filter(p => Object.values(G.state.lineup).includes(p.id));
      if (!xi.length) return 70;
      const avg = xi.reduce((n,p) => n + Number(p.overall || 70),0) / xi.length;
      const cond = xi.reduce((n,p) => n + Number(p.condition || 80),0) / xi.length;
      const form = xi.reduce((n,p) => n + Number(p.form || 70),0) / xi.length;
      const morale = xi.reduce((n,p) => n + Number(p.morale || 70),0) / xi.length;
      const fitness = xi.reduce((n,p) => n + Number(p.fitness || 80),0) / xi.length;
      const staff = Number(G.state.staffModel?.trainingBonus || 0) * .35;
      return Math.round(avg*.62 + cond*.12 + form*.12 + morale*.07 + fitness*.07 + staff);
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
      this.recoverPlayers(G);
      this.contractTick(G);
      this.mediaTick(G);
      this.boardTick(G);
      this.seasonTick(G);
      this.syncMirrors(G);
    },

    recoverPlayers(G) {
      const s = this.init(G);
      s.injuries = Array.isArray(s.injuries) ? s.injuries : [];
      s.suspensions = Array.isArray(s.suspensions) ? s.suspensions : [];
      (s.squad || []).forEach(p => {
        const injury = s.injuries.find(x => String(x.playerId) === String(p.id));
        if (injury) {
          injury.days = Math.max(0, Number(injury.days || 0) - 1);
          if (injury.days <= 0) {
            p.injured = false;
            p.condition = Math.max(55, Number(p.condition || 40));
          }
        }
        if (p.suspended) {
          const cardBan = s.suspensions.find(x => String(x.playerId) === String(p.id));
          if (cardBan) {
            cardBan.matches = Math.max(0, Number(cardBan.matches || 0) - (G.state.lastMatchdayProcessed ? 0 : 0));
          }
        }
      });
      s.injuries = s.injuries.filter(x => Number(x.days || 0) > 0);
      s.suspensions = s.suspensions.filter(x => {
        if (Number(x.matches || 0) > 0) return true;
        const p = (s.squad || []).find(y => String(y.id) === String(x.playerId));
        if (p) p.suspended = false;
        return false;
      });
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

    startNewSeason(G) {
      const s = this.init(G);
      s.seasonHistory = Array.isArray(s.seasonHistory) ? s.seasonHistory : [];

      if (s.seasonReview) {
        s.seasonHistory.unshift(Object.assign({}, s.seasonReview, {
          savedAt: new Date(G.state.date).toISOString()
        }));
        s.seasonHistory = s.seasonHistory.slice(0, 12);
      }

      s.season = Number(s.season || 2026) + 1;
      s.seasonReview = null;
      s.seasonStats = { matches:0,wins:0,draws:0,losses:0,goalsFor:0,goalsAgainst:0,trophies:[],objectiveProgress:0 };
      s.lastUnifiedDay = null;
      s._economyLastDay = null;
      s.matches = [];
      s.results = [];
      s.standings = {points:0,played:0,wins:0,draws:0,losses:0,gf:0,ga:0};
      s.officialFixtures = [];
      s._registeredResults = {};
      s.simulatedRounds = {};
      s._simulatedFixtures = {};
      s.competition = s.competition || {};
      s.competition.current = null;
      s.competitions = {};
      s.competitionTables = {};
      s.leagueTables = {};
      if (window.CompetitionCore) CompetitionCore.init(G);

      G.addNews("🗓️ Nova temporada", "A temporada " + s.season + " começou. O histórico anterior foi arquivado e as competições foram reiniciadas.", "TEMPORADA");
      G.addMail("Diretoria", "Planejamento da nova temporada", "O calendário, as tabelas e os objetivos da temporada " + s.season + " estão prontos para novo ciclo.", "TEMPORADA");
      this.syncMirrors(G);
      return s.season;
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

    settleTransferBan(G) {
      if (!this.requireAccess(G, "regularização do transfer ban")) return false;
      const s = this.init(G);
      const debt = Number(s.transferMarket?.transferBanDebt || 21500000);
      if (!s.club || Number(s.club.cash || 0) < debt) {
        G.addNews("⛔ Transfer Ban mantido", "O caixa disponível não cobre a dívida de registro.", "JURÍDICO");
        return false;
      }
      s.club.cash -= debt;
      s.finance.expenses += debt;
      s.transferMarket.transferBanDebt = 0;
      s.transferMarket.transferBan = false;
      s.transferMarket.activeBans = 0;
      s.transferMarket.canRegisterPlayers = true;
      s.club.transferBan = false;
      G.addNews("✅ Transfer Ban resolvido", "A dívida de registro foi quitada e o clube pode voltar a registrar reforços.", "MERCADO");
      G.addMail("Jurídico", "Registro liberado", "O bloqueio de registro foi encerrado após a quitação do compromisso.", "JURÍDICO");
      return true;
    },

    autoLineup(G) {
      if (!this.requireAccess(G, "escalação")) return false;
      this.prepareSquad(G);
      const available = G.state.squad.filter(p => !p.injured && !p.suspended).sort((a,b) => (b.overall||0) - (a.overall||0)).slice(0,11);
      if (available.length < 11) return false;
      G.state.lineup = {};
      available.forEach((p,i) => G.state.lineup[i] = p.id);
      G.state.bench = G.state.squad.filter(p => !available.includes(p) && !p.injured && !p.suspended).sort((a,b)=>(b.overall||0)-(a.overall||0)).slice(0,9).map(p=>p.id);
      G.addNews("📋 Escalação automática", "Os 11 jogadores disponíveis de maior avaliação foram selecionados.", "FUTEBOL");
      return true;
    },

    startNextMatch(G) {
      if (!this.requireAccess(G, "partida")) return false;
      const s = this.init(G);
      let fixture = (s.matches || []).find(m => !m.played && (m.status === "scheduled" || m.status === "pre_match"));
      if (!fixture && window.CompetitionCore && CompetitionCore.onDay) {
        CompetitionCore.onDay(G);
        fixture = (s.matches || []).find(m => !m.played && (m.status === "scheduled" || m.status === "pre_match"));
      }
      if (!fixture) {
        G.addNews("📅 Nenhuma partida", "Não há partida oficial disponível para iniciar na data atual.", "CALENDÁRIO");
        return false;
      }
      this.beforeMatch(G, fixture);
      G.startMatchday(fixture);
      return true;
    },

    sellPlayer(G, playerId, fee) {
      if (!this.requireAccess(G, "venda de jogador")) return false;
      const s = this.init(G);
      const p = s.squad.find(x => String(x.id) === String(playerId));
      if (!p) return false;
      const value = Math.max(100000, Number(fee || p.marketValue || 1000000));
      s.club.cash = Number(s.club.cash || 0) + value;
      s.finance.revenue += value;
      s.market.completed.push({ type:"sale", playerId:p.id, player:p.name, fee:value, date:G.formatDate() });
      s.squad = s.squad.filter(x => x !== p);
      delete s.lineup[Object.keys(s.lineup).find(k => s.lineup[k] === p.id)];
      G.addNews("💰 Venda concluída", p.name + " foi vendido por R$ " + value.toLocaleString("pt-BR") + ".", "MERCADO");
      return true;
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
        const fixtureIdBefore = G.state.matchEngine && G.state.matchEngine.fixtureId;
        const result = originalFinish();
        if (before) {
          const fixture = (G.state.matches || []).find(m => m.status === "played" && String(m.id) === String(fixtureIdBefore));
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

    // Guarda de segurança: derrota eleitoral remove autoridade de gestão.
    [
      "boardManagement", "footballManagement", "scouting", "manageTransfers",
      "transferPlayer", "buyPlayer", "sellPlayer", "manageFinance",
      "financeManagement", "manageContracts", "manageSquad", "setLineup",
      "openMarket", "negotiateTransfer"
    ].forEach(function(name) {
      if (typeof G[name] !== "function" || G[name].__managementGuard) return;
      const original = G[name].bind(G);
      const guarded = function() {
        if (!Core.requireAccess(G, name)) return false;
        return original.apply(G, arguments);
      };
      guarded.__managementGuard = true;
      G[name] = guarded;
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();

/* Staff impact layer */
if(window.Game){window.Game.runScouting=function(focus){return window.StaffCore&&StaffCore.scout?StaffCore.scout(Game,focus):[];};window.Game.getStaffImpact=function(){return window.StaffCore&&StaffCore.recalc?StaffCore.recalc(Game):null;};}
if(!window.StaffCore){window.StaffCore={
 init:function(G){var s=G.state;s.staffModel=s.staffModel||{trainingBonus:0,scoutingBonus:0,leadershipBonus:0,baseBonus:0};s.scouting=s.scouting||{focus:"geral",reports:[]};return s;},
 active:function(){return(window.STAFF||[]).filter(function(x){return x.status==="ativo"&&x.club==="corinthians";});},
 metric:function(d,k){var a=this.active().filter(function(x){return x.department===d;});if(!a.length)return 0;return Math.round(a.reduce(function(n,x){return n+Number(x[k]||0);},0)/a.length);},
 recalc:function(G){var s=this.init(G);s.staffModel.trainingBonus=Math.round((this.metric("comissao_tecnica","experience")+this.metric("comissao_tecnica","leadership"))/20);s.staffModel.scoutingBonus=Math.round((this.metric("scouting","scouting")+this.metric("scouting","experience"))/20);s.staffModel.leadershipBonus=Math.round(this.metric("futebol_profissional","leadership")/20);s.staffModel.baseBonus=Math.round((this.metric("base","scouting")+this.metric("base","experience"))/20);return s.staffModel;},
 develop:function(G){var s=this.recalc(G);(s.squad||[]).forEach(function(p){if(p.status!=="elenco"&&p.status!=="base")return;var age=Number(p.age||25),pot=Number(p.potential||p.overall||60),gain=age<=23?.12+s.staffModel.baseBonus/100:age<=27?.08+s.staffModel.trainingBonus/100:0;if(Number(p.overall||0)<pot&&gain){p.developmentXP=Number(p.developmentXP||0)+gain;if(p.developmentXP>=1){p.overall=Math.min(pot,Number(p.overall||0)+1);p.developmentXP-=1;p.form=Math.min(100,Number(p.form||70)+2);}}});},
 scout:function(G,focus){var s=this.init(G);s.scouting.focus=focus||"geral";var source=(window.PLAYERS||[]).filter(function(p){return p.club!=="corinthians"&&p.status!=="vendido";}).sort(function(a,b){return Number(b.potential||b.overall||0)-Number(a.potential||a.overall||0);}).slice(0,5);var reports=source.map(function(p){return{playerId:p.id,name:p.name,position:p.position,overall:p.overall,potential:p.potential,confidence:Math.min(99,60+(s.staffModel.scoutingBonus||0)*3),date:G.formatDate()};});s.scouting.reports=reports.concat(s.scouting.reports||[]).slice(0,30);if(G.addNews)G.addNews("Scouting","Novo relatório com "+reports.length+" jogadores.","SCOUTING");return reports;},
 tick:function(G){var s=this.init(G);this.recalc(G);if(new Date(G.state.date).getDate()===1)this.develop(G);}
};}
