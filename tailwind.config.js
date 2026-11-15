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
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
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
        marquee: "marquee 40s linear infinite",
      },
      fontFamily: {
        // The site font is Didot (see the note in src/index.css). These three
        // names are old; they all mean "the site font".
        manrope: ['"linotype-didot"', 'Didot', '"Bodoni MT"', 'Georgia', 'serif'],
        cormorant: ['"linotype-didot"', 'Didot', '"Bodoni MT"', 'Georgia', 'serif'],
        instrument: ['"linotype-didot"', 'Didot', '"Bodoni MT"', 'Georgia', 'serif'],
        plexmono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
