import { z } from 'zod';

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
  has_auditorio: z.boolean().default(false),
  qtd_auditorio: z.number().int().min(0).optional().nullable(),
  has_sala_estudos: z.boolean().default(false),
  qtd_sala_estudos: z.number().int().min(0).optional().nullable(),
  has_teatro: z.boolean().default(false),
  qtd_teatro: z.number().int().min(0).optional().nullable(),
  has_filmoteca: z.boolean().default(false),
  qtd_filmoteca: z.number().int().min(0).optional().nullable(),
  has_espaco_aberto: z.boolean().default(false),
  qtd_espaco_aberto: z.number().int().min(0).optional().nullable(),
  has_visita_guiada: z.boolean().default(false),
  qtd_visita_guiada: z.number().int().min(0).optional().nullable(),
});

export const updateSpaceSchema = createSpaceSchema.partial();

export type CreateSpaceDTO = z.infer<typeof createSpaceSchema>;
export type UpdateSpaceDTO = z.infer<typeof updateSpaceSchema>;