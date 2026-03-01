"use client";

import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import type { Hotel } from "@/types/hotel.types";

interface MapControlsProps {
    mapInstance: google.maps.Map | null;
    loading: boolean;
    hotels: Hotel[];
}

export function MapControls({ mapInstance, loading, hotels }: MapControlsProps) {
    const t = useTranslations("map");

    return (
        <>
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
        </>
    );
}
