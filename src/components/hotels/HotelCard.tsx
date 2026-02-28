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
}

export const HotelCard = memo(function HotelCard({ hotel }: HotelCardProps) {
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
                const diff = differenceInCalendarDays(
                    parseISO(filters.check_out_date),
                    parseISO(filters.check_in_date)
                );
                return Math.max(1, diff);
            } catch { return 1; }
        }
        return 1;
    }, [filters.check_in_date, filters.check_out_date]);

    //---** Format check-in and check-out dates for display **---//
    const checkInLabel = filters.check_in_date ? format(parseISO(filters.check_in_date), "MMM d") : null;
    const checkOutLabel = filters.check_out_date ? format(parseISO(filters.check_out_date), "MMM d") : null;

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
                bg-white border border-slate-200/80 rounded-2xl
                shadow-sm hover:shadow-xl
                transition-shadow duration-300
                overflow-hidden mb-5
            ">
                {/*---** IMAGE PANEL: Displays hotel photos and wishlist toggle **---*/}
                <div className="relative w-full sm:w-[240px] md:w-[280px] shrink-0 bg-slate-100 min-h-[200px] sm:min-h-0">
                    {/*---** Blurred BG fallback **---*/}
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

                    {/*---** Wishlist toggle button **---*/}
                    <button
                        onClick={handleWishlist}
                        aria-label="Toggle wishlist"
                        className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-full shadow-md transition-all hover:scale-110 active:scale-95"
                    >
                        <Heart className={cn("w-4 h-4 transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "fill-none text-slate-400")} />
                    </button>
                </div>
                {/*---** CONTENT PANEL: Displays names, amenities, and pricing **---*/}
                <div className="flex flex-col flex-1 min-w-0">

                    {/*---** Top section: name + rating badge **---*/}
                    <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
                        <div className="min-w-0 flex-1">
                            {/*---** Hotel name **---*/}
                            <h3 className="text-[17px] font-extrabold text-[#051c34] leading-snug tracking-tight hover:underline cursor-pointer">
                                {hotel.name}
                            </h3>
                            {/*---** City + stars row **---*/}
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
                        {/*---** Rating badge with reviews count **---*/}
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

                    {/*---** Middle section: amenities + description **---*/}
                    <div className="px-4 py-3 flex flex-col gap-2 border-b border-slate-100">
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
                        <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2">
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

                            {/*---** Occupancy details **---*/}
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


                        </div>

                        {/*---** RIGHT: Pricing panel with breakdown **---*/}
                        <div className="flex flex-col items-end shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 min-w-[160px]">
                            {/*---** Nightly rate per room **---*/}
                            <div className="flex items-baseline gap-1">
                                <span className="text-[26px] font-black text-[#051c34] leading-none">
                                    {nightlyDisplay}
                                </span>
                                <span className="text-[11px] font-medium text-slate-400 mb-0.5">
                                    {t("perNight")}
                                </span>
                            </div>

                            {/*---** Stay summary summary **---*/}
                            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                                {roomsCount > 1 ? t("roomCountDisplay", { count: roomsCount }) + " · " : ""}{t("nightsCount", { count: nights })}
                            </span>
                            <div className="w-full h-px bg-slate-200 my-1.5" />

                            {/*---** Final total price **---*/}
                            <div className="flex flex-col items-end">
                                <span className="text-[13px] font-black text-[#051c34]">
                                    {totalDisplay} {t("totalPrice")}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                    {t("includesTaxes")}
                                </span>
                            </div>

                            {/*---** Button removed per user request **---*/}
                        </div>
                    </div>
                </div>
            </article>
        </>
    );
});
