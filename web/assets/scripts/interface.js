import * as Vue from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

export const vueApp = Vue.createApp({
  data() {
    return {
      count: 0
    }
  },
});

vueApp.mount("#app");

