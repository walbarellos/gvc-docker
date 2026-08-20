import { z } from 'zod';
import type { FastifyReply } from 'fastify';

// ============================================
// Tipos e Utilitários de Validação
// ============================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    statusCode: number;
    message: string;
    details?: z.ZodIssue[];
  };
}

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): ValidationResult<T> {
  const result = schema.safeParse(body);
  
  if (!result.success) {
    return {
      success: false,
      error: {
        statusCode: 400,
        message: 'Dados inválidos',
        details: result.error.issues,
      },
    };
  }
  
  return {
    success: true,
    data: result.data,
  };
}

export function sendValidationError(reply: FastifyReply, error: z.ZodError) {
  return reply.status(400).send({
    error: 'Dados inválidos',
    message: 'Verifique os campos enviados',
    details: error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })),
  });
}

// ============================================
// Schemas - Visitor
// ============================================

export const createVisitorSchema = z.object({
  full_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos').max(14).optional(),
  passport: z.string().optional(),
  is_foreigner: z.boolean().optional().default(false),
  gender: z.enum(['masculino', 'feminino', 'outro', 'prefiro_nao_dizer']).optional(),
  birth_date: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  category: z.string().optional(),
  photo_url: z.string().url('URL inválida').optional().or(z.literal('')),
  parentalAuthorization: z.boolean().optional().default(false),
  responsibleName: z.string().max(100).optional(),
  authorizationDocType: z.enum(['PHYSICAL', 'DIGITAL', 'TERM']).optional(),
  authorizationPresented: z.boolean().optional().default(false),
});

export const updateVisitorSchema = createVisitorSchema.partial();

// ============================================
// Schemas - Visit
// ============================================

export const createVisitSchema = z.object({
  visitor_id: z.string().uuid('ID do visitante inválido').optional(),
  espaco_id: z.string().uuid('ID do espaço inválido').optional().nullable(),
  nome: z.string().optional(),
  perfil: z.enum(['general', 'estudante', 'professor', 'turista', 'pesquisador', 'cultural']).default('general'),
  local: z.string().optional().nullable(),
  status: z.enum(['ativo', 'finalizado', 'cancelado']).default('ativo'),
  armario: z.string().optional().nullable(),
});

export const checkinSchema = z.object({
  visitorId: z.string().uuid('ID do visitante inválido'),
  espacoId: z.string().uuid('ID do espaço inválido').nullable(),
  perfil: z.enum(['general', 'estudante', 'professor', 'turista', 'pesquisador', 'cultural']).default('general'),
  nome: z.string().optional(),
  local: z.string().optional(),
  responsibleAccompanied: z.boolean().optional().default(false),
});

export const checkoutSchema = z.object({
  id: z.string().uuid('ID da visita inválido'),
});

// ============================================
// Schemas - Space (Espaço)
// ============================================

export const createSpaceSchema = z.object({
  nome: z.string().min(3, 'Nome do espaço é obrigatório'),
  email: z.string().email('Email inválido').optional().nullable(),
  endereco: z.string().optional().nullable(),
  municipio: z.string().optional().nullable(),
  horario_funcionamento: z.string().optional().nullable(),
  capacidade_visitantes: z.number().int().positive().optional().nullable(),
  mensagem_boas_vindas: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
  perfil_armarios: z.boolean().default(false),
  perfil_telecentro: z.boolean().default(false),
  perfil_agendamento: z.boolean().default(false),
  total_armarios: z.number().int().min(0).optional().nullable(),
  total_computadores: z.number().int().min(0).optional().nullable(),
  tempo_limite_computador: z.number().int().min(0).optional().nullable(),
  capacidade_agendamento: z.number().int().min(0).optional().nullable(),
});

export const updateSpaceSchema = createSpaceSchema.partial();

// ============================================
// Schemas - User
// ============================================

export const createUserSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  perfil: z.enum(['administrador', 'coordenador', 'operador', 'funcionario', 'monitor']).default('funcionario'),
  espacoId: z.string().uuid('ID do espaço inválido').optional().nullable(),
  ativo: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  nome: z.string().min(3).optional(),
  email: z.string().email('Email inválido').optional(),
  senha: z.string().min(6).optional(),
  perfil: z.enum(['administrador', 'coordenador', 'operador', 'funcionario', 'monitor']).optional(),
  espacoId: z.string().uuid().nullable().optional(),
  ativo: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

// ============================================
// Schemas - Agendamento
// ============================================

export const createAgendamentoSchema = z.object({
  espaco_id: z.string().uuid('ID de espaço inválido'),
  solicitante_nome: z.string().min(3, 'Nome do solicitante é obrigatório'),
  solicitante_email: z.string().email('Email inválido'),
  solicitante_telefone: z.string().min(10, 'Telefone inválido'),
  solicitante_documento: z.string().optional().nullable(),
  tipo_solicitante: z.enum(['cpf', 'cnpj', 'estrangeiro']),
  tipo_espaco: z.enum(['auditorio', 'sala_estudos', 'teatro', 'filmoteca', 'espaco_aberto', 'visita_guiada']),
  espaco_solicitado: z.string().min(3, 'Nome do espaço é obrigatório'),
  data_pretendida: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (formato: YYYY-MM-DD)'),
  horario_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido (formato: HH:MM)'),
  horario_fim: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido (formato: HH:MM)'),
  numero_participantes: z.number().int().min(1, 'Número mínimo de participantes é 1'),
  descricao_evento: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  natureza_evento: z.string().min(3, 'Natureza do evento é obrigatória'),
  gratuito: z.boolean(),
  valor_ingresso: z.number().positive().optional().nullable(),
  necessita_equipamentos: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  termo_aceito: z.boolean().refine(val => val === true, 'Termo deve ser aceito'),
  responsabhilidade_evento: z.boolean().refine(val => val === true, 'Responsabilidade deve ser aceita'),
  danos_patrimonio: z.boolean().refine(val => val === true, 'Danos ao patrimônio deve ser aceito'),
  respeito_lotacao: z.boolean().refine(val => val === true, 'Respeito à lotação deve ser aceito'),
  autorizo_divulgacao: z.boolean().default(false),
});

export const updateAgendamentoSchema = createAgendamentoSchema.partial();

export const updateAgendamentoStatusSchema = z.object({
  status: z.enum(['aprovado', 'rejeitado', 'cancelado']),
  resposta_coordenador: z.string().optional(),
});
// ============================================
// Schemas extras (problema-18) — rotas que usavam `as any`
// ============================================
export * from './extra.js';
