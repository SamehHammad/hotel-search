"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, MapIcon, Star, Filter, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import useHotelsStore from "@/store/hotels.store";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "@/hooks/useDebounce";

interface HotelFiltersProps {
    onViewMap?: () => void;
}

export function HotelFilters({ onViewMap }: HotelFiltersProps) {
    const t = useTranslations("hotels");
    const { filters, setFilters, fetchHotels, pagination, loading } = useHotelsStore();
    const [nameSearch, setNameSearch] = useState(filters.property_name || "");

    // Update local input if store changes (e.g. from Clear All)
    useEffect(() => {
        setNameSearch(filters.property_name || "");
    }, [filters.property_name]);

    // Debounced version of setFilters for text input
    const debouncedSetFilters = useDebouncedCallback((val: string) => {
        setFilters({ property_name: val });
        fetchHotels();
    }, 500);

    const handlePriceChange = (values: number[]) => {
        setFilters({ min_price: values[0], max_price: values[1] });
        fetchHotels();
    };

    const toggleStar = (star: number) => {
        const currentStars = filters.hotel_stars || [];
        const nextStars = currentStars.includes(star)
            ? currentStars.filter(s => s !== star)
            : [...currentStars, star];

        setFilters({ hotel_stars: nextStars });
        fetchHotels();
    };

    const toggleAmenity = (amenity: string) => {
        const currentAmenities = filters.amenities || [];
        const nextAmenities = currentAmenities.includes(amenity)
            ? currentAmenities.filter(a => a !== amenity)
            : [...currentAmenities, amenity];

        setFilters({ amenities: nextAmenities });
        fetchHotels();
    };

    const handleClearFilters = () => {
        setFilters({
            property_name: "",
            min_price: 0,
            max_price: 2000,
            hotel_stars: [],
            amenities: [],
        });
        fetchHotels();
    };

    return (
        <div className="flex flex-col gap-6 w-full pb-10">
            {/* Header with Stats */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-[#051c34] tracking-tight flex items-center gap-2">
                        <Filter className="w-5 h-5 text-primary" />
                        {t("filterBy")}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {loading ? t("searching") : `${pagination.records_to || 0} ${t("hotelsFound")}`}
                    </p>
                </div>
            </div>

            {/* Map Preview Card */}
            <div
                className="group relative cursor-pointer overflow-hidden rounded-[24px] border border-slate-200 bg-white p-1 hover:shadow-xl transition-all duration-500"
                onClick={onViewMap}
            >
                <div className="relative h-[140px] w-full overflow-hidden rounded-[20px]">
                    <ImagePreview />
                    <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-transparent transition-colors" />
                    <Button
                        variant="secondary"
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-[#051c34] font-black rounded-full h-11 px-6 shadow-xl shadow-black/10 border-none hover:bg-slate-50 active:scale-95 transition-all text-sm whitespace-nowrap"
                    >
                        <MapIcon className="w-4 h-4 me-2 text-primary" />
                        {t("viewInMap")}
                    </Button>
                </div>
            </div>

            {/* Property Name Search */}
            <div className="space-y-3">
                <h3 className="text-sm font-black text-[#051c34] tracking-tight uppercase">{t("searchByPropertyName")}</h3>
                <div className="relative">
                    <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="e.g. Marriott"
                        className="h-12 ps-12 rounded-xl border-slate-200 bg-white font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus-visible:ring-primary shadow-sm"
                        value={nameSearch}
                        onChange={(e) => {
                            setNameSearch(e.target.value);
                            debouncedSetFilters(e.target.value);
                        }}
                    />
                </div>
            </div>

            {/* Main Filter Section */}
            <Accordion type="multiple" defaultValue={["price", "rating"]} className="w-full space-y-3">
                {/* Nightly Price Slider */}
                <AccordionItem value="price" className="border-none bg-white rounded-[24px] px-5 py-0 shadow-sm border border-slate-100 overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <span className="font-black text-[#051c34] text-[15px] tracking-tight">{t("nightlyPrice")}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                        <div className="pt-2 px-1 space-y-6">
                            <div className="flex justify-between items-center bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">{t("min")}</span>
                                    <span className="text-md font-black text-[#051c34]">${filters.min_price || 0}</span>
                                </div>
                                <div className="h-4 w-px bg-slate-200" />
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">{t("max")}</span>
                                    <span className="text-md font-black text-[#051c34]">${filters.max_price || 2000}</span>
                                </div>
                            </div>
                            <Slider
                                value={[filters.min_price || 0, filters.max_price || 2000]}
                                min={0}
                                max={2000}
                                step={50}
                                onValueChange={(val) => setFilters({ min_price: val[0], max_price: val[1] })}
                                onValueCommit={handlePriceChange}
                                className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-primary [&_[role=slider]]:bg-white"
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Star Rating Selection */}
                <AccordionItem value="rating" className="border-none bg-white rounded-[24px] px-5 py-0 shadow-sm border border-slate-100 overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <span className="font-black text-[#051c34] text-[15px] tracking-tight">{t("starRating")}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                        <div className="grid grid-cols-5 gap-2 pt-1">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const isSelected = filters.hotel_stars?.includes(star);
                                return (
                                    <Button
                                        key={star}
                                        variant="outline"
                                        onClick={() => toggleStar(star)}
                                        className={cn(
                                            "h-10 rounded-xl font-black transition-all active:scale-95 border-slate-200",
                                            isSelected
                                                ? "bg-amber-50 border-amber-400 text-amber-600 shadow-sm"
                                                : "text-slate-700 hover:bg-slate-50"
                                        )}
                                    >
                                        {star} <Star className={cn("w-3 h-3 ms-1", isSelected ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
                                    </Button>
                                );
                            })}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Amenities */}
                <AccordionItem value="amenities" className="border-none bg-white rounded-[24px] px-5 py-0 shadow-sm border border-slate-100 overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <span className="font-black text-[#051c34] text-[15px] tracking-tight">{t("popularFilters")}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                        <div className="flex flex-col gap-3 pt-1">
                            {[
                                { key: "breakfast", label: t("breakfast") },
                                { key: "wifi", label: t("wifi") },
                                { key: "pool", label: t("pool") },
                                { key: "shuttle", label: t("shuttle") },
                                { key: "parking", label: t("parking") },
                            ].map((item) => (
                                <div
                                    key={item.key}
                                    className="flex items-center justify-between group py-1"
                                >
                                    <div className="flex items-center gap-3 w-full cursor-pointer">
                                        <Checkbox
                                            id={`amenity-${item.key}`}
                                            checked={filters.amenities?.includes(item.key)}
                                            onCheckedChange={() => toggleAmenity(item.key)}
                                            className="rounded-md border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <label
                                            htmlFor={`amenity-${item.key}`}
                                            className="text-sm font-bold text-slate-700 cursor-pointer group-hover:text-primary transition-colors flex-1"
                                        >
                                            {item.label}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Clear All Button */}
            <div className="pt-2">
                <Button
                    variant="ghost"
                    onClick={handleClearFilters}
                    className="w-full h-12 rounded-2xl text-slate-500 font-bold text-sm hover:bg-slate-100 hover:text-slate-900 group"
                >
                    <RotateCcw className="w-4 h-4 me-2 transition-transform group-hover:-rotate-45" />
                    {t("clearAll")}
                </Button>
            </div>
        </div>
    );
}

function ImagePreview() {
    return (
        <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop"
            alt="Map preview"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
        />
    )
}
