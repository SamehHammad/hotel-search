"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/shared/Navbar";
import { SearchForm } from "@/components/search/SearchForm";
import { HotelList } from "@/components/hotels/HotelList";
import { HotelFilters } from "@/components/hotels/HotelFilters";
import { HotelMap } from "@/components/maps/HotelMap";
import { buildHotelListJsonLd } from "@/lib/seo";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, X } from "lucide-react";

export default function HotelsPageClient() {
    const t = useTranslations("search");
    const [isMapOpen, setIsMapOpen] = useState(false);

    return (
        <div className="flex flex-col h-screen bg-[#f7f9fb] overflow-hidden relative">
            <Navbar />

            {/* Top Header showing Search Form on results page */}
            <div className="bg-white shadow-sm py-4 border-b border-slate-100 flex-shrink-0 z-40">
                <div className="container mx-auto max-w-[1400px] px-4 md:px-6">
                    <SearchForm variant="header" className="shadow-none border border-slate-100 bg-[#f9fafb] -mb-2" />
                </div>
            </div>

            <main className="flex-1 overflow-hidden">
                <div className="container mx-auto max-w-[1400px] h-full px-4 md:px-6">
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(buildHotelListJsonLd("New York", 14542)),
                        }}
                    />

                    <div className="flex flex-col lg:flex-row gap-8 h-full">
                        {/* Left Sidebar (Desktop Only for filters) */}
                        <aside className="hidden lg:block w-[300px] shrink-0 h-full overflow-y-auto pt-6 pb-20 pr-2 scrollbar-hide hover:scrollbar-default transition-all">
                            <HotelFilters onViewMap={() => setIsMapOpen(true)} />
                        </aside>

                        {/* Main Content Area */}
                        <div className="flex-1 min-w-0 h-full overflow-y-auto pt-6 pb-20 pr-1 scrollbar-hide hover:scrollbar-default transition-all">
                            <HotelList />
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Map Button */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <Button
                    onClick={() => setIsMapOpen(true)}
                    className="bg-[#051c34] hover:bg-[#0a2f58] text-white rounded-full px-6 py-6 shadow-2xl flex items-center gap-2 border-none font-bold text-sm tracking-tight transition-transform active:scale-95"
                >
                    <MapIcon className="w-5 h-5 text-indigo-300" />
                    {t("viewMap")}
                </Button>
            </div>

            {/* Map Pop-up Modal */}
            <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                <DialogContent className="max-w-[95vw] w-[1200px] h-[85vh] p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
                    <DialogHeader className="absolute top-4 left-4 right-4 z-50 pointer-events-none">
                        <div className="flex justify-between items-center bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-slate-100 pointer-events-auto">
                            <DialogTitle className="text-lg font-black text-[#051c34] tracking-tight">{t("exploreOnMap")}</DialogTitle>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMapOpen(false)}
                                className="rounded-full hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="w-full h-full pt-0">
                        <HotelMap />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
