/**
 * Sanitize external image URLs for Next.js Image component.
 * - Ensures the URL is absolute.
 * - Strips unsafe or unsupported query parameters for Google Photos.
 * - Preserves standard image sizing if needed.
 */
export function sanitizeImageUrl(url?: string): string {
    if (!url) return "/placeholder.jpg";

    // If already absolute and looks safe, return as-is
    if (url.startsWith("https://") || url.startsWith("http://")) {
        try {
            const parsed = new URL(url);
            // Google Photos: drop =sXX (resize) param that can confuse Next.js optimizer
            if (parsed.hostname.includes("googleusercontent.com")) {
                const search = new URLSearchParams(parsed.search);
                search.delete("s"); // e.g., =s287
                parsed.search = search.toString();
                return parsed.toString();
            }
            return url;
        } catch {
            // Fallback if URL parsing fails
            return url;
        }
    }

    // Fallback for relative or malformed URLs
    return url.startsWith("/") ? url : `/${url}`;
}
