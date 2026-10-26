// Return & Refund Policy. Layout matches Shipping.tsx; copy is used as written.
export function Refund() {
  return (
    <div className="relative z-10 w-full max-w-2xl px-4 sm:px-8 pt-28 pb-16 font-manrope text-black text-center text-[11px] sm:text-xs leading-snug">
      <h1 className="text-xl sm:text-2xl font-light mb-2 text-center">
        Return &amp; Refund Policy
      </h1>
      <p className="mb-5 text-black/50">Effective Date: October 14, 2026</p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Returns &amp; Exchanges</h2>
      <p className="mb-2">
        All sales are final. Because our products are custom printed on demand,
        we do not accept returns or exchanges for:
      </p>
      <ul className="list-none space-y-1 mb-2">
        <li>– Change of mind</li>
        <li>– Incorrect size or color</li>
        <li>– Product preference after delivery</li>
      </ul>
      <p className="mb-5">
        We strongly encourage reviewing product details and size guides before
        ordering.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">
        Second-Hand (Preloved) Items
      </h2>
      <p className="mb-2">
        All second-hand items are final sale. The condition of each item is shown
        as good as possible with photos and text on our website. Not every visible
        defect is necessarily listed in the description, but we show each item as
        completely as possible.
      </p>
      <p className="mb-5">
        Please look carefully at the photos before ordering.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">
        Acceptable Reasons for Refund or Replacement
      </h2>
      <p className="mb-2">We may offer a refund or replacement only if:</p>
      <ul className="list-none space-y-1 mb-5">
        <li>– There is a printing defect</li>
        <li>– The wrong item was shipped</li>
      </ul>

      <h2 className="text-xs sm:text-sm font-normal mb-2">
        How to Request a Resolution
      </h2>
      <p className="mb-2">
        To request a refund or replacement, contact us within 7 days of delivery
        at{" "}
        <a
          href="mailto:stuck@stuckholm.se"
          className="underline hover:opacity-70 transition-opacity"
        >
          stuck@stuckholm.se
        </a>{" "}
        with:
      </p>
      <ul className="list-none space-y-1 mb-5">
        <li>– Order number</li>
        <li>– Description of the issue</li>
        <li>– Clear photos of the defect or wrong item</li>
      </ul>

      <h2 className="text-xs sm:text-sm font-normal mb-2">
        Order Cancellation Policy
      </h2>
      <p className="mb-5">
        Orders can be canceled within 12 hours of purchase. Cancellations requested
        after this window are accepted only if the item has not yet entered
        production, and no fee applies. Once an item is in production, cancellations
        are no longer permitted.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Refund Process</h2>
      <p className="mb-5">
        Approved refunds will be issued to your original payment method. It may take
        5–10 business days for the refund to reflect on your account.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Still Need Help?</h2>
      <p>
        Contact our support team at{" "}
        <a
          href="mailto:stuck@stuckholm.se"
          className="underline hover:opacity-70 transition-opacity"
        >
          stuck@stuckholm.se
        </a>
.
      </p>
    </div>
  );
}
