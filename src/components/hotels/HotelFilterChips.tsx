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
    if (filters.rating) activeFilters.push({ id: "rating", label: `Very good ${filters.rating}+`, value: filters.rating });
    if (filters.property_name) activeFilters.push({ id: "property_name", label: filters.property_name, value: filters.property_name });

    const handleRemoveFilter = (id: string) => {
        if (id === "rating") setFilters({ rating: undefined });
        if (id === "property_name") setFilters({ property_name: "" });
        fetchHotels();
    };

    return (
        <div className="w-full space-y-4 mb-6 pt-1">
            <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((filter) => (
                    <Badge
                        key={filter.id}
                        className="bg-white border-2 border-indigo-500 hover:border-indigo-600 text-slate-800 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm group transition-all"
                    >
                        {filter.label}
                        <button
                            onClick={() => handleRemoveFilter(filter.id)}
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
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 px-2 h-8"
                        onClick={() => {
                            setFilters({
                                rating: undefined,
                                property_name: "",
                                amenities: [],
                                min_price: undefined,
                                max_price: undefined
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
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        {pagination.records_to || hotels.length}+ {t("properties") || "properties"}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <span>{t("sortOrder")}</span>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="w-3.5 h-3.5 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[240px] bg-slate-900 text-white text-xs border-none p-3 shadow-xl">
                                    <p>{t("sortDescription")}</p>
                                </TooltipContent>

                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider hidden md:block">{t("sortBy")}:</span>
                    <Select defaultValue="recommended">
                        <SelectTrigger className="w-full sm:w-[220px] h-11 border-slate-200 focus:ring-indigo-100 focus:border-indigo-400 rounded-xl bg-white text-sm font-bold shadow-sm transition-all text-slate-700">
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
