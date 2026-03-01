//---** Main Search Form orchestrating destination, dates, and guests **---//

"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { Search, MapPin, Calendar } from "lucide-react";
import useHotelsStore from "@/store/hotels.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "./DatePicker";
import { GuestsSelector } from "./GuestsSelector";
import { DEFAULT_SEARCH_FILTERS } from "@/lib/constants";
import { RoomConfig } from "@/types/search.types";
import Fuse from "fuse.js";
import { CITY_SUGGESTIONS, CitySuggestion } from "@/data/suggestions";
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
    const locale = useLocale();

    //---** Helper function to safely parse date strings from URL parameters **---//
    const safeDateParse = (dateStr: string | null | undefined, fallback: Date) => {
        if (!dateStr) return fallback;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? fallback : d;
    };

    //---** Initialize default dates for initial state **---//
    const defaultCheckIn = new Date();
    const defaultCheckOut = new Date(Date.now() + 86400000);

    const isWishlistMode = searchParams.get("wishlist") === "true";

    const [location, setLocation] = useState(
        isWishlistMode ? t("wishlistTitle") : (searchParams.get("q") || t("defaultCity"))
    );

    const [resolvedEnglishName, setResolvedEnglishName] = useState<string>(
        isWishlistMode ? "Wishlist" : (searchParams.get("q") || t("defaultCity"))
    );

    const [checkIn, setCheckIn] = useState<Date | undefined>(
        safeDateParse(searchParams.get("check_in_date") || DEFAULT_SEARCH_FILTERS.check_in_date, defaultCheckIn)
    );
    const [checkOut, setCheckOut] = useState<Date | undefined>(
        safeDateParse(searchParams.get("check_out_date") || DEFAULT_SEARCH_FILTERS.check_out_date, defaultCheckOut)
    );

    //---** Reconstruct room configuration from URL parameters **---//
    const initAdults = parseInt(searchParams.get("adults") || "2", 10);
    const initChildren = parseInt(searchParams.get("children") || "0", 10);
    const initRoomsCount = parseInt(searchParams.get("rooms_count") || "1", 10);
    const initialRooms = (): RoomConfig[] => {
        const adultsPerRoom = Math.max(1, Math.floor(initAdults / initRoomsCount));
        return Array.from({ length: initRoomsCount }, () => ({
            adults: adultsPerRoom,
            children: 0,
        }));
    };

    const [rooms, setRooms] = useState<RoomConfig[]>(initialRooms());
    const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    //---** Initialize fuzzy search engine with city suggestions data **---//
    const fuse = useRef(
        new Fuse(CITY_SUGGESTIONS, {
            keys: ["name", "country", "aliases"],
            threshold: 0.35,
            distance: 200,
            includeScore: true,
            useExtendedSearch: false,
        })
    );

    //---** Dismiss suggestions dropdown when clicking outside the component **---//
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    //---** Search for cities matching the input string using exact and fuzzy logic **---//
    const searchCities = (val: string): CitySuggestion[] => {
        const lower = val.toLowerCase().trim();
        if (!lower) return [];

        //---** Try an exact alias match first to favor Arabic and precise inputs **---//
        const exactMatches = CITY_SUGGESTIONS.filter(
            (c) =>
                c.name.toLowerCase() === lower ||
                c.aliases.some((a) => a === lower || a.includes(lower) || lower.includes(a))
        );
        if (exactMatches.length > 0) return exactMatches.slice(0, 5);

        //---** Fall back to fuzzy matching for approximate search terms **---//
        const results = fuse.current.search(val);
        return results.map((r) => r.item).slice(0, 5);
    };

    //---** Update search suggestions based on current input value **---//
    const handleLocationChange = (val: string) => {
        setLocation(val);
        setResolvedEnglishName(val);

        if (val.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const found = searchCities(val);
        setSuggestions(found);
        setShowSuggestions(found.length > 0);
    };

    //---** Finalize location selection and update navigation parameters **---//
    const handleSelectSuggestion = (city: CitySuggestion, displayText?: string) => {
        const display = displayText ?? `${city.name}, ${city.country}`;
        setLocation(display);
        setResolvedEnglishName(city.name);
        setSuggestions([]);
        setShowSuggestions(false);

        if (variant === "header") {
            const params = new URLSearchParams(searchParams.toString());
            params.set("q", city.name);
            router.push(`${pathname}?${params.toString()}`);
        }
    };

    //---** Process search form submission and navigate to results page **---//
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!location.trim()) return;
        if (checkIn && checkOut && checkOut <= checkIn) return;

        const isValidDate = (d: any): d is Date => d instanceof Date && !isNaN(d.getTime());
        const checkInStr = isValidDate(checkIn)
            ? format(checkIn, "yyyy-MM-dd")
            : DEFAULT_SEARCH_FILTERS.check_in_date || "";
        const checkOutStr = isValidDate(checkOut)
            ? format(checkOut, "yyyy-MM-dd")
            : DEFAULT_SEARCH_FILTERS.check_out_date || "";

        const totalAdults = rooms.reduce((acc, r) => acc + r.adults, 0);
        const totalChildren = rooms.reduce((acc, r) => acc + r.children, 0);

        let queryValue = resolvedEnglishName;

        //---** Attempt to resolve untrusted manual input into valid city names **---//
        if (queryValue === location) {
            const found = searchCities(location);
            if (found.length > 0) {
                queryValue = found[0].name;
                setResolvedEnglishName(found[0].name);
            }
        }

        const params = new URLSearchParams(searchParams.toString());

        //---** Toggle between wishlist view and specific location query results **---//
        if (queryValue === "Wishlist" || queryValue === t("wishlistTitle")) {
            params.set("wishlist", "true");
            params.delete("q");
        } else {
            params.set("q", queryValue);
            params.delete("wishlist");
        }

        params.set("check_in_date", checkInStr);
        params.set("check_out_date", checkOutStr);
        params.set("adults", String(totalAdults));
        params.set("children", String(totalChildren));
        params.set("rooms_count", String(rooms.length));
        params.delete("bounds");
        params.delete("page");

        if (variant === "hero") router.push(`/hotels?${params.toString()}`);
        else router.push(`${pathname}?${params.toString()}`);
    };

    const isHeader = variant === "header";

    return (
        <div className={cn(
            "flex flex-col gap-6 w-full transition-all duration-300",
            !isHeader && "bg-surface p-6 sm:p-8 rounded-4xl shadow-2xl border border-border",
            isHeader && "bg-surface p-0",
            className
        )}>
            {/*---** Form container orchestrating the primary search inputs with responsive grid **---*/}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row items-stretch lg:items-center gap-3 w-full">

                    {/*---** Destination/Location input section **---*/}
                    <div className={cn(
                        "flex flex-col gap-1 px-4 py-2 bg-surface border border-border rounded-2xl lg:flex-[1.5] relative min-w-0 md:min-w-[200px]",
                        isHeader ? "h-[72px] justify-center" : "h-20 justify-center"
                    )}>
                        <label className="text-[11px] font-bold text-brand-dark flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-brand-dark" />
                            {t("locationLabel")}
                        </label>
                        <div className="relative w-full" ref={suggestionsRef}>
                            <Input
                                value={location}
                                onChange={(e) => handleLocationChange(e.target.value)}
                                onFocus={() => location.length >= 2 && setShowSuggestions(suggestions.length > 0)}
                                placeholder={t("locationPlaceholder")}
                                className="h-8 p-0 text-start border-none shadow-none focus-visible:ring-0 font-bold text-brand-muted text-[15px] placeholder:text-brand-muted/50 placeholder:font-normal"
                                required
                                autoComplete="off"
                            />
                            {/*---** Fuzzy search suggestions dropdown results **---*/}
                            {showSuggestions && (
                                <div className="absolute top-[calc(100%+12px)] start-[-16px] end-[-16px] bg-surface rounded-2xl shadow-2xl border border-border py-3 z-[110] overflow-hidden">
                                    <div className="max-h-[300px] overflow-y-auto px-2">
                                        {suggestions.map((city) => (
                                            <button
                                                key={city.id}
                                                type="button"
                                                onClick={() => handleSelectSuggestion(city, `${city.name}, ${city.country}`)}
                                                className="w-full px-4 py-3 flex items-center gap-4 hover:bg-surface-muted rounded-xl transition-all text-left group"
                                            >
                                                <div className="bg-surface-muted p-2.5 rounded-xl text-brand-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <MapPin className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-brand-dark text-sm group-hover:text-primary">{city.name}</div>
                                                    <div className="text-[11px] text-brand-muted font-medium">{city.country}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/*---** Date selection section **---*/}
                    <div className={cn(
                        "flex items-center bg-surface border border-border rounded-2xl divide-x divide-border lg:flex-[1.2] relative min-w-0 md:min-w-[320px]",
                        isHeader ? "h-[72px]" : "h-20"
                    )}>
                        {/*---** Check-in Date **---*/}
                        <div className="flex-1 flex flex-col justify-center px-4 h-full hover:bg-surface-muted transition-colors rounded-s-2xl cursor-pointer">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-0.5 text-start">
                                {t("checkInLabel")}
                            </label>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                                <DatePicker
                                    date={checkIn}
                                    onSelect={setCheckIn}
                                    variant="minimal"
                                    label={t("checkInLabel")}
                                />
                            </div>
                        </div>

                        {/*---** Check-out Date **---*/}
                        <div className="flex-1 flex flex-col justify-center px-4 h-full hover:bg-surface-muted transition-colors rounded-e-2xl cursor-pointer">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-0.5 text-start">
                                {t("checkOutLabel")}
                            </label>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                                <DatePicker
                                    date={checkOut}
                                    onSelect={setCheckOut}
                                    variant="minimal"
                                    minDate={checkIn}
                                    label={t("checkOutLabel")}
                                />
                            </div>
                        </div>
                    </div>

                    {/*---** Guest selection and Search button - Integrated for better mobile flow **---*/}
                    <div className={cn(
                        "flex flex-row items-center gap-2 md:col-span-2 lg:col-span-1 lg:flex-1",
                    )}>
                        <div className={cn(
                            "bg-surface border border-border rounded-2xl flex-1 relative min-w-0 transition-all hover:border-primary/30 flex items-center px-4",
                            isHeader ? "h-[72px]" : "h-20"
                        )}>
                            <GuestsSelector
                                variant="minimal"
                                rooms={rooms}
                                onRoomsChange={setRooms}
                            />
                        </div>

                        <Button
                            type="submit"
                            className={cn(
                                "rounded-2xl lg:rounded-full p-0 flex items-center justify-center bg-primary hover:bg-primary-hover shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0",
                                isHeader ? "w-[56px] h-[56px] lg:w-[56px] lg:h-[56px]" : "w-20 h-20 lg:w-16 lg:h-16",
                                "aspect-square"
                            )}
                        >
                            <Search size={24} className="text-white" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
