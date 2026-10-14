import * as React from "react";
import { useLocation } from "react-router-dom";

// Jump back to the top of the page whenever the route changes, so a new page
// doesn't open where the previous one was scrolled to.
export function ScrollToTop() {
  const { pathname } = useLocation();

  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
