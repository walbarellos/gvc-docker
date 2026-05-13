import type { FastifyInstance } from 'fastify';
import { PrismaClient, VisitStatus } from '@prisma/client';

const prisma = new PrismaClient();

const statusMap: Record<string, VisitStatus | VisitStatus[]> = {
  'Ativo': 'ativo' as VisitStatus,
  'ativo': 'ativo' as VisitStatus,
  'active': 'ativo' as VisitStatus,
  'Excedido': 'ativo' as VisitStatus,
  'excedido': 'ativo' as VisitStatus,
  'Concluido': 'finalizado' as VisitStatus,
  'concluido': 'finalizado' as VisitStatus,
  'Finalizado': 'finalizado' as VisitStatus,
  'finalizado': 'finalizado' as VisitStatus,
  'Cancelado': 'cancelado' as VisitStatus,
  'cancelado': 'cancelado' as VisitStatus,
  'Inativo': 'cancelado' as VisitStatus,
  'inativo': 'cancelado' as VisitStatus,
};

function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function mapVisitFields(data: any): any {
  if (!data) return data;
  const mapped: any = {};
  
  if (data.visitorId !== undefined) mapped.visitorId = data.visitorId || null;
  if (data.visitor_id !== undefined) mapped.visitorId = data.visitor_id || null;
  if (data.espacoId !== undefined) mapped.espacoId = data.espacoId || null;
  if (data.espaco_id !== undefined) mapped.espacoId = data.espaco_id || null;
  if (data.nome !== undefined) mapped.nome = data.nome || '';
  if (data.perfil !== undefined) mapped.perfil = data.perfil || null;
  if (data.local !== undefined) mapped.local = data.local || null;
  if (data.status !== undefined) mapped.status = data.status || null;
  if (data.armario !== undefined) mapped.armario = data.armario || null;
  
  const checkin = data.checkin || data.checkIn;
  if (checkin) {
    const parsed = parseDate(checkin);
    if (parsed) mapped.checkin = parsed;
  }
  
  const checkout = data.checkout || data.checkOut;
  if (checkout) {
    const parsed = parseDate(checkout);
    if (parsed) mapped.checkout = parsed;
  }
  
  return mapped;
}

export async function visitRoutes(app: FastifyInstance) {
  // Listar todas as visitas (com filtros)
  app.get('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const { espaco_id, status, limit, order, checkin, checkin_gte, checkin_lte, checkin_lt, checkin_gt } = request.query as any;
    
    const where: any = {};
    if (espaco_id) where.espacoId = espaco_id;
    
    // Handle multiple status values (e.g., status=Ativo,active)
    if (status) {
      if (status.includes(',')) {
        const statuses = status.split(',')
          .map((s: string) => statusMap[s.trim()] as VisitStatus)
        if (statuses.length > 0) {
          where.status = { in: statuses };
        }
      } else {
        const mapped = statusMap[status] as VisitStatus;
        if (mapped) {
          where.status = mapped;
        }
      }
    }
    
    // Handle checkin filters (PostgREST format: checkin=gte.2026-05-09 or checkin_gte=2026-05-09)
    const checkinConditions: any = {};
    
    // PostgREST format: checkin=gte.2026-05-09
    if (checkin) {
      if (checkin.startsWith('lt.')) {
        checkinConditions.lt = new Date(checkin.substring(3));
      } else if (checkin.startsWith('gt.')) {
        checkinConditions.gt = new Date(checkin.substring(3));
      } else if (checkin.startsWith('lte.')) {
        checkinConditions.lte = new Date(checkin.substring(4));
      } else if (checkin.startsWith('gte.')) {
        checkinConditions.gte = new Date(checkin.substring(4));
      } else {
        const parsed = parseDate(checkin);
        if (parsed) checkinConditions.gte = parsed;
      }
    }
    
    // Direct query params: checkin_gte, checkin_lte, etc.
    if (checkin_gte) {
      const parsed = parseDate(checkin_gte);
      if (parsed) checkinConditions.gte = parsed;
    }
    if (checkin_lte) {
      const parsed = parseDate(checkin_lte);
      if (parsed) checkinConditions.lte = parsed;
    }
    if (checkin_lt) {
      const parsed = parseDate(checkin_lt);
      if (parsed) checkinConditions.lt = parsed;
    }
    if (checkin_gt) {
      const parsed = parseDate(checkin_gt);
      if (parsed) checkinConditions.gt = parsed;
    }
    
    if (Object.keys(checkinConditions).length > 0) {
      where.checkin = checkinConditions;
    }
    
    return prisma.visit.findMany({
      where,
      orderBy: order ? { checkin: order === 'asc' ? 'asc' : 'desc' } : { checkin: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      include: { visitor: true }
    });
  });

  // Buscar por ID
  app.get('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    const visit = await prisma.visit.findUnique({ 
      where: { id }, 
      include: { visitor: true } 
    });
    if (!visit) return { error: 'Visita não encontrada' };
    return visit;
  });

  // Atualizar visita (para Telecentro)
  app.put('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { id } = request.params;
    const data = mapVisitFields(request.body);
    
    try {
      const visit = await prisma.visit.update({
        where: { id },
        data
      });
      return visit;
    } catch (error) {
      return reply.status(400).send({ error: 'Erro ao atualizar visita' });
    }
  });

  // Contar visitas
  app.get('/count', { preHandler: [app.authenticate] }, async (request: any) => {
    const { espaco_id, date } = request.query as any;
    
    const where: any = {};
    if (espaco_id) where.espacoId = espaco_id;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.checkin = { gte: start, lte: end };
    }
    
    const count = await prisma.visit.count({ where });
    return [{ count }];
  });

  // Check-in
  app.post('/checkin', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { visitorId, espacoId, perfil } = request.body as any;
    
    if (request.user.role !== 'admin' && request.user.espacoId && request.user.espacoId !== espacoId) {
      return reply.status(403).send({ error: 'Espaço não autorizado para este usuário' });
    }
    
    const existing = await prisma.visit.findFirst({
      where: {
        visitorId,
        espacoId,
        status: 'ativo',
        checkin: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (existing) {
      return reply.status(400).send({ error: 'Visitante já possui check-in ativo nos últimos 60 minutos' });
    }

    const visitor = await prisma.visitor.findUnique({ where: { id: visitorId } });
    if (!visitor) {
      return reply.status(404).send({ error: 'Visitante não encontrado' });
    }

    const visit = await prisma.visit.create({
      data: { visitorId, espacoId, nome: visitor.fullName, perfil: perfil || 'general', status: 'ativo' },
    });
    return visit;
  });

  // Check-out
  app.post('/checkout/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (!request.body || Object.keys(request.body).length === 0) {
      request.body = {};
    }
    const { id } = request.params;
    const visit = await prisma.visit.update({
      where: { id },
      data: { checkout: new Date(), status: 'finalizado' },
    });
    return visit;
  });

  // Visitas ativas do espaço
  app.get('/active', { preHandler: [app.authenticate] }, async (request: any) => {
    const visits = await prisma.visit.findMany({
      where: { espacoId: request.user.espacoId, status: 'ativo' },
    });
    return visits;
  });

  // Visitas de hoje
  app.get('/today', { preHandler: [app.authenticate] }, async (request: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const visits = await prisma.visit.findMany({
      where: { checkin: { gte: today } },
      include: { visitor: true },
    });
    return visits;
  });

  // Excluir visita (Undo Check-in)
  app.delete('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { id } = request.params;
    await prisma.visit.delete({ where: { id } });
    return { success: true };
  });
}