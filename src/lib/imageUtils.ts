//---** Sanitize external image URLs for Next.js Image component **---//
export function sanitizeImageUrl(url?: string): string {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
    return url.startsWith("/") ? url : `/${url}`;
}
