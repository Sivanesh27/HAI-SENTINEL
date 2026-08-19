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
        hospital: {
          slate: '#0f172a',
          navy: '#1e293b',
          card: '#1e293b',
          border: '#334155',
          muted: '#64748b',
          text: '#f8fafc',
          accent: '#38bdf8',
          critical: '#ef4444',
          high: '#f97316',
          moderate: '#eab308',
          low: '#06b6d4',
          safe: '#10b981'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
