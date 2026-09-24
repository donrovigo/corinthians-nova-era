const DELEGATION_STATUS = {
  ACTIVE: "ativa",
  COMPLETED: "concluida",
  FAILED: "fracassada",
  CANCELLED: "cancelada"
};


const DELEGATION_TYPES = {
  SCOUTING: "scouting",
  TRANSFER: "transferencia",
  CONTRACT: "contrato",
  SPONSOR: "patrocinio",
  FINANCE: "financeiro",
  ACADEMY: "base",
  POLITICAL: "politica"
};


const Delegation = {

  active: [],
  history: [],


  // =========================================================
  // CRIAR MISSÃO
  // =========================================================

  create(data) {

    const staff =
      window.getStaffById
        ? window.getStaffById(data.staffId)
        : null;


    if (!staff) {

      Game.log(
        "Não foi possível criar a delegação: funcionário não encontrado."
      );

      return null;
    }


    const delegation = {

      id:
        data.id ||
        `delegation_${Date.now()}_${Math.floor(Math.random() * 1000)}`,

      type:
        data.type ||
        DELEGATION_TYPES.SCOUTING,

      staffId:
        staff.id,

      staffName:
        staff.name,

      title:
        data.title ||
        "Missão delegada",

      instructions:
        data.instructions ||
        "",

      budget:
        data.budget ||
        0,

      spent:
        0,

      createdAt:
        new Date(Game.state.date).toISOString(),

      deadline:
        data.deadline ||
        null,

      duration:
        data.duration ||
        7,

      daysRemaining:
        data.duration ||
        7,

      status:
        DELEGATION_STATUS.ACTIVE,

      priority:
        data.priority ||
        "normal",

      autonomy:
        data.autonomy ??
        staff.autonomy ??
        50,

      risk:
        data.risk ??
        5,

      progress:
        0,

      findings:
        [],

      candidates:
        [],

      surprises:
        [],

      notes:
        [],

      metadata:
        data.metadata ||
        {}

    };


    this.active.push(delegation);


    Game.log(
      `MISSÃO DELEGADA: ${staff.name} recebeu "${delegation.title}".`
    );


    return delegation;
  },


  // =========================================================
  // BUSCAR
  // =========================================================

  getById(id) {

    return this.active.find(
      item => item.id === id
    );

  },


  getActive() {

    return this.active.filter(
      item =>
        item.status === DELEGATION_STATUS.ACTIVE
    );

  },


  // =========================================================
  // AVANÇAR UM DIA
  // =========================================================

  advanceDay() {

    const missions =
      [...this.active];


    missions.forEach(
      delegation => {

        if (
          delegation.status !==
          DELEGATION_STATUS.ACTIVE
        ) {
          return;
        }


        delegation.daysRemaining--;


        const totalDays =
          delegation.duration || 1;


        delegation.progress =
          Math.min(
            100,
            Math.round(
              ((totalDays - delegation.daysRemaining) /
                totalDays) *
                100
            )
          );


        // Pequena chance de encontrar algo antes do fim
        if (
          Math.random() < 0.18
        ) {

          this.generateFinding(
            delegation
          );

        }


        // Possibilidade de surpresa
        if (
          Math.random() <
          (delegation.risk / 1000)
        ) {

          this.generateSurprise(
            delegation
          );

        }


        if (
          delegation.daysRemaining <= 0
        ) {

          this.complete(
            delegation.id
          );

        }

      }
    );

  },


  // =========================================================
  // DESCOBERTA
  // =========================================================

  generateFinding(delegation) {

    const findings = {

      scouting: [
        "Scout encontrou um jogador dentro do perfil solicitado.",
        "Foi identificado um atleta disponível por empréstimo.",
        "Um jogador jovem chamou atenção durante a análise.",
        "Um clube demonstrou abertura para negociar um atleta."
      ],

      transferencia: [
        "O clube vendedor demonstrou abertura para conversar.",
        "O empresário sinalizou interesse no projeto.",
        "Foi identificada possibilidade de empréstimo.",
        "O valor inicial pedido está acima do orçamento."
      ],

      contrato: [
        "O empresário apresentou novas exigências.",
        "O jogador demonstrou interesse em renovar.",
        "A duração do contrato virou ponto de discussão."
      ],

      patrocinio: [
        "Uma empresa demonstrou interesse comercial.",
        "O patrocinador pediu informações adicionais.",
        "Foi identificada uma possível nova oportunidade comercial."
      ],

      financeiro: [
        "Foi encontrada uma possibilidade de renegociação.",
        "Um credor demonstrou abertura para novo acordo.",
        "O departamento identificou uma despesa que pode ser reduzida."
      ],

      base: [
        "Um jogador da base chamou atenção.",
        "Scout identificou um atleta jovem com potencial.",
        "A comissão técnica pediu acompanhamento adicional."
      ],

      politica: [
        "Um conselheiro demonstrou disposição para conversar.",
        "Um grupo político sinalizou interesse em uma reunião.",
        "Foi identificada uma mudança no equilíbrio de forças."
      ]

    };


    const options =
      findings[delegation.type] ||
      findings.scouting;


    const finding =
      options[
        Math.floor(
          Math.random() * options.length
        )
      ];


    delegation.findings.push({

      date:
        new Date(Game.state.date).toISOString(),

      text:
        finding

    });

  },


  // =========================================================
  // SURPRESA
  // =========================================================

  generateSurprise(delegation) {

    const surprises = [

      {
        text:
          "O alvo principal mudou de ideia e deixou de estar disponível.",
        impact:
          "negative"
      },

      {
        text:
          "Um novo nome apareceu e pode ser melhor que o alvo original.",
        impact:
          "positive"
      },

      {
        text:
          "O empresário aumentou as exigências financeiras.",
        impact:
          "negative"
      },

      {
        text:
          "Outro clube entrou na disputa.",
        impact:
          "negative"
      },

      {
        text:
          "Uma oportunidade inesperada surgiu durante a negociação.",
        impact:
          "positive"
      }

    ];


    const surprise =
      surprises[
        Math.floor(
          Math.random() *
          surprises.length
        )
      ];


    delegation.surprises.push({

      date:
        new Date(Game.state.date).toISOString(),

      text:
        surprise.text,

      impact:
        surprise.impact

    });


    Game.log(
      `SURPRESA NA MISSÃO: ${surprise.text}`
    );

  },


  // =========================================================
  // CONCLUIR
  // =========================================================

  complete(id) {

    const delegation =
      this.getById(id);


    if (!delegation) {
      return null;
    }


    delegation.status =
      DELEGATION_STATUS.COMPLETED;


    delegation.progress =
      100;


    delegation.daysRemaining =
      0;


    this.generateFinalReport(
      delegation
    );


    this.active =
      this.active.filter(
        item =>
          item.id !== delegation.id
      );


    this.history.push(
      structuredClone(
        delegation
      )
    );


    Game.log(
      `MISSÃO CONCLUÍDA: ${delegation.title}`
    );


    return delegation;
  },


  // =========================================================
  // RELATÓRIO FINAL
  // =========================================================

  generateFinalReport(delegation) {

    const staff =
      window.getStaffById
        ? window.getStaffById(
            delegation.staffId
          )
        : null;


    const staffQuality =
      staff
        ? (
            (staff.reputation || 50) +
            (staff.experience || 50) +
            (staff.scouting || 50) +
            (staff.negotiation || 50)
          ) / 4
        : 50;


    const successChance =
      Math.min(
        90,
        Math.max(
          10,
          staffQuality +
          delegation.autonomy * 0.15 -
          delegation.risk * 0.2
        )
      );


    const success =
      Math.random() * 100 <=
      successChance;


    if (success) {

      delegation.notes.push(
        "A missão apresentou resultados considerados satisfatórios."
      );


      delegation.progress =
        100;

    } else {

      delegation.notes.push(
        "A missão não encontrou uma solução satisfatória dentro das condições estabelecidas."
      );

    }


    // =====================================================
    // RESULTADOS ESPECÍFICOS
    // =====================================================

    if (
      delegation.type ===
      DELEGATION_TYPES.SCOUTING
    ) {

      this.generateScoutingCandidates(
        delegation,
        success
      );

    }


    if (
      delegation.type ===
      DELEGATION_TYPES.TRANSFER
    ) {

      this.generateTransferOptions(
        delegation,
        success
      );

    }


    if (
      delegation.type ===
      DELEGATION_TYPES.CONTRACT
    ) {

      this.generateContractResult(
        delegation,
        success
      );

    }


    if (
      delegation.type ===
      DELEGATION_TYPES.POLITICAL
    ) {

      this.generatePoliticalResult(
        delegation,
        success
      );

    }

  },


  // =========================================================
  // SCOUT
  // =========================================================

  generateScoutingCandidates(
    delegation,
    success
  ) {

    if (!success) {
      return;
    }


    const positions =
      delegation.metadata.positions ||
      ["ZAG"];


    const amount =
      delegation.metadata.amount ||
      positions.length;


    for (
      let i = 0;
      i < amount;
      i++
    ) {

      const position =
        positions[
          i % positions.length
        ];


      const age =
        20 +
        Math.floor(
          Math.random() * 10
        );


      const overall =
        68 +
        Math.floor(
          Math.random() * 10
        );


      const potential =
        overall +
        4 +
        Math.floor(
          Math.random() * 10
        );


      const marketValue =
        (5 + Math.random() * 20) *
        1000000;


      delegation.candidates.push({

        id:
          `scout_${Date.now()}_${i}`,

        name:
          "Jogador identificado pelo scout",

        position,

        age,

        overall,

        potential,

        marketValue:
          Math.round(
            marketValue
          ),

        salary:
          Math.round(
            (250000 +
              Math.random() *
              450000) /
              1000
          ) *
          1000,

        availability:
          Math.random() > 0.35
            ? "negociavel"
            : "dificil",

        source:
          "rede de scouting"

      });

    }

  },


  // =========================================================
  // TRANSFERÊNCIA
  // =========================================================

  generateTransferOptions(
    delegation,
    success
  ) {

    if (!success) {
      return;
    }


    const player =
      delegation.metadata.player ||
      null;


    delegation.candidates.push({

      player:
        player,

      type:
        Math.random() > 0.5
          ? "emprestimo"
          : "compra",

      estimatedValue:
        delegation.budget
          ? Math.round(
              delegation.budget *
              (0.35 +
                Math.random() *
                0.55)
            )
          : 0,

      salary:
        Math.round(
          (250000 +
            Math.random() *
            500000) /
            1000
        ) *
        1000,

      negotiationRequired:
        true

    });

  },


  // =========================================================
  // CONTRATO
  // =========================================================

  generateContractResult(
    delegation,
    success
  ) {

    delegation.notes.push(

      success

        ? "O jogador demonstrou disposição para avançar na renovação."

        : "O empresário não aceitou as condições inicialmente apresentadas."

    );

  },


  // =========================================================
  // POLÍTICA
  // =========================================================

  generatePoliticalResult(
    delegation,
    success
  ) {

    if (success) {

      delegation.notes.push(
        "A articulação abriu espaço para uma nova conversa política."
      );


      Game.change(
        "politicalSupport",
        3
      );

    } else {

      delegation.notes.push(
        "A articulação não produziu o apoio esperado."
      );

    }

  },


  // =========================================================
  // CANCELAR
  // =========================================================

  cancel(id) {

    const delegation =
      this.getById(id);


    if (!delegation) {
      return false;
    }


    delegation.status =
      DELEGATION_STATUS.CANCELLED;


    this.active =
      this.active.filter(
        item =>
          item.id !== id
      );


    this.history.push(
      structuredClone(
        delegation
      )
    );


    Game.log(
      `MISSÃO CANCELADA: ${delegation.title}`
    );


    return true;

  },


  // =========================================================
  // RELATÓRIO
  // =========================================================

  getReport(id) {

    const active =
      this.getById(id);


    if (active) {
      return active;
    }


    return this.history.find(
      item =>
        item.id === id
    );

  }

};


// =========================================================
// FUNÇÃO SIMPLIFICADA PARA A INTERFACE
// =========================================================

function createDelegatedMission(
  staffId,
  type,
  title,
  instructions,
  options = {}
) {

  return Delegation.create({

    staffId,

    type,

    title,

    instructions,

    budget:
      options.budget || 0,

    duration:
      options.duration || 7,

    deadline:
      options.deadline || null,

    priority:
      options.priority || "normal",

    risk:
      options.risk || 5,

    metadata:
      options.metadata || {}

  });

}


// =========================================================
// EXPORTAÇÃO
// =========================================================

window.DELEGATION_STATUS =
  DELEGATION_STATUS;

window.DELEGATION_TYPES =
  DELEGATION_TYPES;

window.Delegation =
  Delegation;

window.createDelegatedMission =
  createDelegatedMission;
