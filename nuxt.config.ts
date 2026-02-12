export default defineNuxtConfig({
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/i18n",
    "@nuxt/fonts",
  ],

  css: ["@/assets/css/tailwind.css"],

  fonts: {
    provider: "google",
    defaults: {
      weights: [600],
      styles: ["normal"],
    },
    families: [
      {
        name: "IBM Plex Sans Thai",
      },
    ],
  },

  i18n: {
    strategy: "prefix_and_default",
    locales: [
      {
        name: "English",
        code: "en",
        language: "en-US",
        file: "en-US/index.ts",
      },
      {
        name: "Thailand",
        code: "th",
        language: "th-TH",
        file: "th-TH/index.ts",
      },
    ],

    defaultLocale: "th",
  },

  shadcn: {
    prefix: "",
    componentDir: "@/components/ui",
  },

  app: {
    head: {
      title: "Sable Panel",
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1, maximum-scale=1",
      htmlAttrs: {
        lang: "th-TH",
      },
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
});
