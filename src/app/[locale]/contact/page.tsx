import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import ContactClient from "@/components/contact/ContactClient";

//---** Generate dynamic SEO metadata for the contact page **---//
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "contact" });

    return buildMetadata({
        title: t("title"),
        description: t("subtitle"),
        path: "/contact",
        locale,
    });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <ContactClient />;
}
