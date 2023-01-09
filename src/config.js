module.exports = {
  // MultiOgarII configurations file
  // Lines starting with // are comments

  // [NOTES]
  // MultiOgarII uses cell size instead of cell mass to improve performance!
  // In order to get the cell size from mass value, you need to calculate using this formula:
  //    size: SQRT( mass * 100 )
  //
  // For example, to set start mass: 43:
  //     size: SQRT( 43 * 100 ): SQRT( 4300 ): 65.57
  // Set playerStartSize: 66
  //
  // Also, you can use the following syntax to specify mass:
  //     playerStartSize: massToSize(43)
  // It will be automatically converted to 66

  // [LOGGING]
  // logVerbosity: Console log level (0=NONE// 1=FATAL// 2=ERROR// 3=WARN// 4=INFO// 5=DEBUG)
  // logFileVerbosity: File log level
  "logVerbosity": 4,
  "logFileVerbosity": 5,

  // [SERVER]
  // serverTimeout: Seconds to keep connection alive for non-responding client
  // serverMaxConnections: Maximum number of connections to the server. (0 for no limit)
  // serverPort: Server port which will be used to listen for incoming connections
  // serverBind: Server network interface which will be used to listen for incoming connections (0.0.0.0 for all IPv4 interfaces)
  // serverTracker: Set to 1 if you want to show your server on the tracker http://ogar.mivabe.nl/master (check that your server port is opened for external connections first!)
  // serverGamemode: Gamemodes: 0: FFA, 1: Teams, 2: Experimental, 3: Rainbow
  // serverBots: Number of player bots to spawn (Experimental)
  // serverViewBase: Base view distance of players. Warning: high values may cause lag! Min value is 1920x1920
  // serverMinScale: Minimum viewbox scale for player (low value leads to lags due to large visible area for big cell)
  // serverSpectatorScale: Scale (field of view) used for free roam spectators (low value leads to lag, vanilla: 0.4, old vanilla: 0.25)
  // serverStatsPort: Port for the stats server. Having a negative number will disable the stats server.
  // serverStatsUpdate: Update interval of server stats in seconds
  // mobilePhysics: Whether or not the server uses mobile agar.io physics
  // badWordFilter: Toggle whether you enable bad word filter (set to 0 to disable)
  // serverRestart: Toggle whether you want your server to auto-restart in minutes. (set to 0 to disable)
  "serverTimeout": 300,
  "serverMaxConnections": 300,
  "serverPort": 6780,
  "serverBind": "0.0.0.0",
  "serverTracker": 0,
  "serverGamemode": 4,
  "serverBots": 0,
  "serverViewBaseX": 1920,
  "serverViewBaseY": 1080,
  "serverMinScale": 0.15,
  "serverSpectatorScale": 0.4,
  "serverStatsPort": 6779,
  "serverStatsUpdate": 10,
  "mobilePhysics": 1,
  "badWordFilter": 0,
  "serverRestart": 0,

  // [CLIENT]
  // serverMaxLB: Controls the maximum players displayed on the leaderboard.
  // serverChat: Allows the usage of server chat. 0: no chat, 1: use chat.
  // serverChatAscii: Set to 1 to disable non-ANSI letters in the chat (english only)
  // serverName: Server name, for example "My great server"
  // serverWelcome1: First server welcome message
  // serverWelcome2: Second server welcome message (optional, for info, etc)
  // clientBind: Only allow connections to the server from specified client (eg: http://agar.io - http://mywebsite.com - http://more.com) [Use ' - ' to seperate different websites]
  "serverMaxLB": 10,
  "serverChat": 1,
  "serverChatAscii": 0,
  "separateChatForTeams": 0,
  "serverName": "OgarBL #1",
  "serverWelcomes": [
    "Armağan'ın özel AgarIO sunucusuna hoşgeldiniz!",
    "discord.gg/acord"
  ],
  "clientBind": "",

  // [ANTI-BOT]
  // serverIpLimit: Controls the maximum number of connections from the same IP (0 for no limit)
  // serverMinionIgnoreTime: minion detection disable time on server startup [seconds]
  // serverMinionThreshold: max connections within serverMinionInterval time period, which will not be marked as minion
  // serverMinionInterval: minion detection interval [milliseconds]
  // serverScrambleLevel: Toggles scrambling of coordinates. 0: No scrambling, 1: lightweight scrambling. 2: full scrambling (also known as scramble minimap), 3 - high level scrambling (no border)
  // playerBotGrow: Cells greater than 625 mass cannot grow from players under 17 mass (set to 1 to disable)
  "serverIpLimit": 300,
  "serverMinionIgnoreTime": 30,
  "serverMinionThreshold": 10,
  "serverMinionInterval": 1000,
  "serverScrambleLevel": 0,
  "playerBotGrow": 0,

  // [BORDER]
  // Border size (vanilla 14142.135623730952)
  "borderWidth": 14142,
  "borderHeight": 14142,

  // [FOOD]
  // foodMinSize: vanilla 10 (mass: 10*10/100: 1 mass)
  // foodMaxSize: vanilla 20 (mass: 20*20/100: 4 mass)
  // foodAmount: The number of food to spawn
  // foodMassGrow: Enable food mass grow ?
  "foodMinSize": 10,
  "foodMaxSize": 20,
  "foodAmount": 12000,
  "foodMassGrow": 1,

  // [VIRUSES]
  // virusMinSize: Minimum virus size. (vanilla: mass: val*val/100: 100 mass)
  // virusMaxSize: Maximum virus size (vanilla: mass: val*val/100: 200 mass)
  // virusMaxPoppedSize: Maximum size a popped cell can have
  // virusEqualPopSize: Whether popped cells have equal size or not (1 to enable)
  // virusAmount: Amount of viruses to spawn
  // virusMaxAmount": Maximum amount of viruses allowed ingame.
  // motherCellMaxMass: Maximum amount of mass a mothercell is allowed to have (0 for no limit)
  // virusVelocity: Velocity of moving viruses (speed and distance)
  // virusMaxCells: Maximum cells a player is allowed to have from virus splits (0 for playerMaxCells)
  "virusMinSize": 80,
  "virusMaxSize": 100,
  "virusMaxPoppedSize": 80,
  "virusEqualPopSize": 1,
  "virusAmount": 50,
  "virusMaxAmount": 150,
  "motherCellMaxMass": 0,
  "virusVelocity": 780,
  "virusMaxCells": 0,

  // [EJECTED MASS]
  // ejectSize: vanilla: mass: val*val/100: 13 mass?
  // ejectSizeLoss: Eject size which will be substracted from player cell (vanilla: mass: val*val/100: 18 mass?)
  // ejectCooldown: Tick count until a player can eject mass again in ticks (1 tick: 40 ms)
  // ejectSpawnPercent: Chance for a player to spawn from ejected mass. 0.5: 50% (set to 0 to disable)
  // ejectVirus: Whether or not players can eject viruses instead of mass
  // ejectVelocity: Velocity of ejecting cells (speed and distance)
  "ejectSize": 36.06,
  "ejectSizeLoss": 42.43,
  "ejectCooldown": 1,
  "ejectSpawnPercent": 0.5,
  "ejectVirus": 0,
  "ejectVelocity": 1400,

  // [PLAYERS]
  // Reminder: MultiOgarII uses cell size instead of mass!
  //       playerStartMass replaced with playerStartSize
  //
  // playerMinSize: Minimum size a player cell can decay too. (vanilla: val*val/100: 10 mass)
  // playerMaxSize: Maximum size a player cell can have before auto-splitting. (vanilla: mass: val*val/100: 22500 mass)
  // playerMinSplitSize: Mimimum size a player cell has to be to split. (vanilla: mass: val*val/100: 35 mass)
  // playerMinEjectSize: Minimum size a player cell has to be to eject mass. (vanilla: mass: val*val/100: 35 mass)
  // playerStartSize: Start size of the player cell. (vanilla: mass: val*val/100: 10 mass)
  // playerMaxCells: Maximum cells a player is allowed to have. (vanilla is 16)
  // playerSpeed: Player speed multiplier (1: normal speed, 2: twice the normal speed)
  // playerRecombineTime: Base time in seconds before a cell is allowed to recombine (vanilla: 30 seconds)
  // playerDecayRate: Amount of player cell size lost per second
  // playerDecayCap: Maximum mass a cell can have before it's decayrate multiplies by 10. (0 to disable)
  // playerDisconnectTime: Time in seconds before a disconnected player's cell is removed from the server (Set to -1 to never remove)
  // splitVelocity: Velocity of splitting playercells (speed and distance)
  "playerMinSize": 10,
  "playerMaxSize": 1_000_000_000,
  "playerMinSplitSize": 35,
  "playerMinEjectSize": 35,
  "playerStartSize": 100,
  "playerMaxCells": 16,
  "playerSpeed": 2,
  "playerDecayRate": 0.01,
  "playerDecayCap": 0,
  "playerRecombineTime": 30,
  "playerMaxNickLength": 30,
  "playerDisconnectTime": -1,
  "splitVelocity": 780,

  // [MINIONS]
  // Custom minion settings
  // minionStartSize: Start size of minions (mass: val*val/100: 10 mass)
  // minionMaxStartSize: Maximum value of random start size for minions (set value higher than minionStartSize to enable)
  // minionCollideTeam: Determines whether minions colide with their team in the Teams gamemode (0: OFF, 1: ON)
  // serverMinions: Amount of minions each player gets once they spawn
  // defaultName: Default name for all minions if name is not specified using command (put <r> before the name for random skins!)
  // minionsOnLeaderboard: Whether or not to show minions on the leaderboard. (Set 0 to disable)
  "minionStartSize": 31.6227766017,
  "minionMaxStartSize": 31.6227766017,
  "minionCollideTeam": 0,
  "serverMinions": 0,
  "defaultName": "minion",
  "minionsOnLeaderboard": 0,

  // [Gamemode]
  // Custom gamemode settings

  // [Tourney]
  // tourneyTimeLimit: Time limit of the game, in minutes.
  // tourneyAutoFill: If set to a value higher than 0, the tournament match will automatically fill up with bots after value seconds
  // tourneyAutoFillPlayers: The timer for filling the server with bots will not count down unless there is this amount of real players
  // tourneyLeaderboardToggle Time for toggling the leaderboard, in seconds. If value set to 0, leaderboard will not toggle.
  "tourneyMaxPlayers": 4,
  "tourneyAutoFill": 0,
  "tourneyAutoFillPlayers": 1,
  "tourneyPrepTime": 10,
  "tourneyEndTime": 30,
  "tourneyTimeLimit": 20,
  "tourneyLeaderboardToggleTime": 0
};
