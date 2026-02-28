//---** Main Search Form orchestrating destination, dates, and guests **---//

"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
    Search,
    MapPin,
    Loader2,
    Sparkles,
    SlidersHorizontal,
    ChevronDown,
    Map
} from "lucide-react";
import useHotelsStore from "@/store/hotels.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "./DatePicker";
import { GuestsSelector } from "./GuestsSelector";
import { DEFAULT_SEARCH_FILTERS } from "@/lib/constants";
import Fuse from "fuse.js";
import { CITY_SUGGESTIONS } from "@/data/suggestions";
import { cn } from "@/lib/utils";

interface SearchFormProps {
    className?: string;
    variant?: "hero" | "header";
}

export function SearchForm({ className = "", variant = "hero" }: SearchFormProps) {
    const t = useTranslations("search");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Local state for the form, initialized from URL search params
    const [location, setLocation] = useState(searchParams.get("q") || "Dubai");
    const [checkIn, setCheckIn] = useState<Date | undefined>(
        searchParams.get("check_in_date") ? new Date(searchParams.get("check_in_date")!) : new Date(DEFAULT_SEARCH_FILTERS.check_in_date)
    );
    const [checkOut, setCheckOut] = useState<Date | undefined>(
        searchParams.get("check_out_date") ? new Date(searchParams.get("check_out_date")!) : new Date(DEFAULT_SEARCH_FILTERS.check_out_date)
    );
    const [guests, setGuests] = useState({
        adults: parseInt(searchParams.get("adults") || String(DEFAULT_SEARCH_FILTERS.guests.adults), 10),
        children: parseInt(searchParams.get("children") || String(DEFAULT_SEARCH_FILTERS.guests.children), 10),
    });

    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Local Fuse instance for instant searching
    const fuse = useRef(new Fuse(CITY_SUGGESTIONS, {
        keys: ["name", "country"],
        threshold: 0.4,
        distance: 100,
        includeScore: true
    }));

    const [bestMatch, setBestMatch] = useState<any>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLocationChange = (val: string) => {
        setLocation(val);
        if (val.length < 2) {
            setSuggestions([]); setBestMatch(null); setShowSuggestions(false);
            return;
        }
        const results = fuse.current.search(val);
        const mappedResults = results.map(r => r.item).slice(0, 5);
        setSuggestions(mappedResults);
        if (results.length > 0 && results[0].score! > 0.1) setBestMatch(results[0].item);
        else setBestMatch(null);
        setShowSuggestions(mappedResults.length > 0);
    };

    const handleSelectSuggestion = (city: any) => {
        setLocation(`${city.name}, ${city.country}`);
        setShowSuggestions(false);
        if (variant === "header") {
            const params = new URLSearchParams(searchParams.toString());
            params.set("q", `${city.name}, ${city.country}`);
            router.push(`${pathname}?${params.toString()}`);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!location.trim()) return;
        if (checkIn && checkOut && checkOut <= checkIn) {
            alert(t("validation.dateOrder"));
            return;
        }
        const checkInStr = checkIn ? format(checkIn, "yyyy-MM-dd") : DEFAULT_SEARCH_FILTERS.check_in_date;
        const checkOutStr = checkOut ? format(checkOut, "yyyy-MM-dd") : DEFAULT_SEARCH_FILTERS.check_out_date;

        const params = new URLSearchParams(searchParams.toString());
        params.set("q", location);
        params.set("check_in_date", checkInStr);
        params.set("check_out_date", checkOutStr);
        params.set("adults", String(guests.adults));
        params.set("children", String(guests.children));
        params.delete("bounds");
        params.delete("page");

        if (variant === "hero") router.push(`/hotels?${params.toString()}`);
        else router.push(`${pathname}?${params.toString()}`);
    };

    const isHeader = variant === "header";
    const cityName = location.split(",")[0] || "Dubai";

    return (
        <div className={cn(
            "flex flex-col gap-6 w-full transition-all duration-300",
            !isHeader && "bg-white p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-slate-100",
            isHeader && "bg-slate-50/80 backdrop-blur-sm p-4 rounded-3xl border border-slate-200",
            className
        )}>
            {/* Header Variant Dynamic Title */}
            {isHeader && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Explore <span className="text-primary">{cityName}</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="rounded-full border-slate-200 h-10 px-6 font-bold text-slate-700 bg-white">
                            <Map className="w-4 h-4 me-2 text-primary" />
                            Show Map
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Search Logic Container */}
            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4 w-full">
                {/* Destination Block */}
                <div className="flex flex-col gap-1.5 flex-[1.5] w-full min-w-[240px]">
                    <label htmlFor="location" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ps-1">
                        {t("locationLabel")}
                    </label>
                    <div className="relative" ref={suggestionsRef}>
                        <MapPin className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                        <Input
                            id="location"
                            value={location}
                            onChange={(e) => handleLocationChange(e.target.value)}
                            onFocus={() => location.length >= 2 && setShowSuggestions(true)}
                            placeholder={t("locationPlaceholder")}
                            className="ps-11 h-14 bg-white rounded-2xl shadow-sm border-slate-200 focus-visible:ring-primary w-full font-bold text-slate-700 text-base"
                            required
                            autoComplete="off"
                        />
                        {/* Enhanced Suggestions Menu */}
                        {showSuggestions && (
                            <div className="absolute top-[calc(100%+8px)] start-0 end-0 bg-white rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-3 z-[110] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-400">
                                {bestMatch && location.toLowerCase() !== bestMatch.name.toLowerCase() && (
                                    <div className="px-5 py-3 mb-2 border-b border-slate-50 bg-primary/5">
                                        <button type="button" onClick={() => handleSelectSuggestion(bestMatch)} className="flex items-center gap-3 text-primary text-sm font-bold hover:underline">
                                            <Sparkles className="w-4 h-4" />
                                            <span>Suggested: {bestMatch.name}, {bestMatch.country}</span>
                                        </button>
                                    </div>
                                )}
                                <div className="max-h-[300px] overflow-y-auto px-2">
                                    {suggestions.map((city) => (
                                        <button key={city.id} type="button" onClick={() => handleSelectSuggestion(city)} className="w-full px-4 py-3 flex items-center gap-4 hover:bg-slate-50 rounded-xl transition-all text-left group">
                                            <div className="bg-slate-100 p-3 rounded-xl text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm group-hover:text-primary">{city.name}</div>
                                                <div className="text-[11px] text-slate-400 font-medium">{city.country}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Date Selection Blocks */}
                <div className="flex flex-1 items-center gap-4 w-full">
                    <DatePicker label={t("checkInLabel")} date={checkIn} onSelect={setCheckIn} />
                    <DatePicker label={t("checkOutLabel")} date={checkOut} onSelect={setCheckOut} minDate={checkIn} />
                </div>

                {/* Guests Selection Block */}
                <GuestsSelector
                    adults={guests.adults}
                    childrenCount={guests.children}
                    onAdultsChange={(adults) => setGuests((g) => ({ ...g, adults }))}
                    onChildrenChange={(children) => setGuests((g) => ({ ...g, children }))}
                />

                {/* Modern CTA Button */}
                <Button type="submit" size="lg" className="h-14 px-10 rounded-2xl font-extrabold text-lg shadow-xl shadow-primary/30 shrink-0 transition-all hover:scale-[1.02] active:scale-95">
                    <Search className="me-2 h-6 w-6" />
                    {t("searchButton")}
                </Button>
            </form>

            {/* Header Variant Filter Bar */}
            {isHeader && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth pt-2 border-t border-slate-200">
                    <Button variant="outline" className="rounded-full h-10 px-5 shrink-0 font-bold text-slate-700 bg-white border-slate-200 hover:border-primary gap-2">
                        <SlidersHorizontal className="w-4 h-4" />
                        Quick Filters
                    </Button>
                    <div className="h-5 w-px bg-slate-200 mx-1" />
                    {["Price Range", "Star Rating", "Amenities", "Property Type"].map((filter) => (
                        <Button key={filter} variant="outline" className="rounded-full h-10 px-5 shrink-0 font-bold text-slate-600 bg-white border-slate-200 hover:border-primary gap-2 transition-all">
                            {filter}
                            <ChevronDown className="w-4 h-4 opacity-40" />
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
