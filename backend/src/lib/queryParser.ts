import { parseDate } from './dateUtils.js';

export interface QueryParams {
  [key: string]: any;
}

export interface ParsedWhere {
  where: QueryParams;
  orderBy?: QueryParams;
  take?: number;
  skip?: number;
}

export function parseQueryParams(params: QueryParams): ParsedWhere {
  const result: ParsedWhere = { where: {} };
  const { 
    espaco_id, espacoId,
    status, limit, order, 
    checkin, checkin_gte, checkin_lte, checkin_lt, checkin_gt,
    data_inicio, data_fim,
    cpf, passport,
    ativo,
    ...rest 
  } = params;

  // ESPACO_ID - aceita ambos formatos
  const espacoIdValue = espaco_id || espacoId;
  if (espacoIdValue) {
    result.where.espacoId = espacoIdValue;
  }

  // STATUS - suporta múltiplos valores (status=Ativo,Excedido)
  if (status) {
    if (status.includes(',')) {
      result.where.status = { 
        in: status.split(',').map((s: string) => s.trim()) 
      };
    } else {
      result.where.status = status;
    }
  }

  // DATE FILTERS
  const dateFilters: QueryParams = {};
  
  // Checkin filters - formato PostgREST (checkin=gte.2026-05-09)
  if (checkin) {
    if (checkin.startsWith('lt.')) {
      dateFilters.lt = new Date(checkin.substring(3));
    } else if (checkin.startsWith('gt.')) {
      dateFilters.gt = new Date(checkin.substring(3));
    } else if (checkin.startsWith('lte.')) {
      dateFilters.lte = new Date(checkin.substring(4));
    } else if (checkin.startsWith('gte.')) {
      dateFilters.gte = new Date(checkin.substring(4));
    } else {
      const parsed = parseDate(checkin);
      if (parsed) dateFilters.gte = parsed;
    }
  }
  
  // Checkin filters - formato direto (checkin_gte=2026-05-09)
  if (checkin_gte) {
    const parsed = parseDate(checkin_gte);
    if (parsed) dateFilters.gte = parsed;
  }
  if (checkin_lte) {
    const parsed = parseDate(checkin_lte);
    if (parsed) dateFilters.lte = parsed;
  }
  if (checkin_lt) {
    const parsed = parseDate(checkin_lt);
    if (parsed) dateFilters.lt = parsed;
  }
  if (checkin_gt) {
    const parsed = parseDate(checkin_gt);
    if (parsed) dateFilters.gt = parsed;
  }
  
  if (Object.keys(dateFilters).length > 0) {
    result.where.checkin = dateFilters;
  }

  // Data filters (agendamentos)
  if (data_inicio || data_fim) {
    result.where.data_pretendida = {};
    if (data_inicio) {
      result.where.data_pretendida.gte = new Date(data_inicio);
    }
    if (data_fim) {
      result.where.data_pretendida.lte = new Date(data_fim);
    }
  }

  // CPF/Passport (visitors)
  if (cpf) result.where.cpf = cpf;
  if (passport) result.where.passport = passport;

  // Ativo (spaces)
  if (ativo !== undefined) {
    result.where.ativo = ativo === 'true';
  }

  // ORDER BY
  if (order) {
    const orderField = 'checkin';
    result.orderBy = { [orderField]: order === 'asc' ? 'asc' : 'desc' };
  }

  // LIMIT
  if (limit) {
    result.take = parseInt(limit);
  }

  // Add any remaining params to where (custom filters)
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== '') {
      result.where[key] = value;
    }
  }

  return result;
}

export function buildPrismaWhere(params: QueryParams): QueryParams {
  const parsed = parseQueryParams(params);
  return parsed.where;
}