import { CELL_POINTS_MAX, CELL_POINTS_MIN, PI_2, SKIN_URL, VIRUS_POINTS } from "../constants.js";
import { onDie } from "../controls.js";
import { drawText } from "../game.js";
import { shared } from "../shared.js";
import { Color } from "./Color.js";
import { vec2Distance } from "./utils.js";
const { camera, border, cells, chat, leaderBoard, stats, other, settings } = shared;

const loadedSkins = new Map();

export class Cell {
  static parseName(value) { // static method
    let [, skin, name] = /^(?:<([^}]*)>)?([^]*)/.exec(value || '');
    name = name.trim();
    return {
      name: name,
      skin: (skin || '').trim() || name,
    };
  }
  constructor(id, x, y, s, name, color, skin, flags) {
    this.destroyed = false;
    this.diedBy = 0;
    this.nameSize = 0;
    this.drawNameSize = 0;
    this.updated = null;
    this.dead = null;
    this.id = id;
    this.ox = x;
    this.x = x;
    this.nx = x;
    this.oy = y;
    this.y = y;
    this.ny = y;
    this.os = s;
    this.s = s;
    this.ns = s;
    this.setColor(color);
    this.setName(name);
    this.setSkin(skin);
    this.jagged = flags.jagged;
    this.ejected = flags.ejected;
    this.born = other.syncUpdStamp;
    this.points = [];
    this.pointsVel = [];
  }
  destroy(killerId) {
    cells.byId.delete(this.id);
    if (cells.mine.remove(this.id)) {
      setTimeout(() => {
        if (cells.mine.length == 0) onDie(this);
      }, 100)
    }
    this.destroyed = true;
    this.dead = other.syncUpdStamp;
    if (killerId && !this.diedBy) {
      this.diedBy = killerId;
      this.updated = other.syncUpdStamp;
    }
  }
  update(relativeTime) {
    const prevFrameSize = this.s;
    const dt = Math.max(Math.min((relativeTime - this.updated) / 120, 1), 0);
    let diedBy;
    if (this.destroyed && Date.now() > this.dead + 200) {
      cells.list.remove(this);
    } else if (this.diedBy && (diedBy = cells.byId.get(this.diedBy))) {
      this.nx = diedBy.x;
      this.ny = diedBy.y;
    }
    this.x = this.ox + (this.nx - this.ox) * dt;
    this.y = this.oy + (this.ny - this.oy) * dt;
    this.s = this.os + (this.ns - this.os) * dt;
    this.nameSize = ~~(~~(Math.max(~~(0.3 * this.ns), 24)) / 3) * 3;
    this.drawNameSize = ~~(~~(Math.max(~~(0.3 * this.s), 24)) / 3) * 3;

    if (settings.jellyPhysics && this.points.length) {
      const ratio = this.s / prevFrameSize;
      if (this.ns != this.os && ratio != 1) {
        for (const point of this.points) point.rl *= ratio;
      }
    }
  }
  updateNumPoints() {
    let numPoints = Math.min(Math.max(this.s * camera.scale | 0, CELL_POINTS_MIN), CELL_POINTS_MAX);
    if (this.jagged) numPoints = VIRUS_POINTS;
    while (this.points.length > numPoints) {
      const i = Math.random() * this.points.length | 0;
      this.points.splice(i, 1);
      this.pointsVel.splice(i, 1);
    }
    if (this.points.length === 0 && numPoints !== 0) {
      this.points.push({
        x: this.x,
        y: this.y,
        rl: this.s,
        parent: this,
      });
      this.pointsVel.push(Math.random() - 0.5);
    }
    while (this.points.length < numPoints) {
      const i = Math.random() * this.points.length | 0;
      const point = this.points[i];
      const vel = this.pointsVel[i];
      this.points.splice(i, 0, {
        x: point.x,
        y: point.y,
        rl: point.rl,
        parent: this
      });
      this.pointsVel.splice(i, 0, vel);
    }
  }
  movePoints() {
    const pointsVel = this.pointsVel.slice();
    for (let i = 0; i < this.points.length; ++i) {
      const prevVel = pointsVel[(i - 1 + this.points.length) % this.points.length];
      const nextVel = pointsVel[(i + 1) % this.points.length];
      const newVel = Math.max(Math.min((this.pointsVel[i] + Math.random() - 0.5) * 0.7, 10), -10);
      this.pointsVel[i] = (prevVel + nextVel + 8 * newVel) / 10;
    }
    for (let i = 0; i < this.points.length; ++i) {
      const curP = this.points[i];
      const prevRl = this.points[(i - 1 + this.points.length) % this.points.length].rl;
      const nextRl = this.points[(i + 1) % this.points.length].rl; // here
      let curRl = curP.rl;
      let affected = other.quadTree.some({
        x: curP.x - 5,
        y: curP.y - 5,
        w: 10,
        h: 10
      }, (item) => item.parent !== this && vec2Distance(item.x, item.y, curP.x, curP.y) <= 25);
      if (!affected &&
        (curP.x < border.left || curP.y < border.top ||
          curP.x > border.right || curP.y > border.bottom)) {
        affected = true;
      }
      if (affected) {
        this.pointsVel[i] = Math.min(this.pointsVel[i], 0) - 1;
      }
      curRl += this.pointsVel[i];
      curRl = Math.max(curRl, 0);
      curRl = (9 * curRl + this.s) / 10;
      curP.rl = (prevRl + nextRl + 8 * curRl) / 10;

      const angle = 2 * Math.PI * i / this.points.length;
      let rl = curP.rl;
      if (this.jagged && i % 2 === 0) {
        rl += 5;
      }
      curP.x = this.x + Math.cos(angle) * rl;
      curP.y = this.y + Math.sin(angle) * rl;
    }
  }
  setName(rawName) {
    const { name, skin } = Cell.parseName(rawName);
    this.name = name;
    this.setSkin(skin);
  }
  setSkin(value) {
    if (other.blackListedSkins.includes(value)) return;
    this.skin = (value || "").trim();
    if (!this.skin) return;
    if (loadedSkins.has(this.skin)) return;
    const skin = new Image();
    skin.src = `${SKIN_URL}${this.skin}.png`;
    loadedSkins.set(this.skin, skin);
  }
  setColor(value) {
    if (!value) return;
    this.color = value;
    this.sColor = this.color.darker();
  }
  draw(ctx) {
    ctx.save();
    this.drawShape(ctx);
    this.drawText(ctx);
    ctx.restore();
  }
  drawShape(ctx) {
    ctx.fillStyle = settings.showColor ? (this.color?.toHex?.() || '#FFFFFF') : '#FFFFFF';
    ctx.strokeStyle = settings.showColor ? (this.sColor?.toHex?.() || '#E5E5E5') : '#E5E5E5';
    ctx.lineWidth = Math.max(~~(this.s / 50), 10);
    if (this.s > 20) {
      this.s -= ctx.lineWidth / 2;
    }

    ctx.beginPath();
    if (this.jagged) ctx.lineJoin = 'miter';
    if (settings.jellyPhysics && this.points.length) {
      const point = this.points[0];
      ctx.moveTo(point.x, point.y);
      for (const point of this.points) ctx.lineTo(point.x, point.y);
    } else if (this.jagged) {
      const pointCount = 120;
      const incremental = PI_2 / pointCount;
      ctx.moveTo(this.x, this.y + this.s + 3);
      for (let i = 1; i < pointCount; i++) {
        const angle = i * incremental;
        const dist = this.s - 3 + (i % 2 === 0) * 6;
        ctx.lineTo(
          this.x + dist * Math.sin(angle),
          this.y + dist * Math.cos(angle)
        )
      }
      ctx.lineTo(this.x, this.y + this.s + 3);
    } else {
      ctx.arc(this.x, this.y, this.s, 0, PI_2, false);
    }
    ctx.closePath();

    if (this.destroyed) {
      ctx.globalAlpha = Math.max(120 - Date.now() + this.dead, 0) / 120;
    } else {
      ctx.globalAlpha = Math.min(Date.now() - this.born, 120) / 120;
    }

    const skinImage = loadedSkins.get(this.skin);
    if (settings.showSkins && this.skin && skinImage &&
      skinImage.complete && skinImage.width && skinImage.height) {
      if (settings.fillSkin) ctx.fill();
      ctx.save(); // for the clip
      ctx.clip();
      ctx.drawImage(skinImage, this.x - this.s, this.y - this.s,
        this.s * 2, this.s * 2);
      ctx.restore();
    } else {
      ctx.fill();
    }
    if (this.s > 20) {
      ctx.stroke();
      this.s += ctx.lineWidth / 2;
    }
  }
  drawText(ctx) {
    if (this.s < 20 || this.jagged) return;
    if (this.name && settings.showNames) {
      drawText(ctx, false, this.x, this.y, this.nameSize, this.drawNameSize, this.name);
    }
    if (settings.showMass && (cells.mine.indexOf(this.id) !== -1 || cells.mine.length === 0)) {
      const mass = (~~(this.s * this.s / 100)).toString();
      let y = this.y;
      if (this.name && settings.showNames)
        y += Math.max(this.s / 4.5, this.nameSize / 1.5);
      drawText(ctx, true, this.x, y, this.nameSize / 2, this.drawNameSize / 2, mass);
    }
  }
}