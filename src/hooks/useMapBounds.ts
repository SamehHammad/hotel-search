//---** useMapBounds: extracts and debounces Google Map bounds on changes **---//

"use client";

import { useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import useHotelsStore from "@/store/hotels.store";
import type { Bounds } from "@/types/search.types";

/**
 * Returns a handler to call when the Google Map idles.
 * Debounces bounds extraction to avoid over-fetching on rapid interactions.
 */
export function useMapBounds() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const setBounds = useHotelsStore((state) => state.setBounds);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onMapIdle = useCallback(
        (map: google.maps.Map) => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                const gmapBounds = map.getBounds();
                if (!gmapBounds) return;

                const ne = gmapBounds.getNorthEast();
                const sw = gmapBounds.getSouthWest();

                const boundsObj: Bounds = {
                    north: ne.lat(),
                    south: sw.lat(),
                    east: ne.lng(),
                    west: sw.lng(),
                };

                // Internal state update
                setBounds(boundsObj);

                // URL state update
                const params = new URLSearchParams(searchParams.toString());
                const newBoundsStr = `${boundsObj.north.toFixed(6)},${boundsObj.south.toFixed(6)},${boundsObj.east.toFixed(6)},${boundsObj.west.toFixed(6)}`;

                // Only update if the string has actually changed (prevents micro-update loops)
                if (params.get("bounds") !== newBoundsStr) {
                    params.set("bounds", newBoundsStr);
                    // Use replace to avoid polluting history with every pan/zoom
                    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                }
            }, 800);
        },
        [setBounds, searchParams, pathname, router]
    );

    return { onMapIdle };
}
