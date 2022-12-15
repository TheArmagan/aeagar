export class Color {
  static fromHex(color) {
    let hex = color;
    if (color.startsWith('#')) hex = color.slice(1);
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    if (hex.length !== 6) throw new Error(`Invalid color ${color}`);
    const v = parseInt(hex, 16);
    return new Color(v >>> 16 & 255, v >>> 8 & 255, v & 255, `#${hex}`);
  }
  constructor(r, g, b, hex) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.#hex = hex;
  }
  clone() {
    return new Color(this.r, this.g, this.b);
  }
  toHex() {
    if (this.#hex) return this.#hex;
    return this.#hex = `#${(1 << 24 | this.r << 16 | this.g << 8 | this.b).toString(16).slice(1)}`;
  }
  darken(grade = 1) {
    grade /= 10;
    this.r *= 1 - grade;
    this.g *= 1 - grade;
    this.b *= 1 - grade;
    return this;
  }
  darker(grade = 1) {
    return this.clone().darken(grade);
  }
}


