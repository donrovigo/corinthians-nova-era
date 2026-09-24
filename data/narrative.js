const Narrative = {

  tones: ["caloroso", "engracado", "bravo", "aspero", "ironico", "diplomatico", "frio", "preocupado"],

  names: [
    "um diretor do futebol",
    "um conselheiro experiente",
    "um aliado da sua chapa",
    "um dirigente do clube",
    "um membro do Conselho",
    "um assessor próximo da diretoria"
  ],

  state() {
    if (typeof Game === "undefined") return null;
    return Game.state;
  },

  pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  },

  tone() {
    return this.pick(this.tones);
  },

  signature(eventId, tone) {
    return eventId + "::" + tone;
  },

  used(eventId, tone) {
    const state = this.state();
    if (!state) return false;
    state.narrativeHistory = state.narrativeHistory || [];
    return state.narrativeHistory.includes(this.signature(eventId, tone));
  },

  remember(eventId, tone) {
    const state = this.state();
    if (!state) return;
    state.narrativeHistory = state.narrativeHistory || [];
    state.narrativeHistory.push(this.signature(eventId, tone));
    if (state.narrativeHistory.length > 300) state.narrativeHistory.shift();
  },

  context() {
    const s = this.state();
    return {
      pressure: Number(s?.pressPressure || 0),
      support: Number(s?.politicalSupport || 0),
      trust: Number(s?.councilTrust || 0),
      fans: Number(s?.fanMood || 0),
      morale: Number(s?.dressingRoomMorale || 0),
      leak: Number(s?.leakRisk || 0)
    };
  },

  build(event) {
    if (!event) return null;

    let tone = this.tone();
    let guard = 0;
    while (this.used(event.id, tone) && guard++ < 20) tone = this.tone();

    this.remember(event.id, tone);

    const speaker = this.pick(this.names);
    const c = this.context();

    const voices = {
      caloroso: [
        speaker + " chega sem rodeios, mas num tom quase amigável: "Olha, eu vim falar com você porque ainda acho que dá para construir isso juntos."",
        ""Não estou vindo cobrar nada", diz " + speaker + ". "Só quero que você saiba que tem gente disposta a conversar.""
      ],
      engracado: [
        speaker + " dá um meio sorriso: "Se política de clube fosse simples, vendiam na farmácia. Temos um problema."",
        ""Tenho uma notícia boa e uma ruim", diz " + speaker + ". "A boa é que estão falando de você. A ruim é que estão falando de você.""
      ],
      bravo: [
        speaker + " entra visivelmente irritado: "A gente precisa parar de fingir que isso vai se resolver sozinho."",
        ""Isso já passou da fase de conversa bonita", dispara " + speaker + "."
      ],
      aspero: [
        speaker + " fecha a porta e vai direto ao ponto: "Vou falar uma vez. Você decide o que faz com isso."",
        ""Não confunda silêncio com apoio", avisa " + speaker + "."
      ],
      ironico: [
        speaker + " solta uma risada curta: "Claro, está tudo tranquilo. Por isso todo mundo está mandando mensagem ao mesmo tempo."",
        ""Pode ficar tranquilo", ironiza " + speaker + ". "Ninguém está fazendo articulação nenhuma... pelo menos é isso que estão dizendo.""
      ],
      diplomatico: [
        speaker + " escolhe as palavras com cuidado: "Há movimentos acontecendo e seria prudente você ouvir algumas pessoas antes de tomar uma posição."",
        ""Não estou dizendo que exista um acordo", pondera " + speaker + ". "Estou dizendo que algumas conversas estão avançando.""
      ],
      frio: [
        speaker + " coloca um papel sobre a mesa: "Não vou interpretar para você. Estes são os movimentos que chegaram até mim."",
        ""Você pode tratar isso como ruído ou como sinal", diz " + speaker + " sem alterar o tom."
      ],
      preocupado: [
        speaker + " fala baixo: "Estou te procurando antes que isso chegue à imprensa."",
        ""Talvez não seja nada", diz " + speaker + ", "mas eu não esperaria para descobrir quando já estiver público.""
      ]
    };

    let base = this.pick(voices[tone]);

    if (event.category === "politica" || event.category === "conselho" || event.category === "eleicao") {
      const politicalLine =
        c.leak >= 20
          ? " Tem muita conversa paralela acontecendo e o risco de vazamento está alto."
          : c.support >= 45
            ? " Sua posição ganhou espaço, então as alianças começaram a se mexer."
            : " Seu espaço político ainda está sendo disputado.";

      base += politicalLine;
    }

    if (event.category === "mercado" && c.morale < 45) {
      base += " E o vestiário está acompanhando cada movimento do mercado.";
    }

    if (event.category === "financas" && c.pressure > 50) {
      base += " A imprensa já está olhando para os números.";
    }

    const choices = (event.choices || []).map(choice => {
      const prefixes = {
        caloroso: ["Vamos conversar antes de decidir", "Ouvir primeiro pode ser melhor"],
        engracado: ["Vamos ver até onde essa novela vai", "Responder sem transformar isso em circo"],
        bravo: ["Cortar o problema pela raiz", "Dar uma resposta firme"],
        aspero: ["Deixar a posição clara", "Não aceitar pressão"],
        ironico: ["Responder no mesmo tom", "Não entrar no teatro"],
        diplomatico: ["Abrir uma conversa", "Construir uma saída"],
        frio: ["Pedir fatos antes de agir", "Manter a decisão técnica"],
        preocupado: ["Agir antes que escale", "Reduzir o risco imediatamente"]
      };

      const alternatives = prefixes[tone] || ["Tomar uma decisão"];
      const text = this.pick(alternatives) + ": " + choice.text.toLowerCase();

      return {
        ...choice,
        text,
        result: choice.result
      };
    });

    return {
      ...event,
      title: this.dynamicTitle(event, tone),
      description: base,
      choices,
      tone,
      speaker
    };
  },

  dynamicTitle(event, tone) {
    const map = {
      caloroso: "Uma conversa que pode virar aliança",
      engracado: "Tem coisa acontecendo nos bastidores",
      bravo: "A tensão chegou à sua mesa",
      aspero: "Alguém decidiu falar sem filtro",
      ironico: "Claro que isso é só coincidência",
      diplomatico: "Movimentos começam a se alinhar",
      frio: "Um relatório que merece atenção",
      preocupado: "Um aviso antes que vire problema"
    };

    if (event.category === "mercado") return tone === "engracado" ? "Mais uma proposta na mesa" : "O mercado bate à porta";
    if (event.category === "financas") return "O financeiro pede uma decisão";
    if (event.category === "elenco") return "O vestiário tem algo a dizer";
    return map[tone] || event.title;
  },

  show(event) {
    const generated = this.build(event);
    if (!generated) return null;

    if (typeof setEvent !== "function") return generated;

    setEvent(
      generated.title,
      generated.description,
      generated.choices.map(choice => ({
        text: choice.text,
        action: () => {
          if (typeof applyEventEffects === "function") {
            applyEventEffects(choice.effects);
          }

          if (typeof Game !== "undefined") {
            Game.log("SIMULAÇÃO: " + generated.title + " — " + choice.result);
            Game.render();
          }

          if (typeof updateDashboard === "function") updateDashboard();
        }
      }))
    );

    if (typeof Game !== "undefined" && Game.log) {
      Game.log("SIMULAÇÃO: " + generated.title + " — " + generated.speaker + " trouxe a situação.");
    }

    return generated;
  },

  generateConspiracyHint() {
    const s = this.state();
    if (!s) return null;

    const speaker = this.pick([
      "um conselheiro",
      "um diretor",
      "um aliado",
      "um assessor"
    ]);

    const target = this.pick([
      "outro diretor",
      "um grupo de conselheiros",
      "um possível aliado",
      "um grupo da oposição"
    ]);

    const lines = [
      speaker + " te chama de lado: "Não quero transformar isso em acusação, mas " + target + " está conversando com gente que antes estava distante."",
      speaker + " manda uma mensagem curta: "Tem uma aproximação acontecendo. Não sei se virou acordo, mas eu ficaria atento."",
      ""Ouvi que " + target + " está tentando montar uma nova articulação", diz " + speaker + ". "Pode ser só conversa. Pode ser mais.""
    ];

    return {
      title: "Movimentação nos bastidores",
      description: this.pick(lines),
      tone: this.tone(),
      choices: [
        { text: "Perguntar discretamente o que está acontecendo", effects: { politicalSupport: 1, leakRisk: 2 }, result: "Você decidiu investigar sem transformar o assunto em confronto." },
        { text: "Confrontar os envolvidos", effects: { politicalSupport: 2, leakRisk: 5, pressPressure: 2 }, result: "Você colocou o assunto sobre a mesa e aumentou a tensão política." },
        { text: "Ignorar e observar", effects: { councilTrust: 1 }, result: "Você preferiu observar os movimentos antes de reagir." }
      ]
    };
  }
};

window.Narrative = Narrative;
