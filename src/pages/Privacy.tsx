// Privacy policy. Layout matches Terms.tsx; copy is used as written.
const EMAIL = "stuck@stuckholm.se";

function Mail() {
  return (
    <a
      href={`mailto:${EMAIL}`}
      className="underline hover:opacity-70 transition-opacity"
    >
      {EMAIL}
    </a>
  );
}

export function Privacy() {
  return (
    <div className="relative z-10 w-full max-w-4xl px-4 sm:px-8 pt-28 pb-16 font-manrope text-black text-center text-sm sm:text-lg leading-snug">
      <h1 className="text-xl sm:text-2xl font-light mb-2">Stuckholm Privacy Policy</h1>
      <p className="mb-5 text-black/50">Last updated: 10 October 2026</p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">1. Who we are</h2>
      <p className="mb-5">
        Sturm und Drang AB (org. no. 5592733009), Norrtullsgatan 12N, 113 27
        Stockholm, <Mail />. We are responsible for your personal data.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">2. What we collect</h2>
      <ul className="list-none space-y-1 mb-5">
        <li>– Orders: name, delivery address, email, phone number (if asked at checkout) and order details.</li>
        <li>– Messages: name, email and content when you contact us.</li>
        <li>– Second-hand listings: seller name and product photos.</li>
        <li>– Team login: email and encrypted password.</li>
        <li>– Statistics: anonymous visit data via Vercel. Does not identify you.</li>
      </ul>

      <h2 className="text-xs sm:text-sm font-normal mb-2">3. Why we use your data</h2>
      <ul className="list-none space-y-1 mb-5">
        <li>– Orders and delivery: to fulfil your contract (GDPR Art. 6(1)(b)).</li>
        <li>– Accounting: to meet legal obligations (Art. 6(1)(c)).</li>
        <li>– Replies, team login and statistics: our legitimate interest (Art. 6(1)(f)).</li>
      </ul>

      <h2 className="text-xs sm:text-sm font-normal mb-2">4. Who gets your data</h2>
      <ul className="list-none space-y-1 mb-5">
        <li>– Shopify: checkout and payments. Card details are handled by Shopify and its payment providers, not by us.</li>
        <li>– Tidymerch: name, delivery address and order details, to produce and ship your order.</li>
        <li>– Supabase: team login and listings. Hosted in the EU (Frankfurt).</li>
        <li>– Vercel: hosting and anonymous statistics.</li>
      </ul>
      <p className="mb-5">
        We do not sell your data. Some providers process data outside the EU/EEA,
        such as the United States. Transfers are covered by EU Standard Contractual
        Clauses or an adequacy decision.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">5. How long we keep your data</h2>
      <ul className="list-none space-y-1 mb-5">
        <li>– Orders and accounting: 7 years (bokföringslagen).</li>
        <li>– Messages: 12 months after our last reply.</li>
        <li>– Team login: while active.</li>
        <li>– Second-hand listings: 2 weeks after the item is sold or removed.</li>
      </ul>

      <h2 className="text-xs sm:text-sm font-normal mb-2">6. Your rights</h2>
      <p className="mb-5">
        You have the right to access the personal data we hold about you, have
        incorrect data corrected, have your data deleted in certain cases, restrict
        or object to our processing in certain cases, and receive your data in a
        portable format in certain cases. To use these rights, email <Mail />. We
        will reply within one month.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">7. Complaints</h2>
      <p className="mb-5">
        If you want to complain about how we handle your data, email <Mail />. We
        reply within one month. You can also complain to IMY (
        <a
          href="https://www.imy.se"
          className="underline hover:opacity-70 transition-opacity"
        >
          www.imy.se
        </a>
        ).
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">8. Cookies</h2>
      <p className="mb-5">
        See our <a href="/cookies" className="underline hover:opacity-70 transition-opacity">Cookies page</a>.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">9. Children</h2>
      <p className="mb-5">
        The site is not aimed for anyone under 16. Please ask a parent or guardian
        before ordering.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">10. Changes</h2>
      <p className="mb-5">
        We may update this policy. The date at the top shows when it was last
        changed.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">11. Contact</h2>
      <p>
        <Mail />
      </p>
    </div>
  );
}
