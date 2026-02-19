const isTest = process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);

export default defineNuxtConfig({
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxtjs/i18n",
    "@nuxt/fonts",
    "nuxt-vuefire",
    ...(isTest ? ["@nuxt/test-utils/module"] : []),
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

  runtimeConfig: {
    auth: {
      sessionCookieName: "sable.session",
      sessionMaxAgeSeconds: 60 * 60 * 24 * 5,
      backendBaseUrl: "",
      backendProfilePath: "/login/user",
      backendProfileMethod: "POST",
      backendBrandConfigPath: "/brand-config/:brandId",
      backendBrandConfigMethod: "GET",
    },
  },

  vuefire: {
    config: {
      apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    },
    auth: false,
  },

  nitro: {
    sourceMap: false,
    externals: {
      trace: false,
    },
  },

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) {
              return;
            }

            if (id.includes("firebase")) {
              return "vendor-firebase";
            }

            if (id.includes("lucide-vue-next")) {
              return "vendor-icons";
            }

            if (
              id.includes("vee-validate") ||
              id.includes("@vee-validate") ||
              id.includes("/zod/")
            ) {
              return "vendor-validation";
            }

            if (id.includes("vuefire")) {
              return "vendor-vuefire";
            }
          },
        },
      },
    },
  },

  compatibilityDate: "2025-07-15",
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
});
