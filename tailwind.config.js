/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'black': '#000000',
        'off-white': '#FFFFFC',
        'beige': '#BEB7A4',
        'beige-light': '#DED7C6',
        'beige-dark': '#7A7568',
        'orange': '#FF7F11',
        'red': '#FF1B1C',
      },
    },
  },
  variants: {
    extend: {
      textColor: ['visited', 'hover', 'focus'],
    },
  },
  plugins: [],
}
