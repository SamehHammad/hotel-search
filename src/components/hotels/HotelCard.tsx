//---** Hotel card component displaying hotel metadata, image, deal, and pricing **---//

"use client";

import { memo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Star, MapPin, Plane, CheckCircle2 } from "lucide-react";
import type { Hotel } from "@/types/hotel.types";
import {
    cn,
    formatRating,
    formatReviews,
    buildStarArray,
    getRatingColor,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface HotelCardProps {
    hotel: Hotel;
}

export const HotelCard = memo(function HotelCard({ hotel }: HotelCardProps) {
    const t = useTranslations("hotels");

    const thumbnail =
        hotel.images && hotel.images.length > 0
            ? hotel.images[0].thumbnail
            : "/placeholder-hotel.jpg"; // Provide a fallback if needed

    const stars = hotel.extracted_hotel_class
        ? buildStarArray(hotel.extracted_hotel_class)
        : [];

    return (
        <Card className="hotel-card overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all rounded-2xl bg-white mb-4">
            <div className="flex flex-col sm:flex-row h-full">
                {/* Image Section */}
                <div className="relative w-full sm:w-72 h-48 sm:h-auto shrink-0 group">
                    <Image
                        src={thumbnail}
                        alt={hotel.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 288px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                    {hotel.deal && (
                        <Badge className="absolute top-3 right-3 deal-badge shadow-sm z-10 border-none px-3 py-1 bg-amber-500 hover:bg-amber-600">
                            {hotel.deal_description || t("deal")}: {hotel.deal}
                        </Badge>
                    )}
                    {hotel.eco_certified && (
                        <Badge className="absolute top-3 left-3 bg-white/90 text-emerald-600 hover:bg-white border-emerald-100 shadow-sm backdrop-blur-sm z-10 gap-1.5 px-2.5 py-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t("ecoCertified")}
                        </Badge>
                    )}
                </div>

                {/* Content Section */}
                <CardContent className="flex-1 p-5 flex flex-col justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 leading-tight line-clamp-2">
                                    {hotel.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1.5 text-slate-500 text-sm">
                                    {stars.length > 0 && (
                                        <div className="flex" aria-label={`${stars.length} star hotel`}>
                                            {stars.map((s, i) => (
                                                <Star
                                                    key={i}
                                                    className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {hotel.hotel_class && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span>{hotel.hotel_class}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Rating Block */}
                            {hotel.rating && (
                                <div className="flex flex-col items-end shrink-0">
                                    <div className="rating-badge flex items-center gap-1.5 shadow-sm">
                                        <span className="text-lg leading-none">{formatRating(hotel.rating)}</span>
                                    </div>
                                    <span className="text-xs text-slate-500 mt-1 font-medium">
                                        {hotel.reviews ? formatReviews(hotel.reviews) : 0} {t("reviews")}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Location & Proximity */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 mt-1">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <MapPin className="w-4 h-4 text-indigo-400" />
                                <span className="font-medium text-slate-700">{hotel.city || "New York"}</span>
                            </div>

                            {hotel.location_rating && (
                                <div className="flex items-center gap-1.5 whitespace-nowrap">
                                    <span className={cn("font-medium", getRatingColor(hotel.location_rating))}>
                                        {formatRating(hotel.location_rating)}
                                    </span>
                                    <span className="text-slate-500 text-xs">{t("locationRating")}</span>
                                </div>
                            )}

                            {hotel.airport_access_rating && (
                                <div className="flex items-center gap-1.5 whitespace-nowrap">
                                    <Plane className="w-3.5 h-3.5 text-slate-400" />
                                    <span className={cn("font-medium", getRatingColor(hotel.airport_access_rating))}>
                                        {formatRating(hotel.airport_access_rating)}
                                    </span>
                                    <span className="text-slate-500 text-xs">{t("airportRating")}</span>
                                </div>
                            )}
                        </div>

                        {/* Description / Amenities clamp */}
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                            {hotel.description || (hotel.amenities && hotel.amenities.join(" • "))}
                        </p>
                    </div>

                    <Separator className="my-4 md:my-5 bg-slate-100" />

                    {/* Pricing Footer */}
                    <div className="flex justify-between items-end mt-auto pt-1">
                        <div className="text-xs text-slate-500 max-w-[50%]">
                            {hotel.amenities && hotel.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {hotel.amenities.slice(0, 3).map((amenity, i) => (
                                        <Badge key={i} variant="secondary" className="bg-slate-50 text-slate-600 border-slate-200/60 font-medium">
                                            {amenity}
                                        </Badge>
                                    ))}
                                    {hotel.amenities.length > 3 && (
                                        <span className="text-slate-400 self-center ml-1">+{hotel.amenities.length - 3}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end">
                            <span className="text-xs text-slate-400 line-through mb-0.5">
                                {hotel.price_per_night.price_before_taxes && hotel.price_per_night.price_before_taxes !== hotel.price_per_night.price
                                    ? `${hotel.price_per_night.price_before_taxes}`
                                    : null}
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                                    {hotel.price_per_night.price}
                                </span>
                                <span className="text-sm text-slate-500">{t("pricePerNight")}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1 font-medium bg-slate-50 px-2 py-0.5 rounded-md">
                                {hotel.total_price.price} {t("totalPrice")}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
});
