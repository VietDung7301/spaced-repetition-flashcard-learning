// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  routeRules: {
    // prerender index route by default
    '/': { prerender: true },
  },

  modules: ['@nuxt/ui'],

  nitro: {
    experimental: {
      database: true
    },
    database: {
      default: {
        connector: 'postgresql',
        url: 'postgresql://username:password@hostname:port/database_name'
      }
    }
  },

  compatibilityDate: '2024-12-11'
});