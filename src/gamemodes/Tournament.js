var Mode = require("./Mode");

class Tournament extends Mode {
  #maxContenders;
  constructor() {
    super();
    this.ID = 5;
    this.name = "Turnuva";
    this.packetLB = 48;
    this.isTournament = true;
    // Config (1 tick = 1000 ms)
    this.prepTime = 5; // Amount of ticks after the server fills up to wait until starting the game
    this.endTime = 15; // Amount of ticks after someone wins to restart the game
    this.autoFill = false;
    this.autoFillPlayers = 1;
    this.dcTime = 0;

    this.specByLeaderboard = true;

    // Gamemode Specific Variables
    this.gamePhase = 0; // 0 = Waiting for players, 1 = Prepare to start, 2 = Game in progress, 3 = End
    this.contenders = [];
    this.maxContenders = 2;
    this.isPlayerLb = false;

    this.winner;
    this.timer;
    this.timeLimit = 3600 / 3;
  }
  set maxContenders(v) {
    return this.#maxContenders = v;
    // if (!this.#maxContenders) return this.#maxContenders = v;
    // else return this.#maxContenders;
  }
  get maxContenders() {
    return this.#maxContenders;
  }

  startGamePrep(gameServer) {
    this.gamePhase = 1;
    this.timer = this.prepTime; // 10 seconds
  };

  startGame(gameServer) {
    gameServer.run = true;
    this.gamePhase = 2;
    this.getSpectate(); // Gets a random person to spectate
    gameServer.config.playerDisconnectTime = this.dcTime; // Reset config
  };

  endGame(gameServer) {
    this.winner = this.contenders[0];
    this.gamePhase = 3;
    this.timer = this.endTime; // 30 Seconds
  };

  endGameTimeout(gameServer) {
    gameServer.run = false;
    this.gamePhase = 4;
    this.timer = this.endTime; // 30 Seconds
  };

  fillBots(gameServer) {
    // Fills the server with bots if there arent enough players
    var fill = this.maxContenders - this.contenders.length;
    for (var i = 0; i < fill; i++) {
      gameServer.bots.addBot();
    }
  };

  prepare(gameServer) {
    // Remove all cells
    var len = gameServer.nodes.length;
    for (var i = 0; i < len; i++) {
      var node = gameServer.nodes[0];

      if (!node) {
        continue;
      }

      gameServer.removeNode(node);
    }

    //Kick all bots for restart.
    for (var i = 0; i < gameServer.clients.length; i++) {
      if (gameServer.clients[i].isConnected != null) continue; // verify that the client is a bot
      gameServer.clients[i].close();
    }

    // gameServer.bots.loadNames();

    // Pauses the server
    gameServer.run = false;
    this.gamePhase = 0;

    // Get config values
    if (gameServer.config.tourneyAutoFill > 0) {
      this.timer = gameServer.config.tourneyAutoFill;
      this.autoFill = true;
      this.autoFillPlayers = gameServer.config.tourneyAutoFillPlayers;
    }
    // Handles disconnections
    this.dcTime = gameServer.config.playerDisconnectTime;
    gameServer.config.playerDisconnectTime = 0;

    this.prepTime = gameServer.config.tourneyPrepTime;
    this.endTime = gameServer.config.tourneyEndTime;
    this.maxContenders =
      parseInt(process.env.playerLimit) || gameServer.config.tourneyMaxPlayers;

    // Time limit
    //this.timeLimit = gameServer.config.tourneyTimeLimit * 60; // in seconds
  };

  getSpectate() {
    // Finds a random person to spectate
    var index = Math.floor(Math.random() * this.contenders.length);
    this.rankOne = this.contenders[index];
  };

  onPlayerDeath(gameServer) {
    // Nothing
  };

  formatTime(time) {
    if (time < 0) {
      return "0:00";
    }
    // Format
    var min = Math.floor(this.timeLimit / 60);
    var sec = this.timeLimit % 60;
    sec = sec > 9 ? sec : "0" + sec.toString();
    return min + ":" + sec;
  };

  onServerInit(gameServer) {
    this.prepare(gameServer);
  };

  onPlayerSpawn(gameServer, player) {
    // Only spawn players if the game hasnt started yet
    if (this.gamePhase == 0 && this.contenders.length < this.maxContenders) {
      player.color = gameServer.getRandomColor(); // Random color
      this.contenders.push(player); // Add to contenders list
      gameServer.spawnPlayer(player, gameServer.randomPos());

      if (this.contenders.length == this.maxContenders) {
        // Start the game once there is enough players
        this.startGamePrep(gameServer);
      }
    }
  };

  onCellRemove(cell) {
    var owner = cell.owner,
      human_just_died = false;

    if (owner.cells.length <= 0) {
      // Remove from contenders list
      var index = this.contenders.indexOf(owner);
      if (index != -1 && this.ID != 6) {
        if (!(this.ID == 7 && owner.can > 1)) {
          if ("_socket" in this.contenders[index].socket) {
            human_just_died = true;
          }
          this.contenders.splice(index, 1);
        }
      }

      // Victory conditions
      var humans = 0;
      for (var i = 0; i < this.contenders.length; i++) {
        if ("_socket" in this.contenders[i].socket) {
          humans++;
        }
      }

      // the game is over if:
      // 1) there is only 1 player left, OR
      // 2) all the humans are dead, OR
      // 3) the last-but-one human just died
      if (
        (this.contenders.length == 1 ||
          humans == 0 ||
          (humans == 1 && human_just_died)) &&
        this.gamePhase == 2
      ) {
        this.endGame(cell.owner.gameServer);
      } else {
        // Do stuff
        this.onPlayerDeath(cell.owner.gameServer, cell.owner);
      }
    }
  };

  updateLB_FFA(gameServer, lb) {
    gameServer.leaderboardType = 49;
    for (var i = 0, pos = 0; i < gameServer.clients.length; i++) {
      var player = gameServer.clients[i].playerTracker;
      if (
        player.isRemoved ||
        !player.cells.length ||
        player.socket.isConnected == false ||
        player.isMi
      )
        continue;

      for (var j = 0; j < pos; j++) if (lb[j]._score < player._score) break;

      lb.splice(j, 0, player);
      pos++;
    }
    this.rankOne = lb[0];
  };

  updateLB(gameServer, lb) {
    gameServer.leaderboardType = this.packetLB;
    switch (this.gamePhase) {
      case 0:
        lb[0] = "Bekleniyor...";
        lb[1] = "Oyuncular: ";
        lb[2] = this.contenders.length + "/" + this.maxContenders;
        if (this.autoFill) {
          if (this.timer <= 0) {
            this.fillBots(gameServer);
          } else if (this.contenders.length >= this.autoFillPlayers) {
            lb[3] = "-----------------";
            lb[4] = "Botlar cümbüş";
            lb[5] = " ediyor";
            lb[6] = this.timer.toString();
            this.timer--;
          }
        }
        break;
      case 1:
        lb[0] = "Oyun başlıyor";
        lb[1] = this.timer.toString();
        lb[2] = "İyi şanslar!";
        if (this.timer <= 0) {
          // Reset the game
          this.startGame(gameServer);
        } else {
          this.timer--;
        }
        break;
      case 2:
        if (!this.isPlayerLb) {
          gameServer.leaderboardType = this.packetLB;
          lb[0] = "Oyuncu Lazım";
          lb[1] = this.contenders.length + "/" + (this.maxContenders ?? 4);
          lb[2] = "Kalan Süre:";
          lb[3] = this.formatTime(this.timeLimit);
        } else {
          this.updateLB_FFA(gameServer, lb);
        }
        if (this.timeLimit < 0) {
          // Timed out
          this.endGame(gameServer);
        } else {
          if (
            this.timeLimit % gameServer.config.tourneyLeaderboardToggleTime ==
            0
          ) {
            this.isPlayerLb ^= true;
          }
          this.timeLimit--;
        }
        break;
      case 3:
        lb[0] = "Tebrikler!";
        lb[1] = this.winner._name;
        lb[2] = "kazandı!";
        if (this.timer <= 0) {
          // Reset the game
          this.prepare(gameServer);
          this.endGameTimeout(gameServer);
        } else {
          lb[3] = "-----------------";
          lb[4] = "Oyun yenileniyor";
          lb[5] = this.timer.toString();
          this.timer--;
        }
        break;
      case 4:
        lb[0] = "Zaman";
        lb[1] = "Doldu!";
        if (this.timer <= 0) {
          // Reset the game
          this.onServerInit(gameServer);
        } else {
          lb[2] = "Oyun yenileniyor";
          lb[3] = this.timer.toString();
          this.timer--;
        }
      default:
        break;
    }
  };


}

module.exports = Tournament;



