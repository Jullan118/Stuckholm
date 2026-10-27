import * as React from "react";

// About text shown on the home page. Edit this text freely; it is
// placeholder copy for now.
const ABOUT_TEXT =
  "stuckholm is an independent brand. blablabka ";

export function Home() {
  // The globe hero is removed, so the page is plain white. Switch the header
  // and corners to black ink for this page.
  React.useEffect(() => {
    document.documentElement.classList.add("hero-light");
    return () => {
      document.documentElement.classList.remove("hero-light");
    };
  }, []);

  return (
    <section className="w-full px-4 sm:px-8 py-16 pt-32 font-manrope text-black">
      <p className="mx-auto max-w-3xl text-base sm:text-xl leading-relaxed">
        {ABOUT_TEXT}
      </p>
    </section>
  );
}
