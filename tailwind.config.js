/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        skarp: ['"Skarp Regular"', "sans-serif"],
        "skarp-italic": ['"Skarp Italic"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
