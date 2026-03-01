//---** Google Map integration with stable markers that persist through zoom and remount **---//

"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { useHotels } from "@/hooks/useHotels";
import { useMapBounds } from "@/hooks/useMapBounds";
import {
    GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_MAP_ID,
    MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM
} from "@/lib/constants";
import { MapPin, RefreshCw } from "lucide-react";
import type { Hotel } from "@/types/hotel.types";

// ─── Shared tooltip overlay (singleton, lives outside all marker elements) ─────
function createTooltipEl(): HTMLDivElement {
    const el = document.createElement("div");
    el.style.cssText = `
        position: absolute;
        z-index: 200;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.18s ease, transform 0.18s ease;
        transform: translateX(-50%) translateY(6px);
        width: 208px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 48px rgba(0,0,0,0.18);
        border: 1px solid rgba(0,0,0,0.07);
        overflow: hidden;
    `;
    el.innerHTML = `
        <div style="position:relative;height:112px;background:#f1f5f9;">
            <img class="tt-img" style="width:100%;height:100%;object-fit:cover;" />
            <div style="position:absolute;top:8px;right:8px;background:rgba(255,255,255,0.93);backdrop-filter:blur(6px);padding:2px 7px;border-radius:999px;display:flex;align-items:center;gap:3px;box-shadow:0 2px 8px rgba(0,0,0,0.12);">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1l3.09-6.27z"/></svg>
                <span class="tt-rating" style="font-size:10px;font-weight:900;color:#1e293b;"></span>
            </div>
        </div>
        <div style="padding:10px 12px;background:white;">
            <p class="tt-name" style="font-size:13px;font-weight:800;color:#1e293b;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:0 0 6px;"></p>
            <div style="display:flex;align-items:center;justify-content:space-between;">
                <span class="tt-price" style="font-size:13px;font-weight:800;"></span>
                <span style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;background:#f1f5f9;padding:2px 6px;border-radius:6px;">/ night</span>
            </div>
        </div>
    `;
    return el;
}

// ─── Fixed-size pin element (NO tooltip inside — keeps anchor point stable) ───
function createPinEl(price: string, priceColor: string): HTMLDivElement {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "position: relative; display: inline-block; cursor: pointer;";

    const pin = document.createElement("div");
    pin.className = "map-pin-inner";
    pin.style.cssText = `
        display: inline-flex;
        align-items: center;
        background: white;
        border-radius: 999px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.16);
        border: 2px solid rgba(0,0,0,0.06);
        overflow: hidden;
        white-space: nowrap;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        will-change: transform;
    `;
    pin.innerHTML = `
        <div style="background:${priceColor};padding:0 10px;height:34px;display:flex;align-items:center;">
            <span style="font-size:12px;font-weight:900;color:white;letter-spacing:-0.02em;">${price}</span>
        </div>
        <div style="background:white;padding:0 9px;height:34px;display:flex;align-items:center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 22V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v18Z"/>
                <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
            </svg>
        </div>
    `;

    const caret = document.createElement("div");
    caret.style.cssText = `
        position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%);
        width: 0; height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid white;
        pointer-events: none;
    `;

    wrapper.appendChild(pin);
    wrapper.appendChild(caret);
    return wrapper;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function HotelMap() {
    const t = useTranslations("map");
    const { hotels, loading, mapBounds } = useHotels();
    const { onMapIdle, enableIdleUpdates } = useMapBounds();

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

    //---** Key: hotel property_token → marker. Allows diff-based sync instead of full teardown **---//
    const markerMapRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());

    const tooltipRef = useRef<HTMLDivElement | null>(null);
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

                //---** Hide tooltip on map interaction **---//
                const hideTooltip = () => {
                    if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
                };
                map.addListener("drag", hideTooltip);
                map.addListener("zoom_changed", hideTooltip);

                //---** Create the shared tooltip overlay and append to map container **---//
                const tooltip = createTooltipEl();
                mapContainerRef.current?.appendChild(tooltip);
                tooltipRef.current = tooltip;

                setMapInstance(map);
            } catch (err) {
                setMapError("Failed to load Google Maps");
                console.error(err);
            }
        };

        initMap();
    }, [mapInstance]);

    // ── Diff-based marker sync + stable fitBounds ────────────────────────────
    useEffect(() => {
        if (!mapInstance || loading) return;

        const tooltip = tooltipRef.current;
        const currentTokens = new Set(hotels.map((h: Hotel) => h.property_token));
        const existingTokens = new Set(markerMapRef.current.keys());

        // 1. Remove markers that are no longer in the result
        existingTokens.forEach((token) => {
            if (!currentTokens.has(token)) {
                const m = markerMapRef.current.get(token);
                if (m) m.map = null;
                markerMapRef.current.delete(token);
            }
        });

        // 2. Add only NEW markers (skip ones already on the map)
        const newHotels = hotels.filter((h: Hotel) => !existingTokens.has(h.property_token));

        newHotels.forEach((hotel: Hotel) => {
            const { latitude, longitude } = hotel.gps_coordinates;

            const hotelThumbnail =
                hotel.images?.[0]?.thumbnail && !hotel.images[0].thumbnail.includes("googleusercontent")
                    ? hotel.images[0].thumbnail
                    : `/hotels/h${(Math.abs(hotel.property_token.length) % 11) + 1}.webp`;

            const priceMatch = hotel.price_per_night.price.match(/\d+/);
            const priceValue = priceMatch ? parseInt(priceMatch[0]) : 150;
            const priceColor = priceValue > 500 ? "#1e293b" : priceValue > 200 ? "#3b82f6" : "#059669";

            const pinEl = createPinEl(hotel.price_per_night.price, priceColor);
            const pinInner = pinEl.querySelector<HTMLElement>(".map-pin-inner");

            pinEl.addEventListener("mouseenter", () => {
                if (!tooltip || !mapContainerRef.current) return;

                const img = tooltip.querySelector<HTMLImageElement>(".tt-img");
                if (img) { img.src = hotelThumbnail; img.onerror = () => { img.src = "/placeholder.jpg"; }; }
                const ratingEl = tooltip.querySelector<HTMLElement>(".tt-rating");
                if (ratingEl) ratingEl.textContent = String(hotel.rating ?? "N/A");
                const nameEl = tooltip.querySelector<HTMLElement>(".tt-name");
                if (nameEl) nameEl.textContent = hotel.name;
                const priceEl = tooltip.querySelector<HTMLElement>(".tt-price");
                if (priceEl) { priceEl.textContent = hotel.price_per_night.price; priceEl.style.color = priceColor; }

                const containerRect = mapContainerRef.current.getBoundingClientRect();
                const pinRect = pinEl.getBoundingClientRect();
                const centerX = pinRect.left + pinRect.width / 2 - containerRect.left;
                const topY = pinRect.top - containerRect.top;

                tooltip.style.left = `${centerX}px`;
                tooltip.style.top = `${topY - 12}px`;
                tooltip.style.transform = "translateX(-50%) translateY(-100%)";
                tooltip.style.opacity = "1";

                pinEl.style.zIndex = "9999";
                if (pinInner) { pinInner.style.transform = "scale(1.12)"; pinInner.style.boxShadow = "0 8px 28px rgba(0,0,0,0.22)"; }
            });

            pinEl.addEventListener("mouseleave", () => {
                if (tooltip) tooltip.style.opacity = "0";
                pinEl.style.zIndex = "";
                if (pinInner) { pinInner.style.transform = "scale(1)"; pinInner.style.boxShadow = ""; }
            });

            const marker = new google.maps.marker.AdvancedMarkerElement({
                position: { lat: latitude, lng: longitude },
                content: pinEl,
                title: hotel.name,
                map: mapInstance,
                collisionBehavior: google.maps.CollisionBehavior.REQUIRED_AND_HIDES_OPTIONAL,
            });

            markerMapRef.current.set(hotel.property_token, marker);
        });

        //---** On EVERY fresh mount of this component instance, fit the viewport to the hotels **---//
        //---** Do NOT check mapBounds — that lives in the store across remounts and is stale **---//
        if (!boundsInitialized.current && hotels.length > 0) {
            boundsInitialized.current = true;

            const bounds = new google.maps.LatLngBounds();
            hotels.forEach((h: Hotel) =>
                bounds.extend({ lat: h.gps_coordinates.latitude, lng: h.gps_coordinates.longitude })
            );

            //---** fitBounds triggers an "idle" event — enable idle updates only after it settles **---//
            mapInstance.fitBounds(bounds, 80);

            //---** Wait for the map to finish animating to the fitted position before accepting idle **---//
            const unlockListener = mapInstance.addListener("idle", () => {
                google.maps.event.removeListener(unlockListener);
                enableIdleUpdatesRef.current();
            });
        }
    }, [hotels, mapInstance, loading]);

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

            {/* Zoom controls */}
            <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
                <button
                    onClick={() => mapInstance?.setZoom((mapInstance.getZoom() ?? 10) + 1)}
                    className="w-10 h-10 bg-surface rounded-xl shadow-xl flex items-center justify-center text-brand-dark hover:bg-surface-muted active:scale-95 transition-all border border-border font-black text-lg"
                    aria-label="Zoom in"
                >+</button>
                <button
                    onClick={() => mapInstance?.setZoom((mapInstance.getZoom() ?? 10) - 1)}
                    className="w-10 h-10 bg-surface rounded-xl shadow-xl flex items-center justify-center text-brand-dark hover:bg-surface-muted active:scale-95 transition-all border border-border font-black text-lg"
                    aria-label="Zoom out"
                >−</button>
            </div>

            {/* Loading indicator */}
            {loading && (
                <div className="absolute top-4 inset-x-0 mx-auto w-fit bg-surface/95 backdrop-blur-md shadow-lg rounded-full px-4 py-2 flex items-center gap-2.5 z-10 border border-border">
                    <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-sm font-semibold text-brand-muted">{t("updateOnMove")}</span>
                </div>
            )}

            {/* Hotel count badge */}
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
