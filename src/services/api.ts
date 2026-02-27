//---** Base API client with Bearer token injection and error handling **---//

import { BEARER_TOKEN } from "@/lib/constants";

interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean | null | undefined>;
}

/** Build URL with query params, filtering out undefined/null values */
function buildUrl(path: string, params?: RequestOptions["params"]): string {
    const base = typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
        : window.location.origin;

    const url = new URL(`${base}${path}`);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, String(value));
            }
        });
    }

    return url.toString();
}

/** Generic fetch wrapper with auth headers */
export async function apiGet<T>(
    path: string,
    options?: RequestOptions
): Promise<T> {
    const { params, ...rest } = options ?? {};

    const url = buildUrl(path, params);

    const response = await fetch(url, {
        ...rest,
        headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
            "Content-Type": "application/json",
            ...rest?.headers,
        },
        next: { revalidate: 0 },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(
            `API Error ${response.status}: ${(error as { message?: string }).message ?? response.statusText}`
        );
    }

    return response.json() as Promise<T>;
}
