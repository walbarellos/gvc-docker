import { z } from 'zod';

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

export const updateAgendamentoStatusSchema = z.object({
  status: z.enum(['aprovado', 'rejeitado', 'cancelado']),
  resposta_coordenador: z.string().optional(),
});

export const updateAgendamentoSchema = createAgendamentoSchema.partial();

export type CreateAgendamentoDTO = z.infer<typeof createAgendamentoSchema>;
export type UpdateAgendamentoStatusDTO = z.infer<typeof updateAgendamentoStatusSchema>;
export type UpdateAgendamentoDTO = z.infer<typeof updateAgendamentoSchema>;