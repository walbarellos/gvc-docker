import { api } from '../lib/api';
import { getPublicIP } from '../utils/network';
import { generateDocumentHash } from '../utils/crypto';
import { getBrowserFingerprint } from '../utils/browser';
import { getLegalTimestamp } from '../utils/datetime';
import { validateCPFReceita } from './cpfService';

export interface AssinaturaData {
  visitorId: string;
  nome: string;
  cpf: string;
  tipo: string;
  documentoId: string;
  documentoConteudo: string;
  termosConteudo?: string;
}

export interface AssinaturaResult {
  id?: string;
  hash: string;
  ip: string;
  timestamp: string;
  cpfStatus: string;
  success: boolean;
  error?: string;
}

export interface AssinaturaCreateParams {
  visitorId: string | null;
  nomeAssinante: string;
  cpfAssinante: string;
  tipoDocumento: string;
  documentoId: string;
  documentoHash: string;
  ipPublico?: string;
  userAgent?: string;
  browserFingerprint?: string;
  cpfValidado: boolean;
  cpfStatus: string;
  termoConteudo?: string;
  termoHash?: string;
}

export const assinaturaService = {
  async create(params: AssinaturaCreateParams) {
    const assinaturaData = {
      visitor_id: params.visitorId,
      nome_assinante: params.nomeAssinante,
      cpf_assinante: params.cpfAssinante,
      tipo_documento: params.tipoDocumento,
      documento_id: params.documentoId,
      documento_hash: params.documentoHash,
      ip_publico: params.ipPublico || '',
      user_agent: params.userAgent || navigator.userAgent,
      browser_fingerprint: params.browserFingerprint || '',
      cpf_validado: params.cpfValidado,
      cpf_status: params.cpfStatus,
      termo_conteudo: params.termoConteudo,
      termo_hash: params.termoHash,
    };
    
    const { data, error } = await api.post<any>('/assinaturas', assinaturaData);
    return { data, error };
  }
};