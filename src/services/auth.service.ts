//---** Auth service: token management and validation helpers **---//

import { BEARER_TOKEN } from "@/lib/constants";

/** Get the auth header value for internal API calls */
export function getAuthHeader(): string {
    return `Bearer ${BEARER_TOKEN}`;
}

/** Check if a given authorization header is valid */
export function isValidToken(authHeader: string | null): boolean {
    if (!authHeader) return false;
    const [scheme, token] = authHeader.split(" ");
    return scheme === "Bearer" && token === BEARER_TOKEN;
}
