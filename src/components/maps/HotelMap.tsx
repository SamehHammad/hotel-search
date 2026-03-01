//---** Google Map integration with professional marker clustering and custom pin styles **---//

"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";
import { useHotels } from "@/hooks/useHotels";
import { useMapBounds } from "@/hooks/useMapBounds";
import {
    GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_MAP_ID,
    MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM
} from "@/lib/constants";
import { MapPin, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function HotelMap() {
    const t = useTranslations("map");
    const { hotels, loading, mapBounds } = useHotels();
    const { onMapIdle } = useMapBounds();

    const mapRef = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const clustererRef = useRef<MarkerClusterer | null>(null);
    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    const [mapError, setMapError] = useState<string | null>(null);

    const onMapIdleRef = useRef(onMapIdle);
    useEffect(() => {
        onMapIdleRef.current = onMapIdle;
    }, [onMapIdle]);

    //---** Initialize Google Maps and set up libraries **---//
    useEffect(() => {
        if (!mapRef.current || mapInstance) return;

        const initMap = async () => {
            try {
                setOptions({
                    key: GOOGLE_MAPS_API_KEY,
                    v: "weekly",
                });

                //---** Import required libraries from Google Maps SDK **---//
                const [mapsLib] = await Promise.all([
                    importLibrary("maps"),
                    importLibrary("marker")
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
                    styles: [
                        {
                            "featureType": "all",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#7c9bad" }, { "lightness": "-10" }]
                        },
                        {
                            "featureType": "water",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#e9eff1" }]
                        },
                        {
                            "featureType": "landscape",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#f5f8f9" }]
                        }
                    ]
                });

                //---** Listen to Map Idle event to update search bounds **---//
                map.addListener("idle", () => {
                    onMapIdleRef.current(map);
                });

                setMapInstance(map);
            } catch (error) {
                setMapError("Failed to load Google Maps");
                console.error(error);
            }
        };

        initMap();
    }, [mapInstance]);

    //---** Synchronize hotel markers and clustering when data changes **---//
    useEffect(() => {
        if (!mapInstance || loading) return;

        const syncMarkers = async () => {
            //---** Clear previous markers and reset clusterer **---//
            markersRef.current.forEach((marker) => {
                marker.map = null;
            });
            markersRef.current = [];

            if (clustererRef.current) {
                clustererRef.current.clearMarkers();
            }

            //---** Map hotel data to custom advanced markers **---//
            const newMarkers = hotels.map((hotel: import("@/types/hotel.types").Hotel) => {
                const { latitude, longitude } = hotel.gps_coordinates;
                const priceMatch = hotel.price_per_night.price.match(/\d+/);
                const priceValue = priceMatch ? parseInt(priceMatch[0]) : 150;

                const pinElement = document.createElement("div");
                pinElement.className = cn(
                    "relative group cursor-pointer transition-all duration-300",
                    "hover:z-50 hover:scale-110"
                );

                const priceColor = priceValue > 500 ? "bg-brand-dark" : priceValue > 200 ? "bg-primary" : "bg-emerald-600";

                pinElement.innerHTML = `
                    <div class="flex items-center bg-surface rounded-full shadow-2xl border-2 border-border/10 overflow-hidden ring-4 ring-black/5">
                        <div class="${priceColor} px-2 h-9 flex items-center justify-center text-white">
                             <span class="text-[12px] font-black tracking-tight">${hotel.price_per_night.price}</span>
                        </div>
                        <div class="bg-surface px-2.5 h-9 flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-brand-muted/70 group-hover:text-primary transition-colors"><path d="M6 22V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
                        </div>
                    </div>
                    <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-surface"></div>
                `;

                return new google.maps.marker.AdvancedMarkerElement({
                    position: { lat: latitude, lng: longitude },
                    content: pinElement,
                    title: hotel.name,
                });
            });

            markersRef.current = newMarkers;

            //---** Initialize or update the marker clusterer with standard render **---//
            if (clustererRef.current) {
                clustererRef.current.clearMarkers();
                clustererRef.current.addMarkers(newMarkers);
            } else {
                clustererRef.current = new MarkerClusterer({
                    map: mapInstance,
                    markers: newMarkers,
                    algorithm: new SuperClusterAlgorithm({ maxZoom: 15 }),
                });
            }

            //---** Auto-adjust map viewport to fit all markers if no manual bounds exist **---//
            if (hotels.length > 0 && !mapBounds) {
                const bounds = new google.maps.LatLngBounds();
                hotels.forEach((h: any) => {
                    bounds.extend({ lat: h.gps_coordinates.latitude, lng: h.gps_coordinates.longitude });
                });
                mapInstance.fitBounds(bounds, 80);
            }
        };

        syncMarkers();
    }, [hotels, mapInstance, mapBounds, loading]);

    //---** Render error state if map failes to initialize **---//
    if (mapError) {
        return (
            <div className="w-full h-full min-h-[400px] bg-surface-muted rounded-3xl flex items-center justify-center flex-col text-brand-muted">
                <MapPin className="w-8 h-8 opacity-50 mb-3" />
                <p>{mapError}</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full min-h-[400px] bg-surface-muted rounded-3xl overflow-hidden shadow-sm border border-border isolation-isolate">
            {/*---** Google Maps Rendering Layer **---*/}
            <div ref={mapRef} className="w-full h-full absolute inset-0 rounded-3xl outline-none" />

            {/*---** Custom Floating Zoom Controls **---*/}
            <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
                <button
                    onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 0) + 1)}
                    className="w-10 h-10 bg-surface rounded-xl shadow-xl flex items-center justify-center text-brand-muted hover:bg-surface-muted active:scale-95 transition-all border border-border font-bold"
                >+</button>
                <button
                    onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 0) - 1)}
                    className="w-10 h-10 bg-surface rounded-xl shadow-xl flex items-center justify-center text-brand-muted hover:bg-surface-muted active:scale-95 transition-all border border-border font-bold"
                >-</button>
            </div>

            {/*---** Loading indicator reflecting active API state **---*/}
            {loading && (
                <div className="absolute top-4 inset-x-0 mx-auto w-fit bg-surface/95 backdrop-blur-md shadow-lg rounded-full px-4 py-2 flex items-center gap-2.5 z-10 border border-border">
                    <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-sm font-semibold text-brand-muted">{t("updateOnMove")}</span>
                </div>
            )}

            {/*---** Result summary badge showing total properties in view **---*/}
            {!loading && hotels.length > 0 && (
                <div className="absolute bottom-6 left-6 bg-brand-dark text-white shadow-2xl rounded-2xl px-4 py-2.5 z-10 flex items-center gap-3 border border-primary/20">
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    <span className="text-[13px] font-black tracking-tight">
                        {hotels.length} <span className="opacity-70 font-bold ml-1">{t("markersLoaded")}</span>
                    </span>
                </div>
            )}
        </div>
    );
}
