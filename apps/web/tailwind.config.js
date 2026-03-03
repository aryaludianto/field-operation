/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#f2fbf4',
          100: '#daf5df',
          200: '#adebc0',
          300: '#70d88f',
          400: '#37bd60',
          500: '#1fa449',
          600: '#15863a',
          700: '#136a31',
          800: '#11552b',
          900: '#0f4625',
        },
      },
    },
  },
  plugins: [],
};
