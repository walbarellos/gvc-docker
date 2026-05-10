import type { FastifyInstance } from 'fastify';
import { PrismaClient, AgendamentoStatus } from '@prisma/client';

const prisma = new PrismaClient();

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
  
  if (data.solicitante_nome !== undefined) mapped.solicitante_nome = data.solicitante_nome || '';
  if (data.solicitanteNome !== undefined) mapped.solicitante_nome = data.solicitanteNome || '';
  
  if (data.solicitante_email !== undefined) mapped.solicitante_email = data.solicitante_email || '';
  if (data.solicitanteEmail !== undefined) mapped.solicitante_email = data.solicitanteEmail || '';
  
  if (data.solicitante_telefone !== undefined) mapped.solicitante_telefone = data.solicitante_telefone || '';
  if (data.solicitanteTelefone !== undefined) mapped.solicitante_telefone = data.solicitanteTelefone || '';
  
  if (data.solicitante_documento !== undefined) mapped.solicitante_documento = data.solicitante_documento || null;
  if (data.solicitanteDocumento !== undefined) mapped.solicitante_documento = data.solicitanteDocumento || null;
  
  if (data.tipo_solicitante !== undefined) mapped.tipo_solicitante = data.tipo_solicitante || '';
  if (data.tipoSolicitante !== undefined) mapped.tipo_solicitante = data.tipoSolicitante || '';
  
  if (data.tipo_espaco !== undefined) mapped.tipo_espaco = data.tipo_espaco || '';
  if (data.tipoEspaco !== undefined) mapped.tipo_espaco = data.tipoEspaco || '';
  
  if (data.espaco_solicitado !== undefined) mapped.espaco_solicitado = data.espaco_solicitado || '';
  if (data.espacoSolicitado !== undefined) mapped.espaco_solicitado = data.espacoSolicitado || '';
  
  const data_pretendida = data.data_pretendida || data.dataPretendida;
  if (data_pretendida) {
    const parsed = parseDate(data_pretendida);
    if (parsed) mapped.data_pretendida = parsed;
  }
  
  const horario_inicio = data.horario_inicio || data.horarioInicio;
  if (horario_inicio) {
    const parsed = parseDate(horario_inicio);
    if (parsed) mapped.horario_inicio = parsed;
  }
  
  const horario_fim = data.horario_fim || data.horarioFim;
  if (horario_fim) {
    const parsed = parseDate(horario_fim);
    if (parsed) mapped.horario_fim = parsed;
  }
  
  if (data.numero_participantes !== undefined) mapped.numero_participantes = parseInt(data.numero_participantes) || 0;
  if (data.numeroParticipantes !== undefined) mapped.numero_participantes = parseInt(data.numeroParticipantes) || 0;
  
  if (data.descricao_evento !== undefined) mapped.descricao_evento = data.descricao_evento || '';
  if (data.descricaoEvento !== undefined) mapped.descricao_evento = data.descricaoEvento || '';
  
  if (data.natureza_evento !== undefined) mapped.natureza_evento = data.natureza_evento || '';
  if (data.naturezaEvento !== undefined) mapped.natureza_evento = data.naturezaEvento || '';
  
  if (data.gratuito !== undefined) mapped.gratuito = data.gratuito;
  if (data.gratuito !== undefined && typeof data.gratuito === 'string') {
    mapped.gratuito = data.gratuito === 'true';
  }
  
  if (data.valor_ingresso !== undefined) mapped.valor_ingresso = parseFloat(data.valor_ingresso) || null;
  if (data.valorIngresso !== undefined) mapped.valor_ingresso = parseFloat(data.valorIngresso) || null;
  
  if (data.necessita_equipamentos !== undefined) mapped.necessita_equipamentos = data.necessita_equipamentos || null;
  if (data.necessitaEquipamentos !== undefined) mapped.necessita_equipamentos = data.necessitaEquipamentos || null;
  
  if (data.observacoes !== undefined) mapped.observacoes = data.observacoes || null;
  
  if (data.termo_aceito !== undefined) mapped.termo_aceito = data.termo_aceito;
  if (data.termoAceito !== undefined) mapped.termo_aceito = data.termoAceito;
  
  const termo_aceito_em = data.termo_aceito_em || data.termoAceitoEm;
  if (termo_aceito_em) {
    const parsed = parseDate(termo_aceito_em);
    if (parsed) mapped.termo_aceito_em = parsed;
  }
  
  if (data.responsabhilidade_evento !== undefined) mapped.responsabhilidade_evento = data.responsabhilidade_evento;
  if (data.responsabhilidadeEvento !== undefined) mapped.responsabhilidade_evento = data.responsabhilidadeEvento;
  
  if (data.danos_patrimonio !== undefined) mapped.danos_patrimonio = data.danos_patrimonio;
  if (data.danosPatrimonio !== undefined) mapped.danos_patrimonio = data.danosPatrimonio;
  
  if (data.respeito_lotacao !== undefined) mapped.respeito_lotacao = data.respeito_lotacao;
  if (data.respeitoLotacao !== undefined) mapped.respeito_lotacao = data.respeitoLotacao;
  
  if (data.autorizo_divulgacao !== undefined) mapped.autorizo_divulgacao = data.autorizo_divulgacao;
  if (data.autorizoDivulgacao !== undefined) mapped.autorizo_divulgacao = data.autorizoDivulgacao;
  
  if (data.documento_anexo_url !== undefined) mapped.documento_anexo_url = data.documento_anexo_url || null;
  if (data.documentoAnexoUrl !== undefined) mapped.documento_anexo_url = data.documentoAnexoUrl || null;
  
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
    
    if (data_inicio) where.data_pretendida = { gte: new Date(data_inicio) };
    if (data_fim) where.data_pretendida = { ...where.data_pretendida, lte: new Date(data_fim) };

    if (request.user.perfil === 'cidadao') {
      where.solicitanteEmail = request.user.email;
    } else if (request.user.perfil !== 'administrador') {
      where.espacoId = request.user.espacoId;
    }

    return prisma.agendamento.findMany({ 
      where, 
      orderBy: { created_at: 'desc' },
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
    data.termo_aceito_em = data.termo_aceito ? new Date() : null;
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

  // Atualizar status
  app.patch('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { id } = request.params;
    const { status, resposta_coordenador } = request.body as any;
    
    if (status && !['coordenador', 'administrador'].includes(request.user.perfil)) {
      return reply.status(403).send({ error: 'Apenas coordenador pode alterar status' });
    }
    
    const data: any = {};
    if (status) data.status = status;
    if (resposta_coordenador) {
      data.resposta_coordenador = resposta_coordenador;
      data.coordenador_id = request.user.id;
      data.respondido_em = new Date();
    }
    
    return prisma.agendamento.update({ where: { id }, data });
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
      data: { status: 'aprovado', resposta_coordenador: resposta, coordenador_id: request.user.id, respondido_em: new Date() },
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
}