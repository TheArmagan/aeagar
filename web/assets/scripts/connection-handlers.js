import { listeners } from "./connection.js";
import { EMPTY_NAME } from "./constants.js";
import { drawChat, drawLeaderBoard, drawStats } from "./game.js";
import { Cell } from "./lib/Cell.js";
import { Color } from "./lib/Color.js";
import { shared } from "./shared.js";
const { camera, border, cells, chat, leaderBoard, stats, other, settings } = shared;

listeners.set(
  0x10,
  (reader) => {
    const addedCount = reader.getUint16();
    for (let i = 0; i < addedCount; i++) {
      const killer = reader.getUint32();
      const killed = reader.getUint32();
      if (!cells.byId.has(killer) || !cells.byId.has(killed)) continue;
      cells.byId.get(killed).destroy(killer);
    }

    // update records
    while (true) {
      const id = reader.getUint32();
      if (id === 0) break;

      const x = reader.getInt32();
      const y = reader.getInt32();
      const s = reader.getUint16();

      const flagMask = reader.getUint8();
      const flags = {
        updColor: !!(flagMask & 0x02),
        updSkin: !!(flagMask & 0x04),
        updName: !!(flagMask & 0x08),
        jagged: !!(flagMask & 0x01) || !!(flagMask & 0x10),
        ejected: !!(flagMask & 0x20),
      };

      const color = flags.updColor ? new Color(reader.getUint8(), reader.getUint8(), reader.getUint8()) : null;
      const skin = flags.updSkin ? reader.getStringUTF8() : null;
      const name = flags.updName ? reader.getStringUTF8() : null;

      if (cells.byId.has(id)) {
        const cell = cells.byId.get(id);
        cell.update(other.syncUpdStamp);
        cell.updated = other.syncUpdStamp;
        cell.ox = cell.x;
        cell.oy = cell.y;
        cell.os = cell.s;
        cell.nx = x;
        cell.ny = y;
        cell.ns = s;
        if (color) cell.setColor(color);
        if (name) cell.setName(name);
        if (skin) cell.setSkin(skin);
      } else {
        const cell = new Cell(id, x, y, s, name, color, skin, flags);
        cells.byId.set(id, cell);
        cells.list.push(cell);
      }
    }
    // dissapear records
    const removedCount = reader.getUint16();
    for (let i = 0; i < removedCount; i++) {
      const killed = reader.getUint32();
      if (cells.byId.has(killed) && !cells.byId.get(killed).destroyed) {
        cells.byId.get(killed).destroy(null);
      }
    }
  }
)

listeners.set(
  0x11,
  (reader) => {
    camera.target.x = reader.getFloat32();
    camera.target.y = reader.getFloat32();
    camera.target.scale = reader.getFloat32();
    camera.target.scale *= camera.viewportScale;
    camera.target.scale *= camera.userZoom;
  }
);

listeners.set(
  0x12,
  (reader) => {
    for (let i = 0; i < cells.list.length; i++) {
      const element = cells.list[i];
      element.destroy(null);
    }
    cells.mine = [];
  }
)

listeners.set(
  0x14,
  (reader) => {
    cells.mine = [];
  }
)

listeners.set(
  0x20,
  (reader) => {
    cells.mine.push(reader.getUint32());
  }
)

listeners.set(
  0x30,
  (reader) => {
    leaderBoard.items = [];
    leaderBoard.type = 'text';

    const lbCount = reader.getUint32();
    for (let i = 0; i < lbCount; ++i) {
      leaderBoard.items.push(JSON.parse(reader.getStringUTF8()));
    }
    drawLeaderBoard();
  }
)

listeners.set(
  0x31,
  (reader) => {
    leaderBoard.items = [];
    leaderBoard.type = 'ffa';

    const count = reader.getUint32();
    for (let i = 0; i < count; ++i) {
      const isMe = !!reader.getUint32();
      const lbName = reader.getStringUTF8();
      leaderBoard.items.push({
        me: isMe,
        name: Cell.parseName(lbName).name || EMPTY_NAME
      });
    }
    drawLeaderBoard();
  }
)

listeners.set(
  0x32,
  (reader) => {
    leaderBoard.items = [];
    leaderBoard.type = 'pie';

    const teamsCount = reader.getUint32();
    for (let i = 0; i < teamsCount; ++i) {
      leaderBoard.items.push(reader.getFloat32());
    }
    drawLeaderBoard();
  }
)


listeners.set(
  0x40,
  (reader, rawData) => {
    border.left = reader.getFloat64();
    border.top = reader.getFloat64();
    border.right = reader.getFloat64();
    border.bottom = reader.getFloat64();
    border.width = border.right - border.left;
    border.height = border.bottom - border.top;
    border.centerX = (border.left + border.right) / 2;
    border.centerY = (border.top + border.bottom) / 2;
    if (rawData.byteLength === 33) return;
    camera.x = camera.target.x = border.centerX;
    camera.y = camera.target.y = border.centerY;
    camera.scale = camera.target.scale = 1;
    reader.getUint32(); // game type
    // if (!/MultiOgar|OgarII/.test(reader.getStringUTF8()) || stats.pingLoopId) break;
    // stats.pingLoopId = setInterval(() => {
    //   wsSend(UINT8_CACHE[254]);
    //   stats.pingLoopStamp = Date.now();
    // }, 2000);
  }
)

listeners.set(
  0x63,
  (reader) => {
    const flagMask = reader.getUint8();
    const flags = {
      server: !!(flagMask & 0x80),
      admin: !!(flagMask & 0x40),
      mod: !!(flagMask & 0x20),
    };
    const color = new Color(reader.getUint8(), reader.getUint8(), reader.getUint8());
    const rawName = reader.getStringUTF8();
    const message = reader.getStringUTF8();

    let name = Cell.parseName(rawName).name || EMPTY_NAME;

    if (flags.server && name !== 'SUNUCU') name = `[SUNUCU]`;
    if (flags.admin) name = `[ADMIN] ${name}`;
    if (flags.mod) name = `[MOD] ${name}`;

    const wait = Math.max(3000, 1000 + message.length * 150);
    chat.waitUntil = other.syncUpdStamp - chat.waitUntil > 1000 ? other.syncUpdStamp + wait : chat.waitUntil + wait;
    chat.messages.push({
      color,
      name,
      message,
      time: other.syncUpdStamp,
      server: flags.server,
      admin: flags.admin,
      mod: flags.mod,
    });
    if (settings.showChat) drawChat();
  }
)

listeners.set(
  0xFE,
  (reader) => {
    stats.info = JSON.parse(reader.getStringUTF8());
    stats.latency = other.syncUpdStamp - stats.pingLoopStamp;
    drawStats();
  }
)