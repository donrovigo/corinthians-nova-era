const PlayerOffers = {

  active: [],
  history: [],

  create({
    playerId,
    club,
    type = "compra",
    amount = 0,
    installments = 1,
    bonus = 0,
    sellOnPercentage = 0,
    loanFee = 0,
    salaryShare = 100,
    optionToBuy = false,
    purchaseOptionValue = 0,
    deadline = null,
    reason = "interesse de mercado"
  }) {

    const player = PLAYERS.find(
      p => p.id === playerId
    );

    if (!player) {
      return {
        success: false,
        message: "Jogador não encontrado."
      };
    }

    if (player.club !== "corinthians") {
      return {
        success: false,
        message: "O jogador não pertence ao Corinthians."
      };
    }

    const offer = {
      id: `offer_${Date.now()}_${Math.floor(Math.random() * 1000)}`,

      playerId,
      playerName: player.name,

      club,

      type,

      amount: Number(amount),
      installments: Number(installments),

      bonus: Number(bonus),

      sellOnPercentage: Number(
        sellOnPercentage
      ),

      loanFee: Number(loanFee),
      salaryShare: Number(salaryShare),

      optionToBuy: Boolean(optionToBuy),
      purchaseOptionValue: Number(
        purchaseOptionValue
      ),

      deadline,

      reason,

      status: "pendente",

      createdAt: Game.state.date.toISOString()
    };

    this.active.push(offer);

    Game.log(
      `Nova proposta recebida por ${player.name}: ${club}.`
    );

    Game.change("pressPressure", 2);

    return {
      success: true,
      offer
    };
  },

  get(offerId) {

    return this.active.find(
      offer => offer.id === offerId
    );
  },

  getForPlayer(playerId) {

    return this.active.filter(
      offer =>
        offer.playerId === playerId &&
        offer.status === "pendente"
    );
  },

  getPending() {

    return this.active.filter(
      offer => offer.status === "pendente"
    );
  },

  counter(offerId, changes = {}) {

    const offer = this.get(offerId);

    if (!offer) {
      return {
        success: false,
        message: "Proposta não encontrada."
      };
    }

    if (offer.status !== "pendente") {
      return {
        success: false,
        message: "Esta proposta não está mais disponível."
      };
    }

    Object.keys(changes).forEach(key => {

      if (
        Object.prototype.hasOwnProperty.call(
          offer,
          key
        )
      ) {

        offer[key] = changes[key];

      }

    });

    offer.status = "contraproposta";

    Game.log(
      `Contraproposta enviada para ${offer.club} por ${offer.playerName}.`
    );

    return {
      success: true,
      offer
    };
  },

  accept(offerId) {

    const offer = this.get(offerId);

    if (!offer) {
      return {
        success: false,
        message: "Proposta não encontrada."
      };
    }

    if (
      offer.status !== "pendente" &&
      offer.status !== "contraproposta"
    ) {
      return {
        success: false,
        message: "Esta proposta não pode mais ser aceita."
      };
    }

    const player = PLAYERS.find(
      p => p.id === offer.playerId
    );

    if (!player) {
      return {
        success: false,
        message: "Jogador não encontrado."
      };
    }

    if (offer.type === "compra") {

      const revenue = offer.amount + offer.bonus;

      FINANCE.addRevenue(
        revenue,
        "playerSalesRevenue",
        `Venda de ${player.name} para ${offer.club}`
      );

      player.club = offer.club;
      player.status = "vendido";

      player.saleDate =
        Game.state.date.toISOString();

      player.saleValue = offer.amount;

      player.sellOnPercentage =
        offer.sellOnPercentage;

      offer.status = "aceita";

      Game.log(
        `${player.name} vendido para ${offer.club} por ${formatMoney(offer.amount)}.`
      );

      Game.change("fanMood", -3);
      Game.change("reputation", 1);

      FINANCE.calculatePayroll();

      this.finishOffer(offer);

      return {
        success: true,
        player: player.name,
        value: offer.amount
      };
    }

    if (offer.type === "emprestimo") {

      offer.status = "aceita";

      Game.log(
        `Empréstimo de ${player.name} para ${offer.club} aceito.`
      );

      const loanResult = Loans.createLoan({

        playerId: player.id,

        fromClub: "corinthians",

        toClub: offer.club,

        startDate:
          Game.state.date.toISOString(),

        endDate:
          offer.deadline ||
          "2027-06-30",

        salaryShare:
          offer.salaryShare,

        loanFee:
          offer.loanFee,

        optionToBuy:
          offer.optionToBuy,

        purchaseOptionValue:
          offer.purchaseOptionValue
      });

      if (!loanResult.success) {

        offer.status = "pendente";

        return {
          success: false,
          message: loanResult.message
        };
      }

      this.finishOffer(offer);

      return {
        success: true,
        player: player.name,
        loan: loanResult.loan
      };
    }

    return {
      success: false,
      message: "Tipo de proposta desconhecido."
    };
  },

  reject(offerId, reason = "proposta recusada") {

    const offer = this.get(offerId);

    if (!offer) {
      return {
        success: false,
        message: "Proposta não encontrada."
      };
    }

    offer.status = "recusada";
    offer.rejectionReason = reason;

    Game.log(
      `Proposta de ${offer.club} por ${offer.playerName} recusada.`
    );

    this.finishOffer(offer);

    return {
      success: true
    };
  },

  withdraw(offerId) {

    const offer = this.get(offerId);

    if (!offer) {
      return {
        success: false,
        message: "Proposta não encontrada."
      };
    }

    offer.status = "retirada";

    Game.log(
      `${offer.club} retirou a proposta por ${offer.playerName}.`
    );

    this.finishOffer(offer);

    return {
      success: true
    };
  },

  finishOffer(offer) {

    this.history.push({
      ...offer,
      finishedAt:
        Game.state.date.toISOString()
    });

    this.active = this.active.filter(
      item => item.id !== offer.id
    );
  },

  generateRandomOffer() {

    const squad = PLAYERS.filter(
      player =>
        player.club === "corinthians" &&
        player.status === "elenco"
    );

    if (!squad.length) {
      return null;
    }

    const player =
      squad[
        Math.floor(
          Math.random() * squad.length
        )
      ];

    const clubs = [

      "Nottingham Forest",

      "Besiktas",

      "FC Porto",

      "Benfica",

      "Fenerbahce",

      "Galatasaray",

      "Atalanta",

      "Fiorentina",

      "Monaco",

      "Lyon",

      "Villarreal",

      "Real Betis",

      "Al Hilal",

      "Al Nassr",

      "Al Ain",

      "Flamengo",

      "Palmeiras",

      "Atlético-MG",

      "Cruzeiro"

    ];

    const club =
      clubs[
        Math.floor(
          Math.random() * clubs.length
        )
      ];

    const marketValue =
      Number(player.marketValue || 0);

    const variation =
      0.65 +
      Math.random() * 0.75;

    const amount =
      Math.round(
        (marketValue * variation) /
        100000
      ) * 100000;

    const typeRoll =
      Math.random();

    if (typeRoll < 0.75) {

      return this.create({

        playerId: player.id,

        club,

        type: "compra",

        amount,

        installments:
          Math.random() < 0.5
            ? 1
            : 2 + Math.floor(
                Math.random() * 4
              ),

        bonus:
          Math.random() < 0.35
            ? Math.round(
                amount * 0.1
              )
            : 0,

        sellOnPercentage:
          Math.random() < 0.3
            ? 10 + Math.floor(
                Math.random() * 21
              )
            : 0,

        reason:
          "observação de mercado"

      });

    }

    return this.create({

      playerId: player.id,

      club,

      type: "emprestimo",

      amount: 0,

      loanFee:
        Math.round(
          marketValue * 0.03
        ),

      salaryShare:
        50 +
        Math.floor(
          Math.random() * 51
        ),

      optionToBuy: true,

      purchaseOptionValue:
        Math.round(
          marketValue * 1.15
        ),

      deadline: "2027-06-30",

      reason:
        "interesse em empréstimo"

    });
  },

  checkMarketActivity() {

    if (
      Math.random() > 0.18
    ) {
      return null;
    }

    return this.generateRandomOffer();
  },

  advanceDay() {

    const pending =
      this.getPending();

    pending.forEach(offer => {

      if (!offer.deadline) {
        return;
      }

      const deadline =
        new Date(offer.deadline);

      const today =
        new Date(Game.state.date);

      if (today > deadline) {

        offer.status = "expirada";

        Game.log(
          `A proposta de ${offer.club} por ${offer.playerName} expirou.`
        );

        this.finishOffer(offer);
      }

    });

    this.checkMarketActivity();
  },

  getSummary() {

    return {

      pending:
        this.getPending().length,

      history:
        this.history.length,

      active:
        this.active.length

    };
  }
};

window.PlayerOffers = PlayerOffers;
