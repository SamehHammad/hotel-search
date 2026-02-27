//---** Main Next.js localized app layout with Next-Intl Provider **---//

import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "HotelSearch | Find Your Perfect Hotel",
    description: "Search and discover thousands of beautiful hotels world-wide",
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    // Validate that the incoming `locale` parameter is valid
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Set the locale for statically generated pages
    setRequestLocale(locale);

    // Load the corresponding messages for the locale
    let messages;
    try {
        messages = await getMessages();
    } catch (err) {
        notFound();
    }

    const dir = locale === "ar" ? "rtl" : "ltr";

    return (
        <html lang={locale} dir={dir} suppressHydrationWarning>
            <body className="antialiased flex flex-col min-h-screen">
                <NextIntlClientProvider locale={locale} messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
