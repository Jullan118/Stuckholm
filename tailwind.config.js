/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        letterJump: {
          "0%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-4px)" },
          "60%": { transform: "translateY(1px)" },
        },
      },
      animation: {
        "letter-jump": "letterJump 0.4s ease",
      },
      fontFamily: {
        skarp: ['"Skarp Regular"', "sans-serif"],
        "skarp-italic": ['"Skarp Italic"', "sans-serif"],
        "skarp-thin": ['"Skarp Thin"', "sans-serif"],
        "skarp-thin-italic": ['"Skarp Thin Italic"', "sans-serif"],
        "skarp-medium": ['"Skarp Medium"', "sans-serif"],
        "skarp-medium-italic": ['"Skarp Medium Italic"', "sans-serif"],
        "skarp-bold": ['"Skarp Bold"', "sans-serif"],
        "skarp-bold-italic": ['"Skarp Bold Italic"', "sans-serif"],
        "skarp-superbold": ['"Skarp Superbold"', "sans-serif"],
        "skarp-superbold-italic": ['"Skarp Superbold Italic"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
