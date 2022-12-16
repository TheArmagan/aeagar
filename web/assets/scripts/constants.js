export const USE_HTTPS = 'https:' === window.location.protocol;
export const EMPTY_NAME = 'İsimsiz Oyuncu';
export const SKIN_URL = "./skins/"
export const QUAD_TREE_MAX_POINTS = 32;
export const CELL_POINTS_MIN = 5;
export const CELL_POINTS_MAX = 120;
export const VIRUS_POINTS = 100;
export const PI_2 = Math.PI * 2;

export const SEND_254 = new Uint8Array([254, 6, 0, 0, 0]);
export const SEND_255 = new Uint8Array([255, 1, 0, 0, 0]);

export const UINT8_CACHE = {
  1: new Uint8Array([1]),
  17: new Uint8Array([17]),
  21: new Uint8Array([21]),
  18: new Uint8Array([18]),
  19: new Uint8Array([19]),
  22: new Uint8Array([22]),
  23: new Uint8Array([23]),
  24: new Uint8Array([24]),
  25: new Uint8Array([25]),
  254: new Uint8Array([254]),
};