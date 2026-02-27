//---** useInfiniteScroll: IntersectionObserver-based scroll trigger **---//

"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
    onLoadMore: () => void;
    hasMore: boolean;
    loading: boolean;
    threshold?: number;
}

/**
 * Returns a ref to attach to a sentinel element.
 * When the sentinel enters the viewport AND hasMore && !loading,
 * it calls onLoadMore exactly once per intersection.
 */
export function useInfiniteScroll({
    onLoadMore,
    hasMore,
    loading,
    threshold = 0.1,
}: UseInfiniteScrollOptions) {
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const handleIntersection = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !loading) {
                onLoadMore();
            }
        },
        [hasMore, loading, onLoadMore]
    );

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
