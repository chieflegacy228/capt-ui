/* Радиальное меню (Tab) — очищенная версия. Клик: cefstudio:radial.click(id), открытие: cefstudio:radial.update(menu) */
const _0x2d39af = {
  radial: !1,
  radialCurrentMenu: 10,
  radialButtonName: "Быстрые действия",
  radialButtonWarning: "",
  radialCarUploaded: true,
  radialPassiveActive: false,
  radialSleepActive: false,
  radialDrugsActive: false,
  radialHealthActive: false,
  radialLocationCarActive: false,
  radialTimeInGame: 0,
  radialTimeInAFK: 0,
  radialTimeHour: 0,
  radialPlayersOnline: 0,
  radialPlayerName: "Nick_Name[52]",
  radialNetwork: "Подключено (0 ms, 0.0% loss)",
  radialVoiceNetwork: "Подключено (0 ms, 0.0% loss)"
};
var app = new Vue({
  el: "#app",
  data: _0x2d39af,
  mounted() {
    const _0x485ab7 = () => {
      if (this.radial) {
        if (this.radialCurrentMenu !== 10) {
          this.updateRadial("radialCurrentMenu", 10);
        } else if (this.radialCurrentMenu === 10) {
          this.closeRadial();
        }
      }
    };
    const _0xbf1056 = _0x37716b => {
      if (_0x37716b.key === "Tab") {
        _0x37716b.preventDefault();
        if (hud.isHudActive) {
          if (!this.radial) this.openRadial();
        }
      }
    };
    window.addEventListener("keydown", _0x161172 => {
      if (_0x161172.key === "Escape") {
        _0x485ab7();
      } else if (_0x161172.key === "Tab") {
        _0xbf1056(_0x161172);
      }
    });
    window.addEventListener("keyup", _0xd6e308 => {
      if (_0xd6e308.key === "Tab") {
        _0xbf1056(_0xd6e308);
      }
    });
    window.addEventListener("contextmenu", _0x485ab7);
  },
  methods: {
    openRadial() {
      if (this.radial || !hud.isHudActive) return;
      this.setActiveComponent("radial", 10, true);
      this.$nextTick(() => { var el = document.getElementById("interface-radial"); if (el) el.style.animation = "show 0.2s forwards"; });
    },
    closeRadial() {
      if (!this.radial) return;
      var el = document.getElementById("interface-radial");
      if (el) el.style.animation = "hide 0.2s forwards";
      setTimeout(() => { this.setActiveComponent("radial", 10, false); }, 200);
    },
    setActiveComponent(_0x329d88, _0x22f40d, _0x49955a) {
      this[_0x329d88] = _0x49955a;
      this.radialCurrentMenu = _0x22f40d;
      if (typeof cef !== "undefined") cef.set_focus(!!_0x49955a);
      if (_0x49955a === true && typeof cef !== "undefined") {
        cef.emit("cefstudio:radial.update", _0x22f40d);
      }
    },
    updateRadial(_0x302566, _0x5e797c) {
      this[_0x302566] = _0x5e797c;
      if (_0x302566 === "radialCurrentMenu") {
        if (this.radialCurrentMenu === 10) {
          this.radialButtonName = "Быстрые действия";
        } else if (this.radialCurrentMenu === 11) {
          this.radialButtonName = "Управление личным транспортом";
        } else if (this.radialCurrentMenu === 12) {
          this.radialButtonName = "Посмотреть удостверение или навыки";
        }
      }
    },
    mouseoverButton(_0x3507d1) {
      this.radialButtonName = _0x3507d1.dataset.name;
      const _0x63c335 = document.getElementById("mouse");
      if (_0x3507d1.dataset.button == 6) {
        _0x63c335.style.opacity = this.radialSleepActive ? "1" : "0.5";
        if (!this.radialSleepActive) {
          this.radialButtonWarning = _0x3507d1.dataset.warning;
        }
      } else if (_0x3507d1.dataset.button == 9) {
        _0x63c335.style.opacity = this.radialDrugsActive ? "1" : "0.5";
        if (!this.radialDrugsActive) {
          this.radialButtonWarning = _0x3507d1.dataset.warning;
        }
      } else if (_0x3507d1.dataset.button == 10) {
        _0x63c335.style.opacity = this.radialHealthActive ? "1" : "0.5";
        if (!this.radialHealthActive) {
          this.radialButtonWarning = _0x3507d1.dataset.warning;
        }
      } else if (_0x3507d1.dataset.button == 13) {
        _0x63c335.style.opacity = this.radialLocationCarActive ? "1" : "0.5";
        if (!this.radialLocationCarActive) {
          this.radialButtonWarning = _0x3507d1.dataset.warning;
        }
      } else {
        _0x63c335.style.opacity = "1";
      }
      if (_0x3507d1.dataset.button == 1 && this.radialCarUploaded) {
        document.getElementById("car-arrow").style.animation = "showArrow 0.15s forwards";
        this.radialButtonName = "Управление личным транспортом";
      } else if (_0x3507d1.dataset.button == 5) {
        document.getElementById("naviki-arrow").style.animation = "showArrow 0.15s forwards";
      }
    },
    onmouseoutButton(_0x2a65fb) {
      if (this.radialCurrentMenu == 10) {
        this.radialButtonName = "Быстрые действия";
      } else if (this.radialCurrentMenu == 11) {
        this.radialButtonName = "Управление личным транспортом";
      } else if (this.radialCurrentMenu == 12) {
        this.radialButtonName = "Посмотреть удостверение или навыки";
      }
      this.radialButtonWarning = "";
      document.getElementById("mouse").style.opacity = ".5";
      if (_0x2a65fb.dataset.button == 1) {
        if (this.radialCarUploaded) {
          document.getElementById("car-arrow").style.animation = "hideArrow 0.15s forwards";
        }
      } else if (_0x2a65fb.dataset.button == 5) {
        document.getElementById("naviki-arrow").style.animation = "hideArrow 0.15s forwards";
      }
    },
    hoverButton(_0xb88756, _0x4815c1) {
      const _0x5ecf9f = _0xb88756;
      const _0x1c615d = _0xb88756.previousElementSibling;
      if (_0x4815c1) {
        _0x5ecf9f.classList.add("hover");
        _0x1c615d.classList.add("hover");
      } else {
        _0x5ecf9f.classList.remove("hover");
        _0x1c615d.classList.remove("hover");
      }
    },
    onclickbutton(_0x47f53e) {
      if (_0x47f53e == 1) {
        if (this.radialCarUploaded) {
          this.setActiveComponent("radial", 11, true);
          return;
        }
      } else if (_0x47f53e == 5) {
        this.updateRadial("radialCurrentMenu", 12);
        return;
      }
      if (typeof cef !== "undefined") cef.emit("cefstudio:radial.click", parseInt(_0x47f53e));
      this.closeRadial();
    }
  }
});
// ---- Радиальное меню: управление с сервера (вместо небезопасного eval) ----
var RADIAL_KEYS = ["radialCarUploaded", "radialPassiveActive", "radialSleepActive", "radialDrugsActive",
  "radialHealthActive", "radialLocationCarActive", "radialTimeInGame", "radialTimeInAFK", "radialTimeHour",
  "radialPlayersOnline", "radialPlayerName", "radialNetwork", "radialVoiceNetwork"];
if (typeof cef !== "undefined") {
  // radial:set("radialPlayersOnline", 25) — изменить одно поле меню
  cef.on("radial:set", function (key, value) { if (RADIAL_KEYS.indexOf(key) !== -1) app[key] = value; });
  // radial:info(online, "Nick_Name[id]", "Подключено (50 ms)", timeGame, timeAfk, timeHour)
  cef.on("radial:info", function (online, name, net, tg, tafk, th) {
    app.radialPlayersOnline = online; app.radialPlayerName = name; app.radialNetwork = net;
    app.radialTimeInGame = tg; app.radialTimeInAFK = tafk; app.radialTimeHour = th;
  });
  // radial:flags(car, passive, sleep, drugs, health, locationCar) — 0/1
  cef.on("radial:flags", function (car, passive, sleep, drugs, health, loc) {
    app.radialCarUploaded = !!car; app.radialPassiveActive = !!passive; app.radialSleepActive = !!sleep;
    app.radialDrugsActive = !!drugs; app.radialHealthActive = !!health; app.radialLocationCarActive = !!loc;
  });
  cef.on("radial:open", function () { app.openRadial(); });
  cef.on("radial:close", function () { app.closeRadial(); });
}