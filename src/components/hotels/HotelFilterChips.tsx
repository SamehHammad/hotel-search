"use client";

import { useTranslations } from "next-intl";
import { X, SlidersHorizontal, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import useHotelsStore from "@/store/hotels.store";

export function HotelFilterChips() {
    const t = useTranslations("hotels");
    const { filters, pagination, setFilters, fetchHotels, hotels } = useHotelsStore();

    const activeFilters = [];
    if (filters.property_name) activeFilters.push({ id: "property_name", label: filters.property_name, value: filters.property_name });

    if (filters.min_price || (filters.max_price && filters.max_price < 2000)) {
        activeFilters.push({
            id: "price",
            label: `$${filters.min_price || 0} - $${filters.max_price || 2000}`,
            value: [filters.min_price, filters.max_price]
        });
    }

    if (filters.hotel_stars?.length) {
        filters.hotel_stars.forEach(star => {
            activeFilters.push({ id: `star-${star}`, label: `${star} ${t("stars")}`, value: star, type: "star" });
        });
    }

    if (filters.amenities?.length) {
        filters.amenities.forEach(amenity => {
            activeFilters.push({ id: `amenity-${amenity}`, label: t(amenity), value: amenity, type: "amenity" });
        });
    }

    const handleRemoveFilter = (filter: any) => {
        if (filter.id === "property_name") setFilters({ property_name: "" });
        else if (filter.id === "price") setFilters({ min_price: 0, max_price: 2000 });
        else if (filter.type === "star") {
            setFilters({ hotel_stars: filters.hotel_stars?.filter(s => s !== filter.value) });
        }
        else if (filter.type === "amenity") {
            setFilters({ amenities: filters.amenities?.filter(a => a !== filter.value) });
        }
        fetchHotels();
    };

    return (
        <div className="w-full space-y-4 mb-6 pt-1">
            <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((filter) => (
                    <Badge
                        key={filter.id}
                        className="bg-white border-2 border-indigo-100/50 hover:border-indigo-400 text-slate-700 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm group transition-all"
                    >
                        {filter.label}
                        <button
                            onClick={() => handleRemoveFilter(filter)}
                            className="bg-slate-50 group-hover:bg-slate-100 p-0.5 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </Badge>
                ))}

                {activeFilters.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 px-2 h-8 hover:bg-slate-50 rounded-full"
                        onClick={() => {
                            setFilters({
                                property_name: "",
                                amenities: [],
                                hotel_stars: [],
                                min_price: 0,
                                max_price: 2000
                            });
                            fetchHotels();
                        }}
                    >
                        {t("clearAll")}
                    </Button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                    <h2 className="text-xl font-bold text-[#051c34] tracking-tight flex items-center gap-3">
                        {pagination.records_to || hotels.length}+ {t("properties")}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium lowercase">
                        <span>{t("sortOrder")}</span>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="w-3.5 h-3.5 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[240px] bg-slate-900 text-white text-xs border-none p-3 shadow-xl rounded-xl">
                                    <p>{t("sortDescription")}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest hidden md:block">{t("sortBy")}:</span>
                    <Select defaultValue="recommended" onValueChange={(val) => {
                        setFilters({ sort_by: val });
                        fetchHotels();
                    }}>
                        <SelectTrigger className="w-full sm:w-[220px] h-11 border-slate-200 focus:ring-primary/20 focus:border-primary rounded-xl bg-white text-sm font-bold shadow-sm transition-all text-slate-700">
                            <SelectValue placeholder={t("sortBy")} />
                        </SelectTrigger>

                        <SelectContent className="rounded-xl border-slate-100 shadow-2xl p-1 bg-white">
                            <SelectItem value="recommended" className="rounded-lg py-2.5 font-medium focus:bg-indigo-50 hover:bg-slate-50 transition-colors">{t("sortRecommended")}</SelectItem>
                            <SelectItem value="price_asc" className="rounded-lg py-2.5 font-medium focus:bg-indigo-50 hover:bg-slate-50 transition-colors">{t("sortPriceAsc")}</SelectItem>
                            <SelectItem value="rating" className="rounded-lg py-2.5 font-medium focus:bg-indigo-50 hover:bg-slate-50 transition-colors">{t("sortRating")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
