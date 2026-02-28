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
    const q = searchParams.get("q") ?? "";
    const check_in_date = searchParams.get("check_in_date") ?? "2026-02-28";
    const check_out_date = searchParams.get("check_out_date") ?? "2026-03-06";
    const adults = parseInt(searchParams.get("adults") ?? "2", 10);
    const children = parseInt(searchParams.get("children") ?? "0", 10);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const minPrice = parseInt(searchParams.get("min_price") || "0", 10);
    const maxPrice = parseInt(searchParams.get("max_price") || "2000", 10);
    const rating = parseFloat(searchParams.get("rating") || "0");
    const propertyName = searchParams.get("property_name")?.toLowerCase() || "";
    const starsParam = searchParams.get("hotel_stars");
    const stars = starsParam ? starsParam.split(",").map(Number).filter(n => !isNaN(n) && n > 0) : [];

    const amenitiesParam = searchParams.get("amenities");
    const amenities = amenitiesParam ? amenitiesParam.split(",").filter(a => a.length > 0) : [];

    const boundsStr = searchParams.get("bounds");
    const wishlistTokens = searchParams.get("wishlist_tokens");

    // --- Determine potential city from query ---
    const normalizedQ = q.toLowerCase().trim();

    /**
     * City matching priority:
     * 1. Exact English name match (e.g. "Dubai")
     * 2. English name contains / is contained by query
     * 3. Arabic alias exact match (e.g. "دبي")
     * 4. Arabic alias partial match
     */
    const matchedCity = CITY_SUGGESTIONS.find((c) => {
        const cityLower = c.name.toLowerCase();
        // Exact English name
        if (cityLower === normalizedQ) return true;
        // English partial
        if (cityLower.includes(normalizedQ) || normalizedQ.includes(cityLower)) return true;
        // Arabic / alias matching
        if (c.aliases?.some((a) => {
            const aLower = a.toLowerCase();
            return aLower === normalizedQ || aLower.includes(normalizedQ) || normalizedQ.includes(aLower);
        })) return true;
        return false;
    });

    // --- Data selection logic ---
    let hotels: Hotel[] = [];

    if (wishlistTokens) {
        if (page > 1) {
            hotels = [];
        } else if (wishlistTokens.length > 0) {
            // [Wishlist Mode]: IGNORE city query, return specific requested tokens
            const tokens = wishlistTokens.split(",");
            for (const token of tokens) {
                const foundMock = MOCK_HOTELS.find(h => h.property_token === token);
                if (foundMock) {
                    hotels.push(foundMock);
                } else {
                    // Regex parses: "mock_page1_token_New_York_5" -> page=1, city="New_York", idx=5
                    const match = token.match(/^mock_page(\d+)_token_(.+)_(\d+)$/);
                    if (match) {
                        const pageVal = parseInt(match[1], 10);
                        const cityStr = match[2].replace(/_/g, " ");
                        const idx = parseInt(match[3], 10);

                        const matchedCity = CITY_SUGGESTIONS.find(c => c.name.toLowerCase() === cityStr.toLowerCase());
                        if (matchedCity) {
                            const generated = generateMoreHotels(
                                pageVal,
                                matchedCity.name,
                                matchedCity.country,
                                matchedCity.lat,
                                matchedCity.lng
                            );
                            if (generated[idx]) {
                                hotels.push(generated[idx]);
                            }
                        }
                    }
                }
            }
        }
    } else {
        // [Normal search Mode]: Use city query 
        if (page === 1) {
            if (!q || q.length < 2) {
                // No query → show all mock hotels
                hotels = [...MOCK_HOTELS];
            } else if (matchedCity) {
                // Matched a known city → combine MOCK + Generated hotels for that city
                const cityMocks = MOCK_HOTELS.filter(
                    (h) => h.city.toLowerCase() === matchedCity.name.toLowerCase()
                );
                const generated = generateMoreHotels(
                    1,
                    matchedCity.name,
                    matchedCity.country,
                    matchedCity.lat,
                    matchedCity.lng
                );
                hotels = [...cityMocks, ...generated];
            } else {
                // Unknown city query → return empty (no wrong fallback!)
                hotels = [];
            }
        } else {
            if (matchedCity) {
                hotels = generateMoreHotels(
                    page,
                    matchedCity.name,
                    matchedCity.country,
                    matchedCity.lat,
                    matchedCity.lng
                );
            } else if (!q) {
                hotels = generateMoreHotels(page, "Featured", "", 0, 0);
            } else {
                hotels = [];
            }
        }
    }

    // --- Apply Filters ---
    if (propertyName) {
        // If searching by specific property name, we show matching results regardless of other filters
        const searchWords = propertyName.split(/\s+/).filter(w => w.length > 0);
        hotels = hotels.filter(h => {
            const hotelName = h.name.toLowerCase();
            return searchWords.every(word => hotelName.includes(word));
        });
    } else {
        // Standard filtering path
        hotels = hotels.filter(h => {
            // Price Filter
            const price = h.price_per_night?.extracted_price || 0;
            if (price < minPrice || price > maxPrice) return false;

            // Star Filter - Use extracted_hotel_class
            const hotelClass = h.extracted_hotel_class || 0;
            if (stars.length > 0 && !stars.includes(hotelClass)) return false;

            // Rating Filter
            if (rating > 0 && (h.rating || 0) < rating) return false;

            // Amenities Filter
            if (amenities.length > 0) {
                const hotelAmenities = (h.amenities || []).map(a => a.toLowerCase());
                const textToSearch = `${h.description} ${h.deal} ${hotelAmenities.join(" ")}`.toLowerCase();

                const hasAmenities = amenities.every(a => {
                    const search = a.toLowerCase();
                    // Special case for wifi/wi-fi
                    if (search === "wifi" || search === "wi-fi") {
                        return textToSearch.includes("wifi") || textToSearch.includes("wi-fi") || textToSearch.includes("واي فاي");
                    }
                    return textToSearch.includes(search);
                });

                if (!hasAmenities) return false;
            }

            return true;
        });
    }

    // --- (Transformation block removed: hotels are now always fetched for the correct city) ---

    // --- Bounds Filtering (Bypass if specific property is searched) ---
    if (boundsStr && !propertyName) {
        const parts = boundsStr.split(",").map(Number);
        if (parts.length === 4) {
            const [north, south, east, west] = parts;
            hotels = hotels.filter((h) => {
                const { latitude, longitude } = h.gps_coordinates;
                return latitude <= north && latitude >= south && longitude <= east && longitude >= west;
            });
        }
    }

    // --- Pricing Realism ---
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    hotels = JSON.parse(JSON.stringify(hotels)).map((h: Hotel) => {
        const nightly = h.price_per_night?.extracted_price || 150;
        const total = nightly * nights;
        return {
            ...h,
            total_price: {
                price: `$${total}`,
                extracted_price: total,
                price_before_taxes: `$${Math.round(total * 0.9)}`,
                extracted_price_before_taxes: Math.round(total * 0.9)
            }
        };
    });

    const totalResults = hotels.length;
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
            ...((page < 5 && !wishlistTokens) ? { next_page_token: `page_${page + 1}_token` } : {}),
        },
    };

    return NextResponse.json(response, {
        headers: {
            "Cache-Control": "no-store",
        },
    });
}
