//---** Main Search Form orchestrating destination, dates, and guests **---//

"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Search, MapPin } from "lucide-react";
import useHotelsStore from "@/store/hotels.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "./DatePicker";
import { GuestsSelector } from "./GuestsSelector";
import { DEFAULT_SEARCH_FILTERS } from "@/lib/constants";
import { Loader2, Sparkles } from "lucide-react";
import Fuse from "fuse.js";
import { CITY_SUGGESTIONS } from "@/data/suggestions";

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
    const [location, setLocation] = useState(searchParams.get("q") || "");
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
            setSuggestions([]);
            setBestMatch(null);
            setShowSuggestions(false);
            return;
        }

        const results = fuse.current.search(val);
        const mappedResults = results.map(r => r.item).slice(0, 5);

        setSuggestions(mappedResults);

        // "Did you mean" logic: if top result score is good but user hasn't typed it exactly
        if (results.length > 0 && results[0].score! > 0.1) {
            setBestMatch(results[0].item);
        } else {
            setBestMatch(null);
        }

        setShowSuggestions(mappedResults.length > 0);
    };

    const handleSelectSuggestion = (city: any) => {
        setLocation(`${city.name}, ${city.country}`);
        setShowSuggestions(false);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!location.trim()) return;

        // Apply basic validation
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

        // Navigate to hotels page with shared URL state
        if (variant === "hero") {
            router.push(`/hotels?${params.toString()}`);
        } else {
            router.push(`${pathname}?${params.toString()}`);
        }
    };

    const isHero = variant === "hero";

    return (
        <form
            onSubmit={handleSubmit}
            className={`bg-white p-3 rounded-2xl shadow-xl flex flex-col md:flex-row items-end gap-3 mx-auto w-full max-w-5xl ${className}`}
        >
            {/* Location Input */}
            <div className="flex flex-col gap-1.5 flex-1 w-full min-w-[200px]">
                <label
                    htmlFor="location"
                    className="text-xs font-semibold text-slate-500 uppercase tracking-wider ps-1"
                >
                    {t("locationLabel")}
                </label>
                <div className="relative" ref={suggestionsRef}>
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
                    <Input
                        id="location"
                        value={location}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        onFocus={() => location.length >= 2 && setShowSuggestions(true)}
                        placeholder={t("locationPlaceholder")}
                        className="pl-10 h-12 bg-white rounded-xl shadow-sm border-slate-200 focus-visible:ring-indigo-500 w-full"
                        required
                        autoComplete="off"
                    />
                    {/* Suggestions Dropdown */}
                    {showSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* "Did you mean" Suggestion */}
                            {bestMatch && location.toLowerCase() !== bestMatch.name.toLowerCase() && (
                                <div className="px-4 py-2 border-b border-slate-50 bg-indigo-50/30">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectSuggestion(bestMatch)}
                                        className="flex items-center gap-2 text-indigo-600 text-xs font-semibold hover:underline"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>Did you mean: {bestMatch.name}, {bestMatch.country}?</span>
                                    </button>
                                </div>
                            )}

                            <div className="max-h-60 overflow-y-auto">
                                {suggestions.map((city) => (
                                    <button
                                        key={city.id}
                                        type="button"
                                        onClick={() => handleSelectSuggestion(city)}
                                        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left"
                                    >
                                        <div className="bg-slate-100 p-2 rounded-lg">
                                            <MapPin className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-800 line-clamp-1">{city.name}</div>
                                            <div className="text-xs text-slate-500 line-clamp-1">{city.country}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Check In Date */}
            <DatePicker
                label={t("checkInLabel")}
                date={checkIn}
                onSelect={setCheckIn}
            />

            {/* Check Out Date */}
            <DatePicker
                label={t("checkOutLabel")}
                date={checkOut}
                onSelect={setCheckOut}
                minDate={checkIn}
            />

            {/* Guests Selector */}
            <GuestsSelector
                adults={guests.adults}
                childrenCount={guests.children}
                onAdultsChange={(adults) => setGuests((g) => ({ ...g, adults }))}
                onChildrenChange={(children) => setGuests((g) => ({ ...g, children }))}
            />

            {/* Submit Button */}
            <Button
                type="submit"
                className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-md w-full md:w-auto shrink-0 transition-transform active:scale-95"
            >
                <Search className="mr-2 h-5 w-5" />
                {t("searchButton")}
            </Button>
        </form>
    );
}
