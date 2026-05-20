import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function computadorRoutes(app: FastifyInstance) {
  // Listar todos
  app.get('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const { espaco_id, status } = request.query as any;
    const where: any = {};
    if (espaco_id) where.espacoId = espaco_id;
    if (status) where.status = status;
    return prisma.computador.findMany({ where, orderBy: { numero: 'asc' } });
  });

  // Buscar por ID
  app.get('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    return prisma.computador.findUnique({ where: { id } });
  });

  // Criar (iniciar sessão no computador)
  app.post('/', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const data = request.body as any;

    // BUG 1 & 6: Validar check-in ativo antes de permitir uso do computador
    if (data.usuarioId && data.usuarioId !== 'temp') {
      const activeVisit = await prisma.visit.findFirst({
        where: {
          visitorId: data.usuarioId,
          espacoId: data.espacoId,
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
          usuarioId: data.usuarioId,
          espacoId: data.espacoId,
          status: 'EmUso',
        },
      });

      if (activeComputer) {
        return reply.status(409).send({
          error: `Visitante já está utilizando o computador PC ${activeComputer.numero} neste espaço.`,
        });
      }
    }

    return prisma.computador.create({ data });
  });

  // Atualizar
  app.put('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    const data = request.body as any;
    return prisma.computador.update({ where: { id }, data });
  });

  // Deletar
  app.delete('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    await prisma.computador.delete({ where: { id } });
    return { success: true };
  });
}