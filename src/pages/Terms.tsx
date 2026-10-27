// Terms of use. Layout matches Privacy.tsx; copy is used as written.
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

export function Terms() {
  return (
    <div className="relative z-10 w-full max-w-4xl px-4 sm:px-8 pt-28 pb-16 font-manrope text-black text-center text-sm sm:text-lg leading-snug">
      <h1 className="text-xl sm:text-2xl font-light mb-2">Terms of Use</h1>
      <p className="mb-5 text-black/50">Last updated: 22 October 2026</p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">1. Seller</h2>
      <p className="mb-5">
        Sturm und Drang AB, org. no. 5592733009, Norrtullsgatan 12N, 113 27
        Stockholm, <Mail />.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">2. Scope</h2>
      <p className="mb-5">
        These terms apply to all purchases on stuckholm.se. By ordering, you accept
        them.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">3. Products and prices</h2>
      <p className="mb-5">
        We sell new clothing made to order by our production partner, and
        second-hand items from our own collection. Second-hand items are unique, so
        each can only be bought once. All prices are in SEK and include VAT.
        Shipping is shown at checkout. The price at the time of your order applies.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">4. Orders and contract</h2>
      <p className="mb-5">
        A contract is formed when you receive our order confirmation by email. If an
        item is no longer available, we will contact you and refund you in full.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">5. Payment</h2>
      <p className="mb-5">Payment is handled by Shopify at checkout.</p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">6. Delivery and risk</h2>
      <p className="mb-5">
        Made-to-order items are produced and shipped as described on our Shipping
        page. Second-hand items are sent within 2 business days of your order. Risk
        passes to you on delivery.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">7. Right of withdrawal</h2>
      <p className="mb-5">
        You can cancel within 14 days of receiving your order, without giving a
        reason. Details are in our Return &amp; Refund Policy.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">8. Faulty goods</h2>
      <p className="mb-5">
        If a product is faulty or does not match its description, you have rights
        under Swedish consumer law (konsumentköplagen). Contact us at <Mail /> within
        this timeframe. We cover return shipping and repair, replacement or refund,
        as the law requires.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">9. Intellectual property</h2>
      <p className="mb-5">
        Our designs, texts, photos and the Stuckholm name and logo belong to us or
        are licensed to us. Do not copy them without our written permission, except
        for private use.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">10. Website use</h2>
      <p className="mb-5">
        Do not misuse the Website or interfere with its operation.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">11. Liability</h2>
      <p className="mb-5">
        To the extent the law allows, we are not liable for indirect losses or delays
        outside our control. This does not limit your rights as a consumer.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">12. Third-party services</h2>
      <p className="mb-5">
        We use Shopify (checkout), Supabase (sign-in), Vercel (hosting) and Tidymerch
        (production and shipping). Their terms may also apply to parts of your
        purchase.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">13. Changes</h2>
      <p className="mb-5">
        We may update these terms. The version in force when you order applies.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">14. Law and disputes</h2>
      <p className="mb-5">
        Swedish law applies. Consumers also keep the protection of mandatory laws in
        their country of residence. Consumer disputes can be brought to the Swedish
        Consumer Dispute Board (ARN),{" "}
        <a
          href="https://www.arn.se"
          className="underline hover:opacity-70 transition-opacity"
        >
          www.arn.se
        </a>
        , or to a Swedish court.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">15. Contact</h2>
      <p>
        <Mail />
      </p>
    </div>
  );
}
