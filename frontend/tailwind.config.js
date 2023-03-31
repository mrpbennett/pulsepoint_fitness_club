/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      montserrat: ['Montserrat', 'cursive'],
    },
    extend: {
      colors: {
        strava: '#FC4C02',
      },
    },
  },
  plugins: [],
}
