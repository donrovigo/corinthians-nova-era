const POLITICS = {

  // =========================================================
  // ELEIÇÃO
  // =========================================================

  election: {

    date: "2026-11-28",

    alternativeDate: "2026-12-05",

    alternativeCondition:
      "Se o Corinthians disputar a final da Libertadores",

    status: "pre_campaign",

    presidentSeats: 1,

    vicePresidentSeats: 2,

    councilorSeats: 200,

    alternateCouncilorSeats: 50,

    currentPresident: "Osmar Stábile",

    councilPresident: "Romeu Tuma Júnior"

  },


  // =========================================================
  // GRUPOS POLÍTICOS
  // =========================================================

  groups: [

    {
      id: "group_situacao",
      name: "Situação",

      type: "governista",

      influence: 65,

      councilSupport: 70,

      fanInfluence: 35,

      mediaInfluence: 45,

      financialInfluence: 50,

      stability: 55,

      loyalty: 65,

      active: true
    },


    {
      id: "group_oposicao",
      name: "Oposição",

      type: "oposicao",

      influence: 75,

      councilSupport: 80,

      fanInfluence: 60,

      mediaInfluence: 65,

      financialInfluence: 40,

      stability: 70,

      loyalty: 45,

      active: true
    },


    {
      id: "group_independentes",
      name: "Independentes",

      type: "independente",

      influence: 55,

      councilSupport: 45,

      fanInfluence: 55,

      mediaInfluence: 40,

      financialInfluence: 45,

      stability: 35,

      loyalty: 20,

      active: true
    },


    {
      id: "group_vitalicios",
      name: "Conselheiros Vitalícios",

      type: "tradicional",

      influence: 80,

      councilSupport: 85,

      fanInfluence: 25,

      mediaInfluence: 30,

      financialInfluence: 55,

      stability: 90,

      loyalty: 75,

      active: true
    },


    {
      id: "group_movimento_corinthians_grande",
      name: "Movimento Corinthians Grande",

      type: "politico",

      influence: 60,

      councilSupport: 50,

      fanInfluence: 60,

      mediaInfluence: 50,

      financialInfluence: 45,

      stability: 45,

      loyalty: 50,

      active: true
    }

  ],


  // =========================================================
  // CANDIDATOS
  // =========================================================

  candidates: [

    {
      id: "candidate_janikian",

      name: "Sérgio Janikian",

      type: "public",

      status: "pre_candidate",

      politicalExperience: 78,

      footballExperience: 82,

      financialProfile: 65,

      councilInfluence: 55,

      fanAppeal: 50,

      mediaExposure: 55,

      coalitionPotential: 70,

      startingSupport: 15,

      group: "group_oposicao"
    },


    {
      id: "candidate_andre_negrao",

      name: "André Oliveira",

      alias: "André Negão",

      type: "public",

      status: "pre_candidate",

      politicalExperience: 90,

      footballExperience: 80,

      financialProfile: 45,

      councilInfluence: 72,

      fanAppeal: 65,

      mediaExposure: 70,

      coalitionPotential: 75,

      startingSupport: 18,

      group: "group_situacao"
    },


    {
      id: "candidate_jose_augusto",

      name: "José Augusto Mendes",

      type: "public",

      status: "pre_candidate",

      politicalExperience: 88,

      footballExperience: 65,

      financialProfile: 60,

      councilInfluence: 76,

      fanAppeal: 42,

      mediaExposure: 55,

      coalitionPotential: 65,

      startingSupport: 14,

      group: "group_vitalicios"
    },


    {
      id: "candidate_rozallah",

      name: "Rozallah Santoro",

      type: "public",

      status: "pre_candidate",

      politicalExperience: 65,

      footballExperience: 55,

      financialProfile: 92,

      councilInfluence: 58,

      fanAppeal: 48,

      mediaExposure: 62,

      coalitionPotential: 78,

      startingSupport: 16,

      group: "group_independentes"
    },


    {
      id: "candidate_osmar",

      name: "Osmar Stábile",

      type: "public",

      status: "possible_candidate",

      politicalExperience: 88,

      footballExperience: 70,

      financialProfile: 60,

      councilInfluence: 75,

      fanAppeal: 45,

      mediaExposure: 65,

      coalitionPotential: 62,

      startingSupport: 12,

      group: "group_situacao"
    },


    {
      id: "candidate_miriam",

      name: "Miriam Athiê",

      type: "public",

      status: "possible_candidate",

      politicalExperience: 78,

      footballExperience: 50,

      financialProfile: 60,

      councilInfluence: 72,

      fanAppeal: 45,

      mediaExposure: 45,

      coalitionPotential: 60,

      startingSupport: 8,

      group: "group_vitalicios"
    },


    {
      id: "candidate_andre_castro",

      name: "André Castro",

      type: "public",

      status: "possible_candidate",

      politicalExperience: 68,

      footballExperience: 45,

      financialProfile: 78,

      councilInfluence: 55,

      fanAppeal: 40,

      mediaExposure: 45,

      coalitionPotential: 70,

      startingSupport: 7,

      group: "group_independentes"
    }

  ],


  // =========================================================
  // RELAÇÕES POLÍTICAS
  // =========================================================

  relationships: {

    playerToGroups: {},

    playerToCandidates: {},

    playerToCouncilors: {},

    candidateToCandidate: {},

    groupToGroup: {}

  },


  // =========================================================
  // REGRAS DE NEGOCIAÇÃO
  // =========================================================

  negotiation: {

    public: {

      influenceGain: 3,

      leakRisk: 5

    },

    internal: {

      influenceGain: 5,

      leakRisk: 10

    },

    reserved: {

      influenceGain: 8,

      leakRisk: 18

    },

    confidential: {

      influenceGain: 12,

      leakRisk: 25

    },

    ultrasecret: {

      influenceGain: 15,

      leakRisk: 35

    }

  },


  // =========================================================
  // VARIÁVEIS POLÍTICAS
  // =========================================================

  variables: {

    politicalInfluence: 0,

    councilSupport: 0,

    oppositionPressure: 70,

    coalitionStrength: 0,

    campaignMomentum: 0,

    candidateReputation: 50,

    publicTrust: 50,

    politicalRisk: 30,

    leakRisk: 5,

    internalResistance: 40

  },


  // =========================================================
  // EVENTOS POLÍTICOS
  // =========================================================

  events: [

    {
      id: "political_001",

      title: "Conselheiro procura sua candidatura",

      type: "political",

      probability: 20,

      secrecy: "reserved",

      description:
        "Um conselheiro demonstra interesse em conversar sobre sua candidatura."

    },


    {
      id: "political_002",

      title: "Grupo oferece apoio",

      type: "coalition",

      probability: 12,

      secrecy: "confidential",

      description:
        "Um grupo político sinaliza que pode apoiar sua candidatura em troca de espaço político."

    },


    {
      id: "political_003",

      title: "Oposição reage",

      type: "opposition",

      probability: 18,

      secrecy: "public",

      description:
        "Sua movimentação política começa a incomodar grupos adversários."

    },


    {
      id: "political_004",

      title: "Reunião reservada",

      type: "negotiation",

      probability: 10,

      secrecy: "reserved",

      description:
        "Você recebe convite para uma reunião reservada com representantes políticos."

    },


    {
      id: "political_005",

      title: "Informação vaza",

      type: "leak",

      probability: 8,

      secrecy: "confidential",

      description:
        "Uma informação discutida internamente chega à imprensa."

    },


    {
      id: "political_006",

      title: "Conselheiros divididos",

      type: "council",

      probability: 15,

      secrecy: "internal",

      description:
        "Uma votação divide o Conselho e você precisa escolher como agir."

    }

  ]

};


// =========================================================
// FUNÇÕES
// =========================================================

function getPoliticalGroup(id) {

  return POLITICS.groups.find(
    group => group.id === id
  );

}


function getCandidate(id) {

  return POLITICS.candidates.find(
    candidate => candidate.id === id
  );

}


function getCandidates() {

  return POLITICS.candidates;

}


function getActiveCandidates() {

  return POLITICS.candidates.filter(
    candidate =>
      candidate.status === "pre_candidate" ||
      candidate.status === "candidate"
  );

}


function getPoliticalEvent(id) {

  return POLITICS.events.find(
    event => event.id === id
  );

}


function calculateCandidateStrength(candidate) {

  if (!candidate) {
    return 0;
  }

  return (

    candidate.politicalExperience * 0.20 +

    candidate.footballExperience * 0.10 +

    candidate.financialProfile * 0.10 +

    candidate.councilInfluence * 0.25 +

    candidate.fanAppeal * 0.10 +

    candidate.mediaExposure * 0.10 +

    candidate.coalitionPotential * 0.15

  );

}


// =========================================================
// EXPORTAÇÃO
// =========================================================

window.POLITICS = POLITICS;

window.getPoliticalGroup =
  getPoliticalGroup;

window.getCandidate =
  getCandidate;

window.getCandidates =
  getCandidates;

window.getActiveCandidates =
  getActiveCandidates;

window.getPoliticalEvent =
  getPoliticalEvent;

window.calculateCandidateStrength =
  calculateCandidateStrength;
