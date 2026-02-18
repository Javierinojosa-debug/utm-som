/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        festival: {
          pink: '#E91E8C',
          'pink-dark': '#C4177A',
          'pink-light': '#F472B6',
          teal: '#00B4C5',
          'teal-dark': '#009AA8',
          'teal-light': '#22D3EE',
          gold: '#F5C518',
          'gold-dark': '#D4A912',
          sky: '#5BC0EB',
          'sky-light': '#87CEEB',
          dark: '#1A1A2E',
          'dark-light': '#2D2D44',
        },
      },
      backgroundImage: {
        'festival-gradient': 'linear-gradient(135deg, #000000 0%, #111111 40%, #0a0a0a 70%, #000000 100%)',
      },
    },
  },
  plugins: [],
};
