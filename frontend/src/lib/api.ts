const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:3001/api');

function getToken(): string | null {
    return localStorage.getItem('gvc_token');
}

function headers(includeAuth = true): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (includeAuth) {
        const token = getToken();
        if (token) h['Authorization'] = `Bearer ${token}`;
    }
    return h;
}

async function handleResponse<T>(response: Response): Promise<{ data: T | null; error: { message: string } | null }> {
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Request failed' }));
        return { data: null, error: { message: err.error || err.message || 'Request failed' } };
    }
    const data = await response.json();
    return { data, error: null };
}

export const api = {
    get: async <T>(endpoint: string, includeAuth = true): Promise<{ data: T | null; error: { message: string } | null }> => {
        const res = await fetch(`${API_URL}${endpoint}`, { headers: headers(includeAuth) });
        return handleResponse<T>(res);
    },

    post: async <T>(endpoint: string, data?: any, includeAuth = true): Promise<{ data: T | null; error: { message: string } | null }> => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: headers(includeAuth),
            body: data ? JSON.stringify(data) : undefined,
        });
        return handleResponse<T>(res);
    },

    put: async <T>(endpoint: string, data?: any, includeAuth = true): Promise<{ data: T | null; error: { message: string } | null }> => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: headers(includeAuth),
            body: data ? JSON.stringify(data) : undefined,
        });
        return handleResponse<T>(res);
    },

    patch: async <T>(endpoint: string, data?: any, includeAuth = true): Promise<{ data: T | null; error: { message: string } | null }> => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: headers(includeAuth),
            body: data ? JSON.stringify(data) : undefined,
        });
        return handleResponse<T>(res);
    },

    delete: async <T>(endpoint: string, includeAuth = true): Promise<{ data: T | null; error: { message: string } | null }> => {
        const h: Record<string, string> = {};
        if (includeAuth) {
            const token = getToken();
            if (token) h['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: h,
        });
        return handleResponse<T>(res);
    },
};

export function setToken(token: string) {
    localStorage.setItem('gvc_token', token);
}

export function removeToken() {
    localStorage.removeItem('gvc_token');
}

export function getTokenStored(): string | null {
    return localStorage.getItem('gvc_token');
}