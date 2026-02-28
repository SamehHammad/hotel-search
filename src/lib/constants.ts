import { SearchFilters } from "@/types/search.types";

export const BEARER_TOKEN = "hotel_secure_token_123";

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
    q: "New York Hotels",
    guests: { adults: 2, children: 0 },
    rooms: [{ adults: 2, children: 0 }],
    page: 1,
    bounds: null,
};

export const PAGE_SIZE = 20;

export const GOOGLE_MAPS_API_KEY =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export const LOCALES = ["en", "ar"] as const;

export const DEFAULT_LOCALE = "en" as const;

export const MAP_DEFAULT_CENTER = {
    lat: 40.7128,
    lng: -74.006,
};

export const MAP_DEFAULT_ZOOM = 12;

export const SITE_NAME = "HotelSearch";
