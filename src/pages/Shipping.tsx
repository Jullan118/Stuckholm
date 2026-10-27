// Shipping policy. Layout matches Refund.tsx; copy is used as written.
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

export function Shipping() {
  return (
    <div className="relative z-10 w-full max-w-2xl px-4 sm:px-8 pt-28 pb-16 font-manrope text-black text-center text-[11px] sm:text-xs leading-snug">
      <h1 className="text-base sm:text-lg font-light mb-5 text-center">
        Shipping
      </h1>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Where we ship</h2>
      <p className="mb-5">
        We ship to the United States, the United Kingdom, Europe (EU and non-EU),
        Canada and selected international countries. If your country is not listed
        at checkout, contact us at <Mail /> and we will confirm whether we can
        deliver to you.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Shipping costs</h2>
      <p className="mb-5">Shipping costs are shown at checkout before you pay.</p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Made-to-order items</h2>
      <p className="mb-2">
        Stuckholm pieces are made to order by our production partner. Estimated
        times:
      </p>
      <ul className="list-none space-y-1 mb-5">
        <li>– Production: 2–7 business days after your order is placed</li>
        <li>– USA: 3–7 business days shipping</li>
        <li>– UK and EU: 5–10 business days shipping</li>
        <li>– International: 10–20 business days shipping</li>
      </ul>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Second-hand items</h2>
      <p className="mb-5">
        Second-hand items are sent from our stock within 2 business days after your
        order is placed.
      </p>

      <p className="mb-5">Delivery times are estimates, not guarantees.</p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Tracking</h2>
      <p className="mb-5">
        When your order ships, you will receive an email with tracking details. If
        tracking has not updated within 5 days, contact us at <Mail />.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">
        Customs, duties and import taxes
      </h2>
      <p className="mb-5">
        For orders from outside the EU, your country may charge customs duties or
        import taxes when the parcel arrives. These are paid by the buyer, not by
        Stuckholm.
      </p>

      <h2 className="text-xs sm:text-sm font-normal mb-2">Delays</h2>
      <p>
        We are not responsible for delays caused by events outside our control, such
        as customs processing, postal disruptions or weather. Please check your
        shipping address before you order. If a parcel cannot be delivered because
        the address was incorrect, the cost of redelivery may be charged to you.
      </p>
    </div>
  );
}
