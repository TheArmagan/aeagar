export function prettyPrintTime(s) {
  if (isNaN(parseInt(s))) s = 0;
  s = Math.floor(s);
  let hours = Math.floor((s / 60) / 60);
  return `${hours > 0 ? `${hours.toString()}sa, ` : ""}${Math.floor((s / 60) % 60).toString()}dk, ${(s % 60).toString()}sn`;
}

export function vec2Distance(x1, y1, x2, y2) {
  var x = x1 - x2;
  var y = y1 - y2;
  return Math.sqrt(x * x + y * y);
}