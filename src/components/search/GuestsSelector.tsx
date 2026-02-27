//---** Reusable component for selecting guests count (adults, children) **---//

"use client";

import { useTranslations } from "next-intl";
import { Users, Plus, Minus } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface GuestsSelectorProps {
    adults: number;
    childrenCount: number;
    onAdultsChange: (val: number) => void;
    onChildrenChange: (val: number) => void;
}

export function GuestsSelector({
    adults,
    childrenCount,
    onAdultsChange,
    onChildrenChange,
}: GuestsSelectorProps) {
    const t = useTranslations("search");

    const totalGuests = adults + childrenCount;

    return (
        <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ps-1">
                {t("guestsLabel")}
            </label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-start text-start font-medium h-12 bg-white rounded-xl shadow-sm hover:bg-slate-50"
                    >
                        <Users className="mr-2 h-4 w-4 shrink-0 text-indigo-500" />
                        {totalGuests} {t("guestsLabel")}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 rounded-xl shadow-xl border-slate-100" align="start">
                    <div className="flex flex-col gap-4">

                        {/* Adults */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-slate-800">{t("adultsLabel")}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => onAdultsChange(Math.max(1, adults - 1))}
                                    disabled={adults <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-4 text-center font-medium">{adults}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => onAdultsChange(adults + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Children */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-slate-800">{t("childrenLabel")}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => onChildrenChange(Math.max(0, childrenCount - 1))}
                                    disabled={childrenCount <= 0}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-4 text-center font-medium">{childrenCount}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => onChildrenChange(childrenCount + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
