/* HUD «Весточка» (CEF STUDIO) — очищенная версия под мод.
   События сервер -> CEF (cef_emit_event):
     hud:visible(bool)                 показать/скрыть HUD
     hud:stamina(int)                  выносливость 0..100
     hud:money(int)                    деньги (если сервер прислал — клиентские деньги GTA игнорируются)
     hud:server(str title, str sub)    название сервера
     capture:visible(bool) / capture:start(str round, int seconds)
     capture:gang:name(int 1|2, str) / capture:gang:score(int 1|2, int)
     kill:list:add(str killer, int weapon, str killed) / kill:list:clear()
     speedometer:visible(bool) / speedometer:engine|lights|doors|key(bool)
     speedometer:fuel(int) / speedometer:health(int %)
     show-fps / hide-fps
   Здоровье, броня, оружие, патроны, розыск, деньги и скорость берёт сам клиент CEF
   (game:data:playerStats). */
var hud = new Vue({
  el: ".cefstudio-interface",
  data: {
    isHudActive: false,
    weapon: "images/guns/0.png",
    ammo: "0/0",
    health: 100,
    armour: 0,
    stamina: 100,
    suspect: 0,
    isSpeedActive: false,
    vehicleSpeed: 0,
    vehicleGear: "P",
    vehicleFuel: 100,
    vehicleHealth: 100,
    isVehicleEngine: true,
    isVehicleLights: true,
    isVehicleDoors: true,
    isVehicleKey: true,
    isCaptureVisible: false,
    captureTime: null,
    captureRound: "",
    formattedCaptureTime2: "00:00",
    captureGang: [{ id: 1, name: "", score: 0 }, { id: 2, name: "", score: 0 }],
    killList: []
  },
  computed: {
    formattedCaptureTime: function () {
      var t = Math.max(0, this.captureTime | 0);
      return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
    },
    lastFiveKills: function () { return this.killList.slice(-5); }
  },
  methods: {
    capture: function (round, seconds) {
      if (this.countdownTimer) clearInterval(this.countdownTimer);
      this.captureRound = round;
      this.captureTime = (seconds | 0);
      this.countdownTimer = setInterval(() => {
        if (this.captureTime > 0) this.captureTime--;
        if (this.captureTime <= 0) { clearInterval(this.countdownTimer); this.countdownTimer = null; }
      }, 1000);
    },
    replaceColors: function (s) {
      return String(s).replace(/</g, "&lt;").replace(/\{([0-9A-Fa-f]{6})\}/g, "<span style=\"color: #$1;\">").replace(/\{\/\}/g, "</span>");
    },
    killAdd: function (killer, weapon, killed) {
      this.killList.push({ killer: killer, weapon: weapon, killed: killed });
      if (this.killList.length > 20) this.killList.splice(0, this.killList.length - 20);
    },
    killClear: function () { this.killList = []; }
  }
});

setInterval(function () {
  if (!hud.isHudActive) return;
  var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
  var de = document.getElementById("server-date"), te = document.getElementById("server-time");
  if (de) de.innerHTML = p(d.getDate()) + "." + p(d.getMonth() + 1) + "." + d.getFullYear();
  if (te) te.innerHTML = p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
}, 500);

function pad(v, len, zero) {
  zero = zero || "<span style=\"opacity: 0.5\">0</span>";
  v = String(v);
  return v.length >= len ? v : new Array(len - v.length + 1).join(zero) + v;
}
var serverMoney = false;
function MoneyUpdate(m) {
  var el = document.getElementById("cash");
  if (el) el.innerHTML = pad(Math.max(0, m | 0), 9) + "<img src=\"images/money-1.png\" />";
}

var gearHooked = false;
function UpdateSpeed(speed) {
  if (!gearHooked) {
    gearHooked = true;
    document.addEventListener("keydown", function (e) {
      if (e.keyCode === 83) hud.vehicleGear = "R";
      if (e.keyCode === 87) hud.vehicleGear = "D";
    });
  }
  if (speed === 0) hud.vehicleGear = "P";
  var el = document.getElementById("speed");
  if (el) el.style = "stroke-dasharray: " + Math.round(266 / 160 * speed / 1.05) + "% 500%;";
  hud.vehicleSpeed = Math.round(speed);
}

if (typeof cef !== "undefined") {
  cef.emit("game:hud:setComponentVisible", "interface", false); // скрыть стандартный HUD GTA
  cef.emit("game:data:pollPlayerStats", true, 50);

  // hp, maxHp, armour, breath, wanted, weapon, ammoClip, ammoTotal, money, speed
  cef.on("game:data:playerStats", function (hp, maxHp, arm, breath, wanted, weapon, clip, total, money, speed) {
    hud.health = Math.round(hp);
    hud.armour = Math.round(arm);
    hud.weapon = "images/guns/" + ((weapon >= 0 && weapon <= 46) ? weapon : 0) + ".png";
    hud.ammo = clip + "/" + Math.max(0, total - clip);
    hud.suspect = wanted;
    if (!serverMoney) MoneyUpdate(money);
    if (hud.isSpeedActive) UpdateSpeed(speed);
  });

  cef.on("hud:visible", function (v) { hud.isHudActive = !!v; });
  cef.on("hud:stamina", function (v) { hud.stamina = Math.round(v); });
  cef.on("hud:money", function (v) { serverMoney = true; MoneyUpdate(v); });
  cef.on("hud:server", function (title, sub) {
    var n = document.querySelector(".server-name .name"), s = document.querySelector(".server-name .server");
    if (n) n.textContent = title;
    if (s) s.textContent = sub;
  });

  cef.on("capture:visible", function (v) { hud.isCaptureVisible = !!v; });
  cef.on("capture:start", function (round, sec) { hud.capture(round, sec); });
  cef.on("capture:gang:name", function (i, name) { if (hud.captureGang[i - 1]) hud.captureGang[i - 1].name = name; });
  cef.on("capture:gang:score", function (i, sc) { if (hud.captureGang[i - 1]) hud.captureGang[i - 1].score = sc; });
  cef.on("kill:list:add", function (a, w, b) { hud.killAdd(a, w, b); });
  cef.on("kill:list:clear", function () { hud.killClear(); });

  cef.on("speedometer:visible", function (v) { hud.isSpeedActive = !!v; });
  cef.on("speedometer:engine", function (v) { hud.isVehicleEngine = !!v; });
  cef.on("speedometer:lights", function (v) { hud.isVehicleLights = !!v; });
  cef.on("speedometer:doors", function (v) { hud.isVehicleDoors = !!v; });
  cef.on("speedometer:key", function (v) { hud.isVehicleKey = !!v; });
  cef.on("speedometer:fuel", function (v) {
    hud.vehicleFuel = Math.round(v);
    Vue.nextTick(function () {
      var el = document.getElementById("progress-vehicle-fuel");
      if (el) el.style = "stroke-dasharray: " + Math.round(250 / 165 * v / 1.05) + "% 500%;";
    });
  });
  cef.on("speedometer:health", function (v) {
    hud.vehicleHealth = Math.round(v);
    Vue.nextTick(function () {
      var el = document.getElementById("progress-vehicle-health");
      if (el) el.style = "stroke-dasharray: " + Math.round(250 / 165 * v / 1.05) + "% 500%;";
    });
  });
}

var fpsOut = document.getElementById("fps");
var getFPS = function () {
  return new Promise(function (r) { requestAnimationFrame(function (a) { requestAnimationFrame(function (b) { r(1000 / (b - a)); }); }); });
};
setInterval(function () {
  if (!fpsOut || fpsOut.style.display === "none") return;
  getFPS().then(function (f) {
    fpsOut.style.color = f < 10 ? "#f04245" : (f <= 30 ? "#ffcc00" : "#184a63");
    fpsOut.innerHTML = Math.round(f);
  });
}, 1000);
if (typeof cef !== "undefined") {
  cef.on("show-fps", function () { fpsOut.style.display = "block"; });
  cef.on("hide-fps", function () { fpsOut.style.display = "none"; });
}

// Демо-режим при открытии страницы в обычном браузере (без игры)
if (typeof cef === "undefined") {
  hud.isHudActive = true; hud.health = 85; hud.armour = 50; hud.stamina = 70;
  hud.weapon = "images/guns/24.png"; hud.ammo = "7/35"; MoneyUpdate(123456);
}
