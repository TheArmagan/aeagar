import { sendMouseMove, send } from "./connection.js";
import { KEY_TO_OPCODE, UINT8_CACHE } from "./constants.js";
import { mainCanvas } from "./game.js";
import { internalVueApp } from "./interface.js";
import { shared } from "./shared.js";
const { camera, border, cells, chat, leaderBoard, stats, other, settings } = shared;

export function onDie() {
  console.log(cells);
  internalVueApp.isESCOverlayVisible = true;
}

let wInterval;

export function onKeyDown(e) {
  if (KEY_TO_OPCODE[e.code]) return send(KEY_TO_OPCODE[e.code]);
  switch (e.code) {
    case "Space": {
      send(UINT8_CACHE[other.minionControlled ? 22 : 17]);
      break;
    }
    case "KeyQ": {
      send(UINT8_CACHE[18]);
      other.minionControlled = !other.minionControlled;
      break;
    }
    case "KeyW": {
      send(UINT8_CACHE[other.minionControlled ? 23 : 21]);
      if (!wInterval) wInterval = setInterval(() => send(UINT8_CACHE[other.minionControlled ? 23 : 21]), 1000 / 10);
    }
  }
}

export function onMouseMove(e) {

}

export function onKeyUp(e) {
  switch (e.code) {
    case "KeyW": {
      if (!wInterval) return;
      clearInterval(wInterval);
      wInterval = null;
    }
  }
}

export function onWheel(e) {
  camera.userZoom *= e.deltaY > 0 ? 0.8 : 1.2;
  camera.userZoom = Math.max(camera.userZoom, settings.moreZoom ? 0.05 : 1);
  camera.userZoom = Math.min(camera.userZoom, 4);
}

export function onTouchStart(e) {
  if (e.target.classList.contains("mobile-btn")) {
    if (e.target.classList.contains("menu")) internalVueApp.isESCOverlayVisible = true;
    if (e.target.classList.contains("split")) send(UINT8_CACHE[17]);
    if (e.target.classList.contains("eject")) send(UINT8_CACHE[21]);
    return;
  }
  if (!internalVueApp.isESCOverlayVisible) {
    internalVueApp.isTouching = true;
    onTouchMove(e);
  }
}

export function onTouchMove(e) {
  if (internalVueApp.isESCOverlayVisible) return;
  const touch = e.touches[0];
  other.mouseX = touch.pageX;
  other.mouseY = touch.pageY;
  internalVueApp.touchCirclePosition = { x: other.mouseX - (innerWidth * .02), y: other.mouseY - (innerWidth * .02) };
}

export function onTouchEnd(e) {
  if (!e.touches.length) internalVueApp.isTouching = false;
}

setInterval(() => {
  sendMouseMove(
    (other.mouseX - mainCanvas.width / 2) / camera.scale + camera.x,
    (other.mouseY - mainCanvas.height / 2) / camera.scale + camera.y
  );
}, 1000 / 25);