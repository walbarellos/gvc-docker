import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type LockerStatus = 'Livre' | 'Ocupado' | 'Manutencao';

const lockerStatusMap: Record<string, LockerStatus> = {
  'Livre': 'Livre',
  'Ocupado': 'Ocupado',
  'Manutencao': 'Manutencao',
  'disponivel': 'Livre',
  'ocupado': 'Ocupado',
};

export async function lockerRoutes(app: FastifyInstance) {
  // Listar todos
  app.get('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const { espaco_id, status } = request.query as any;
    const where: any = {};
    if (espaco_id) where.espacoId = espaco_id;
    if (status) where.status = lockerStatusMap[status] || status;
    return prisma.locker.findMany({ where, orderBy: { number: 'asc' } });
  });

  // Buscar por ID
  app.get('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    return prisma.locker.findUnique({ where: { id } });
  });

  // Criar
  app.post('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const data = request.body as any;
    return prisma.locker.create({ data });
  });

  // Atualizar
  app.put('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    const data = request.body as any;
    return prisma.locker.update({ where: { id }, data });
  });

  // Deletar
  app.delete('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    await prisma.locker.delete({ where: { id } });
    return { success: true };
  });

  // Alocar armário
  app.post('/alocar', { preHandler: [app.authenticate] }, async (request: any) => {
    const { numero, visitorId, espacoId } = request.body as any;
    const locker = await prisma.locker.create({
      data: {
        number: parseInt(numero),
        status: 'Ocupado',
        espacoId,
        visitorId,
      }
    });
    return locker;
  });

  // Desalocar armário
  app.post('/:id/desalocar', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    const locker = await prisma.locker.update({
      where: { id },
      data: { status: 'Livre', visitorId: null }
    });
    return locker;
  });
}