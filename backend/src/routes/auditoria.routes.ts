import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function auditoriaRoutes(app: FastifyInstance) {
  // Listar todos
  app.get('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const { limit } = request.query as any;
    return prisma.auditoria.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : 50,
    });
  });

  // Criar (sem auth para logs automáticos)
  app.post('/', async (request: any) => {
    const data = request.body as any;
    return prisma.auditoria.create({ data });
  });
}