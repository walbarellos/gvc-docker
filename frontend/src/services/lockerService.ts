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
    const { data, error } = await api.get<Locker[]>(`/lockers?${query}`);
    return { data: data || [], error };
  },

  async getById(id: string) {
    const { data, error } = await api.get<Locker>(`/lockers/${id}`);
    return { data, error };
  },

  async create(locker: Omit<Locker, 'id'>) {
    const { data, error } = await api.post<Locker>('/lockers', locker);
    return { data, error };
  },

  async update(id: string, updates: Partial<Locker>) {
    const { data, error } = await api.put<Locker>(`/lockers/${id}`, updates);
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await api.delete(`/lockers/${id}`);
    return { error };
  },

  async alocar(numero: string, visitorId: string, visitId: string, espacoId: string) {
    const { data, error } = await api.post<Locker>('/lockers/alocar', {
      numero, visitorId, visitId, espacoId
    });
    return { data, error };
  },

  async desalocar(id: string) {
    const { data, error } = await api.post<Locker>(`/lockers/${id}/desalocar`);
    return { data, error };
  }
};