"use client";

import { useEffect, useRef } from "react";
import { importLibrary } from "@googlemaps/js-api-loader";
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

interface MapMarkersProps {
    hotels: Hotel[];
    mapInstance: google.maps.Map | null;
    loading: boolean;
    mapContainerRef: React.RefObject<HTMLDivElement | null>;
    mapBoundsInitialized: React.MutableRefObject<boolean>;
    enableIdleUpdatesRef: React.MutableRefObject<() => void>;
}

export function MapMarkers({
    hotels,
    mapInstance,
    loading,
    mapContainerRef,
    mapBoundsInitialized,
    enableIdleUpdatesRef
}: MapMarkersProps) {
    //---** Key: hotel property_token → marker. Allows diff-based sync instead of full teardown **---//
    const markerMapRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
    const tooltipRef = useRef<HTMLDivElement | null>(null);

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
        if (!mapBoundsInitialized.current && hotels.length > 0) {
            mapBoundsInitialized.current = true;

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
    }, [hotels, mapInstance, loading, mapContainerRef, mapBoundsInitialized, enableIdleUpdatesRef]);

    // ── Initialize tooltip when map is ready ───────────────────────────────────
    useEffect(() => {
        if (!mapInstance || tooltipRef.current) return;

        //---** Create the shared tooltip overlay and append to map container **---//
        const tooltip = createTooltipEl();
        mapContainerRef.current?.appendChild(tooltip);
        tooltipRef.current = tooltip;

        //---** Hide tooltip on map interaction **---//
        const hideTooltip = () => {
            if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
        };
        mapInstance.addListener("drag", hideTooltip);
        mapInstance.addListener("zoom_changed", hideTooltip);

        // Cleanup on unmount
        return () => {
            if (tooltipRef.current && tooltipRef.current.parentNode) {
                tooltipRef.current.parentNode.removeChild(tooltipRef.current);
            }
        };
    }, [mapInstance, mapContainerRef]);

    return null; // This component only manages markers and tooltips, no UI
}
