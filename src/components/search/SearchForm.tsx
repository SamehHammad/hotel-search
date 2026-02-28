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
    Map,
    Calendar,
    Users
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

    // Helper to safely parse date strings from URL or constants
    const safeDateParse = (dateStr: string | null | undefined, fallback: Date) => {
        if (!dateStr) return fallback;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? fallback : d;
    };

    // Initial dates: search params > default filters > generic today/tomorrow
    const defaultCheckIn = new Date();
    const defaultCheckOut = new Date(Date.now() + 86400000);

    // Local state for the form, initialized from URL search params
    const [location, setLocation] = useState(searchParams.get("q") || t("defaultCity"));

    const [checkIn, setCheckIn] = useState<Date | undefined>(
        safeDateParse(searchParams.get("check_in_date") || DEFAULT_SEARCH_FILTERS.check_in_date, defaultCheckIn)
    );
    const [checkOut, setCheckOut] = useState<Date | undefined>(
        safeDateParse(searchParams.get("check_out_date") || DEFAULT_SEARCH_FILTERS.check_out_date, defaultCheckOut)
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
            return;
        }
        const isValidDate = (d: any): d is Date => d instanceof Date && !isNaN(d.getTime());
        const checkInStr = isValidDate(checkIn) ? format(checkIn, "yyyy-MM-dd") : (DEFAULT_SEARCH_FILTERS.check_in_date || "");
        const checkOutStr = isValidDate(checkOut) ? format(checkOut, "yyyy-MM-dd") : (DEFAULT_SEARCH_FILTERS.check_out_date || "");

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
    const cityName = location.split(",")[0] || t("defaultCity");


    return (
        <div className={cn(
            "flex flex-col gap-6 w-full transition-all duration-300",
            !isHeader && "bg-white p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-slate-100",
            isHeader && "bg-white p-0",
            className
        )}>
            {/* Header Variant Dynamic Title */}
            {isHeader && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#051c34] tracking-tight">
                        {t("explore")} <span className="text-primary">{cityName}</span>
                    </h1>

                </div>
            )}

            {/* Main Search Logic Container */}
            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
                {/* Where to? Box */}
                <div className={cn(
                    "flex flex-col gap-1 px-4 py-2 bg-white border border-slate-200 rounded-2xl flex-[1.5] relative min-w-[200px]",
                    isHeader ? "h-[72px] justify-center" : "h-20 justify-center"
                )}>
                    <label className="text-[11px] font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-900" />
                        {t("locationLabel")}
                    </label>
                    <div className="relative w-full" ref={suggestionsRef}>
                        <Input
                            value={location}
                            onChange={(e) => handleLocationChange(e.target.value)}
                            onFocus={() => location.length >= 2 && setShowSuggestions(true)}
                            placeholder={t("locationPlaceholder")}
                            className="h-8 p-0 border-none shadow-none focus-visible:ring-0 font-bold text-slate-600 text-[15px] placeholder:text-slate-400 placeholder:font-normal"
                            required
                            autoComplete="off"
                        />
                        {showSuggestions && (
                            <div className="absolute top-[calc(100%+12px)] start-[-16px] end-[-16px] bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-[110] overflow-hidden">
                                <div className="max-h-[300px] overflow-y-auto px-2">
                                    {suggestions.map((city) => (
                                        <button key={city.id} type="button" onClick={() => handleSelectSuggestion(city)} className="w-full px-4 py-3 flex items-center gap-4 hover:bg-slate-50 rounded-xl transition-all text-left group">
                                            <div className="bg-slate-100 p-2.5 rounded-xl text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
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

                {/* Dates Box */}
                <div className={cn(
                    "flex flex-col gap-1 px-4 py-2 bg-white border border-slate-200 rounded-2xl flex-1 relative min-w-[200px]",
                    isHeader ? "h-[72px] justify-center" : "h-20 justify-center"
                )}>
                    <label className="text-[11px] font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-900" />
                        {t("datesLabel")}
                    </label>
                    <div className="flex items-center gap-1 w-full">
                        <DatePicker
                            date={checkIn}
                            onSelect={setCheckIn}
                            variant="minimal"
                            label={t("checkInLabel")}
                        />
                        <span className="text-slate-300">-</span>
                        <DatePicker
                            date={checkOut}
                            onSelect={setCheckOut}
                            variant="minimal"
                            minDate={checkIn}
                            label={t("checkOutLabel")}
                        />
                    </div>
                </div>

                {/* Travellers Box */}
                <div className={cn(
                    "flex flex-col gap-1 px-4 py-2 bg-white border border-slate-200 rounded-2xl flex-1 relative min-w-[180px]",
                    isHeader ? "h-[72px] justify-center" : "h-20 justify-center"
                )}>
                    <label className="text-[11px] font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-900" />
                        {t("guestsLabel")}
                    </label>
                    <GuestsSelector
                        variant="minimal"
                        adults={guests.adults}
                        childrenCount={guests.children}
                        onAdultsChange={(adults) => setGuests((g) => ({ ...g, adults }))}
                        onChildrenChange={(children) => setGuests((g) => ({ ...g, children }))}
                    />
                </div>

                {/* Circle Search Button */}
                <Button
                    type="submit"
                    className={cn(
                        "rounded-full p-0 flex items-center justify-center bg-[#051c34] hover:bg-[#0a2f58] shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0",
                        isHeader ? "w-[56px] h-[56px]" : "w-16 h-16"
                    )}
                >
                    <Search className="h-6 w-6 text-white" />
                </Button>
            </form>
        </div>
    );
}
