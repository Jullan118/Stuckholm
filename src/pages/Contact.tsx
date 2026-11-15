const EMAIL = "stuck@stuckholm.se";

// Contact page: who runs the shop and how to reach us. The company details
// are the same as in the Terms (src/pages/Terms.tsx); keep the two in step.
export function Contact() {
  return (
    <div className="relative z-10 w-full max-w-2xl px-4 sm:px-8 pt-6 pb-16 text-black text-center text-base sm:text-xl leading-relaxed">
      <h1 className="uppercase mb-6">Contact</h1>
      <p>
        <a href={`mailto:${EMAIL}`} className="underline underline-offset-4 decoration-1 hover:opacity-60 transition-opacity">
          {EMAIL}
        </a>
      </p>
      <p className="mt-6">
        Sturm und Drang AB
        <br />
        Org. no. 5592733009
        <br />
        Norrtullsgatan 12N, 113 27 Stockholm
      </p>
    </div>
  );
}
