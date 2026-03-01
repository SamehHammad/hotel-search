//---** Main Next.js localized app layout with Next-Intl Provider **---//

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Cairo } from "next/font/google";
import "../globals.css";

const cairo = Cairo({
    subsets: ["arabic", "latin"],
    weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
    display: "swap",
});

//---** Static metadata for the application **---//
export const metadata: Metadata = {
    title: "HotelSearch | Find Your Perfect Hotel",
    description: "Search and discover thousands of beautiful hotels world-wide",
};

//---** Generate static parameters for available locales **---//
export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

//---** Root layout component handling localization and basic structure **---//
export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    //---** Validate that the incoming locale parameter is valid **---//
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    //---** Set the locale for statically generated pages **---//
    setRequestLocale(locale);

    //---** Load the corresponding messages for the current locale **---//
    let messages;
    try {
        messages = await getMessages();
    } catch (err) {
        notFound();
    }

    //---** Determine text direction based on the current locale **---//
    const dir = locale === "ar" ? "rtl" : "ltr";

    return (
        <html lang={locale} dir={dir} suppressHydrationWarning>
            <body className={`${cairo.className} antialiased flex flex-col min-h-screen`}>
                {/*---** Provide translations to client components **---*/}
                <NextIntlClientProvider locale={locale} messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
