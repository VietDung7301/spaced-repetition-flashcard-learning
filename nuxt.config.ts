// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  routeRules: {
    // prerender index route by default
    '/': { prerender: true },
  },

  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxt/fonts', 'nuxt-tiptap-editor'],

  runtimeConfig: {
    DB_URL: process.env.DB_URL,
    public: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      VOICE_URL: process.env.VOICE_URL,
    }
  },

  fonts: {
    families: [
      { name: 'Noto Sans JP', provider: 'google' },
    ]
  },

  tiptap: {
    prefix: 'Tiptap', //prefix for Tiptap imports, composables not included
  },

  compatibilityDate: '2024-12-13'
});