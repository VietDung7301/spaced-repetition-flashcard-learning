// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  routeRules: {
    // prerender index route by default
    '/': { prerender: true },
  },
  modules: ['@nuxt/ui'],
  components: [{path: '~/components'}],
  runtimeConfig: {
    DB_URL: process.env.DB_URL
  }
});