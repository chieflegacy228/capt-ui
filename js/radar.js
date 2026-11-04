/* Мини-карта CEF (в стиле Малиновки).
   Сервер присылает: hud:pos(x, y, angle, camFx, camFy, inVeh, interior, hasGps, gpsX, gpsY) каждые ~100 мс.
   Карта: images/map.jpg (3072x3072) = весь мир от -3000 до 3000.
   Названия мест — список ZONES ниже (координаты мира: x1, y1 — левый нижний угол, x2, y2 — правый верхний). */
var ZONES = [
  ["пгт. Батырево",  1300,  1450, 2700, 3000],
  ["г. Арзамас",     1300, -2950, 2950, -1250],
  ["г. Южный",       -850, -2200, -100,  -900],
  ["пгт. Бусаево",  -2950,  -450, -2250,  750],
  ["д. Лыткарино",  -1150,  2000,  -600, 2700],
  ["с. Эдово",       1750,  -700,  2750, -150],
  ["Автодром",      -2100,  1450, -1400, 2150],
  ["Военный аэродром", -2950, 1450, -2200, 3000],
  ["Озеро",         -2750, -1400, -2200,  -700],
  ["Остров",        -2250, -3000, -1650, -2450]
];
var ZONE_DEFAULT = "Загородная зона";

var MAP_WORLD = 6000;          // размер мира в единицах
var ZOOM_FOOT = 1.45;          // пикселей карты на 1 метр (при высоте экрана 1080)
var ZOOM_CAR = 0.85;

var radar = { x: 0, y: 0, a: 0, cam: 0, veh: 0, int: 0, gps: 0, gx: 0, gy: 0, ok: false };
var rv = { x: 0, y: 0, a: 0, cam: 0, zoom: ZOOM_FOOT, init: false };   // сглаженные значения

function zoneName(x, y) {
  for (var i = 0; i < ZONES.length; i++) {
    var z = ZONES[i];
    if (x >= z[1] && x <= z[3] && y >= z[2] && y <= z[4]) return z[0];
  }
  return ZONE_DEFAULT;
}
function angLerp(from, to, t) {
  var d = ((to - from + 540) % 360) - 180;
  return from + d * t;
}

function radarFrame() {
  requestAnimationFrame(radarFrame);
  var box = document.querySelector(".mrad-map");
  if (!box || !radar.ok) return;
  var img = box.querySelector(".mrad-img"), me = box.querySelector(".mrad-me"),
      gps = box.querySelector(".mrad-gps"), north = box.querySelector(".mrad-north");
  if (!rv.init) { rv.x = radar.x; rv.y = radar.y; rv.a = radar.a; rv.cam = radar.cam; rv.init = true; }
  var t = 0.25;
  if (Math.abs(radar.x - rv.x) > 150 || Math.abs(radar.y - rv.y) > 150) t = 1;   // телепорт
  rv.x += (radar.x - rv.x) * t;
  rv.y += (radar.y - rv.y) * t;
  rv.a = angLerp(rv.a, radar.a, 0.3);
  rv.cam = angLerp(rv.cam, radar.cam, 0.3);
  rv.zoom += ((radar.veh ? ZOOM_CAR : ZOOM_FOOT) - rv.zoom) * 0.05;

  var k = rv.zoom * window.innerHeight / 1080;            // px на метр
  var full = MAP_WORLD * k;
  var px = (rv.x + MAP_WORLD / 2) * k, py = (MAP_WORLD / 2 - rv.y) * k;
  img.style.width = full + "px";
  img.style.height = full + "px";
  img.style.transform = "rotate(" + rv.cam.toFixed(2) + "deg) translate(" + (-px).toFixed(1) + "px," + (-py).toFixed(1) + "px)";
  me.style.transform = "rotate(" + (rv.cam - rv.a).toFixed(1) + "deg)";
  box.classList.toggle("interior", radar.int > 0);

  var hw = box.clientWidth / 2, hh = box.clientHeight / 2, r = rv.cam * Math.PI / 180;
  var cs = Math.cos(r), sn = Math.sin(r);
  function place(el, dx, dy, pad) {     // dx, dy — смещение на карте (север вверх), пиксели
    var sx = dx * cs - dy * sn, sy = dx * sn + dy * cs;
    var m = Math.max(Math.abs(sx) / (hw - pad), Math.abs(sy) / (hh - pad), 1);
    el.style.transform = "translate(" + (sx / m).toFixed(1) + "px," + (sy / m).toFixed(1) + "px)";
  }
  place(north, 0, -10000, 10);          // «N» всегда у края в сторону севера
  if (radar.gps && radar.int === 0) {
    gps.style.display = "block";
    place(gps, (radar.gx - rv.x) * k, -(radar.gy - rv.y) * k, 10);
  } else gps.style.display = "none";
}
requestAnimationFrame(radarFrame);

setInterval(function () {
  var el = document.getElementById("radar-zone");
  if (el && radar.ok) el.textContent = radar.int > 0 ? "Помещение" : zoneName(radar.x, radar.y);
}, 500);

if (typeof cef !== "undefined") {
  cef.emit("game:hud:setComponentVisible", "radar", false);   // скрыть стандартный радар GTA
  cef.on("hud:pos", function (x, y, a, fx, fy, veh, interior, hasGps, gx, gy) {
    radar.x = x; radar.y = y; radar.a = a;
    if (Math.abs(fx) + Math.abs(fy) > 0.01) radar.cam = Math.atan2(-fx, fy) * 180 / Math.PI;
    radar.veh = veh | 0; radar.int = interior | 0;
    radar.gps = hasGps | 0; radar.gx = gx; radar.gy = gy;
    radar.ok = true;
  });
} else {
  // демо в обычном браузере: ходим по Батырево
  radar.ok = true; radar.x = 1850; radar.y = 2050; radar.a = 30; radar.cam = 0; radar.gps = 1; radar.gx = 1896; radar.gy = 1721;
  setInterval(function () { radar.a += 1; radar.x -= Math.sin(radar.a * Math.PI / 180) * 0.6; radar.y += Math.cos(radar.a * Math.PI / 180) * 0.6; }, 50);
}
