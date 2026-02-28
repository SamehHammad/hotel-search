//---** Search form and filter types used across the app **---//

export interface Bounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

export interface GuestsConfig {
    adults: number;
    children: number;
}

export interface RoomConfig {
    adults: number;
    children: number;
}

export interface SearchFilters {
    q: string;
    check_in_date?: string;
    check_out_date?: string;
    guests: GuestsConfig;
    rooms: RoomConfig[];
    page: number;
    bounds?: Bounds | null;
    min_price?: number;
    max_price?: number;
    rating?: number;
    amenities?: string[];
    hotel_stars?: number[];
    sort_by?: string;
    property_name?: string;
    wishlist_tokens?: string[];
    is_wishlist?: boolean;
}

export interface SearchFormValues {
    location: string;
    checkIn: string;
    checkOut: string;
    rooms: RoomConfig[];
}
