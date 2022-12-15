const { EjectedMass } = require('../entity/index.js');
const Mode = require('./Mode');
class EjectEat extends Mode {
    constructor() {
        super();
        this.ID = 4;
        this.name = "Eject Eat";
        this.specByLeaderboard = true;
        EjectedMass.prototype.canEat = (cell) => {
            // console.log(cell.type);
            return cell.type === 0 ? true : false
        };
    }
    // Gamemode Specific Functions
    onPlayerSpawn(server, player) {
        player.color = server.getRandomColor();
        // Spawn player
        server.spawnPlayer(player, server.randomPos());
    }
    updateLB(server, lb) {
        server.leaderboardType = this.packetLB;
        for (var i = 0, pos = 0; i < server.clients.length; i++) {
            var player = server.clients[i].player;
            if (player.isRemoved || !player.cells.length ||
                player.socket.isConnected == false || (!server.config.minionsOnLeaderboard && player.isMi))
                continue;
            for (var j = 0; j < pos; j++)
                if (lb[j]._score < player._score)
                    break;
            lb.splice(j, 0, player);
            pos++;
        }
        this.rankOne = lb[0];
    }
    onEjectSize(cell) {
        return Math.min(180, Math.max(cell._mass / 4, 0)) || 10;
    }

    onEjectSizeLoss(cell) {
        return Math.max(6, Math.min(200, Math.max(cell._mass / 4, 0) + 30)) || 10;
    }

    onEjectVelocity(cell, client) {
        return Math.min(3000,(100 * (cell._mass / 300)) + 720) * (Math.random() * 0.7 + 0.3)
    }
}

module.exports = EjectEat;
EjectEat.prototype = new Mode();
