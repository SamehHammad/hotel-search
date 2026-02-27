//---** useHotels: orchestrates hotel fetching with store integration **---//

"use client";

import { useEffect } from "react";
import useHotelsStore, { shallow } from "@/store/hotels.store";

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
        (state) => ({
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
        }),
        shallow
    );

    useEffect(() => {
        fetchHotels();
        return () => {
            resetHotels();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
