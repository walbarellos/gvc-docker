import { z } from 'zod';
export const createVisitSchema = z.object({
    visitorId: z.string().uuid('ID de visitante inválido').optional(),
    espacoId: z.string().uuid('ID de espaço inválido').optional().nullable(),
    nome: z.string().min(1, 'Nome é obrigatório').optional(),
    perfil: z.enum(['general', 'estudante', 'professor', 'turista', 'pesquisador', 'cultural']).default('general'),
    local: z.string().optional().nullable(),
    status: z.enum(['ativo', 'finalizado', 'cancelado']).default('ativo'),
    armario: z.string().optional().nullable(),
});
export const checkinSchema = z.object({
    visitorId: z.string().uuid('ID de visitante inválido'),
    espacoId: z.string().uuid('ID de espaço inválido').nullable(),
    perfil: z.enum(['general', 'estudante', 'professor', 'turista', 'pesquisador', 'cultural']).default('general'),
    nome: z.string().optional(),
    local: z.string().optional(),
});
export const checkoutSchema = z.object({
    id: z.string().uuid('ID de visita inválido'),
});
//# sourceMappingURL=visit.schema.js.map