import { SEND_254, SEND_255, USE_HTTPS } from "./constants.js";
import { BufferReader, BufferWriter } from "./libs/Buffer.js";
import { shared } from "./shared.js";

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
  socket.onopen = () => {
    send(SEND_254);
    send(SEND_255);
  };
  socket.onclose = () => {
    if (forceClose) return;
    setTimeout(() => { connect(lastConnectionURL); }, 1000);
  }
  socket.onmessage = onMessage;
}

function onMessage(event) {
  shared.syncUpdStamp = Date.now();
  const reader = new BufferReader(new DataView(event.data), 0, true);
  const packetId = reader.getUint8();
  let cb = listeners.get(packetId);
  if (cb) cb(reader);
}
