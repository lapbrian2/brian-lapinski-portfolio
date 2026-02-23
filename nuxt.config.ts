export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  modules: [
    '@tresjs/nuxt',
    '@nuxtjs/tailwindcss',
    'nuxt-swiper',
    '@nuxt/image',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Brian Lapinski | AI Art Portfolio',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Brian Lapinski — exploring what it means to be human through images. AI artist, educator, and Creative Partner.' },
        { property: 'og:title', content: 'Brian Lapinski | AI Art Portfolio' },
        { property: 'og:description', content: 'Exploring what it means to be human through images.' },
        { property: 'og:type', content: 'website' },
        { name: 'theme-color', content: '#181520' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap' },
      ],
    },
  },

  css: [
    '~/assets/css/typography.css',
    '~/assets/css/main.css',
    '~/assets/css/transitions.css',
  ],

  build: {
    transpile: ['gsap', 'three'],
  },

  vite: {
    optimizeDeps: {
      include: ['three', 'gsap'],
    },
  },

  swiper: {},

  image: {
    quality: 80,
    format: ['webp'],
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  routeRules: {
    '/images/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
  },

  devtools: { enabled: true },
})
