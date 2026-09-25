import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

// Next 16 calls this "proxy" (formerly middleware). next-intl's handler
// negotiates the locale from the URL prefix, cookie, or Accept-Language.
export default createMiddleware(routing);

export const config = {
  // Skip Next internals, API routes and any file with an extension (static assets).
  matcher: "/((?!api|_next|.*\\..*).*)",
};
