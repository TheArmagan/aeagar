import * as Vue from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import * as connection from "./connection.js";
import { UINT8_CACHE } from "./constants.js";
import { onKeyDown, onKeyUp, onMouseMove, onTouchEnd, onTouchMove, onTouchStart, onWheel } from "./controls.js";
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
      name: shared.other.name,
      isTouching: shared.other.isTouching,
      touchCirclePosition: { x: 0, y: 0 }
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
      if (e.code == "Escape") {
        document.querySelector(".chat-input").blur();
      }
    },
    onKeyDown(e) {
      other.pressedKeys.add(e.code);
      if (other.isTyping) return;
      if (e.code == "Escape") this.isESCOverlayVisible = !this.isESCOverlayVisible;
      if (!this.isESCOverlayVisible) {
        onKeyDown(e);
        if (e.code == "Enter") document.querySelector(".chat-input").focus();
      }
    },
    onKeyUp(e) {
      other.pressedKeys.delete(e.code);
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
    },
    onTouchMove(e) {
      onTouchMove(e);
    },
    onTouchStart(e) {
      onTouchStart(e);
    },
    onTouchEnd(e) {
      onTouchEnd(e);
    },
    onMouseMove(e) {
      onMouseMove(e);
    }
  },
  watch: {
    name(v) {
      shared.other.name = v;
      localStorage.setItem("aeAgarName", v);
    },
    skin(v) {
      shared.other.skin = v;
      localStorage.setItem("aeAgarSkin", v);
    },
    isTouching(v) {
      shared.other.isTouching = v;
    }
  },
  mounted() {
    internalVueApp = this;

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("wheel", this.onWheel, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove);
    window.addEventListener('touchstart', this.onTouchStart);
    window.addEventListener('touchend', this.onTouchEnd);
  }
});

vueApp.mount("#app");


