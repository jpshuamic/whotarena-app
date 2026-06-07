/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy: '#0D1B2A',
        blue: '#1E90FF',
        green: '#00C853',
        'warm-white': '#F5F5F5',
        gold: '#FFD700',
        red: '#FF4444',
        surface: '#1A2B3C',
      },
    },
  },
  plugins: [],
};
