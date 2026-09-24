/* =========================================================
   ECONOMY CORE — integração de mercado, contratos e finanças
   Camada de integração: não substitui os módulos legados,
   mas mantém Game.state como fonte de verdade.
   ========================================================= */

(function () {
  "use strict";

  const EconomyCore = {
    init(G) {
      const s = G.state;
      s.finance = s.finance || {};
      s.finance.revenue = Number(s.finance.revenue || 0);
      s.finance.expenses = Number(s.finance.expenses || 0);
      s.finance.transferSpend = Number(s.finance.transferSpend || 0);
      s.finance.wageBill = Number(s.finance.wageBill || 0);
      s.finance.matchdayRevenue = Number(s.finance.matchdayRevenue || 0);
      s.finance.playerSales = Number(s.finance.playerSales || 0);
      s.finance.prizeMoney = Number(s.finance.prizeMoney || 0);
      s.finance.monthlyRevenue = Number(s.finance.monthlyRevenue || 0);
      s.finance.monthlyExpenses = Number(s.finance.monthlyExpenses || 0);
      s.finance.cashFlow = Number(s.finance.cashFlow || 0);

      s.market = s.market || {};
      s.market.shortlist = Array.isArray(s.market.shortlist) ? s.market.shortlist : [];
      s.market.offers = Array.isArray(s.market.offers) ? s.market.offers : [];
      s.market.completed = Array.isArray(s.market.completed) ? s.market.completed : [];

      s.contracts = s.contracts || {};
      s.contracts.expiring = Array.isArray(s.contracts.expiring) ? s.contracts.expiring : [];
      s.contracts.renewals = Array.isArray(s.contracts.renewals) ? s.contracts.renewals : [];
      s.contracts.expired = Array.isArray(s.contracts.expired) ? s.contracts.expired : [];

      s.transferWindow = s.transferWindow || { open: false };
      s.transferMarket = s.transferMarket || {};
      s.transferMarket.transferBan = !!(s.club && s.club.transferBan);
      s.transferMarket.transferBanDebt = Number(
        s.transferMarket.transferBanDebt ??
        (window.FINANCE && FINANCE.state ? FINANCE.state.transferBanDebt : 21500000)
      );

      return s;
    },

    access(G, label) {
      return !G.requireClubManagementAccess || G.requireClubManagementAccess(label || "esta ação");
    },

    isTransferWindowOpen(G) {
      const d = new Date(G.state.date);
      const m = d.getMonth() + 1;
      const day = d.getDate();
      return (m === 1 && day >= 5 && day <= 31) || (m === 7 && day >= 3 && day <= 31);
    },

    syncLegacy(G) {
      const s = this.init(G);
      s.transferWindow.open = this.isTransferWindowOpen(G);

      if (window.TransferMarket) {
        TransferMarket.transferWindowOpen = s.transferWindow.open;
      }

      if (window.FINANCE && FINANCE.state) {
        FINANCE.state.cash = Number(s.club && s.club.cash || FINANCE.state.cash || 0);
        FINANCE.state.debt = Number(s.club && s.club.debt || FINANCE.state.debt || 0);
        FINANCE.state.transferBudget = Number(s.finance.transferBudget || FINANCE.state.transferBudget || 0);
        s.finance.wageBill = Number(FINANCE.state.payroll || s.finance.wageBill || 0);
      }

      s.club = s.club || {};
      s.club.cash = Number(s.club.cash || 0);
      s.club.debt = Number(s.club.debt || 0);
      s.finance.cashFlow = s.finance.monthlyRevenue - s.finance.monthlyExpenses;

      return s;
    },

    importSquad(G) {
      const s = this.init(G);
      const source = Array.isArray(window.PLAYERS) ? window.PLAYERS : [];
      const currentIds = new Set((s.squad || []).map(p => String(p.id)));
      source.forEach(p => {
        if (p.club === "corinthians" && p.status === "elenco" && !currentIds.has(String(p.id))) {
          s.squad.push(p);
        }
      });
      return s.squad;
    },

    shortlist(G, player) {
      if (!this.access(G, "lista de observação")) return false;
      const s = this.init(G);
      const id = typeof player === "object" ? player.id : player;
      if (!id) return false;
      if (!s.market.shortlist.some(x => String(x.id || x) === String(id))) {
        s.market.shortlist.push(typeof player === "object" ? Object.assign({}, player) : { id: id });
      }
      return true;
    },

    offer(G, playerId, fee, salary) {
      if (!this.access(G, "negociação de mercado")) return false;
      const s = this.syncLegacy(G);
      if (!s.transferWindow.open) {
        G.addNews("🔒 Janela fechada", "A proposta não foi enviada porque a janela de transferências está fechada.", "MERCADO");
        return false;
      }
      if (s.club.transferBan) {
        G.addNews("⛔ Transfer Ban", "O clube não pode registrar reforços enquanto o bloqueio estiver ativo.", "MERCADO");
        return false;
      }

      const amount = Math.max(0, Number(fee || 0));
      const wage = Math.max(0, Number(salary || 0));
      const id = "OFF-" + Date.now();

      const offer = {
        id,
        playerId: String(playerId),
        fee: amount,
        salary: wage,
        date: G.formatDate(),
        status: "proposta"
      };

      s.market.offers.push(offer);
      G.addNews("📨 Proposta enviada", "Oferta de R$ " + amount.toLocaleString("pt-BR") + " registrada para análise.", "MERCADO");
      return offer;
    },

    acceptOffer(G, offerId, playerData) {
      if (!this.access(G, "conclusão de contratação")) return false;
      const s = this.syncLegacy(G);
      const offer = s.market.offers.find(o => String(o.id) === String(offerId) && o.status === "proposta");
      if (!offer) return false;

      if (s.club.transferBan || !s.transferWindow.open) {
        G.addNews("⛔ Contratação bloqueada", "O negócio não pode ser registrado neste momento.", "MERCADO");
        return false;
      }

      if (window.FINANCE && FINANCE.canAffordTransfer) {
        const check = FINANCE.canAffordTransfer(offer.fee, offer.salary);
        if (!check.allowed) {
          G.addNews("💸 Caixa insuficiente", check.reason || "A contratação não cabe no orçamento atual.", "FINANCEIRO");
          return false;
        }
      }

      const data = Object.assign({}, playerData || {}, {
        playerId: offer.playerId,
        transferFee: offer.fee,
        salary: offer.salary
      });

      const result = window.TransferMarket ? TransferMarket.buyPlayer(data) : { success: false };
      if (!result.success) return result;

      offer.status = "concluida";
      offer.completedDate = G.formatDate();
      s.market.completed.push({
        type: "buy",
        playerId: result.player.id,
        player: result.player.name,
        fee: offer.fee,
        date: G.formatDate()
      });

      this.importSquad(G);
      s.finance.transferSpend += offer.fee;
      s.club.cash = Math.max(-999999999999, Number(s.club.cash || 0) - offer.fee);
      this.syncLegacy(G);

      return result;
    },

    sell(G, playerId, fee, destinationClub) {
      if (!this.access(G, "venda de jogador")) return false;
      const s = this.init(G);
      const p = (s.squad || []).find(x => String(x.id) === String(playerId)) ||
        (window.PLAYERS || []).find(x => String(x.id) === String(playerId));

      if (!p) return false;

      const amount = Math.max(100000, Number(fee || p.marketValue || 1000000));
      const result = window.TransferMarket
        ? TransferMarket.sellPlayer({ playerId: p.id, saleValue: amount, destinationClub: destinationClub || "outro clube" })
        : { success: false };

      if (!result.success) return result;

      p.status = "vendido";
      p.club = destinationClub || "outro clube";
      s.squad = s.squad.filter(x => String(x.id) !== String(p.id));
      s.market.completed.push({
        type: "sale",
        playerId: p.id,
        player: p.name,
        fee: amount,
        date: G.formatDate()
      });
      s.finance.playerSales += amount;
      s.finance.revenue += amount;
      s.club.cash = Number(s.club.cash || 0) + amount;
      this.syncLegacy(G);

      G.addNews("💰 Venda concluída", p.name + " saiu por R$ " + amount.toLocaleString("pt-BR") + ".", "MERCADO");
      return result;
    },

    renew(G, playerId, salary, contractUntil) {
      if (!this.access(G, "renovação contratual")) return false;
      const s = this.init(G);
      const p = (s.squad || []).find(x => String(x.id) === String(playerId)) ||
        (window.PLAYERS || []).find(x => String(x.id) === String(playerId));
      if (!p) return false;

      const newSalary = Math.max(0, Number(salary || p.salary || 0));
      const until = contractUntil || p.contractUntil;
      if (window.FINANCE && FINANCE.canAffordContract && !FINANCE.canAffordContract(newSalary)) {
        G.addNews("💸 Renovação recusada", "A folha salarial não comporta o novo salário.", "CONTRATOS");
        return false;
      }

      const old = p.contractUntil;
      p.salary = newSalary;
      p.contractUntil = until;
      s.contracts.renewals.push({
        playerId: p.id,
        oldContract: old,
        newContract: until,
        salary: newSalary,
        date: G.formatDate()
      });

      if (window.FINANCE && FINANCE.calculatePayroll) FINANCE.calculatePayroll();
      G.addNews("📝 Contrato renovado", p.name + " renovou até " + until + ".", "CONTRATOS");
      return true;
    },

    processContracts(G) {
      const s = this.init(G);
      const today = new Date(G.state.date);
      const expiring = [];

      (s.squad || []).forEach(p => {
        if (!p.contractUntil || p.status !== "elenco") return;
        const end = new Date(p.contractUntil);
        const days = Math.ceil((end - today) / 86400000);

        if (days >= 0 && days <= 180) expiring.push(p.id);

        if (days < 0) {
          p.status = "livre";
          p.club = null;
          s.contracts.expired.push({
            playerId: p.id,
            player: p.name,
            date: G.formatDate()
          });
        }
      });

      s.contracts.expiring = Array.from(new Set(expiring));
    },

    reconcileFinance(G) {
      const s = this.init(G);
      if (window.FINANCE) {
        if (FINANCE.calculatePayroll) FINANCE.calculatePayroll();
        if (FINANCE.syncGameState) FINANCE.syncGameState();

        s.finance.wageBill = Number(FINANCE.state.payroll || 0);
        s.finance.monthlyRevenue = Number(FINANCE.state.monthlyRevenue || s.finance.monthlyRevenue || 0);
        s.finance.monthlyExpenses = Number(FINANCE.state.monthlyExpenses || s.finance.monthlyExpenses || 0);
      }

      s.club = s.club || {};
      if (window.FINANCE && FINANCE.state) {
        s.club.cash = Number(FINANCE.state.cash || s.club.cash || 0);
        s.club.debt = Number(FINANCE.state.debt || s.club.debt || 0);
      }

      return s.finance;
    },

    settleBan(G) {
      if (!this.access(G, "regularização do transfer ban")) return false;
      const s = this.init(G);
      const active = (window.FINANCE && FINANCE.state && FINANCE.state.transferBans || [])
        .filter(b => b.active);

      const debt = active.reduce((n, b) => n + Number(b.amount || 0), 0);
      if (debt <= 0) {
        s.club.transferBan = false;
        s.transferMarket.transferBan = false;
        return true;
      }

      if (Number(s.club.cash || 0) < debt) {
        G.addNews("⛔ Transfer Ban mantido", "São necessários R$ " + debt.toLocaleString("pt-BR") + " para quitar os bloqueios ativos.", "JURÍDICO");
        return false;
      }

      s.club.cash -= debt;
      s.finance.expenses += debt;

      if (window.FINANCE && FINANCE.state) {
        FINANCE.state.transferBanDebt = 0;
        FINANCE.state.transferBans.forEach(b => b.active = false);
        if (FINANCE.syncGameState) FINANCE.syncGameState();
      }

      s.transferMarket.transferBanDebt = 0;
      s.transferMarket.transferBan = false;
      s.club.transferBan = false;

      G.addNews("✅ Transfer Ban resolvido", "Todos os bloqueios de registro foram quitados.", "JURÍDICO");
      G.addMail("Jurídico", "Registro liberado", "O Corinthians voltou a ter registro de reforços liberado.", "JURÍDICO");
      return true;
    },

    day(G) {
      const s = this.syncLegacy(G);
      this.processContracts(G);
      this.reconcileFinance(G);

      const key = G.formatDate();
      if (s._economyLastDay === key) return;
      s._economyLastDay = key;

      if (s.club.cash < 0) {
        s.board.confidence = Math.max(0, Number(s.board.confidence || 0) - 1);
        s.media.pressure = Math.min(100, Number(s.media.pressure || 0) + 1);
      }

      if (s.contracts.expiring.length && [1, 15].includes(new Date(G.state.date).getDate())) {
        G.addNews("📄 Contratos em atenção", s.contracts.expiring.length + " jogador(es) entram na janela de 180 dias para vencimento.", "CONTRATOS");
      }
    },

    summary(G) {
      const s = this.reconcileFinance(G);
      return {
        cash: Number(G.state.club && G.state.club.cash || 0),
        debt: Number(G.state.club && G.state.club.debt || 0),
        payroll: Number(s.wageBill || 0),
        monthlyRevenue: Number(s.monthlyRevenue || 0),
        monthlyExpenses: Number(s.monthlyExpenses || 0),
        transferSpend: Number(s.transferSpend || 0),
        playerSales: Number(s.playerSales || 0),
        transferBan: !!(G.state.club && G.state.club.transferBan),
        windowOpen: !!G.state.transferWindow.open,
        expiringContracts: (G.state.contracts && G.state.contracts.expiring || []).length
      };
    }
  };

  window.EconomyCore = EconomyCore;

  function wire() {
    if (!window.Game) return;
    const G = window.Game;

    EconomyCore.init(G);
    EconomyCore.importSquad(G);
    EconomyCore.syncLegacy(G);

    const oldStart = G.start.bind(G);
    G.start = function (career) {
      const result = oldStart(career);
      EconomyCore.init(G);
      EconomyCore.importSquad(G);
      EconomyCore.syncLegacy(G);
      EconomyCore.reconcileFinance(G);
      return result;
    };

    const oldAdvance = G.advanceDays.bind(G);
    G.advanceDays = function (days) {
      const result = oldAdvance(days);
      EconomyCore.day(G);
      if (G.render) G.render();
      return result;
    };

    G.marketShortlist = function (player) { return EconomyCore.shortlist(G, player); };
    G.makeTransferOffer = function (playerId, fee, salary) { return EconomyCore.offer(G, playerId, fee, salary); };
    G.acceptTransferOffer = function (offerId, data) { return EconomyCore.acceptOffer(G, offerId, data); };
    G.sellPlayerIntegrated = function (playerId, fee, club) { return EconomyCore.sell(G, playerId, fee, club); };
    G.renewPlayerIntegrated = function (playerId, salary, until) { return EconomyCore.renew(G, playerId, salary, until); };
    G.settleTransferBanIntegrated = function () { return EconomyCore.settleBan(G); };
    G.getEconomySummary = function () { return EconomyCore.summary(G); };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
