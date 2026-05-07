import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function visitRoutes(app: FastifyInstance) {
  // Check-in
  app.post('/checkin', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { visitorId, espacoId, nome, perfil } = request.body as any;
    
    // Verificar check-in ativo nos últimos 60 min
    const existing = await prisma.visit.findFirst({
      where: {
        visitorId,
        espacoId,
        status: 'Ativo',
        checkin: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (existing) {
      return reply.status(400).send({ error: 'Visitante já possui check-in ativo nos últimos 60 minutos' });
    }

    const visit = await prisma.visit.create({
      data: { visitorId, espacoId, nome, perfil: perfil || 'general', status: 'Ativo' },
    });
    return visit;
  });

  // Check-out
  app.post('/checkout/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    const visit = await prisma.visit.update({
      where: { id },
      data: { checkout: new Date(), status: 'Inativo' },
    });
    return visit;
  });

  // Visitas ativas do espaço
  app.get('/active', { preHandler: [app.authenticate] }, async (request: any) => {
    const visits = await prisma.visit.findMany({
      where: { espacoId: request.user.espacoId, status: 'Ativo' },
    });
    return visits;
  });

  // Visitas de hoje
  app.get('/today', { preHandler: [app.authenticate] }, async (request: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const visits = await prisma.visit.findMany({
      where: { checkin: { gte: today } },
    });
    return visits;
  });
}