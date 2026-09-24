const Loans = {

  active: [],
  history: [],

  createLoan({
    playerId,
    fromClub,
    toClub,
    startDate,
    endDate,
    salaryShare = 100,
    loanFee = 0,
    optionToBuy = false,
    purchaseOptionValue = 0
  }) {

    const player = PLAYERS.find(p => p.id === playerId);

    if (!player) {
      return {
        success: false,
        message: "Jogador não encontrado."
      };
    }

    if (this.isLoaned(playerId)) {
      return {
        success: false,
        message: "Este jogador já está emprestado."
      };
    }

    const loan = {
      id: `loan_${Date.now()}`,
      playerId,
      playerName: player.name,

      fromClub,
      toClub,

      startDate,
      endDate,

      salaryShare: Number(salaryShare),
      loanFee: Number(loanFee),

      optionToBuy: Boolean(optionToBuy),
      purchaseOptionValue: Number(purchaseOptionValue),

      status: "ativo",

      createdAt: new Date().toISOString()
    };

    this.active.push(loan);

    player.status = "emprestado";
    player.loanClub = toClub;
    player.loanUntil = endDate;

    if (toClub !== "corinthians") {
      player.club = toClub;
    }

    if (loan.loanFee > 0) {
      FINANCE.addRevenue(
        loan.loanFee,
        "playerSalesRevenue",
        `Taxa de empréstimo de ${player.name}`
      );
    }

    Game.log(
      `${player.name} foi emprestado para ${toClub} até ${endDate}.`
    );

    FINANCE.calculatePayroll();

    return {
      success: true,
      loan
    };
  },

  isLoaned(playerId) {

    return this.active.some(
      loan =>
        loan.playerId === playerId &&
        loan.status === "ativo"
    );
  },

  getLoan(playerId) {

    return this.active.find(
      loan =>
        loan.playerId === playerId &&
        loan.status === "ativo"
    );
  },

  getActiveLoans() {

    return this.active.filter(
      loan => loan.status === "ativo"
    );
  },

  getLoansByClub(club) {

    return this.getActiveLoans().filter(
      loan =>
        loan.fromClub === club ||
        loan.toClub === club
    );
  },

  returnPlayer(playerId, reason = "fim do empréstimo") {

    const loan = this.getLoan(playerId);

    if (!loan) {
      return {
        success: false,
        message: "Empréstimo não encontrado."
      };
    }

    const player = PLAYERS.find(
      p => p.id === playerId
    );

    if (player) {

      player.status = "elenco";

      player.club = loan.fromClub;

      delete player.loanClub;
      delete player.loanUntil;
    }

    loan.status = "encerrado";
    loan.returnReason = reason;
    loan.returnDate = Game.state.date.toISOString();

    this.history.push(loan);

    this.active = this.active.filter(
      item => item.id !== loan.id
    );

    Game.log(
      `${loan.playerName} retornou ao ${loan.fromClub}. Motivo: ${reason}.`
    );

    FINANCE.calculatePayroll();

    return {
      success: true,
      player: loan.playerName
    };
  },

  buyLoanedPlayer(playerId) {

    const loan = this.getLoan(playerId);

    if (!loan) {
      return {
        success: false,
        message: "Empréstimo não encontrado."
      };
    }

    if (!loan.optionToBuy) {
      return {
        success: false,
        message: "O empréstimo não possui opção de compra."
      };
    }

    if (loan.toClub !== "corinthians") {
      return {
        success: false,
        message: "O Corinthians não é o clube comprador desta operação."
      };
    }

    const value = loan.purchaseOptionValue;

    if (!FINANCE.canAffordTransfer(value)) {
      return {
        success: false,
        message: "O clube não possui recursos suficientes para exercer a opção."
      };
    }

    if (!FINANCE.useTransferBudget(value)) {
      return {
        success: false,
        message: "Orçamento de transferências insuficiente."
      };
    }

    FINANCE.addExpense(
      value,
      "transferExpenses",
      `Compra definitiva de ${loan.playerName}`
    );

    const player = PLAYERS.find(
      p => p.id === playerId
    );

    if (player) {

      player.club = "corinthians";
      player.status = "elenco";

      delete player.loanClub;
      delete player.loanUntil;
    }

    loan.status = "comprado";
    loan.purchaseDate = Game.state.date.toISOString();

    this.history.push(loan);

    this.active = this.active.filter(
      item => item.id !== loan.id
    );

    Game.log(
      `${loan.playerName} foi contratado em definitivo por ${formatMoney(value)}.`
    );

    FINANCE.calculatePayroll();

    Game.change("fanMood", 4);
    Game.change("reputation", 2);

    return {
      success: true,
      player: loan.playerName,
      value
    };
  },

  rejectPurchase(playerId) {

    const loan = this.getLoan(playerId);

    if (!loan) {
      return {
        success: false,
        message: "Empréstimo não encontrado."
      };
    }

    if (!loan.optionToBuy) {
      return {
        success: false,
        message: "Não existe opção de compra neste empréstimo."
      };
    }

    Game.log(
      `O Corinthians decidiu não exercer a opção de compra de ${loan.playerName}.`
    );

    return this.returnPlayer(
      playerId,
      "opção de compra não exercida"
    );
  },

  advanceDay() {

    const today = new Date(Game.state.date);

    const expired = this.getActiveLoans().filter(loan => {

      const end = new Date(loan.endDate);

      return today >= end;
    });

    expired.forEach(loan => {

      if (
        loan.optionToBuy &&
        loan.toClub === "corinthians"
      ) {

        Game.log(
          `Empréstimo de ${loan.playerName} terminou. A diretoria precisa decidir se exerce a opção de compra.`
        );

        return;
      }

      this.returnPlayer(
        loan.playerId,
        "fim do empréstimo"
      );
    });
  },

  getPlayerLoans(playerId) {

    return [
      ...this.active.filter(
        loan => loan.playerId === playerId
      ),

      ...this.history.filter(
        loan => loan.playerId === playerId
      )
    ];
  },

  getSummary() {

    return {
      active: this.getActiveLoans().length,

      incoming: this.getActiveLoans().filter(
        loan => loan.toClub === "corinthians"
      ).length,

      outgoing: this.getActiveLoans().filter(
        loan => loan.fromClub === "corinthians"
      ).length,

      history: this.history.length
    };
  }
};

window.Loans = Loans;
