import type { FastifyInstance } from 'fastify';
import { AgendamentoStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import {
  agendamentoStatusBodySchema,
  aprovacaoBodySchema,
  rascunhoBodySchema,
  updateAgendamentoSchema,
  validateBody,
} from '../schemas/index.js';

const emptyToNull = (v: string | null | undefined) => (v === '' ? null : v);

// Whitelist do agendamento público (snake_case = payload real do frontend)
// .strict() rejeita campos fora da lista — NUNCA aceitar status, coordenadorId etc.
const publicAgendamentoSchema = z
  .object({
    espaco_id: z.string().uuid('ID de espaço inválido'),
    solicitante_nome: z.string().min(3).max(200),
    solicitante_email: z.string().email().max(200),
    solicitante_telefone: z.string().min(10).max(20),
    solicitante_documento: z
      .string()
      .max(20)
      .optional()
      .nullable()
      .transform(emptyToNull),
    tipo_solicitante: z.enum([
      'pessoa_fisica',
      'pessoa_juridica',
      'escola',
      'universidade',
      'governo',
    ]),
    razao_social: z.string().max(200).optional().nullable().transform(emptyToNull),
    nome_instituicao: z.string().max(200).optional().nullable().transform(emptyToNull),
    secretaria_governo: z.string().max(200).optional().nullable().transform(emptyToNull),
    unidade_governo: z.string().max(200).optional().nullable().transform(emptyToNull),
    tipo_espaco: z.enum([
      'auditorio',
      'sala_estudos',
      'teatro',
      'filmoteca',
      'espaco_aberto',
      'visita_guiada',
    ]),
    espaco_solicitado: z.string().min(3).max(200),
    data_pretendida: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    horario_inicio: z.string().regex(/^\d{2}:\d{2}$/),
    horario_fim: z.string().regex(/^\d{2}:\d{2}$/),
    numero_participantes: z.coerce.number().int().min(1).max(5000),
    descricao_evento: z.string().min(10).max(5000),
    natureza_evento: z.string().min(3).max(200),
    gratuito: z.boolean().default(true),
    valor_ingresso: z.coerce.number().positive().optional().nullable(),
    necessita_equipamentos: z.string().max(1000).optional().nullable().transform(emptyToNull),
    observacoes: z.string().max(2000).optional().nullable().transform(emptyToNull),
    termo_aceito: z.boolean().default(false),
    termo_aceito_em: z.string().optional().nullable(),
    responsabhilidade_evento: z.boolean().default(false),
    responsabilidade_evento: z.boolean().default(false),
    danos_patrimonio: z.boolean().default(false),
    respeito_lotacao: z.boolean().default(false),
    autorizo_divulgacao: z.boolean().default(false),
  })
  .strict();

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
  if (data.responsabilidade_evento !== undefined) mapped.responsabilidadeEvento = data.responsabilidade_evento;
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
      take: limit ? Math.min(Math.max(parseInt(limit), 1), 100) : 100,
      include: { espaco: true }
    });
  });

  // Buscar por ID — escopo por perfil (mitigação de IDOR)
  app.get('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { id } = request.params;
    const agendamento = await prisma.agendamento.findUnique({ 
      where: { id },
      include: { espaco: true }
    });

    if (!agendamento) {
      return reply.status(404).send({ error: 'Agendamento não encontrado' });
    }

    if (request.user.perfil === 'cidadao' && agendamento.solicitanteEmail !== request.user.email) {
      return reply.status(403).send({ error: 'Sem permissão para este agendamento' });
    }
    if (
      request.user.perfil !== 'cidadao' &&
      request.user.perfil !== 'administrador' &&
      agendamento.espacoId !== request.user.espacoId
    ) {
      return reply.status(403).send({ error: 'Sem permissão para este agendamento' });
    }

    return agendamento;
  });

  // Criar (público, sem auth — whitelist Zod, status FORÇADO a pendente)
  app.post('/', async (request: any, reply: any) => {
    const parsed = publicAgendamentoSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten(),
      });
    }

    const data = parsed.data;

    // Validar que o espaço existe e aceita agendamento
    const espaco = await prisma.espaco.findFirst({
      where: { id: data.espaco_id, ativo: true, perfilAgendamento: true },
      select: { id: true, capacidadeAgendamento: true },
    });
    if (!espaco) {
      return reply.status(400).send({ error: 'Espaço inválido ou indisponível para agendamento' });
    }

    if (
      espaco.capacidadeAgendamento &&
      data.numero_participantes > espaco.capacidadeAgendamento
    ) {
      return reply.status(400).send({
        error: `Número de participantes excede a capacidade (${espaco.capacidadeAgendamento})`,
      });
    }

    const dataBase = data.data_pretendida; // YYYY-MM-DD
    const horarioInicio = new Date(`${dataBase}T${data.horario_inicio}:00`);
    const horarioFim = new Date(`${dataBase}T${data.horario_fim}:00`);

    if (horarioFim <= horarioInicio) {
      return reply.status(400).send({ error: 'Horário de fim deve ser posterior ao de início' });
    }

    // Verificar conflito (status pendente/aprovado)
    const conflicts = await prisma.agendamento.findMany({
      where: {
        espacoId: data.espaco_id,
        dataPretendida: new Date(dataBase),
        status: { in: ['pendente', 'aprovado'] },
        OR: [
          {
            AND: [
              { horarioInicio: { lte: horarioInicio } },
              { horarioFim: { gt: horarioInicio } },
            ],
          },
          {
            AND: [
              { horarioInicio: { lt: horarioFim } },
              { horarioFim: { gte: horarioFim } },
            ],
          },
          {
            AND: [
              { horarioInicio: { gte: horarioInicio } },
              { horarioFim: { lte: horarioFim } },
            ],
          },
        ],
      },
      select: { id: true },
    });

    if (conflicts.length > 0) {
      return reply.status(409).send({
        error: 'Conflito de horário. Espaço indisponível neste horário.',
      });
    }

    // Whitelist explícita — status SEMPRE pendente; nunca aceitar campos privilegiados
    const agendamento = await prisma.agendamento.create({
      data: {
        espacoId: data.espaco_id,
        solicitanteNome: data.solicitante_nome,
        solicitanteEmail: data.solicitante_email,
        solicitanteTelefone: data.solicitante_telefone,
        solicitanteDocumento: data.solicitante_documento ?? null,
        tipoSolicitante: data.tipo_solicitante,
        razaoSocial: data.razao_social ?? null,
        nomeInstituicao: data.nome_instituicao ?? null,
        secretariaGoverno: data.secretaria_governo ?? null,
        unidadeGoverno: data.unidade_governo ?? null,
        tipoEspaco: data.tipo_espaco,
        espacoSolicitado: data.espaco_solicitado,
        dataPretendida: new Date(dataBase),
        horarioInicio,
        horarioFim,
        numeroParticipantes: data.numero_participantes,
        descricaoEvento: data.descricao_evento,
        naturezaEvento: data.natureza_evento,
        gratuito: data.gratuito,
        valorIngresso: data.valor_ingresso ?? null,
        necessitaEquipamentos: data.necessita_equipamentos ?? null,
        observacoes: data.observacoes ?? null,
        termoAceito: data.termo_aceito,
        termoAceitoEm: data.termo_aceito ? new Date() : null,
        responsabilidadeEvento: data.responsabilidade_evento ?? data.responsabhilidade_evento ?? false,
        danosPatrimonio: data.danos_patrimonio,
        respeitoLotacao: data.respeito_lotacao,
        autorizoDivulgacao: data.autorizo_divulgacao,
        status: 'pendente', // FORÇADO no servidor
      },
      select: {
        id: true,
        status: true,
        dataPretendida: true,
        horarioInicio: true,
        horarioFim: true,
        espacoSolicitado: true,
        solicitanteNome: true,
        createdAt: true,
      },
    });

    return reply.status(201).send(agendamento);
  });

  // Atualizar — restrito a coordenador/admin; sem campos privilegiados do client
  app.put('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (!['coordenador', 'administrador'].includes(request.user.perfil)) {
      return reply.status(403).send({ error: 'Apenas coordenador pode editar agendamentos' });
    }

    const { id } = request.params;
    const existing = await prisma.agendamento.findUnique({
      where: { id },
      select: { espacoId: true },
    });
    if (!existing) {
      return reply.status(404).send({ error: 'Agendamento não encontrado' });
    }
    if (request.user.perfil !== 'administrador' && existing.espacoId !== request.user.espacoId) {
      return reply.status(403).send({ error: 'Sem permissão para este agendamento' });
    }

    const parsed = updateAgendamentoSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error.issues });
    }

    const data = mapAgendamentoFields(request.body);
    // Nunca aceitar campos privilegiados do client — status só via /:id/resposta e /:id/approve
    delete data.status;
    delete data.coordenadorId;
    delete data.respostaCoordenador;
    delete data.respondidoEm;
    delete data.documentoAnexoUrl;
    delete data.assinaturaId;
    delete data.ipConfirmacao;
    delete data.userAgent;

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

    if (request.user.perfil === 'cidadao') {
      return reply.status(403).send({ error: 'Perfil sem permissão' });
    }

    const parsed = validateBody(agendamentoStatusBodySchema, request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error?.details });
    }
    const body = parsed.data!;

    const agendamento = await prisma.agendamento.update({
      where: { id },
      data: {
        status: body.status,
        respostaCoordenador: body.respostaCoordenador ?? body.resposta_coordenador ?? null,
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
    const parsed = validateBody(aprovacaoBodySchema, request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error?.details });
    }
    const { resposta } = parsed.data!;
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

const rascunhoSnakeToCamel: Record<string, string> = {
  solicitante_nome: 'solicitanteNome',
  solicitante_email: 'solicitanteEmail',
  solicitante_telefone: 'solicitanteTelefone',
  solicitante_documento: 'solicitanteDocumento',
  tipo_solicitante: 'tipoSolicitante',
  razao_social: 'razaoSocial',
  nome_instituicao: 'nomeInstituicao',
  secretaria_governo: 'secretariaGoverno',
  unidade_governo: 'unidadeGoverno',
  espaco_id: 'espacoId',
  tipo_espaco: 'tipoEspaco',
  espaco_solicitado: 'espacoSolicitado',
  data_pretendida: 'dataPretendida',
  horario_inicio: 'horarioInicio',
  horario_fim: 'horarioFim',
  numero_participantes: 'numeroParticipantes',
  descricao_evento: 'descricaoEvento',
  natureza_evento: 'naturezaEvento',
  gratuito: 'gratuito',
  valor_ingresso: 'valorIngresso',
  necessita_equipamentos: 'necessitaEquipamentos',
  observacoes: 'observacoes',
  termo_aceito: 'termoAceito',
  responsabilidade_evento: 'responsabilidadeEvento',
  danos_patrimonio: 'danosPatrimonio',
  respeito_lotacao: 'respeitoLotacao',
  autorizo_divulgacao: 'autorizoDivulgacao',
  termo_compromisso_assinado: 'termoCompromissoAssinado',
  termo_compromisso_data: 'termoCompromissoData',
  termo_compromisso_ip: 'termoCompromissoIp',
  termo_compromisso_arquivo: 'termoCompromissoArquivo',
  current_step: 'currentStep',
  session_id: 'sessionId',
};
const rascunhoCamelToSnake: Record<string, string> = Object.fromEntries(
  Object.entries(rascunhoSnakeToCamel).map(([k, v]) => [v, k])
);
const toRascunhoCamel = (raw: any): any => {
  const out: any = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = rascunhoSnakeToCamel[k] || k;
    if (key === 'id' || key === 'sessionId' || key === 'createdAt' || key === 'updatedAt') continue;
    if (v === undefined) continue;
    out[key] = v;
  }
  return out;
};
const toRascunhoSnake = (raw: any): any => {
  const out: any = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = rascunhoCamelToSnake[k] || k;
    out[key] = v;
  }
  return out;
};

  // Buscar rascunho
  app.get('/rascunho/:sessionId', async (request: any, reply: any) => {
    const { sessionId } = request.params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)) {
      return reply.status(400).send({ error: 'sessionId inválido' });
    }
    const rascunho = await prisma.agendamentoRascunho.findUnique({ 
      where: { sessionId } 
    });
    if (!rascunho) return reply.status(404).send({ error: 'Rascunho não encontrado' });
    return { ...toRascunhoSnake(rascunho), session_id: rascunho.sessionId };
  });

  // Salvar rascunho
  app.post('/rascunho', async (request: any, reply: any) => {
    const parsed = validateBody(rascunhoBodySchema, request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error?.details });
    }
    const body = parsed.data!;
    const sessionId = body.sessionId ?? body.session_id;
    const data = toRascunhoCamel(body.data ?? {});
    
    const rascunho = await prisma.agendamentoRascunho.upsert({
      where: { sessionId },
      update: { ...data, updatedAt: new Date() },
      create: { sessionId, ...data }
    });
    return { ...toRascunhoSnake(rascunho), session_id: rascunho.sessionId };
  });

  // Deletar rascunho
  app.delete('/rascunho/:sessionId', async (request: any, reply: any) => {
    const { sessionId } = request.params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)) {
      return reply.status(400).send({ error: 'sessionId inválido' });
    }
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