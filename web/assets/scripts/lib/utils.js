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

export function getOs() {
  let userAgent = window.navigator.userAgent,
    platform = window.navigator.platform || "",
    macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K', 'darwin'],
    windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
    iosPlatforms = ['iPhone', 'iPad', 'iPod'],
    /** @type {"MacOS"|"iOS"|"Windows"|"Android"|"Linux"|null} */
    os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'MacOS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (/Linux/.test(platform)) {
    os = 'Linux';
  }

  return os;
}