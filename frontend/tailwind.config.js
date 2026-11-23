/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#FDF8F6',
          100: '#F7EDE8',
          200: '#EBD5CC',
          500: '#C05621',
          600: '#9C4221',
          700: '#7B2D0E',
          800: '#5C1D07',
        },
        claycream: '#FDFBF7',
        claysand: '#F7F2EC',
        clayborder: '#E8E0D5',
        warmamber: '#D97706',
        deepindigo: '#1E293B',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cinzel', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
