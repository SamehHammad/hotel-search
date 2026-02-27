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

export interface SearchFilters {
    q: string;
    check_in_date: string;
    check_out_date: string;
    guests: GuestsConfig;
    page: number;
    bounds?: Bounds | null;
}

export interface SearchFormValues {
    location: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
}
