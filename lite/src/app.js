/* Numbers game - LITE build for old iPads (iOS 9). Source is modern JS; build.sh transpiles it to ES5. */
(function () {
"use strict";

/* ---------- helpers ---------- */
var $ = function (id) { return document.getElementById(id); };
var D2R = Math.PI / 180;
function arc(cx, cy, rx, ry, a0, a1) { var n = Math.max(8, Math.ceil(Math.abs(a1 - a0) / 4)), p = []; for (var i = 0; i <= n; i++) { var a = (a0 + (a1 - a0) * i / n) * D2R; p.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return p; }
function bez(p0, c1, c2, p3) { var p = []; for (var i = 0; i <= 30; i++) { var t = i / 30, u = 1 - t; p.push([u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p3[1]]); } return p; }
function join() { return Array.prototype.concat.apply([], arguments); }
function resample(pts, step) {
  var out = [pts[0]], acc = 0;
  for (var i = 1; i < pts.length; i++) {
    var x0 = pts[i - 1][0], y0 = pts[i - 1][1], x1 = pts[i][0], y1 = pts[i][1], seg = Math.hypot(x1 - x0, y1 - y0);
    while (acc + seg >= step) { var r = (step - acc) / seg; x0 += (x1 - x0) * r; y0 += (y1 - y0) * r; out.push([x0, y0]); seg = Math.hypot(x1 - x0, y1 - y0); acc = 0; }
    acc += seg;
  }
  var l = pts[pts.length - 1], q = out[out.length - 1];
  if (Math.hypot(l[0] - q[0], l[1] - q[1]) > step * 0.4) out.push(l);
  return out;
}
function hex2(n) { var s = Math.round(n).toString(16); return s.length < 2 ? "0" + s : s; }
function mixHex(a, b, t) { var A = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); }), B = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); }); return "#" + A.map(function (v, i) { return hex2(v + (B[i] - v) * t); }).join(""); }

/* ---------- digit geometry (unit box 200 x 300) ---------- */
var RAW = [
  [arc(100, 150, 68, 118, -90, -450)],
  [[[60, 95], [108, 40], [108, 265]]],
  [join(arc(100, 95, 58, 58, 195, 395), [[40, 268], [168, 268]])],
  [join(arc(100, 88, 50, 50, 205, 450), arc(100, 198, 62, 62, 270, 520))],
  [[[130, 30], [32, 188], [172, 188]], [[130, 70], [130, 268]]],
  [[[158, 38], [62, 38], [52, 135]], arc(98, 198, 66, 66, 235, 505)],
  [join(bez([145, 32], [75, 50], [38, 120], [38, 200]), arc(100, 200, 62, 62, 180, -180))],
  [[[42, 40], [162, 40], [82, 268]]],
  [join(arc(100, 88, 46, 50, 90, 450), arc(100, 198, 60, 62, 270, 630))],
  [join(arc(100, 95, 60, 62, 0, -360), bez([160, 95], [160, 170], [132, 240], [62, 268]))]
];
var DIGITS = RAW.map(function (strokes) { return strokes.map(function (s) { return resample(s, 5); }); });
var NAMES = ["אפס", "אחת", "שתיים", "שלוש", "ארבע", "חמש", "שש", "שבע", "שמונה", "תשע", "עשר", "אחת עשרה", "שתים עשרה", "שלוש עשרה", "ארבע עשרה", "חמש עשרה", "שש עשרה", "שבע עשרה", "שמונה עשרה", "תשע עשרה", "עשרים"];
var MAXN = 100, GAP = 230, NUMBERS = [], LOOPS = [];
(function () {
  for (var n = 0; n <= MAXN; n++) {
    var S = [], L = [];
    String(n).split("").forEach(function (ch, i) { var d = +ch; DIGITS[d].forEach(function (st) { S.push(st.map(function (p) { return [p[0] + i * GAP, p[1]]; })); L.push(d === 0); }); });
    NUMBERS.push(S); LOOPS.push(L);
  }
})();
var REV = NUMBERS.map(function (S) { return S.map(function (st) { return st.slice().reverse(); }); });
function unitW(n) { return 200 + (String(n).length - 1) * GAP; }
var OBJ_FOR = [5, 6, 3, 4, 1, 2, 7, 8, 9, 5, 3];
var TENS = { 20: "עשרים", 30: "שלושים", 40: "ארבעים", 50: "חמישים", 60: "שישים", 70: "שבעים", 80: "שמונים", 90: "תשעים", 100: "מאה" };
var VU = ["", "ואחת", "ושתיים", "ושלוש", "וארבע", "וחמש", "ושש", "ושבע", "ושמונה", "ותשע"];
function nameOf(k) { return typeof k === "string" ? (/^v\d$/.test(k) ? VU[+k.charAt(1)] : k) : (k <= 20 ? NAMES[k] : TENS[k]); }
function ci(n) { return n < 10 ? n : (n >= 100 ? 0 : Math.floor(n / 10)); }
function pageOf(n) { return n === 0 ? 0 : Math.ceil(n / 10) - 1; }
function pageNums(p) { var a = []; if (p === 0) { for (var i = 0; i <= 10; i++) a.push(i); } else { for (var j = 1; j <= 10; j++) a.push(p * 10 + j); } return a; }
function rangeLabel(p) { return p === 0 ? "1\u201310" : (p * 10 + 1) + "\u2013" + (p * 10 + 10); }
var homeMode = "ranges", homePageIdx = 0;
var PHRASE = { draw: "עכשיו נצייר עם האצבע את הספרה", praise: "כל הכבוד, הצלחת!", prompt: "תבחרי מתוך המספרים את הספרה", oops: "אופס, בחרת בטעות את הספרה", retry: "בואי ננסה שוב ללחוץ על" };
var COLORS = ["#6fbf9e", "#e07c97", "#eb9a5c", "#6fb3d8", "#9b82cf", "#e8b84a", "#c982b8", "#5fbdb3", "#e5806a", "#d9708a"];
var PASTEL = ["#bfe8d4", "#f9b8c6", "#ffd3a8", "#bfe3f5", "#d8c8f2", "#ffe9a0", "#f0c4e6", "#b5ece6", "#ffc4b0", "#f6a9bd"];
var INK = "#6b4a4a";
var COLS = [1, 1, 2, 2, 2, 3, 3, 3, 3, 3];

/* ---------- SVG art (no filters: they are too slow on old iPads) ---------- */
function digitSVG(d) {
  var pts = NUMBERS[d].map(function (s) { return s.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); });
  function L(w, c, extra) { return pts.map(function (p) { return '<polyline points="' + p + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" ' + (extra || "") + "/>"; }).join(""); }
  var vw = Math.max(unitW(d) + 40, 240), vh = vw * 1.25, vx = -20 - (vw - unitW(d) - 40) / 2, vy = (300 - vh) / 2;
  return '<svg viewBox="' + vx + " " + vy + " " + vw + " " + vh + '">' + L(47, COLORS[ci(d)]) + L(44, PASTEL[ci(d)]) + L(2.6, COLORS[ci(d)], 'stroke-dasharray="9 9" opacity=".7"') + "</svg>";
}
function FACE(x, y, k) {
  return '<circle cx="' + (x - 7 * k) + '" cy="' + y + '" r="' + 2.3 * k + '" fill="' + INK + '"/><circle cx="' + (x + 7 * k) + '" cy="' + y + '" r="' + 2.3 * k + '" fill="' + INK + '"/>' +
    '<circle cx="' + (x - 11 * k) + '" cy="' + (y + 5 * k) + '" r="' + 3.3 * k + '" fill="#ff8fa3" opacity=".6"/><circle cx="' + (x + 11 * k) + '" cy="' + (y + 5 * k) + '" r="' + 3.3 * k + '" fill="#ff8fa3" opacity=".6"/>' +
    '<path d="M' + (x - 3 * k) + " " + (y + 3.6 * k) + "Q" + x + " " + (y + 7.4 * k) + " " + (x + 3 * k) + " " + (y + 3.6 * k) + '" fill="none" stroke="' + INK + '" stroke-width="' + 1.7 * k + '" stroke-linecap="round"/>';
}
function HI(x, y, rx, ry, rot) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity=".55" transform="rotate(' + (rot || 0) + " " + x + " " + y + ')"/>'; }
function objSVG(d) {
  function st(P, O, w) { return 'fill="' + P + '" stroke="' + O + '" stroke-width="' + (w || 2.6) + '" stroke-linejoin="round" stroke-linecap="round"'; }
  function line(O, w) { return 'fill="none" stroke="' + O + '" stroke-width="' + (w || 2.6) + '" stroke-linecap="round" stroke-linejoin="round"'; }
  var s = "";
  switch (d) {
    case 0: s = '<circle cx="50" cy="50" r="34" fill="none" stroke="#e2c9b0" stroke-width="3.6" stroke-dasharray="2 9" stroke-linecap="round"/><path d="M50 40Q50 50 60 50Q50 50 50 60Q50 50 40 50Q50 50 50 40Z" fill="#ffd36e"/>'; break;
    case 1: s = '<path d="M52 28C52 14 62 8 74 10C74 22 64 30 52 28Z" ' + st("#c9ecb0", "#7fbf6a") + '/><path d="M50 30C50 22 48 16 45 11" ' + line("#9a7b5a", 3.6) + '/><path d="M50 30C30 20 12 34 14 58C16 80 34 92 50 86C66 92 84 80 86 58C88 34 70 20 50 30Z" ' + st("#ffb3bf", "#e0707f") + "/>" + HI(30, 45, 4.5, 9, 15) + FACE(50, 60, 0.95); break;
    case 2: s = '<path d="M70 50L93 30L93 70Z" ' + st("#bfe3f5", "#6fb3d8") + '/><path d="M38 30Q48 14 58 30" ' + st("#bfe3f5", "#6fb3d8") + '/><ellipse cx="44" cy="50" rx="31" ry="23" ' + st("#bfe3f5", "#6fb3d8") + "/>" + HI(34, 38, 6, 3, -20) + '<circle cx="31" cy="46" r="2.8" fill="' + INK + '"/><circle cx="29" cy="57" r="3.4" fill="#ff8fa3" opacity=".6"/><path d="M36 58Q40 62 44 58" ' + line(INK, 1.8) + '/><path d="M56 40Q60 50 56 60" ' + line("#6fb3d8", 2.2) + "/>"; break;
    case 3: s = '<path d="M24 58L76 58L68 90Q50 96 32 90Z" ' + st("#e6d4f7", "#b79ad0") + '/><path d="M36 62L40 90M50 62L50 93M64 62L60 90" ' + line("#b79ad0", 2) + '/><path d="M18 60C10 46 22 36 32 38C32 24 68 24 68 38C78 36 90 46 82 60Z" ' + st("#fff3e6", "#c9a4d8") + '/><circle cx="50" cy="19" r="7" ' + st("#ff7f95", "#d9566f") + '/><path d="M50 12Q52 5 58 3" ' + line("#7a5a3a", 2.2) + "/>" + FACE(50, 48, 0.85) + '<path d="M30 42L35 40M66 42L71 44M42 34L47 35" stroke="#f9a0b8" stroke-width="2.6" stroke-linecap="round"/>'; break;
    case 4: s = [[50, 28], [71, 43], [63, 67], [37, 67], [29, 43]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="17" ' + st("#ffc0d0", "#e88aa3") + "/>"; }).join("") + '<circle cx="50" cy="50" r="14" ' + st("#ffe39a", "#e8b84a") + "/>" + FACE(50, 49, 0.6); break;
    case 5: s = '<path d="M50 8L62 35L92 38L69 58L77 88L50 72L23 88L31 58L8 38L38 35Z" ' + st("#ffe7a0", "#e8b84a") + "/>" + HI(38, 30, 3.5, 7, 35) + FACE(50, 52, 0.9); break;
    case 6: s = '<path d="M28 54L72 54L50 94Z" ' + st("#ffd8a8", "#e6a05c") + '/><path d="M36 60L58 80M64 60L42 80M44 60L56 76" ' + line("#e6a05c", 1.8) + '/><circle cx="50" cy="38" r="26" ' + st("#ffc0d0", "#e88aa3") + '/><circle cx="50" cy="11" r="6" ' + st("#ff7f95", "#d9566f") + "/>" + FACE(50, 40, 0.85) + '<path d="M33 28L38 31M64 28L68 33M52 24L55 28" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>'; break;
    case 7: s = '<path d="M8 38A42 42 0 0 0 92 38Z" ' + st("#c9ecb0", "#7fbf6a") + '/><path d="M15 38A35 35 0 0 0 85 38Z" ' + st("#ff9fb0", "#e0707f", 2) + '/><ellipse cx="30" cy="52" rx="2.6" ry="4" fill="' + INK + '"/><ellipse cx="70" cy="52" rx="2.6" ry="4" fill="' + INK + '"/>' + FACE(50, 52, 0.7); break;
    case 8: s = '<path d="M50 84Q34 90 46 94Q60 98 48 100" ' + line("#6fb3d8", 2.6) + '/><path d="M44 88L36 84L38 94Z M52 94L60 90L58 100Z" fill="#ffc0d0" stroke="#e88aa3" stroke-width="2"/><path d="M50 8L78 42L50 82L22 42Z" ' + st("#cfe9fb", "#6fb3d8") + '/><path d="M50 8L50 24M22 42L33 42M78 42L67 42" ' + line("#6fb3d8", 2) + "/>" + FACE(50, 44, 0.7); break;
    case 9: s = [[80, 50, 94, 50], [71.2, 71.2, 81.1, 81.1], [50, 80, 50, 94], [28.8, 71.2, 18.9, 81.1], [20, 50, 6, 50], [28.8, 28.8, 18.9, 18.9], [50, 20, 50, 6], [71.2, 28.8, 81.1, 18.9]].map(function (r) { return '<line x1="' + r[0] + '" y1="' + r[1] + '" x2="' + r[2] + '" y2="' + r[3] + '" stroke="#f0b94d" stroke-width="5.5" stroke-linecap="round"/>'; }).join("") + '<circle cx="50" cy="50" r="28" ' + st("#ffe39a", "#e8b84a") + "/>" + HI(40, 38, 5, 8, 35) + FACE(50, 49, 1); break;
  }
  return '<svg viewBox="0 0 100 100">' + s + "</svg>";
}
var ICOCOL = { home: ["#ffd3a8", "#eb9a5c"], say: ["#bfe3f5", "#6fb3d8"], next: ["#bfe8d4", "#6fbf9e"], play: ["#bfe8d4", "#6fbf9e"], star: ["#ffe9a0", "#e8b84a"], redo: ["#f9b8c6", "#e07c97"], check: ["#bfe8d4", "#6fbf9e"], trash: ["#ece4d8", "#b3a592"], import: ["#bfe8d4", "#6fbf9e"], gear: ["#ece4d8", "#b3a592"] };
function iconSVG(n) {
  var c = ICOCOL[n], P = c[0], O = c[1], st = 'fill="' + P + '" stroke="' + O + '" stroke-width="3.8" stroke-linejoin="round" stroke-linecap="round"', ln = 'fill="none" stroke="' + O + '" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"', s = "";
  switch (n) {
    case "home": s = '<path d="M12 52L50 16L88 52Z" ' + st + '/><rect x="24" y="50" width="52" height="36" rx="5" ' + st + '/><rect x="42" y="62" width="16" height="24" rx="4" fill="' + O + '"/>'; break;
    case "say": s = '<path d="M14 38H32L56 18V82L32 62H14Z" ' + st + '/><path d="M68 36Q78 50 68 64" ' + ln + '/><path d="M76 25Q94 50 76 75" ' + ln + "/>"; break;
    case "next": s = '<path d="M16 40H50V20L86 50L50 80V60H16Z" ' + st + "/>"; break;
    case "play": s = '<path d="M28 16L84 50L28 84Z" ' + st + "/>"; break;
    case "redo": s = '<circle cx="50" cy="50" r="40" ' + st + '/><path d="M68 38A22 22 0 1 0 72 54" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M70 22V40H52" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'; break;
    case "check": s = '<circle cx="50" cy="50" r="38" ' + st + '/><path d="M30 52L45 66L72 36" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'; break;
    case "trash": s = '<path d="M24 32H76L70 88H30Z" ' + st + '/><path d="M16 30H84M40 30V20H60V30" ' + ln + '/><path d="M42 46V76M58 46V76" stroke="' + O + '" stroke-width="3.4" stroke-linecap="round"/>'; break;
    case "import": s = '<path d="M20 62V84H80V62" ' + ln + '/><path d="M50 14V64M32 46L50 64L68 46" ' + ln + '/>'; break;
    case "gear": s = [0, 45, 90, 135].map(function (a) { return '<line x1="50" y1="12" x2="50" y2="88" stroke="' + O + '" stroke-width="13" stroke-linecap="round" transform="rotate(' + a + ' 50 50)"/>'; }).join("") + '<circle cx="50" cy="50" r="28" ' + st + '/><circle cx="50" cy="50" r="10" fill="#fffaf1" stroke="' + O + '" stroke-width="4"/>'; break;
    case "star": s = '<path d="M50 10L61 38L91 38L67 56L76 86L50 68L24 86L33 56L9 38L39 38Z" ' + st + "/>"; break;
  }
  return '<svg viewBox="0 0 100 100">' + s + "</svg>";
}
var DECO = [["spark", 4, 9, 3.6], ["heart", 92, 8, 3.2], ["dash", 47, 3, 3], ["spark", 93, 87, 3.4], ["heart", 49, 93, 3], ["dash", 96, 48, 3], ["spark", 2, 50, 2.6], ["heart", 27, 94, 2.4]];
var DCOL = ["#b7a0dd", "#f78fa7", "#ffcf5a", "#8fd9c0", "#ffb59a"];
function decoSVG(t, i) {
  var c = DCOL[i % DCOL.length];
  if (t === "spark") return '<svg viewBox="0 0 20 20"><path d="M10 1Q10 10 19 10Q10 10 10 19Q10 10 1 10Q10 10 10 1Z" fill="#ffcf5a"/></svg>';
  if (t === "heart") return '<svg viewBox="0 0 20 20"><path d="M10 17C2 11 3 4 7.5 4C9 4 10 5 10 6C10 5 11 4 12.5 4C17 4 18 11 10 17Z" fill="#ffc0cf" stroke="#f78fa7" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  return '<svg viewBox="0 0 20 20"><rect x="2" y="8" width="16" height="4.6" rx="2.3" fill="' + c + '" transform="rotate(-35 10 10)"/></svg>';
}
function addDeco(el) {
  DECO.forEach(function (d, i) {
    var e = document.createElement("div"); e.className = "deco";
    e.style.left = d[1] + "%"; e.style.top = d[2] + "%"; e.style.width = d[3] + "vmin"; e.style.height = d[3] + "vmin";
    e.innerHTML = decoSVG(d[0], i); el.insertBefore(e, el.firstChild);
  });
}

/* ---------- storage ---------- */
var stars = []; for (var si = 0; si < 101; si++) stars.push(0);
try { var sv = JSON.parse(localStorage.getItem("numstars") || "null"); if (sv && sv.length) for (var sj = 0; sj < sv.length && sj < 101; sj++) stars[sj] = sv[sj] || 0; } catch (e) {}
function saveStars() { try { localStorage.setItem("numstars", JSON.stringify(stars)); } catch (e) {} }

/* ---------- sound: recorded files first, device voice as fallback ---------- */
var AC = null;
function ensureAC() { try { var C = window.AudioContext || window.webkitAudioContext; if (!AC && C) AC = new C(); if (AC && AC.state === "suspended" && AC.resume) AC.resume(); } catch (e) {} return AC; }
function tone(f, dur, type, vol, delay) {
  try {
    var ac = ensureAC(); if (!ac) return;
    var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + (delay || 0);
    o.type = type || "sine"; o.frequency.value = f; g.gain.setValueAtTime(vol || 0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + (dur || 0.15));
    o.connect(g); g.connect(ac.destination);
    if (o.start) o.start(t); else o.noteOn(t);
    if (o.stop) o.stop(t + (dur || 0.15) + 0.02); else o.noteOff(t + (dur || 0.15) + 0.02);
  } catch (e) {}
}
function fanfare() { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.25, "triangle", 0.2, i * 0.12); }); }
function failSound() { tone(392, 0.2, "triangle", 0.14, 0); tone(294, 0.32, "triangle", 0.14, 0.18); }
var voiceEl = new Audio(); voiceEl.preload = "auto";
var sayTok = 0, voice = null;
try { var pick = function () { var v = window.speechSynthesis.getVoices(); voice = null; for (var i = 0; i < v.length; i++) { if (/^he/i.test(v[i].lang)) { voice = v[i]; break; } } }; pick(); if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = pick; } catch (e) {}
function speak(text, cb) {
  try {
    if (!window.speechSynthesis) { if (cb) setTimeout(cb, 400); return; }
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text); u.lang = "he-IL"; if (voice) u.voice = voice; u.rate = 0.85;
    if (cb) { u.onend = cb; u.onerror = cb; }
    window.speechSynthesis.speak(u);
  } catch (e) { if (cb) setTimeout(cb, 400); }
}
var vcache = {}, vwait = {}, curBufSrc = null, voiceTimer = null;
function b64ToBuf(uri) { var i = uri.indexOf(","), bin = atob(uri.slice(i + 1)), len = bin.length, u8 = new Uint8Array(len); for (var k = 0; k < len; k++) u8[k] = bin.charCodeAt(k); return u8.buffer; }
function getBuffer(n, cb) {
  if (vcache[n]) { cb(vcache[n]); return; }
  if (vwait[n]) { vwait[n].push(cb); return; }
  vwait[n] = [cb];
  function finish(buf) { if (buf) vcache[n] = buf; var w = vwait[n]; vwait[n] = null; for (var i = 0; i < w.length; i++) w[i](buf || null); }
  var ac = ensureAC(); if (!ac) { lastAudioErr = "no WebAudio"; finish(null); return; }
  function decode(ab) {
    try { ac.decodeAudioData(ab, function (b) { finish(b); }, function () { lastAudioErr = "decode " + n; finish(null); }); }
    catch (e) { lastAudioErr = "decode-ex " + n; finish(null); }
  }
  var stored = voiceGet(n);
  if (stored) { try { decode(b64ToBuf(stored)); } catch (e) { lastAudioErr = "stored " + n; finish(null); } return; }
  var x = new XMLHttpRequest(); x.open("GET", "audio/" + n + ".wav", true); x.responseType = "arraybuffer";
  x.onload = function () { if (x.status === 200 || x.status === 0) decode(x.response); else { lastAudioErr = "http " + x.status + " " + n; finish(null); } };
  x.onerror = function () { lastAudioErr = "xhr " + n; finish(null); };
  x.send();
}
function dotSVG(d, i) {
  var c = ci(d), row = Math.floor(i / 10) % 2, fill = row ? mixHex(PASTEL[c], COLORS[c], 0.45) : PASTEL[c];
  return '<svg viewBox="0 0 100 100"><path d="M50 8L62 36L92 38L69 58L77 90L50 72L23 90L31 58L8 38L38 36Z" fill="' + fill + '" stroke="' + COLORS[c] + '" stroke-width="5" stroke-linejoin="round"/></svg>';
}
function sayNum(n, cb) {
  if (n <= 20 || n % 10 === 0) sayName(n, cb);
  else sayName(Math.floor(n / 10) * 10, function () { sayName("v" + (n % 10), cb); });
}
function stopVoice() {
  clearTimeout(voiceTimer);
  if (curBufSrc) { try { if (curBufSrc.stop) curBufSrc.stop(0); else curBufSrc.noteOff(0); } catch (e) {} curBufSrc = null; }
  try { voiceEl.onended = null; voiceEl.onerror = null; voiceEl.pause(); } catch (e) {}
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
}
function sayName(n, cb) {
  var my = ++sayTok, fin = false;
  stopVoice();
  function done() { if (fin) return; fin = true; if (cb && my === sayTok) cb(); }
  function viaTTS() { if (my !== sayTok) return; speak(PHRASE[n] || nameOf(n), done); }
  function viaElement() {
    voiceEl.onended = done;
    voiceEl.onerror = function () { if (my !== sayTok) return; try { lastAudioErr = (voiceEl.error ? "media code " + voiceEl.error.code : "play") + " (" + n + ")"; } catch (e) {} viaTTS(); };
    try { voiceEl.src = voiceUrl(n); try { voiceEl.load(); } catch (e2) {} var p = voiceEl.play(); if (p && p.catch) p.catch(function () { viaTTS(); }); } catch (e) { viaTTS(); }
  }
  getBuffer(n, function (buf) {
    if (my !== sayTok) return;
    if (!buf) { viaElement(); return; }
    try {
      var ac = ensureAC(), s = ac.createBufferSource();
      s.buffer = buf; s.connect(ac.destination); if (s.start) s.start(0); else s.noteOn(0);
      curBufSrc = s; clearTimeout(voiceTimer); voiceTimer = setTimeout(done, buf.duration * 1000 + 80);
    } catch (e) { lastAudioErr = "play-ex " + n; viaElement(); }
  });
}
var unlocked = false, SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YQAAAAA=";
function unlockAudio() {
  if (unlocked) return; unlocked = true;
  ensureAC();
  try { var ac = AC; if (ac) { var b = ac.createBuffer(1, 1, 22050), s = ac.createBufferSource(); s.buffer = b; s.connect(ac.destination); if (s.start) s.start(0); else s.noteOn(0); } } catch (e) {}
  try { voiceEl.src = SILENT; voiceEl.load(); var up = voiceEl.play(); if (up && up.catch) up.catch(function () {}); } catch (e) {}
}
document.addEventListener("touchend", unlockAudio, true);
document.addEventListener("click", unlockAudio, true);
document.addEventListener("mousedown", unlockAudio, true);

/* ---------- imported voice recordings (stored on this device only) ---------- */
var VKEYS = []; for (var vi = 0; vi <= 20; vi++) VKEYS.push(vi); for (var vt = 30; vt <= 100; vt += 10) VKEYS.push(vt);
for (var vu = 1; vu <= 9; vu++) VKEYS.push("v" + vu); VKEYS.push("draw", "praise", "prompt", "oops", "retry");
function voiceGet(k) { try { return localStorage.getItem("voice_" + k); } catch (e) { return null; } }
function voiceUrl(n) { return voiceGet(n) || ("audio/" + n + ".wav"); }
var lastAudioErr = "-";
function readZip(buf) {
  var dv = new DataView(buf), u8 = new Uint8Array(buf), out = [], p = 0;
  while (p + 30 <= buf.byteLength && dv.getUint32(p, true) === 0x04034b50) {
    var method = dv.getUint16(p + 8, true), csize = dv.getUint32(p + 18, true), nlen = dv.getUint16(p + 26, true), elen = dv.getUint16(p + 28, true);
    if (method !== 0) throw new Error("zip-method");
    var name = ""; for (var i = 0; i < nlen; i++) name += String.fromCharCode(u8[p + 30 + i]);
    var start = p + 30 + nlen + elen;
    out.push({ name: name, data: u8.subarray(start, start + csize) });
    p = start + csize;
  }
  return out;
}
function toDataURI(u8, mime) {
  var bin = "";
  for (var i = 0; i < u8.length; i += 8192) bin += String.fromCharCode.apply(null, u8.subarray(i, Math.min(i + 8192, u8.length)));
  return "data:" + mime + ";base64," + btoa(bin);
}
function importFiles(files, finished) {
  var items = [], pending = files.length, bad = 0, n = 0;
  if (!pending) { finished(0, 0); return; }
  function store() {
    items.forEach(function (it) {
      var base = it.name.replace(/^.*\//, "").replace(/\.[^.]+$/, ""), ext = (it.name.match(/\.([^.]+)$/) || [, ""])[1].toLowerCase();
      var isDigit = /^\d{1,3}$/.test(base) && VKEYS.indexOf(Number(base)) >= 0, okKey = isDigit || VKEYS.indexOf(base) >= 0;
      var mime = ext === "mp3" ? "audio/mpeg" : ext === "wav" ? "audio/wav" : (ext === "m4a" || ext === "mp4") ? "audio/mp4" : "";
      if (!okKey || !mime) { bad++; return; }
      try { localStorage.setItem("voice_" + base, toDataURI(it.data, mime)); n++; } catch (e) { bad++; }
    });
    finished(n, bad);
  }
  function one() { if (--pending === 0) store(); }
  for (var i = 0; i < files.length; i++) (function (f) {
    var r = new FileReader();
    r.onload = function () {
      if (/\.zip$/i.test(f.name)) { try { readZip(r.result).forEach(function (e) { items.push(e); }); } catch (e) { bad++; } }
      else items.push({ name: f.name, data: new Uint8Array(r.result) });
      one();
    };
    r.onerror = function () { bad++; one(); };
    r.readAsArrayBuffer(f);
  })(files[i]);
}

/* ---------- timers ---------- */
var timers = [];
function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
function clearTimers() { timers.forEach(clearTimeout); timers = []; }

/* ---------- screens + layout ---------- */
var particles = [];
var current = "home";
function show(id) {
  clearTimers(); stopVoice(); particles = []; current = id;
  ["home", "play", "find", "rec"].forEach(function (s) { $(s).className = "screen" + (s === id ? " on" : ""); });
  if (id === "home") renderHome();
  if (id === "rec") renderRec();
  layout();
}
var W = 0, H = 0, U = 1;
function layout() {
  W = window.innerWidth; H = window.innerHeight; U = Math.min(W, H) / 100;
  var bs = Math.round(Math.max(48, Math.min(72, U * 8)));
  var rs = document.querySelectorAll(".round");
  for (var i = 0; i < rs.length; i++) { rs[i].style.width = bs + "px"; rs[i].style.height = bs + "px"; }
  var barH = Math.round(Math.max(66, H * 0.14));
  var bars = document.querySelectorAll(".bar");
  for (var j = 0; j < bars.length; j++) bars[j].style.height = barH + "px";
  fx.width = W; fx.height = H;
  if (current === "home") layoutHome();
  if (current === "play") layoutPlay(barH);
  if (current === "find") layoutFind(barH);
  if (current === "rec") layoutRec(barH);
  dirty = true;
}
function layoutHome() {
  var portrait = H > W, per = portrait ? 4 : 5, rows = homeMode === "ranges" ? Math.ceil(10 / per) : Math.ceil(11 / per), mg = U * 1.3, ratio = homeMode === "ranges" ? 0.773 : 1.25;
  var btnH = Math.max(46, U * 12), fs = Math.max(18, U * 4.6);
  var gw = homeMode === "ranges" ? W * 0.9 : Math.min(W * 0.9, H * 1.25);
  var tw = Math.floor(gw / per - 2 * mg);
  var maxTw = ((H * 0.92 - btnH - 3 * U) / rows - 24 - 2 * mg) / ratio;
  tw = Math.floor(Math.min(tw, maxTw));
  var tiles = document.querySelectorAll("#grid .tile");
  for (var i = 0; i < tiles.length; i++) { tiles[i].style.width = tw + "px"; tiles[i].style.margin = mg + "px"; }
  var gridW = per * (tw + 2 * mg);
  var grid = $("grid"); grid.style.width = gridW + "px";
  var btn = $("findBtn"); btn.style.fontSize = fs + "px"; btn.style.height = btnH + "px"; btn.style.lineHeight = (btnH - 8) + "px";
  var total = rows * (tw * ratio + 2 * mg + 24) + btnH + 3 * U;
  $("homeIn").style.paddingTop = Math.max(8, (H - total) / 2) + "px";
}
var cv = $("cv"), ctx = cv.getContext("2d"), fx = $("fx"), fctx = fx.getContext("2d");
var cvW = 0, cvH = 0, scale = 1, ox = 0, oy = 0, dpr = 1;
function layoutPlay(barH) {
  var m = Math.max(10, U * 3), card = $("card");
  var cw = W - 2 * m, ch = H - barH - m;
  card.style.left = m + "px"; card.style.top = barH + "px"; card.style.width = cw + "px"; card.style.height = ch + "px";
  var land = cw > ch * 1.05, ow = land ? cw * 0.46 : cw, oh = land ? ch : ch * 0.36;
  var objs = $("objs"); objs.style.left = "0px"; objs.style.top = "0px"; objs.style.width = ow + "px"; objs.style.height = oh + "px";
  var n = cur === 0 ? 1 : cur, cols = cur > 20 ? 10 : cur >= 10 ? 5 : COLS[cur], rows = Math.ceil(n / cols), pad = U * 2;
  var s = Math.floor(Math.min((ow - 2 * pad) / cols, (oh - 2 * pad) / rows));
  var inn = $("objsIn"); inn.style.width = (cols * s) + "px"; inn.style.left = ((ow - cols * s) / 2) + "px"; inn.style.top = ((oh - rows * s) / 2) + "px";
  var os = inn.children; for (var i = 0; i < os.length; i++) { os[i].style.width = s + "px"; os[i].style.height = s + "px"; }
  var cx = land ? ow : 0, cy = land ? 0 : oh;
  cvW = land ? cw - ow : cw; cvH = land ? ch : ch - oh;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.style.left = cx + "px"; cv.style.top = cy + "px"; cv.style.width = cvW + "px"; cv.style.height = cvH + "px";
  cv.width = Math.round(cvW * dpr); cv.height = Math.round(cvH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  var uw = unitW(cur); scale = Math.min(cvW / (uw + 65), cvH / 345); ox = (cvW - uw * scale) / 2; oy = (cvH - 300 * scale) / 2;
}
function layoutFind(barH) {
  var cw = Math.floor(Math.min(W * 0.26, (H - barH) * 0.6 * 0.75)), chh = Math.floor(cw * 4 / 3);
  var cards = document.querySelectorAll("#cards .card");
  for (var i = 0; i < cards.length; i++) { cards[i].style.width = cw + "px"; cards[i].style.height = chh + "px"; cards[i].style.margin = "0 " + (U * 2) + "px"; }
  var box = $("cards"); box.style.top = (barH + Math.max(0, (H - barH - chh) / 2 - U * 3)) + "px";
}
window.addEventListener("resize", function () { layout(); });
window.addEventListener("orientationchange", function () { setTimeout(layout, 250); });

/* ---------- home ---------- */
function rangeSVG(p) {
  var nums = pageNums(p), a = nums[0], z = nums[nums.length - 1], c = COLORS[p % 10], pa = PASTEL[p % 10], DG = 130;
  var wa = unitW(a), wz = unitW(z), tot = wa + DG + wz, k = Math.min(272 / tot, 0.4), x0 = (300 - tot * k) / 2, y0 = (222 - 300 * k) / 2;
  function draw(n, x) {
    var pts = NUMBERS[n].map(function (st) { return st.map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" "); });
    function L(sw, col, ex) { return pts.map(function (t) { return '<polyline points="' + t + '" fill="none" stroke="' + col + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round" ' + (ex || "") + "/>"; }).join(""); }
    return '<g transform="translate(' + x + " " + y0 + ") scale(" + k + ')">' + L(47, c) + L(44, pa) + L(2.6, c, 'stroke-dasharray="9 9" opacity=".7"') + "</g>";
  }
  var dots = "";
  for (var i = 0; i < nums.length; i++) dots += '<circle cx="' + (150 + (i - (nums.length - 1) / 2) * 15) + '" cy="214" r="4.5" fill="' + (stars[nums[i]] > 0 ? c : "#e6dccd") + '"/>';
  var mx = x0 + (wa + DG / 2) * k;
  return '<svg viewBox="0 0 300 232">' + draw(a, x0) + '<line x1="' + (mx - 9) + '" y1="' + (y0 + 150 * k) + '" x2="' + (mx + 9) + '" y2="' + (y0 + 150 * k) + '" stroke="' + c + '" stroke-width="7" stroke-linecap="round" opacity=".85"/>' + draw(z, x0 + (wa + DG) * k) + dots + "</svg>";
}
function renderHome() {
  var g = $("grid"); g.innerHTML = "";
  var pb = $("pageBtn");
  $("gear").style.display = homeMode === "ranges" ? "" : "none";
  if (homeMode === "ranges") {
    pb.style.display = "none";
    for (var p = 0; p < 10; p++) (function (p) {
      var t = document.createElement("div"); t.className = "tile"; t.style.borderColor = COLORS[p % 10];
      t.innerHTML = '<div class="ti" style="padding-bottom:77.3%">' + rangeSVG(p) + "</div>";
      tap(t, function () { homeMode = "numbers"; homePageIdx = p; renderHome(); });
      g.appendChild(t);
    })(p);
  } else {
    pb.style.display = "inline-block"; pb.innerHTML = iconSVG("next"); pb.className = "round back";
    var pad = "125%";
    pageNums(homePageIdx).forEach(function (d) {
      var t = document.createElement("div"); t.className = "tile"; t.style.borderColor = COLORS[ci(d)];
      var st = ""; for (var k = 0; k < Math.min(stars[d], 3); k++) st += iconSVG("star");
      t.innerHTML = '<div class="ti" style="padding-bottom:' + pad + '">' + digitSVG(d) + '</div><div class="stars">' + st + "</div>";
      tap(t, function () { startPlay(d); });
      g.appendChild(t);
    });
  }
  layoutHome();
}
function tap(el, fn) {
  var moved = false, sx = 0, sy = 0, fired = false;
  el.addEventListener("touchstart", function (e) { moved = false; fired = false; var t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, false);
  el.addEventListener("touchmove", function (e) { var t = e.touches[0]; if (Math.abs(t.clientX - sx) > 12 || Math.abs(t.clientY - sy) > 12) moved = true; }, false);
  el.addEventListener("touchend", function (e) { e.preventDefault(); if (!moved && !fired) { fired = true; fn(); } }, false);
  el.addEventListener("click", function () { if (!fired) fn(); fired = false; }, false);
}

/* ---------- tracing ---------- */
var cur = 0, strokeIdx = 0, pos = 0, drawing = false, done = false, lastTouch = 0, fingerPt = null, dirRev = false, dirty = true;
var R = 30, WIN = 16;
function curWP() { return (LOOPS[cur][strokeIdx] && dirRev) ? REV[cur][strokeIdx] : NUMBERS[cur][strokeIdx]; }
function startPlay(d) {
  cur = d; strokeIdx = 0; pos = 0; drawing = false; done = false; dirRev = false; lastTouch = Date.now();
  show("play"); $("next").className = "round";
  var o = $("objsIn"); o.innerHTML = "";
  homeMode = "numbers"; homePageIdx = pageOf(d);
  var n = d === 0 ? 1 : d, big = d >= 10, huge = d > 20;
  $("card").style.borderColor = COLORS[ci(d)];
  for (var i = 0; i < n; i++) (function (i) {
    var s = document.createElement("div"); s.className = "obj"; s.innerHTML = huge ? dotSVG(d, i) : objSVG(big ? OBJ_FOR[d - 10] : d);
    tap(s, function () { s.className = "obj"; void s.offsetWidth; s.className = "obj on"; tone(500 + i * 70, 0.12); sayNum(d === 0 ? 0 : i + 1); });
    o.appendChild(s);
  })(i);
  layout();
  later(function () { sayNum(d, function () { sayName("draw", function () { sayNum(d); }); }); }, 350);
}
function scan(wp, u) {
  for (var j = Math.min(wp.length - 1, pos + WIN); j >= pos; j--) { if (Math.hypot(u[0] - wp[j][0], u[1] - wp[j][1]) < R + (j === pos ? 18 : 0)) return j; }
  return -1;
}
function nearest(wp, u) { var m = 1e9; for (var j = 0; j <= WIN && j < wp.length; j++) m = Math.min(m, Math.hypot(u[0] - wp[j][0], u[1] - wp[j][1])); return m; }
function match(u) {
  if (LOOPS[cur][strokeIdx] && pos === 0) {
    var F = NUMBERS[cur][strokeIdx], RV = REV[cur][strokeIdx], s0 = F[0];
    if (Math.hypot(u[0] - s0[0], u[1] - s0[1]) < 14) return scan(F, u) >= 0 ? 0 : -1;
    dirRev = nearest(RV, u) < nearest(F, u);
    return scan(dirRev ? RV : F, u);
  }
  return scan(curWP(), u);
}
function advance(j) {
  var wp = NUMBERS[cur][strokeIdx];
  if (j > pos) { pos = j; if (pos % 4 === 0) tone(380 + pos * 3, 0.05, "sine", 0.05); }
  if (pos >= wp.length - 3) {
    pos = wp.length - 1; tone(700, 0.12, "triangle", 0.15);
    if (strokeIdx < NUMBERS[cur].length - 1) { strokeIdx++; pos = 0; drawing = false; dirRev = false; } else win();
  }
  dirty = true;
}
function pt(e) {
  var t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
  var r = cv.getBoundingClientRect();
  return [(t.clientX - r.left - ox) / scale, (t.clientY - r.top - oy) / scale];
}
function pDown(e) { if (done) return; lastTouch = Date.now(); var u = pt(e), j = match(u); if (j >= 0) { drawing = true; fingerPt = u; advance(j); } dirty = true; }
function pMove(e) { if (!drawing || done) return; lastTouch = Date.now(); fingerPt = pt(e); var j = match(fingerPt); if (j >= 0) advance(j); dirty = true; }
function pUp() { drawing = false; fingerPt = null; dirty = true; }
cv.addEventListener("touchstart", function (e) { e.preventDefault(); pDown(e); }, false);
cv.addEventListener("touchmove", function (e) { e.preventDefault(); pMove(e); }, false);
cv.addEventListener("touchend", function (e) { e.preventDefault(); pUp(); }, false);
cv.addEventListener("touchcancel", pUp, false);
var mouseDown = false;
cv.addEventListener("mousedown", function (e) { mouseDown = true; pDown(e); }, false);
cv.addEventListener("mousemove", function (e) { if (mouseDown) pMove(e); }, false);
window.addEventListener("mouseup", function () { mouseDown = false; pUp(); }, false);
document.addEventListener("touchmove", function (e) {
  var t = e.target; while (t && t !== document.body) { if (t.id === "recList") return; t = t.parentNode; }
  e.preventDefault();
}, false);

function win() {
  done = true; drawing = false; fingerPt = null; stars[cur] = Math.min(stars[cur] + 1, 99); saveStars();
  fanfare(); confetti();
  var n = cur === 0 ? 0 : cur, objs = $("objsIn").children;
  if (cur === 0) later(function () { objs[0].className = "obj on"; sayName(0); }, 700);
  else if (cur > 20) {
    for (var h = 0; h < objs.length; h++) (function (h) { later(function () { objs[h].className = "obj on"; if (h % 10 === 0) tone(420 + Math.floor(h / 10) * 40, 0.1); }, 500 + Math.floor(h / 10) * 300 + (h % 10) * 20); })(h);
    later(function () { sayNum(cur); $("next").className = "round show"; }, 500 + Math.ceil(n / 10) * 300 + 400);
    return;
  }
  else if (cur >= 10) {
    for (var q = 0; q < objs.length; q++) (function (q) { later(function () { objs[q].className = "obj on"; tone(420 + q * 28, 0.09); }, 600 + q * 230); })(q);
    later(function () { sayNum(cur); $("next").className = "round show"; }, 600 + n * 230 + 300);
    return;
  }
  else for (var i = 0; i < objs.length; i++) (function (i) { later(function () { objs[i].className = "obj on"; tone(500 + i * 70, 0.12); sayName(i + 1); }, 700 + i * 1000); })(i);
  later(function () { sayNum(cur); $("next").className = "round show"; }, 700 + Math.max(n, 1) * 1000 + 300);
}

/* ---------- canvas drawing ---------- */
var patCache = {};
function crayon(color) {
  if (patCache[color]) return patCache[color];
  var c = document.createElement("canvas"); c.width = c.height = 14; var g = c.getContext("2d");
  g.fillStyle = color; g.fillRect(0, 0, 14, 14); g.lineCap = "round";
  g.strokeStyle = "rgba(255,255,255,.42)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-2, 16); g.lineTo(16, -2); g.stroke();
  g.strokeStyle = "rgba(120,70,60,.10)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-2, 9); g.lineTo(9, -2); g.moveTo(5, 16); g.lineTo(16, 5); g.stroke();
  return (patCache[color] = ctx.createPattern(c, "repeat"));
}
function pathOf(pts, upto) {
  ctx.beginPath(); var end = upto === undefined ? pts.length - 1 : upto;
  for (var i = 0; i <= end; i++) { var x = ox + pts[i][0] * scale, y = oy + pts[i][1] * scale; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
}
function sparkPath(g, r) { g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(0, 0, r, 0); g.quadraticCurveTo(0, 0, 0, r); g.quadraticCurveTo(0, 0, -r, 0); g.quadraticCurveTo(0, 0, 0, -r); g.closePath(); }
function setDash(a) { if (ctx.setLineDash) ctx.setLineDash(a); }
function drawPlay() {
  ctx.clearRect(0, 0, cvW, cvH); ctx.lineCap = "round"; ctx.lineJoin = "round";
  var S = NUMBERS[cur], O = COLORS[ci(cur)], Pp = PASTEL[ci(cur)], Pat = crayon(Pp), PatD = crayon(mixHex(Pp, O, 0.5)), i;
  setDash([]);
  for (i = 0; i < S.length; i++) { pathOf(S[i]); ctx.lineWidth = 47 * scale; ctx.strokeStyle = O; ctx.stroke(); }
  for (i = 0; i < S.length; i++) { pathOf(S[i]); ctx.lineWidth = 44 * scale; ctx.strokeStyle = Pat; ctx.stroke(); }
  for (i = 0; i < S.length; i++) {
    if (done || i < strokeIdx) { pathOf(S[i]); ctx.lineWidth = 44 * scale; ctx.strokeStyle = PatD; ctx.stroke(); }
    else if (i === strokeIdx && pos > 0) { pathOf((LOOPS[cur][i] && dirRev) ? REV[cur][i] : S[i], pos); ctx.lineWidth = 44 * scale; ctx.strokeStyle = PatD; ctx.stroke(); }
  }
  setDash([9 * scale, 9 * scale]); ctx.lineWidth = 2.6 * scale; ctx.globalAlpha = 0.7;
  for (i = 0; i < S.length; i++) { pathOf(S[i]); ctx.strokeStyle = O; ctx.stroke(); }
  ctx.globalAlpha = 0.9;
  for (i = 0; i < S.length; i++) {
    if (done || i < strokeIdx) { pathOf(S[i]); ctx.strokeStyle = "#fff"; ctx.stroke(); }
    else if (i === strokeIdx && pos > 0) { pathOf((LOOPS[cur][i] && dirRev) ? REV[cur][i] : S[i], pos); ctx.strokeStyle = "#fff"; ctx.stroke(); }
  }
  ctx.globalAlpha = 1; setDash([]);
  if (!done) {
    var wp = curWP();
    for (i = 0; i < S.length; i++) {
      if (i < strokeIdx || (i === strokeIdx && (pos > 0 || drawing))) continue;
      var now = i === strokeIdx, p0 = (now && LOOPS[cur][i] && dirRev) ? REV[cur][i][0] : S[i][0], r = (now ? 23 : 14) * scale;
      ctx.beginPath(); ctx.arc(ox + p0[0] * scale, oy + p0[1] * scale, r, 0, 7); ctx.fillStyle = now ? "#f78fa7" : "#b9a99a"; ctx.fill();
      ctx.lineWidth = 3.5 * scale; ctx.strokeStyle = "#fff"; ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = "bold " + ((now ? 24 : 18) * scale) + "px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(String(i + 1), ox + p0[0] * scale, oy + p0[1] * scale + 1);
    }
    var idle = Date.now() - lastTouch;
    if (!drawing && idle > 3500) {
      var k = Math.min(1, ((idle - 3500) % 2600) / 2200), idx = Math.floor(pos + (wp.length - 1 - pos) * k), p = wp[idx];
      ctx.save(); ctx.translate(ox + p[0] * scale, oy + p[1] * scale); sparkPath(ctx, 22 * scale); ctx.fillStyle = "#ffcf5a"; ctx.fill(); ctx.lineWidth = 2.5 * scale; ctx.strokeStyle = "#fff"; ctx.stroke(); ctx.restore();
    }
    if (drawing && fingerPt) { ctx.beginPath(); ctx.arc(ox + fingerPt[0] * scale, oy + fingerPt[1] * scale, 11 * scale, 0, 7); ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fill(); }
  }
}

/* ---------- sprinkles / hearts / sparkles ---------- */
function confetti() {
  var SP = ["#b7a0dd", "#f78fa7", "#ffcf5a", "#8fd9c0", "#ffb59a", "#8fc6e3"], K = Math.max(1, Math.min(W, H) / 380);
  function mk(x, y, vx, vy, i) {
    var r = Math.random(), t = r < 0.5 ? "dash" : r < 0.7 ? "heart" : r < 0.9 ? "spark" : "dot";
    return { x: x, y: y, vx: vx, vy: vy, t: t, c: t === "spark" ? "#ffcf5a" : t === "heart" ? (i % 2 ? "#f78fa7" : "#ffb0c4") : SP[i % SP.length], len: (9 + Math.random() * 7) * K, wid: (2.8 + Math.random() * 1.6) * K, s: (t === "heart" ? 4.5 + Math.random() * 2.5 : t === "spark" ? 5 + Math.random() * 4 : 2 + Math.random() * 1.5) * K, rot: Math.random() * 3, vr: (Math.random() - 0.5) * 0.2, life: 110 + Math.random() * 50 };
  }
  var i;
  for (i = 0; i < 40; i++) particles.push(mk(W / 2, H * 0.5, (Math.random() - 0.5) * 20, -Math.random() * 15 - 3, i));
  for (i = 0; i < 50; i++) particles.push(mk(Math.random() * W, -20 - Math.random() * H * 0.6, (Math.random() - 0.5) * 2, 1 + Math.random() * 3, i));
}
function drawFx() {
  fctx.clearRect(0, 0, W, H);
  particles = particles.filter(function (p) { return p.life > 0; });
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy = Math.min(p.vy + 0.2, 5); p.vx *= 0.99; p.rot += p.vr; p.life--;
    fctx.save(); fctx.globalAlpha = Math.min(1, p.life / 30); fctx.translate(p.x, p.y); fctx.rotate(p.rot); fctx.fillStyle = p.c; fctx.strokeStyle = p.c; fctx.lineCap = "round";
    if (p.t === "dash") { fctx.lineWidth = p.wid; fctx.beginPath(); fctx.moveTo(-p.len / 2, 0); fctx.lineTo(p.len / 2, 0); fctx.stroke(); }
    else if (p.t === "dot") { fctx.beginPath(); fctx.arc(0, 0, p.s, 0, 7); fctx.fill(); }
    else if (p.t === "spark") { sparkPath(fctx, p.s); fctx.fill(); }
    else { var r = p.s; fctx.beginPath(); fctx.moveTo(0, r * 0.9); fctx.bezierCurveTo(-r * 1.6, -r * 0.1, -r * 0.7, -r * 1.2, 0, -r * 0.4); fctx.bezierCurveTo(r * 0.7, -r * 1.2, r * 1.6, -r * 0.1, 0, r * 0.9); fctx.fill(); }
    fctx.restore();
  }
}
var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (f) { return setTimeout(f, 33); };
var hadParticles = false;
function frame() {
  if (current === "play" && cvW) {
    var idleAnim = !done && !drawing && (Date.now() - lastTouch > 3500);
    if (dirty || idleAnim) { drawPlay(); dirty = false; }
  }
  if (particles.length || hadParticles) { drawFx(); hadParticles = particles.length > 0; }
  raf(frame);
}

/* ---------- find the number ---------- */
var target = 0, lastTarget = -1, locked = false;
function startFind() { show("find"); nextRound(); }
function nextRound() {
  clearTimers(); locked = false;
  do { target = Math.floor(Math.random() * 10); } while (target === lastTarget);
  lastTarget = target;
  var opts = [target]; while (opts.length < 3) { var x = Math.floor(Math.random() * 10); if (opts.indexOf(x) < 0) opts.push(x); }
  opts.sort(function () { return Math.random() - 0.5; });
  var box = $("cards"); box.innerHTML = "";
  opts.forEach(function (d) {
    var c = document.createElement("div"); c.className = "card"; c.style.borderColor = COLORS[d]; c.innerHTML = digitSVG(d);
    tap(c, function () {
      if (locked) return;
      if (d === target) { locked = true; c.className = "card good"; fanfare(); confetti(); later(function () { sayName("praise"); }, 500); later(nextRound, 3400); }
      else { c.className = "card"; void c.offsetWidth; c.className = "card bad"; failSound(); later(function () { sayName("oops", function () { sayName(d, function () { sayName("retry", function () { sayName(target); }); }); }); }, 700); }
    });
    box.appendChild(c);
  });
  layoutFind(Math.round(Math.max(66, H * 0.14)));
  later(function () { sayName("prompt", function () { sayName(target); }); }, 300);
}

window.__numdbg = function () { return { NUMBERS: NUMBERS, LOOPS: LOOPS, REV: REV, ox: ox, oy: oy, scale: scale, done: done, cur: cur, pos: pos, strokeIdx: strokeIdx, target: target, particles: particles.length, stars: stars }; };

/* ---------- parents screen: import voices (recording and export are not possible on iOS 9) ---------- */
function layoutRec(barH) {
  var list = $("recList"); list.style.top = barH + "px";
  var cols = W < 700 ? 1 : 2, rw = Math.floor((W * 0.94) / cols - 14);
  var rows = list.children; for (var i = 0; i < rows.length; i++) rows[i].style.width = rw + "px";
  var rb = document.querySelectorAll(".rb2"); var bs = Math.round(Math.max(40, Math.min(52, U * 5.4)));
  for (var j = 0; j < rb.length; j++) { rb[j].style.width = bs + "px"; rb[j].style.height = bs + "px"; }
  $("rmsg").style.fontSize = Math.max(13, U * 2.4) + "px";
}
function recMsg(t) { $("rmsg").textContent = t; }
function renderRec() {
  var list = $("recList"); list.innerHTML = "";
  VKEYS.forEach(function (k) {
    var row = document.createElement("div"); row.className = "rrow";
    var label = typeof k === "number" ? '<div class="rd' + (k >= 100 ? " w3" : k >= 10 ? " w" : "") + '">' + digitSVG(k) + "</div>" : '<div class="rl">' + (PHRASE[k] || nameOf(k)) + "</div>";
    var have = !!voiceGet(k);
    row.innerHTML = '<div class="rlw">' + label + "</div>" + (have ? '<div class="rok">' + iconSVG("check") + "</div>" : "");
    if (have) {
      var pl = document.createElement("div"); pl.className = "rb2"; pl.innerHTML = iconSVG("play"); tap(pl, function () { sayName(k); }); row.appendChild(pl);
      var de = document.createElement("div"); de.className = "rb2"; de.innerHTML = iconSVG("trash"); tap(de, function () { try { localStorage.removeItem("voice_" + k); } catch (e) {} vcache = {}; renderRec(); layout(); }); row.appendChild(de);
    }
    list.appendChild(row);
  });
  var dg = document.createElement("div"); dg.className = "diag";
  dg.textContent = "אבחון שמע: wav=" + (voiceEl.canPlayType ? (voiceEl.canPlayType("audio/wav") || "no") : "?") + " | שגיאה אחרונה: " + lastAudioErr;
  list.appendChild(dg);
  layout();
}

/* ---------- wiring ---------- */
$("homeP").innerHTML = iconSVG("home"); $("homeF").innerHTML = iconSVG("home");
$("sayP").innerHTML = iconSVG("say"); $("sayF").innerHTML = iconSVG("say");
$("redo").innerHTML = iconSVG("redo"); $("next").innerHTML = iconSVG("next");
$("findBtn").innerHTML = iconSVG("play") + "<span>שנשחק?</span>";
tap($("homeP"), function () { show("home"); }); tap($("homeF"), function () { show("home"); });
tap($("sayP"), function () { sayNum(cur); }); tap($("sayF"), function () { sayName("prompt", function () { sayName(target); }); });
tap($("redo"), function () { startPlay(cur); }); tap($("next"), function () { startPlay(cur >= 100 ? 0 : cur + 1); });
tap($("pageBtn"), function () { homeMode = "ranges"; renderHome(); });
tap($("findBtn"), function () { tone(600, 0.1); startFind(); });
$("homeR").innerHTML = iconSVG("home"); $("impR").innerHTML = iconSVG("import"); $("gear").innerHTML = iconSVG("gear");
tap($("homeR"), function () { show("home"); });
tap($("impR"), function () { $("impIn").click(); });
$("impIn").onchange = function () {
  var fl = []; for (var i = 0; i < this.files.length; i++) fl.push(this.files[i]);
  var inp = this;
  importFiles(fl, function (n, bad) { recMsg("יובאו " + n + " הקלטות" + (bad ? " (" + bad + " דולגו)" : "") + "."); vcache = {}; renderRec(); inp.value = ""; });
};
recMsg("הקלטה וייצוא לא זמינים במכשיר הזה. אפשר לייבא קובץ voices.zip שיוצא ממכשיר אחר.");
(function () {
  var g = $("gear"), t = null;
  function down() { g.className = "hold"; clearTimeout(t); t = setTimeout(function () { g.className = ""; show("rec"); }, 800); }
  function up() { g.className = ""; clearTimeout(t); }
  g.addEventListener("touchstart", down, false); g.addEventListener("mousedown", down, false);
  g.addEventListener("touchend", up, false); g.addEventListener("touchcancel", up, false); g.addEventListener("mouseup", up, false); g.addEventListener("mouseleave", up, false);
  if (/[?&]rec\b/.test(location.search)) setTimeout(function () { show("rec"); }, 0);
})();
addDeco($("home")); addDeco($("card")); addDeco($("find"));
setTimeout(function () { var i = 0; (function next() { if (i >= VKEYS.length) return; getBuffer(VKEYS[i++], function () { setTimeout(next, 60); }); })(); }, 1200);
show("home");
frame();
})();
