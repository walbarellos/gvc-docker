import { api } from '../lib/api';

export interface Computador {
  id: string;
  numero: number;
  espacoId?: string;
  espaco_id?: string;
  espacoNome?: string;
  espaco_nome?: string;
  nome?: string;
  status: string;
  usuarioId?: string;
  usuario_id?: string;
  usuarioNome?: string;
  usuario_nome?: string;
  horarioInicio?: string;
  horario_inicio?: string;
  horarioLimite?: string;
  horario_limite?: string;
  tempo_usado?: number;
  tempo_limite?: number;
  ultima_atualizacao?: string;
}

export interface ComputadorFilter {
  espacoId?: string;
  status?: string;
}

function buildQuery(filters?: ComputadorFilter): string {
  const params = new URLSearchParams();
  if (filters?.espacoId) params.append('espaco_id', filters.espacoId);
  if (filters?.status) params.append('status', filters.status);
  return params.toString();
}

export const computadorService = {
  async list(filters?: ComputadorFilter) {
    const query = buildQuery(filters);
    const { data, error } = await api.get<Computador[]>(`/computadores?${query}`);
    return { data: data || [], error };
  },

  async getById(id: string) {
    const { data, error } = await api.get<Computador>(`/computadores/${id}`);
    return { data, error };
  },

  async create(computador: Omit<Computador, 'id'>) {
    const { data, error } = await api.post<Computador>('/computadores', computador);
    return { data, error };
  },

  async update(id: string, updates: Partial<Computador>) {
    const { data, error } = await api.put<Computador>(`/computadores/${id}`, updates);
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await api.delete(`/computadores/${id}`);
    return { error };
  },

  async toggleStatus(id: string, status: string) {
    const { data, error } = await api.patch<Computador>(`/computadores/${id}`, { status });
    return { data, error };
  },

  async usar(id: string, visitorId: string) {
    const { data, error } = await api.post<Computador>(`/computadores/${id}/usar`, { visitorId });
    return { data, error };
  },

  async liberar(id: string) {
    const { data, error } = await api.post<Computador>(`/computadores/${id}/liberar`);
    return { data, error };
  }
};