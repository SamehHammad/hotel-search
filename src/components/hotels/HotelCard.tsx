//---** Hotel card — fixed, self-contained layout with full info display **---//

"use client";

import { memo, useState, useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
    Star, ChevronLeft, ChevronRight, Heart,
    Waves, Wifi, Coffee, Car, Moon, Users, BedDouble,
    CalendarDays, ArrowRight
} from "lucide-react";
import type { Hotel } from "@/types/hotel.types";
import { cn, formatRating, formatReviews } from "@/lib/utils";
import { sanitizeImageUrl } from "@/lib/imageUtils";
import { Button } from "@/components/ui/button";
import useWishlistStore from "@/store/wishlist.store";
import useHotelsStore from "@/store/hotels.store";
import { useShallow } from "zustand/react/shallow";
import { differenceInCalendarDays, parseISO, format } from "date-fns";

const MOCK_HOTEL_IMAGES = [
    { thumbnail: "/hotels/h1.webp", original: "/hotels/h1.webp" },
    { thumbnail: "/hotels/h2.webp", original: "/hotels/h2.webp" },
    { thumbnail: "/hotels/h3.webp", original: "/hotels/h3.webp" },
    { thumbnail: "/hotels/h4.webp", original: "/hotels/h4.webp" },
    { thumbnail: "/hotels/h5.webp", original: "/hotels/h5.webp" },
    { thumbnail: "/hotels/h6.webp", original: "/hotels/h6.webp" },
    { thumbnail: "/hotels/h7.webp", original: "/hotels/h7.webp" },
    { thumbnail: "/hotels/h8.webp", original: "/hotels/h8.webp" },
    { thumbnail: "/hotels/h9.webp", original: "/hotels/h9.webp" },
    { thumbnail: "/hotels/h10.webp", original: "/hotels/h10.webp" },
    { thumbnail: "/hotels/h11.webp", original: "/hotels/h11.webp" },
];

function getHotelImages(token: string) {
    if (!token) return MOCK_HOTEL_IMAGES.slice(0, 5);
    // Create a deterministic start index based on string length & char codes
    const hash = Array.from(token).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const startIdx = hash % (MOCK_HOTEL_IMAGES.length - 5);
    return MOCK_HOTEL_IMAGES.slice(startIdx, startIdx + 5);
}

interface HotelCardProps {
    hotel: Hotel;
}

export const HotelCard = memo(function HotelCard({ hotel }: HotelCardProps) {
    const t = useTranslations("hotels");
    const [activeImage, setActiveImage] = useState(0);
    const { toggleWishlist, isInWishlist } = useWishlistStore();
    const isWishlisted = isInWishlist(hotel.property_token);

    // Pull all relevant search context from the store
    const { filters } = useHotelsStore(
        useShallow((s) => ({ filters: s.filters }))
    );

    // ── Derived search info ───────────────────────────────────────────────────
    const roomsCount = filters.rooms?.length ?? 1;
    const totalAdults = filters.guests?.adults ?? 2;
    const totalChildren = filters.guests?.children ?? 0;
    const totalTravellers = totalAdults + totalChildren;

    const nights = useMemo(() => {
        if (filters.check_in_date && filters.check_out_date) {
            try {
                const diff = differenceInCalendarDays(
                    parseISO(filters.check_out_date),
                    parseISO(filters.check_in_date)
                );
                return Math.max(1, diff);
            } catch { return 1; }
        }
        return 1;
    }, [filters.check_in_date, filters.check_out_date]);

    const checkInLabel = filters.check_in_date ? format(parseISO(filters.check_in_date), "MMM d") : null;
    const checkOutLabel = filters.check_out_date ? format(parseISO(filters.check_out_date), "MMM d") : null;

    // ── Pricing ───────────────────────────────────────────────────────────────
    const nightlyPriceRaw = hotel.price_per_night?.extracted_price ?? 0;
    // Per-night price × rooms
    const nightlyAllRooms = nightlyPriceRaw * roomsCount;
    // Total = nightly × rooms × nights
    const totalAllRooms = nightlyAllRooms * nights;

    const fmtPrice = (n: number) =>
        n > 0 ? `$${n.toLocaleString()}` : null;

    const nightlyDisplay = fmtPrice(nightlyAllRooms) ?? hotel.price_per_night?.price ?? "—";
    const totalDisplay = fmtPrice(totalAllRooms) ?? hotel.total_price?.price ?? "—";

    // ── Images ────────────────────────────────────────────────────────────────
    const images = hotel.images?.length > 1 ? hotel.images : getHotelImages(hotel.property_token);

    const handleNext = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setActiveImage(p => (p + 1) % images.length); };
    const handlePrev = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setActiveImage(p => (p - 1 + images.length) % images.length); };
    const handleWishlist = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(hotel.property_token); };

    // ── Amenity flags ─────────────────────────────────────────────────────────
    const amenityList = hotel.amenities ?? [];
    const has = (kw: string[]) => amenityList.some(a => kw.some(k => a.toLowerCase().includes(k)));
    const hasPool = has(["pool", "مسبح"]);
    const hasWifi = has(["wi-fi", "wifi", "wi‑fi", "واي فاي"]);
    const hasBreakfast = has(["breakfast", "إفطار"]);
    const hasParking = has(["parking", "park", "موقف"]);

    const stars = hotel.extracted_hotel_class ?? 0;

    return (
        /* ── Card shell: flex row on desktop, column on mobile ── */
        <article className="
            group flex flex-col sm:flex-row
            bg-white border border-slate-200/80 rounded-2xl
            shadow-sm hover:shadow-xl
            transition-shadow duration-300
            overflow-hidden mb-5
        ">
            {/* ════ IMAGE PANEL ════════════════════════════════════════════════ */}
            <div className="relative w-full sm:w-[240px] md:w-[280px] shrink-0 bg-slate-100 min-h-[200px] sm:min-h-0">
                {/* Blurred BG fallback */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: "url(/placeholder.jpg)" }}
                />

                <Image
                    src={sanitizeImageUrl(images[activeImage].original || images[activeImage].thumbnail)}
                    alt={hotel.name}
                    fill
                    sizes="(max-width:640px) 100vw, 280px"
                    className="object-cover z-10 relative transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                />

                {/* Wishlist */}
                <button
                    onClick={handleWishlist}
                    aria-label="Toggle wishlist"
                    className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-full shadow-md transition-all hover:scale-110 active:scale-95"
                >
                    <Heart className={cn("w-4 h-4 transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "fill-none text-slate-400")} />
                </button>

                {/* Image nav */}
                {images.length > 1 && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                        <Button variant="secondary" size="icon" onClick={handlePrev}
                            className="w-7 h-7 rounded-full bg-white/90 text-slate-800 shadow pointer-events-auto border-none">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" size="icon" onClick={handleNext}
                            className="w-7 h-7 rounded-full bg-white/90 text-slate-800 shadow pointer-events-auto border-none">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* ════ CONTENT PANEL ══════════════════════════════════════════════ */}
            <div className="flex flex-col flex-1 min-w-0">

                {/* ── Top section: name + rating badge ────────────────────────── */}
                <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
                    <div className="min-w-0 flex-1">
                        {/* Hotel name */}
                        <h3 className="text-[17px] font-extrabold text-[#051c34] leading-snug tracking-tight hover:underline cursor-pointer">
                            {hotel.name}
                        </h3>

                        {/* City + stars row */}
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[13px] font-medium text-slate-500">{hotel.city ?? "—"}</span>
                            {stars > 0 && (
                                <div className="flex items-center gap-0.5">
                                    {Array.from({ length: stars }).map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rating badge */}
                    {hotel.rating && (
                        <div className="flex flex-col items-center shrink-0">
                            <div className="w-10 h-8 bg-[#1e8d35] text-white flex items-center justify-center font-black text-sm rounded-lg">
                                {formatRating(hotel.rating)}
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 mt-0.5 whitespace-nowrap">
                                {formatReviews(hotel.reviews ?? 0)} {t("reviews")}
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Middle section: amenities + description ──────────────────── */}
                <div className="px-4 py-3 flex flex-col gap-2 border-b border-slate-100">
                    {/* Amenity pills */}
                    <div className="flex flex-wrap gap-1.5">
                        {hasWifi && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                <Wifi className="w-3 h-3" />{t("wifi")}
                            </span>
                        )}
                        {hasPool && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                <Waves className="w-3 h-3" />{t("pool")}
                            </span>
                        )}
                        {hasBreakfast && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                                <Coffee className="w-3 h-3" />{t("breakfast")}
                            </span>
                        )}
                        {hasParking && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                                <Car className="w-3 h-3" />{t("parking")}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2">
                        {hotel.description ?? t("mockDesc")}
                    </p>
                </div>

                {/* ── Bottom section: search context + price ───────────────────── */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3 px-4 pt-3 pb-4">

                    {/* LEFT — Search context chips */}
                    <div className="flex flex-col gap-1.5">
                        {/* Dates + nights */}
                        {checkInLabel && checkOutLabel && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                                    <CalendarDays className="w-3 h-3 text-slate-400" />
                                    {checkInLabel}
                                    <ArrowRight className="w-2.5 h-2.5 text-slate-300 mx-0.5" />
                                    {checkOutLabel}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                                    <Moon className="w-3 h-3 text-slate-400" />
                                    {t("nightsCount", { count: nights })}
                                </div>
                            </div>
                        )}

                        {/* Travellers + rooms */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#051c34] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                <Users className="w-3 h-3 text-indigo-400" />
                                {t("peopleCount", { count: totalTravellers })}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#051c34] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                                <BedDouble className="w-3 h-3 text-slate-400" />
                                {t("roomsCount", { count: roomsCount })}
                            </div>
                        </div>

                        {/* Collect stamps promo */}
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-0.5">
                            <div className="w-4 h-4 bg-[#051c34] text-white flex items-center justify-center rounded-full shrink-0">
                                <Moon className="w-2.5 h-2.5 fill-white" />
                            </div>
                            {t("collectStamps")}
                        </div>
                    </div>

                    {/* RIGHT — Price panel */}
                    <div className="flex flex-col items-end shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 min-w-[160px]">
                        {/* Per-night × rooms */}
                        <div className="flex items-baseline gap-1">
                            <span className="text-[26px] font-black text-[#051c34] leading-none">
                                {nightlyDisplay}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 mb-0.5">
                                {t("perNight")}
                            </span>
                        </div>

                        {/* Room context below price */}
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {roomsCount > 1 ? t("roomCountDisplay", { count: roomsCount }) + " · " : ""}{t("nightsCount", { count: nights })}
                        </span>

                        {/* Divider */}
                        <div className="w-full h-px bg-slate-200 my-1.5" />

                        {/* Total */}
                        <div className="flex flex-col items-end">
                            <span className="text-[13px] font-black text-[#051c34]">
                                {totalDisplay} {t("totalPrice")}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                                {t("includesTaxes")}
                            </span>
                        </div>

                        {/* CTA */}
                        <button className="
                            mt-2 w-full rounded-lg bg-[#051c34] hover:bg-[#0a2f58]
                            text-white text-[12px] font-bold py-1.5 px-3
                            transition-all hover:scale-[1.02] active:scale-[0.98]
                            shadow-sm
                        ">
                            {t("viewDeal")}
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
});
