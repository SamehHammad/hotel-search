//---** List rendering container with Infinite Scroll IntersectionObserver **---//

"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { HotelCard } from "./HotelCard";
import { HotelCardSkeleton } from "./HotelCardSkeleton";
import { HotelFilterChips } from "./HotelFilterChips";
import { useHotels } from "@/hooks/useHotels";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Loader2 } from "lucide-react";

export function HotelList() {
    const t = useTranslations("hotels");
    const tCommon = useTranslations("common");

    //---** Extract data and loading state from the hotels hook **---//
    const { hotels, loading, error, isFetchingMore, pagination, appendHotels } = useHotels();

    //---** Check for active search queries in the URL **---//
    const searchParams = useSearchParams();
    const hasSearchQuery = !!searchParams.get("q");

    //---** Determine if more records are available for fetching **---//
    const hasMore = !!pagination.next_page_token;

    //---** Infinite Scroll hook: Triggers data fetch on scroll threshold **---//
    const { sentinelRef } = useInfiniteScroll({
        onLoadMore: appendHotels,
        hasMore,
        loading: isFetchingMore,
        threshold: 0.5,
    });

    //---** Error state: Display error message and retry button **---//
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

    //---** Loading state: Display placeholder skeletons during initial fetch **---//
    if (loading && hotels.length === 0) {
        return (
            <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                    <HotelCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    //---** Empty state: Display helpful message when no hotels match search **---//
    if (!loading && hotels.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-brand-light rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">🏨</span>
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">
                    {hasSearchQuery ? tCommon("noResults") : t("readyToExplore")}
                </h3>
                <p className="text-brand-muted max-w-sm mb-6">
                    {hasSearchQuery
                        ? t("resultsCount", { count: 0 })
                        : t("searchPrompt")
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {/*---** Filter chips and sorting controls header **---*/}
            <HotelFilterChips />

            {/*---** Render list of hotel cards based on search results **---*/}
            <div className="space-y-6">
                {hotels.map((hotel: import("@/types/hotel.types").Hotel, index: number) => (
                    <HotelCard
                        key={`${hotel.property_token}-${index}`}
                        hotel={hotel}
                        priority={index < 2}
                    />
                ))}

                {/*---** Infinite Scroll Sentinel: Observes for lazy loading triggers **---*/}
                <div ref={sentinelRef} className="h-10 w-full flex items-center justify-center mt-6 mb-12">
                    {isFetchingMore && (
                        <div className="flex items-center gap-3 text-primary font-medium">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{t("loadingMore")}</span>
                        </div>
                    )}
                    {!hasMore && hotels.length > 0 && !loading && (
                        <p className="text-brand-muted font-medium">{t("noMoreHotels")}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
