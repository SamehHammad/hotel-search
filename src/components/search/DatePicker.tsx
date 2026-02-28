//---** Reusable component for selecting dates using shadcn Calendar and Popover **---//

"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    date?: Date;
    onSelect: (date: Date | undefined) => void;
    label: string;
    minDate?: Date;
    variant?: "default" | "minimal";
}

export function DatePicker({ date, onSelect, label, minDate, variant = "default" }: DatePickerProps) {
    const t = useTranslations("search");
    const [isMobile, setIsMobile] = React.useState(false);

    //---** Handle responsive layout adjustments for calendar months **---//
    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    //---** Helper: validate Date objects to prevent runtime errors in format() **---//
    const isValidDate = (d: any): d is Date => d instanceof Date && !isNaN(d.getTime());

    const isMinimal = variant === "minimal";

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", !isMinimal && "flex-1 sm:min-w-[160px]")}>
            {/*---** Optional field label for standard layout forms **---*/}
            {!isMinimal && (
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ps-1">
                    {label}
                </label>
            )}

            <Popover>
                {/*---** Interactive trigger button displaying currently selected date **---*/}
                <PopoverTrigger asChild>
                    <Button
                        variant={isMinimal ? "ghost" : "outline"}
                        className={cn(
                            isMinimal
                                ? "h-auto p-0 hover:bg-transparent font-bold text-slate-600 text-[15px] justify-start"
                                : "w-full justify-start text-start font-bold h-12 bg-white rounded-xl shadow-sm border-slate-200 hover:border-primary hover:bg-primary/5 transition-all text-sm",
                            !isValidDate(date) && "text-slate-400 font-medium"
                        )}
                    >
                        {!isMinimal && <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-primary" />}
                        {isValidDate(date) ? format(date, "MMM dd") : <span>{label}</span>}
                    </Button>
                </PopoverTrigger>

                {/*---** Popover Overlay: Contains the interactive calendar grid **---*/}
                <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-slate-100 overflow-hidden" align="start">
                    {/*---** Thematic header showing full selected date text **---*/}
                    <div className="bg-[#051c34] p-4 text-white">
                        <p className="text-xs font-bold uppercase opacity-80 tracking-widest">{label}</p>
                        <p className="text-xl font-bold">{isValidDate(date) ? format(date, "EEEE, MMM dd") : t("selectDate")}</p>
                    </div>

                    {/*---** Multi-month calendar navigation based on viewport width **---*/}
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={onSelect}
                        initialFocus
                        numberOfMonths={isMobile ? 1 : 2}
                        className="p-3"
                        disabled={(date) => {
                            if (minDate) {
                                const checkMin = new Date(minDate);
                                checkMin.setHours(0, 0, 0, 0);
                                return date < checkMin;
                            }
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                        }}
                    />

                    {/*---** Footer action to clear current selection **---*/}
                    <div className="p-3 border-t border-slate-50 flex justify-end">
                        <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 rounded-lg" onClick={() => onSelect(undefined)}>
                            {t("clear")}
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
