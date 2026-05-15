import { api } from '../lib/api';

export interface Space {
  id?: string;
  nome: string;
  email?: string;
  endereco?: string;
  municipio?: string;
  horarioFuncionamento?: string;
  capacidadeVisitantes?: number;
  mensagemBoasVindas?: string;
  ativo?: boolean;
  tempoLimiteExcedido?: number;
  perfilArmarios?: boolean;
  perfilArmariosQuantidade?: number;
  perfilTelecentro?: boolean;
  perfilAgendamento?: boolean;
  totalArmarios?: number;
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
    email: data.email,
    endereco: data.endereco,
    municipio: data.municipio,
    horarioFuncionamento: data.horario_funcionamento || data.horarioFuncionamento,
    capacidadeVisitantes: data.capacidade_visitantes || data.capacidadeVisitantes,
    mensagemBoasVindas: data.mensagem_boas_vindas || data.mensagemBoasVindas,
    ativo: data.ativo,
    tempoLimiteExcedido: data.tempo_limite_excedido || data.tempoLimiteExcedido,
    perfilArmarios: data.perfil_armarios ?? data.perfilArmarios,
    perfilArmariosQuantidade: data.perfil_armarios_quantidade ?? data.perfilArmariosQuantidade,
    perfilTelecentro: data.perfil_telecentro ?? data.perfilTelecentro,
    perfilAgendamento: data.perfil_agendamento ?? data.perfilAgendamento,
    totalArmarios: data.total_armarios || data.totalArmarios,
    totalComputadores: data.total_computadores || data.totalComputadores,
    tempoLimiteComputador: data.tempo_limite_computador || data.tempoLimiteComputador,
    capacidadeAgendamento: data.capacidade_agendamento || data.capacidadeAgendamento,
    hasAuditorio: data.has_auditorio ?? data.hasAuditorio,
    qtdAuditorio: data.qtd_auditorio || data.qtdAuditorio,
    hasSalaEstudos: data.has_sala_estudos ?? data.hasSalaEstudos,
    qtdSalaEstudos: data.qtd_sala_estudos || data.qtdSalaEstudos,
    hasTeatro: data.has_teatro ?? data.hasTeatro,
    qtdTeatro: data.qtd_teatro || data.qtdTeatro,
    hasFilmoteca: data.has_filmoteca ?? data.hasFilmoteca,
    qtdFilmoteca: data.qtd_filmoteca || data.qtdFilmoteca,
    hasEspacoAberto: data.has_espaco_aberto ?? data.hasEspacoAberto,
    qtdEspacoAberto: data.qtd_espaco_aberto || data.qtdEspacoAberto,
    hasVisitaGuiada: data.has_visita_guiada ?? data.hasVisitaGuiada,
    qtdVisitaGuiada: data.qtd_visita_guiada || data.qtdVisitaGuiada
  };
}

export const spaceService = {
  async list() {
    const { data, error } = await api.get<Space[]>('/espacos?ativo=true&order=nome');
    return { data: (data || []).map(mapSpace), error };
  },

  async listAll() {
    const { data, error } = await api.get<Space[]>('/espacos?order=nome');
    return { data: (data || []).map(mapSpace), error };
  },

  async getById(id: string) {
    const { data, error } = await api.get<Space>(`/espacos/${id}`);
    return { data: data ? mapSpace(data) : null, error };
  },

  async getUsers(spaceId: string) {
    const { data, error } = await api.get<any[]>(`/usuarios?espacoId=${spaceId}`);
    return { data: data || [], error };
  },

  async create(space: Omit<Space, 'id'>) {
    const { data, error } = await api.post<Space>('/espacos', space);
    return { data, error };
  },

  async update(id: string, updates: Partial<Space>) {
    const { data, error } = await api.put<Space>(`/espacos/${id}`, updates);
    return { data, error };
  },

  async deactivate(id: string) {
    const { error } = await api.patch(`/espacos/${id}`, { ativo: false });
    return { error };
  },

  async delete(id: string) {
    const { error } = await api.delete(`/espacos/${id}`);
    return { error };
  }
};