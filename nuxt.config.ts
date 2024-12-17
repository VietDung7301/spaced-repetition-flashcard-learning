// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  routeRules: {
    // prerender index route by default
    '/': { prerender: true },
  },

  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxt/fonts'],

  runtimeConfig: {
    DB_URL: process.env.DB_URL,
    public: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY
    }
  },

  fonts: {
    families: [
      { name: 'Noto Sans JP', provider: 'google' },
    ]
  },

  compatibilityDate: '2024-12-13'
});