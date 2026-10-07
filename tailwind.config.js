/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#18332c',
        leaf: '#174536',
        herb: '#6c8f62',
        oat: '#f6f4ed',
        clay: '#b96845',
        sun: '#e7bc5b',
        line: '#dfe3d8',
      },
      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['Manrope', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(24, 51, 44, 0.08)',
      },
    },
  },
  plugins: [],
}