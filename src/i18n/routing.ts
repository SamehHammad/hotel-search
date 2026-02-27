//---** next-intl routing configuration: locale list and default **---//

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    locales: ["en", "ar"],
    defaultLocale: "en",
});
