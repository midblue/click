// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  css: ['~/assets/main.scss'],

  app: {
    baseURL: '/p/click',
  },

  modules: ['@nuxt/icon'],
})
