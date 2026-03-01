//---** Active filter chips and sorting header for hotel results **---//

"use client";

import { useTranslations } from "next-intl";
import { X, Info } from "lucide-react";
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

    //---** Build the list of active filter objects based on current state **---//
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

    //---** Execute filter removal and trigger a fresh data fetch **---//
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
            {/*---** Container for active filter badges **---*/}
            <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((filter) => (
                    <Badge
                        key={filter.id}
                        className="bg-surface border-2 border-border hover:border-primary/50 text-brand-muted flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm group transition-all"
                    >
                        {filter.label}
                        <button
                            onClick={() => handleRemoveFilter(filter)}
                            className="bg-surface-muted group-hover:bg-brand-light p-0.5 rounded-full text-brand-muted/70 hover:text-brand-dark transition-colors"
                            aria-label={`${t("clearAll")} ${filter.label}`}
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </Badge>
                ))}

                {/*---** Global clear button appearing when filters exist **---*/}
                {activeFilters.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-bold text-brand-muted/70 hover:text-brand-dark px-2 h-8 hover:bg-surface-muted rounded-full"
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

            {/*---** Results count and sorting dropdown row **---*/}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
                <div className="space-y-0.5">
                    <h2 className="text-xl font-bold text-brand-dark tracking-tight flex items-center gap-3">
                        <span className="text-white font-bold text-xl bg-primary px-2 py-1 rounded-full">{hotels.length}+</span> {t("properties")}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-brand-muted/70 font-medium lowercase">
                        <span>{t("sortOrder")}</span>

                        {/*---** Informational tooltip for sorting logic **---*/}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="w-3.5 h-3.5 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[240px] bg-brand-dark text-white text-xs border-none p-3 shadow-xl rounded-xl">
                                    <p>{t("sortDescription")}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/*---** Sort order selection control **---*/}
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-brand-muted/50 font-black uppercase tracking-widest hidden md:block">{t("sortBy")}:</span>
                    <Select value={filters.sort_by || "recommended"} onValueChange={(val) => {
                        setFilters({ sort_by: val });
                        setTimeout(() => fetchHotels(), 0);
                    }}>
                        <SelectTrigger className="w-full sm:w-[220px] h-11 border-border focus:ring-primary/20 focus:border-primary rounded-xl bg-surface text-sm font-bold shadow-sm transition-all text-brand-muted">
                            <SelectValue placeholder={t("sortBy")} />
                        </SelectTrigger>

                        <SelectContent className="rounded-xl border-border shadow-2xl p-1 bg-surface">
                            <SelectItem value="recommended" className="rounded-lg py-2.5 font-medium focus:bg-surface-muted hover:bg-surface-muted transition-colors">{t("sortRecommended")}</SelectItem>
                            <SelectItem value="price_asc" className="rounded-lg py-2.5 font-medium focus:bg-surface-muted hover:bg-surface-muted transition-colors">{t("sortPriceAsc")}</SelectItem>
                            <SelectItem value="rating" className="rounded-lg py-2.5 font-medium focus:bg-surface-muted hover:bg-surface-muted transition-colors">{t("sortRating")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
