//---** Next.js API route: /api/hotels — Bearer-protected mock hotel search **---//

import { NextRequest, NextResponse } from "next/server";
import type { HotelsApiResponse } from "@/types/api.types";
import type { Hotel } from "@/types/hotel.types";
import { BEARER_TOKEN, PAGE_SIZE } from "@/lib/constants";

import { MOCK_HOTELS, generateMoreHotels } from "@/data/mockHotels";
import { CITY_SUGGESTIONS } from "@/data/suggestions";

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

    // --- Determine potential city from query ---
    const normalizedQ = q.toLowerCase().trim();
    const matchedCity = CITY_SUGGESTIONS.find(c =>
        normalizedQ.includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(normalizedQ)
    );

    const isNYC = normalizedQ === "new york hotels" || normalizedQ === "new york";

    // --- Data selection logic ---
    let hotels: Hotel[] = [];

    if (page === 1) {
        // Try to filter MOCK_HOTELS for the matched city
        if (matchedCity) {
            hotels = MOCK_HOTELS.filter(h =>
                h.city.toLowerCase() === matchedCity.name.toLowerCase()
            );
        } else if (isNYC) {
            hotels = MOCK_HOTELS.filter(h => h.city === "New York");
        } else {
            // No match found in suggestions or NYC - return empty array to trigger "Not Found" UI
            hotels = [];
        }
    } else {
        // For pagination, only generate if we had a match or NYC
        if (matchedCity || isNYC) {
            const baseLat = matchedCity ? matchedCity.lat : 40.75;
            const baseLng = matchedCity ? matchedCity.lng : -73.98;

            hotels = generateMoreHotels(
                page,
                matchedCity?.name || "New York",
                matchedCity?.country || "United States",
                baseLat,
                baseLng
            );
        } else {
            hotels = [];
        }
    }

    // --- Dynamic transformation for "Custom Queries" ---
    // If the query is not NYC and we are displaying hotels that ARE in NYC, move them.
    const shouldTransform = !isNYC && hotels.some(h => h.city === "New York" || h.city === "New York City");

    if (shouldTransform && matchedCity) {
        hotels = JSON.parse(JSON.stringify(hotels)).map((h: Hotel) => {
            return {
                ...h,
                city: matchedCity.name,
                country: matchedCity.country,
                name: h.name.includes("New York") ? h.name.replace("New York", matchedCity.name) : `${h.name} ${matchedCity.name}`,
                gps_coordinates: {
                    latitude: matchedCity.lat + (Math.random() - 0.5) * 0.05,
                    longitude: matchedCity.lng + (Math.random() - 0.5) * 0.05,
                }
            };
        });
    }

    // --- Bounds Filtering & Dynamic Generation ---
    if (boundsStr) {
        const parts = boundsStr.split(",").map(Number);
        if (parts.length === 4) {
            const [north, south, east, west] = parts;
            const centerLat = (north + south) / 2;
            const centerLng = (east + west) / 2;

            const filteredHotels = hotels.filter((h) => {
                const { latitude, longitude } = h.gps_coordinates;
                return latitude <= north && latitude >= south && longitude <= east && longitude >= west;
            });

            // If bounds filtered out everything, let's generate some hotels specifically for this area
            // to provide a "live" feeling as the user moves the map.
            if (filteredHotels.length === 0 && (matchedCity || isNYC)) {
                hotels = generateMoreHotels(
                    page + 99, // Offset page to distinguish from normal pagination
                    matchedCity?.name || "New York",
                    matchedCity?.country || "United States",
                    centerLat,
                    centerLng
                );
            } else {
                hotels = filteredHotels;
            }
        }
    }

    // --- Pricing Realism (Nights calculation) ---
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    hotels = JSON.parse(JSON.stringify(hotels)).map((h: Hotel) => {
        const totalPriceExtracted = h.price_per_night.extracted_price * nights;
        const totalPriceBeforeTaxesExtracted = h.price_per_night.extracted_price_before_taxes * nights;
        return {
            ...h,
            total_price: {
                price: `$${totalPriceExtracted}`,
                extracted_price: totalPriceExtracted,
                price_before_taxes: `$${totalPriceBeforeTaxesExtracted}`,
                extracted_price_before_taxes: totalPriceBeforeTaxesExtracted
            }
        };
    });

    const totalResults = !isNYC ? hotels.length + Math.floor(Math.random() * 50) : 14542;
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
