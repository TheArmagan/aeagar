import * as Vue from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import { sendChat } from "./connection.js";
import { drawChat } from "./game.js";
import { shared } from "./shared.js";
const { camera, border, cells, chat, leaderBoard, stats, other, settings } = shared;

export const vueApp = Vue.createApp({
  data() {
    return {
      shared
    }
  },
  methods: {
    onMouseMove(e) {
      window.vueApp = this;
      other.mouseX = e.x;
      other.mouseY = e.y;
    },
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
        sendChat(e.target.value);
        e.target.value = "";
      }
    }
  },
});

vueApp.mount("#app");

