//---** Next.js API route: /api/hotels — Bearer-protected mock hotel search **---//

import { NextRequest, NextResponse } from "next/server";
import type { HotelsApiResponse } from "@/types/api.types";
import type { Hotel } from "@/types/hotel.types";
import { BEARER_TOKEN, PAGE_SIZE } from "@/lib/constants";

import { MOCK_HOTELS, generateMoreHotels } from "@/data/mockHotels";

// ---** Validate Bearer token **---//
function validateToken(request: NextRequest): boolean {
    const auth = request.headers.get("Authorization");
    if (!auth) return false;
    const [scheme, token] = auth.split(" ");
    return scheme === "Bearer" && token === BEARER_TOKEN;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    // --- Security: validate bearer token ---
    if (!validateToken(request)) {
        return NextResponse.json(
            { message: "Unauthorized - Invalid or missing Bearer token" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "New York Hotels";
    const check_in_date = searchParams.get("check_in_date") ?? "2026-02-28";
    const check_out_date = searchParams.get("check_out_date") ?? "2026-03-06";
    const adults = parseInt(searchParams.get("adults") ?? "2", 10);
    const children = parseInt(searchParams.get("children") ?? "0", 10);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const boundsStr = searchParams.get("bounds");

    // --- Input validation ---
    if (isNaN(page) || page < 1) {
        return NextResponse.json({ message: "Invalid page parameter" }, { status: 400 });
    }

    // Simulate bounds filtering
    let hotels = page === 1 ? MOCK_HOTELS : generateMoreHotels(page);

    if (boundsStr) {
        const parts = boundsStr.split(",").map(Number);
        if (parts.length === 4) {
            const [north, south, east, west] = parts;
            hotels = hotels.filter((h) => {
                const { latitude, longitude } = h.gps_coordinates;
                return latitude <= north && latitude >= south && longitude <= east && longitude >= west;
            });
        }
    }

    const totalResults = 14542;
    const recordsFrom = (page - 1) * PAGE_SIZE + 1;
    const recordsTo = recordsFrom + hotels.length - 1;

    const response: HotelsApiResponse = {
        search_metadata: {
            id: `search_mock_${Date.now()}`,
            status: "Success",
            created_at: new Date().toISOString(),
            request_time_taken: 0.42,
            parsing_time_taken: 0.02,
            total_time_taken: 0.44,
            request_url: `https://www.google.com/travel/search?q=${encodeURIComponent(q)}`,
            html_url: `https://www.searchapi.io/api/v1/searches/mock.html`,
            json_url: `https://www.searchapi.io/api/v1/searches/mock`,
        },
        search_parameters: {
            engine: "google_hotels",
            q,
            check_in_date,
            check_out_date,
            currency: "USD",
            hl: "en",
            gl: "us",
            adults,
            property_type: "hotel",
        },
        search_information: {
            total_results: totalResults,
        },
        properties: hotels,
        pagination: {
            records_from: recordsFrom,
            records_to: recordsTo,
            ...(page < 5 ? { next_page_token: `page_${page + 1}_token` } : {}),
        },
    };

    return NextResponse.json(response, {
        headers: {
            "Cache-Control": "no-store",
        },
    });
}
