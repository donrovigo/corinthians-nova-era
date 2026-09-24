const FINANCE = {

  // =========================================================
  // CONFIGURAÇÃO FINANCEIRA
  // =========================================================

  state: {

    cash: 0,

    debt: 2800000000,

    monthlyRevenue: 0,

    monthlyExpenses: 0,

    payroll: 0,

    transferBudget: 0,

    sponsorshipRevenue: 0,

    matchdayRevenue: 0,

    mediaRevenue: 0,

    prizeRevenue: 0,

    playerSalesRevenue: 0,

    academyRevenue: 0,

    transferExpenses: 0,

    operatingExpenses: 0,

    debtPayments: 0,

    imageRightsPending: 0,

    salaryPending: 0,

    bonusesPending: 0,

    transferBanDebt: 21500000,

    transferBans: [

      {
        id: "ban_philadelphia",
        creditor: "Philadelphia Union",
        amount: 7540000,
        active: true
      },

      {
        id: "ban_midtjylland",
        creditor: "FC Midtjylland",
        amount: 6000000,
        active: true
      },

      {
        id: "ban_cnrd",
        creditor: "CNRD",
        amount: 8000000,
        active: true
      }

    ],

    history: [],

    monthlyHistory: []

  },


  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  initialize() {

    if (
      window.CLUB &&
      CLUB.finance
    ) {

      this.state.cash =
        CLUB.finance.cash || 0;

      this.state.debt =
        CLUB.finance.debt || 2800000000;

      this.state.transferBanDebt =
        CLUB.finance.transferMarket?.banDebt ||
        21500000;

    }


    this.calculatePayroll();

    this.updateMonthlyRevenue();

    this.syncGameState();

  },


  // =========================================================
  // FOLHA SALARIAL
  // =========================================================

  calculatePayroll() {

    let total = 0;


    if (
      window.PLAYERS &&
      Array.isArray(PLAYERS)
    ) {

      PLAYERS.forEach(
        player => {

          if (
            player.status === "elenco" &&
            player.salary
          ) {

            total +=
              Number(player.salary);

          }

        }
      );

    }


    if (
      window.STAFF &&
      Array.isArray(STAFF)
    ) {

      STAFF.forEach(
        staff => {

          if (
            staff.salary
          ) {

            total +=
              Number(staff.salary);

          }

        }
      );

    }


    this.state.payroll =
      total;


    return total;

  },


  // =========================================================
  // RECEITAS MENSAIS
  // =========================================================

  updateMonthlyRevenue() {

    this.state.monthlyRevenue =

      this.state.sponsorshipRevenue +

      this.state.matchdayRevenue +

      this.state.mediaRevenue +

      this.state.prizeRevenue +

      this.state.playerSalesRevenue +

      this.state.academyRevenue;

  },


  // =========================================================
  // DESPESAS MENSAIS
  // =========================================================

  calculateMonthlyExpenses() {

    this.state.monthlyExpenses =

      this.state.payroll +

      this.state.operatingExpenses +

      this.state.debtPayments;

    return this.state.monthlyExpenses;

  },


  // =========================================================
  // FLUXO DE CAIXA
  // =========================================================

  calculateCashFlow() {

    this.updateMonthlyRevenue();

    this.calculateMonthlyExpenses();


    return (
      this.state.monthlyRevenue -
      this.state.monthlyExpenses
    );

  },


  // =========================================================
  // ENTRADA DE DINHEIRO
  // =========================================================

  addRevenue(
    amount,
    category,
    description = ""
  ) {

    amount =
      Number(amount) || 0;


    if (amount <= 0) {
      return false;
    }


    this.state.cash += amount;


    if (
      this.state[category] !== undefined
    ) {

      this.state[category] += amount;

    }


    this.recordTransaction({

      type: "receita",

      category,

      amount,

      description

    });


    this.syncGameState();


    return true;

  },


  // =========================================================
  // DESPESA
  // =========================================================

  addExpense(
    amount,
    category,
    description = ""
  ) {

    amount =
      Number(amount) || 0;


    if (amount <= 0) {
      return false;
    }


    this.state.cash -= amount;


    if (
      this.state[category] !== undefined
    ) {

      this.state[category] += amount;

    }


    this.recordTransaction({

      type: "despesa",

      category,

      amount,

      description

    });


    this.syncGameState();


    return true;

  },


  // =========================================================
  // PAGAMENTO DE SALÁRIOS
  // =========================================================

  paySalaries() {

    const amount =
      this.state.payroll;


    if (
      this.state.cash < amount
    ) {

      this.state.salaryPending +=
        amount;


      Game.log(
        "⚠️ Caixa insuficiente para pagar toda a folha salarial."
      );


      return {

        success: false,

        amount

      };

    }


    this.state.cash -= amount;


    this.recordTransaction({

      type: "despesa",

      category: "payroll",

      amount,

      description:
        "Pagamento da folha salarial"

    });


    this.state.salaryPending = 0;


    Game.log(
      "Folha salarial paga."
    );


    this.syncGameState();


    return {

      success: true,

      amount

    };

  },


  // =========================================================
  // DIREITOS DE IMAGEM
  // =========================================================

  payImageRights(amount) {

    amount =
      Number(amount) || 0;


    if (
      amount <= 0
    ) {

      return false;

    }


    if (
      this.state.cash < amount
    ) {

      this.state.imageRightsPending +=
        amount;


      Game.log(
        "⚠️ Caixa insuficiente para quitar os direitos de imagem."
      );


      return false;

    }


    this.state.cash -= amount;


    this.state.imageRightsPending =
      Math.max(
        0,
        this.state.imageRightsPending -
          amount
      );


    this.recordTransaction({

      type: "despesa",

      category: "imageRights",

      amount,

      description:
        "Pagamento de direitos de imagem"

    });


    this.syncGameState();


    return true;

  },


  // =========================================================
  // TRANSFER BAN
  // =========================================================

  getActiveTransferBans() {

    return this.state.transferBans
      .filter(
        ban => ban.active
      );

  },


  canRegisterPlayer() {

    return (
      this.getActiveTransferBans()
        .length === 0
    );

  },


  payTransferBan(
    banId
  ) {

    const ban =
      this.state.transferBans
        .find(
          item =>
            item.id === banId
        );


    if (!ban) {

      return {

        success: false,

        message:
          "Transfer ban não encontrado."

      };

    }


    if (!ban.active) {

      return {

        success: false,

        message:
          "Este transfer ban já foi quitado."

      };

    }


    if (
      this.state.cash <
      ban.amount
    ) {

      Game.log(
        `⚠️ Caixa insuficiente para quitar a dívida com ${ban.creditor}.`
      );


      return {

        success: false,

        message:
          "Caixa insuficiente."

      };

    }


    this.state.cash -=
      ban.amount;


    ban.active = false;


    this.state.transferBanDebt =
      Math.max(
        0,
        this.state.transferBanDebt -
          ban.amount
      );


    this.recordTransaction({

      type: "despesa",

      category: "transferBan",

      amount: ban.amount,

      description:
        `Quitação — ${ban.creditor}`

    });


    Game.log(
      `TRANSFER BAN QUITADO: ${ban.creditor}`
    );


    this.syncGameState();


    return {

      success: true,

      message:
        `Dívida com ${ban.creditor} quitada.`

    };

  },


  // =========================================================
  // CONTRATAÇÃO
  // =========================================================

  canAffordContract(
    signingFee,
    salary,
    months = 12
  ) {

    const totalCost =

      Number(signingFee || 0) +

      Number(salary || 0) *
        months;


    return (
      this.state.cash >=
      totalCost
    );

  },


  // =========================================================
  // COMPRA DE JOGADOR
  // =========================================================

  canAffordTransfer(
    transferFee,
    salary
  ) {

    if (
      !this.canRegisterPlayer()
    ) {

      return {

        allowed: false,

        reason:
          "O clube possui transfer ban ativo."

      };

    }


    const required =
      Number(transferFee || 0) +
      Number(salary || 0) * 6;


    if (
      this.state.cash <
      required
    ) {

      return {

        allowed: false,

        reason:
          "Caixa insuficiente."

      };

    }


    return {

      allowed: true,

      reason:
        "Operação financeiramente possível."

    };

  },


  // =========================================================
  // VENDA DE JOGADOR
  // =========================================================

  registerPlayerSale(
    amount,
    playerName
  ) {

    amount =
      Number(amount) || 0;


    if (
      amount <= 0
    ) {

      return false;

    }


    this.state.cash +=
      amount;


    this.state.playerSalesRevenue +=
      amount;


    this.recordTransaction({

      type: "receita",

      category:
        "playerSalesRevenue",

      amount,

      description:
        `Venda de ${playerName}`

    });


    Game.log(
      `💰 VENDA: ${playerName} gerou ${formatMoney(amount)}.`
    );


    this.syncGameState();


    return true;

  },


  // =========================================================
  // PATROCÍNIO
  // =========================================================

  registerSponsorship(
    amount,
    company
  ) {

    amount =
      Number(amount) || 0;


    this.state.sponsorshipRevenue +=
      amount;


    this.updateMonthlyRevenue();


    Game.log(
      `NOVO PATROCÍNIO: ${company}`
    );


    return true;

  },


  // =========================================================
  // EMPRÉSTIMO
  // =========================================================

  takeLoan(
    amount,
    interestRate = 0.12,
    description = "Empréstimo"
  ) {

    amount =
      Number(amount) || 0;


    if (
      amount <= 0
    ) {

      return false;

    }


    const debtCreated =
      amount *
      (1 + interestRate);


    this.state.cash +=
      amount;


    this.state.debt +=
      debtCreated;


    this.recordTransaction({

      type: "entrada_financeira",

      category: "loan",

      amount,

      description

    });


    Game.log(
      `🏦 Empréstimo contratado: ${formatMoney(amount)}`
    );


    this.syncGameState();


    return true;

  },


  // =========================================================
  // PAGAMENTO DE DÍVIDA
  // =========================================================

  payDebt(amount) {

    amount =
      Number(amount) || 0;


    if (
      amount <= 0 ||
      this.state.cash <
      amount
    ) {

      return false;

    }


    this.state.cash -=
      amount;


    this.state.debt =
      Math.max(
        0,
        this.state.debt -
          amount
      );


    this.state.debtPayments +=
      amount;


    this.recordTransaction({

      type: "despesa",

      category:
        "debtPayments",

      amount,

      description:
        "Pagamento de dívida"

    });


    Game.log(
      `DÍVIDA REDUZIDA EM ${formatMoney(amount)}`
    );


    this.syncGameState();


    return true;

  },


  // =========================================================
  // RESULTADO DO MÊS
  // =========================================================

  closeMonth() {

    const revenue =
      this.state.monthlyRevenue;


    const expenses =
      this.calculateMonthlyExpenses();


    const result =
      revenue -
      expenses;


    this.state.cash +=
      result;


    this.state.monthlyHistory.push({

      date:
        new Date(
          Game.state.date
        ).toISOString(),

      revenue,

      expenses,

      result,

      cash:
        this.state.cash,

      debt:
        this.state.debt

    });


    Game.log(

      `FECHAMENTO MENSAL: ` +

      `receitas ${formatMoney(revenue)}, ` +

      `despesas ${formatMoney(expenses)}, ` +

      `resultado ${formatMoney(result)}.`

    );


    this.syncGameState();


    return {

      revenue,

      expenses,

      result

    };

  },


  // =========================================================
  // REGISTRAR TRANSAÇÃO
  // =========================================================

  recordTransaction(
    transaction
  ) {

    this.state.history.push({

      ...transaction,

      date:
        new Date(
          Game.state.date
        ).toISOString()

    });


    // Mantém histórico controlado
    if (
      this.state.history.length >
      500
    ) {

      this.state.history.shift();

    }

  },


  // =========================================================
  // SAÚDE FINANCEIRA
  // =========================================================

  getFinancialHealth() {

    const cash =
      this.state.cash;


    const debt =
      this.state.debt;


    const pending =

      this.state.imageRightsPending +

      this.state.salaryPending +

      this.state.bonusesPending;


    if (
      cash < 0
    ) {

      return "critica";

    }


    if (
      pending > 20000000
    ) {

      return "muito_fragil";

    }


    if (
      pending > 5000000
    ) {

      return "fragil";

    }


    if (
      debt > 3000000000
    ) {

      return "endividado";

    }


    if (
      cash > 100000000
    ) {

      return "estavel";

    }


    return "atencao";

  },


  // =========================================================
  // ORÇAMENTO DE FUTEBOL
  // =========================================================

  setTransferBudget(
    amount
  ) {

    amount =
      Number(amount) || 0;


    this.state.transferBudget =
      amount;


    Game.log(
      `Orçamento do futebol definido em ${formatMoney(amount)}.`
    );


    this.syncGameState();

  },


  useTransferBudget(
    amount
  ) {

    amount =
      Number(amount) || 0;


    if (
      amount >
      this.state.transferBudget
    ) {

      return false;

    }


    this.state.transferBudget -=
      amount;


    return true;

  },


  // =========================================================
  // SINCRONIZAÇÃO COM GAME
  // =========================================================

  syncGameState() {

    if (!window.Game) {
      return;
    }


    Game.state.money =
      this.state.cash;


    if (
      Game.state.club
    ) {

      Game.state.club.cash =
        this.state.cash;

      Game.state.club.debt =
        this.state.debt;

      Game.state.club.transferBan =
        !this.canRegisterPlayer();

    }


    // Saúde financeira influencia reputação
    const health =
      this.getFinancialHealth();


    if (
      health === "critica"
    ) {

      Game.state.pressPressure =
        Math.min(
          100,
          Game.state.pressPressure + 1
        );

    }

  }

};


// =========================================================
// FUNÇÕES AUXILIARES
// =========================================================

function formatFinanceMoney(
  value
) {

  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    }
  ).format(
    Number(value) || 0
  );

}


// =========================================================
// EXPORTAÇÃO
// =========================================================

window.FINANCE =
  FINANCE;

window.formatFinanceMoney =
  formatFinanceMoney;
