//---** useHotels: orchestrates hotel fetching with store integration **---//

"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useHotelsStore from "@/store/hotels.store";
import { useShallow } from "zustand/react/shallow";

/** Hook that triggers initial hotel fetch on mount */
export function useHotels() {
    const {
        hotels,
        loading,
        error,
        pagination,
        mapBounds,
        filters,
        isFetchingMore,
        fetchHotels,
        setFilters,
        appendHotels,
        resetHotels,
    } = useHotelsStore(
        useShallow((state) => ({
            hotels: state.hotels,
            loading: state.loading,
            error: state.error,
            pagination: state.pagination,
            mapBounds: state.mapBounds,
            filters: state.filters,
            isFetchingMore: state.isFetchingMore,
            fetchHotels: state.fetchHotels,
            setFilters: state.setFilters,
            appendHotels: state.appendHotels,
            resetHotels: state.resetHotels,
        }))
    );

    const searchParams = useSearchParams();

    // ---** Separate effect for unmount cleanup ONLY **---//
    useEffect(() => {
        return () => {
            resetHotels();
        };
    }, [resetHotels]);

    useEffect(() => {
        const q = searchParams.get("q");

        // If no query parameter exists, we assume it's the first page load without a search,
        // so we reset hotels and do NOT auto-fetch.
        if (!q) {
            resetHotels();
            return;
        }

        const adults = parseInt(searchParams.get("adults") || "2", 10);
        const children = parseInt(searchParams.get("children") || "0", 10);
        const boundsParam = searchParams.get("bounds");

        const bounds = boundsParam ? {
            north: parseFloat(boundsParam.split(",")[0]),
            south: parseFloat(boundsParam.split(",")[1]),
            east: parseFloat(boundsParam.split(",")[2]),
            west: parseFloat(boundsParam.split(",")[3]),
        } : null;

        // Check if anything actually changed compared to store
        // This is key to preventing loops from URL <-> Store synchronization
        const storeFilters = useHotelsStore.getState().filters;
        const hasQChanged = q !== storeFilters.q;
        const hasGuestsChanged =
            adults !== storeFilters.guests.adults ||
            children !== storeFilters.guests.children;
        const hasBoundsChanged = JSON.stringify(bounds) !== JSON.stringify(storeFilters.bounds);

        if (!hasQChanged && !hasGuestsChanged && !hasBoundsChanged) {
            return;
        }

        // Sync local bounds to store so map doesn't re-trigger fitBounds
        // if we are loading with bounds from the URL initially
        if (bounds && !mapBounds) {
            useHotelsStore.getState().setBounds(bounds);
        }

        setFilters({
            q,
            check_in_date: searchParams.get("check_in_date") || undefined,
            check_out_date: searchParams.get("check_out_date") || undefined,
            guests: { adults, children },
            bounds,
        });

        fetchHotels();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);


    return {
        hotels,
        loading,
        error,
        pagination,
        mapBounds,
        filters,
        isFetchingMore,
        fetchHotels,
        setFilters,
        appendHotels,
    };
}
