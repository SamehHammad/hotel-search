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
import { cn } from "@/lib/utils";

interface GuestsSelectorProps {
    adults: number;
    childrenCount: number;
    onAdultsChange: (val: number) => void;
    onChildrenChange: (val: number) => void;
    variant?: "default" | "minimal";
}

export function GuestsSelector({
    adults,
    childrenCount,
    onAdultsChange,
    onChildrenChange,
    variant = "default",
}: GuestsSelectorProps) {
    const t = useTranslations("search");
    const totalGuests = adults + childrenCount;
    const isMinimal = variant === "minimal";

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", !isMinimal && "flex-1 sm:min-w-[160px]")}>
            {!isMinimal && (
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ps-1">
                    {t("guestsLabel")}
                </label>
            )}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={isMinimal ? "ghost" : "outline"}
                        className={cn(
                            isMinimal
                                ? "h-auto p-0 hover:bg-transparent font-bold text-slate-600 text-[15px] justify-start shadow-none"
                                : "w-full justify-start text-start font-bold h-12 bg-white rounded-xl shadow-sm border-slate-200 hover:border-primary hover:bg-primary/5 transition-all text-sm"
                        )}
                    >
                        {!isMinimal && <Users className="mr-2 h-4 w-4 shrink-0 text-primary" />}
                        {totalGuests} {t("guestsLabel")}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 rounded-2xl shadow-2xl border-slate-100 overflow-hidden" align="start">
                    <div className="bg-[#051c34] p-4 text-white">
                        <p className="text-xs font-bold uppercase opacity-80 tracking-widest">{t("guestsLabel")}</p>
                        <p className="text-xl font-bold">{totalGuests} {totalGuests > 1 ? t("travellers") : t("traveller")}</p>
                    </div>


                    <div className="p-6 flex flex-col gap-6">
                        {/* Adults */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-slate-800 text-base">{t("adultsLabel")}</p>
                                <p className="text-xs text-slate-400 font-medium">{t("adultsDesc")}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 rounded-full border-slate-200 hover:border-primary hover:text-primary transition-all shadow-sm"
                                    onClick={() => onAdultsChange(Math.max(1, adults - 1))}
                                    disabled={adults <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-4 text-center font-bold text-lg text-slate-800">{adults}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 rounded-full border-slate-200 hover:border-primary hover:text-primary transition-all shadow-sm"
                                    onClick={() => onAdultsChange(adults + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Children */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-slate-800 text-base">{t("childrenLabel")}</p>
                                <p className="text-xs text-slate-400 font-medium">{t("childrenDesc")}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 rounded-full border-slate-200 hover:border-primary hover:text-primary transition-all shadow-sm"
                                    onClick={() => onChildrenChange(Math.max(0, childrenCount - 1))}
                                    disabled={childrenCount <= 0}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-4 text-center font-bold text-lg text-slate-800">{childrenCount}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 rounded-full border-slate-200 hover:border-primary hover:text-primary transition-all shadow-sm"
                                    onClick={() => onChildrenChange(childrenCount + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-50 flex justify-end bg-slate-50/50">
                        <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-md">
                            {t("update")}
                        </Button>
                    </div>

                </PopoverContent>
            </Popover>
        </div>
    );
}
