import { sendMouseMove } from "./connection.js";
import { mainCanvas } from "./game.js";
import { shared } from "./shared.js";
const { camera, border, cells, chat, leaderBoard, stats, other, settings } = shared;

setInterval(() => {
  sendMouseMove(
    (other.mouseX - mainCanvas.width / 2) / camera.scale + camera.x,
    (other.mouseY - mainCanvas.height / 2) / camera.scale + camera.y
  );
}, 1000 / 25);