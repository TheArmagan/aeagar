import { SEND_254, SEND_255, UINT8_CACHE, USE_HTTPS } from "./constants.js";
import { BufferReader, BufferWriter } from "./lib/Buffer.js";
import { shared } from "./shared.js";
const { stats, other, cells } = shared;

let forceClose = false;
let lastConnectionURL = null;

/** @type {WebSocket} */
export let socket;
/** @type {Map<number, (reader: BufferReader)=>any>} */
export const listeners = new Map();

export function close(f) {
  forceClose = f;
  if (!socket) return;
  socket.onopen = socket.onmessage = null;
  socket.close();
  socket = null;
  cells.list.forEach(c => c.destroy(null));
  cells.mine = [];
}

export function send(data) {
  if (!socket || socket.readyState !== socket.OPEN) return;
  if (typeof data.build == "function") data = data.build();
  socket.send(data);
}

export function connect(url) {
  lastConnectionURL = url;
  if (!url) return;
  if (socket) close();
  url = url.split("//").pop();
  socket = new WebSocket(`ws${USE_HTTPS ? 's' : ''}://${url}`);
  socket.binaryType = "arraybuffer";
  socket.onopen = () => {
    send(SEND_254);
    send(SEND_255);
  };
  socket.onclose = () => {
    if (forceClose) return;
    if (socket) {
      socket.close();
      socket.onopen = socket.onmessage = null;
      socket = null;
    }
    setTimeout(() => { connect(lastConnectionURL); }, 1000);
  }
  socket.onmessage = onMessage;
}

export function sendMouseMove(x, y) {
  const writer = new BufferWriter(true);
  writer.setUint8(0x10);
  writer.setUint32(x);
  writer.setUint32(y);
  writer._b.push(0, 0, 0, 0);
  send(writer);
}

export function sendPlay(name) {
  const writer = new BufferWriter(true);
  writer.setUint8(0x00);
  writer.setStringUTF8(name);
  send(writer);
}

export function sendSpectate() {
  send(UINT8_CACHE[1]);
  stats.maxScore = 0;
}

export function sendChat(text) {
  const writer = new BufferWriter();
  writer.setUint8(0x63);
  writer.setUint8(0);
  writer.setStringUTF8(text);
  send(writer);
}

function onMessage(event) {
  other.syncUpdStamp = Date.now();
  const reader = new BufferReader(new DataView(event.data), 0, true);
  const packetId = reader.getUint8();
  let cb = listeners.get(packetId);
  if (cb) cb(reader, event.data);
}


stats.pingLoopId = setInterval(() => {
  send(UINT8_CACHE[254]);
  stats.pingLoopStamp = Date.now();
}, 2000);