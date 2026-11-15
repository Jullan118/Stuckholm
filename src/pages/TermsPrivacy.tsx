import { Terms } from "@/pages/Terms";
import { Privacy } from "@/pages/Privacy";
import { Cookies } from "@/pages/Cookies";

// Terms, privacy policy and cookie information on one page, one after the
// other. Privacy and cookies each keep their own heading so they are easy to
// find.
export function TermsPrivacy() {
  return (
    <>
      <Terms />
      <Privacy />
      <Cookies />
    </>
  );
}
