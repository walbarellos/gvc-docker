// Tipos compartilhados - sempre usar camelCase

export interface CheckinRequest {
  visitorId: string;
  espacoId: string;
  perfil?: string;
  responsibleAccompanied?: boolean;
}

export interface CheckoutRequest {
  visitId: string;
}

export interface CreateVisitorRequest {
  fullName: string;
  cpf?: string;
  passport?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  parentalAuthorization?: boolean;
  responsibleName?: string;
  authorizationDocType?: string;
}

export interface VisitFilters {
  status?: string;
  espacoId?: string;
  checkin?: string;
  checkin_gte?: string;
  checkin_lte?: string;
  order?: string;
  limit?: number;
}

export interface AgendamentoFilters {
  status?: string;
  espacoId?: string;
  data_inicio?: string;
  data_fim?: string;
}