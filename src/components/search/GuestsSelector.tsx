//---** Reusable component for selecting guests count per room **---//

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Minus, Users, ChevronDown } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RoomConfig } from "@/types/search.types";

interface GuestsSelectorProps {
    rooms: RoomConfig[];
    onRoomsChange: (rooms: RoomConfig[]) => void;
    variant?: "default" | "minimal";
}

export function GuestsSelector({
    rooms,
    onRoomsChange,
    variant = "default",
}: GuestsSelectorProps) {
    const t = useTranslations("hotels");
    const ts = useTranslations("search");
    const [open, setOpen] = useState(false);

    //---** Derived summary stats for display in the main trigger button **---//
    const totalAdults = rooms.reduce((acc, room) => acc + room.adults, 0);
    const totalChildren = rooms.reduce((acc, room) => acc + room.children, 0);
    const totalTravellers = totalAdults + totalChildren;
    const totalRooms = rooms.length;

    const isMinimal = variant === "minimal";

    //---** Update specific room configuration without mutating state **---//
    const updateRoom = (index: number, adults: number, children: number) => {
        const newRooms = [...rooms];
        newRooms[index] = { adults, children };
        onRoomsChange(newRooms);
    };

    //---** Add a new room with default configuration, capped at 8 rooms **---//
    const addRoom = () => {
        if (rooms.length < 8) {
            onRoomsChange([...rooms, { adults: 1, children: 0 }]);
        }
    };

    //---** Remove specified room index from the collection **---//
    const removeRoom = (index: number) => {
        if (rooms.length > 1) {
            const newRooms = rooms.filter((_, i) => i !== index);
            onRoomsChange(newRooms);
        }
    };

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", !isMinimal && "flex-1 sm:min-w-[160px]")}>
            {/*---** Optional label for standard layouts **---*/}
            {!isMinimal && (
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.1em] ps-1">
                    {ts("guestsLabel")}
                </label>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                {/*---** Interactive trigger button with summary of rooms and guests **---*/}
                <PopoverTrigger asChild>
                    <Button
                        variant={isMinimal ? "ghost" : "outline"}
                        className={cn(
                            "flex items-center w-full transition-all duration-200",
                            isMinimal
                                ? "h-auto p-0 hover:bg-transparent justify-start gap-4 active:scale-[0.98]"
                                : "justify-between font-bold h-12 bg-surface rounded-xl shadow-sm border-border hover:border-primary/50 hover:bg-primary/5 text-sm"
                        )}
                        aria-label={`${ts("guestsLabel")}: ${totalTravellers} ${ts("travellers")}, ${totalRooms} ${t("rooms")}`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={cn(
                                "flex items-center justify-center rounded-xl transition-colors",
                                isMinimal ? "w-10 h-10 bg-surface-muted text-brand-muted" : "text-primary"
                            )}>
                                <Users className={isMinimal ? "w-5 h-5" : "w-4 h-4"} />
                            </div>

                            <div className="flex flex-col items-start leading-[1.3] overflow-hidden text-left rtl:text-right">
                                <span className={cn(
                                    "font-extrabold tracking-tight whitespace-nowrap",
                                    isMinimal ? "text-[12px] text-brand-dark" : "text-[11px] text-brand-dark uppercase"
                                )}>
                                    {isMinimal ? ts("travellers") : ts("guestsLabel")}
                                </span>
                                <span className={cn(
                                    "truncate font-bold tracking-tight whitespace-nowrap",
                                    isMinimal ? "text-[14px] text-brand-muted" : "text-brand-muted"
                                )}>
                                    {totalTravellers} {totalTravellers > 1 ? ts("travellers") : ts("traveller")}, {totalRooms} {totalRooms > 1 ? t("rooms") : t("room")}
                                </span>
                            </div>
                        </div>

                        {!isMinimal && <ChevronDown className="w-4 h-4 text-brand-muted" />}
                    </Button>
                </PopoverTrigger>

                {/*---** Overlay Content: Manages room-by-room occupant counts with scrollable container **---*/}
                <PopoverContent
                    className="w-[340px] p-0 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-border overflow-hidden bg-surface z-[120]"
                    style={{ maxHeight: "min(350px, calc(100dvh - 150px))", display: "flex", flexDirection: "column" }}
                    align="start"
                    sideOffset={10}
                    avoidCollisions={true}
                    collisionPadding={16}
                >
                    {/*---** Pinned Header showing total summary **---*/}
                    <div className="bg-brand-dark px-5 py-3.5 text-white shrink-0">
                        <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-300" />
                            {ts("travellers")}
                        </h3>
                        <p className="text-[11px] font-medium text-indigo-100/70 mt-0.5">
                            {totalRooms} {totalRooms > 1 ? t("rooms") : t("room")} · {totalTravellers} {ts("travellers")}
                        </p>
                    </div>

                    {/*---** Interactive Room Settings: List of increment/decrement counters **---*/}
                    <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
                        <div className="divide-y divide-border">
                            {rooms.map((room, index) => (
                                <div key={index} className="px-5 py-4 space-y-3.5">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-black text-brand-dark text-sm tracking-tight">
                                            {t("roomNumber", { number: index + 1 })}
                                        </h4>
                                        {rooms.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeRoom(index)}
                                                className="text-primary text-[11px] font-black hover:underline px-2 py-0.5 rounded-md hover:bg-primary/5 transition-colors"
                                            >
                                                {t("removeRoom")}
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {/*---** Adult count controls for current room **---*/}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-brand-dark text-sm">{ts("adultsLabel")}</p>
                                                <p className="text-[10px] text-brand-muted/70 font-bold uppercase tracking-wider">{ts("adultsDesc")}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full border-border bg-surface hover:border-primary hover:text-primary hover:bg-primary/5 transition-all shadow-sm active:scale-95"
                                                    onClick={() => updateRoom(index, Math.max(1, room.adults - 1), room.children)}
                                                    disabled={room.adults <= 1}
                                                    aria-label={`Decrease adults in room ${index + 1}`}
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </Button>
                                                <span className="w-5 text-center font-black text-sm text-brand-dark">{room.adults}</span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full border-border bg-surface hover:border-primary hover:text-primary hover:bg-primary/5 transition-all shadow-sm active:scale-95"
                                                    onClick={() => updateRoom(index, room.adults + 1, room.children)}
                                                    aria-label={`Increase adults in room ${index + 1}`}
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/*---** Child count controls for current room **---*/}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-brand-dark text-sm">{ts("childrenLabel")}</p>
                                                <p className="text-[10px] text-brand-muted/70 font-bold uppercase tracking-wider">Ages 0 - 17</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full border-border bg-surface hover:border-primary hover:text-primary hover:bg-primary/5 transition-all shadow-sm active:scale-95"
                                                    onClick={() => updateRoom(index, room.adults, Math.max(0, room.children - 1))}
                                                    disabled={room.children <= 0}
                                                    aria-label={`Decrease children in room ${index + 1}`}
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </Button>
                                                <span className="w-5 text-center font-black text-sm text-brand-dark">{room.children}</span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full border-border bg-surface hover:border-primary hover:text-primary hover:bg-primary/5 transition-all shadow-sm active:scale-95"
                                                    onClick={() => updateRoom(index, room.adults, room.children + 1)}
                                                    aria-label={`Increase children in room ${index + 1}`}
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/*---** CTA to append additional room configurations **---*/}
                        {rooms.length < 8 && (
                            <div className="px-5 pb-4 pt-2">
                                <button
                                    type="button"
                                    onClick={addRoom}
                                    className="text-primary text-sm font-black hover:underline flex items-center gap-2 group"
                                >
                                    <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                        <Plus className="w-3 h-3" />
                                    </div>
                                    {t("addAnotherRoom")}
                                </button>
                            </div>
                        )}
                    </div>

                    {/*---** Pinned Footer bar containing dismissal actions **---*/}
                    <div className="px-5 py-3.5 border-t border-border bg-surface flex items-center justify-between gap-3 shrink-0">
                        <p className="text-[11px] text-brand-muted/70 font-medium leading-tight">
                            {totalRooms} {totalRooms > 1 ? t("rooms") : t("room")} &middot; {totalTravellers} {ts("travellers")}
                        </p>
                        <Button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-full bg-brand-dark hover:bg-brand-dark-hover text-white font-black px-6 py-2 text-sm tracking-tight shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0"
                        >
                            {t("done")}
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
