//---** useHotels: orchestrates hotel fetching with store integration and URL synchronization **---//

import { useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useHotelsStore from "@/store/hotels.store";
import useWishlistStore from "@/store/wishlist.store";
import { useShallow } from "zustand/react/shallow";

//---** Custom hook for managing hotel search state and database interactions **---//
export function useHotels() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const {
        hotels,
        loading,
        error,
        pagination,
        mapBounds,
        filters,
        isFetchingMore,
        fetchHotels,
        setFilters,
        appendHotels,
        resetHotels,
    } = useHotelsStore(
        useShallow((state) => ({
            hotels: state.hotels,
            loading: state.loading,
            error: state.error,
            pagination: state.pagination,
            mapBounds: state.mapBounds,
            filters: state.filters,
            isFetchingMore: state.isFetchingMore,
            fetchHotels: state.fetchHotels,
            setFilters: state.setFilters,
            appendHotels: state.appendHotels,
            resetHotels: state.resetHotels,
        }))
    );

    //---** Synchronize internal filter state with URL parameters for deep linking **---//
    useEffect(() => {
        if (!filters.q && !filters.is_wishlist) return;

        const params = new URLSearchParams();
        if (filters.q && !filters.is_wishlist) {
            params.set("q", filters.q);
        }
        if (filters.is_wishlist) {
            params.set("wishlist", "true");
        }
        params.set("adults", filters.guests.adults.toString());
        params.set("children", filters.guests.children.toString());
        if (filters.rooms && filters.rooms.length > 0) {
            params.set("rooms_count", filters.rooms.length.toString());
        }

        if (filters.check_in_date) params.set("check_in_date", filters.check_in_date);
        if (filters.check_out_date) params.set("check_out_date", filters.check_out_date);
        if (filters.min_price) params.set("min_price", filters.min_price.toString());
        if (filters.max_price && filters.max_price < 2000) params.set("max_price", filters.max_price.toString());
        if (filters.hotel_stars?.length) params.set("stars", filters.hotel_stars.join(","));
        if (filters.amenities?.length) params.set("amenities", filters.amenities.join(","));
        if (filters.property_name) params.set("property_name", filters.property_name);

        if (filters.bounds) {
            const b = filters.bounds;
            params.set("bounds", `${b.north},${b.south},${b.east},${b.west}`);
        }

        const newUrl = `${pathname}?${params.toString()}`;
        if (window.location.search !== `?${params.toString()}`) {
            router.replace(newUrl, { scroll: false });
        }
    }, [filters, pathname, router]);

    //---** Load filters from URL parameters into internal store state on mount or URL change **---//
    useEffect(() => {
        const isWishlistMode = searchParams.get("wishlist") === "true";
        const qParam = searchParams.get("q");
        const q = qParam || (isWishlistMode ? "Wishlist" : null);

        if (!q && !isWishlistMode) {
            resetHotels();
            return;
        }

        const wishlistTokens = isWishlistMode ? useWishlistStore.getState().wishlist : undefined;

        const adults = parseInt(searchParams.get("adults") || "2", 10);
        const children = parseInt(searchParams.get("children") || "0", 10);
        const rooms_count = parseInt(searchParams.get("rooms_count") || "1", 10);
        const min_price = parseInt(searchParams.get("min_price") || "0", 10);
        const max_price = parseInt(searchParams.get("max_price") || "2000", 10);
        const stars = searchParams.get("stars")?.split(",").map(Number).filter(n => !isNaN(n)) || [];
        const amenities = searchParams.get("amenities")?.split(",").filter(Boolean) || [];
        const property_name = searchParams.get("property_name") || "";

        //---** Map basic guest counts to a room configuration structure **---//
        const adultsPerRoom = Math.max(1, Math.floor(adults / rooms_count));
        const rooms = Array.from({ length: rooms_count }, () => ({
            adults: adultsPerRoom,
            children: 0,
        }));

        const boundsParam = searchParams.get("bounds");
        const bounds = boundsParam ? {
            north: parseFloat(boundsParam.split(",")[0]),
            south: parseFloat(boundsParam.split(",")[1]),
            east: parseFloat(boundsParam.split(",")[2]),
            west: parseFloat(boundsParam.split(",")[3]),
        } : null;

        const storeFilters = useHotelsStore.getState().filters;

        //---** Validate state changes before triggering a new fetch cycle **---//
        const hasChanged =
            q !== storeFilters.q ||
            adults !== storeFilters.guests.adults ||
            children !== storeFilters.guests.children ||
            rooms_count !== (storeFilters.rooms?.length ?? 1) ||
            min_price !== (storeFilters.min_price || 0) ||
            max_price !== (storeFilters.max_price || 2000) ||
            JSON.stringify(stars.sort()) !== JSON.stringify((storeFilters.hotel_stars || []).sort()) ||
            JSON.stringify(amenities.sort()) !== JSON.stringify((storeFilters.amenities || []).sort()) ||
            property_name !== (storeFilters.property_name || "") ||
            JSON.stringify(bounds) !== JSON.stringify(storeFilters.bounds) ||
            JSON.stringify(wishlistTokens?.sort() || []) !== JSON.stringify((storeFilters.wishlist_tokens || []).sort()) ||
            isWishlistMode !== (storeFilters.is_wishlist || false);

        if (!hasChanged) return;

        if (bounds && !mapBounds) {
            useHotelsStore.getState().setBounds(bounds);
        }

        setFilters({
            q: q || "Wishlist",
            check_in_date: searchParams.get("check_in_date") || undefined,
            check_out_date: searchParams.get("check_out_date") || undefined,
            guests: { adults, children },
            rooms,
            min_price,
            max_price,
            hotel_stars: stars,
            amenities,
            property_name,
            bounds,
            wishlist_tokens: wishlistTokens,
            is_wishlist: isWishlistMode,
        });

        fetchHotels();
    }, [searchParams, fetchHotels, setFilters, resetHotels, mapBounds]);

    return {
        hotels,
        loading,
        error,
        pagination,
        mapBounds,
        filters,
        isFetchingMore,
        fetchHotels,
        setFilters,
        appendHotels,
    };
}
