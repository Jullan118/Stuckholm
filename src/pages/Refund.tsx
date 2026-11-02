// Return & Refund Policy. Layout matches Shipping.tsx.
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
    <div className="relative z-10 w-full max-w-2xl px-4 sm:px-8 pt-28 pb-16 font-manrope text-black text-center text-[11px] sm:text-xs leading-snug">
      <h1 className="text-xl sm:text-2xl font-light mb-2 text-center">
        Return &amp; Refund Policy
      </h1>
      <p className="mb-5 text-black/50">Effective date: 27 October 2026</p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">How do I return an item?</h2>
      <ul className="list-none space-y-1 mb-5">
        <li>1. Email us at <Mail /> before you send anything back.</li>
        <li>2. Pack the item carefully, ideally in its original packaging.</li>
        <li>3. Include your order number in the package.</li>
        <li>
          4. Send the package with PostNord, DHL, FedEx or another courier to the
          returns address below. Keep the proof of postage.
        </li>
        <li>5. We refund the item once it arrives and confirm by email.</li>
      </ul>
      <p className="mb-5">
        Returns address:
        <br />
        Tidy Merch, Fridas väg 21, 611 50 Nyköping, Sweden
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Right of withdrawal</h2>
      <p className="mb-5">
        You can cancel your order without giving a reason within 14 days of
        receiving it. Send us an email with your order number, then return the
        item within 14 days of that email. Please send it back in its original
        condition. This applies to new and second-hand items.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Who pays for the return?</h2>
      <p className="mb-5">
        You pay the return shipping. The exception is when the return is caused
        by a fault or by a wrong item (see below).
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Refund timing</h2>
      <p className="mb-5">
        We refund the purchase price and the standard delivery cost within 14
        days of receiving the item, to your original payment method. Your bank
        may need a few more business days to show the refund.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Cancelling before production</h2>
      <p className="mb-5">
        You can cancel an order within 12 hours of purchase at no cost. After
        that, you can cancel only if the item has not entered production. Once an
        item is in production, it cannot be cancelled, but you can still return
        it under the right of withdrawal.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">
        Damaged, faulty or wrong items
      </h2>
      <p className="mb-5">
        If your item arrives damaged, faulty or is not the item you ordered, email{" "}
        <Mail /> with your order number and photos of the problem. We will send
        you a return label by email. We will repair, replace or refund the item.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">
        What if the item looks different from the photos?
      </h2>
      <p className="mb-5">
        Product images are sometimes mock-ups, so the finished item can look a
        little different. If you feel the item differs greatly from the photos in
        the shop, email us with a photo or two so we can look into it.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Exchanges</h2>
      <p className="mb-5">
        We do not process exchanges. Return the item you have, and once the return
        is accepted, place a new order for the item you want.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Questions?</h2>
      <p>
        Email <Mail />.
      </p>
    </div>
  );
}
