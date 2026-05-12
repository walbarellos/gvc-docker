import { api } from '../lib/api';

export interface Locker {
  id: string;
  espacoId: string;
  numero: string;
  status: string;
  visitorId?: string | null;
  visitId?: string | null;
  allocated_at?: string;
}

export interface LockerFilter {
  espacoId?: string;
  status?: string;
}

function buildQuery(filters?: LockerFilter): string {
  const params = new URLSearchParams();
  if (filters?.espacoId) params.append('espaco_id', filters.espacoId);
  if (filters?.status) params.append('status', filters.status);
  return params.toString();
}

export const lockerService = {
  async list(filters?: LockerFilter) {
    const query = buildQuery(filters);
    const { data, error } = await api.get<Locker[]>(`/armarios?${query}`);
    return { data: data || [], error };
  },

  async getById(id: string) {
    const { data, error } = await api.get<Locker>(`/armarios/${id}`);
    return { data, error };
  },

  async create(locker: Omit<Locker, 'id'>) {
    const { data, error } = await api.post<Locker>('/armarios', locker);
    return { data, error };
  },

  async update(id: string, updates: Partial<Locker>) {
    const { data, error } = await api.put<Locker>(`/armarios/${id}`, updates);
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await api.delete(`/armarios/${id}`);
    return { error };
  },

  async alocar(numero: string, visitorId: string, visitId: string, espacoId: string) {
    const { data, error } = await api.post<Locker>('/armarios/alocar', {
      numero, visitorId, visitId, espacoId
    });
    return { data, error };
  },

  async desalocar(id: string) {
    const { data, error } = await api.post<Locker>(`/armarios/${id}/desalocar`);
    return { data, error };
  }
};