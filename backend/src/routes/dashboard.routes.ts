import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function dashboardRoutes(app: FastifyInstance) {
  // Estatísticas
  app.get('/estatisticas', { preHandler: [app.authenticate] }, async (request: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalVisitantes, visitasHoje, agendamentosPendentes, espacos] = await Promise.all([
      prisma.visitor.count(),
      prisma.visit.count({ where: { checkin: { gte: today } } }),
      prisma.agendamento.count({ 
        where: { status: 'pendente', ...(request.user.perfil !== 'administrador' ? { espacoId: request.user.espacoId } : {}) } 
      }),
      prisma.espaco.count({ where: { ativo: true } }),
    ]);

    return { totalVisitantes, visitasHoje, agendamentosPendentes, espacos };
  });

  // Alias para compatibilidade
  app.get('/stats', { preHandler: [app.authenticate] }, async (request: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalVisitantes, visitasHoje, agendamentosPendentes, espacos] = await Promise.all([
      prisma.visitor.count(),
      prisma.visit.count({ where: { checkin: { gte: today } } }),
      prisma.agendamento.count({ 
        where: { status: 'pendente', ...(request.user.perfil !== 'administrador' ? { espacoId: request.user.espacoId } : {}) } 
      }),
      prisma.espaco.count({ where: { ativo: true } }),
    ]);

    return { totalVisitantes, visitasHoje, agendamentosPendentes, espacos };
  });
}