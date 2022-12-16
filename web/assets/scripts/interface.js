import * as Vue from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import * as connection from "./connection.js";
import { onKeyDown, onKeyUp, onWheel } from "./controls.js";
import { drawChat } from "./game.js";
import { shared } from "./shared.js";
const { camera, border, cells, chat, leaderBoard, stats, other, settings } = shared;

export let internalVueApp;
export const vueApp = Vue.createApp({
  data() {
    return {
      shared,
      isESCOverlayVisible: true,
      skin: shared.other.skin,
      name: shared.other.name
    }
  },
  methods: {
    onChatBlur() {
      other.isTyping = false;
      drawChat();
    },
    onChatFocus() {
      other.isTyping = true;
      drawChat();
    },
    onChatKeyDown(e) {
      if (e.code == "Enter") {
        connection.sendChat(e.target.value);
        e.target.value = "";
      }
    },
    onKeyDown(e) {
      if (e.code == "Escape") this.isESCOverlayVisible = !this.isESCOverlayVisible;
      if (!this.isESCOverlayVisible) {
        onKeyDown(e);
        if (e.code == "Enter") document.querySelector(".chat-input").focus();
      }
    },
    onKeyUp(e) {
      onKeyUp(e);
    },
    onWheel(e) {
      if (!this.isESCOverlayVisible) onWheel(e);
    },
    onPlay() {
      other.lastPlayAt = Date.now();
      connection.sendPlay(`<${this.skin}>${this.name}`);
      this.isESCOverlayVisible = false;
    },
    onSpectate() {
      other.lastPlayAt = Date.now();
      connection.sendSpectate();
      this.isESCOverlayVisible = false;
    }
  },
  watch: {
    name(v) {
      shared.other.name = v;
    },
    skin(v) {
      shared.other.skin = v;
    }
  },
  mounted() {
    internalVueApp = this;

    window.addEventListener("mousemove", (e) => {
      other.mouseX = e.x;
      other.mouseY = e.y;
    });

    window.addEventListener("keydown", (e) => {
      other.pressedKeys.add(e.code);
      this.onKeyDown(e);
    });

    window.addEventListener("keyup", (e) => {
      other.pressedKeys.delete(e.code);
      this.onKeyUp(e);
    });

    window.addEventListener("wheel", (e) => {
      this.onWheel(e);
    }, { passive: true });
  }
});

vueApp.mount("#app");


