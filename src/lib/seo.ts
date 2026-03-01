//---** SEO helpers: generateMetadata factory and JSON-LD schema builders **---//

import type { Metadata } from "next";
import { SITE_NAME } from "./constants";

interface SeoConfig {
    title: string;
    description: string;
    path: string;
    locale: string;
}

/** Generate standard Next.js page metadata */
export function buildMetadata({
    title,
    description,
    path,
    locale,
}: SeoConfig): Metadata {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotelsearch.app"}/${locale}${path}`;

    return {
        title: `${title} | ${SITE_NAME}`,
        description,
        manifest: "/site.webmanifest",
        icons: {
            icon: "/favicon.ico",
            shortcut: "/shortcut-icon.png",
            apple: "/apple-touch-icon.png",
        },
        alternates: {
            canonical: url,
            languages: {
                en: url.replace(`/${locale}`, "/en"),
                ar: url.replace(`/${locale}`, "/ar"),
            },
        },
        openGraph: {
            title: `${title} | ${SITE_NAME}`,
            description,
            url,
            siteName: SITE_NAME,
            locale: locale === "ar" ? "ar_SA" : "en_US",
            type: "website",
            images: [
                {
                    url: "/og-image.jpg",
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | ${SITE_NAME}`,
            description,
            images: ["/og-image.jpg"],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
    };
}

/** JSON-LD LodgingBusiness schema for hotel list pages */
export function buildHotelListJsonLd(
    query: string,
    totalResults: number
): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "SearchResultsPage",
        "name": `Hotels in ${query}`,
        "description": `Find ${totalResults} hotels in ${query}`,
        "url": `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotelsearch.app"}/en/hotels?q=${encodeURIComponent(query)}`,
    };
}

/** JSON-LD LodgingBusiness schema for a single hotel */
export function buildHotelJsonLd(hotel: {
    name: string;
    rating?: number;
    reviews?: number;
    price_per_night: { price: string };
    gps_coordinates: { latitude: number; longitude: number };
}): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "Hotel",
        "name": hotel.name,
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": hotel.gps_coordinates.latitude,
            "longitude": hotel.gps_coordinates.longitude,
        },
        ...(hotel.rating && {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": hotel.rating,
                "reviewCount": hotel.reviews ?? 0,
                "bestRating": 5,
                "worstRating": 1,
            },
        }),
        "priceRange": hotel.price_per_night.price,
    };
}
