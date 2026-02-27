//---** useMapBounds: extracts and debounces Google Map bounds on changes **---//

"use client";

import { useCallback, useRef } from "react";
import useHotelsStore from "@/store/hotels.store";
import type { Bounds } from "@/types/search.types";

/**
 * Returns a handler to call when the Google Map idles.
 * Debounces bounds extraction to avoid over-fetching on rapid interactions.
 */
export function useMapBounds() {
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

                const bounds: Bounds = {
                    north: ne.lat(),
                    south: sw.lat(),
                    east: ne.lng(),
                    west: sw.lng(),
                };

                setBounds(bounds);
            }, 600);
        },
        [setBounds]
    );

    return { onMapIdle };
}
