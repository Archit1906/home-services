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
        primary: {
          DEFAULT: '#2563EB', // Blue 600
          light: '#EFF6FF',   // Blue 50
          dark: '#1D4ED8',    // Blue 700
        },
        secondary: {
          DEFAULT: '#0EA5E9', // Sky 500
          light: '#F0F9FF',   // Sky 50
        },
        accent: {
          DEFAULT: '#10B981', // Emerald 500
          light: '#ECFDF5',   // Emerald 50
        },
        surface: {
          DEFAULT: '#F8FAFC', // Slate 50
          dark: '#0F172A',    // Slate 900 (for dark mode)
          card: '#FFFFFF',
          cardDark: '#1E293B',// Slate 800
        },
        text: {
          primary: '#0F172A',   // Slate 900
          secondary: '#64748B', // Slate 500
          darkPrimary: '#F1F5F9',
          darkSecondary: '#94A3B8',
        },
        border: {
          DEFAULT: '#E2E8F0',   // Slate 200
          dark: '#334155',      // Slate 700
        },
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '20px',
        input: '12px',
        btn: '12px',
        badge: '8px',
      },
      boxShadow: {
        default: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
        elevated: '0 8px 32px rgba(37,99,235,0.12)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
    },
  },
  plugins: [],
}
