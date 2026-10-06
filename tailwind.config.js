/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        calm: {
          bg: '#f8f8f6',
          surface: '#ffffff',
          border: '#ececec',
          muted: '#999999',
          accent: '#6b8db5',
          'accent-hover': '#5a7da5',
          'accent-light': '#eef3fa',
        },
        mode: {
          time: '#6b8db5',
          finance: '#7aab8e',
          eating: '#c4a36b',
          diary: '#9b8db5',
          sport: '#6ba5a0',
        },
      },
    },
  },
  plugins: [],
}
