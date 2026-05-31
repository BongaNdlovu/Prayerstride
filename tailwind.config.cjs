/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: '#071B33',
        gold: '#D7A552',
        ivory: '#F7F0E4',
        stone: '#D8CBB8',
        ink: '#101014',
        sand: '#fbf7ef',
        warm: '#E7D5BE',
        dusk: '#263A54',
        olive: '#778066',
        clay: '#B46E59',
        candle: '#F4C46A',
      },
      boxShadow: {
        glow: '0 18px 60px rgba(215, 165, 82, 0.24)',
        cinematic: '0 22px 80px rgba(2, 7, 18, 0.42)',
      },
    },
  },
  plugins: [],
};
