//---** useMapBounds: extracts and debounces Google Map viewport boundaries for search filtering **---//

"use client";

import { useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import useHotelsStore from "@/store/hotels.store";
import type { Bounds } from "@/types/search.types";

//---** Custom hook for capturing and syncing map viewport changes to the global state **---//
export function useMapBounds() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const setBounds = useHotelsStore((state) => state.setBounds);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    //---** Debounced handler for map idle events to extract boundary coordinates **---//
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

                //---** Update internal state with new geographic boundaries **---//
                setBounds(boundsObj);

                //---** Synchronize new boundaries with URL parameters for persistence **---//
                const params = new URLSearchParams(searchParams.toString());
                const newBoundsStr = `${boundsObj.north.toFixed(6)},${boundsObj.south.toFixed(6)},${boundsObj.east.toFixed(6)},${boundsObj.west.toFixed(6)}`;

                //---** Prevent redundant URL updates and animation loops **---//
                if (params.get("bounds") !== newBoundsStr) {
                    params.set("bounds", newBoundsStr);
                    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                }
            }, 800);
        },
        [setBounds, searchParams, pathname, router]
    );

    return { onMapIdle };
}
