//---** Sidebar filter component for property search and amenities **---//

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

    //---** Sync local search input state with global store updates **---//
    useEffect(() => {
        setNameSearch(filters.property_name || "");
    }, [filters.property_name]);

    //---** Debounced filter update to prevent excessive API requests **---//
    const debouncedSetFilters = useDebouncedCallback((val: string) => {
        setFilters({ property_name: val });
        fetchHotels();
    }, 500);

    //---** Handle price slider range changes **---//
    const handlePriceChange = (values: number[]) => {
        setFilters({ min_price: values[0], max_price: values[1] });
        fetchHotels();
    };

    //---** Toggle star rating selection in filters **---//
    const toggleStar = (star: number) => {
        const currentStars = filters.hotel_stars || [];
        const nextStars = currentStars.includes(star)
            ? currentStars.filter(s => s !== star)
            : [...currentStars, star];

        setFilters({ hotel_stars: nextStars });
        fetchHotels();
    };

    //---** Toggle amenity selection in filters **---//
    const toggleAmenity = (amenity: string) => {
        const currentAmenities = filters.amenities || [];
        const nextAmenities = currentAmenities.includes(amenity)
            ? currentAmenities.filter(a => a !== amenity)
            : [...currentAmenities, amenity];

        setFilters({ amenities: nextAmenities });
        fetchHotels();
    };

    //---** Reset all applied filters to default values **---//
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
            {/*---** Section Header: Title and total results count **---*/}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-brand-dark tracking-tight flex items-center gap-2">
                        <Filter className="w-5 h-5 text-primary" />
                        {t("filterBy")}
                    </h3>
                    <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">
                        {loading ? t("searching") : `${pagination.records_to || 0} ${t("hotelsFound")}`}
                    </p>
                </div>
            </div>

            {/*---** Interactive Map Preview Card **---*/}
            <div
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border bg-surface p-1 hover:shadow-xl transition-all duration-500"
                onClick={onViewMap}
            >
                <div className="relative h-[140px] w-full overflow-hidden rounded-2xl">
                    <ImagePreview />
                    <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-transparent transition-colors" />
                    <Button
                        variant="secondary"
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface text-brand-dark font-black rounded-full h-11 px-6 shadow-xl shadow-black/10 border-none hover:bg-brand-light active:scale-95 transition-all text-sm whitespace-nowrap"
                    >
                        <MapIcon className="w-4 h-4 me-2 text-primary" />
                        {t("viewInMap")}
                    </Button>
                </div>
            </div>

            {/*---** Property Name Search: Live filtering by text **---*/}
            <div className="space-y-3">
                <label
                    htmlFor="property-name-filter"
                    className="text-sm font-black text-brand-dark tracking-tight uppercase block"
                >
                    {t("searchByPropertyName")}
                </label>
                <div className="relative">
                    <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                    <Input
                        id="property-name-filter"
                        placeholder="e.g. Marriott"
                        className="h-12 ps-12 rounded-xl border-border bg-surface font-bold text-brand-muted placeholder:text-brand-muted/50 placeholder:font-normal focus-visible:ring-primary shadow-sm"
                        value={nameSearch}
                        onChange={(e) => {
                            setNameSearch(e.target.value);
                            debouncedSetFilters(e.target.value);
                        }}
                    />
                </div>
            </div>

            {/*---** Main Accordion: Collapsible price and amenity filters **---*/}
            <Accordion type="multiple" defaultValue={["price", "rating"]} className="w-full space-y-3">
                {/*---** Nightly Price Selection Slider **---*/}
                <AccordionItem value="price" className="border-none bg-surface rounded-3xl px-5 py-0 shadow-sm border border-border overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <span className="font-black text-brand-dark text-[15px] tracking-tight">{t("nightlyPrice")}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                        <div className="pt-2 px-1 space-y-6">
                            <div className="flex justify-between items-center bg-surface-muted p-3 rounded-xl border border-border">
                                <div className="flex flex-col items-start">
                                    <span className="text-[9px] uppercase font-black text-brand-muted tracking-widest">{t("max")}</span>
                                    <span className="text-md font-black text-brand-dark">${filters.max_price || 2000}</span>
                                </div>
                                <div className="h-4 w-px bg-border" />
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] uppercase font-black text-brand-muted tracking-widest">{t("min")}</span>
                                    <span className="text-md font-black text-brand-dark">${filters.min_price || 0}</span>
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
                                aria-label={t("nightlyPrice")}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/*---** Star Rating Selection Buttons **---*/}
                <AccordionItem value="rating" className="border-none bg-surface rounded-3xl px-5 py-0 shadow-sm border border-border overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <span className="font-black text-brand-dark text-[15px] tracking-tight">{t("starRating")}</span>
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
                                            "h-10 rounded-xl font-black transition-all active:scale-95 border-border",
                                            isSelected
                                                ? "bg-amber-50 border-amber-400 text-amber-600 shadow-sm"
                                                : "text-brand-muted hover:bg-surface-muted"
                                        )}
                                    >
                                        {star} <Star className={cn("w-3 h-3 ms-1", isSelected ? "fill-amber-400 text-amber-400" : "text-brand-muted/30")} />
                                    </Button>
                                );
                            })}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/*---** Popular Amenities Checkboxes **---*/}
                <AccordionItem value="amenities" className="border-none bg-surface rounded-3xl px-5 py-0 shadow-sm border border-border overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <span className="font-black text-brand-dark text-[15px] tracking-tight">{t("popularFilters")}</span>
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
                                            className="rounded-md border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <label
                                            htmlFor={`amenity-${item.key}`}
                                            className="text-sm font-bold text-brand-muted cursor-pointer group-hover:text-primary transition-colors flex-1"
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

            {/*---** Footer Button: Global filter reset **---*/}
            <div className="pt-2">
                <Button
                    variant="ghost"
                    onClick={handleClearFilters}
                    className="w-full h-12 rounded-2xl text-brand-muted font-bold text-sm hover:bg-brand-light hover:text-brand-dark group"
                >
                    <RotateCcw className="w-4 h-4 me-2 transition-transform group-hover:-rotate-45" />
                    {t("clearAll")}
                </Button>
            </div>
        </div>
    );
}

//---** Helper component for rendering map placeholder graphic **---//
import Image from "next/image";

function ImagePreview() {
    return (
        <Image
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop"
            alt="Map preview showing locations in the current region"
            fill
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
        />
    )
}
