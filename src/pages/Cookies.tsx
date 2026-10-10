export function Cookies() {
  return (
    <div className="relative z-10 w-full max-w-3xl px-6 pt-28 pb-16 font-manrope text-black text-center text-xs sm:text-sm leading-snug">
      <h1 className="text-lg sm:text-xl font-light mb-4">Cookies</h1>

      <p className="mb-10">
        Cookies are small pieces of information that a website stores in your
        browser. Some of them are needed for the site to work, and some help us
        understand how the site is used. This page explains what we use and why.
      </p>

      <h2 className="text-sm sm:text-base font-light mb-4">Necessary</h2>
      <p className="mb-3">
        These are needed for the site to work. Without them, your shopping bag
        and sign-in will not function.
      </p>
      <ul className="list-none space-y-1 mb-10">
        <li>– Shopping bag: keeps the items you add to your bag on this device</li>
        <li>– Checkout (Shopify): Shopify sets cookies during checkout to process your order, keep your cart and prevent fraud</li>
        <li>– Sign-in session: keeps you signed in when you use the team login</li>
      </ul>

      <h2 className="text-sm sm:text-base font-light mb-4">Statistics</h2>
      <p className="mb-10">
        We use Vercel Web Analytics to see how many people visit the site and
        which pages they view. This data is aggregated and does not identify you
        personally.
      </p>

      <h2 className="text-sm sm:text-base font-light mb-4">Marketing</h2>
      <p className="mb-10">
        We do not use marketing or advertising cookies.
      </p>

      <h2 className="text-sm sm:text-base font-light mb-4">Managing cookies</h2>
      <p className="mb-10">
        You can delete cookies and stored data at any time through your browser
        settings. Please note that if you delete the shopping bag data, your bag
        will be emptied.
      </p>

      <h2 className="text-sm sm:text-base font-light mb-4">Questions</h2>
      <p>
        If you have any questions about cookies, contact us at{" "}
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
