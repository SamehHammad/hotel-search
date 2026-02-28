//---** Reusable component for selecting dates using shadcn Calendar and Popover **---//

"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations } from "next-intl";

interface DatePickerProps {
    date?: Date;
    onSelect: (date: Date | undefined) => void;
    label: string;
    minDate?: Date;
}

export function DatePicker({ date, onSelect, label, minDate }: DatePickerProps) {
    const t = useTranslations("search");
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <div className="flex flex-col gap-1.5 flex-1 w-full sm:min-w-[160px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ps-1">
                {label}
            </label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-start font-bold h-12 bg-white rounded-xl shadow-sm border-slate-200 hover:border-primary hover:bg-primary/5 transition-all text-sm",
                            !date && "text-slate-400 font-medium"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-primary" />
                        {date ? format(date, "MMM dd, yyyy") : <span>{label}</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-slate-100 overflow-hidden" align="start">
                    <div className="bg-primary p-4 text-white">
                        <p className="text-xs font-bold uppercase opacity-80 tracking-widest">{label}</p>
                        <p className="text-xl font-bold">{date ? format(date, "EEEE, MMM dd") : "Select a date"}</p>
                    </div>
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
                    <div className="p-3 border-t border-slate-50 flex justify-end">
                        <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 rounded-lg" onClick={() => onSelect(undefined)}>
                            Clear
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
