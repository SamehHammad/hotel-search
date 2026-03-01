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

    /**--City matching priority--*/
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
    let allHotels: Hotel[] = [];

    if (wishlistTokens) {
        // [Wishlist Mode]: return specific requested tokens
        const tokens = wishlistTokens.split(",");
        for (const token of tokens) {
            const foundMock = MOCK_HOTELS.find(h => h.property_token === token);
            if (foundMock) {
                allHotels.push(foundMock);
            } else {
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
                            allHotels.push(generated[idx]);
                        }
                    }
                }
            }
        }
    } else {
        // [Normal search Mode]: Aggregate multiple "pages" of generated data to have a large pool to slice from
        if (!q || q.length < 2) {
            allHotels = [...MOCK_HOTELS];
            // Add some generated featured hotels
            for (let p = 1; p <= 3; p++) {
                allHotels = [...allHotels, ...generateMoreHotels(p, "Featured", "", 0, 0)];
            }
        } else if (matchedCity) {
            const cityMocks = MOCK_HOTELS.filter(
                (h) => h.city.toLowerCase() === matchedCity.name.toLowerCase()
            );
            allHotels = [...cityMocks];
            // Generate pool of 5 "pages" worth of data
            for (let p = 1; p <= 5; p++) {
                allHotels = [...allHotels, ...generateMoreHotels(
                    p,
                    matchedCity.name,
                    matchedCity.country,
                    matchedCity.lat,
                    matchedCity.lng
                )];
            }
        }
    }

    let hotels = allHotels;

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

    // --- Sorting logic ---
    const sortBy = searchParams.get("sort_by") || "recommended";
    if (sortBy === "price_asc") {
        hotels.sort((a, b) => {
            const priceA = a.price_per_night?.extracted_price || 0;
            const priceB = b.price_per_night?.extracted_price || 0;
            return priceA - priceB;
        });
    } else if (sortBy === "rating") {
        hotels.sort((a, b) => {
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            return ratingB - ratingA;
        });
    }

    const totalResults = hotels.length;
    const startIndex = (page - 1) * PAGE_SIZE;
    const paginatedHotels = hotels.slice(startIndex, startIndex + PAGE_SIZE);

    const recordsFrom = startIndex + 1;
    const recordsTo = recordsFrom + paginatedHotels.length - 1;

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
        properties: paginatedHotels,
        pagination: {
            records_from: recordsFrom,
            records_to: recordsTo,
            ...((startIndex + PAGE_SIZE < totalResults && !wishlistTokens) ? { next_page_token: `page_${page + 1}_token` } : {}),
        },
    };

    return NextResponse.json(response, {
        headers: {
            "Cache-Control": "no-store",
        },
    });
}
