import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function assinaturaRoutes(app: FastifyInstance) {
  // Listar todos
  app.get('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const { limit } = request.query as any;
    return prisma.assinaturaDigital.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : 50,
    });
  });

  // Criar
  app.post('/', async (request: any) => {
    const data = request.body as any;
    return prisma.assinaturaDigital.create({ data });
  });

  // Buscar por ID
  app.get('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    return prisma.assinaturaDigital.findUnique({ where: { id } });
  });

  // Buscar por CPF
  app.get('/cpf/:cpf', { preHandler: [app.authenticate] }, async (request: any) => {
    const { cpf } = request.params;
    return prisma.assinaturaDigital.findMany({
      where: { cpfAssinante: cpf },
      orderBy: { createdAt: 'desc' },
    });
  });
}