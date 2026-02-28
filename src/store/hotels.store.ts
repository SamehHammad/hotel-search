//---** Zustand store: centralized state for hotels, search filters, pagination and map **---//

import { create } from "zustand";
import { shallow } from "zustand/shallow";
import { fetchHotels } from "@/services/hotels.service";
import type { Hotel } from "@/types/hotel.types";
import type { Pagination } from "@/types/api.types";
import type { SearchFilters, Bounds } from "@/types/search.types";
import { DEFAULT_SEARCH_FILTERS } from "@/lib/constants";

interface HotelsState {
    hotels: Hotel[];
    loading: boolean;
    error: string | null;
    pagination: Pagination;
    filters: SearchFilters;
    mapBounds: Bounds | null;
    isFetchingMore: boolean;

    // Actions
    setFilters: (filters: Partial<SearchFilters>) => void;
    fetchHotels: () => Promise<void>;
    appendHotels: () => Promise<void>;
    setBounds: (bounds: Bounds | null) => void;
    resetHotels: () => void;
}

const DEFAULT_PAGINATION: Pagination = {
    records_from: 1,
    records_to: 0,
};

const useHotelsStore = create<HotelsState>((set, get) => ({
    hotels: [],
    loading: false,
    error: null,
    pagination: DEFAULT_PAGINATION,
    filters: DEFAULT_SEARCH_FILTERS,
    mapBounds: null,
    isFetchingMore: false,

    setFilters: (newFilters) => {
        const currentQ = get().filters.q;
        const currentGuests = get().filters.guests;

        const isMajorChange =
            (newFilters.q !== undefined && newFilters.q !== currentQ) ||
            (newFilters.guests !== undefined &&
                (newFilters.guests.adults !== currentGuests.adults ||
                    newFilters.guests.children !== currentGuests.children));

        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: 1 },
            // Only clear results and bounds if it's a major change (new search)
            // If it's just a bounds change or similar, we keep current hotels to avoid flicker
            hotels: isMajorChange ? [] : state.hotels,
            pagination: isMajorChange ? DEFAULT_PAGINATION : state.pagination,
            mapBounds: isMajorChange ? null : state.mapBounds,
        }));
    },



    // ---** Fetch hotels fresh (page 1) **---//
    fetchHotels: async () => {
        const { filters, hotels, mapBounds } = get();

        // If we have hotels and mapBounds, we might be panning. 
        // We only clear if it's a fresh search (usually when mapBounds is null)
        const isFreshSearch = hotels.length === 0 || !filters.bounds;

        set({
            loading: isFreshSearch,
            error: null,
            hotels: isFreshSearch ? [] : hotels,
            pagination: isFreshSearch ? DEFAULT_PAGINATION : get().pagination
        });

        try {
            const response = await fetchHotels({ ...filters, page: 1 });
            set({
                hotels: response.properties,
                pagination: response.pagination,
                loading: false,
                filters: { ...filters, page: 1 },
            });
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : "Failed to fetch hotels",
                loading: false,
            });
        }
    },


    // ---** Append next page (infinite scroll) **---//
    appendHotels: async () => {
        const { filters, isFetchingMore, pagination, hotels } = get();

        // Prevent duplicate fetches and stop when no more pages
        if (isFetchingMore || !pagination.next_page_token) return;

        const nextPage = filters.page + 1;
        set({ isFetchingMore: true });

        try {
            const response = await fetchHotels({ ...filters, page: nextPage });
            set((state) => ({
                hotels: [...state.hotels, ...response.properties],
                pagination: response.pagination,
                filters: { ...state.filters, page: nextPage },
                isFetchingMore: false,
            }));
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : "Failed to load more hotels",
                isFetchingMore: false,
            });
        }
    },

    // ---** Update map bounds state **---//
    setBounds: (bounds) => {
        const current = get().mapBounds;

        if (
            bounds &&
            current &&
            bounds.north === current.north &&
            bounds.south === current.south &&
            bounds.east === current.east &&
            bounds.west === current.west
        ) {
            return;
        }

        set({ mapBounds: bounds });
    },

    // ---** Reset all hotels state **---//
    resetHotels: () => {
        set({
            hotels: [],
            loading: false,
            error: null,
            pagination: DEFAULT_PAGINATION,
            mapBounds: null,
        });
    },
}));

export default useHotelsStore;
export { shallow };
