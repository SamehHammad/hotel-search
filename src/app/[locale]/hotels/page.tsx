//---** Hotels search result page route combining list and map views **---//

import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import HotelsPageClient from "@/components/hotels/HotelsPageClient";
import { fetchHotels } from "@/services/hotels.service";
import { DEFAULT_SEARCH_FILTERS } from "@/lib/constants";
import type { SearchFilters, Bounds } from "@/types/search.types";

//---** Generate dynamic SEO metadata for the hotels page **---//
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "search" });

    return buildMetadata({
        title: t("title"),
        description: t("subtitle"),
        path: "/hotels",
        locale,
    });
}

//---** Main serverside component for the hotels page **---//
export default async function HotelsPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const sp = await searchParams;

    const getStr = (key: string) => {
        const v = sp[key];
        if (Array.isArray(v)) return v[0];
        return v;
    };

    const getNum = (key: string, fallback: number) => {
        const raw = getStr(key);
        if (!raw) return fallback;
        const n = Number(raw);
        return Number.isFinite(n) ? n : fallback;
    };

    const getBool = (key: string) => {
        const raw = getStr(key);
        return raw === "true" || raw === "1";
    };

    const q = getStr("q") ?? DEFAULT_SEARCH_FILTERS.q;
    const adults = Math.max(1, Math.floor(getNum("adults", DEFAULT_SEARCH_FILTERS.guests.adults)));
    const children = Math.max(0, Math.floor(getNum("children", DEFAULT_SEARCH_FILTERS.guests.children)));
    const roomsCount = Math.max(1, Math.floor(getNum("rooms_count", DEFAULT_SEARCH_FILTERS.rooms.length || 1)));

    const rooms = Array.from({ length: roomsCount }, () => ({
        adults: Math.max(1, Math.floor(adults / roomsCount)),
        children: 0,
    }));

    const boundsStr = getStr("bounds");
    const bounds: Bounds | null = boundsStr
        ? (() => {
            const parts = boundsStr.split(",").map((p) => Number(p));
            if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
            return { north: parts[0], south: parts[1], east: parts[2], west: parts[3] };
        })()
        : null;

    const stars = (getStr("stars") ?? "")
        .split(",")
        .map((s) => Number(s))
        .filter((n) => Number.isFinite(n) && n > 0);

    const amenities = (getStr("amenities") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const isWishlistMode = getBool("wishlist");

    const filters: SearchFilters = {
        ...DEFAULT_SEARCH_FILTERS,
        q: q || DEFAULT_SEARCH_FILTERS.q,
        check_in_date: getStr("check_in_date") || undefined,
        check_out_date: getStr("check_out_date") || undefined,
        guests: { adults, children },
        rooms,
        page: 1,
        min_price: getStr("min_price") ? Math.max(0, Math.floor(getNum("min_price", 0))) : undefined,
        max_price: getStr("max_price") ? Math.max(0, Math.floor(getNum("max_price", 2000))) : undefined,
        hotel_stars: stars.length ? stars : undefined,
        amenities: amenities.length ? amenities : undefined,
        property_name: getStr("property_name") || undefined,
        bounds,
        is_wishlist: isWishlistMode || undefined,
    };

    const shouldServerFetch = Boolean(getStr("q") || isWishlistMode);
    const data = shouldServerFetch ? await fetchHotels(filters) : null;

    return (
        <HotelsPageClient
            initialData={
                data
                    ? {
                        hotels: data.properties,
                        pagination: data.pagination,
                        filters,
                    }
                    : undefined
            }
        />
    );
}
