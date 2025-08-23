 /** @type {import('tailwindcss').Config} */
export default {
   content: ["./src/**/*.{js,ts,jsx,tsx}",],
   theme: {
      extend: {
      screens: {
        'xxs': '360px',
        'xs': '480px',
        'xxl': '1440px',
      },
    },
   },
   plugins: [],
 }