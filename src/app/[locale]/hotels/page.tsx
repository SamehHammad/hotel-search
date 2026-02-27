//---** Hotels search result page route combining list and map views **---//

import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/shared/Navbar";
import { SearchForm } from "@/components/search/SearchForm";
import { HotelList } from "@/components/hotels/HotelList";
import { HotelMap } from "@/components/maps/HotelMap";
import { buildMetadata, buildHotelListJsonLd } from "@/lib/seo";

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

export default function HotelsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 relative">
            <Navbar />

            {/* Sticky Top Header showing Search Form on results page */}
            <div className="sticky top-16 z-40 bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] py-4 border-b border-slate-200">
                <div className="container mx-auto max-w-[1400px] px-4 md:px-6">
                    <SearchForm variant="header" className="shadow-none border border-slate-200 bg-slate-50/50 -mb-2" />
                </div>
            </div>

            <main className="flex-1 w-full mx-auto container max-w-[1400px] p-4 md:p-6 pb-20 mt-4">
                {/*
          JSON-LD structured data for the hotel search results snippet.
          (Ideally, totalResults should be dynamic based on server-side initial fetch if SSR was used here)
        */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(buildHotelListJsonLd("New York", 14542)),
                    }}
                />

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] xl:grid-cols-[1fr_550px] gap-6 xl:gap-8 h-[calc(100vh-16rem)]">
                    {/* List View (Scrollable left panel) */}
                    <div className="order-2 lg:order-1 h-full overflow-y-auto pr-2 pb-10">
                        <HotelList />
                    </div>

                    {/* Map View (Sticky right panel on Desktop) */}
                    <div className="order-1 lg:order-2 h-[45vh] lg:h-full min-h-[400px] lg:sticky lg:top-24 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-200 bg-white">
                        <HotelMap />
                    </div>
                </div>
            </main>
        </div>
    );
}
