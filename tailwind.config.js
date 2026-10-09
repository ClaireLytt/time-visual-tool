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
        mono: ['"SF Mono"', '"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        pixel: ['"Press Start 2P"', 'cursive'],
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
          habit: '#e8a838',
          todo: '#5b8def',
          study: '#4a90d9',
          work: '#e67e22',
          podcast: '#c2417a',
        },
        clash: {
          red: '#e63946',
          lime: '#c5f536',
          violet: '#7b2ff7',
          orange: '#ff6d00',
        },
        // Pixel art game palette — shared NES/SNES-inspired colors
        px: {
          bg: '#1a1c2c',        // deep navy background
          'bg-light': '#e8e4d9', // parchment light bg
          surface: '#333c57',    // card surface dark
          'surface-light': '#f4f1ea', // card surface light
          border: '#5d6d88',     // muted steel border
          gold: '#f4b41a',       // XP / coin gold
          green: '#3e8948',      // health / money green
          red: '#e43b44',        // damage / expense red
          blue: '#0099db',       // mana / time blue
          purple: '#8b5cf6',     // magic / diary purple
          teal: '#2ce8f5',       // ice / sport cyan
          orange: '#f77622',     // fire / eating orange
          pink: '#be4a7f',       // potion pink
          white: '#f0f0e8',      // pixel white
          black: '#1a1c2c',      // pixel black
        },
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        'card': '0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
        'elevated': '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'dialog': '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        'raised': '0 2px 0 rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
        'pressed': 'inset 0 1px 3px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
        'inset': 'inset 0 1px 2px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.04)',
        'tab-glow': '0 0 8px var(--tw-shadow-color, rgba(0,0,0,0.1))',
        // Pixel art shadows — hard offset, no blur
        'pixel': '4px 4px 0 #1a1c2c',
        'pixel-sm': '2px 2px 0 #1a1c2c',
        'pixel-light': '4px 4px 0 #b8b0a0',
        'pixel-sm-light': '2px 2px 0 #b8b0a0',
      },
      letterSpacing: {
        'display': '-0.025em',
        'tight-sm': '-0.01em',
      },
    },
  },
  plugins: [],
}
