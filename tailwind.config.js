/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
        heading: ["'Space Grotesk'", "'Inter'", "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          base: '#0a0f1d',
          elevated: '#111827',
          card: 'rgba(15, 23, 42, 0.6)',
          overlay: 'rgba(15, 23, 42, 0.85)',
        },
        accent: {
          DEFAULT: '#2563eb',
          hover: '#3b82f6',
          glow: 'rgba(37, 99, 235, 0.35)',
          subtle: 'rgba(37, 99, 235, 0.12)',
        },
      },
      borderColor: {
        DEFAULT: 'rgba(30, 41, 59, 0.8)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(37, 99, 235, 0.35)',
        'glow-lg': '0 0 40px rgba(37, 99, 235, 0.25)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(37, 99, 235, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(37, 99, 235, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
