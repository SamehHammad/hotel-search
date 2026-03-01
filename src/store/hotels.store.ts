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
    hydrateFromServer: (payload: {
        hotels: Hotel[];
        pagination: Pagination;
        filters: SearchFilters;
    }) => void;
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
        const state = get();
        const currentQ = state.filters.q;
        const currentGuests = state.filters.guests;
        const currentRooms = state.filters.rooms;

        const isMajorChange =
            (newFilters.q !== undefined && newFilters.q !== currentQ) ||
            (newFilters.guests !== undefined &&
                (newFilters.guests.adults !== currentGuests.adults ||
                    newFilters.guests.children !== currentGuests.children)) ||
            (newFilters.rooms !== undefined &&
                JSON.stringify(newFilters.rooms) !== JSON.stringify(currentRooms)) ||
            (newFilters.min_price !== undefined && newFilters.min_price !== state.filters.min_price) ||
            (newFilters.max_price !== undefined && newFilters.max_price !== state.filters.max_price) ||
            (newFilters.hotel_stars !== undefined && JSON.stringify(newFilters.hotel_stars) !== JSON.stringify(state.filters.hotel_stars)) ||
            (newFilters.amenities !== undefined && JSON.stringify(newFilters.amenities) !== JSON.stringify(state.filters.amenities)) ||
            (newFilters.property_name !== undefined && newFilters.property_name !== state.filters.property_name) ||
            (newFilters.is_wishlist !== undefined && newFilters.is_wishlist !== state.filters.is_wishlist);

        set((state) => {
            const nextFilters = { ...state.filters, ...newFilters, page: 1 };

            // If query or guests/rooms change, we MUST clear bounds to allow a fresh search
            if (isMajorChange) {
                nextFilters.bounds = undefined;
            }

            return {
                filters: nextFilters,
                hotels: isMajorChange ? [] : state.hotels,
                pagination: isMajorChange ? DEFAULT_PAGINATION : state.pagination,
                mapBounds: isMajorChange ? null : state.mapBounds,
                loading: isMajorChange ? false : state.loading,
            };
        });
    },

    hydrateFromServer: ({ hotels, pagination, filters }) => {
        set({
            hotels,
            pagination,
            filters,
            loading: false,
            error: null,
            isFetchingMore: false,
        });
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
