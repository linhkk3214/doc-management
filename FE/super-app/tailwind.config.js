/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui';
module.exports = {
  content: [
    './apps/**/*.{html,ts}',
    './modules/**/*.{html,ts}'
  ],
  safelist: [
    'md:col-span-9',
    'md:col-span-3',
    'md:col-span-6',
  ],
  theme: {
    extend: {},
  },
  darkMode: ['selector', '[class~="my-app-dark"]'],
  plugins: [
    PrimeUI
  ],
}

