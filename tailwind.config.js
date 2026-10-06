/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'system-ui', 'sans-serif'],
      },
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
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        'card': '0 1px 2px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.05)',
        'elevated': '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'dialog': '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
      },
      letterSpacing: {
        'display': '-0.025em',
        'tight-sm': '-0.01em',
      },
    },
  },
  plugins: [],
}
