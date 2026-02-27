//---** Next.js API route: /api/hotels — Bearer-protected mock hotel search **---//

import { NextRequest, NextResponse } from "next/server";
import type { HotelsApiResponse } from "@/types/api.types";
import type { Hotel } from "@/types/hotel.types";
import { BEARER_TOKEN, PAGE_SIZE } from "@/lib/constants";

// ---** Mock hotel data pool matching response-example.json structure **---//
const MOCK_HOTELS: Hotel[] = [
    {
        type: "hotel",
        property_token: "ChkIuuav9KbOg9kvGg0vZy8xMWMybnF4NXFtEAE",
        data_id: "0x89c25852c9389fb5:0x2fb20e726e8bf33a",
        name: "DoubleTree by Hilton Hotel New York Times Square West",
        link: "https://www.hilton.com/en/hotels/nycswdt-doubletree-new-york-times-square-west/",
        description: "Contemporary, upscale property offering terrace dining & a gym, plus a rooftop bar with city views.",
        gps_coordinates: { latitude: 40.7566361, longitude: -73.9930715 },
        city: "New York", country: "US",
        check_in_time: "3:00 PM", check_out_time: "12:00 PM",
        price_per_night: { price: "$139", extracted_price: 139, price_before_taxes: "$119", extracted_price_before_taxes: 119 },
        total_price: { price: "$832", extracted_price: 832, price_before_taxes: "$713", extracted_price_before_taxes: 713 },
        hotel_class: "4-star hotel", extracted_hotel_class: 4,
        rating: 3.5, reviews: 6463,
        reviews_histogram: { "5": 2102, "4": 1732, "3": 983, "2": 618, "1": 1028 },
        location_rating: 4.7, proximity_to_things_to_do_rating: 4.8, proximity_to_transit_rating: 4.9, airport_access_rating: 4.3,
        eco_certified: true,
        amenities: ["Free Wi‑Fi", "Parking ($)", "Air conditioning", "Pet-friendly", "Fitness center", "Bar", "Restaurant", "Room service", "Accessible", "Kid-friendly", "Smoke-free property"],
        nearby_places: [
            { name: "Times Square", transportations: [{ type: "Public Transport", duration: "7 min" }] },
            { name: "42 St-Port Authority Bus Terminal", transportations: [{ type: "Walking", duration: "5 min" }] },
            { name: "John F. Kennedy International Airport", transportations: [{ type: "Taxi", duration: "42 min" }, { type: "Public Transport", duration: "1 hr 6 min" }] },
        ],
        images: [
            { thumbnail: "https://lh3.googleusercontent.com/p/AF1QipNWJQfQecgQ7OdiDozN6xDereE9PGz8PmNwRUbH=s287-w287-h192-n-k-no-v1", original: "https://lh5.googleusercontent.com/p/AF1QipNWJQfQecgQ7OdiDozN6xDereE9PGz8PmNwRUbH=s10000" },
            { thumbnail: "https://lh3.googleusercontent.com/p/AF1QipNzdQ_bWqiPjJ42h6Ng48kiT7FFwhsn6hZmk8Cr=s287-w287-h192-n-k-no-v1", original: "https://lh5.googleusercontent.com/p/AF1QipNzdQ_bWqiPjJ42h6Ng48kiT7FFwhsn6hZmk8Cr=s10000" },
        ],
    },
    {
        type: "hotel",
        property_token: "ChoIltPQr5PZguHDARoNL2cvMTFid2d3ZzNjbhAB",
        data_id: "0x89c25bb2c35ecf19:0xc3c20ac935f42996",
        name: "EVEN Hotel Brooklyn by IHG",
        link: "https://www.ihg.com/evenhotels/hotels/us/en/brooklyn/bxyev/hoteldetail",
        description: "Modern, wellness-oriented hotel offering serene rooms with fitness gear, plus a health market & bar.",
        gps_coordinates: { latitude: 40.6875576, longitude: -73.9818367 },
        city: "New York", country: "US",
        check_in_time: "3:00 PM", check_out_time: "11:00 AM",
        price_per_night: { price: "$158", extracted_price: 158, price_before_taxes: "$135", extracted_price_before_taxes: 135 },
        total_price: { price: "$948", extracted_price: 948, price_before_taxes: "$808", extracted_price_before_taxes: 808 },
        hotel_class: "4-star hotel", extracted_hotel_class: 4,
        rating: 4.1, reviews: 1785,
        reviews_histogram: { "5": 934, "4": 466, "3": 168, "2": 65, "1": 152 },
        location_rating: 4.2, proximity_to_things_to_do_rating: 4.1, proximity_to_transit_rating: 4.7, airport_access_rating: 4.3,
        amenities: ["Free Wi‑Fi", "Parking ($)", "Air conditioning", "Pet-friendly", "Fitness center", "Bar", "Restaurant", "Accessible", "Business center", "Kid-friendly", "Smoke-free property"],
        nearby_places: [
            { name: "Nevins St", transportations: [{ type: "Walking", duration: "3 min" }] },
            { name: "John F. Kennedy International Airport", transportations: [{ type: "Taxi", duration: "39 min" }, { type: "Public Transport", duration: "53 min" }] },
        ],
        images: [
            { thumbnail: "https://lh3.googleusercontent.com/p/AF1QipPKkOm_FN9mE1rdgbCQ8tBnFZzaH5ML7V_gdxKd=s287-w287-h192-n-k-no-v1", original: "https://lh5.googleusercontent.com/p/AF1QipPKkOm_FN9mE1rdgbCQ8tBnFZzaH5ML7V_gdxKd=s10000" },
            { thumbnail: "https://lh3.googleusercontent.com/p/AF1QipMs51PBXxQSjmAXf-OcSyzwAM34VB8qWOm-yhr4=s287-w287-h192-n-k-no-v1", original: "https://lh5.googleusercontent.com/p/AF1QipMs51PBXxQSjmAXf-OcSyzwAM34VB8qWOm-yhr4=s10000" },
        ],
    },
    {
        type: "hotel",
        property_token: "ChoI0dHFsf3AycHrARoNL2cvMTFkeGRsZjU3bhAB",
        data_id: "0x89c259ad738c44e1:0xeb832607d63168d1",
        name: "Hilton Garden Inn New York Times Square South",
        link: "https://www.hilton.com/en/hotels/nycthgi-hilton-garden-inn-new-york-times-square-south/",
        description: "Unfussy rooms, some with balconies, in a contemporary Midtown property offering a bar & dining.",
        gps_coordinates: { latitude: 40.754482499999995, longitude: -73.99359849999999 },
        city: "New York", country: "US",
        check_in_time: "3:00 PM", check_out_time: "12:00 PM",
        price_per_night: { price: "$151", extracted_price: 151, price_before_taxes: "$130", extracted_price_before_taxes: 130 },
        total_price: { price: "$907", extracted_price: 907, price_before_taxes: "$781", extracted_price_before_taxes: 781 },
        deal: "25% less than usual", deal_description: "Great Deal",
        hotel_class: "3-star hotel", extracted_hotel_class: 3,
        rating: 4.2, reviews: 1901,
        reviews_histogram: { "5": 1069, "4": 476, "3": 173, "2": 61, "1": 122 },
        location_rating: 4.7, proximity_to_things_to_do_rating: 4.9, proximity_to_transit_rating: 5.0, airport_access_rating: 4.4,
        eco_certified: true,
        amenities: ["Free Wi‑Fi", "Parking ($)", "Air conditioning", "Pet-friendly", "Fitness center", "Bar", "Restaurant", "Accessible", "Kid-friendly", "Smoke-free property"],
        nearby_places: [
            { name: "34 St-Penn Station", transportations: [{ type: "Walking", duration: "5 min" }] },
            { name: "John F. Kennedy International Airport", transportations: [{ type: "Taxi", duration: "42 min" }, { type: "Public Transport", duration: "43 min" }] },
        ],
        images: [
            { thumbnail: "https://lh3.googleusercontent.com/p/AF1QipO2f82eSrGSJv8J9jRxojsi2Tv0QwNwPLzvCbDm=s287-w287-h192-n-k-no-v1", original: "https://lh5.googleusercontent.com/p/AF1QipO2f82eSrGSJv8J9jRxojsi2Tv0QwNwPLzvCbDm=s10000" },
            { thumbnail: "https://lh3.googleusercontent.com/p/AF1QipOwuJRXnGpFCcdReHqXWvefiEdhpzpRNaVQZ45A=s287-w287-h192-n-k-no-v1", original: "https://lh5.googleusercontent.com/p/AF1QipOwuJRXnGpFCcdReHqXWvefiEdhpzpRNaVQZ45A=s10000" },
        ],
    },
    {
        type: "hotel",
        property_token: "ChoIoYO29Y-gtJSlARoNL2cvMTFzcXgwc3pocRAB",
        data_id: "0x89c25bf19ec3f145:0xa528d100fead81a1",
        name: "Liberty View Brooklyn Hotel",
        link: "http://www.lvbhnyc.com/",
        description: "Low-key rooms, some with Statue of Liberty views, in a relaxed hotel offering parking & breakfast.",
        gps_coordinates: { latitude: 40.6585355, longitude: -74.000547 },
        city: "New York", country: "US",
        check_in_time: "3:00 PM", check_out_time: "11:00 AM",
        price_per_night: { price: "$130", extracted_price: 130, price_before_taxes: "$112", extracted_price_before_taxes: 112 },
        total_price: { price: "$777", extracted_price: 777, price_before_taxes: "$671", extracted_price_before_taxes: 671 },
        deal: "17% less than usual", deal_description: "Deal",
        hotel_class: "3-star hotel", extracted_hotel_class: 3,
        rating: 4.3, reviews: 471,
        reviews_histogram: { "5": 284, "4": 111, "3": 38, "2": 13, "1": 25 },
        location_rating: 3.1, proximity_to_things_to_do_rating: 3.5, proximity_to_transit_rating: 3.5, airport_access_rating: 3.9,
        amenities: ["Free breakfast", "Free Wi‑Fi", "Parking ($)", "Air conditioning", "Fitness center", "Accessible", "Business center", "Kid-friendly", "Smoke-free property"],
        nearby_places: [
            { name: "25 St", transportations: [{ type: "Walking", duration: "5 min" }] },
            { name: "John F. Kennedy International Airport", transportations: [{ type: "Taxi", duration: "38 min" }, { type: "Public Transport", duration: "1 hr 21 min" }] },
        ],
        images: [
            { thumbnail: "https://lh3.googleusercontent.com/p/AF1QipM1Hx9AS35BVy1SCWpsGx6HpGDu7GtCn64mI5Qf=s287-w287-h192-n-k-no-v1", original: "https://lh5.googleusercontent.com/p/AF1QipM1Hx9AS35BVy1SCWpsGx6HpGDu7GtCn64mI5Qf=s10000" },
            { thumbnail: "https://lh3.googleusercontent.com/p/AF1QipNRUjyxXpf-yyYxFIugiT0qDS3PIamzW6vcu_Ir=s287-w287-h192-n-k-no-v1", original: "https://lh5.googleusercontent.com/p/AF1QipNRUjyxXpf-yyYxFIugiT0qDS3PIamzW6vcu_Ir=s10000" },
        ],
    },
    {
        type: "hotel",
        property_token: "ChgI06Tw-bqdssnTARoLL2cvMXRmMXBya3MQAQ",
        data_id: "0x89c259a43372d8af:0xd392c8ebaf3c1253",
        name: "Heritage Hotel New York City",
        link: "http://www.heritagehotelnyc.com/",
        description: "Modern hotel offering laid-back rooms, a business center & a gym, plus free breakfast & Wi-Fi.",
        gps_coordinates: { latitude: 40.743278, longitude: -73.99011 },
        city: "New York", country: "US",
        check_in_time: "3:00 PM", check_out_time: "11:00 AM",
        price_per_night: { price: "$141", extracted_price: 141, price_before_taxes: "$123", extracted_price_before_taxes: 123 },
        total_price: { price: "$846", extracted_price: 846, price_before_taxes: "$740", extracted_price_before_taxes: 740 },
        deal: "54% less than usual", deal_description: "Great Deal",
        hotel_class: "2-star hotel", extracted_hotel_class: 2,
        rating: 3.8, reviews: 1310,
        reviews_histogram: { "5": 471, "4": 374, "3": 257, "2": 89, "1": 119 },
        location_rating: 4.9, proximity_to_things_to_do_rating: 4.9, proximity_to_transit_rating: 4.9, airport_access_rating: 4.3,
        amenities: ["Free breakfast", "Free Wi‑Fi", "Parking ($)", "Air conditioning", "Fitness center", "Accessible", "Business center", "Kid-friendly", "Smoke-free property"],
        nearby_places: [
            { name: "Flatiron Building", transportations: [{ type: "Walking", duration: "4 min" }] },
            { name: "John F. Kennedy International Airport", transportations: [{ type: "Taxi", duration: "40 min" }, { type: "Public Transport", duration: "1 hr 3 min" }] },
        ],
        images: [
            { thumbnail: "https://lh3.googleusercontent.com/p/AF1QipOBu4OeJFu3_GEhkYkYfftwtoW0UjT1TID1sDMI=s287-w287-h192-n-k-no-v1", original: "https://lh5.googleusercontent.com/p/AF1QipOBu4OeJFu3_GEhkYkYfftwtoW0UjT1TID1sDMI=s10000" },
            { thumbnail: "https://lh3.googleusercontent.com/p/AF1QipMQcxKrnlIUO8cV-hJctHbIwjOl2rpCzKPeYdJ0=s287-w287-h192-n-k-no-v1", original: "https://lh5.googleusercontent.com/p/AF1QipMQcxKrnlIUO8cV-hJctHbIwjOl2rpCzKPeYdJ0=s10000" },
        ],
    },
    {
        type: "hotel",
        property_token: "ChkI3fPe8MiTq87bARoMasdfkj12AdsXX",
        name: "The Manhattan at Times Square Hotel",
        link: "https://www.manhattanattimessquare.com",
        description: "Classically styled hotel in the heart of Times Square with panoramic city views and modern comforts.",
        gps_coordinates: { latitude: 40.7594, longitude: -73.9887 },
        city: "New York", country: "US",
        check_in_time: "3:00 PM", check_out_time: "12:00 PM",
        price_per_night: { price: "$189", extracted_price: 189, price_before_taxes: "$165", extracted_price_before_taxes: 165 },
        total_price: { price: "$1134", extracted_price: 1134, price_before_taxes: "$990", extracted_price_before_taxes: 990 },
        hotel_class: "4-star hotel", extracted_hotel_class: 4,
        rating: 4.4, reviews: 3250,
        reviews_histogram: { "5": 1800, "4": 900, "3": 350, "2": 100, "1": 100 },
        location_rating: 4.9, proximity_to_things_to_do_rating: 5.0, proximity_to_transit_rating: 4.8, airport_access_rating: 4.2,
        amenities: ["Free Wi‑Fi", "Fitness center", "Bar", "Restaurant", "Room service", "Accessible", "Kid-friendly", "Smoke-free property", "Concierge"],
        images: [
            { thumbnail: "https://lh3.googleusercontent.com/p/AF1QipN2OsOGcnxRtvXcqzC81Qug1HlP82V0xQMsYIFe=s287-w287-h192-n-k-no-v1", original: "https://lh5.googleusercontent.com/p/AF1QipN2OsOGcnxRtvXcqzC81Qug1HlP82V0xQMsYIFe=s10000" },
            { thumbnail: "https://lh3.googleusercontent.com/p/AF1QipMA1JMn9abcu_nezimXAY346pjVHxBywFnBx8SE=s287-w287-h192-n-k-no-v1", original: "https://lh5.googleusercontent.com/p/AF1QipMA1JMn9abcu_nezimXAY346pjVHxBywFnBx8SE=s10000" },
        ],
        nearby_places: [
            { name: "Times Square", transportations: [{ type: "Walking", duration: "2 min" }] },
        ],
    },
    {
        type: "hotel",
        property_token: "ChkI3fPe8MiZ22bARoJasdXXKL99",
        name: "Marriott Marquis New York",
        link: "https://www.marriott.com/hotels/travel/nycmq-new-york-marriott-marquis/",
        description: "Iconic Times Square destination featuring Broadway views, multiple dining venues and a striking atrium.",
        gps_coordinates: { latitude: 40.7579, longitude: -73.9855 },
        city: "New York", country: "US",
        check_in_time: "4:00 PM", check_out_time: "12:00 PM",
        price_per_night: { price: "$299", extracted_price: 299, price_before_taxes: "$265", extracted_price_before_taxes: 265 },
        total_price: { price: "$1794", extracted_price: 1794, price_before_taxes: "$1590", extracted_price_before_taxes: 1590 },
        hotel_class: "5-star hotel", extracted_hotel_class: 5,
        rating: 4.6, reviews: 8700,
        reviews_histogram: { "5": 5000, "4": 2100, "3": 900, "2": 400, "1": 300 },
        location_rating: 5.0, proximity_to_things_to_do_rating: 5.0, proximity_to_transit_rating: 4.9, airport_access_rating: 4.5,
        amenities: ["Free Wi‑Fi", "Pool", "Spa", "Fitness center", "Bar", "Restaurant", "Room service", "Accessible", "Concierge", "Smoke-free property"],
        images: [
            { thumbnail: "https://lh3.googleusercontent.com/p/AF1QipMig8I9PaP3SRIVRbhYITmalj40dcfJKM3X1P6I=s287-w287-h192-n-k-no-v1", original: "https://lh5.googleusercontent.com/p/AF1QipMig8I9PaP3SRIVRbhYITmalj40dcfJKM3X1P6I=s10000" },
            { thumbnail: "https://lh3.googleusercontent.com/p/AF1QipOSlq_hTSHCcCPvhZ9u0lImJVrIiFphlOub8oCD=s287-w287-h192-n-k-no-v1", original: "https://lh5.googleusercontent.com/p/AF1QipOSlq_hTSHCcCPvhZ9u0lImJVrIiFphlOub8oCD=s10000" },
        ],
        nearby_places: [
            { name: "Times Square", transportations: [{ type: "Walking", duration: "1 min" }] },
        ],
    },
    {
        type: "hotel",
        property_token: "ChkI3fPe8Mipp0bARoNL2cvMXFYmKLoo",
        name: "The Standard High Line",
        link: "https://www.standardhotels.com/new-york/properties/high-line",
        description: "Trendy Chelsea hotel straddling the iconic High Line with stunning Hudson River and city skyline views.",
        gps_coordinates: { latitude: 40.7424, longitude: -74.0074 },
        city: "New York", country: "US",
        check_in_time: "3:00 PM", check_out_time: "12:00 PM",
        price_per_night: { price: "$245", extracted_price: 245, price_before_taxes: "$218", extracted_price_before_taxes: 218 },
        total_price: { price: "$1470", extracted_price: 1470, price_before_taxes: "$1308", extracted_price_before_taxes: 1308 },
        hotel_class: "4-star hotel", extracted_hotel_class: 4,
        rating: 4.5, reviews: 2890,
        reviews_histogram: { "5": 1700, "4": 750, "3": 280, "2": 90, "1": 70 },
        location_rating: 4.8, proximity_to_things_to_do_rating: 4.7, proximity_to_transit_rating: 4.6, airport_access_rating: 4.1,
        amenities: ["Free Wi‑Fi", "Pool", "Bar", "Restaurant", "Fitness center", "Parking ($)", "Pet-friendly", "Smoke-free property"],
        images: [
            { thumbnail: "https://lh3.googleusercontent.com/p/AF1QipOP1uI_JWDlF7_UUZaotWx70HB8Hjg2j8bfPnI6=s287-w287-h192-n-k-no-v1", original: "https://lh5.googleusercontent.com/p/AF1QipOP1uI_JWDlF7_UUZaotWx70HB8Hjg2j8bfPnI6=s10000" },
            { thumbnail: "https://lh3.googleusercontent.com/p/AF1QipPP0k1r3hlkgUIgK4ibFHlvAwOWn1R-BBKjA3YW=s287-w287-h192-n-k-no-v1", original: "https://lh5.googleusercontent.com/p/AF1QipPP0k1r3hlkgUIgK4ibFHlvAwOWn1R-BBKjA3YW=s10000" },
        ],
        nearby_places: [
            { name: "High Line", transportations: [{ type: "Walking", duration: "1 min" }] },
        ],
    },
];

// Generate additional mock hotels for pagination demo
function generateMoreHotels(page: number): Hotel[] {
    const names = [
        "Park Hyatt New York", "The Plaza Hotel", "Four Seasons Hotel New York",
        "The Ritz-Carlton New York", "New York Hilton Midtown", "InterContinental New York Barclay",
        "The Westin New York Grand Central", "Hyatt Regency Grand Central New York",
        "Dream Midtown New York", "citizenM New York Times Square",
        "Pod 51 Hotel New York City", "The Lexington Hotel",
        "Hotel 48LEX New York", "The Giraffe Hotel",
    ];
    const descriptions = [
        "Elegant rooms with spectacular skyline views and world-class amenities.",
        "Sophisticated urban retreat featuring contemporary design and artisan dining.",
        "Award-winning service in the heart of Manhattan's most vibrant neighborhood.",
        "Boutique property combining modern comfort with timeless New York character.",
    ];

    return names.map((name, i) => ({
        type: "hotel" as const,
        property_token: `mock_page${page}_token_${i}`,
        name,
        description: descriptions[i % descriptions.length],
        gps_coordinates: {
            latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
            longitude: -74.006 + (Math.random() - 0.5) * 0.1,
        },
        city: "New York",
        country: "US",
        check_in_time: "3:00 PM",
        check_out_time: "12:00 PM",
        price_per_night: {
            price: `$${120 + i * 15 + page * 5}`,
            extracted_price: 120 + i * 15 + page * 5,
            price_before_taxes: `$${100 + i * 12 + page * 4}`,
            extracted_price_before_taxes: 100 + i * 12 + page * 4,
        },
        total_price: {
            price: `$${720 + i * 90 + page * 30}`,
            extracted_price: 720 + i * 90 + page * 30,
            price_before_taxes: `$${600 + i * 72 + page * 24}`,
            extracted_price_before_taxes: 600 + i * 72 + page * 24,
        },
        hotel_class: `${2 + (i % 4)}-star hotel`,
        extracted_hotel_class: 2 + (i % 4),
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        reviews: Math.floor(100 + Math.random() * 5000),
        location_rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        airport_access_rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        amenities: ["Free Wi‑Fi", "Air conditioning", "Fitness center", "Restaurant"].slice(0, 2 + (i % 3)),
        images: [
            {
                thumbnail: "https://lh3.googleusercontent.com/p/AF1QipNWJQfQecgQ7OdiDozN6xDereE9PGz8PmNwRUbH=s287-w287-h192-n-k-no-v1",
                original: "https://lh5.googleusercontent.com/p/AF1QipNWJQfQecgQ7OdiDozN6xDereE9PGz8PmNwRUbH=s10000",
            },
        ],
        nearby_places: [],
    }));
}

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
