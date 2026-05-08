import { api } from '../lib/api';

export type AuditoriaAcao = 
  | "criou_usuario" 
  | "excluiu_usuario" 
  | "editou_usuario" 
  | "criou_espaco" 
  | "excluiu_espaco" 
  | "editou_espaco" 
  | "alterou_configuracoes" 
  | "exportou_backup" 
  | "excluiu_visita";

export const registrarAuditoria = async (
  acao: AuditoriaAcao, 
  detalhes: string, 
  entidadeId: string | null = null, 
  userProfile: { email?: string; perfil?: string } | null = null
) => {
  try {
    const payload = {
      acao,
      detalhes,
      entidade_id: entidadeId,
      usuario: userProfile?.email || "sistema",
      perfil: userProfile?.perfil || "desconhecido"
    };
    
    await api.post('/auditoria', payload);
  } catch (error) {
    console.error("Erro ao registrar auditoria:", error);
  }
};
