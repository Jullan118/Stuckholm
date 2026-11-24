const EMAIL = "stuck@stuckholm.se";

// Contact page: who runs the shop and how to reach us. The company details
// are the same as in the Terms (src/pages/Terms.tsx); keep the two in step.
export function Contact() {
  return (
    <div className="relative z-10 w-full max-w-2xl px-4 sm:px-8 pt-6 pb-16 font-manrope text-black text-center text-[14px] leading-snug">
      <h1 className="text-base sm:text-lg font-light mb-5">Contact</h1>
      <p className="mb-5">
        <a href={`mailto:${EMAIL}`} className="underline hover:opacity-70 transition-opacity">
          {EMAIL}
        </a>
      </p>
      <p>
        Sturm und Drang AB
        <br />
        Org. no. 5592733009
        <br />
        Norrtullsgatan 12N, 113 27 Stockholm
      </p>
    </div>
  );
}
