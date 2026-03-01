//---** Hotel card, self-contained layout with full info display **---//

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
import { getHotelImages } from "@/data/mockHotels";

interface HotelCardProps {
    hotel: Hotel;
    priority?: boolean;
}

export const HotelCard = memo(function HotelCard({ hotel, priority }: HotelCardProps) {
    const t = useTranslations("hotels");
    const [activeImage, setActiveImage] = useState(0);
    const { toggleWishlist, isInWishlist } = useWishlistStore();
    const isWishlisted = isInWishlist(hotel.property_token);

    //---** Pull all relevant search context from the store **---//
    const { filters } = useHotelsStore(
        useShallow((s) => ({ filters: s.filters }))
    );

    //---** Derived search info for rooms and guests **---//
    const roomsCount = filters.rooms?.length ?? 1;
    const totalAdults = filters.guests?.adults ?? 2;
    const totalChildren = filters.guests?.children ?? 0;
    const totalTravellers = totalAdults + totalChildren;

    //---** Calculate total nights for the stay **---//
    const nights = useMemo(() => {
        if (filters.check_in_date && filters.check_out_date) {
            try {
                const d1 = parseISO(filters.check_in_date);
                const d2 = parseISO(filters.check_out_date);
                if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
                const diff = differenceInCalendarDays(d2, d1);
                return Math.max(1, diff);
            } catch { return 1; }
        }
        return 1;
    }, [filters.check_in_date, filters.check_out_date]);

    //---** Format check-in and check-out dates for display **---//
    const safeFormat = (dateStr: string | undefined | null) => {
        if (!dateStr) return null;
        try {
            const date = parseISO(dateStr);
            if (isNaN(date.getTime())) return null;
            return format(date, "MMM d");
        } catch {
            return null;
        }
    };

    const checkInLabel = safeFormat(filters.check_in_date);
    const checkOutLabel = safeFormat(filters.check_out_date);

    //---** Pricing calculations based on nightly rate and guest count **---//
    const nightlyPriceRaw = hotel.price_per_night?.extracted_price ?? 0;
    const nightlyAllRooms = nightlyPriceRaw * roomsCount;
    const totalAllRooms = nightlyAllRooms * nights;

    //---** Format price numbers into currency strings **---//
    const fmtPrice = (n: number) =>
        n > 0 ? `$${n.toLocaleString()}` : null;

    const nightlyDisplay = fmtPrice(nightlyAllRooms) ?? hotel.price_per_night?.price ?? "—";
    const totalDisplay = fmtPrice(totalAllRooms) ?? hotel.total_price?.price ?? "—";

    //---** Handle hotel image gallery display **---//
    const images = hotel.images?.length > 1 ? hotel.images : getHotelImages(hotel.property_token);

    //---** Event handlers for image navigation and wishlist toggle **---//
    const handleNext = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setActiveImage(p => (p + 1) % images.length); };
    const handlePrev = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setActiveImage(p => (p - 1 + images.length) % images.length); };
    const handleWishlist = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(hotel.property_token); };

    //---** Check for available amenities and hotel class **---//
    const amenityList = hotel.amenities ?? [];
    const has = (kw: string[]) => amenityList.some(a => kw.some(k => a.toLowerCase().includes(k)));
    const hasPool = has(["pool", "مسبح"]);
    const hasWifi = has(["wi-fi", "wifi", "wi‑fi", "واي فاي"]);
    const hasBreakfast = has(["breakfast", "إفطار"]);
    const hasParking = has(["parking", "park", "موقف"]);
    const stars = hotel.extracted_hotel_class ?? 0;

    return (
        /*---** Card shell: flex row on desktop, column on mobile **---*/
        <>
            <article className="
                group flex flex-col sm:flex-row
                bg-surface border border-border rounded-2xl
                shadow-sm hover:shadow-xl
                transition-shadow duration-300
                overflow-hidden mb-5
            ">
                {/*---** IMAGE PANEL: Displays hotel photos and wishlist toggle **---*/}
                <div className="relative w-full sm:w-[240px] md:w-[280px] shrink-0 bg-surface-muted min-h-[200px] sm:min-h-0 overflow-hidden">
                    <Image
                        src={sanitizeImageUrl(images[activeImage].original || images[activeImage].thumbnail)}
                        alt={`${hotel.name} - ${hotel.city ?? ""}`}
                        fill
                        sizes="(max-width:640px) 100vw, 280px"
                        className="object-cover z-10 relative transition-transform duration-700 group-hover:scale-[1.03]"
                        priority={priority}
                        loading={priority ? undefined : "lazy"}
                    />

                    {/*---** Wishlist toggle button **---*/}
                    <button
                        onClick={handleWishlist}
                        aria-label="Toggle wishlist"
                        className="absolute top-3 right-3 z-20 bg-surface/90 hover:bg-surface text-brand-dark p-1.5 rounded-full shadow-md transition-all hover:scale-110 active:scale-95"
                    >
                        <Heart className={cn("w-4 h-4 transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "fill-none text-brand-muted")} />
                    </button>
                </div>
                {/*---** CONTENT PANEL: Displays names, amenities, and pricing **---*/}
                <div className="flex flex-col flex-1 min-w-0">

                    {/*---** Top section: name + rating badge **---*/}
                    <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-border">
                        <div className="min-w-0 flex-1">
                            {/*---** Hotel name **---*/}
                            <h3 className="text-[17px] font-extrabold text-brand-dark leading-snug tracking-tight hover:underline cursor-pointer">
                                <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">
                                    {hotel.name}
                                </a>
                            </h3>
                            {/*---** City + stars row **---*/}
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-[13px] font-medium text-brand-muted">{hotel.city ?? "—"}</span>
                                {hotel.rating && (
                                    <div className="flex items-center gap-0.5">
                                        <span className="sr-only">{t("rating")}: {hotel.rating} {t("stars")}</span>
                                        {Array.from({ length: Math.floor(hotel.rating) }).map((_, i) => (
                                            <Star key={`full-${i}`} className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                                        ))}
                                        {hotel.rating % 1 >= 0.5 && (
                                            <div className="relative w-3 h-3" aria-hidden="true">
                                                <Star className="absolute inset-0 w-3 h-3 text-amber-400" />
                                                <div className="absolute inset-0 overflow-hidden w-1/2">
                                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/*---** Rating badge with reviews count **---*/}
                        {hotel.rating && (
                            <div className="flex flex-col items-center shrink-0">
                                <div className="w-10 h-8 bg-[#1e8d35] text-white flex items-center justify-center font-black text-sm rounded-lg">
                                    {formatRating(hotel.rating)}
                                </div>
                                <span className="text-[10px] font-bold text-brand-muted mt-0.5 whitespace-nowrap">
                                    {formatReviews(hotel.reviews ?? 0)} {t("reviews")}
                                </span>
                            </div>
                        )}
                    </div>

                    {/*---** Middle section: amenities + description **---*/}
                    <div className="px-4 py-3 flex flex-col gap-2 border-b border-border">
                        {/*---** Amenity pills **---*/}
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

                        {/*---** Hotel description preview **---*/}
                        <p className="text-[12px] text-brand-muted leading-relaxed line-clamp-2">
                            {hotel.description ?? t("mockDesc")}
                        </p>
                    </div>

                    {/*---** Bottom section: search context + price **---*/}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3 px-4 pt-3 pb-4">

                        {/*---** LEFT: Search context chips (dates, guests, rooms) **---*/}
                        <div className="flex flex-col gap-1.5">
                            {/*---** Stay duration dates **---*/}
                            {checkInLabel && checkOutLabel && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-muted bg-surface-muted border border-border px-2 py-0.5 rounded-full">
                                        <CalendarDays className="w-3 h-3 text-brand-muted/70" />
                                        {checkInLabel}
                                        <ArrowRight className="w-2.5 h-2.5 opacity-30 mx-0.5" />
                                        {checkOutLabel}
                                    </div>
                                    <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-muted bg-surface-muted border border-border px-2 py-0.5 rounded-full">
                                        <Moon className="w-3 h-3 text-brand-muted/70" />
                                        {t("nightsCount", { count: nights })}
                                    </div>
                                </div>
                            )}

                            {/*---** Occupancy details **---*/}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-dark bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                    <Users className="w-3 h-3 text-brand-muted/70" />
                                    {t("peopleCount", { count: totalTravellers })}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-dark bg-surface-muted border border-border px-2 py-0.5 rounded-full">
                                    <BedDouble className="w-3 h-3 text-brand-muted/70" />
                                    {t("roomsCount", { count: roomsCount })}
                                </div>
                            </div>


                        </div>

                        {/*---** RIGHT: Pricing panel with breakdown **---*/}
                        <div className="flex flex-col items-end shrink-0 bg-surface-muted border border-border rounded-xl px-3.5 py-2.5 min-w-[160px]">
                            {/*---** Nightly rate per room **---*/}
                            <div className="flex items-baseline gap-1">
                                <span className="text-[26px] font-black text-brand-dark leading-none">
                                    {nightlyDisplay}
                                </span>
                                <span className="text-[11px] font-medium text-brand-muted/50 mb-0.5">
                                    {t("perNight")}
                                </span>
                            </div>

                            {/*---** Stay summary summary **---*/}
                            <span className="text-[10px] text-brand-muted/70 font-medium mt-0.5">
                                {roomsCount > 1 ? t("roomCountDisplay", { count: roomsCount }) + " · " : ""}{t("nightsCount", { count: nights })}
                            </span>
                            <div className="w-full h-px bg-border my-1.5" />

                            {/*---** Final total price **---*/}
                            <div className="flex flex-col items-end">
                                <span className="text-[13px] font-black text-brand-dark">
                                    {totalDisplay} {t("totalPrice")}
                                </span>
                                <span className="text-[10px] text-brand-muted/70 font-medium">
                                    {t("includesTaxes")}
                                </span>
                            </div>

                            {/*---** Button removed per user request **---*/}
                        </div>
                    </div>
                </div>
            </article >
        </>
    );
});
