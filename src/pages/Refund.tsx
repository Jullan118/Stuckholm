// Return & Refund Policy. Layout matches Shipping.tsx; copy is used as written.
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

export function Refund() {
  return (
    <div className="relative z-10 w-full max-w-2xl px-4 sm:px-8 pt-28 pb-16 font-manrope text-black text-center text-sm sm:text-lg leading-snug">
      <h1 className="text-xl sm:text-2xl font-light mb-2 text-center">
        Return &amp; Refund Policy
      </h1>
      <p className="mb-5 text-black/50">Effective date: 27 October 2026</p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Right of withdrawal</h2>
      <p className="mb-2">
        You can cancel your order without giving a reason within 14 days of
        receiving it. Send us an email at <Mail /> with your order number, and
        then return the item within 14 days of that email. Please send the item
        back in its original condition. You pay the return shipping. We refund the
        purchase price and the standard delivery cost within 14 days of receiving
        the item, to your original payment method. This applies to new and
        second-hand items.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">
        Cancelling before production
      </h2>
      <p className="mb-5">
        You can cancel an order within 12 hours of purchase at no cost. After that,
        you can cancel only if the item has not entered production. Once an item is
        in production, it cannot be cancelled, but you can still return it under the
        right of withdrawal.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">
        Faulty or wrong items
      </h2>
      <p className="mb-5">
        If an item is faulty, does not match its description, or is the wrong item,
        email <Mail /> with your order number and photos of the problem. We will
        cover return shipping and repair, replace or refund the item.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Questions?</h2>
      <p>
        Email <Mail />.
      </p>
    </div>
  );
}
