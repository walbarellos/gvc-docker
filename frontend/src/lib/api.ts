const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getToken = () => localStorage.getItem('gvc_token');

const headers = (includeAuth = true) => {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, { headers: headers() });
    return res.json();
  },
  
  post: async (endpoint: string, data?: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: headers(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return res.json();
  },
  
  put: async (endpoint: string, data?: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: headers(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return res.json();
  },
  
  delete: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },
};

export const supabase = {
  from: (table: string) => ({
    select: (columns = '*') => ({
      eq: (field: string, value: any) => api.get(`/${table}?${field}=${value}`),
      order: (field: string, { ascending = false } = {}) => api.get(`/${table}?order=${field}`),
      limit: (n: number) => api.get(`/${table}?limit=${n}`),
    }),
    insert: (data: any) => api.post(`/${table}`, data),
    update: (data: any) => api.put(`/${table}`, data),
    delete: () => api.delete(`/${table}`),
  }),
};