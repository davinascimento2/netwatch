/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#06090e',
          darker: '#030508',
          card: '#0c121d',
          cardHover: '#131c2e',
          border: 'rgba(56, 189, 248, 0.15)',
          borderBright: 'rgba(56, 189, 248, 0.4)',
          cyan: '#00f0ff',
          neonBlue: '#38bdf8',
          neonGreen: '#00ff9d',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          purple: '#a855f7',
          muted: '#64748b'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
        display: ['"Syne"', '"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'glow-cyan': 'glow-cyan 2s infinite alternate',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 5px rgba(0,240,255,0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 16px rgba(0,240,255,0.8))' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'glow-cyan': {
          'from': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.2)' },
          'to': { boxShadow: '0 0 15px rgba(0, 240, 255, 0.6)' }
        }
      }
    },
  },
  plugins: [],
}
