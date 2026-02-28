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

    // ---** Set filters and reset to page 1 **---//
    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: 1 },
            hotels: [],
            pagination: DEFAULT_PAGINATION,
        }));
    },

    // ---** Fetch hotels fresh (page 1) **---//
    fetchHotels: async () => {
        const { filters } = get();
        set({ loading: true, error: null, hotels: [], pagination: DEFAULT_PAGINATION });

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
        const { filters, isFetchingMore, pagination } = get();

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

        // Shallow comparison to prevent unnecessary state updates
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
        // We don't call fetchHotels here anymore, because useHotels hook 
        // will pick up the URL change (triggered in useMapBounds) and fetch.
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
