import { api } from '../lib/api';

export interface Agendamento {
  id?: string;
  espaco_id: string;
  solicitante_nome: string;
  solicitante_email: string;
  solicitante_telefone: string;
  solicitante_documento?: string;
  tipo_solicitante: string;
  tipo_espaco: string;
  espaco_solicitado: string;
  data_pretendida: string;
  horario_inicio: string;
  horario_fim: string;
  numero_participantes: number;
  descricao_evento: string;
  natureza_evento: string;
  gratuito: boolean;
  valor_ingresso?: number;
  necessita_equipamentos?: string;
  observacoes?: string;
  status?: string;
  termo_aceito: boolean;
  termo_aceito_em?: string;
  responsabhilidade_evento?: boolean;
  danos_patrimonio?: boolean;
  respeito_lotacao?: boolean;
  autorizo_divulgacao?: boolean;
  documento_anexo_url?: string;
  resposta_coordenador?: string;
  coordenador_id?: string;
  respondido_em?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgendamentoFilter {
  espaco_id?: string;
  status?: string;
  data_inicio?: string;
  data_fim?: string;
}

export interface DashboardAgendamentos {
  total: number;
  pendentes: number;
  aprovados: number;
  rejeitados: number;
  cancelados: number;
}

function buildQuery(filters?: AgendamentoFilter): string {
  const params = new URLSearchParams();
  if (filters?.espaco_id) params.append('espaco_id', filters.espaco_id);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.data_inicio) params.append('data_inicio', filters.data_inicio);
  if (filters?.data_fim) params.append('data_fim', filters.data_fim);
  return params.toString();
}

export const agendamentoService = {
  async list(filters?: AgendamentoFilter) {
    const query = buildQuery(filters);
    const { data, error } = await api.get<Agendamento[]>(`/agendamentos?${query}`);
    return { data: data || [], error };
  },

  async getById(id: string) {
    const { data, error } = await api.get<Agendamento>(`/agendamentos/${id}`);
    return { data, error };
  },

  async create(agendamento: Omit<Agendamento, 'id' | 'status' | 'created_at' | 'updated_at'>) {
    const { data, error } = await api.post<Agendamento>('/agendamentos', {
      ...agendamento,
      termo_aceito_em: agendamento.termo_aceito ? new Date().toISOString() : null,
    });
    return { data, error };
  },

  async updateStatus(
    id: string,
    status: 'aprovado' | 'rejeitado' | 'cancelado',
    resposta?: string
  ) {
    const { data, error } = await api.patch<Agendamento>(`/agendamentos/${id}`, {
      status,
      resposta_coordenador: resposta,
      respondido_em: new Date().toISOString(),
    });
    return { data, error };
  },

  async getDashboardStats(espacoId?: string) {
    const query = espacoId ? `?espaco_id=${espacoId}` : '';
    const { data, error } = await api.get<DashboardAgendamentos>(`/agendamentos/dashboard${query}`);
    return { data, error };
  },

  async getConflitos(espacoId: string, data: string, inicio: string, fim: string, excludeId?: string) {
    const { data: conflitos, error } = await api.get<Agendamento[]>(
      `/agendamentos/conflitos?espaco_id=${espacoId}&data=${data}&inicio=${inicio}&fim=${fim}&exclude_id=${excludeId || ''}`
    );
    return { data: conflitos || [], error };
  },

  async getAvailableDates(espacoId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const { data, error } = await api.get<{ data_pretendida: string; horario_inicio: string; horario_fim: string }[]>(
      `/agendamentos/disponiveis?espaco_id=${espacoId}&inicio=${startDate}&fim=${endDate}`
    );
    return { data, error };
  },

  async getDocumentos(agendamentoId: string) {
    const { data, error } = await api.get<any[]>(`/agendamentos/${agendamentoId}/documentos`);
    return { data: data || [], error };
  },
};