//---** Client-side shell for the hotels search results page **---//

"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/shared/Navbar";
import { SearchForm } from "@/components/search/SearchForm";
import { HotelList } from "@/components/hotels/HotelList";
import { HotelFilters } from "@/components/hotels/HotelFilters";
import dynamic from "next/dynamic";
const HotelMap = dynamic(() => import("@/components/maps/HotelMap").then(m => m.HotelMap), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-surface-muted animate-pulse" />
});
import { buildHotelListJsonLd } from "@/lib/seo";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, X } from "lucide-react";
import { useHotels } from "@/hooks/useHotels";
import useHotelsStore from "@/store/hotels.store";
import type { Hotel } from "@/types/hotel.types";
import type { Pagination } from "@/types/api.types";
import type { SearchFilters } from "@/types/search.types";

interface HotelsPageClientProps {
    initialData?: {
        hotels: Hotel[];
        pagination: Pagination;
        filters: SearchFilters;
    };
}

export default function HotelsPageClient({ initialData }: HotelsPageClientProps) {
    const t = useTranslations("hotels");
    const [isMapOpen, setIsMapOpen] = useState(false);
    const initialized = useRef(false);
    if (!initialized.current && initialData) {
        const state = useHotelsStore.getState();
        // Only hydrate if the store is empty (fresh server landing)
        if (state.hotels.length === 0) {
            state.hydrateFromServer(initialData);
        }
        initialized.current = true;
    }

    const { pagination, filters } = useHotels();

    return (
        <div className="flex flex-col h-screen bg-surface-muted overflow-hidden relative">
            {/*---** Top site navigation bar **---*/}
            <Navbar />

            {/*---** Top Header section containing the persistent search form **---*/}
            <div className="py-4  shrink-0 z-40">
                <div className="container mx-auto max-w-[1400px] px-4 md:px-6">
                    <SearchForm variant="header" className="shadow-none bg-p -mb-2" />
                </div>
            </div>

            {/*---** Main multi-column content area **---*/}
            <main className="flex-1 overflow-hidden">
                <div className="container mx-auto max-w-[1400px] h-full px-4 md:px-6">
                    {/*---** SEO: Main heading for the search results page **---*/}
                    <h1 className="sr-only">
                        {filters.q ? t("resultsFor", { query: filters.q }) : t("hotelsInRegion")}
                    </h1>
                    {/*---** SEO: Property list JSON-LD for structured data **---*/}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(buildHotelListJsonLd(filters.q || "properties", pagination.records_to || 0)),
                        }}
                    />

                    {/*---** Results layout wrapper **---*/}
                    <div className="flex flex-col lg:flex-row gap-8 h-full">
                        {/*---** Left Sidebar: Fixed filters section for desktop views **---*/}
                        <aside className="hidden lg:block w-[300px] shrink-0 h-full overflow-y-auto pt-6 pb-20 pr-2 scrollbar-hide hover:scrollbar-default transition-all">
                            <HotelFilters onViewMap={() => setIsMapOpen(true)} />
                        </aside>

                        {/*---** Main Results Area: Scrollable hotel listings **---*/}
                        <div className="flex-1 min-w-0 h-full overflow-y-auto pt-6 pb-20 pr-1 scrollbar-hide hover:scrollbar-default transition-all">
                            <HotelList />
                        </div>
                    </div>
                </div>
            </main>

            {/*---** Mobile floating map explorer button **---*/}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <Button
                    onClick={() => setIsMapOpen(true)}
                    className="bg-brand-dark hover:bg-brand-dark-hover text-white rounded-full px-6 py-6 shadow-2xl flex items-center gap-2 border-none font-bold text-sm tracking-tight transition-transform active:scale-95"
                >
                    <MapIcon className="w-5 h-5 text-primary/60" />
                    {t("viewMap")}
                </Button>
            </div>

            {/*---** Interactive Map Modal: Displays properties on map view **---*/}
            <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                <DialogContent showCloseButton={false} className="!max-w-[95vw] !w-[1400px] !h-[85vh] flex flex-col !gap-0 !p-0 overflow-hidden border-none rounded-4xl shadow-2xl bg-surface/50 backdrop-blur-xl">
                    <DialogDescription className="sr-only">
                        {t("exploreOnMapDescription")}
                    </DialogDescription>
                    {/*---** Modal Header bar with close control **---*/}
                    <DialogHeader className="absolute top-4 left-4 right-4 z-50 pointer-events-none">
                        <div className="flex justify-between items-center bg-surface/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-border/50 pointer-events-auto w-full max-w-sm mx-auto">
                            <DialogTitle className="text-lg font-black text-brand-dark tracking-tight">{t("exploreOnMap")}</DialogTitle>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMapOpen(false)}
                                aria-label={t("closeMap")}
                                className="rounded-full hover:bg-surface-muted"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </DialogHeader>

                    {/*---** Embedded Google Map component **---*/}
                    <div className="w-full h-full pt-0">
                        <HotelMap />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
