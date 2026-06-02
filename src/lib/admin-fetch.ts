/**
 * adminFetch — Drop-in replacement for fetch() in all admin pages.
 *
 * Sends credentials (httpOnly cookie) automatically.
 * No need to read admin_token from localStorage or set Authorization header.
 * The server reads the cookie via authenticateRequest() in src/lib/auth.ts.
 *
 * Usage:
 *   const res = await adminFetch('/api/admin/products');
 *   const res = await adminFetch('/api/admin/products', { method: 'POST', body: ... });
 */
export function adminFetch(url: string, init: RequestInit = {}): Promise<Response> {
    return fetch(url, {
        ...init,
        credentials: 'include',   // sends admin_token httpOnly cookie automatically
        headers: {
            ...(init.headers ?? {}),
        },
    });
}

/**
 * adminJsonFetch — Like adminFetch but automatically sets Content-Type: application/json.
 * Use when sending JSON body.
 */
export function adminJsonFetch(url: string, init: RequestInit = {}): Promise<Response> {
    return fetch(url, {
        ...init,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(init.headers ?? {}),
        },
    });
}
