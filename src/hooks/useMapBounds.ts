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

    //---** Track previous center/zoom so we can ignore zoom-only idle events **---//
    const prevZoomRef = useRef<number | null>(null);
    const prevCenterRef = useRef<{ lat: number; lng: number } | null>(null);

    //---** When true, idle events are silently dropped (used during initial fitBounds) **---//
    const suppressRef = useRef<boolean>(true);

    //---** Called by HotelMap once fitBounds has been applied and the map is ready **---//
    const enableIdleUpdates = useCallback(() => {
        suppressRef.current = false;
    }, []);

    //---** Debounced handler for map idle events to extract boundary coordinates **---//
    const onMapIdle = useCallback(
        (map: google.maps.Map) => {
            //---** Ignore idle events that fire before the map has been properly positioned **---//
            if (suppressRef.current) return;

            const currentZoom = map.getZoom() ?? null;
            const center = map.getCenter();
            const currentCenter = center ? { lat: center.lat(), lng: center.lng() } : null;

            //---** Skip bounds update if this idle was triggered purely by zooming, not panning **---//
            const zoomChanged = prevZoomRef.current !== null && prevZoomRef.current !== currentZoom;
            const centerMoved =
                !prevCenterRef.current ||
                !currentCenter ||
                Math.abs(prevCenterRef.current.lat - currentCenter.lat) > 0.001 ||
                Math.abs(prevCenterRef.current.lng - currentCenter.lng) > 0.001;

            prevZoomRef.current = currentZoom;
            prevCenterRef.current = currentCenter;

            if (zoomChanged && !centerMoved) return;

            if (timerRef.current) clearTimeout(timerRef.current);

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

                setBounds(boundsObj);

                //---** Synchronize new boundaries with URL parameters for persistence **---//
                const params = new URLSearchParams(searchParams.toString());
                const newBoundsStr = `${boundsObj.north.toFixed(6)},${boundsObj.south.toFixed(6)},${boundsObj.east.toFixed(6)},${boundsObj.west.toFixed(6)}`;

                if (params.get("bounds") !== newBoundsStr) {
                    params.set("bounds", newBoundsStr);
                    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                }
            }, 800);
        },
        [setBounds, searchParams, pathname, router]
    );

    return { onMapIdle, enableIdleUpdates };
}
