import type { FastifyInstance } from 'fastify';
import { AgendamentoStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

const agendamentoStatusMap: Record<string, AgendamentoStatus> = {
  'Pendente': 'pendente',
  'pendente': 'pendente',
  'Aprovado': 'aprovado',
  'aprovado': 'aprovado',
  'Rejeitado': 'rejeitado',
  'rejeitado': 'rejeitado',
  'Cancelado': 'cancelado',
  'cancelado': 'cancelado',
};

function mapAgendamentoFields(data: any): any {
  if (!data) return data;
  const mapped: any = {};
  
  if (data.espacoId !== undefined) mapped.espacoId = data.espacoId || null;
  if (data.espaco_id !== undefined) mapped.espacoId = data.espaco_id || null;
  
  if (data.solicitante_nome !== undefined) mapped.solicitanteNome = data.solicitante_nome || '';
  if (data.solicitanteNome !== undefined) mapped.solicitanteNome = data.solicitanteNome || '';
  
  if (data.solicitante_email !== undefined) mapped.solicitanteEmail = data.solicitante_email || '';
  if (data.solicitanteEmail !== undefined) mapped.solicitanteEmail = data.solicitanteEmail || '';
  
  if (data.solicitante_telefone !== undefined) mapped.solicitanteTelefone = data.solicitante_telefone || '';
  if (data.solicitanteTelefone !== undefined) mapped.solicitanteTelefone = data.solicitanteTelefone || '';
  
  if (data.solicitante_documento !== undefined) mapped.solicitanteDocumento = data.solicitante_documento || null;
  if (data.solicitanteDocumento !== undefined) mapped.solicitanteDocumento = data.solicitanteDocumento || null;
  
  if (data.tipo_solicitante !== undefined) mapped.tipoSolicitante = data.tipo_solicitante || '';
  if (data.tipoSolicitante !== undefined) mapped.tipoSolicitante = data.tipoSolicitante || '';
  
  if (data.tipo_espaco !== undefined) mapped.tipoEspaco = data.tipo_espaco || '';
  if (data.tipoEspaco !== undefined) mapped.tipoEspaco = data.tipoEspaco || '';
  
  if (data.espaco_solicitado !== undefined) mapped.espacoSolicitado = data.espaco_solicitado || '';
  if (data.espacoSolicitado !== undefined) mapped.espacoSolicitado = data.espacoSolicitado || '';
  
  const data_pretendida = data.data_pretendida || data.dataPretendida;
  if (data_pretendida) {
    const parsed = parseDate(data_pretendida);
    if (parsed) mapped.dataPretendida = parsed;
  }
  
  const horario_inicio = data.horario_inicio || data.horarioInicio;
  if (horario_inicio) {
    const parsed = parseDate(horario_inicio);
    if (parsed) mapped.horarioInicio = parsed;
  }
  
  const horario_fim = data.horario_fim || data.horarioFim;
  if (horario_fim) {
    const parsed = parseDate(horario_fim);
    if (parsed) mapped.horarioFim = parsed;
  }
  
  if (data.numero_participantes !== undefined) mapped.numeroParticipantes = parseInt(data.numero_participantes) || 0;
  if (data.numeroParticipantes !== undefined) mapped.numeroParticipantes = parseInt(data.numeroParticipantes) || 0;
  
  if (data.descricao_evento !== undefined) mapped.descricaoEvento = data.descricao_evento || '';
  if (data.descricaoEvento !== undefined) mapped.descricaoEvento = data.descricaoEvento || '';
  
  if (data.natureza_evento !== undefined) mapped.naturezaEvento = data.natureza_evento || '';
  if (data.naturezaEvento !== undefined) mapped.naturezaEvento = data.naturezaEvento || '';
  
  if (data.gratuito !== undefined) mapped.gratuito = data.gratuito;
  if (data.gratuito !== undefined && typeof data.gratuito === 'string') {
    mapped.gratuito = data.gratuito === 'true';
  }
  
  if (data.valor_ingresso !== undefined) mapped.valorIngresso = parseFloat(data.valor_ingresso) || null;
  if (data.valorIngresso !== undefined) mapped.valorIngresso = parseFloat(data.valorIngresso) || null;
  
  if (data.necessita_equipamentos !== undefined) mapped.necessitaEquipamentos = data.necessita_equipamentos || null;
  if (data.necessitaEquipamentos !== undefined) mapped.necessitaEquipamentos = data.necessitaEquipamentos || null;
  
  if (data.observacoes !== undefined) mapped.observacoes = data.observacoes || null;
  
  if (data.termo_aceito !== undefined) mapped.termoAceito = data.termo_aceito;
  if (data.termoAceito !== undefined) mapped.termoAceito = data.termoAceito;
  
  const termo_aceito_em = data.termo_aceito_em || data.termoAceitoEm;
  if (termo_aceito_em) {
    const parsed = parseDate(termo_aceito_em);
    if (parsed) mapped.termoAceitoEm = parsed;
  }
  
  if (data.responsabhilidade_evento !== undefined) mapped.responsabilidadeEvento = data.responsabhilidade_evento;
  if (data.responsabhilidadeEvento !== undefined) mapped.responsabilidadeEvento = data.responsabhilidadeEvento;
  
  if (data.danos_patrimonio !== undefined) mapped.danosPatrimonio = data.danos_patrimonio;
  if (data.danosPatrimonio !== undefined) mapped.danosPatrimonio = data.danosPatrimonio;
  
  if (data.respeito_lotacao !== undefined) mapped.respeitoLotacao = data.respeito_lotacao;
  if (data.respeitoLotacao !== undefined) mapped.respeitoLotacao = data.respeitoLotacao;
  
  if (data.autorizo_divulgacao !== undefined) mapped.autorizoDivulgacao = data.autorizo_divulgacao;
  if (data.autorizoDivulgacao !== undefined) mapped.autorizoDivulgacao = data.autorizoDivulgacao;
  
  if (data.documento_anexo_url !== undefined) mapped.documentoAnexoUrl = data.documento_anexo_url || null;
  if (data.documentoAnexoUrl !== undefined) mapped.documentoAnexoUrl = data.documentoAnexoUrl || null;
  
  if (data.status !== undefined) mapped.status = data.status || 'pendente';
  
  return mapped;
}

export async function agendamentoRoutes(app: FastifyInstance) {
  // Listar (com filtros)
  app.get('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const { espaco_id, status, data_inicio, data_fim, limit } = request.query as any;
    
    const where: any = {};
    if (espaco_id) where.espacoId = espaco_id;
    
    // Handle multiple status values (e.g., status=pendente,aprovado)
    if (status) {
      if (status.includes(',')) {
        const statuses = status.split(',').map((s: string) => agendamentoStatusMap[s.trim()] || s.trim());
        where.status = { in: statuses };
      } else {
        where.status = agendamentoStatusMap[status] || status;
      }
    }
    
    if (data_inicio) where.dataPretendida = { gte: new Date(data_inicio) };
    if (data_fim) where.dataPretendida = { ...where.dataPretendida, lte: new Date(data_fim) };

    if (request.user.perfil === 'cidadao') {
      where.solicitanteEmail = request.user.email;
    } else if (request.user.perfil !== 'administrador') {
      where.espacoId = request.user.espacoId;
    }

    return prisma.agendamento.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      include: { espaco: true }
    });
  });

  // Buscar por ID
  app.get('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    return prisma.agendamento.findUnique({ 
      where: { id },
      include: { espaco: true }
    });
  });

  // Criar
  app.post('/', async (request: any) => {
    const data = mapAgendamentoFields(request.body);
    data.termoAceitoEm = data.termoAceito ? new Date() : null;
    return prisma.agendamento.create({ data });
  });

  // Atualizar
  app.put('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    const data = mapAgendamentoFields(request.body);
    return prisma.agendamento.update({ where: { id }, data });
  });

  // Deletar
  app.delete('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (!['coordenador', 'administrador'].includes(request.user.perfil)) {
      return reply.status(403).send({ error: 'Apenas coordenador pode excluir' });
    }
    const { id } = request.params;
    await prisma.agendamento.delete({ where: { id } });
    return { success: true };
  });

  // Responder agendamento
  app.put('/:id/resposta', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { id } = request.params;
    const { status, respostaCoordenador } = request.body as any;

    if (request.user.perfil === 'cidadao') {
      return reply.status(403).send({ error: 'Perfil sem permissão' });
    }

    const agendamento = await prisma.agendamento.update({
      where: { id },
      data: {
        status,
        respostaCoordenador,
        coordenadorId: request.user.id,
        respondidoEm: new Date()
      },
    });

    return agendamento;
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
      data: {
        status: 'aprovado',
        respostaCoordenador: resposta,
        coordenadorId: request.user.id,
        respondidoEm: new Date()
      },
    });
});

// Dashboard stats
  app.get('/dashboard', { preHandler: [app.authenticate] }, async (request: any) => {
    const { espaco_id } = request.query as any;
    
    const where: any = {};
    if (espaco_id) {
      where.espacoId = espaco_id;
    } else if (request.user.perfil !== 'administrador') {
      where.espacoId = request.user.espacoId;
    }
    
    const [total, pendentes, aprovados, rejeitados, cancelados] = await Promise.all([
      prisma.agendamento.count({ where }),
      prisma.agendamento.count({ where: { ...where, status: 'pendente' } }),
      prisma.agendamento.count({ where: { ...where, status: 'aprovado' } }),
      prisma.agendamento.count({ where: { ...where, status: 'rejeitado' } }),
      prisma.agendamento.count({ where: { ...where, status: 'cancelado' } }),
    ]);
    
    return { total, pendentes, aprovados, rejeitados, cancelados };
  });

  // Buscar rascunho
  app.get('/rascunho/:sessionId', async (request: any) => {
    const { sessionId } = request.params;
    return prisma.agendamentoRascunho.findUnique({ 
      where: { sessionId } 
    });
  });

  // Salvar rascunho
  app.post('/rascunho', async (request: any) => {
    const { sessionId, data } = request.body as any;
    
    return prisma.agendamentoRascunho.upsert({
      where: { sessionId },
      update: { ...data, updatedAt: new Date() },
      create: { sessionId, ...data }
    });
  });

  // Deletar rascunho
  app.delete('/rascunho/:sessionId', async (request: any) => {
    const { sessionId } = request.params;
    await prisma.agendamentoRascunho.delete({ 
      where: { sessionId } 
    });
    return { success: true };
  });

  // Verificar conflitos
  app.get('/conflitos', { preHandler: [app.authenticate] }, async (request: any) => {
    const { espaco_id, data, inicio, fim, exclude_id } = request.query as any;
    
    const where: any = {
      espacoId: espaco_id,
      dataPretendida: new Date(data),
      status: { in: ['pendente', 'aprovado'] }
    };
    
    if (exclude_id) {
      where.id = { not: exclude_id };
    }
    
    const agendamentos = await prisma.agendamento.findMany({
      where,
      select: { horarioInicio: true, horarioFim: true }
    });
    
    return agendamentos.filter((a: any) => {
      const aStart = new Date(`2000-01-01T${inicio}`);
      const aEnd = new Date(`2000-01-01T${fim}`);
      const bStart = new Date(`2000-01-01T${a.horarioInicio}`);
      const bEnd = new Date(`2000-01-01T${a.horarioFim}`);
      
      return aStart < bEnd && aEnd > bStart;
    });
  });

  // Horários disponíveis
  app.get('/disponiveis', { preHandler: [app.authenticate] }, async (request: any) => {
    const { espaco_id, inicio, fim } = request.query as any;
    
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        espacoId: espaco_id,
        dataPretendida: { gte: new Date(inicio), lte: new Date(fim) },
        status: { in: ['pendente', 'aprovado'] }
      },
      select: { dataPretendida: true, horarioInicio: true, horarioFim: true }
    });
    
    return agendamentos;
  });
}