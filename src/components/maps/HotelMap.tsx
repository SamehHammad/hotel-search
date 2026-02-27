//---** Google Map integration with marker syncing and idle bounds extraction **---//

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { useHotels } from "@/hooks/useHotels";
import { useMapBounds } from "@/hooks/useMapBounds";
import { GOOGLE_MAPS_API_KEY, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/constants";
import { MapPin, RefreshCw } from "lucide-react";

export function HotelMap() {
    const t = useTranslations("map");
    const { hotels, loading, mapBounds } = useHotels();
    const { onMapIdle } = useMapBounds();

    const mapRef = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    const [mapError, setMapError] = useState<string | null>(null);

    // Initialize Maps
    useEffect(() => {
        if (!mapRef.current) return;

        const initMap = async () => {
            try {
                setOptions({
                    key: GOOGLE_MAPS_API_KEY,
                    v: "weekly",
                    libraries: ["marker"],
                });

                // Initialize libraries
                const coreLibrary = await importLibrary("maps") as google.maps.MapsLibrary;
                const markerLibrary = await importLibrary("marker") as google.maps.MarkerLibrary;

                const map = new coreLibrary.Map(mapRef.current!, {
                    center: MAP_DEFAULT_CENTER,
                    zoom: MAP_DEFAULT_ZOOM,
                    mapId: "DEMO_MAP_ID", // Allows AdvancedMarker testing without valid API map ID
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                    zoomControl: true,
                });

                // Listen to Map Idle event to update bounds (debounced in hook)
                map.addListener("idle", () => {
                    onMapIdle(map);
                });

                setMapInstance(map);
            } catch (error) {
                setMapError("Failed to load Google Maps");
                console.error(error);
            }
        };

        initMap();
    }, [onMapIdle]);

    // Sync Markers with Hotels using AdvancedMarkerElement
    useEffect(() => {
        if (!mapInstance || !window.google?.maps?.marker?.AdvancedMarkerElement || loading) return;

        // Clear old markers
        markersRef.current.forEach((marker) => {
            marker.map = null;
        });
        markersRef.current = [];

        // Create new markers
        hotels.forEach((hotel: import("@/types/hotel.types").Hotel) => {
            const { latitude, longitude } = hotel.gps_coordinates;

            // Custom marker content
            const pricePin = document.createElement("div");
            pricePin.className =
                "bg-white shadow-md border border-slate-200 text-slate-800 font-bold px-3 py-1 rounded-full text-sm shrink-0 whitespace-nowrap whitespace-nowrap transform transition-transform hover:scale-110 hover:z-50 cursor-pointer hover:bg-indigo-600 hover:text-white";
            pricePin.textContent = hotel.price_per_night.price;

            const marker = new google.maps.marker.AdvancedMarkerElement({
                map: mapInstance,
                position: { lat: latitude, lng: longitude },
                content: pricePin,
                title: hotel.name,
            });

            markersRef.current.push(marker);
        });

        // Auto-fit bounds ONLY if there are hotels and we don't have user-driven mapBounds
        // (This helps center the map initially based on search results)
        if (hotels.length > 0 && !mapBounds) {
            const bounds = new google.maps.LatLngBounds();
            hotels.forEach((h: import("@/types/hotel.types").Hotel) => {
                bounds.extend({ lat: h.gps_coordinates.latitude, lng: h.gps_coordinates.longitude });
            });
            // Small buffer
            mapInstance.fitBounds(bounds, 50);
        }

    }, [hotels, mapInstance, mapBounds, loading]);

    if (mapError) {
        return (
            <div className="w-full h-full min-h-[400px] bg-slate-100 rounded-3xl flex items-center justify-center flex-col text-slate-500">
                <MapPin className="w-8 h-8 opacity-50 mb-3" />
                <p>{mapError}</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full min-h-[400px] bg-slate-100 rounded-3xl overflow-hidden shadow-sm border border-slate-200 isolation-isolate">
            {/* Map Container */}
            <div ref={mapRef} className="w-full h-full absolute inset-0 rounded-3xl outline-none" />

            {/* Syncing Overlay Indicator */}
            {loading && (
                <div className="absolute top-4 inset-x-0 mx-auto w-fit bg-white/95 backdrop-blur-md shadow-lg rounded-full px-4 py-2 flex items-center gap-2.5 z-10 border border-indigo-50/50">
                    <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                    <span className="text-sm font-semibold text-slate-700">{t("updateOnMove")}</span>
                </div>
            )}

            {/* Marker count badge */}
            {!loading && hotels.length > 0 && (
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md shadow-md rounded-lg px-3 py-2 z-10 border border-slate-200/50 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                    <span className="text-xs font-bold text-slate-700 tracking-wide">
                        {hotels.length} {t("markersLoaded")}
                    </span>
                </div>
            )}
        </div>
    );
}
