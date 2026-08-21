import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/authorization.js';
import { createComputadorBodySchema, updateComputadorBodySchema, validateBody } from '../schemas/index.js';

export async function computadorRoutes(app: FastifyInstance) {
  // Listar todos
  app.get('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const { espaco_id, espacoId, status, visitor_id, visitorId } = request.query as any;
    const where: any = {};
    const finalEspacoId = espaco_id || espacoId;
    if (finalEspacoId) where.espacoId = finalEspacoId;
    
    const finalVisitorId = visitor_id || visitorId;
    if (finalVisitorId) where.visitorId = finalVisitorId;
    
    if (status) {
       // Padronizar status
       let s = status;
       if (s === 'EmUso') s = 'Em Uso';
       where.status = s;
    }
    return prisma.computador.findMany({ where, orderBy: { numero: 'asc' } });
  });

  // Buscar por ID
  app.get('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    return prisma.computador.findUnique({ where: { id } });
  });

  // Criar (iniciar sessão no computador)
  app.post('/', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const parsed = validateBody(createComputadorBodySchema, request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error?.details });
    }
    const data = parsed.data!;

    const numero = data.numero ?? data.number;
    const usuarioId = data.usuarioId || data.usuario_id || null;
    const espacoId = data.espacoId || data.espaco_id || null;

    // BUG 1 & 6: Validar check-in ativo antes de permitir uso do computador
    if (usuarioId && usuarioId !== 'temp') {
      const activeVisit = await prisma.visit.findFirst({
        where: {
          visitorId: usuarioId,
          espacoId: espacoId ?? undefined,
          status: 'ativo',
          checkout: null,
        },
      });

      if (!activeVisit) {
        return reply.status(400).send({
          error: 'Visitante não possui check-in ativo neste espaço. Realize o check-in primeiro.',
        });
      }

      const activeComputer = await prisma.computador.findFirst({
        where: {
          usuarioId: usuarioId,
          espacoId: espacoId ?? undefined,
          status: { in: ['Em Uso', 'EmUso'] },
        },
      });

      if (activeComputer) {
        return reply.status(409).send({
          error: `Visitante já está utilizando o computador PC ${activeComputer.numero} neste espaço.`,
        });
      }
    }

    return prisma.computador.create({
      data: {
        numero,
        status: (data.status === 'EmUso' ? 'Em Uso' : data.status) || 'Livre',
        usuarioId,
        usuarioNome: data.usuarioNome || data.usuario_nome || null,
        espacoId,
        espacoNome: data.espacoNome || null,
        horarioInicio: data.horarioInicio ? new Date(data.horarioInicio) : null,
        horarioLimite: data.horarioLimite ? new Date(data.horarioLimite) : null,
      },
    });
  });


  // Desalocar computador
  app.post('/:id/desalocar', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { id } = request.params;
    return prisma.computador.update({
      where: { id },
      data: {
        status: 'Livre',
        usuarioId: null,
        usuarioNome: null,
        horarioInicio: null,
        horarioLimite: null
      }
    });
  });

  // Atualizar
  app.put('/:id', { preHandler: [app.authenticate, requireRole('administrador', 'coordenador')] }, async (request: any, reply: any) => {
    const { id } = request.params;
    const parsed = validateBody(updateComputadorBodySchema, request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error?.details });
    }
    const data = parsed.data!;

    const updateData: any = {};
    if (data.numero !== undefined || data.number !== undefined) updateData.numero = data.numero ?? data.number;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.usuarioId !== undefined || data.usuario_id !== undefined) updateData.usuarioId = data.usuarioId || data.usuario_id;
    if (data.usuarioNome !== undefined || data.usuario_nome !== undefined) updateData.usuarioNome = data.usuarioNome || data.usuario_nome;
    if (data.espacoId !== undefined || data.espaco_id !== undefined) updateData.espacoId = data.espacoId || data.espaco_id;
    if (data.espacoNome !== undefined) updateData.espacoNome = data.espacoNome;
    if (data.horarioInicio !== undefined) updateData.horarioInicio = data.horarioInicio ? new Date(data.horarioInicio) : null;
    if (data.horarioLimite !== undefined) updateData.horarioLimite = data.horarioLimite ? new Date(data.horarioLimite) : null;

    return prisma.computador.update({ where: { id }, data: updateData });
  });

  // Deletar
  app.delete('/:id', { preHandler: [app.authenticate, requireRole('administrador', 'coordenador')] }, async (request: any) => {
    const { id } = request.params;
    await prisma.computador.delete({ where: { id } });
    return { success: true };
  });
}