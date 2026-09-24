const Tasks = {

  active: [],
  completed: [],
  failed: [],

  reset() {
    this.active = [];
    this.completed = [];
    this.failed = [];
  },

  hasLink(type, key, value) {
    return [...this.active, ...this.completed, ...this.failed].some(task =>
      task.type === type &&
      task.data &&
      task.data[key] === value
    );
  },

  create({
    title,
    description = "",
    type = "geral",
    deadline = null,
    priority = 5,
    career = null,
    requiresDecision = false,
    data = {}
  }) {

    const task = {

      id:
        `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,

      title,

      description,

      type,

      deadline,

      priority,

      career,

      requiresDecision,

      data,

      status: "pendente",

      createdAt:
        Game.state.date.toISOString()

    };

    this.active.push(task);

    Game.log(
      `Novo compromisso: ${title}.`
    );

    return task;
  },

  get(taskId) {

    return this.active.find(
      task => task.id === taskId
    );

  },

  getPending() {

    return this.active.filter(
      task =>
        task.status === "pendente"
    );

  },

  getByType(type) {

    return this.getPending().filter(
      task =>
        task.type === type
    );

  },

  complete(taskId, result = null) {

    const task =
      this.get(taskId);

    if (!task) {

      return {
        success: false,
        message: "Compromisso não encontrado."
      };

    }

    task.status = "concluida";

    task.completedAt =
      Game.state.date.toISOString();

    task.result = result;

    this.completed.push(task);

    this.active =
      this.active.filter(
        item =>
          item.id !== task.id
      );

    Game.log(
      `Compromisso concluído: ${task.title}.`
    );

    return {
      success: true,
      task
    };

  },

  fail(taskId, reason = "prazo perdido") {

    const task =
      this.get(taskId);

    if (!task) {

      return {
        success: false,
        message: "Compromisso não encontrado."
      };

    }

    task.status = "falhou";

    task.failedAt =
      Game.state.date.toISOString();

    task.failureReason = reason;

    this.failed.push(task);

    this.active =
      this.active.filter(
        item =>
          item.id !== task.id
      );

    Game.log(
      `Compromisso perdido: ${task.title}.`
    );

    return {
      success: true,
      task
    };

  },

  cancel(taskId, reason = "cancelado") {

    const task =
      this.get(taskId);

    if (!task) {

      return {
        success: false,
        message: "Compromisso não encontrado."
      };

    }

    task.status = "cancelado";

    task.cancelReason = reason;

    this.active =
      this.active.filter(
        item =>
          item.id !== task.id
      );

    Game.log(
      `Compromisso cancelado: ${task.title}.`
    );

    return {
      success: true
    };

  },

  getDaysRemaining(task) {

    if (!task.deadline) {
      return null;
    }

    const today =
      new Date(Game.state.date);

    const deadline =
      new Date(task.deadline);

    return Math.ceil(
      (
        deadline - today
      ) /
      (1000 * 60 * 60 * 24)
    );

  },

  getUrgency(task) {

    const days =
      this.getDaysRemaining(task);

    if (days === null) {
      return "normal";
    }

    if (days < 0) {
      return "atrasada";
    }

    if (days <= 1) {
      return "critica";
    }

    if (days <= 3) {
      return "alta";
    }

    if (days <= 7) {
      return "media";
    }

    return "normal";

  },

  getSorted() {

    return this.getPending()
      .map(task => ({
        ...task,
        daysRemaining:
          this.getDaysRemaining(task),

        urgency:
          this.getUrgency(task)
      }))
      .sort((a, b) => {

        /*
         * Primeiro tarefas atrasadas/críticas
         */

        const urgencyWeight = {

          atrasada: 5,
          critica: 4,
          alta: 3,
          media: 2,
          normal: 1

        };

        const urgencyDifference =
          urgencyWeight[b.urgency] -
          urgencyWeight[a.urgency];

        if (
          urgencyDifference !== 0
        ) {

          return urgencyDifference;

        }

        return (
          b.priority -
          a.priority
        );

      });

  },

  getToday() {

    const today =
      new Date(Game.state.date);

    return this.getPending()
      .filter(task => {

        if (!task.deadline) {
          return false;
        }

        const deadline =
          new Date(task.deadline);

        return (
          deadline.getFullYear() ===
            today.getFullYear() &&

          deadline.getMonth() ===
            today.getMonth() &&

          deadline.getDate() ===
            today.getDate()
        );

      });

  },

  checkDeadlines() {

    const pending =
      [...this.getPending()];

    pending.forEach(task => {

      if (!task.deadline) {
        return;
      }

      const days =
        this.getDaysRemaining(task);

      if (days < 0) {

        this.fail(
          task.id,
          "prazo ultrapassado"
        );

        /*
         * Impactos diferentes
         * dependendo da tarefa.
         */

        if (
          task.type === "financeiro"
        ) {

          Game.change(
            "reputation",
            -3
          );

          Game.change(
            "pressPressure",
            5
          );

        }

        if (
          task.type === "politica"
        ) {

          Game.change(
            "politicalSupport",
            -3
          );

          Game.change(
            "councilTrust",
            -2
          );

        }

        if (
          task.type === "contrato"
        ) {

          Game.change(
            "dressingRoomMorale",
            -2
          );

        }

      }

    });

  },

  createFromNegotiation(
    negotiation
  ) {

    if (!negotiation) {
      return null;
    }

    return this.create({

      title:
        "Negociação pendente",

      description:
        negotiation.description ||
        "Uma negociação precisa de acompanhamento.",

      type:
        "negociacao",

      deadline:
        negotiation.deadline,

      priority:
        7,

      requiresDecision:
        true,

      data: {
        negotiationId:
          negotiation.id
      }

    });

  },

  createFromOffer(
    offer
  ) {

    if (!offer) {
      return null;
    }

    return this.create({

      title:
        `Proposta por ${offer.playerName}`,

      description:
        `${offer.club} apresentou uma proposta pelo jogador.`,

      type:
        "mercado",

      deadline:
        offer.deadline,

      priority:
        8,

      requiresDecision:
        true,

      data: {
        offerId:
          offer.id
      }

    });

  },

  createContractTask(
    player
  ) {

    if (!player) {
      return null;
    }

    return this.create({

      title:
        `Renovar contrato de ${player.name}`,

      description:
        `O contrato de ${player.name} está próximo do vencimento.`,

      type:
        "contrato",

      deadline:
        player.contractUntil,

      priority:
        7,

      requiresDecision:
        true,

      data: {
        playerId:
          player.id
      }

    });

  },

  createPoliticalMeeting({
    title,
    description,
    deadline,
    priority = 8,
    data = {}
  }) {

    return this.create({

      title,

      description,

      type:
        "politica",

      deadline,

      priority,

      career:
        "presidente",

      requiresDecision:
        true,

      data

    });

  },

  createFinancialTask({
    title,
    description,
    deadline,
    priority = 9,
    data = {}
  }) {

    return this.create({

      title,

      description,

      type:
        "financeiro",

      deadline,

      priority,

      requiresDecision:
        true,

      data

    });

  },

  createDelegationTask(
    delegation
  ) {

    if (!delegation) {
      return null;
    }

    return this.create({

      title:
        delegation.title ||
        "Delegação em andamento",

      description:
        "Uma missão foi delegada a um membro da estrutura do clube.",

      type:
        "delegacao",

      deadline:
        delegation.deadline,

      priority:
        6,

      requiresDecision:
        false,

      data: {
        delegationId:
          delegation.id
      }

    });

  },

  getSummary() {

    const pending =
      this.getPending();

    return {

      total:
        pending.length,

      today:
        this.getToday().length,

      critical:
        pending.filter(
          task =>
            this.getUrgency(task) ===
            "critica"
        ).length,

      overdue:
        pending.filter(
          task =>
            this.getUrgency(task) ===
            "atrasada"
        ).length,

      political:
        this.getByType(
          "politica"
        ).length,

      financial:
        this.getByType(
          "financeiro"
        ).length,

      contracts:
        this.getByType(
          "contrato"
        ).length,

      market:
        this.getByType(
          "mercado"
        ).length

    };

  }

};

window.Tasks = Tasks;
