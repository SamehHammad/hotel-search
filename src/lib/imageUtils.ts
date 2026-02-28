//---** Sanitize external image URLs for Next.js Image component **---//
export function sanitizeImageUrl(url?: string): string {
    if (!url) return "/placeholder.jpg";
    return url.startsWith("/") ? url : `/${url}`;
}
