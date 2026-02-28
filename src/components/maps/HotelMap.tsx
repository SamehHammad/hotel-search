//---** Google Map integration with professional marker clustering and custom pin styles **---//

"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";
import { useHotels } from "@/hooks/useHotels";
import { useMapBounds } from "@/hooks/useMapBounds";
import { GOOGLE_MAPS_API_KEY, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/constants";
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

    //---** Initialize Google Maps and set up libraries **---//
    useEffect(() => {
        if (!mapRef.current) return;

        const initMap = async () => {
            try {
                setOptions({
                    key: GOOGLE_MAPS_API_KEY,
                    v: "weekly",
                    libraries: ["marker"],
                });

                //---** Import required libraries from Google Maps SDK **---//
                const coreLibrary = await importLibrary("maps") as google.maps.MapsLibrary;

                const map = new coreLibrary.Map(mapRef.current!, {
                    center: MAP_DEFAULT_CENTER,
                    zoom: MAP_DEFAULT_ZOOM,
                    mapId: "4b97143a4192b005", // Better to use a valid map ID for AdvancedMarkers
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
                    onMapIdle(map);
                });

                setMapInstance(map);
            } catch (error) {
                setMapError("Failed to load Google Maps");
                console.error(error);
            }
        };

        const timer = setTimeout(initMap, 500); // Small delay to avoid race conditions
        return () => clearTimeout(timer);
    }, [onMapIdle]);

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

                //---** Create custom HTML element for the price pin **---//
                const pinElement = document.createElement("div");
                pinElement.className = cn(
                    "relative group cursor-pointer transition-all duration-300",
                    "hover:z-50 hover:scale-110"
                );

                //---** Determine dynamic color theme based on price range **---//
                const priceColor = priceValue > 500 ? "bg-[#051c34]" : priceValue > 200 ? "bg-indigo-600" : "bg-emerald-600";

                pinElement.innerHTML = `
                    <div class="flex items-center bg-white rounded-full shadow-2xl border-2 border-slate-100/10 overflow-hidden ring-4 ring-black/5">
                        <div class="${priceColor} px-2 h-9 flex items-center justify-center text-white">
                             <span class="text-[12px] font-black tracking-tight">${hotel.price_per_night.price}</span>
                        </div>
                        <div class="bg-white px-2.5 h-9 flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400 group-hover:text-primary transition-colors"><path d="M6 22V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
                        </div>
                    </div>
                    <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
                `;

                const marker = new google.maps.marker.AdvancedMarkerElement({
                    position: { lat: latitude, lng: longitude },
                    content: pinElement,
                    title: hotel.name,
                });

                return marker;
            });

            markersRef.current = newMarkers;

            //---** Initialize or update the marker clusterer **---//
            if (!clustererRef.current) {
                clustererRef.current = new MarkerClusterer({
                    map: mapInstance,
                    markers: newMarkers,
                    algorithm: new SuperClusterAlgorithm({ maxZoom: 15 }),
                    renderer: {
                        render: ({ count, position }) => {
                            const clusterDiv = document.createElement("div");
                            clusterDiv.className = "relative group cursor-pointer animate-in zoom-in-50 duration-300";
                            clusterDiv.innerHTML = `
                                <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1.5 shadow-2xl ring-4 ring-primary/10 border-2 border-slate-100">
                                    <div class="w-full h-full bg-indigo-600 rounded-full flex flex-col items-center justify-center text-white">
                                        <span class="text-[14px] font-black leading-none">${count}</span>
                                        <span class="text-[8px] font-bold opacity-80 uppercase scale-75">Hotels</span>
                                    </div>
                                </div>
                                <div class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                            `;
                            return new google.maps.marker.AdvancedMarkerElement({
                                position,
                                content: clusterDiv,
                                zIndex: 1000 + (count as number),
                            });
                        }
                    }
                });
            } else {
                clustererRef.current.addMarkers(newMarkers);
            }

            //---** Auto-adjust map viewport to fit all markers if no manual bounds exist **---//
            if (hotels.length > 0 && !mapBounds) {
                const bounds = new google.maps.LatLngBounds();
                hotels.forEach((h: import("@/types/hotel.types").Hotel) => {
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
            <div className="w-full h-full min-h-[400px] bg-slate-100 rounded-3xl flex items-center justify-center flex-col text-slate-500">
                <MapPin className="w-8 h-8 opacity-50 mb-3" />
                <p>{mapError}</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full min-h-[400px] bg-slate-100 rounded-3xl overflow-hidden shadow-sm border border-slate-200 isolation-isolate">
            {/*---** Google Maps Rendering Layer **---*/}
            <div ref={mapRef} className="w-full h-full absolute inset-0 rounded-3xl outline-none" />

            {/*---** Custom Floating Zoom Controls **---*/}
            <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
                <button
                    onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 0) + 1)}
                    className="w-10 h-10 bg-white rounded-xl shadow-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all border border-slate-100 font-bold"
                >+</button>
                <button
                    onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 0) - 1)}
                    className="w-10 h-10 bg-white rounded-xl shadow-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all border border-slate-100 font-bold"
                >-</button>
            </div>

            {/*---** Loading indicator reflecting active API state **---*/}
            {loading && (
                <div className="absolute top-4 inset-x-0 mx-auto w-fit bg-white/95 backdrop-blur-md shadow-lg rounded-full px-4 py-2 flex items-center gap-2.5 z-10 border border-indigo-50/50">
                    <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                    <span className="text-sm font-semibold text-slate-700">{t("updateOnMove")}</span>
                </div>
            )}

            {/*---** Result summary badge showing total properties in view **---*/}
            {!loading && hotels.length > 0 && (
                <div className="absolute bottom-6 left-6 bg-[#051c34] text-white shadow-2xl rounded-2xl px-4 py-2.5 z-10 flex items-center gap-3 border border-indigo-500/20">
                    <div className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
                    <span className="text-[13px] font-black tracking-tight">
                        {hotels.length} <span className="opacity-70 font-bold ml-1">{t("markersLoaded")}</span>
                    </span>
                </div>
            )}
        </div>
    );
}
