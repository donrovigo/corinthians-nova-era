const TransferMarket = {

  // =========================================================
  // ESTADO
  // =========================================================

  activeDeals: [],
  completedDeals: [],
  transferWindowOpen: true,


  // =========================================================
  // VERIFICAR JANELA
  // =========================================================

  isWindowOpen() {

    return this.transferWindowOpen;

  },


  // =========================================================
  // VERIFICAR TRANSFER BAN
  // =========================================================

  canRegisterNewPlayer() {

    if (!window.FINANCE) {
      return false;
    }

    return FINANCE.canRegisterPlayer();

  },


  // =========================================================
  // COMPRAR JOGADOR
  // =========================================================

  buyPlayer(data) {

    if (!data) {

      return {
        success: false,
        message: "Dados da transferência não informados."
      };

    }


    const playerName =
      data.playerName ||
      "Jogador";


    // -------------------------------------------------------
    // TRANSFER BAN
    // -------------------------------------------------------

    if (!this.canRegisterNewPlayer()) {

      Game.log(
        `❌ TRANSFERÊNCIA BLOQUEADA: ${playerName}. Transfer ban ativo.`
      );


      return {

        success: false,

        reason: "transfer_ban",

        message:
          "O clube não pode registrar novos jogadores enquanto houver transfer ban ativo."

      };

    }


    // -------------------------------------------------------
    // JANELA
    // -------------------------------------------------------

    if (!this.isWindowOpen()) {

      return {

        success: false,

        reason: "window_closed",

        message:
          "A janela de transferências está fechada."

      };

    }


    const transferFee =
      Number(data.transferFee || 0);


    const salary =
      Number(data.salary || 0);


    // -------------------------------------------------------
    // VERIFICAR CAIXA
    // -------------------------------------------------------

    const financialCheck =
      FINANCE.canAffordTransfer(
        transferFee,
        salary
      );


    if (!financialCheck.allowed) {

      Game.log(
        `❌ TRANSFERÊNCIA BLOQUEADA: ${playerName} — ${financialCheck.reason}`
      );


      return {

        success: false,

        reason: "finance",

        message:
          financialCheck.reason

      };

    }


    // -------------------------------------------------------
    // ORÇAMENTO DE FUTEBOL
    // -------------------------------------------------------

    if (
      FINANCE.state.transferBudget > 0 &&
      transferFee >
      FINANCE.state.transferBudget
    ) {

      return {

        success: false,

        reason: "budget",

        message:
          "O valor ultrapassa o orçamento disponível para transferências."

      };

    }


    // -------------------------------------------------------
    // PAGAMENTO
    // -------------------------------------------------------

    FINANCE.addExpense(
      transferFee,
      "transferExpenses",
      `Compra de ${playerName}`
    );


    if (
      FINANCE.state.transferBudget > 0
    ) {

      FINANCE.useTransferBudget(
        transferFee
      );

    }


    // -------------------------------------------------------
    // CRIAR JOGADOR
    // -------------------------------------------------------

    const player = {

      id:
        data.playerId ||
        `player_${Date.now()}`,

      name:
        playerName,

      position:
        data.position ||
        "N/A",

      age:
        data.age ||
        23,

      overall:
        data.overall ||
        70,

      potential:
        data.potential ||
        data.overall ||
        75,

      salary,

      marketValue:
        data.marketValue ||
        transferFee,

      contractUntil:
        data.contractUntil ||
        "2030-12-31",

      status:
        "elenco",

      club:
        "corinthians",

      origin:
        data.club ||
        "Mercado",

      acquisitionValue:
        transferFee

    };


    if (
      !window.PLAYERS
    ) {

      window.PLAYERS = [];

    }


    PLAYERS.push(
      player
    );


    // -------------------------------------------------------
    // NEGOCIAÇÃO
    // -------------------------------------------------------

    const deal = {

      id:
        `deal_${Date.now()}`,

      type:
        "compra",

      playerId:
        player.id,

      playerName:
        player.name,

      seller:
        data.club ||
        "Clube vendedor",

      value:
        transferFee,

      salary,

      date:
        new Date(
          Game.state.date
        ).toISOString(),

      status:
        "concluida"

    };


    this.completedDeals.push(
      deal
    );


    // -------------------------------------------------------
    // RECALCULAR FOLHA
    // -------------------------------------------------------

    FINANCE.calculatePayroll();


    FINANCE.syncGameState();


    Game.log(
      `✅ CONTRATAÇÃO: ${playerName} por ${formatFinanceMoney(transferFee)}.`
    );


    Game.change(
      "fanMood",
      3
    );


    Game.change(
      "reputation",
      1
    );


    return {

      success: true,

      player,

      deal

    };

  },


  // =========================================================
  // VENDA DE JOGADOR
  // =========================================================

  sellPlayer(data) {

    if (!data) {

      return {

        success: false,

        message:
          "Dados da venda não informados."

      };

    }


    const player =
      PLAYERS.find(
        item =>
          item.id === data.playerId
      );


    if (!player) {

      return {

        success: false,

        message:
          "Jogador não encontrado."

      };

    }


    const saleValue =
      Number(
        data.saleValue || 0
      );


    if (
      saleValue <= 0
    ) {

      return {

        success: false,

        message:
          "Valor de venda inválido."

      };

    }


    // -------------------------------------------------------
    // REMOVER DO ELENCO
    // -------------------------------------------------------

    player.status =
      "vendido";


    player.club =
      data.destinationClub ||
      "outro_clube";


    // -------------------------------------------------------
    // RECEITA
    // -------------------------------------------------------

    FINANCE.registerPlayerSale(
      saleValue,
      player.name
    );


    // -------------------------------------------------------
    // REGISTRAR NEGÓCIO
    // -------------------------------------------------------

    const deal = {

      id:
        `sale_${Date.now()}`,

      type:
        "venda",

      playerId:
        player.id,

      playerName:
        player.name,

      buyer:
        data.destinationClub ||
        "Clube comprador",

      value:
        saleValue,

      date:
        new Date(
          Game.state.date
        ).toISOString(),

      status:
        "concluida"

    };


    this.completedDeals.push(
      deal
    );


    FINANCE.calculatePayroll();


    FINANCE.syncGameState();


    Game.log(
      `💰 VENDA CONCLUÍDA: ${player.name} por ${formatFinanceMoney(saleValue)}.`
    );


    Game.change(
      "reputation",
      2
    );


    return {

      success: true,

      player,

      deal

    };

  },


  // =========================================================
  // EMPRÉSTIMO
  // =========================================================

  loanPlayer(data) {

    const player =
      PLAYERS.find(
        item =>
          item.id === data.playerId
      );


    if (!player) {

      return {

        success: false,

        message:
          "Jogador não encontrado."

      };

    }


    player.status =
      "emprestado";


    player.club =
      data.destinationClub ||
      "outro_clube";


    const loanFee =
      Number(
        data.loanFee || 0
      );


    if (
      loanFee > 0
    ) {

      FINANCE.addRevenue(

        loanFee,

        "playerSalesRevenue",

        `Empréstimo de ${player.name}`

      );

    }


    FINANCE.calculatePayroll();


    const deal = {

      id:
        `loan_${Date.now()}`,

      type:
        "emprestimo",

      playerId:
        player.id,

      playerName:
        player.name,

      destination:
        player.club,

      loanFee,

      salaryShare:
        data.salaryShare || 0,

      endDate:
        data.endDate || null,

      date:
        new Date(
          Game.state.date
        ).toISOString(),

      status:
        "concluido"

    };


    this.completedDeals.push(
      deal
    );


    Game.log(
      `EMPRÉSTIMO: ${player.name} → ${player.club}`
    );


    return {

      success: true,

      player,

      deal

    };

  },


  // =========================================================
  // DEVOLVER JOGADOR DE EMPRÉSTIMO
  // =========================================================

  returnLoanedPlayer(
    playerId
  ) {

    const player =
      PLAYERS.find(
        item =>
          item.id === playerId
      );


    if (!player) {
      return false;
    }


    player.status =
      "elenco";


    player.club =
      "corinthians";


    Game.log(
      `RETORNO DE EMPRÉSTIMO: ${player.name}`
    );


    FINANCE.calculatePayroll();


    return true;

  },


  // =========================================================
  // RENOVAÇÃO
  // =========================================================

  renewPlayerContract(data) {

    const player =
      PLAYERS.find(
        item =>
          item.id === data.playerId
      );


    if (!player) {

      return {

        success: false,

        message:
          "Jogador não encontrado."

      };

    }


    const newSalary =
      Number(
        data.salary ||
        player.salary
      );


    const newContract =
      data.contractUntil ||
      player.contractUntil;


    player.salary =
      newSalary;


    player.contractUntil =
      newContract;


    FINANCE.calculatePayroll();


    Game.log(
      `🔄 CONTRATO RENOVADO: ${player.name} até ${newContract}.`
    );


    Game.change(
      "dressingRoomMorale",
      2
    );


    return {

      success: true,

      player

    };

  },


  // =========================================================
  // CONSULTAR JOGADORES
  // =========================================================

  getSquad() {

    if (!window.PLAYERS) {
      return [];
    }


    return PLAYERS.filter(
      player =>
        player.club === "corinthians" &&
        (
          player.status === "elenco" ||
          player.status === "base"
        )
    );

  },


  // =========================================================
  // JOGADORES VENDIDOS
  // =========================================================

  getSoldPlayers() {

    if (!window.PLAYERS) {
      return [];
    }


    return PLAYERS.filter(
      player =>
        player.status === "vendido"
    );

  },


  // =========================================================
  // HISTÓRICO
  // =========================================================

  getHistory() {

    return [
      ...this.completedDeals
    ];

  },


  // =========================================================
  // ABRIR JANELA
  // =========================================================

  openWindow() {

    this.transferWindowOpen =
      true;


    Game.log(
      "📅 JANELA DE TRANSFERÊNCIAS ABERTA."
    );

  },


  // =========================================================
  // FECHAR JANELA
  // =========================================================

  closeWindow() {

    this.transferWindowOpen =
      false;


    Game.log(
      "📅 JANELA DE TRANSFERÊNCIAS FECHADA."
    );

  },


  // =========================================================
  // RESUMO DO MERCADO
  // =========================================================

  getSummary() {

    const squad =
      this.getSquad();


    const totalMarketValue =
      squad.reduce(
        (total, player) =>
          total +
          Number(
            player.marketValue || 0
          ),
        0
      );


    const totalPayroll =
      squad.reduce(
        (total, player) =>
          total +
          Number(
            player.salary || 0
          ),
        0
      );


    return {

      squadSize:
        squad.length,

      totalMarketValue,

      totalPayroll,

      transferBan:
        !this.canRegisterNewPlayer(),

      activeDeals:
        this.activeDeals.length,

      completedDeals:
        this.completedDeals.length

    };

  }

};


// =========================================================
// EXPORTAÇÃO
// =========================================================

window.TransferMarket =
  TransferMarket;

// Integrated with CareerCore/SquadCore through Game state.
