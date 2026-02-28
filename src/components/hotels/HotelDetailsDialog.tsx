//---** Hotel Details Dialog — Premium full-info popup with gallery and amenities **---//

"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogClose
} from "@/components/ui/dialog";
import {
    Star, MapPin, Wifi, Waves, Coffee, Car,
    X, ChevronRight, CheckCircle2, Info, Building2,
    CalendarDays, Moon, Users, BedDouble
} from "lucide-react";
import type { Hotel } from "@/types/hotel.types";
import { cn, formatRating, formatReviews } from "@/lib/utils";
import { sanitizeImageUrl } from "@/lib/imageUtils";
import { getHotelImages } from "@/data/mockHotels";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface HotelDetailsDialogProps {
    hotel: Hotel;
    isOpen: boolean;
    onClose: () => void;
    searchInfo?: {
        checkInLabel: string | null;
        checkOutLabel: string | null;
        nights: number;
        totalTravellers: number;
        roomsCount: number;
        nightlyDisplay: string;
        totalDisplay: string;
    };
}

export function HotelDetailsDialog({ hotel, isOpen, onClose, searchInfo }: HotelDetailsDialogProps) {
    const t = useTranslations("hotels");
    const [activeImg, setActiveImg] = useState(0);
    const images = hotel.images?.length > 0 ? hotel.images : getHotelImages(hotel.property_token);
    const stars = hotel.extracted_hotel_class ?? 0;

    //---** Derived amenities for categorized display **---//
    const amenityList = hotel.amenities ?? [];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 border-none rounded-[2rem] shadow-2xl overflow-hidden">
                <DialogHeader className="hidden">
                    <DialogTitle>{hotel.name}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col">
                    {/*---** Top Section: Image Gallery **---*/}
                    <div className="relative w-full aspect-video sm:aspect-[21/7] bg-slate-100 group">
                        <Image
                            src={sanitizeImageUrl(images[activeImg].original || images[activeImg].thumbnail)}
                            alt={hotel.name}
                            fill
                            className="object-cover transition-all duration-500"
                            priority
                        />

                        {/*---** Thumbnails overlay **---*/}
                        <div className="absolute bottom-6 left-6 right-6 flex gap-3 overflow-x-auto pb-2 scrollbar-none z-20">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImg(i)}
                                    className={cn(
                                        "relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 shadow-2xl",
                                        activeImg === i ? "border-white scale-110" : "border-transparent opacity-70 hover:opacity-100"
                                    )}
                                >
                                    <Image src={sanitizeImageUrl(img.thumbnail)} alt={`Thumb ${i}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>

                        {/*---** Close button overlay **---*/}
                        <DialogClose className="absolute top-6 right-6 z-30 bg-white/10 hover:bg-white/30 backdrop-blur-xl text-white rounded-full p-2.5 transition-all shadow-xl">
                            <X className="w-6 h-6" />
                        </DialogClose>
                    </div>

                    {/*---** Content Section: Details and Organization **---*/}
                    <div className="px-6 py-10 sm:px-12 flex flex-col gap-10">
                        {/*---** Header: Title, Rating, Location **---*/}
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn("w-4 h-4", i < stars ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-100")}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[12px] font-black text-primary/50 uppercase tracking-[0.2em]">{hotel.hotel_class}</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-black text-[#051c34] leading-tight mb-3 uppercase italic tracking-tight">{hotel.name}</h2>
                                <div className="flex items-center gap-2 text-slate-500 font-bold bg-slate-50 self-start px-4 py-1.5 rounded-full border border-slate-100">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="text-sm">{hotel.city}, {hotel.country}</span>
                                </div>
                            </div>

                            {/*---** Rating Badge **---*/}
                            {hotel.rating && (
                                <div className="flex items-center gap-4 bg-white border border-slate-100 p-3 rounded-[2rem] shrink-0 shadow-xl shadow-slate-200/50">
                                    <div className="flex flex-col items-end">
                                        <span className="text-lg font-black text-[#1e8d35] leading-none mb-1">{t("excellent") || "Excellent"}</span>
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{formatReviews(hotel.reviews ?? 0)} {t("reviews")}</span>
                                    </div>
                                    <div className="w-16 h-16 bg-[#1e8d35] text-white flex items-center justify-center text-3xl font-black rounded-[1.25rem] shadow-2xl shadow-emerald-700/30">
                                        {formatRating(hotel.rating)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/*---** Description & Info Grid **---*/}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-8 flex flex-col gap-10">
                                <section>
                                    <h3 className="text-xl font-black text-[#051c34] flex items-center gap-3 mb-5 uppercase italic tracking-wide">
                                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Info className="w-4 h-4 text-primary" />
                                        </div>
                                        {t("aboutHotel") || "About This Property"}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed text-lg font-medium opacity-90">
                                        {hotel.description || t("mockDesc")}
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-black text-[#051c34] flex items-center gap-3 mb-6 uppercase italic tracking-wide">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <Building2 className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        {t("amenities") || "Main Amenities"}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                                        {amenityList.map((amenity, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-[15px] text-slate-700 font-bold bg-slate-50/50 p-3 rounded-2xl border border-dotted border-slate-200">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                {amenity}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/*---** Sidebar: Dynamic Search Summary **---*/}
                            <div className="lg:col-span-4 flex flex-col gap-6">
                                <div className="bg-[#051c34] text-white rounded-[2.5rem] p-8 flex flex-col gap-8 shadow-2xl shadow-indigo-900/20 relative overflow-hidden group">
                                    {/*---** Decorative background icon **---*/}
                                    <Building2 className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 rotate-12" />

                                    <div className="flex flex-col gap-5 relative z-10">
                                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-white/50 border-b border-white/10 pb-3">
                                            <span>Your Stay Details</span>
                                            <CalendarDays className="w-4 h-4" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-white/40 uppercase">{t("checkInLabel") || "Check-in"}</span>
                                                <span className="text-lg font-black">{searchInfo?.checkInLabel || hotel.check_in_time || "—"}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-white/40 uppercase">{t("checkOutLabel") || "Check-out"}</span>
                                                <span className="text-lg font-black">{searchInfo?.checkOutLabel || hotel.check_out_time || "—"}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-2">
                                            <div className="bg-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-black">
                                                <Moon className="w-3.5 h-3.5 text-indigo-300" />
                                                {t("nightsCount", { count: searchInfo?.nights ?? 1 })}
                                            </div>
                                            <div className="bg-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-black">
                                                <Users className="w-3.5 h-3.5 text-indigo-300" />
                                                {t("peopleCount", { count: searchInfo?.totalTravellers ?? 2 })}
                                            </div>
                                            <div className="bg-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-black">
                                                <BedDouble className="w-3.5 h-3.5 text-indigo-300" />
                                                {t("roomsCount", { count: searchInfo?.roomsCount ?? 1 })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 relative z-10 border-t border-white/10 pt-6">
                                        <span className="text-[11px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Estimated Total</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black">{searchInfo?.totalDisplay || hotel.total_price?.price}</span>
                                            <span className="text-xs text-white/50 font-bold uppercase">{t("totalPrice")}</span>
                                        </div>
                                        <span className="text-[10px] text-white/30 font-bold mt-1 italic italic">*{t("includesTaxes")}</span>
                                    </div>

                                    <Button className="w-full bg-white text-[#051c34] hover:bg-slate-100 font-black py-8 rounded-2xl shadow-xl transition-all hover:scale-[1.03] active:scale-[0.97] relative z-10 text-lg uppercase italic">
                                        {t("bookNow") || "Book Now"}
                                    </Button>

                                    <p className="text-[10px] text-center text-white/40 font-bold uppercase tracking-widest relative z-10">Secure Payment Guaranteed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
