module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'crapto-brown': '#7B3F00',
        'crapto-light-brown': '#DAA06D',
        'crapto-dark-brown': '#4A2C0A',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
};
