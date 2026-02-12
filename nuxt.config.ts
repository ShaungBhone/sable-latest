export default defineNuxtConfig({
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/i18n",
  ],

  i18n: {
    locales: [
      {
        name: "English",
        code: "en",
        language: "en-US",
        file: 'en-US/index.ts'
      },
      {
        name: "Thailand",
        code: "th",
        language: "th-TH",
        file: 'th-TH/index.ts'
      },
    ],

    defaultLocale: "th-TH",
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
