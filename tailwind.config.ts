import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#181520',
          800: '#231b35',
          700: '#2a2240',
          600: '#352d4a',
        },
        lavender: {
          50: '#f0f2f8',
          100: '#dae2f2',
          200: '#c9d2e7',
          300: '#a5b0c8',
          400: '#7e7f8f',
          500: '#6d6d76',
        },
        accent: {
          red: '#ed544d',
          'red-hover': '#ff6b64',
          blue: '#007aff',
        },
      },
      fontFamily: {
        display: ['"PP Neue Montreal"', 'sans-serif'],
        body: ['"PP Neue Montreal"', 'sans-serif'],
      },
      fontSize: {
        'hero': 'clamp(3rem, 8vw, 8rem)',
        'section': 'clamp(2rem, 5vw, 4rem)',
        'heading': 'clamp(1.5rem, 3vw, 2.5rem)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
