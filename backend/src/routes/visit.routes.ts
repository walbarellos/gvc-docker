import type { FastifyInstance } from 'fastify';
import { VisitStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { Visitor, Gender } from '../domain/entities/Visitor.js';

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
    if (!request.body || Object.keys(request.body).length === 0) {
      request.body = {};
    }
    const { id } = request.params;
    const data = mapVisitFields(request.body);
    
    try {
      const existing = await prisma.visit.findUnique({ where: { id } });
      if (!existing) {
        return reply.status(404).send({ error: 'Visita não encontrada' });
      }
      
      const visit = await prisma.visit.update({
        where: { id },
        data
      });
      return visit;
    } catch (error: any) {
      console.error('Erro ao atualizar visita:', error);
      return reply.status(400).send({ error: error.message || 'Erro ao atualizar visita' });
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
    const { visitorId, espacoId, perfil, responsibleAccompanied } = request.body as any;
    
    if (request.user.role !== 'admin' && request.user.espacoId && request.user.espacoId !== espacoId) {
      return reply.status(403).send({ error: 'Espaço não autorizado para este usuário' });
    }
    
    const visitor = await prisma.visitor.findUnique({ where: { id: visitorId } });
    if (!visitor) {
      return reply.status(404).send({ error: 'Visitante não encontrado' });
    }

    // Validar regras de autorização parental via Entidade de Domínio
    const visitorEntity = new Visitor({
      ...visitor,
      gender: visitor.gender as Gender,
      parentalAuthorization: visitor.parentalAuthorization,
      authorizationDate: visitor.authorizationDate,
      responsibleName: visitor.responsibleName,
      authorizationDocType: visitor.authorizationDocType,
      authorizationPresented: visitor.authorizationPresented,
    } as any);

    const checkinValidation = visitorEntity.canCheckIn();
    if (!checkinValidation.allowed) {
      return reply.status(403).send({ error: checkinValidation.reason });
    }

    // Verificar se o visitante já tem visita ATIVA no mesmo espaço OU em outro espaço (últimos 60 minutos)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // Primeiro: verificar se já tem visita ativa NO MESMO espaço
    const existingInSameSpace = await prisma.visit.findFirst({
      where: {
        visitorId,
        espacoId,
        status: 'ativo',
      },
      include: {
        espaco: true
      }
    });
    
    if (existingInSameSpace) {
      const espacoNome = existingInSameSpace.espaco?.nome || 'desconhecido';
      const tempoLimite = existingInSameSpace.espaco?.tempo_limite_excedido || 60; // minutos
      const tempoDecorrido = Math.floor((Date.now() - existingInSameSpace.checkin.getTime()) / 60000);
      const tempoRestante = Math.max(0, tempoLimite - tempoDecorrido);
      
      return reply.status(400).send({ 
        error: `Visitante já está no espaço ${espacoNome} há ${tempoDecorrido} minutos. Tempo restante: ${tempoRestante} minutos.`,
        detalhes: {
          espacos: [{
            nome: espacoNome,
            checkin: existingInSameSpace.checkin,
            tempoDecorrido,
            tempoRestante,
            minutosParaEncerrar: tempoRestante
          }]
        }
      });
    }
    
    // Depois: verificar se já tem visita ativa EM OUTRO espaço (últimos 60 minutos)
    const existingInOtherSpace = await prisma.visit.findFirst({
      where: {
        visitorId,
        status: 'ativo',
        checkin: { gte: oneHourAgo },
      },
      include: {
        espaco: true
      }
    });

    if (existingInOtherSpace) {
      const espacoNome = existingInOtherSpace.espaco?.nome || 'desconhecido';
      const tempoLimite = existingInOtherSpace.espaco?.tempo_limite_excedido || 60; // minutos
      const tempoDecorrido = Math.floor((Date.now() - existingInOtherSpace.checkin.getTime()) / 60000);
      const tempoRestante = Math.max(0, tempoLimite - tempoDecorrido);
      
      return reply.status(400).send({ 
        error: `Visitante já está no espaço ${espacoNome} há ${tempoDecorrido} minutos. Tempo restante: ${tempoRestante} minutos.`,
        detalhes: {
          espacos: [{
            nome: espacoNome,
            checkin: existingInOtherSpace.checkin,
            tempoDecorrido,
            tempoRestante,
            minutosParaEncerrar: tempoRestante
          }]
        }
      });
    }

    // Verificar limite de check-ins por CPF no dia (baseado no perfil)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkinsHoje = await prisma.visit.count({
      where: {
        visitorId,
        checkin: { gte: today },
      },
    });

    // Limite baseado no perfil do visitante
    let limiteDiario = 2; // padrão para cidadãos
    if (perfil === 'funcionario' || perfil === 'monitor') {
      limiteDiario = 5;
    } else if (perfil === 'coordenador' || perfil === 'administrador') {
      limiteDiario = 10;
    }

    if (checkinsHoje >= limiteDiario) {
      return reply.status(400).send({ 
        error: `Limite de check-ins diários atingido para este perfil (${perfil}). Máximo: ${limiteDiario} por dia.`,
        detalhes: {
          checkinsHoje,
          limiteDiario,
          perfil
        }
      });
    }

    const visit = await prisma.visit.create({
      data: { 
        visitorId, 
        espacoId, 
        nome: visitor.fullName, 
        perfil: perfil || 'general', 
        status: 'ativo',
        responsibleAccompanied: responsibleAccompanied || false
      },
    });
    return visit;
  });

  // Check-out
  app.post('/checkout/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (!request.body || Object.keys(request.body).length === 0) {
      request.body = {};
    }
    const { id } = request.params;
    
    const existingVisit = await prisma.visit.findUnique({ where: { id } });
    if (!existingVisit) {
      return reply.status(404).send({ error: 'Visita não encontrada' });
    }
    
    if (existingVisit.status === 'finalizado') {
      return reply.status(400).send({ error: 'Checkout já realizado anteriormente' });
    }
    
    try {
      const visit = await prisma.visit.update({
        where: { id },
        data: { checkout: new Date(), status: 'finalizado' },
      });
      return visit;
    } catch (error: any) {
      console.error('Erro no checkout:', error);
      console.error('Existing visit status:', existingVisit?.status);
      return reply.status(400).send({ error: error.message || 'Erro ao realizar checkout', details: error.message });
    }
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

  // Verificar CPF - buscar check-ins ativos por CPF
  app.get('/cpf/:cpf/active', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { cpf } = request.params;
    
    const visitors = await prisma.visitor.findMany({
      where: { cpf: cpf.replace(/\D/g, '') },
    });

    if (visitors.length === 0) {
      return reply.status(404).send({ error: 'Nenhum visitante encontrado com este CPF' });
    }

    const visitorIds = visitors.map(v => v.id);
    
    const activeVisits = await prisma.visit.findMany({
      where: {
        visitorId: { in: visitorIds },
        status: 'ativo',
      },
      include: { 
        visitor: true,
        espaco: true,
      },
    });

    // Calcular tempo restante para cada visita
    const visitsWithTime = activeVisits.map(visit => {
      const tempoLimite = visit.espaco?.tempo_limite_excedido || 60;
      const tempoDecorrido = Math.floor((Date.now() - visit.checkin.getTime()) / 60000);
      const tempoRestante = Math.max(0, tempoLimite - tempoDecorrido);
      
      return {
        ...visit,
        tempoDecorrido,
        tempoRestante,
        minutosParaEncerrar: tempoRestante,
      };
    });

    return visitsWithTime;
  });

  // Excluir visita (Undo Check-in)
  app.delete('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { id } = request.params;
    
    const existingVisit = await prisma.visit.findUnique({ where: { id } });
    if (!existingVisit) {
      return reply.status(404).send({ error: 'Visita não encontrada' });
    }
    
    await prisma.visit.delete({ where: { id } });
    return { success: true };
  });
}