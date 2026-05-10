import { api } from '../lib/api';

export interface Space {
  id?: string;
  nome: string;
  municipio?: string;
  horarioFuncionamento?: string;
  perfilArmarios?: boolean;
  perfilArmariosQuantidade?: number;
  perfilTelecentro?: boolean;
  perfilAgendamento?: boolean;
  mensagemBoasVindas?: string;
  ativo?: boolean;
  capacidadeVisitantes?: number;
  totalComputadores?: number;
  tempoLimiteComputador?: number;
  capacidadeAgendamento?: number;
  hasAuditorio?: boolean;
  qtdAuditorio?: number;
  hasSalaEstudos?: boolean;
  qtdSalaEstudos?: number;
  hasTeatro?: boolean;
  qtdTeatro?: number;
  hasFilmoteca?: boolean;
  qtdFilmoteca?: number;
  hasEspacoAberto?: boolean;
  qtdEspacoAberto?: number;
  hasVisitaGuiada?: boolean;
  qtdVisitaGuiada?: number;
}

function mapSpace(data: any): Space {
  return {
    id: data.id,
    nome: data.nome,
    municipio: data.municipio,
    horarioFuncionamento: data.horario_funcionamento,
    perfilArmarios: data.perfil_armarios,
    perfilArmariosQuantidade: data.perfil_armarios_quantidade,
    perfilTelecentro: data.perfil_telecentro,
    perfilAgendamento: data.perfil_agendamento,
    mensagemBoasVindas: data.mensagem_boas_vindas,
    ativo: data.ativo,
    capacidadeVisitantes: data.capacidade_visitantes,
    totalComputadores: data.total_computadores,
    tempoLimiteComputador: data.tempo_limite_computador,
    capacidadeAgendamento: data.capacidade_agendamento,
    hasAuditorio: data.has_auditorio,
    qtdAuditorio: data.qtd_auditorio,
    hasSalaEstudos: data.has_sala_estudos,
    qtdSalaEstudos: data.qtd_sala_estudos,
    hasTeatro: data.has_teatro,
    qtdTeatro: data.qtd_teatro,
    hasFilmoteca: data.has_filmoteca,
    qtdFilmoteca: data.qtd_filmoteca,
    hasEspacoAberto: data.has_espaco_aberto,
    qtdEspacoAberto: data.qtd_espaco_aberto,
    hasVisitaGuiada: data.has_visita_guiada,
    qtdVisitaGuiada: data.qtd_visita_guiada
  };
}

export const spaceService = {
  async list() {
    const { data, error } = await api.get<Space[]>('/spaces?ativo=true&order=nome');
    return { data: (data || []).map(mapSpace), error };
  },

  async listAll() {
    const { data, error } = await api.get<Space[]>('/spaces?order=nome');
    return { data: (data || []).map(mapSpace), error };
  },

  async getById(id: string) {
    const { data, error } = await api.get<Space>(`/spaces/${id}`);
    return { data: data ? mapSpace(data) : null, error };
  },

  async getUsers(spaceId: string) {
    const { data, error } = await api.get<any[]>(`/usuarios?espacoId=${spaceId}`);
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