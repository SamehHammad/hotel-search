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
    return (
        <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ps-1">
                {label}
            </label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-start font-medium h-12 bg-white rounded-xl shadow-sm hover:bg-slate-50",
                            !date && "text-muted-foreground font-normal"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-indigo-500" />
                        {date ? format(date, "PPP") : <span>{label}</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl shadow-lg border-slate-100" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={onSelect}
                        initialFocus
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
                </PopoverContent>
            </Popover>
        </div>
    );
}
