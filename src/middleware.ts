//---** Next.js middleware: locale detection and routing via next-intl **---//

import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
    matcher: [
        // Match root
        "/",
        // Match locale-prefixed paths (en/ar) but skip internal Next.js and static files
        "/(en|ar)/:path*",
        "/((?!_next|api|favicon.ico|.*\\..*).*)",
    ],
};
