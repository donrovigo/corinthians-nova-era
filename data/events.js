const EVENTS = [

  // =========================================================
  // POLÍTICA
  // =========================================================

  {
    id: "political_councilor_approach",
    category: "politica",
    title: "Conselheiro procura você",
    description:
      "Um conselheiro pede uma conversa reservada para discutir o cenário político do clube.",
    minDate: "2026-01-01",
    conditions: {
      career: ["presidente", "conselheiro"]
    },
    choices: [
      {
        text: "Aceitar uma conversa reservada",
        effects: {
          politicalSupport: 3,
          councilTrust: 2,
          leakRisk: 2
        },
        result:
          "A conversa foi positiva. O conselheiro demonstra interesse em acompanhar seus próximos movimentos."
      },
      {
        text: "Manter distância neste momento",
        effects: {
          politicalSupport: -1,
          reputation: 1
        },
        result:
          "Você evita um compromisso prematuro, mas perde uma oportunidade de aproximação."
      }
    ]
  },

  {
    id: "political_group_offer",
    category: "politica",
    title: "Grupo político oferece apoio",
    description:
      "Um grupo político do clube sinaliza que pode apoiar sua candidatura, mas espera espaço nas futuras decisões.",
    minDate: "2026-03-01",
    conditions: {
      career: ["presidente"]
    },
    choices: [
      {
        text: "Negociar apoio sem prometer cargos",
        effects: {
          politicalSupport: 5,
          councilTrust: 2,
          leakRisk: 2
        },
        result:
          "O grupo aceita continuar conversando, mas deixa claro que novas negociações serão necessárias."
      },
      {
        text: "Oferecer participação futura",
        effects: {
          politicalSupport: 8,
          leakRisk: 5
        },
        result:
          "O apoio aumenta, mas agora existe uma expectativa política sobre sua futura gestão."
      },
      {
        text: "Recusar a aproximação",
        effects: {
          politicalSupport: -3,
          reputation: 2
        },
        result:
          "Você mantém independência, mas o grupo passa a observar seus movimentos com mais cautela."
      }
    ]
  },

  {
    id: "reserved_political_meeting",
    category: "politica",
    title: "Reunião reservada",
    description:
      "Você recebeu convite para uma reunião com pessoas influentes do clube. O encontro pode alterar o equilíbrio político.",
    minDate: "2026-05-01",
    conditions: {
      career: ["presidente"]
    },
    choices: [
      {
        text: "Participar discretamente",
        effects: {
          politicalSupport: 6,
          councilTrust: 3,
          leakRisk: 4
        },
        result:
          "A reunião terminou sem anúncio público. Algumas portas políticas foram abertas."
      },
      {
        text: "Participar e exigir transparência",
        effects: {
          politicalSupport: 2,
          reputation: 5,
          leakRisk: -2
        },
        result:
          "A postura aumenta sua reputação institucional, mas reduz parte do espaço para negociações informais."
      },
      {
        text: "Não participar",
        effects: {
          politicalSupport: -2,
          reputation: 2
        },
        result:
          "Você evita qualquer compromisso, mas outros grupos avançam nas articulações."
      }
    ]
  },

  // =========================================================
  // VAZAMENTOS
  // =========================================================

  {
    id: "political_leak",
    category: "vazamento",
    title: "🚨 Informação vazou",
    description:
      "Uma informação de uma conversa reservada chegou à imprensa.",
    minDate: "2026-04-01",
    conditions: {
      career: ["presidente", "conselheiro"],
      minLeakRisk: 15
    },
    choices: [
      {
        text: "Negar que houve qualquer acordo",
        effects: {
          pressPressure: 4,
          leakRisk: -2,
          reputation: -2
        },
        result:
          "Sua negativa reduz parte da pressão, mas alguns jornalistas continuam investigando."
      },
      {
        text: "Confirmar apenas que houve uma reunião",
        effects: {
          pressPressure: 2,
          reputation: 2,
          leakRisk: -5
        },
        result:
          "A transparência reduz parte das especulações."
      },
      {
        text: "Não comentar",
        effects: {
          pressPressure: 7,
          leakRisk: -3
        },
        result:
          "O silêncio aumenta as especulações e mantém o assunto nas manchetes."
      }
    ]
  },

  // =========================================================
  // IMPRENSA
  // =========================================================

  {
    id: "press_question",
    category: "imprensa",
    title: "Pergunta difícil da imprensa",
    description:
      "Um jornalista questiona seus planos para o clube e pede números concretos.",
    minDate: "2026-02-01",
    conditions: {
      career: ["presidente", "conselheiro", "diretor_futebol", "tecnico"]
    },
    choices: [
      {
        text: "Responder com transparência",
        effects: {
          reputation: 3,
          pressPressure: -2
        },
        result:
          "Sua resposta transmite segurança e reduz parte da pressão."
      },
      {
        text: "Responder de maneira política",
        effects: {
          politicalSupport: 2,
          pressPressure: 1
        },
        result:
          "Você evita assumir compromissos específicos, mas deixa algumas perguntas sem resposta."
      },
      {
        text: "Criticar a pergunta",
        effects: {
          pressPressure: 6,
          reputation: -2
        },
        result:
          "A resposta gera repercussão negativa entre jornalistas."
      }
    ]
  },

  // =========================================================
  // FINANÇAS
  // =========================================================

  {
    id: "financial_pressure",
    category: "financas",
    title: "Pressão financeira",
    description:
      "O departamento financeiro alerta que existem compromissos importantes próximos do vencimento.",
    minDate: "2026-01-01",
    conditions: {
      career: ["presidente", "diretor_futebol"]
    },
    choices: [
      {
        text: "Priorizar pagamentos essenciais",
        effects: {
          reputation: 2,
          councilTrust: 2,
          fanMood: 1
        },
        result:
          "A administração consegue priorizar os compromissos mais urgentes."
      },
      {
        text: "Negociar prazos",
        effects: {
          reputation: -1,
          politicalSupport: 2
        },
        result:
          "Parte dos pagamentos é renegociada, criando algum espaço financeiro."
      },
      {
        text: "Acelerar busca por receitas",
        effects: {
          reputation: 3,
          pressPressure: 2
        },
        result:
          "A diretoria começa a procurar novas receitas comerciais e patrocinadores."
      }
    ]
  },

  // =========================================================
  // FUTEBOL
  // =========================================================

  {
    id: "dressing_room_problem",
    category: "elenco",
    title: "Problema no vestiário",
    description:
      "Um grupo de jogadores demonstra insatisfação com uma decisão recente da comissão técnica.",
    minDate: "2026-02-01",
    conditions: {
      career: ["presidente", "tecnico", "diretor_futebol"]
    },
    choices: [
      {
        text: "Reunir os jogadores",
        effects: {
          dressingRoomMorale: 5,
          coachConfidence: 2
        },
        result:
          "A conversa ajuda a reduzir a tensão dentro do elenco."
      },
      {
        text: "Deixar o treinador resolver",
        effects: {
          coachConfidence: 5,
          dressingRoomMorale: -2
        },
        result:
          "Você preserva a autoridade do treinador, mas a tensão permanece."
      },
      {
        text: "Intervir diretamente",
        effects: {
          dressingRoomMorale: 3,
          coachConfidence: -5
        },
        result:
          "O problema é controlado, mas sua interferência gera desconforto na comissão técnica."
      }
    ]
  },

  // =========================================================
  // MERCADO
  // =========================================================

  {
    id: "agent_player_offer",
    category: "mercado",
    title: "Agente oferece jogador",
    description:
      "Um empresário apresenta um jogador que poderia reforçar o elenco.",
    minDate: "2026-01-01",
    conditions: {
      career: ["presidente", "diretor_futebol", "tecnico"]
    },
    choices: [
      {
        text: "Enviar para análise do scout",
        effects: {
          reputation: 1
        },
        result:
          "O jogador será analisado antes de qualquer negociação."
      },
      {
        text: "Pedir condições financeiras",
        effects: {
          politicalSupport: 1
        },
        result:
          "O empresário apresenta valores e condições iniciais."
      },
      {
        text: "Recusar imediatamente",
        effects: {
          reputation: 1
        },
        result:
          "O clube não demonstra interesse neste momento."
      }
    ]
  },

  // =========================================================
  // BASE
  // =========================================================

  {
    id: "academy_prospect",
    category: "base",
    title: "Jovem chama atenção",
    description:
      "Um jogador da base começa a se destacar nos treinamentos.",
    minDate: "2026-03-01",
    conditions: {
      career: ["presidente", "diretor_futebol", "diretor_base", "tecnico"]
    },
    choices: [
      {
        text: "Promover aos treinamentos profissionais",
        effects: {
          reputation: 3,
          fanMood: 2
        },
        result:
          "O jovem passa a treinar com o elenco profissional."
      },
      {
        text: "Manter desenvolvimento na base",
        effects: {
          reputation: 1
        },
        result:
          "A comissão decide não acelerar o processo de formação."
      },
      {
        text: "Pedir avaliação completa",
        effects: {
          reputation: 2
        },
        result:
          "Scout e comissão técnica recebem a missão de avaliar o jogador."
      }
    ]
  },

  // =========================================================
  // TORCIDA
  // =========================================================

  {
    id: "fan_protest",
    category: "torcida",
    title: "Torcida protesta",
    description:
      "Um grupo de torcedores manifesta insatisfação com o momento do clube.",
    minDate: "2026-04-01",
    conditions: {
      career: ["presidente", "tecnico", "diretor_futebol"]
    },
    choices: [
      {
        text: "Conversar com representantes",
        effects: {
          fanMood: 5,
          reputation: 2
        },
        result:
          "A conversa reduz parcialmente a tensão."
      },
      {
        text: "Ignorar o protesto",
        effects: {
          fanMood: -6,
          pressPressure: 3
        },
        result:
          "O protesto continua ganhando espaço."
      },
      {
        text: "Apresentar um plano de reação",
        effects: {
          fanMood: 3,
          reputation: 4,
          pressPressure: 2
        },
        result:
          "A torcida recebe um plano concreto, mas agora cobrará resultados."
      }
    ]
  },

  // =========================================================
  // CONSELHO
  // =========================================================

  {
    id: "council_meeting",
    category: "conselho",
    title: "Reunião do Conselho",
    description:
      "Uma reunião importante do Conselho Deliberativo está marcada.",
    minDate: "2026-06-01",
    conditions: {
      career: ["presidente", "conselheiro"]
    },
    choices: [
      {
        text: "Comparecer e defender sua posição",
        effects: {
          councilTrust: 5,
          politicalSupport: 3
        },
        result:
          "Sua presença fortalece sua posição entre os conselheiros."
      },
      {
        text: "Buscar apoio antes da reunião",
        effects: {
          politicalSupport: 6,
          leakRisk: 4
        },
        result:
          "Você articula apoio nos bastidores antes da votação."
      },
      {
        text: "Não se envolver",
        effects: {
          councilTrust: -3
        },
        result:
          "Outros grupos ocupam o espaço político deixado por você."
      }
    ]
  },

  // =========================================================
  // ELEIÇÃO
  // =========================================================

  {
    id: "election_campaign",
    category: "eleicao",
    title: "Campanha eleitoral começa",
    description:
      "A proximidade da eleição aumenta a movimentação política dentro do clube.",
    minDate: "2026-09-01",
    conditions: {
      career: ["presidente"]
    },
    choices: [
      {
        text: "Acelerar campanha",
        effects: {
          politicalSupport: 8,
          pressPressure: 4,
          reputation: 2
        },
        result:
          "Sua campanha aumenta a presença entre associados e conselheiros."
      },
      {
        text: "Priorizar articulação política",
        effects: {
          politicalSupport: 10,
          leakRisk: 6
        },
        result:
          "Você concentra esforços na construção de alianças."
      },
      {
        text: "Priorizar comunicação pública",
        effects: {
          reputation: 6,
          pressPressure: 5,
          politicalSupport: 4
        },
        result:
          "Sua candidatura ganha maior exposição pública."
      }
    ]
  },

  // =========================================================
  // TREINADOR
  // =========================================================

  {
    id: "coach_pressure",
    category: "tecnico",
    title: "Pressão sobre o treinador",
    description:
      "Os resultados recentes aumentam a pressão sobre a comissão técnica.",
    minDate: "2026-05-01",
    conditions: {
      career: ["presidente", "tecnico", "diretor_futebol"]
    },
    choices: [
      {
        text: "Manter apoio ao treinador",
        effects: {
          coachConfidence: 8,
          councilTrust: 2,
          pressPressure: 2
        },
        result:
          "A diretoria demonstra confiança no trabalho da comissão."
      },
      {
        text: "Cobrar resultados internamente",
        effects: {
          coachConfidence: -3,
          reputation: 2
        },
        result:
          "O treinador recebe uma cobrança formal por resultados."
      },
      {
        text: "Começar a procurar alternativas",
        effects: {
          coachConfidence: -8,
          leakRisk: 5
        },
        result:
          "A diretoria começa a avaliar possíveis substitutos de maneira reservada."
      }
    ]
  }

];


// =========================================================
// MOTOR DE EVENTOS
// =========================================================

function eventConditionMatches(event, state) {

  if (!event.conditions) return true;

  // Carreira
  if (
    event.conditions.career &&
    !event.conditions.career.includes(state.career)
  ) {
    return false;
  }

  // Data mínima
  if (event.minDate) {

    const currentDate = new Date(state.date);
    const minDate = new Date(event.minDate);

    if (currentDate < minDate) {
      return false;
    }
  }

  // Risco mínimo de vazamento
  if (
    event.conditions.minLeakRisk !== undefined &&
    state.leakRisk < event.conditions.minLeakRisk
  ) {
    return false;
  }

  return true;
}


function getAvailableEvents(state) {

  return EVENTS.filter(event =>
    eventConditionMatches(event, state)
  );

}


function getRandomEvent(state) {

  const available = getAvailableEvents(state);

  if (!available.length) {
    return null;
  }

  const index = Math.floor(Math.random() * available.length);

  return available[index];
}


function applyEventEffects(effects) {

  if (!window.Game || !effects) return;

  Object.entries(effects).forEach(([variable, amount]) => {

    if (
      Game.state[variable] !== undefined &&
      typeof Game.state[variable] === "number"
    ) {
      Game.change(variable, amount);
    }

  });

}


function triggerEvent() {

  if (!window.Game) return null;

  const event = getRandomEvent(Game.state);

  if (!event) return null;

  return event;
}


function chooseEvent(event, choiceIndex) {

  if (!event || !event.choices) return;

  const choice = event.choices[choiceIndex];

  if (!choice) return;

  applyEventEffects(choice.effects);

  Game.log(
    `EVENTO: ${event.title} — ${choice.result}`
  );

  Game.render();

}


window.EVENTS = EVENTS;
window.getAvailableEvents = getAvailableEvents;
window.getRandomEvent = getRandomEvent;
window.triggerEvent = triggerEvent;
window.chooseEvent = chooseEvent;


window.Events = {
  getAvailableEvents,
  getRandomEvent: () => getRandomEvent(window.Game ? Game.state : null),
  triggerEvent,
  chooseEvent
};
