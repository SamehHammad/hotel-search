//---** List rendering container with Infinite Scroll IntersectionObserver **---//

"use client";

import { useTranslations } from "next-intl";
import { HotelCard } from "./HotelCard";
import { HotelCardSkeleton } from "./HotelCardSkeleton";
import { useHotels } from "@/hooks/useHotels";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Loader2 } from "lucide-react";

export function HotelList() {
    const t = useTranslations("hotels");
    const tCommon = useTranslations("common");

    const { hotels, loading, error, isFetchingMore, pagination, appendHotels } = useHotels();

    const hasMore = !!pagination.next_page_token;

    // Infinite Scroll hook
    const { sentinelRef } = useInfiniteScroll({
        onLoadMore: appendHotels,
        hasMore,
        loading: isFetchingMore,
        threshold: 0.5,
    });

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-red-50 text-red-600 rounded-2xl p-6 w-full max-w-md">
                    <h3 className="font-semibold text-lg mb-2">{tCommon("error")}</h3>
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    >
                        {tCommon("retry")}
                    </button>
                </div>
            </div>
        );
    }

    // Initial load
    if (loading && hotels.length === 0) {
        return (
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <HotelCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    // Empty state
    if (!loading && hotels.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">🏨</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {tCommon("noResults")}
                </h3>
                <p className="text-slate-500 max-w-sm mb-6">
                    {t("resultsCount", { count: 0 })}. Try adjusting your search filters or map bounds.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 flex flex-col">
            <div className="flex justify-between items-center mb-2 px-1">
                <h2 className="text-lg font-semibold text-slate-800">
                    {t("resultsCount", { count: pagination.records_to || hotels.length })}
                </h2>
            </div>

            {hotels.map((hotel: import("@/types/hotel.types").Hotel, index: number) => (
                <HotelCard
                    key={`${hotel.property_token}-${index}`}
                    hotel={hotel}
                />
            ))}

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="h-10 w-full flex items-center justify-center mt-6 mb-12">
                {isFetchingMore && (
                    <div className="flex items-center gap-3 text-indigo-600 font-medium">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{t("loadingMore")}</span>
                    </div>
                )}
                {!hasMore && hotels.length > 0 && !loading && (
                    <p className="text-slate-400 font-medium">{t("noMoreHotels")}</p>
                )}
            </div>
        </div>
    );
}
