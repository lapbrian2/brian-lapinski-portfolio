export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    'nuxt-auth-utils',
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
        { property: 'og:url', content: 'https://lapinski.art' },
        { property: 'og:image', content: 'https://lapinski.art/images/artworks/the-threshold.webp' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:locale', content: 'en_US' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Brian Lapinski | AI Art Portfolio' },
        { name: 'twitter:description', content: 'Exploring what it means to be human through images.' },
        { name: 'twitter:image', content: 'https://lapinski.art/images/artworks/the-threshold.webp' },
        { name: 'twitter:creator', content: '@Lapbrian2' },
        // Other
        { name: 'theme-color', content: '#000000' },
        { name: 'author', content: 'Brian Lapinski' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.cdnfonts.com', crossorigin: '' },
        { rel: 'preload', as: 'style', href: 'https://fonts.cdnfonts.com/css/pp-neue-montreal' },
        { rel: 'stylesheet', href: 'https://fonts.cdnfonts.com/css/pp-neue-montreal' },
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
    transpile: ['gsap', 'three'],
  },

  vite: {
    optimizeDeps: {
      include: ['gsap', 'three'],
    },
  },

  image: {
    quality: 100,
    format: ['avif', 'webp'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1141,
    },
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
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    public: {
      siteUrl: process.env.SITE_URL || 'https://lapinski.art',
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    },
  },

  routeRules: {
    '/images/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
    '/admin/**': { ssr: false },
    '/auth/**': { ssr: false },
    // ISR: cache public pages at the edge, revalidate in the background
    '/': { isr: 600 },                  // homepage — 10 min
    '/gallery': { isr: 600 },           // gallery listing — 10 min
    '/artwork/**': { isr: 3600 },       // artwork detail — 1 hour
    '/collections': { isr: 600 },       // collections index — 10 min
    '/collections/**': { isr: 3600 },   // individual collections — 1 hour
    '/shop': { isr: 300 },              // shop listing — 5 min (prices may change)
    '/shop/**': { isr: 300 },           // product detail — 5 min
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
  },

  // Prefetch on interaction (hover/focus) instead of viewport visibility
  // Prevents 30+ simultaneous prefetches when gallery grid is in view
  experimental: {
    defaults: {
      nuxtLink: {
        prefetchOn: { interaction: true, visibility: false },
      },
    },
  },

  devtools: { enabled: true },
})
