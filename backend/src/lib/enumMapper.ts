import { Prisma } from '@prisma/client';

export type VisitStatusEnum = 'ativo' | 'finalizado' | 'cancelado';
export type AgendamentoStatusEnum = 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado';
export type ComputadorStatusEnum = 'Livre' | 'EmUso' | 'Manutencao' | 'Indisponivel';
export type LockerStatusEnum = 'Livre' | 'Ocupado' | 'Manutencao';

export const visitStatusMap: Record<string, VisitStatusEnum> = {
  'Ativo': 'ativo',
  'ativo': 'ativo',
  'Concluido': 'finalizado',
  'concluido': 'finalizado',
  'Finalizado': 'finalizado',
  'finalizado': 'finalizado',
  'Cancelado': 'cancelado',
  'cancelado': 'cancelado',
  'Inativo': 'cancelado',
  'inativo': 'cancelado',
};

export const agendamentoStatusMap: Record<string, AgendamentoStatusEnum> = {
  'Pendente': 'pendente',
  'pendente': 'pendente',
  'Aprovado': 'aprovado',
  'aprovado': 'aprovado',
  'Rejeitado': 'rejeitado',
  'rejeitado': 'rejeitado',
  'Cancelado': 'cancelado',
  'cancelado': 'cancelado',
};

export const computadorStatusMap: Record<string, any> = {
  'Livre': 'Livre',
  'livre': 'Livre',
  'EmUso': 'EmUso',
  'emuso': 'EmUso',
  'Em Uso': 'EmUso',
  'Manutencao': 'Manutencao',
  'manutencao': 'Manutencao',
  'Manutenção': 'Manutencao',
  'Indisponivel': 'Indisponivel',
  'indisponivel': 'Indisponivel',
  'Indisponível': 'Indisponivel',
};

export const lockerStatusMap: Record<string, any> = {
  'Livre': 'Livre',
  'livre': 'Livre',
  'Ocupado': 'Ocupado',
  'ocupado': 'Ocupado',
  'Manutencao': 'Manutencao',
  'manutencao': 'Manutencao',
  'Manutenção': 'Manutencao',
};

export function mapVisitStatus(status: string | string[]): VisitStatusEnum | VisitStatusEnum[] | string {
  if (Array.isArray(status)) {
    return status.map(s => visitStatusMap[s.trim()] || s.trim()) as VisitStatusEnum[];
  }
  return visitStatusMap[status] || status;
}

export function mapAgendamentoStatus(status: string | string[]): AgendamentoStatusEnum | AgendamentoStatusEnum[] | string {
  if (Array.isArray(status)) {
    return status.map(s => agendamentoStatusMap[s.trim()] || s.trim()) as AgendamentoStatusEnum[];
  }
  return agendamentoStatusMap[status] || status;
}

export function mapComputadorStatus(status: string): any {
  return computadorStatusMap[status] || status;
}

export function mapLockerStatus(status: string): any {
  return lockerStatusMap[status] || status;
}

export function parseMultipleStatuses(status: string, mapper: Record<string, any>): any {
  if (!status) return undefined;
  
  if (status.includes(',')) {
    return {
      in: status.split(',').map((s: string) => mapper[s.trim()] || s.trim()),
    };
  }
  
  return mapper[status] || status;
}