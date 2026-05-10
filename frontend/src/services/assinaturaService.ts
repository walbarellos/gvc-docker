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

export const registrarAssinaturaDigital = async (dados: AssinaturaData): Promise<AssinaturaResult> => {
  try {
    const ip = await getPublicIP();
    const hash = await generateDocumentHash(dados.documentoConteudo);
    const fingerprint = getBrowserFingerprint();
    const timestamp = getLegalTimestamp();
    
    const cpfValidacao = await validateCPFReceita(dados.cpf);
    
    const assinaturaData = {
      visitor_id: dados.visitorId,
      nome_assinante: dados.nome,
      cpf_assinante: dados.cpf,
      tipo_documento: dados.tipo,
      documento_id: dados.documentoId,
      documento_hash: hash,
      ip_publico: ip,
      user_agent: navigator.userAgent,
      browser_fingerprint: JSON.stringify(fingerprint),
      data_hora: timestamp.iso,
      data_hora_brasilia: timestamp.brasilia,
      timezone: timestamp.timezone,
      cpf_validado: cpfValidacao.valid,
      cpf_status: cpfValidacao.status,
      termo_conteudo: dados.termosConteudo,
      termo_hash: dados.termosConteudo ? await generateDocumentHash(dados.termosConteudo) : null,
    };
    
    const { data, error } = await api.post<any>('/assinaturas', assinaturaData);
    
    if (error) {
      console.error('Erro ao salvar assinatura:', error);
      return {
        hash,
        ip,
        timestamp: timestamp.brasilia,
        cpfStatus: cpfValidacao.status || 'ERRO',
        success: false,
        error: error.message
      };
    }
    
    return {
      id: data?.id,
      hash,
      ip,
      timestamp: timestamp.brasilia,
      cpfStatus: cpfValidacao.status || 'VERIFICADO',
      success: true
    };
  } catch (error: any) {
    console.error('Erro na assinatura digital:', error);
    return {
      hash: '',
      ip: '',
      timestamp: '',
      cpfStatus: 'ERRO',
      success: false,
      error: error.message
    };
  }
};

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