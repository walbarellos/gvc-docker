import { z } from 'zod';

export const createUserSchema = z.object({
  nome: z.string().min(3, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  perfil: z.enum(['administrador', 'coordenador', 'funcionario', 'monitor']).default('funcionario'),
  espacoId: z.string().uuid('ID de espaço inválido').optional().nullable(),
  ativo: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  nome: z.string().min(3).optional(),
  email: z.string().email('Email inválido').optional(),
  senha: z.string().min(6).optional(),
  perfil: z.enum(['administrador', 'coordenador', 'funcionario', 'monitor']).optional(),
  espacoId: z.string().uuid().nullable().optional(),
  ativo: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;