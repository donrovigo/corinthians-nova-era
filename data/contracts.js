const Contracts = {

  getPlayer(playerId) {
    return PLAYERS.find(player => player.id === playerId);
  },

  getStaff(staffId) {
    return STAFF.find(staff => staff.id === staffId);
  },

  getRemainingDays(contractUntil) {
    if (!contractUntil) return 0;

    const today = new Date(Game.state.date);
    const end = new Date(contractUntil);

    return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  },

  isExpiring(contractUntil, days = 180) {
    return this.getRemainingDays(contractUntil) <= days;
  },

  renewPlayer(playerId, newContract) {

    const player = this.getPlayer(playerId);

    if (!player) {
      return {
        success: false,
        message: "Jogador não encontrado."
      };
    }

    const newSalary = Number(newContract.salary || player.salary);
    const newValue = Number(
      newContract.marketValue || player.marketValue
    );

    if (!FINANCE.canAffordContract(newSalary)) {
      return {
        success: false,
        message: "O clube não possui margem financeira para assumir este salário."
      };
    }

    const oldContract = player.contractUntil;

    player.salary = newSalary;
    player.marketValue = newValue;
    player.contractUntil = newContract.contractUntil;

    if (newContract.releaseClause !== undefined) {
      player.releaseClause = newContract.releaseClause;
    }

    Game.log(
      `Contrato renovado: ${player.name} até ${player.contractUntil}.`
    );

    Game.change("dressingRoomMorale", 3);
    Game.change("reputation", 1);

    return {
      success: true,
      player: player.name,
      oldContract,
      newContract: player.contractUntil
    };
  },

  renewStaff(staffId, newContract) {

    const staff = this.getStaff(staffId);

    if (!staff) {
      return {
        success: false,
        message: "Membro da comissão não encontrado."
      };
    }

    const newSalary = Number(newContract.salary || staff.salary);

    if (!FINANCE.canAffordContract(newSalary)) {
      return {
        success: false,
        message: "O clube não possui margem financeira para assumir este salário."
      };
    }

    const oldContract = staff.contractUntil;

    staff.salary = newSalary;
    staff.contractUntil = newContract.contractUntil;

    Game.log(
      `Contrato renovado: ${staff.name} até ${staff.contractUntil}.`
    );

    return {
      success: true,
      staff: staff.name,
      oldContract,
      newContract: staff.contractUntil
    };
  },

  getExpiringPlayers(days = 180) {

    return PLAYERS.filter(player => {

      if (player.club !== "corinthians") return false;

      return this.isExpiring(player.contractUntil, days);

    });
  },

  getExpiringStaff(days = 180) {

    return STAFF.filter(staff => {

      if (staff.status === "inativo") return false;

      return this.isExpiring(staff.contractUntil, days);

    });
  },

  releasePlayer(playerId) {

    const player = this.getPlayer(playerId);

    if (!player) {
      return {
        success: false,
        message: "Jogador não encontrado."
      };
    }

    player.status = "dispensado";
    player.club = null;

    Game.log(
      `Jogador liberado: ${player.name}.`
    );

    FINANCE.calculatePayroll();

    return {
      success: true,
      player: player.name
    };
  },

  releaseStaff(staffId) {

    const staff = this.getStaff(staffId);

    if (!staff) {
      return {
        success: false,
        message: "Membro da comissão não encontrado."
      };
    }

    staff.status = "inativo";

    Game.log(
      `Membro da comissão desligado: ${staff.name}.`
    );

    FINANCE.calculatePayroll();

    return {
      success: true,
      staff: staff.name
    };
  },

  getContractSummary() {

    const players = this.getExpiringPlayers(180);
    const staff = this.getExpiringStaff(180);

    return {
      playersExpiring: players,
      staffExpiring: staff,
      totalPlayers: players.length,
      totalStaff: staff.length
    };
  }

};

window.Contracts = Contracts;
