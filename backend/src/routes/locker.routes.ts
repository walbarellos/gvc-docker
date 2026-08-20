import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { createLockerBodySchema, updateLockerBodySchema, alocarLockerBodySchema, validateBody } from '../schemas/index.js';

type LockerStatus = 'Livre' | 'Ocupado' | 'Manutencao';

const lockerStatusMap: Record<string, LockerStatus> = {
  'Livre': 'Livre',
  'Ocupado': 'Ocupado',
  'Manutencao': 'Manutencao',
  'disponivel': 'Livre',
  'ocupado': 'Ocupado',
  'occupied': 'Ocupado',
  'available': 'Livre',
  'manutencao': 'Manutencao',
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
    const parsed = validateBody(createLockerBodySchema, request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error?.details });
    }
    const data = parsed.data!;

    // Verificar limite de armários por visitante (1 por vez por espaço)
    const visitorId = data.visitor_id || data.visitorId;
    if (visitorId) {
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

    const mappedData = {
      number: Number(data.number),
      status: lockerStatusMap[data.status ?? ''] || data.status || 'Livre',
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
    const parsed = validateBody(updateLockerBodySchema, request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error?.details });
    }
    const data = parsed.data!;

    // Se estiver liberando o armário (status = Livre), permitir
    // Se estiver ocupando, verificar limite
    const visitorId = data.visitor_id || data.visitorId;
    if (visitorId && (data.espacoId || data.espaco_id) && (data.status === 'Ocupado' || data.status === 'occupied' || data.status === 'ocupado')) {
      const existingLocker = await prisma.locker.findFirst({
        where: {
          visitorId: visitorId,
          espacoId: data.espacoId || data.espaco_id,
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
    if (data.number !== undefined) mappedData.number = Number(data.number);
    if (data.status !== undefined) mappedData.status = lockerStatusMap[data.status] || data.status;
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
    const parsed = validateBody(alocarLockerBodySchema, request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error?.details });
    }
    const body = parsed.data!;
    const { numero, visitorId, espacoId } = {
      numero: body.numero,
      visitorId: body.visitorId ?? body.visitor_id,
      espacoId: body.espacoId ?? body.espaco_id,
    };

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
          number: Number(numero),
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