import { EMPTY_NAME, PI_2, QUAD_TREE_MAX_POINTS } from "./constants.js";
import { Color } from "./lib/Color.js";
import { PointQuadTree } from "./lib/Quad.js";
import { prettyPrintTime, vec2Distance } from "./lib/utils.js";
import { shared } from "./shared.js";
const { camera, border, cells, chat, leaderBoard, stats, other, settings } = shared;

export const mainCanvas = document.querySelector("canvas");
export const mainCtx = mainCanvas.getContext("2d");

function toCamera(ctx) {
  ctx.translate(mainCanvas.width / 2, mainCanvas.height / 2);
  scaleForth(ctx);
  ctx.translate(-camera.x, -camera.y);
}

function scaleForth(ctx) {
  ctx.scale(camera.scale, camera.scale);
}

function scaleBack(ctx) {
  ctx.scale(1 / camera.scale, 1 / camera.scale);
}

function fromCamera(ctx) {
  ctx.translate(camera.x, camera.y);
  scaleBack(ctx);
  ctx.translate(-mainCanvas.width / 2, -mainCanvas.height / 2);
}


function render() {
  requestAnimationFrame(render);
  drawGame();
}
requestAnimationFrame(render);

// 2-var draw-stay cache
const cachedNames = new Map();
const cachedMass = new Map();
window.cachedNames = cachedNames;
window.cachedMass = cachedMass;

function cacheCleanup() {
  for (const i of cachedNames.keys()) {
    for (const j of cachedNames.get(i).keys()) {
      if (other.syncAppStamp - cachedNames.get(i).get(j).accessTime >= 5000) {
        cachedNames.get(i).delete(j);
      }
    }
  }
  for (const i of cachedMass.keys()) {
    if (other.syncAppStamp - cachedMass.get(i).accessTime >= 5000) {
      cachedMass.delete(i);
    }
  }
}

export function drawTextOnto(canvas, ctx, text, size) {
  ctx.font = size + 'px Ubuntu';
  ctx.lineWidth = Math.max(~~(size / 10), 2);
  canvas.width = ctx.measureText(text).width + 2 * ctx.lineWidth;
  canvas.height = 4 * size;
  ctx.font = size + 'px Ubuntu';
  ctx.lineWidth = Math.max(~~(size / 10), 2);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFF'
  ctx.strokeStyle = '#000';
  ctx.translate(canvas.width / 2, 2 * size);
  (ctx.lineWidth !== 1) && ctx.strokeText(text, 0, 0);
  ctx.fillText(text, 0, 0);
}
export function drawRaw(ctx, x, y, text, size) {
  ctx.font = size + 'px Ubuntu';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.lineWidth = Math.max(~~(size / 10), 2);
  ctx.fillStyle = '#FFF'
  ctx.strokeStyle = '#000';
  (ctx.lineWidth !== 1) && ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
  ctx.restore();
}
function newNameCache(value, size) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  drawTextOnto(canvas, ctx, value, size);
  if (!cachedNames.has(value)) cachedNames.set(value, new Map());
  const cache = {
    width: canvas.width,
    height: canvas.height,
    canvas: canvas,
    value: value,
    size: size,
    accessTime: other.syncAppStamp
  };
  cachedNames.get(value).set(size, cache);
  return cache;
}
function newMassCache(size) {
  const canvases = {
    0: {}, 1: {}, 2: {}, 3: {}, 4: {},
    5: {}, 6: {}, 7: {}, 8: {}, 9: {}
  };
  for (const i in canvases) {
    const canvas = canvases[i].canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    drawTextOnto(canvas, ctx, i, size);
    canvases[i].canvas = canvas;
    canvases[i].width = canvas.width;
    canvases[i].height = canvas.height;
  }
  const cache = {
    canvases: canvases,
    size: size,
    lineWidth: Math.max(~~(size / 10), 2),
    accessTime: other.syncAppStamp
  };
  cachedMass.set(size, cache);
  return cache;
}

function toleranceTest(a, b, tolerance) {
  return (a - tolerance) <= b && b <= (a + tolerance);
}

function getNameCache(value, size) {
  if (!cachedNames.has(value)) return newNameCache(value, size);
  const sizes = Array.from(cachedNames.get(value).keys());
  for (let i = 0, l = sizes.length; i < l; i++) {
    if (toleranceTest(size, sizes[i], size / 4)) {
      return cachedNames.get(value).get(sizes[i]);
    }
  }
  return newNameCache(value, size);
}

function getMassCache(size) {
  const sizes = Array.from(cachedMass.keys());
  for (let i = 0, l = sizes.length; i < l; i++) {
    if (toleranceTest(size, sizes[i], size / 4)) {
      return cachedMass.get(sizes[i]);
    }
  }
  return newMassCache(size);
}


function getLivingScale() {
  let scale = 0; // reset to not cause bugs with viewbox
  for (const cellId of cells.mine) {
    let cell = cells.byId.get(cellId);
    if (cell?.ns) scale += cell.ns;
  }
  if (scale) scale = Math.pow(Math.min(64 / scale, 1), 0.4);
  return scale;
}

export function drawText(ctx, isMass, x, y, size, drawSize, value) {
  ctx.save();
  if (size > 500) return drawRaw(ctx, x, y, value, drawSize);
  ctx.imageSmoothingQuality = 'high';
  if (isMass) {
    const cache = getMassCache(size);
    cache.accessTime = other.syncAppStamp;
    const canvases = cache.canvases;
    const correctionScale = drawSize / cache.size;

    // calculate width
    let width = 0;
    for (let i = 0; i < value.length; i++) {
      width += canvases[value[i]].width - 2 * cache.lineWidth;
    }

    ctx.scale(correctionScale, correctionScale);
    x /= correctionScale;
    y /= correctionScale;
    x -= width / 2;
    for (let i = 0; i < value.length; i++) {
      const item = canvases[value[i]];
      ctx.drawImage(item.canvas, x, y - item.height / 2);
      x += item.width - 2 * cache.lineWidth;
    }
  } else {
    const cache = getNameCache(value, size);
    cache.accessTime = other.syncAppStamp;
    const canvas = cache.canvas;
    const correctionScale = drawSize / cache.size;
    ctx.scale(correctionScale, correctionScale);
    x /= correctionScale;
    y /= correctionScale;
    ctx.drawImage(canvas, x - canvas.width / 2, y - canvas.height / 2);
  }
  ctx.restore();
}


export function drawChat() {
  if (chat.messages.length === 0)
    return chat.visible = false;
  chat.visible = true;
  const canvas = chat.canvas;
  const ctx = canvas.getContext('2d');
  const latestMessages = chat.messages.slice(-15);
  const lines = [];
  for (let i = 0; i < latestMessages.length; i++) {
    lines.push([
      {
        text: latestMessages[i].name,
        color: latestMessages[i].color
      }, {
        text: ` ${latestMessages[i].message}`,
        color: Color.fromHex(settings.darkTheme ? '#FFF' : '#000')
      }
    ]);
  }
  window.lines = lines;
  let width = 0;
  let height = 20 * lines.length + 2;
  for (let i = 0; i < lines.length; i++) {
    let thisLineWidth = 10;
    let complexes = lines[i];
    for (let j = 0; j < complexes.length; j++) {
      ctx.font = '18px Ubuntu';
      complexes[j].width = ctx.measureText(complexes[j].text).width;
      thisLineWidth += complexes[j].width;
    }
    width = Math.max(thisLineWidth, width);
  }
  canvas.width = width;
  canvas.height = height;
  for (let i = 0; i < lines.length; i++) {
    let width = 0;
    let complexes = lines[i];
    for (let j = 0; j < complexes.length; j++) {
      ctx.font = '18px Ubuntu';
      ctx.fillStyle = complexes[j].color.toHex();
      ctx.fillText(complexes[j].text, width, 20 * (1 + i));
      width += complexes[j].width;
    }
  }
}

export function drawStats() {
  if (!stats.info) return stats.visible = false;
  stats.visible = true;

  const canvas = stats.canvas;
  const ctx = canvas.getContext('2d');
  ctx.font = '14px Ubuntu';
  const uptime = prettyPrintTime(stats.info.uptime);
  const rows = [
    `${stats.info.name} (${stats.info.mode})`,
    `${stats.info.playersTotal}/${stats.info.playersLimit} aktif oyuncu`,
    `${stats.info.playersAlive} canlı oyuncu`,
    `${stats.info.playersSpect} izleyici`,
    `${(stats.info.update * 2.5).toFixed(1)}% yük @ ${uptime}`,
  ];
  let width = 0;
  for (const row of rows) {
    width = Math.max(width, 2 + ctx.measureText(row).width + 2);
  }
  canvas.width = width;
  canvas.height = rows.length * (14 + 2);
  ctx.font = '14px Ubuntu';
  ctx.fillStyle = settings.darkTheme ? '#AAA' : '#555';
  ctx.textBaseline = 'top';
  for (let i = 0; i < rows.length; i++) {
    ctx.fillText(rows[i], 2, -1 + i * (14 + 2));
  }
}

export function drawPosition() {
  if (border.centerX !== 0 || border.centerY !== 0 || !settings.showPosition) return;
  const width = 200 * (border.width / border.height);
  const height = 40 * (border.height / border.width);

  let beginX = mainCanvas.width / camera.viewportScale - width;
  let beginY = mainCanvas.height / camera.viewportScale - height;

  if (settings.showMinimap) {
    mainCtx.font = '15px Ubuntu';
    beginX += width / 2 - 1;
    beginY = beginY - 194 * border.height / border.width;
    mainCtx.textAlign = 'right';
    mainCtx.fillStyle = settings.darkTheme ? '#AAA' : '#555';
    mainCtx.fillText(`X: ${~~camera.x}, Y: ${~~camera.y}`, beginX + width / 2, beginY + height / 2);
  } else {
    mainCtx.fillStyle = '#000';
    mainCtx.globalAlpha = 0.4;
    mainCtx.fillRect(beginX, beginY, width, height);
    mainCtx.globalAlpha = 1;
    drawRaw(mainCtx, beginX + width / 2, beginY + height / 2, `X: ${~~camera.x}, Y: ${~~camera.y}`);
  }
}

export function drawLeaderBoard() {
  if (leaderBoard.type === null) return leaderBoard.visible = false;
  if (!settings.showNames || leaderBoard.items.length === 0) {
    return leaderBoard.visible = false;
  }
  leaderBoard.visible = true;
  const canvas = leaderBoard.canvas;
  const ctx = canvas.getContext('2d');


  canvas.width = 200;
  canvas.height = leaderBoard.type == 'pie' ? 240 : leaderBoard.type == 'text' ? 24 * leaderBoard.items.length : 60 + 24 * leaderBoard.items.length;
  ctx.globalAlpha = .4;
  ctx.fillStyle = '#000';

  ctx.fillRect(0, 0, 200, canvas.height);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#FFF';
  ctx.font = '30px Ubuntu';

  if (leaderBoard.type != 'text') {
    ctx.fillText('Sıralama', 100 - ctx.measureText('Sıralama').width / 2, 40);
  }

  if (leaderBoard.type === 'pie') {
    let last = 0;
    for (let i = 0; i < leaderBoard.items.length; i++) {
      ctx.fillStyle = leaderBoard.teams[i];
      ctx.beginPath();
      ctx.moveTo(100, 140);
      ctx.arc(100, 140, 80, last, (last += leaderBoard.items[i] * PI_2), false);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    ctx.font = '20px Ubuntu';
    for (let i = 0; i < leaderBoard.items.length; i++) {
      let color = '#fff';
      let text;
      if (leaderBoard.type === "text") {
        text = leaderBoard.items[i][0];
        color = "#" + (leaderBoard.items[i][1] || 'fff');
      } else {
        text = leaderBoard.items[i].name;
        color = leaderBoard.items[i].me ? '#FAA' : "#fff";
      }
      ctx.fillStyle = color;
      if (leaderBoard.type === 'ffa') {
        text = `${i + 1}. ${text}`;
        const width = ctx.measureText(text).width;
        const start = width > 200 ? 2 : 100 - width * 0.5;
        ctx.fillText(text, start, 70 + 24 * i);
      } else {
        const width = ctx.measureText(text).width;
        const start = width > 200 ? 2 : 100 - width * 0.5;
        ctx.fillText(text, start, 20 + 24 * i);
      }
    }
  }
}
export function drawGrid() {
  mainCtx.save();
  mainCtx.lineWidth = 1;
  mainCtx.strokeStyle = settings.darkTheme ? '#AAA' : '#000';
  mainCtx.globalAlpha = 0.2;
  const step = 50;
  const cW = mainCanvas.width / camera.scale;
  const cH = mainCanvas.height / camera.scale;
  const startLeft = (-camera.x + cW / 2) % step;
  const startTop = (-camera.y + cH / 2) % step;

  scaleForth(mainCtx);
  mainCtx.beginPath();
  for (let i = startLeft; i < cW; i += step) {
    mainCtx.moveTo(i, 0);
    mainCtx.lineTo(i, cH);
  }
  for (let i = startTop; i < cH; i += step) {
    mainCtx.moveTo(0, i);
    mainCtx.lineTo(cW, i);
  }
  mainCtx.stroke();
  mainCtx.restore();
}
export function drawBackgroundSectors() {
  if (border === undefined || border.width === undefined) return;
  mainCtx.save();

  const sectorCount = 5;
  const sectorNames = ['ABCDE', '12345'];
  const w = border.width / sectorCount;
  const h = border.height / sectorCount;

  toCamera(mainCtx);
  mainCtx.fillStyle = settings.darkTheme ? '#666' : '#DDD';
  mainCtx.textBaseline = 'middle';
  mainCtx.textAlign = 'center';
  mainCtx.font = `${w / 3 | 0}px Ubuntu`;

  for (let y = 0; y < sectorCount; ++y) {
    for (let x = 0; x < sectorCount; ++x) {
      const str = sectorNames[0][x] + sectorNames[1][y];
      const dx = (x + 0.5) * w + border.left;
      const dy = (y + 0.5) * h + border.top;
      mainCtx.fillText(str, dx, dy);
    }
  }
  mainCtx.restore();
}
export function drawMinimap() {
  if (border.centerX !== 0 || border.centerY !== 0 || !settings.showMinimap) return;
  mainCtx.save();
  mainCtx.resetTransform();
  const targetSize = 200;
  const borderAR = border.width / border.height; // aspect ratio
  const width = targetSize * borderAR * camera.viewportScale;
  const height = targetSize / borderAR * camera.viewportScale;
  const beginX = mainCanvas.width - width;
  const beginY = mainCanvas.height - height;

  mainCtx.fillStyle = '#000';
  mainCtx.globalAlpha = 0.4;
  mainCtx.fillRect(beginX, beginY, width, height);
  mainCtx.globalAlpha = 1;

  const sectorCount = 5;
  const sectorNames = ['ABCDE', '12345'];
  const sectorWidth = width / sectorCount;
  const sectorHeight = height / sectorCount;
  const sectorNameSize = Math.min(sectorWidth, sectorHeight) / 3;

  mainCtx.fillStyle = settings.darkTheme ? '#666' : '#DDD';
  mainCtx.textBaseline = 'middle';
  mainCtx.textAlign = 'center';
  mainCtx.font = `${sectorNameSize}px Ubuntu`;

  for (let i = 0; i < sectorCount; i++) {
    const x = (i + 0.5) * sectorWidth;
    for (let j = 0; j < sectorCount; j++) {
      const y = (j + 0.5) * sectorHeight;
      mainCtx.fillText(sectorNames[0][i] + sectorNames[1][j], beginX + x, beginY + y);
    }
  }

  const xScale = width / border.width;
  const yScale = height / border.height;
  const halfWidth = border.width / 2;
  const halfHeight = border.height / 2;
  const myPosX = beginX + (camera.x + halfWidth) * xScale;
  const myPosY = beginY + (camera.y + halfHeight) * yScale;

  const xIndex = (myPosX - beginX) / sectorWidth | 0;
  const yIndex = (myPosY - beginY) / sectorHeight | 0;
  const lightX = beginX + xIndex * sectorWidth;
  const lightY = beginY + yIndex * sectorHeight;
  mainCtx.fillStyle = 'yellow';
  mainCtx.globalAlpha = 0.3;
  mainCtx.fillRect(lightX, lightY, sectorWidth, sectorHeight);
  mainCtx.globalAlpha = 1;

  mainCtx.beginPath();
  if (cells.mine.length) {
    for (const id of cells.mine) {
      const cell = cells.byId.get(id);
      if (!cell) continue;
      mainCtx.fillStyle = cell.color.toHex(); // repeat assignment of same color is OK
      const x = beginX + (cell.x + halfWidth) * xScale;
      const y = beginY + (cell.y + halfHeight) * yScale;
      const r = Math.max(cell.s, 200) * (xScale + yScale) / 2;
      mainCtx.moveTo(x + r, y);
      mainCtx.arc(x, y, r, 0, PI_2);
    }
  } else {
    mainCtx.fillStyle = '#FAA';
    mainCtx.arc(myPosX, myPosY, 5, 0, PI_2);
  }
  mainCtx.fill();

  // draw name above user's pos if they have a cell on the screen
  const cell = cells.byId.get(cells.mine.find(id => cells.byId.has(id)));
  if (cell) {
    mainCtx.fillStyle = settings.darkTheme ? '#DDD' : '#222';
    mainCtx.font = `${sectorNameSize}px Ubuntu`;
    mainCtx.fillText(cell.name || EMPTY_NAME, myPosX, myPosY - 7 - sectorNameSize / 2);
  }

  mainCtx.restore();
}

export function drawBorders() {
  if (!settings.showBorder) return;
  mainCtx.strokeStyle = '#5662f6';
  mainCtx.lineWidth = 20;
  mainCtx.lineCap = 'round';
  mainCtx.lineJoin = 'round';
  mainCtx.beginPath();
  mainCtx.moveTo(border.left, border.top);
  mainCtx.lineTo(border.right, border.top);
  mainCtx.lineTo(border.right, border.bottom);
  mainCtx.lineTo(border.left, border.bottom);
  mainCtx.closePath();
  mainCtx.stroke();
}

function drawGame() {
  stats.fps += (1000 / Math.max(Date.now() - other.syncAppStamp, 1) - stats.fps) / 10;
  other.syncAppStamp = Date.now();

  const drawList = cells.list.slice(0).sort(cellSort);
  // console.log(drawList.length);
  for (const cell of drawList) cell.update(other.syncAppStamp);
  cameraUpdate();
  if (settings.jellyPhysics) {
    updateQuadTree();
    for (const cell of drawList) {
      cell.updateNumPoints();
      cell.movePoints();
    }
  }

  mainCtx.save();
  mainCtx.resetTransform();

  mainCtx.fillStyle = settings.darkTheme ? '#111' : '#F2FBFF';
  mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
  if (settings.showGrid) drawGrid();
  if (settings.backgroundSectors) drawBackgroundSectors();

  toCamera(mainCtx);
  drawBorders();
  let __scale = getLivingScale();
  for (const cell of drawList) {
    // let distance = vec2Distance(cell.x, cell.y, camera.x, camera.y);

    // if (cells.mine.includes(cell.id) || (distance < ((1920 / __scale / 2)))) cell.draw(mainCtx);
    // console.log(stats.scale)
    cell.draw(mainCtx);
  }

  fromCamera(mainCtx);
  other.quadTree = null;
  mainCtx.scale(camera.viewportScale, camera.viewportScale);

  let height = 2;
  mainCtx.fillStyle = settings.darkTheme ? '#FFF' : '#000';
  mainCtx.textBaseline = 'top';
  if (!isNaN(stats.score)) {
    mainCtx.font = '30px Ubuntu';
    mainCtx.fillText(`Skor: ${stats.score}`, 2, height);
    height += 30;
  }
  mainCtx.font = '20px Ubuntu';
  const gameStatsText = `${~~stats.fps} FPS` + (isNaN(stats.latency) ? '' : ` ${stats.latency}ms ping`);
  mainCtx.fillText(gameStatsText, 2, height);
  height += 24;

  if (stats.visible) {
    mainCtx.drawImage(stats.canvas, 2, height);
  }
  if (leaderBoard.visible) {
    mainCtx.drawImage(
      leaderBoard.canvas,
      mainCanvas.width / camera.viewportScale - 10 - leaderBoard.canvas.width,
      10);
  }
  if (settings.showChat && (chat.visible || other.isTyping)) {
    mainCtx.globalAlpha = other.isTyping ? 1 : Math.max(1000 - other.syncAppStamp + chat.waitUntil, 0) / 1000;
    mainCtx.drawImage(
      chat.canvas,
      10 / camera.viewportScale,
      (mainCanvas.height - 55) / camera.viewportScale - chat.canvas.height
    );
    mainCtx.globalAlpha = 1;
  }
  drawMinimap();
  drawPosition();

  mainCtx.restore();

  // if (minionControlled) {
  //   mainCtx.save();
  //   mainCtx.font = '18px Ubuntu';
  //   mainCtx.textAlign = 'center';
  //   mainCtx.textBaseline = 'hanging';
  //   mainCtx.fillStyle = '#eea236';
  //   const text = 'Minyon kontrol ediyorsun, Q basarak geri dönebilirsin.';
  //   mainCtx.fillText(text, mainCanvas.width / 2, 5);
  //   mainCtx.restore();
  // }

  cacheCleanup();
}

function cellSort(a, b) {
  return a.s === b.s ? a.id - b.id : a.s - b.s;
}

function cameraUpdate() {
  const myCells = [];
  for (const id of cells.mine) {
    const cell = cells.byId.get(id);
    if (cell) myCells.push(cell);
  }
  if (myCells.length > 0) {
    let x = 0;
    let y = 0;
    let s = 0;
    let score = 0;
    for (const cell of myCells) {
      score += ~~(cell.ns * cell.ns / 100);
      x += cell.x;
      y += cell.y;
      s += cell.s;
    }
    camera.target.x = x / myCells.length;
    camera.target.y = y / myCells.length;
    camera.sizeScale = Math.pow(Math.min(64 / s, 1), 0.4);
    camera.target.scale = camera.sizeScale;
    camera.target.scale *= camera.viewportScale * camera.userZoom;
    camera.x = (camera.target.x + camera.x) / 2;
    camera.y = (camera.target.y + camera.y) / 2;
    stats.score = score;
    stats.maxScore = Math.max(stats.maxScore, score);
  } else {
    stats.score = NaN;
    stats.maxScore = 0;
    camera.x += (camera.target.x - camera.x) / 20;
    camera.y += (camera.target.y - camera.y) / 20;
  }
  camera.scale += (camera.target.scale - camera.scale) / 9;
}

export function updateQuadTree() {
  const w = 1920 / camera.sizeScale;
  const h = 1920 / camera.sizeScale;
  const x = (camera.x - w / 2);
  const y = (camera.y - h / 2);
  other.quadTree = new PointQuadTree(x, y, w, h, QUAD_TREE_MAX_POINTS);
  for (const cell of cells.list) {
    for (const point of cell.points) other.quadTree.insert(point);
  }
}

window.onresize = () => {
  const width = mainCanvas.width = window.innerWidth;
  const height = mainCanvas.height = window.innerHeight;
  camera.viewportScale = Math.max(width / 1920, height / 1920);
};
window.onresize();