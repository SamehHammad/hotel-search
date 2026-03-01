//---** Google Map integration with stable markers that persist through zoom and remount **---//

"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { useHotels } from "@/hooks/useHotels";
import { useMapBounds } from "@/hooks/useMapBounds";
import {
    GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_MAP_ID,
    MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM
} from "@/lib/constants";
import { MapPin } from "lucide-react";
import { MapMarkers } from "./MapMarkers";
import { MapControls } from "./MapControls";

// ─── Component ────────────────────────────────────────────────────────────────
export function HotelMap() {
    const { hotels, loading, mapBounds } = useHotels();
    const { onMapIdle, enableIdleUpdates } = useMapBounds();

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const [mapError, setMapError] = useState<string | null>(null);

    //---** Per-mount flag: have we called fitBounds for this instance yet? **---//
    const boundsInitialized = useRef(false);

    const onMapIdleRef = useRef(onMapIdle);
    const enableIdleUpdatesRef = useRef(enableIdleUpdates);
    useEffect(() => { onMapIdleRef.current = onMapIdle; }, [onMapIdle]);
    useEffect(() => { enableIdleUpdatesRef.current = enableIdleUpdates; }, [enableIdleUpdates]);

    // ── Initialize Google Maps ───────────────────────────────────────────────
    useEffect(() => {
        if (!mapRef.current || mapInstance) return;

        const initMap = async () => {
            try {
                setOptions({ key: GOOGLE_MAPS_API_KEY, v: "weekly" });

                const [mapsLib] = await Promise.all([
                    importLibrary("maps"),
                    importLibrary("marker"),
                ]) as [google.maps.MapsLibrary, google.maps.MarkerLibrary];

                if (mapInstance) return;

                const map = new mapsLib.Map(mapRef.current!, {
                    center: MAP_DEFAULT_CENTER,
                    zoom: MAP_DEFAULT_ZOOM,
                    mapId: GOOGLE_MAPS_MAP_ID,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    zoomControl: false,
                    gestureHandling: "greedy",
                    clickableIcons: false,
                    styles: [
                        { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#7c9bad" }, { lightness: "-10" }] },
                        { featureType: "water", elementType: "geometry", stylers: [{ color: "#e9eff1" }] },
                        { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f8f9" }] },
                    ],
                });

                map.addListener("idle", () => onMapIdleRef.current(map));

                setMapInstance(map);
            } catch (err) {
                setMapError("Failed to load Google Maps");
                console.error(err);
            }
        };

        initMap();
    }, [mapInstance]);

    // ── Error state ──────────────────────────────────────────────────────────
    if (mapError) {
        return (
            <div className="w-full h-full min-h-[400px] bg-surface-muted rounded-3xl flex items-center justify-center flex-col text-brand-muted">
                <MapPin className="w-8 h-8 opacity-50 mb-3" />
                <p>{mapError}</p>
            </div>
        );
    }

    return (
        <div
            ref={mapContainerRef}
            className="relative w-full h-full min-h-[400px] bg-surface-muted rounded-3xl overflow-hidden shadow-sm border border-border"
        >
            {/* Google Maps canvas */}
            <div ref={mapRef} className="w-full h-full absolute inset-0 rounded-3xl outline-none" />

            {/* Map markers and tooltips */}
            <MapMarkers
                hotels={hotels}
                mapInstance={mapInstance}
                loading={loading}
                mapContainerRef={mapContainerRef}
                mapBoundsInitialized={boundsInitialized}
                enableIdleUpdatesRef={enableIdleUpdatesRef}
            />

            {/* Map controls and UI overlays */}
            <MapControls
                mapInstance={mapInstance}
                loading={loading}
                hotels={hotels}
            />
        </div>
    );
}
