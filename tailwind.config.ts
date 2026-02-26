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
          900: '#000000',
          800: '#0a0a0f',
          700: '#111118',
          600: '#1a1a24',
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
        mono: ['"Courier New"', 'Courier', 'monospace'],
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
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
