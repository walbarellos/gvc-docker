import { api } from '../lib/api';

export interface AgendamentoDraft {
  id?: string;
  session_id: string;
  solicitante_nome: string;
  solicitante_email: string;
  solicitante_telefone: string;
  solicitante_documento: string;
  tipo_solicitante: string;
  razao_social: string;
  nome_instituicao: string;
  secretaria_governo: string;
  unidade_governo: string;
  espaco_id: string;
  tipo_espaco: string;
  espaco_solicitado: string;
  data_pretendida: string;
  horario_inicio: string;
  horario_fim: string;
  numero_participantes: number;
  descricao_evento: string;
  natureza_evento: string;
  gratuito: boolean;
  valor_ingresso: string;
  necessita_equipamentos: string;
  observacoes: string;
  termo_aceito: boolean;
  responsabhilidade_evento: boolean;
  danos_patrimonio: boolean;
  respeito_lotacao: boolean;
  autorizo_divulgacao: boolean;
  termo_compromisso_assinado: boolean;
  termo_compromisso_data: string;
  termo_compromisso_ip: string;
  current_step: number;
}

const SESSION_KEY = 'gvc_session_id';

function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'gvc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export const draftService = {
  async saveDraft(data: AgendamentoDraft): Promise<boolean> {
    try {
      const sessionId = getSessionId();
      const { error } = await api.post('/agendamentos/rascunho', {
        session_id: sessionId,
        ...data
      });

      if (error) {
        // console.error('Erro ao salvar rascunho no banco:', error);
        return false;
      }
      return true;
    } catch (e) {
      // console.error('Erro ao salvar rascunho:', e);
      return false;
    }
  },

  async loadDraft(): Promise<AgendamentoDraft | null> {
    try {
      const sessionId = getSessionId();
      const { data, error } = await api.get<AgendamentoDraft[]>(
        `/agendamentos/rascunho?session_id=${sessionId}`
      );

      if (error || !data || data.length === 0) {
        return null;
      }

      const d = data[0];
      return {
        id: d.id,
        session_id: d.session_id,
        solicitante_nome: d.solicitante_nome || '',
        solicitante_email: d.solicitante_email || '',
        solicitante_telefone: d.solicitante_telefone || '',
        solicitante_documento: d.solicitante_documento || '',
        tipo_solicitante: d.tipo_solicitante || 'pessoa_fisica',
        razao_social: d.razao_social || '',
        nome_instituicao: d.nome_instituicao || '',
        secretaria_governo: d.secretaria_governo || '',
        unidade_governo: d.unidade_governo || '',
        espaco_id: d.espaco_id || '',
        tipo_espaco: d.tipo_espaco || '',
        espaco_solicitado: d.espaco_solicitado || '',
        data_pretendida: d.data_pretendida || '',
        horario_inicio: d.horario_inicio || '',
        horario_fim: d.horario_fim || '',
        numero_participantes: d.numero_participantes || 0,
        descricao_evento: d.descricao_evento || '',
        natureza_evento: d.natureza_evento || 'cultural',
        gratuito: d.gratuito !== false,
        valor_ingresso: d.valor_ingresso || '',
        necessita_equipamentos: d.necessita_equipamentos || '',
        observacoes: d.observacoes || '',
        termo_aceito: d.termo_aceito || false,
        responsabhilidade_evento: d.responsabhilidade_evento || false,
        danos_patrimonio: d.danos_patrimonio || false,
        respeito_lotacao: d.respeito_lotacao || false,
        autorizo_divulgacao: d.autorizo_divulgacao || false,
        termo_compromisso_assinado: d.termo_compromisso_assinado || false,
        termo_compromisso_data: d.termo_compromisso_data || '',
        termo_compromisso_ip: d.termo_compromisso_ip || '',
        current_step: d.current_step || 1
      };
    } catch (e) {
      // console.error('Erro ao carregar rascunho:', e);
      return null;
    }
  },

  async clearDraft(): Promise<boolean> {
    try {
      const sessionId = getSessionId();
      const { error } = await api.delete(`/agendamentos/rascunho?session_id=${sessionId}`);

      if (error) {
        // console.error('Erro ao limpar rascunho:', error);
        return false;
      }

      sessionStorage.removeItem(SESSION_KEY);
      return true;
    } catch (e) {
      // console.error('Erro ao limpar rascunho:', e);
      return false;
    }
  },

  getSessionId
};