import { Hotel } from "./hotel.types";

export interface Destination {
    id: string;
    nameKey: string;
    image: string;
    propertyCount: string;
}

export interface HomeDataResponse {
    destinations: Destination[];
    popularHotels: Hotel[];
}
