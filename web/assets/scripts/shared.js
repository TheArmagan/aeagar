export let shared = {
  other: {
    syncUpdStamp: Date.now(),
    syncAppStamp: Date.now(),
    mouseX: 0,
    mouseY: 0,
    isTyping: false,
    skin: localStorage.getItem("aeAgarSkin") || "4DXvCFs",
    name: localStorage.getItem("aeAgarName") || "İsimsiz Oyuncu",
    quadTree: null,
    pressedKeys: new Set(),
    minionControlled: false,
    lastPlayAt: 0,
    blackListedSkins: [
      "13231"
    ]
  },
  cells: {
    list: [],
    byId: new Map(),
    mine: []
  },
  border: {
    left: -2000,
    right: 2000,
    top: -2000,
    bottom: 2000,
    width: 4000,
    height: 4000,
    centerX: -1,
    centerY: -1
  },
  leaderBoard: {
    type: null,
    items: null,
    canvas: document.createElement('canvas'),
    teams: ['#F33', '#3F3', '#33F']
  },
  chat: {
    messages: [],
    waitUntil: 0,
    canvas: document.createElement('canvas'),
    visible: false,
  },
  stats: {
    fps: 0,
    latency: NaN,
    supports: null,
    info: null,
    pingLoopId: NaN,
    pingLoopStamp: null,
    canvas: document.createElement('canvas'),
    visible: false,
    score: NaN,
    maxScore: 0
  },
  camera: {
    x: 0,
    y: 0,
    target: {
      x: 0,
      y: 0,
      scale: 1
    },
    viewportScale: 1,
    userZoom: 1,
    sizeScale: 1,
    scale: 1
  },
  settings: {
    showSkins: true,
    showNames: true,
    darkTheme: true,
    showColor: true,
    showMass: true,
    showChat: true,
    showMinimap: true,
    showPosition: true,
    showBorder: true,
    showGrid: true,
    moreZoom: true,
    fillSkin: false,
    jellyPhysics: true,
  }
};

window.shared = shared;