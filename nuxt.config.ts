export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  modules: [
    '@nuxtjs/tailwindcss',
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
        // Open Graph
        { property: 'og:title', content: 'Brian Lapinski | AI Art Portfolio' },
        { property: 'og:description', content: 'Exploring what it means to be human through images. AI artist, educator, and Creative Partner.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/images/artworks/the-watcher.webp' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:locale', content: 'en_US' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Brian Lapinski | AI Art Portfolio' },
        { name: 'twitter:description', content: 'Exploring what it means to be human through images.' },
        { name: 'twitter:image', content: '/images/artworks/the-watcher.webp' },
        { name: 'twitter:creator', content: '@Lapbrian2' },
        // Other
        { name: 'theme-color', content: '#181520' },
        { name: 'author', content: 'Brian Lapinski' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preload', as: 'style', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap' },
      ],
    },
  },

  css: [
    'splitting/dist/splitting.css',
    '~/assets/css/typography.css',
    '~/assets/css/main.css',
    '~/assets/css/transitions.css',
  ],

  build: {
    transpile: ['gsap'],
  },

  vite: {
    optimizeDeps: {
      include: ['gsap'],
    },
  },

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

  runtimeConfig: {
    tursoUrl: process.env.TURSO_DATABASE_URL || '',
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN || '',
    resendApiKey: process.env.RESEND_API_KEY || '',
    resendFromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@lapinski.art',
    contactNotificationEmail: process.env.CONTACT_NOTIFICATION_EMAIL || 'brian@lapinski.art',
    adminPassword: process.env.ADMIN_PASSWORD || '',
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET || '',
    blobToken: process.env.BLOB_READ_WRITE_TOKEN || '',
  },

  routeRules: {
    '/images/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
    '/admin/**': { ssr: false },
  },

  devtools: { enabled: true },
})
