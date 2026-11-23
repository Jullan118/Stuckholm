import * as React from "react";

// Jump back to the top of the page whenever the page shown changes, so a new
// page doesn't open where the previous one was scrolled to. Takes the page
// shown (not the address), so opening or closing a product panel over a list
// keeps the list where it was.
export function ScrollToTop({ pathname }: { pathname: string }) {
  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
