//---** Utility helpers: cn class merging, formatting, sanitization **---//

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Format a star rating to one decimal */
export function formatRating(rating: number): string {
    return rating.toFixed(1);
}

/** Format review count with K abbreviation */
export function formatReviews(count: number): string {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
}

/** Sanitize a string for query params */
export function sanitizeQuery(input: string): string {
    return input.trim().replace(/[<>"']/g, "");
}

/** Build star array from extracted_hotel_class */
export function buildStarArray(stars: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < stars ? 1 : 0));
}

/** Get a color class based on rating value */
export function getRatingColor(rating: number): string {
    if (rating >= 4.5) return "text-emerald-500";
    if (rating >= 4.0) return "text-indigo-500";
    if (rating >= 3.5) return "text-amber-500";
    return "text-slate-400";
}

/** Truncate text to maxLength */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 3)}...`;
}
