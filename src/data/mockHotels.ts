import type { Hotel } from "@/types/hotel.types";

export const MOCK_HOTELS: Hotel[] = [
    // --- Cairo, Egypt ---
    {
        type: "hotel",
        property_token: "cairo_1",
        name: "Four Seasons Hotel Cairo at Nile Plaza",
        description: "Luxury hotel overlooking the Nile with elegant decor, multiple pools, and world-class dining.",
        gps_coordinates: { latitude: 30.0366, longitude: 31.2310 },
        city: "Cairo", country: "Egypt",
        check_in_time: "3:00 PM", check_out_time: "12:00 PM",
        price_per_night: { price: "$350", extracted_price: 350, price_before_taxes: "$310", extracted_price_before_taxes: 310 },
        total_price: { price: "$2100", extracted_price: 2100, price_before_taxes: "$1860", extracted_price_before_taxes: 1860 },
        hotel_class: "5-star hotel", extracted_hotel_class: 5,
        rating: 4.8, reviews: 3420,
        amenities: ["Free Wi‑Fi", "Pool", "Spa", "Fitness center", "Nile View", "Restaurant"],
        images: [{ thumbnail: "https://lh3.googleusercontent.com/p/AF1QipM-pX_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s287", original: "https://lh5.googleusercontent.com/p/AF1QipM-pX_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s10000" }],
    },
    {
        type: "hotel",
        property_token: "cairo_2",
        name: "Marriott Mena House, Cairo",
        description: "Historic hotel at the base of the Pyramids, offering lush gardens and classic luxury.",
        gps_coordinates: { latitude: 29.9855, longitude: 31.1328 },
        city: "Cairo", country: "Egypt",
        check_in_time: "2:00 PM", check_out_time: "11:00 AM",
        price_per_night: { price: "$280", extracted_price: 280, price_before_taxes: "$250", extracted_price_before_taxes: 250 },
        total_price: { price: "$1680", extracted_price: 1680, price_before_taxes: "$1500", extracted_price_before_taxes: 1500 },
        hotel_class: "5-star hotel", extracted_hotel_class: 5,
        rating: 4.7, reviews: 5120,
        amenities: ["Pyramid View", "Garden", "Pool", "Free Wi‑Fi", "Restaurant"],
        images: [{ thumbnail: "https://lh3.googleusercontent.com/p/AF1QipM6_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s287", original: "https://lh5.googleusercontent.com/p/AF1QipM6_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s10000" }],
    },

    // --- New York, US ---
    {
        type: "hotel",
        property_token: "nyc_1",
        name: "The Plaza Hotel",
        description: "Iconic luxury hotel at Central Park South, known for its opulent rooms and rich history.",
        gps_coordinates: { latitude: 40.7645, longitude: -73.9744 },
        city: "New York", country: "United States",
        check_in_time: "3:00 PM", check_out_time: "12:00 PM",
        price_per_night: { price: "$850", extracted_price: 850, price_before_taxes: "$750", extracted_price_before_taxes: 750 },
        total_price: { price: "$5100", extracted_price: 5100, price_before_taxes: "$4500", extracted_price_before_taxes: 4500 },
        hotel_class: "5-star hotel", extracted_hotel_class: 5,
        rating: 4.6, reviews: 8900,
        amenities: ["Central Park View", "Spa", "Butlers", "Free Wi‑Fi", "Fine Dining"],
        images: [{ thumbnail: "https://lh3.googleusercontent.com/p/AF1QipO9_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s287", original: "https://lh5.googleusercontent.com/p/AF1QipO9_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s10000" }],
    },

    // --- London, GB ---
    {
        type: "hotel",
        property_token: "london_1",
        name: "The Savoy",
        description: "World-famous hotel on the Strand, offering Edwardian and Art Deco style and impeccable service.",
        gps_coordinates: { latitude: 51.5104, longitude: -0.1204 },
        city: "London", country: "United Kingdom",
        check_in_time: "2:00 PM", check_out_time: "11:00 AM",
        price_per_night: { price: "£450", extracted_price: 580, price_before_taxes: "£400", extracted_price_before_taxes: 520 },
        total_price: { price: "£2700", extracted_price: 3480, price_before_taxes: "£2400", extracted_price_before_taxes: 3120 },
        hotel_class: "5-star hotel", extracted_hotel_class: 5,
        rating: 4.7, reviews: 4500,
        amenities: ["River View", "Afternoon Tea", "History", "Bar", "Spa"],
        images: [{ thumbnail: "https://lh3.googleusercontent.com/p/AF1QipL8_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s287", original: "https://lh5.googleusercontent.com/p/AF1QipL8_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s10000" }],
    },

    // --- Dubai, AE ---
    {
        type: "hotel",
        property_token: "dubai_1",
        name: "Burj Al Arab Jumeirah",
        description: "The world's most luxurious hotel, distinctively sail-shaped and symbolizing modern Dubai.",
        gps_coordinates: { latitude: 25.1412, longitude: 55.1853 },
        city: "Dubai", country: "United Arab Emirates",
        check_in_time: "3:00 PM", check_out_time: "12:00 PM",
        price_per_night: { price: "$1500", extracted_price: 1500, price_before_taxes: "$1300", extracted_price_before_taxes: 1300 },
        total_price: { price: "$9000", extracted_price: 9000, price_before_taxes: "$7800", extracted_price_before_taxes: 7800 },
        hotel_class: "5-star hotel", extracted_hotel_class: 5,
        rating: 4.9, reviews: 12500,
        amenities: ["Private Beach", "Underwater Restaurant", "Spa", "Helipad", "Luxury Cars"],
        images: [{ thumbnail: "https://lh3.googleusercontent.com/p/AF1QipK7_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s287", original: "https://lh5.googleusercontent.com/p/AF1QipK7_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s10000" }],
    },

    // --- Riyadh, SA ---
    {
        type: "hotel",
        property_token: "riyadh_1",
        name: "The Ritz-Carlton, Riyadh",
        description: "Majestic hotel set amidst 52 acres of desert greenery, featuring palatial architecture.",
        gps_coordinates: { latitude: 24.6738, longitude: 46.6293 },
        city: "Riyadh", country: "Saudi Arabia",
        check_in_time: "3:00 PM", check_out_time: "12:00 PM",
        price_per_night: { price: "$400", extracted_price: 400, price_before_taxes: "$350", extracted_price_before_taxes: 350 },
        total_price: { price: "$2400", extracted_price: 2400, price_before_taxes: "$2100", extracted_price_before_taxes: 2100 },
        hotel_class: "5-star hotel", extracted_hotel_class: 5,
        rating: 4.8, reviews: 6200,
        amenities: ["Indoor Pool", "Luxury Spa", "Ballrooms", "Free Wi‑Fi", "Bowling Alley"],
        images: [{ thumbnail: "https://lh3.googleusercontent.com/p/AF1QipJ6_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s287", original: "https://lh5.googleusercontent.com/p/AF1QipJ6_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s10000" }],
    },

    // --- Paris, FR ---
    {
        type: "hotel",
        property_token: "paris_1",
        name: "Hôtel Ritz Paris",
        description: "Opulent hotel in the heart of Paris, synonymous with luxury and elegance since 1898.",
        gps_coordinates: { latitude: 48.8681, longitude: 2.3292 },
        city: "Paris", country: "France",
        check_in_time: "3:00 PM", check_out_time: "12:00 PM",
        price_per_night: { price: "€1100", extracted_price: 1200, price_before_taxes: "€950", extracted_price_before_taxes: 1050 },
        total_price: { price: "€6600", extracted_price: 7200, price_before_taxes: "€5700", extracted_price_before_taxes: 6300 },
        hotel_class: "5-star hotel", extracted_hotel_class: 5,
        rating: 4.7, reviews: 3100,
        amenities: ["Garden", "Spa", "Pool", "Cooking Classes", "Bar Hemingway"],
        images: [{ thumbnail: "https://lh3.googleusercontent.com/p/AF1QipI5_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s287", original: "https://lh5.googleusercontent.com/p/AF1QipI5_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s10000" }],
    },

    // --- Tokyo, JP ---
    {
        type: "hotel",
        property_token: "tokyo_1",
        name: "Park Hyatt Tokyo",
        description: "Sleek hotel occupying the top floors of a skyscraper, offering panoramic views of the city.",
        gps_coordinates: { latitude: 35.6853, longitude: 139.6912 },
        city: "Tokyo", country: "Japan",
        check_in_time: "3:00 PM", check_out_time: "12:00 PM",
        price_per_night: { price: "¥85000", extracted_price: 600, price_before_taxes: "¥75000", extracted_price_before_taxes: 530 },
        total_price: { price: "¥510000", extracted_price: 3600, price_before_taxes: "¥450000", extracted_price_before_taxes: 3180 },
        hotel_class: "5-star hotel", extracted_hotel_class: 5,
        rating: 4.6, reviews: 2900,
        amenities: ["Mount Fuji View", "Spa", "Library", "New York Bar", "Peak Lounge"],
        images: [{ thumbnail: "https://lh3.googleusercontent.com/p/AF1QipH4_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s287", original: "https://lh5.googleusercontent.com/p/AF1QipH4_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s10000" }],
    },

    // --- Istanbul, TR ---
    {
        type: "hotel",
        property_token: "istanbul_1",
        name: "Çırağan Palace Kempinski Istanbul",
        description: "An Ottoman imperial palace and hotel on the shores of the Bosphorus, blending history with luxury.",
        gps_coordinates: { latitude: 41.0435, longitude: 29.0163 },
        city: "Istanbul", country: "Turkey",
        check_in_time: "2:00 PM", check_out_time: "12:00 PM",
        price_per_night: { price: "€400", extracted_price: 430, price_before_taxes: "€350", extracted_price_before_taxes: 380 },
        total_price: { price: "€2400", extracted_price: 2580, price_before_taxes: "€2100", extracted_price_before_taxes: 2280 },
        hotel_class: "5-star hotel", extracted_hotel_class: 5,
        rating: 4.8, reviews: 7800,
        amenities: ["Bosphorus View", "Infinity Pool", "Palace Suites", "Luxury Spa", "Historic charm"],
        images: [{ thumbnail: "https://lh3.googleusercontent.com/p/AF1QipG3_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s287", original: "https://lh5.googleusercontent.com/p/AF1QipG3_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s10000" }],
    },

    // --- Jeddah, SA ---
    {
        type: "hotel",
        property_token: "jeddah_1",
        name: "Waldorf Astoria Jeddah - Qasr Al Sharq",
        description: "An Arabian palace offering ultimate luxury, overlooking the Red Sea.",
        gps_coordinates: { latitude: 21.6015, longitude: 39.1118 },
        city: "Jeddah", country: "Saudi Arabia",
        check_in_time: "3:00 PM", check_out_time: "12:00 PM",
        price_per_night: { price: "$550", extracted_price: 550, price_before_taxes: "$500", extracted_price_before_taxes: 500 },
        total_price: { price: "$3300", extracted_price: 3300, price_before_taxes: "$3000", extracted_price_before_taxes: 3000 },
        hotel_class: "5-star hotel", extracted_hotel_class: 5,
        rating: 4.7, reviews: 1800,
        amenities: ["Red Sea View", "Personal Butler", "Spa", "Indoor Pool", "Fine Dining"],
        images: [{ thumbnail: "https://lh3.googleusercontent.com/p/AF1QipF2_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s287", original: "https://lh5.googleusercontent.com/p/AF1QipF2_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s10000" }],
    },

    // --- Marrakech, MA ---
    {
        type: "hotel",
        property_token: "marrakech_1",
        name: "La Mamounia",
        description: "Iconic hotel in the heart of Marrakech, set in centuries-old royal gardens.",
        gps_coordinates: { latitude: 31.6225, longitude: -7.9985 },
        city: "Marrakech", country: "Morocco",
        check_in_time: "3:00 PM", check_out_time: "12:00 PM",
        price_per_night: { price: "€600", extracted_price: 650, price_before_taxes: "€530", extracted_price_before_taxes: 580 },
        total_price: { price: "€3600", extracted_price: 3900, price_before_taxes: "€3180", extracted_price_before_taxes: 3480 },
        hotel_class: "5-star hotel", extracted_hotel_class: 5,
        rating: 4.8, reviews: 4200,
        amenities: ["Gardens", "Spa", "Pool", "Moroccan Decor", "History"],
        images: [{ thumbnail: "https://lh3.googleusercontent.com/p/AF1QipE1_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s287", original: "https://lh5.googleusercontent.com/p/AF1QipE1_z_Yw8vW7_wJ6t3z9z1z2z3z4z5z6z7=s10000" }],
    },
];

export function generateMoreHotels(
    page: number,
    city: string = "New York",
    country: string = "US",
    lat: number = 40.7128,
    lng: number = -74.0060
): Hotel[] {
    const names = [
        "Grand", "Royal", "Palace", "Plaza", "Hyatt", "Continental",
        "Westin", "Marriott", "Hilton", "Sheraton",
        "Boutique", "Regency", "Lexington", "Garden Inn",
    ];
    const descriptions = [
        "Elegant rooms with spectacular views and world-class amenities.",
        "Sophisticated urban retreat featuring contemporary design.",
        "Award-winning service in the heart of the city.",
        "Combining modern comfort with timeless character.",
    ];

    return names.map((name, i) => ({
        type: "hotel" as const,
        property_token: `mock_page${page}_token_${city.replace(/\s+/g, '_')}_${i}`,
        name: `${name} ${city} ${i + 1}`,
        description: descriptions[i % descriptions.length],
        gps_coordinates: {
            latitude: lat + (Math.random() - 0.5) * 0.1,
            longitude: lng + (Math.random() - 0.5) * 0.1,
        },
        city,
        country,
        check_in_time: i % 2 === 0 ? "3:00 PM" : "2:00 PM",
        check_out_time: i % 2 === 0 ? "12:00 PM" : "11:00 AM",
        price_per_night: {
            price: `$${150 + i * 20 + page * 10}`,
            extracted_price: 150 + i * 20 + page * 10,
            price_before_taxes: `$${130 + i * 18 + page * 8}`,
            extracted_price_before_taxes: 130 + i * 18 + page * 8,
        },
        total_price: {
            price: `$${(150 + i * 20 + page * 10) * 6}`,
            extracted_price: (150 + i * 20 + page * 10) * 6,
            price_before_taxes: `$${(130 + i * 18 + page * 8) * 6}`,
            extracted_price_before_taxes: (130 + i * 18 + page * 8) * 6,
        },
        hotel_class: `${3 + (i % 3)}-star hotel`,
        extracted_hotel_class: 3 + (i % 3),
        rating: Math.round((3.8 + Math.random() * 1.2) * 10) / 10,
        reviews: Math.floor(100 + Math.random() * 5000),
        location_rating: Math.round((4.0 + Math.random() * 1.0) * 10) / 10,
        airport_access_rating: Math.round((3.8 + Math.random() * 1.2) * 10) / 10,
        amenities: [
            "Free Wi-Fi",
            "Breakfast",
            "Pool",
            "Free Parking",
            "Airport Shuttle",
            "Fitness center",
            "Restaurant",
            "Air conditioning"
        ].slice(0, 5 + (i % 4)),
        images: [
            {
                thumbnail: "https://lh3.googleusercontent.com/p/AF1QipNWJQfQecgQ7OdiDozN6xDereE9PGz8PmNwRUbH=s287",
                original: "https://lh5.googleusercontent.com/p/AF1QipNWJQfQecgQ7OdiDozN6xDereE9PGz8PmNwRUbH=s10000",
            },
        ],
        nearby_places: [],
    }));
}
