import { api } from '../lib/api';

export interface Space {
  id?: string;
  nome: string;
  email?: string;
  endereco?: string;
  municipio?: string;
  horario_funcionamento?: string;
  perfil_armarios?: boolean;
  perfil_armarios_quantidade?: number;
  perfil_telecentro?: boolean;
  perfil_agendamento?: boolean;
  mensagem_boas_vindas?: string;
  ativo?: boolean;
  capacidade_agendamento?: number;
  has_auditorio?: boolean;
  qtd_auditorio?: number;
  has_sala_estudos?: boolean;
  qtd_sala_estudos?: number;
  has_teatro?: boolean;
  qtd_teatro?: number;
  has_filmoteca?: boolean;
  qtd_filmoteca?: number;
  has_espaco_aberto?: boolean;
  qtd_espaco_aberto?: number;
  has_visita_guiada?: boolean;
  qtd_visita_guiada?: number;
}

export const spaceService = {
  async list() {
    const { data, error } = await api.get<Space[]>('/spaces?ativo=true&order=nome');
    return { data: data || [], error };
  },

  async listAll() {
    const { data, error } = await api.get<Space[]>('/spaces?order=nome');
    return { data: data || [], error };
  },

  async getById(id: string) {
    const { data, error } = await api.get<Space>(`/spaces/${id}`);
    return { data, error };
  },

  async getUsers(spaceId: string) {
    const { data, error } = await api.get<any[]>(`/users?espaco_id=${spaceId}`);
    return { data: data || [], error };
  },

  async create(space: Omit<Space, 'id'>) {
    const { data, error } = await api.post<Space>('/spaces', space);
    return { data, error };
  },

  async update(id: string, updates: Partial<Space>) {
    const { data, error } = await api.put<Space>(`/spaces/${id}`, updates);
    return { data, error };
  },

  async deactivate(id: string) {
    const { error } = await api.patch(`/spaces/${id}`, { ativo: false });
    return { error };
  },

  async delete(id: string) {
    const { error } = await api.delete(`/spaces/${id}`);
    return { error };
  }
};