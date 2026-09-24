const STAFF = [

  // =========================================================
  // DIRETORIA / FUTEBOL PROFISSIONAL
  // =========================================================

  {
    id: "staff_marcelo_paz",
    name: "Marcelo Paz",
    role: "Executivo de Futebol",
    department: "futebol_profissional",

    age: 44,

    reputation: 82,
    experience: 88,
    negotiation: 86,
    scouting: 78,
    leadership: 84,
    financialManagement: 72,
    politicalInfluence: 55,

    salary: 350000,
    contractUntil: "2027-12-31",

    status: "ativo",
    club: "corinthians",

    loyalty: 70,
    relationshipBoard: 70,
    relationshipCoach: 75,
    relationshipPlayers: 72,
    relationshipFans: 62,

    autonomy: 80,

    traits: [
      "gestor",
      "negociador",
      "mercado"
    ]
  },


  {
    id: "staff_julio_manso",
    name: "Julio Manso",
    role: "Supervisor de Futebol",
    department: "futebol_profissional",

    age: 42,

    reputation: 70,
    experience: 78,
    negotiation: 65,
    scouting: 60,
    leadership: 72,
    financialManagement: 60,
    politicalInfluence: 35,

    salary: 120000,
    contractUntil: "2027-12-31",

    status: "ativo",
    club: "corinthians",

    loyalty: 75,
    relationshipBoard: 70,
    relationshipCoach: 78,
    relationshipPlayers: 76,
    relationshipFans: 50,

    autonomy: 60,

    traits: [
      "organizacao",
      "supervisao",
      "vestiario"
    ]
  },


  {
    id: "staff_thiago_ayres",
    name: "Thiago Ayres",
    role: "Coordenador Administrativo do Futebol",
    department: "futebol_profissional",

    age: 38,

    reputation: 65,
    experience: 70,
    negotiation: 62,
    scouting: 45,
    leadership: 68,
    financialManagement: 82,
    politicalInfluence: 30,

    salary: 90000,
    contractUntil: "2027-12-31",

    status: "ativo",
    club: "corinthians",

    loyalty: 78,
    relationshipBoard: 75,
    relationshipCoach: 60,
    relationshipPlayers: 55,
    relationshipFans: 40,

    autonomy: 55,

    traits: [
      "administracao",
      "controle",
      "organizacao"
    ]
  },


  // =========================================================
  // COMISSÃO TÉCNICA
  // =========================================================

  {
    id: "staff_fernando_diniz",
    name: "Fernando Diniz",
    role: "Técnico",
    department: "comissao_tecnica",

    age: 52,

    reputation: 88,
    experience: 90,
    negotiation: 55,
    scouting: 70,
    leadership: 86,
    financialManagement: 20,
    politicalInfluence: 25,

    salary: 1500000,
    contractUntil: "2027-12-31",

    status: "ativo",
    club: "corinthians",

    loyalty: 68,
    relationshipBoard: 72,
    relationshipCoach: 100,
    relationshipPlayers: 82,
    relationshipFans: 58,

    autonomy: 85,

    tacticalStyle: {
      possession: 90,
      pressing: 82,
      defensiveOrganization: 62,
      transition: 76,
      rotation: 70
    },

    traits: [
      "posse_de_bola",
      "intensidade",
      "desenvolvimento",
      "lideranca"
    ]
  },


  {
    id: "staff_auxiliar_01",
    name: "Auxiliar Técnico 1",
    role: "Auxiliar Técnico",
    department: "comissao_tecnica",

    age: 40,

    reputation: 65,
    experience: 72,
    negotiation: 25,
    scouting: 68,
    leadership: 70,
    financialManagement: 10,
    politicalInfluence: 10,

    salary: 180000,
    contractUntil: "2027-12-31",

    status: "ativo",
    club: "corinthians",

    loyalty: 80,
    relationshipBoard: 55,
    relationshipCoach: 90,
    relationshipPlayers: 78,
    relationshipFans: 35,

    autonomy: 45,

    traits: [
      "treinamento",
      "tatica",
      "analise"
    ]
  },


  {
    id: "staff_preparador_01",
    name: "Preparador Físico 1",
    role: "Preparador Físico",
    department: "comissao_tecnica",

    age: 39,

    reputation: 70,
    experience: 76,
    negotiation: 20,
    scouting: 40,
    leadership: 68,
    financialManagement: 10,
    politicalInfluence: 5,

    salary: 110000,
    contractUntil: "2027-12-31",

    status: "ativo",
    club: "corinthians",

    loyalty: 82,
    relationshipBoard: 50,
    relationshipCoach: 88,
    relationshipPlayers: 80,
    relationshipFans: 30,

    autonomy: 40,

    traits: [
      "preparacao_fisica",
      "desempenho",
      "recuperacao"
    ]
  },


  {
    id: "staff_treinador_goleiros",
    name: "Treinador de Goleiros",
    role: "Treinador de Goleiros",
    department: "comissao_tecnica",

    age: 45,

    reputation: 68,
    experience: 80,
    negotiation: 20,
    scouting: 55,
    leadership: 65,
    financialManagement: 10,
    politicalInfluence: 5,

    salary: 95000,
    contractUntil: "2027-12-31",

    status: "ativo",
    club: "corinthians",

    loyalty: 80,
    relationshipBoard: 50,
    relationshipCoach: 82,
    relationshipPlayers: 78,
    relationshipFans: 30,

    autonomy: 35,

    traits: [
      "goleiros",
      "treinamento",
      "desenvolvimento"
    ]
  },


  // =========================================================
  // SCOUTING / ANÁLISE
  // =========================================================

  {
    id: "staff_scout_01",
    name: "Scout Principal",
    role: "Chefe de Scouting",
    department: "scouting",

    age: 43,

    reputation: 72,
    experience: 82,
    negotiation: 60,
    scouting: 94,
    leadership: 70,
    financialManagement: 30,
    politicalInfluence: 15,

    salary: 100000,
    contractUntil: "2027-12-31",

    status: "ativo",
    club: "corinthians",

    loyalty: 75,
    relationshipBoard: 65,
    relationshipCoach: 72,
    relationshipPlayers: 40,
    relationshipFans: 20,

    autonomy: 70,

    traits: [
      "scouting",
      "mercado_internacional",
      "analise_de_dados"
    ]
  },


  {
    id: "staff_analista_01",
    name: "Analista de Desempenho",
    role: "Analista de Desempenho",
    department: "scouting",

    age: 31,

    reputation: 62,
    experience: 68,
    negotiation: 15,
    scouting: 82,
    leadership: 50,
    financialManagement: 15,
    politicalInfluence: 5,

    salary: 65000,
    contractUntil: "2027-12-31",

    status: "ativo",
    club: "corinthians",

    loyalty: 85,
    relationshipBoard: 45,
    relationshipCoach: 78,
    relationshipPlayers: 55,
    relationshipFans: 15,

    autonomy: 35,

    traits: [
      "dados",
      "analise",
      "desempenho"
    ]
  },


  // =========================================================
  // CATEGORIAS DE BASE
  // =========================================================

  {
    id: "staff_erasmo_damiani",
    name: "Erasmo Damiani",
    role: "Executivo da Base",
    department: "base",

    age: 59,

    reputation: 80,
    experience: 94,
    negotiation: 65,
    scouting: 90,
    leadership: 86,
    financialManagement: 60,
    politicalInfluence: 20,

    salary: 150000,
    contractUntil: "2027-12-31",

    status: "ativo",
    club: "corinthians",

    loyalty: 75,
    relationshipBoard: 68,
    relationshipCoach: 65,
    relationshipPlayers: 72,
    relationshipFans: 55,

    autonomy: 75,

    traits: [
      "formacao",
      "scouting",
      "desenvolvimento",
      "gestao_de_base"
    ]
  },


  {
    id: "staff_crisleison_santos",
    name: "Crisleison Santos",
    role: "Coordenador de Mercado da Base",
    department: "base",

    age: 40,

    reputation: 68,
    experience: 72,
    negotiation: 75,
    scouting: 84,
    leadership: 60,
    financialManagement: 35,
    politicalInfluence: 10,

    salary: 80000,
    contractUntil: "2027-12-31",

    status: "ativo",
    club: "corinthians",

    loyalty: 78,
    relationshipBoard: 60,
    relationshipCoach: 55,
    relationshipPlayers: 65,
    relationshipFans: 25,

    autonomy: 55,

    traits: [
      "mercado",
      "scouting",
      "jovens"
    ]
  },


  {
    id: "staff_ricardo_drubscky",
    name: "Ricardo Drubscky",
    role: "Coordenador Técnico da Base",
    department: "base",

    age: 65,

    reputation: 78,
    experience: 92,
    negotiation: 35,
    scouting: 82,
    leadership: 84,
    financialManagement: 25,
    politicalInfluence: 15,

    salary: 95000,
    contractUntil: "2027-12-31",

    status: "ativo",
    club: "corinthians",

    loyalty: 75,
    relationshipBoard: 62,
    relationshipCoach: 60,
    relationshipPlayers: 75,
    relationshipFans: 35,

    autonomy: 65,

    traits: [
      "formacao",
      "metodologia",
      "desenvolvimento"
    ]
  }

];


// =========================================================
// FUNÇÕES DE ACESSO
// =========================================================

function getStaffById(id) {

  return STAFF.find(
    staff => staff.id === id
  );

}


function getStaffByDepartment(department) {

  return STAFF.filter(
    staff => staff.department === department
  );

}


function getActiveStaff() {

  return STAFF.filter(
    staff => staff.status === "ativo"
  );

}


function getStaffRole(role) {

  return STAFF.filter(
    staff => staff.role === role
  );

}


// Disponibiliza os dados para o restante do jogo

window.STAFF = STAFF;
window.getStaffById = getStaffById;
window.getStaffByDepartment = getStaffByDepartment;
window.getActiveStaff = getActiveStaff;
window.getStaffRole = getStaffRole;
