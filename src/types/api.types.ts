//---** API contract interfaces and response DTOs **---//

import type { Hotel } from "./hotel.types";

export interface SearchMetadata {
    id: string;
    status: string;
    created_at: string;
    request_time_taken: number;
    parsing_time_taken: number;
    total_time_taken: number;
    request_url: string;
    html_url: string;
    json_url: string;
}

export interface SearchParameters {
    engine: string;
    q: string;
    check_in_date: string;
    check_out_date: string;
    currency: string;
    hl: string;
    gl: string;
    adults: number;
    property_type: string;
}

export interface SearchInformation {
    total_results: number;
}

export interface Pagination {
    records_from: number;
    records_to: number;
    next_page_token?: string;
}

export interface HotelsApiResponse {
    search_metadata: SearchMetadata;
    search_parameters: SearchParameters;
    search_information: SearchInformation;
    properties: Hotel[];
    pagination: Pagination;
}

export interface ApiError {
    message: string;
    status: number;
}
