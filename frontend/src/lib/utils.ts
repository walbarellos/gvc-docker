

import { format } from 'date-fns';

/**
 * Normaliza um documento de visita da API para um formato padrão.
 */
export function normalizarVisita(doc: any) {
  const data = doc;
  const id = doc.id || data.id;

  // Normalização de Nome
  const nome = data.nome || data.visitorName || data.fullName || "Desconhecido";
  
  // Normalização de Perfil/Categoria
  const perfil = data.perfil || data.category || data.profile || "general";
  
  // Normalização de Local
  const local = data.local || data.location || data.espacoNome || "Entrada Principal";
  
  // Normalização de Status
  let status = data.status || "Ativo";
  if (status === 'active') status = 'Ativo';
  if (status === 'completed') status = 'Concluído';
  
  // Normalização de Horários
  const checkin = data.checkin || data.serverCheckInTime || data.checkInTime;
  const checkout = data.checkout || null;

  return {
    id,
    visitorId: data.visitorId || data.visitor_id || null,
    nome,
    perfil,
    local,
    status,
    checkin,
    checkout,
    espacoId: data.espacoId || data.espaco_id || "desconhecido"
  };
}

export const traduzirPerfil = (p: string) => {
  const map: Record<string, string> = {
    'student': 'Estudante',
    'researcher': 'Pesquisador',
    'general': 'Visitante',
    'staff': 'Funcionário',
    'Visitante': 'Visitante',
    'Estudante': 'Estudante',
    'Pesquisador': 'Pesquisador',
    'Funcionário': 'Funcionário'
  };
  return map[p] || p;
};

export const formatTime = (ts: string | number | Date | null | undefined): string => {
  if (!ts) return '--:--';
  try {
    return format(new Date(ts), 'HH:mm');
  } catch {
    return '--:--';
  }
};
