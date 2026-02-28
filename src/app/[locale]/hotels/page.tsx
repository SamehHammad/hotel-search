//---** Hotels search result page route combining list and map views **---//

import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import HotelsPageClient from "@/components/hotels/HotelsPageClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "search" });

    return buildMetadata({
        title: t("title"),
        description: t("subtitle"),
        path: "/hotels",
        locale,
    });
}

export default async function HotelsPage() {
    return <HotelsPageClient />;
}
