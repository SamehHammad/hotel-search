//---** Hotel card component displaying hotel metadata, image, deal, and pricing **---//

"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
    Star,
    MapPin,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Heart,
    Info,
    ChevronRight as ChevronRightIcon,
    Waves,
    Moon,
    ArrowUpRight,
    Car,
    Coffee
} from "lucide-react";
import type { Hotel } from "@/types/hotel.types";
import {
    cn,
    formatRating,
    formatReviews,
    buildStarArray,
} from "@/lib/utils";
import { sanitizeImageUrl } from "@/lib/imageUtils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useWishlistStore from "@/store/wishlist.store";

interface HotelCardProps {
    hotel: Hotel;
}

export const HotelCard = memo(function HotelCard({ hotel }: HotelCardProps) {
    const t = useTranslations("hotels");
    const [activeImage, setActiveImage] = useState(0);
    const { toggleWishlist, isInWishlist } = useWishlistStore();
    const isWishlisted = isInWishlist(hotel.property_token);

    const images = hotel.images && hotel.images.length > 0
        ? hotel.images
        : [{ thumbnail: "/placeholder.jpg" }];

    const handleNextImage = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setActiveImage((prev) => (prev + 1) % images.length);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setActiveImage((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        toggleWishlist(hotel.property_token);
    };

    return (
        <Card className="group flex flex-col overflow-hidden border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[12px] bg-white mb-6 border h-auto">
            <div className="flex flex-col md:flex-row h-auto md:h-[260px]">
                {/* Image Section */}
                <div className="relative w-full md:w-[320px] lg:w-[350px] shrink-0 overflow-hidden bg-slate-100">
                    {/* Placeholder Background */}
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
                        style={{ backgroundImage: 'url(/placeholder.jpg)' }}
                    />

                    <Image
                        src={sanitizeImageUrl(images[activeImage].thumbnail)}
                        alt={hotel.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 350px"
                        className="object-cover transition-transform duration-700 relative z-10"
                        loading="lazy"
                    />


                    {/* Wishlist Icon */}
                    <button
                        onClick={handleWishlist}
                        className="absolute top-3 right-3 bg-white hover:bg-white/95 text-slate-800 p-2 rounded-full shadow-md z-10 transition-all hover:scale-110 active:scale-95"
                    >
                        <Heart className={cn("w-5 h-5 transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "fill-none text-slate-400")} />
                    </button>

                    {/* Navigation Overlays */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="w-8 h-8 rounded-full bg-white/90 text-slate-900 pointer-events-auto shadow-md border-none"
                            onClick={handlePrevImage}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="w-8 h-8 rounded-full bg-white/90 text-slate-900 pointer-events-auto shadow-md border-none"
                            onClick={handleNextImage}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Ad Badge */}
                    <div className="absolute bottom-3 left-3 z-10">
                        <div className="bg-white/95 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            {t("ad")}
                        </div>

                    </div>
                </div>

                {/* Content Section */}
                <CardContent className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start gap-3">
                            <div className="space-y-0.5">
                                <h3 className="text-[20px] font-extrabold text-[#051c34] tracking-tight hover:underline cursor-pointer leading-tight">
                                    {hotel.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-[14px] font-medium text-slate-600">{hotel.city || "Cairo"}</p>
                                    <div className="flex items-center gap-0.5 ml-1">
                                        {Array.from({ length: hotel.extracted_hotel_class || 0 }).map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Amenities & Description */}
                        <div className="mt-4 flex flex-col gap-2.5">
                            <div className="flex flex-wrap gap-2">
                                {hotel.amenities?.some(a => a.toLowerCase().includes("pool") || a.includes("مسبح")) && (
                                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50">
                                        <Waves className="w-3 h-3" />
                                        {t("pool")}
                                    </div>
                                )}
                                {hotel.amenities?.some(a => a.toLowerCase().includes("wi") || a.includes("واي فاي")) && (
                                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/50">
                                        <CheckCircle2 className="w-3 h-3" />
                                        {t("wifi")}
                                    </div>
                                )}
                                {hotel.amenities?.some(a => a.toLowerCase().includes("break") || a.includes("إفطار")) && (
                                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100/50">
                                        <Coffee className="w-3 h-3" />
                                        {t("breakfast")}
                                    </div>
                                )}
                                {hotel.amenities?.some(a => a.toLowerCase().includes("park") || a.includes("موقف")) && (
                                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100/50">
                                        <Car className="w-3 h-3" />
                                        {t("parking")}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <p className="text-[14px] font-extrabold text-[#051c34] leading-tight">
                                    {hotel.deal || t("mockTitle")}
                                </p>
                                <p className="text-[13px] font-medium text-slate-500 line-clamp-2 max-w-[90%]">
                                    {hotel.description || t("mockDesc")}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Stats & Price row */}
                    <div className="flex items-end justify-between mt-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
                                <div className="w-5 h-5 bg-[#051c34] text-white flex items-center justify-center rounded-full">
                                    <Moon className="w-3 h-3 fill-white" />
                                </div>
                                {t("collectStamps")}
                            </div>


                            {hotel.rating && (
                                <div className="flex items-center gap-2 pt-1">
                                    <div className="w-9 h-7 bg-[#1e8d35] text-white flex items-center justify-center font-bold text-sm rounded-[6px]">
                                        {formatRating(hotel.rating)}
                                    </div>
                                    <div className="flex flex-col leading-none">
                                        <span className="text-[13px] font-extrabold text-[#051c34]">{t("excellent")}</span>
                                        <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                                            {hotel.reviews ? formatReviews(hotel.reviews) : 0} {t("reviews")}
                                        </span>
                                    </div>

                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end">
                            <div className="flex flex-col items-end leading-tight">
                                <span className="text-[24px] font-extrabold text-[#051c34]">
                                    {hotel.price_per_night?.price || "$164"}
                                </span>
                                <span className="text-[13px] font-bold text-[#051c34]">
                                    {t("totalPriceWithFees", { amount: hotel.total_price?.price || "$847" })}
                                </span>
                                <span className="text-[11px] font-medium text-slate-500 mt-0.5 flex flex-col items-end">
                                    <span>{t("forRooms", { count: 2 })}</span>
                                    <span>{t("includesTaxes")}</span>
                                </span>


                            </div>
                        </div>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
});
