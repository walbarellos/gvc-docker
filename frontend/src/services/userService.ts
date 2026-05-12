import { api } from '../lib/api';

export interface User {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  espacoId?: string | null;
  espaco_nome?: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFilter {
  espacoId?: string;
  perfil?: string;
  ativo?: boolean;
}

function buildQuery(filters?: UserFilter): string {
  const params = new URLSearchParams();
  if (filters?.espacoId) params.append('espacoId', filters.espacoId);
  if (filters?.perfil) params.append('perfil', filters.perfil);
  if (filters?.ativo !== undefined) params.append('ativo', String(filters.ativo));
  return params.toString();
}

export const userService = {
async list(filters?: UserFilter) {
    const query = buildQuery(filters);
    const { data, error } = await api.get<User[]>(`/usuarios?${query}`);
    return { data: data || [], error };
  },

  async getById(id: string) {
    const { data, error } = await api.get<User>(`/usuarios/${id}`);
    return { data, error };
  },

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { senha: string }) {
    const { data, error } = await api.post<User>('/usuarios', user);
    return { data, error };
  },

  async update(id: string, updates: Partial<User> & { senha?: string }) {
    const { data, error } = await api.put<User>(`/usuarios/${id}`, updates);
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await api.delete(`/usuarios/${id}`);
    return { error };
  },

  async toggleStatus(id: string, ativo: boolean) {
    const { data, error } = await api.patch<User>(`/usuarios/${id}`, { ativo });
    return { data, error };
  }
};