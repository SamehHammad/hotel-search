//---** useInfiniteScroll: InteractionObserver-based scroll trigger for pagination **---//

"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
    onLoadMore: () => void;
    hasMore: boolean;
    loading: boolean;
    threshold?: number;
}

//---** Custom hook to manage infinite scroll behavior using Intersection Observer **---//
export function useInfiniteScroll({
    onLoadMore,
    hasMore,
    loading,
    threshold = 0.1,
}: UseInfiniteScrollOptions) {
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    //---** Handle visibility changes of the sentinel element to trigger data fetching **---//
    const handleIntersection = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !loading) {
                onLoadMore();
            }
        },
        [hasMore, loading, onLoadMore]
    );

    //---** Initialize and clean up the intersection observer for the target element **---//
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(handleIntersection, {
            threshold,
            rootMargin: "100px",
        });

        observer.observe(sentinel);

        return () => {
            observer.unobserve(sentinel);
            observer.disconnect();
        };
    }, [handleIntersection, threshold]);

    return { sentinelRef };
}
