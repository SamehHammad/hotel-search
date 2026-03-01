import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import HomeClient from "@/components/home/HomeClient";
import { setRequestLocale } from "next-intl/server";

//---** Generate dynamic SEO metadata for the home page **---//
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "common" });
    const ts = await getTranslations({ locale, namespace: "search" });

    return buildMetadata({
        title: `${t("appName")} | ${ts("title")}`,
        description: ts("subtitle"),
        path: "",
        locale,
    });
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    // Set locale for static generation
    setRequestLocale(locale);

    return <HomeClient />;
}
