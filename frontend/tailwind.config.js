/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          400: '#1ed760',
          500: '#1db954',
          600: '#169c46',
        },
        dark: {
          100: '#2a2a2a',
          200: '#1a1a1a',
          300: '#121212',
          400: '#0a0a0a',
        },
      },
    },
  },
  plugins: [],
};