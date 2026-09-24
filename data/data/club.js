const CLUB = {

  // =========================================================
  // IDENTIDADE
  // =========================================================

  id: "corinthians",

  name: "Sport Club Corinthians Paulista",

  shortName: "Corinthians",

  nickname: "Timão",

  country: "Brasil",

  state: "São Paulo",

  city: "São Paulo",

  stadium: "Neo Química Arena",

  trainingCenter: "CT Joaquim Grava",


  // =========================================================
  // TEMPORADA
  // =========================================================

  season: 2026,

  startDate: "2026-01-01",

  electionDate: "2026-11-28",

  possibleElectionDate: "2026-12-05",

  electionCondition:
    "A eleição poderá ser transferida para 05/12 caso o Corinthians dispute a final da Libertadores.",


  // =========================================================
  // SITUAÇÃO FINANCEIRA
  // =========================================================

  finances: {

    cash: 0,

    availableBudget: 0,

    transferBudget: 0,

    wageBudget: 0,

    monthlyPayroll: 0,

    revenue: 0,

    debt: 2800000000,

    firstSemesterDeficit: 246039000,

    imageRightsPending: true,

    salaryPaymentsDelayed: true,

    prizeMoneyPending: true,

    financialHealth: 18

  },


  // =========================================================
  // MERCADO
  // =========================================================

  transferMarket: {

    transferBan: true,

    activeBans: 3,

    transferBanDebt: 21500000,

    canRegisterPlayers: false,

    canNegotiatePlayers: true,

    canRenewContracts: true,

    canSellPlayers: true,

    windowOpen: false

  },


  // =========================================================
  // ELENCO
  // =========================================================

  squad: {

    professionalPlayers: 0,

    injuredPlayers: 0,

    suspendedPlayers: 0,

    playersExpiringContract: 10,

    foreignPlayers: 0,

    averageAge: 0,

    squadDepth: 45,

    squadQuality: 68,

    dressingRoomMorale: 60

  },


  // =========================================================
  // FUTEBOL
  // =========================================================

  football: {

    coach: "Fernando Diniz",

    executive: "Marcelo Paz",

    sportingDirectorAutonomy: 70,

    coachAutonomy: 80,

    squadPlanning: 45,

    youthIntegration: 55,

    scoutingQuality: 60,

    medicalDepartment: 55,

    performanceDepartment: 60

  },


  // =========================================================
  // POLÍTICA
  // =========================================================

  politics: {

    president: "Osmar Stábile",

    presidentTerm: "2025-2026",

    councilTrust: 20,

    politicalStability: 35,

    oppositionStrength: 70,

    boardUnity: 35,

    councilInfluence: 50,

    fanPoliticalPressure: 70,

    electionConfirmed: true,

    electionCandidates: [

      "Sérgio Janikian",

      "André Oliveira",

      "José Augusto Mendes",

      "Rozallah Santoro",

      "Osmar Stábile",

      "Miriam Athiê",

      "André Castro"

    ]

  },


  // =========================================================
  // TORCIDA
  // =========================================================

  fans: {

    mood: 35,

    patience: 25,

    trustInBoard: 20,

    trustInCoach: 45,

    expectation: 75,

    pressure: 85,

    attendance: 75,

    socialMediaPressure: 80

  },


  // =========================================================
  // IMPRENSA
  // =========================================================

  media: {

    pressure: 80,

    attention: 90,

    positiveCoverage: 30,

    negativeCoverage: 70,

    leaks: 0,

    journalistRelations: 50

  },


  // =========================================================
  // INFRAESTRUTURA
  // =========================================================

  infrastructure: {

    stadiumQuality: 88,

    trainingCenterQuality: 82,

    academyInfrastructure: 72,

    medicalInfrastructure: 68,

    scoutingInfrastructure: 65,

    analyticsInfrastructure: 60

  },


  // =========================================================
  // CATEGORIAS DE BASE
  // =========================================================

  academy: {

    reputation: 82,

    scoutingNetwork: 75,

    developmentQuality: 78,

    youthPipeline: 80,

    u20Quality: 72,

    u17Quality: 75,

    playersReadyForProfessional: 4

  },


  // =========================================================
  // COMPETIÇÕES
  // =========================================================

  competitions: {

    paulista: {

      name: "Campeonato Paulista",

      active: true,

      importance: 70,

      objective: "competir"

    },

    brasileirao: {

      name: "Campeonato Brasileiro",

      active: true,

      importance: 95,

      objective: "classificacao_libertadores"

    },

    libertadores: {

      name: "CONMEBOL Libertadores",

      active: true,

      importance: 100,

      objective: "avancar_fases"

    },

    copaDoBrasil: {

      name: "Copa do Brasil",

      active: true,

      importance: 90,

      objective: "titulo"

    }

  },


  // =========================================================
  // OBJETIVOS DA TEMPORADA
  // =========================================================

  objectives: {

    sporting: [

      "competir_por_titulos",

      "classificar_para_libertadores",

      "avancar_na_libertadores",

      "melhorar_desempenho"

    ],

    financial: [

      "reduzir_deficit",

      "manter_salarios_em_dia",

      "resolver_transfer_bans",

      "renegociar_dividas"

    ],

    institutional: [

      "reduzir_crise_politica",

      "aumentar_transparencia",

      "melhorar_relacao_com_conselho",

      "melhorar_relacao_com_torcida"

    ]

  },


  // =========================================================
  // REGRAS DE SIMULAÇÃO
  // =========================================================

  simulation: {

    realism: 95,

    randomEvents: true,

    politicalEvents: true,

    financialEvents: true,

    injuryEvents: true,

    transferEvents: true,

    mediaEvents: true,

    leakEvents: true,

    contractEvents: true,

    youthEvents: true,

    boardConflicts: true,

    secretNegotiations: true,

    agentNegotiations: true

  }

};


// =========================================================
// FUNÇÕES
// =========================================================

function getClub() {

  return CLUB;

}


function getClubFinances() {

  return CLUB.finances;

}


function getClubPolitics() {

  return CLUB.politics;

}


function getClubFans() {

  return CLUB.fans;

}


function getClubFootball() {

  return CLUB.football;

}


function getClubCompetitions() {

  return CLUB.competitions;

}


// =========================================================
// EXPORTAÇÃO
// =========================================================

window.CLUB = CLUB;

window.getClub = getClub;

window.getClubFinances = getClubFinances;

window.getClubPolitics = getClubPolitics;

window.getClubFans = getClubFans;

window.getClubFootball = getClubFootball;

window.getClubCompetitions = getClubCompetitions;
