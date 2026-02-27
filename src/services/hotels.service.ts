//---** Hotel service: all hotel-related API calls abstracted from UI **---//

import { apiGet } from "./api";
import type { HotelsApiResponse } from "@/types/api.types";
import type { SearchFilters } from "@/types/search.types";

/** Fetch hotels with search filters */
export async function fetchHotels(
    filters: SearchFilters
): Promise<HotelsApiResponse> {
    const boundsParam = filters.bounds
        ? `${filters.bounds.north},${filters.bounds.south},${filters.bounds.east},${filters.bounds.west}`
        : undefined;

    return apiGet<HotelsApiResponse>("/api/hotels", {
        params: {
            q: filters.q,
            check_in_date: filters.check_in_date,
            check_out_date: filters.check_out_date,
            adults: filters.guests.adults,
            children: filters.guests.children,
            page: filters.page,
            bounds: boundsParam,
        },
    });
}
