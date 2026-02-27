//---** Main Search Form orchestrating destination, dates, and guests **---//

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Search, MapPin } from "lucide-react";
import useHotelsStore from "@/store/hotels.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "./DatePicker";
import { GuestsSelector } from "./GuestsSelector";
import { DEFAULT_SEARCH_FILTERS } from "@/lib/constants";

interface SearchFormProps {
    className?: string;
    variant?: "hero" | "header";
}

export function SearchForm({ className = "", variant = "hero" }: SearchFormProps) {
    const t = useTranslations("search");
    const router = useRouter();

    const { filters, setFilters } = useHotelsStore();

    // Local state for the form
    const [location, setLocation] = useState(filters.q || DEFAULT_SEARCH_FILTERS.q);
    const [checkIn, setCheckIn] = useState<Date | undefined>(
        filters.check_in_date ? new Date(filters.check_in_date) : new Date(DEFAULT_SEARCH_FILTERS.check_in_date)
    );
    const [checkOut, setCheckOut] = useState<Date | undefined>(
        filters.check_out_date ? new Date(filters.check_out_date) : new Date(DEFAULT_SEARCH_FILTERS.check_out_date)
    );
    const [guests, setGuests] = useState(filters.guests || DEFAULT_SEARCH_FILTERS.guests);

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

        // Persist to store (this will clear old hotels and trigger refetch if on hotels page)
        setFilters({
            q: location,
            check_in_date: checkInStr,
            check_out_date: checkOutStr,
            guests,
            bounds: null, // Reset bounds on new search query
        });

        // Navigate to hotels page if we are on hero variant
        if (variant === "hero") {
            router.push("/hotels");
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
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
                    <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={t("locationPlaceholder")}
                        className="pl-10 h-12 bg-white rounded-xl shadow-sm border-slate-200 focus-visible:ring-indigo-500 w-full"
                        required
                    />
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
