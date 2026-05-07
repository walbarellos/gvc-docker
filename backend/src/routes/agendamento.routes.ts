import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function agendamentoRoutes(app: FastifyInstance) {
  // Listar (coordenador+)
  app.get('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const where = request.user.perfil === 'cidadao'
      ? { solicitanteEmail: request.user.email }
      : request.user.perfil === 'administrador'
      ? {}
      : { espacoId: request.user.espacoId };

    return prisma.agendamento.findMany({ where, orderBy: { created_at: 'desc' } });
  });

  // Aprovar (coordenador+)
  app.put('/:id/approve', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (!['coordenador', 'administrador'].includes(request.user.perfil)) {
      return reply.status(403).send({ error: 'Apenas coordenador pode aprovar' });
    }
    const { id } = request.params;
    const { resposta } = request.body as any;
    return prisma.agendamento.update({
      where: { id },
      data: { status: 'aprovado', resposta_coordenador: resposta, coordenadorId: request.user.id, respondido_em: new Date() },
    });
  });

  // Rejeitar
  app.put('/:id/reject', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (!['coordenador', 'administrador'].includes(request.user.perfil)) {
      return reply.status(403).send({ error: 'Apenas coordenador pode rejeitar' });
    }
    const { id } = request.params;
    const { resposta } = request.body as any;
    return prisma.agendamento.update({
      where: { id },
      data: { status: 'rejeitado', resposta_coordenador: resposta, coordenadorId: request.user.id, diversificado_em: new Date() },
    });
  });
}