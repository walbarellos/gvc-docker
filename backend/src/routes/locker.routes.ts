import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

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
  app.post('/', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const data = request.body as any;
    
    if (!data.number) {
      return reply.status(400).send({ error: 'Número do armário é obrigatório' });
    }
    
    if (!data.espaco_id && !data.espacoId) {
      return reply.status(400).send({ error: 'Espaço é obrigatório' });
    }

    // Verificar limite de armários por visitante (1 por vez por espaço)
    const visitorId = data.visitor_id || data.visitorId;
    if (visitorId && data.espaco_id) {
      const existingLocker = await prisma.locker.findFirst({
        where: {
          visitorId: visitorId,
          espacoId: data.espacoId || data.espaco_id,
          status: 'Ocupado',
        },
      });

      if (existingLocker) {
        return reply.status(400).send({
          error: 'Visitante já possui armário ocupado neste espaço',
          detalhes: {
            armarioExistente: existingLocker.number,
            visitorId: visitorId,
          }
        });
      }
    }

    const mappedData: any = {
      number: data.number,
      status: data.status === 'occupied' ? 'Ocupado' : (data.status === 'available' ? 'Livre' : data.status),
      visitorId: data.visitor_id || data.visitorId || null,
      visitorName: data.visitor_name || data.visitorName || null,
      espacoId: data.espaco_id || data.espacoId || null,
    };

    try {
      const locker = await prisma.locker.create({ data: mappedData });
      return locker;
    } catch (error: any) {
      console.error('Erro ao criar armário:', error);
      if (error.code === 'P2002') {
        return reply.status(400).send({ error: 'Armário já existe neste espaço' });
      }
      return reply.status(500).send({ error: 'Erro ao criar armário' });
    }
  });

  // Atualizar
  app.put('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { id } = request.params;
    const data = request.body as any;

    // Se estiver liberando o armário (status = Livre), permitir
    // Se estiver ocupando, verificar limite
    const visitorId = data.visitor_id || data.visitorId;
    if (visitorId && data.espacoId && data.status === 'Ocupado') {
      const existingLocker = await prisma.locker.findFirst({
        where: {
          visitorId: visitorId,
          espacoId: data.espacoId,
          status: 'Ocupado',
          id: { not: id },
        },
      });

      if (existingLocker) {
        return reply.status(400).send({
          error: 'Visitante já possui armário ocupado neste espaço',
          detalhes: {
            armarioExistente: existingLocker.number,
            visitorId: visitorId,
          }
        });
      }
    }

    const mappedData: any = {};
    if (data.number !== undefined) mappedData.number = data.number;
    if (data.status !== undefined) mappedData.status = data.status;
    if (data.visitor_id !== undefined || data.visitorId !== undefined) mappedData.visitorId = data.visitor_id || data.visitorId;
    if (data.visitor_name !== undefined || data.visitorName !== undefined) mappedData.visitorName = data.visitor_name || data.visitorName;
    if (data.espaco_id !== undefined || data.espacoId !== undefined) mappedData.espacoId = data.espaco_id || data.espacoId;

    try {
      const locker = await prisma.locker.update({ where: { id }, data: mappedData });
      return locker;
    } catch (error: any) {
      console.error('Erro ao atualizar armário:', error);
      return reply.status(400).send({ error: error.message || 'Erro ao atualizar armário' });
    }
  });

  // Deletar
  app.delete('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    await prisma.locker.delete({ where: { id } });
    return { success: true };
  });

  // Alocar armário
  app.post('/alocar', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { numero, visitorId, espacoId } = request.body as any;

    // Verificar limite de armários por visitante (1 por vez por espaço)
    if (visitorId && espacoId) {
      const existingLocker = await prisma.locker.findFirst({
        where: {
          visitorId: visitorId,
          espacoId: espacoId,
          status: 'Ocupado',
        },
      });

      if (existingLocker) {
        return reply.status(400).send({
          error: 'Visitante já possui armário ocupado neste espaço',
          detalhes: {
            armarioExistente: existingLocker.number,
            visitorId: visitorId,
          }
        });
      }
    }

    try {
      const locker = await prisma.locker.create({
        data: {
          number: parseInt(numero),
          status: 'Ocupado',
          espacoId,
          visitorId,
        }
      });
      return locker;
    } catch (error: any) {
      console.error('Erro ao alocar armário:', error);
      return reply.status(400).send({ error: error.message || 'Erro ao alocar armário' });
    }
  });

  // Desalocar armário
  app.post('/:id/desalocar', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    const locker = await prisma.locker.update({
      where: { id },
      data: { status: 'Livre', visitorId: null, visitorName: null }
    });
    return locker;
  });

  // Verificar armários ocupados por visitante
  app.get('/visitor/:visitorId', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { visitorId } = request.params;

    const lockers = await prisma.locker.findMany({
      where: {
        visitorId: visitorId,
        status: 'Ocupado',
      },
      include: {
        espaco: true,
      },
    });

    return lockers;
  });
}