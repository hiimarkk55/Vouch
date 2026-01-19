/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00FFFF',
        'terminal-bg': '#000000',
        'terminal-gray': '#1a1a1a',
        'terminal-green': '#00FF41',
        'terminal-red': '#FF0040',
      },
      fontFamily: {
        mono: ['SpaceMono-Regular'],
        'mono-bold': ['SpaceMono-Bold'],
      },
    },
  },
  plugins: [],
};
