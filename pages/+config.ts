import type { Config } from "vike/types";
import vikePhoton from "vike-photon/config";
import vikeVue from "vike-vue/config";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/head-tags
  title: "网上书店 - Online Bookstore",

  description: "专业的在线图书购物平台",
  passToClient: ["user", "pageProps"],
  extends: [vikeVue, vikePhoton],

  // https://vike.dev/vike-photon
  photon: {
    server: "../server/entry.ts",
  },

  prerender: false,
} as Config;
