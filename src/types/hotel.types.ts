//---** Hotel domain types matching the response-example.json structure **---//

export interface GpsCoordinates {
    latitude: number;
    longitude: number;
}

export interface PriceInfo {
    price: string;
    extracted_price: number;
    price_before_taxes: string;
    extracted_price_before_taxes: number;
}

export interface Transportation {
    type: string;
    duration: string;
}

export interface NearbyPlace {
    name: string;
    transportations: Transportation[];
}

export interface Offer {
    source: string;
    logo: string;
    num_guests: number;
    price_per_night: PriceInfo;
}

export interface ReviewsHistogram {
    "5": number;
    "4": number;
    "3": number;
    "2": number;
    "1": number;
}

export interface ReviewBreakdown {
    name: string;
    description: string;
    total: number;
    positive: number;
    neutral: number;
    negative: number;
}

export interface HotelImage {
    thumbnail: string;
    original: string;
}

export interface Hotel {
    type: "hotel" | "vacation_rental" | string;
    property_token: string;
    data_id?: string;
    name: string;
    link?: string;
    description?: string;
    gps_coordinates: GpsCoordinates;
    city: string;
    country: string;
    check_in_time?: string;
    check_out_time?: string;
    price_per_night: PriceInfo;
    total_price: PriceInfo;
    deal?: string;
    deal_description?: string;
    nearby_places?: NearbyPlace[];
    offers?: Offer[];
    hotel_class?: string;
    extracted_hotel_class?: number;
    rating?: number;
    reviews?: number;
    reviews_histogram?: ReviewsHistogram;
    location_rating?: number;
    proximity_to_things_to_do_rating?: number;
    proximity_to_transit_rating?: number;
    airport_access_rating?: number;
    reviews_breakdown?: ReviewBreakdown[];
    eco_certified?: boolean;
    amenities?: string[];
    excluded_amenities?: string[];
    essential_info?: string[];
    images: HotelImage[];
}
