const NEGOTIATION_TYPES = {
  PLAYER_TRANSFER: "transferencia_jogador",
  PLAYER_CONTRACT: "contrato_jogador",
  STAFF_CONTRACT: "contrato_staff",
  SPONSOR: "patrocinio",
  POLITICAL: "politica"
};


const NEGOTIATION_STATUS = {
  OPEN: "aberta",
  COUNTER: "contraproposta",
  ACCEPTED: "aceita",
  REJECTED: "recusada",
  EXPIRED: "expirada",
  CANCELLED: "cancelada"
};


const Negotiations = {

  active: [],

  history: [],


  // =========================================================
  // CRIAR NEGOCIAÇÃO
  // =========================================================

  create(data) {

    const negotiation = {

      id:
        data.id ||
        `neg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,

      type: data.type || NEGOTIATION_TYPES.PLAYER_TRANSFER,

      title: data.title || "Nova negociação",

      party:
        data.party ||
        "Parte não identificada",

      subject:
        data.subject ||
        "Negociação",

      status: NEGOTIATION_STATUS.OPEN,

      createdAt:
        Game.state.date.toISOString(),

      deadline:
        data.deadline || null,

      secrecy:
        data.secrecy || "internal",

      value:
        data.value || 0,

      salary:
        data.salary || 0,

      counterValue:
        null,

      counterSalary:
        null,

      rounds: 0,

      maxRounds:
        data.maxRounds || 5,

      acceptanceChance:
        data.acceptanceChance ?? 50,

      leakRisk:
        data.leakRisk ?? 5,

      notes:
        data.notes || "",

      metadata:
        data.metadata || {}

    };


    this.active.push(negotiation);

    Game.log(
      `NEGOCIAÇÃO ABERTA: ${negotiation.title}`
    );

    return negotiation;
  },


  // =========================================================
  // BUSCAR
  // =========================================================

  getById(id) {

    return this.active.find(
      negotiation => negotiation.id === id
    );

  },


  getActive() {

    return this.active.filter(
      negotiation =>
        negotiation.status === NEGOTIATION_STATUS.OPEN ||
        negotiation.status === NEGOTIATION_STATUS.COUNTER
    );

  },


  // =========================================================
  // CONTRAPROPOSTA
  // =========================================================

  counter(id, data) {

    const negotiation = this.getById(id);

    if (!negotiation) {
      return {
        success: false,
        message: "Negociação não encontrada."
      };
    }


    if (
      negotiation.status !== NEGOTIATION_STATUS.OPEN &&
      negotiation.status !== NEGOTIATION_STATUS.COUNTER
    ) {
      return {
        success: false,
        message: "Esta negociação não está mais aberta."
      };
    }


    negotiation.rounds++;

    negotiation.counterValue =
      data.value ?? negotiation.value;

    negotiation.counterSalary =
      data.salary ?? negotiation.salary;

    negotiation.status =
      NEGOTIATION_STATUS.COUNTER;


    negotiation.leakRisk +=
      data.additionalLeakRisk || 1;


    Game.log(
      `CONTRAPROPOSTA: ${negotiation.title}`
    );


    if (
      negotiation.rounds >= negotiation.maxRounds
    ) {

      negotiation.status =
        NEGOTIATION_STATUS.REJECTED;

      this.finish(negotiation);

      return {
        success: false,
        message:
          "A negociação atingiu o limite de rodadas e foi encerrada."
      };

    }


    return {
      success: true,
      negotiation
    };

  },


  // =========================================================
  // DECISÃO DA OUTRA PARTE
  // =========================================================

  resolve(id) {

    const negotiation = this.getById(id);

    if (!negotiation) {
      return null;
    }


    const random =
      Math.random() * 100;


    let chance =
      negotiation.acceptanceChance;


    // Reputação influencia relações
    chance +=
      (Game.state.reputation - 50) * 0.15;


    // Muitas rodadas desgastam
    chance -=
      negotiation.rounds * 4;


    // Vazamento pode prejudicar
    if (
      negotiation.leakRisk > 25
    ) {
      chance -= 5;
    }


    if (random <= chance) {

      negotiation.status =
        NEGOTIATION_STATUS.ACCEPTED;

      this.finish(negotiation);

      return {
        accepted: true,
        negotiation
      };

    }


    negotiation.status =
      NEGOTIATION_STATUS.REJECTED;

    this.finish(negotiation);

    return {
      accepted: false,
      negotiation
    };

  },


  // =========================================================
  // FINALIZAR
  // =========================================================

  finish(negotiation) {

    const index =
      this.active.findIndex(
        item => item.id === negotiation.id
      );


    if (index !== -1) {

      this.active.splice(index, 1);

    }


    this.history.push(
      structuredClone(negotiation)
    );


    let statusText =
      negotiation.status;


    Game.log(
      `NEGOCIAÇÃO ENCERRADA: ${negotiation.title} — ${statusText}`
    );

  },


  // =========================================================
  // CANCELAR
  // =========================================================

  cancel(id, reason = "") {

    const negotiation =
      this.getById(id);

    if (!negotiation) {
      return false;
    }


    negotiation.status =
      NEGOTIATION_STATUS.CANCELLED;

    negotiation.notes +=
      ` ${reason}`;


    this.finish(negotiation);

    return true;

  },


  // =========================================================
  // CHECAR PRAZOS
  // =========================================================

  checkDeadlines() {

    const currentDate =
      new Date(Game.state.date);


    this.active.forEach(
      negotiation => {

        if (!negotiation.deadline) {
          return;
        }


        const deadline =
          new Date(negotiation.deadline);


        if (
          currentDate > deadline
        ) {

          negotiation.status =
            NEGOTIATION_STATUS.EXPIRED;

          this.finish(negotiation);

        }

      }
    );

  },


  // =========================================================
  // RISCO DE VAZAMENTO
  // =========================================================

  checkLeak(negotiation) {

    if (!negotiation) {
      return false;
    }


    const risk =
      negotiation.leakRisk;


    const random =
      Math.random() * 100;


    if (random <= risk) {

      Game.state.leakRisk += 5;


      Game.log(
        `🚨 POSSÍVEL VAZAMENTO: ${negotiation.title}`
      );


      return true;

    }


    return false;

  },


  // =========================================================
  // TRANSFERÊNCIA DE JOGADOR
  // =========================================================

  createPlayerTransfer(data) {

    return this.create({

      type:
        NEGOTIATION_TYPES.PLAYER_TRANSFER,

      title:
        `Negociação por ${data.playerName}`,

      party:
        data.club || "Clube vendedor",

      subject:
        data.playerName,

      value:
        data.value || 0,

      salary:
        data.salary || 0,

      acceptanceChance:
        data.acceptanceChance ?? 50,

      secrecy:
        data.secrecy || "reserved",

      leakRisk:
        data.leakRisk ?? 8,

      maxRounds:
        data.maxRounds || 4,

      deadline:
        data.deadline || null,

      metadata: {

        playerId:
          data.playerId || null,

        playerName:
          data.playerName,

        position:
          data.position || null,

        age:
          data.age || null,

        overall:
          data.overall || null

      }

    });

  },


  // =========================================================
  // CONTRATO DE JOGADOR
  // =========================================================

  createPlayerContract(data) {

    return this.create({

      type:
        NEGOTIATION_TYPES.PLAYER_CONTRACT,

      title:
        `Renovação de ${data.playerName}`,

      party:
        data.agent || "Empresário",

      subject:
        data.playerName,

      value:
        data.signingBonus || 0,

      salary:
        data.salary || 0,

      acceptanceChance:
        data.acceptanceChance ?? 60,

      secrecy:
        data.secrecy || "internal",

      leakRisk:
        data.leakRisk ?? 5,

      maxRounds:
        data.maxRounds || 5,

      deadline:
        data.deadline || null,

      metadata: {

        playerId:
          data.playerId || null,

        duration:
          data.duration || 0

      }

    });

  },


  // =========================================================
  // PATROCÍNIO
  // =========================================================

  createSponsor(data) {

    return this.create({

      type:
        NEGOTIATION_TYPES.SPONSOR,

      title:
        `Patrocínio — ${data.companyName}`,

      party:
        data.companyName,

      subject:
        "Contrato de patrocínio",

      value:
        data.value || 0,

      acceptanceChance:
        data.acceptanceChance ?? 50,

      secrecy:
        data.secrecy || "reserved",

      leakRisk:
        data.leakRisk ?? 4,

      maxRounds:
        data.maxRounds || 6,

      deadline:
        data.deadline || null,

      metadata: {

        companyName:
          data.companyName,

        duration:
          data.duration || 0,

        activation:
          data.activation || []

      }

    });

  },


  // =========================================================
  // POLÍTICA
  // =========================================================

  createPolitical(data) {

    return this.create({

      type:
        NEGOTIATION_TYPES.POLITICAL,

      title:
        data.title || "Articulação política",

      party:
        data.group || "Grupo político",

      subject:
        data.subject || "Apoio político",

      value:
        0,

      acceptanceChance:
        data.acceptanceChance ?? 50,

      secrecy:
        data.secrecy || "confidential",

      leakRisk:
        data.leakRisk ?? 10,

      maxRounds:
        data.maxRounds || 5,

      deadline:
        data.deadline || null,

      metadata: {

        group:
          data.group || null,

        requested:
          data.requested || [],

        offered:
          data.offered || []

      }

    });

  }

};


// =========================================================
// DELEGAÇÃO
// =========================================================

function delegateNegotiation(staffId, instructions) {

  const staff =
    window.getStaffById
      ? getStaffById(staffId)
      : null;


  if (!staff) {

    Game.log(
      "Não foi possível localizar o membro da comissão."
    );

    return null;

  }


  const delegation = {

    id:
      `delegation_${Date.now()}`,

    staffId,

    staffName:
      staff.name,

    instructions,

    createdAt:
      Game.state.date.toISOString(),

    status:
      "em_andamento",

    returnDate:
      null

  };


  Game.log(
    `DELEGAÇÃO: ${staff.name} recebeu uma missão.`
  );


  return delegation;

}


// =========================================================
// EXPORTAÇÃO
// =========================================================

window.NEGOTIATION_TYPES =
  NEGOTIATION_TYPES;

window.NEGOTIATION_STATUS =
  NEGOTIATION_STATUS;

window.Negotiations =
  Negotiations;

window.delegateNegotiation =
  delegateNegotiation;
