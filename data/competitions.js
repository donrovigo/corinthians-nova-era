const COMPETITIONS = {

  // =========================================================
  // CAMPEONATO PAULISTA
  // =========================================================

  paulista: {

    id: "paulista",

    name: "Campeonato Paulista",

    country: "Brasil",

    level: "estadual",

    importance: 70,

    status: "active",

    season: 2026,

    stages: [

      {
        id: "group_stage",
        name: "Fase de grupos",
        type: "league"
      },

      {
        id: "quarterfinal",
        name: "Quartas de final",
        type: "knockout"
      },

      {
        id: "semifinal",
        name: "Semifinal",
        type: "knockout"
      },

      {
        id: "final",
        name: "Final",
        type: "knockout"
      }

    ]

  },


  // =========================================================
  // COPA DO BRASIL
  // =========================================================

  copaDoBrasil: {

    id: "copa_do_brasil",

    name: "Copa do Brasil",

    country: "Brasil",

    level: "national",

    importance: 90,

    status: "active",

    season: 2026,

    stages: [

      {
        id: "round_1",
        name: "Primeira fase",
        type: "knockout"
      },

      {
        id: "round_2",
        name: "Segunda fase",
        type: "knockout"
      },

      {
        id: "round_3",
        name: "Terceira fase",
        type: "knockout"
      },

      {
        id: "round_4",
        name: "Oitavas de final",
        type: "knockout"
      },

      {
        id: "quarterfinal",
        name: "Quartas de final",
        type: "knockout"
      },

      {
        id: "semifinal",
        name: "Semifinal",
        type: "knockout"
      },

      {
        id: "final",
        name: "Final",
        type: "knockout"
      }

    ]

  },


  // =========================================================
  // CAMPEONATO BRASILEIRO
  // =========================================================

  brasileirao: {

    id: "brasileirao",

    name: "Campeonato Brasileiro",

    country: "Brasil",

    level: "national",

    importance: 100,

    status: "active",

    season: 2026,

    format: "league",

    totalRounds: 38,

    currentRound: 1,

    points: {

      win: 3,

      draw: 1,

      loss: 0

    },

    qualification: {

      libertadores: true,

      sulamericana: true,

      relegation: true

    }

  },


  // =========================================================
  // LIBERTADORES
  // =========================================================

  libertadores: {

    id: "libertadores",

    name: "CONMEBOL Libertadores",

    country: "South America",

    level: "continental",

    importance: 100,

    status: "active",

    season: 2026,

    stages: [

      {
        id: "group_stage",
        name: "Fase de grupos",
        type: "league",

        start: "2026-04-07",

        end: "2026-05-28"

      },

      {
        id: "round_16",
        name: "Oitavas de final",
        type: "knockout",

        start: "2026-08-11",

        end: "2026-08-20"

      },

      {
        id: "quarterfinal",
        name: "Quartas de final",
        type: "knockout",

        start: "2026-09-08",

        end: "2026-09-17"
      },

      {
        id: "semifinal",
        name: "Semifinal",
        type: "knockout",

        start: "2026-10-13",

        end: "2026-10-22"
      },

      {
        id: "final",
        name: "Final",
        type: "final",

        date: "2026-11-28"
      }

    ]

  }

};


// =========================================================
// JOGOS DO CORINTHIANS — BRASILEIRÃO 2026
// =========================================================

const BRASILEIRAO_TEAMS_2026 = ["Atlético-MG","Bahia","Botafogo","Bragantino","Ceará","Chapecoense","Corinthians","Cruzeiro","Flamengo","Fluminense","Grêmio","Internacional","Mirassol","Palmeiras","Santos","São Paulo","Sport","Vasco","Vitória","Remo"];

function getBrasileiraoTeams(){ return BRASILEIRAO_TEAMS_2026.slice(); }

const CORINTHIANS_BRASILEIRAO_2026 = [

  {
    round: 25,
    date: "2026-08-30",
    home: true,
    opponent: "Santos",
    stadium: "Neo Química Arena"
  },

  {
    round: 26,
    date: "2026-09-06",
    home: true,
    opponent: "Chapecoense",
    stadium: "Neo Química Arena"
  },

  {
    round: 27,
    date: "2026-09-13",
    home: false,
    opponent: "Flamengo",
    stadium: "Maracanã"
  },

  {
    round: 28,
    date: "2026-09-20",
    home: true,
    opponent: "Fluminense",
    stadium: "Neo Química Arena"
  },

  {
    round: 29,
    date: "2026-10-07",
    home: false,
    opponent: "Internacional",
    stadium: "Beira-Rio"
  },

  {
    round: 30,
    date: "2026-10-11",
    home: false,
    opponent: "Palmeiras",
    stadium: "Nubank Parque"
  },

  {
    round: 31,
    date: "2026-10-17",
    home: true,
    opponent: "Vitória",
    stadium: "Neo Química Arena"
  },

  {
    round: 32,
    date: "2026-10-25",
    home: false,
    opponent: "Vasco",
    stadium: "São Januário"
  },

  {
    round: 33,
    date: "2026-10-31",
    home: true,
    opponent: "Mirassol",
    stadium: "Neo Química Arena"
  },

  {
    round: 34,
    date: "2026-11-04",
    home: false,
    opponent: "São Paulo",
    stadium: "Morumbis"
  },

  {
    round: 35,
    date: "2026-11-08",
    home: true,
    opponent: "Botafogo",
    stadium: "Neo Química Arena"
  },

  {
    round: 36,
    date: "2026-11-18",
    home: false,
    opponent: "Atlético-MG",
    stadium: "Arena MRV"
  },

  {
    round: 37,
    date: "2026-11-22",
    home: true,
    opponent: "Grêmio",
    stadium: "Neo Química Arena"
  },

  {
    round: 38,
    date: "2026-12-06",
    home: false,
    opponent: "Remo",
    stadium: "Mangueirão"
  }

];


// =========================================================
// JOGOS DA LIBERTADORES 2026
// =========================================================

const CORINTHIANS_LIBERTADORES_2026 = [

  {
    stage: "round_16",
    leg: 1,
    date: "2026-08-11",
    home: false,
    opponent: "Rosario Central",
    stadium: "Gigante de Arroyito"
  },

  {
    stage: "round_16",
    leg: 2,
    date: "2026-08-20",
    home: true,
    opponent: "Rosario Central",
    stadium: "Neo Química Arena"
  },

  {
    stage: "quarterfinal",
    leg: 1,
    date: "2026-09-09",
    home: false,
    opponent: "Estudiantes",
    stadium: "Estádio UNO"
  },

  {
    stage: "quarterfinal",
    leg: 2,
    date: "2026-09-16",
    home: true,
    opponent: "Estudiantes",
    stadium: "Neo Química Arena"
  }

];


// =========================================================
// CALENDÁRIO
// =========================================================

const CALENDAR_2026 = [

  {
    date: "2026-01-01",
    type: "season_start",
    title: "Início da temporada",
    importance: 5
  },

  {
    date: "2026-01-05",
    type: "training",
    title: "Reapresentação do elenco",
    importance: 20
  },

  {
    date: "2026-04-07",
    type: "libertadores",
    title: "Início da fase de grupos da Libertadores",
    importance: 80
  },

  {
    date: "2026-08-11",
    type: "libertadores",
    title: "Oitavas de final da Libertadores",
    importance: 95
  },

  {
    date: "2026-09-08",
    type: "libertadores",
    title: "Quartas de final da Libertadores",
    importance: 100
  },

  {
    date: "2026-10-13",
    type: "libertadores",
    title: "Semifinais da Libertadores",
    importance: 100
  },

  {
    date: "2026-11-28",
    type: "election",
    title: "Eleição presidencial do Corinthians",
    importance: 100
  },

  {
    date: "2026-12-06",
    type: "season_end",
    title: "Fim do Campeonato Brasileiro",
    importance: 90
  }

];


// =========================================================
// FUNÇÕES
// =========================================================

function getCompetition(id) {

  return Object.values(COMPETITIONS).find(
    competition => competition.id === id
  );

}


function getBrasileiraoFixtures() {

  return CORINTHIANS_BRASILEIRAO_2026;

}


function getLibertadoresFixtures() {

  return CORINTHIANS_LIBERTADORES_2026;

}


function getCalendarEvent(date) {

  return CALENDAR_2026.find(
    event => event.date === date
  );

}


function getMatchesOnDate(date) {

  const brasileirao =
    CORINTHIANS_BRASILEIRAO_2026.filter(
      match => match.date === date
    );

  const libertadores =
    CORINTHIANS_LIBERTADORES_2026.filter(
      match => match.date === date
    );

  return [
    ...brasileirao,
    ...libertadores
  ];

}


function getNextMatch(currentDate) {

  const allMatches = [

    ...CORINTHIANS_BRASILEIRAO_2026,

    ...CORINTHIANS_LIBERTADORES_2026

  ];

  return allMatches
    .filter(match => match.date >= currentDate)
    .sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    )[0] || null;

}


// =========================================================
// EXPORTAÇÃO
// =========================================================

window.COMPETITIONS = COMPETITIONS;

window.CORINTHIANS_BRASILEIRAO_2026 =
  CORINTHIANS_BRASILEIRAO_2026;

window.CORINTHIANS_LIBERTADORES_2026 =
  CORINTHIANS_LIBERTADORES_2026;

window.CALENDAR_2026 =
  CALENDAR_2026;

window.getCompetition =
  getCompetition;

window.getBrasileiraoFixtures =
  getBrasileiraoFixtures;

window.getBrasileiraoTeams = getBrasileiraoTeams;

window.getLibertadoresFixtures =
  getLibertadoresFixtures;

window.getCalendarEvent =
  getCalendarEvent;

window.getMatchesOnDate =
  getMatchesOnDate;

window.getNextMatch =
  getNextMatch;
