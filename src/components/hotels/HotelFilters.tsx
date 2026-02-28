//---** Hotel side-bar filters with map preview and name search **---//

"use client";

import { useTranslations } from "next-intl";
import { Search, MapIcon, ChevronDown, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import useHotelsStore from "@/store/hotels.store";

interface HotelFiltersProps {
    onViewMap?: () => void;
}

export function HotelFilters({ onViewMap }: HotelFiltersProps) {
    const t = useTranslations("hotels");
    const { filters, setFilters, fetchHotels } = useHotelsStore();

    const handleNameSearch = (val: string) => {
        setFilters({ property_name: val });
        // Optional: debounce this or wait for user to hit enter
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Map Preview Card */}
            <div
                className="group relative cursor-pointer overflow-hidden rounded-[24px] border border-slate-200 bg-white p-1 hover:shadow-xl transition-all duration-500"
                onClick={onViewMap}
            >
                <div className="relative h-[160px] w-full overflow-hidden rounded-[20px]">
                    <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop"
                        alt="Map preview"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
                    />
                    <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-transparent transition-colors" />
                    <Button
                        variant="white"
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-[#051c34] font-black rounded-full h-11 px-6 shadow-xl shadow-black/10 border-none hover:bg-slate-50 active:scale-95 transition-all text-sm whitespace-nowrap"
                    >
                        <MapIcon className="w-4 h-4 me-2 text-primary" />
                        {t("viewInMap")}
                    </Button>
                </div>
            </div>

            {/* Property Name Search */}
            <div className="space-y-3">
                <h3 className="text-lg font-black text-[#051c34] tracking-tight">{t("searchByPropertyName")}</h3>
                <div className="relative">
                    <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="e.g. Marriott"
                        className="h-14 ps-12 rounded-2xl border-slate-200 bg-white font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus-visible:ring-primary shadow-sm"
                        value={filters.property_name || ""}
                        onChange={(e) => handleNameSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Filter Section */}
            <div className="space-y-4">
                <h3 className="text-[22px] font-black text-[#051c34] tracking-tight">{t("filterBy")}</h3>

                <Accordion type="multiple" defaultValue={["recent", "price", "rating"]} className="w-full space-y-4">
                    {/* Recent Filters */}
                    <AccordionItem value="recent" className="border-none bg-white rounded-3xl px-6 py-1 shadow-sm border border-slate-100">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <span className="font-black text-[#051c34] text-sm tracking-tight">{t("recentFilters")}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6">
                            <div className="flex flex-col gap-4 pt-2">
                                <div className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Checkbox id="filter-8plus" className="rounded-md border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                        <label htmlFor="filter-8plus" className="text-sm font-bold text-slate-700 cursor-pointer group-hover:text-primary transition-colors">{t("veryGood")}</label>
                                    </div>

                                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-500">367</span>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Popular Filters */}
                    <AccordionItem value="popular" className="border-none bg-white rounded-3xl px-6 py-1 shadow-sm border border-slate-100">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <span className="font-black text-[#051c34] text-sm tracking-tight">{t("popularFilters")}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6">
                            <div className="flex flex-col gap-4 pt-2">
                                {[
                                    { key: "breakfast", label: t("breakfast") },
                                    { key: "wifi", label: t("wifi") },
                                    { key: "pool", label: t("pool") },
                                    { key: "shuttle", label: t("shuttle") }
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <Checkbox id={`pop-${item.key}`} className="rounded-md border-slate-300" />
                                            <label htmlFor={`pop-${item.key}`} className="text-sm font-bold text-slate-700 cursor-pointer">{item.label}</label>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </AccordionContent>
                    </AccordionItem>

                    {/* Nightly Price Slider */}
                    <AccordionItem value="price" className="border-none bg-white rounded-3xl px-6 py-1 shadow-sm border border-slate-100">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <span className="font-black text-[#051c34] text-sm tracking-tight">{t("nightlyPrice")}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6">
                            <div className="pt-4 px-2 space-y-6">
                                <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{t("min")}</span>
                                        <span className="text-lg font-black text-[#051c34]">$50</span>
                                    </div>
                                    <div className="h-4 w-px bg-slate-200" />
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{t("max")}</span>
                                        <span className="text-lg font-black text-[#051c34]">$950</span>
                                    </div>
                                </div>

                                <Slider defaultValue={[50, 950]} max={2000} step={10} className="text-primary" />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Star Rating Selection */}
                    <AccordionItem value="rating" className="border-none bg-white rounded-3xl px-6 py-1 shadow-sm border border-slate-100">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <span className="font-black text-[#051c34] text-sm tracking-tight">{t("starRating")}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6">
                            <div className="grid grid-cols-5 gap-2 pt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Button
                                        key={star}
                                        variant="outline"
                                        className="h-11 rounded-xl font-black text-slate-700 hover:bg-primary/5 hover:border-primary hover:text-primary border-slate-200 transition-all active:scale-95"
                                    >
                                        {star} <Star className="w-3 h-3 ms-1 fill-current" />
                                    </Button>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}
