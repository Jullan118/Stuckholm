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
      keyframes: {
        letterJump: {
          "0%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-4px)" },
          "60%": { transform: "translateY(1px)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-28px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        blurFadeIn: {
          from: { opacity: "0", filter: "blur(10px)", transform: "translateY(-6px)" },
          to: { opacity: "1", filter: "blur(0px)", transform: "translateY(0)" },
        },
      },
      animation: {
        "letter-jump": "letterJump 0.4s ease",
        "slide-in-left": "slideInLeft 0.45s ease-out both",
        "blur-fade-in": "blurFadeIn 0.6s ease-out both",
      },
      fontFamily: {
        manrope: ['"Helvetica Neue"', 'Helvetica', 'Arial', sans-serif],
        cormorant: ['"Helvetica Neue"', 'Helvetica', 'Arial', sans-serif],
      },
    },
  },
  plugins: [],
};
