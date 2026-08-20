import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { createEspacoBodySchema, updateEspacoBodySchema, validateBody } from '../schemas/index.js';

function mapSpaceFields(data: any): any {
  if (!data) return data;
  const mapped: any = {};
  
  if (data.nome !== undefined) mapped.nome = data.nome || '';
  if (data.name !== undefined) mapped.nome = data.name || '';
  if (mapped.nome === '') mapped.nome = 'Espaço sem nome';
  if (data.email !== undefined) mapped.email = data.email || null;
  if (data.endereco !== undefined) mapped.endereco = data.endereco || null;
  if (data.municipio !== undefined) mapped.municipio = data.municipio || null;
  if (data.horario_funcionamento !== undefined) mapped.horarioFuncionamento = data.horario_funcionamento || null;
  if (data.horarioFuncionamento !== undefined) mapped.horarioFuncionamento = data.horarioFuncionamento || null;
  if (data.capacidade_visitantes !== undefined) mapped.capacidadeVisitantes = parseInt(data.capacidade_visitantes) || null;
  if (data.capacidadeVisitantes !== undefined) mapped.capacidadeVisitantes = parseInt(data.capacidadeVisitantes) || null;
  if (data.mensagem_boas_vindas !== undefined) mapped.mensagemBoasVindas = data.mensagem_boas_vindas || null;
  if (data.mensagemBoasVindas !== undefined) mapped.mensagemBoasVindas = data.mensagemBoasVindas || null;
  if (data.tempo_limite_excedido !== undefined) mapped.tempoLimiteExcedido = parseInt(data.tempo_limite_excedido) || null;
  if (data.tempoLimiteExcedido !== undefined) mapped.tempoLimiteExcedido = parseInt(data.tempoLimiteExcedido) || null;
  if (data.ativo !== undefined) mapped.ativo = data.ativo;
  if (data.perfil_armarios !== undefined) mapped.perfilArmarios = data.perfil_armarios;
  if (data.perfilArmarios !== undefined) mapped.perfilArmarios = data.perfilArmarios;
  if (data.perfil_telecentro !== undefined) mapped.perfilTelecentro = data.perfil_telecentro;
  if (data.perfilTelecentro !== undefined) mapped.perfilTelecentro = data.perfilTelecentro;
  if (data.perfil_agendamento !== undefined) mapped.perfilAgendamento = data.perfil_agendamento;
  if (data.perfilAgendamento !== undefined) mapped.perfilAgendamento = data.perfilAgendamento;
  if (data.total_armarios !== undefined) mapped.totalArmarios = parseInt(data.total_armarios) || null;
  if (data.totalArmarios !== undefined) mapped.totalArmarios = parseInt(data.totalArmarios) || null;
  if (data.total_computadores !== undefined) mapped.totalComputadores = parseInt(data.total_computadores) || null;
  if (data.totalComputadores !== undefined) mapped.totalComputadores = parseInt(data.totalComputadores) || null;
  if (data.tempo_limite_computador !== undefined) mapped.tempoLimiteComputador = parseInt(data.tempo_limite_computador) || null;
  if (data.tempoLimiteComputador !== undefined) mapped.tempoLimiteComputador = parseInt(data.tempoLimiteComputador) || null;
  if (data.capacidade_agendamento !== undefined) mapped.capacidadeAgendamento = parseInt(data.capacidade_agendamento) || null;
  if (data.capacidadeAgendamento !== undefined) mapped.capacidadeAgendamento = parseInt(data.capacidadeAgendamento) || null;
  if (data.has_auditorio !== undefined) mapped.hasAuditorio = data.has_auditorio;
  if (data.hasAuditorio !== undefined) mapped.hasAuditorio = data.hasAuditorio;
  if (data.qtd_auditorio !== undefined) mapped.qtdAuditorio = parseInt(data.qtd_auditorio) || null;
  if (data.qtdAuditorio !== undefined) mapped.qtdAuditorio = parseInt(data.qtdAuditorio) || null;
  if (data.has_sala_estudos !== undefined) mapped.hasSalaEstudos = data.has_sala_estudos;
  if (data.hasSalaEstudos !== undefined) mapped.hasSalaEstudos = data.hasSalaEstudos;
  if (data.qtd_sala_estudos !== undefined) mapped.qtdSalaEstudos = parseInt(data.qtd_sala_estudos) || null;
  if (data.qtdSalaEstudos !== undefined) mapped.qtdSalaEstudos = parseInt(data.qtdSalaEstudos) || null;
  if (data.has_teatro !== undefined) mapped.hasTeatro = data.has_teatro;
  if (data.hasTeatro !== undefined) mapped.hasTeatro = data.hasTeatro;
  if (data.qtd_teatro !== undefined) mapped.qtdTeatro = parseInt(data.qtd_teatro) || null;
  if (data.qtdTeatro !== undefined) mapped.qtdTeatro = parseInt(data.qtdTeatro) || null;
  if (data.has_filmoteca !== undefined) mapped.hasFilmoteca = data.has_filmoteca;
  if (data.hasFilmoteca !== undefined) mapped.hasFilmoteca = data.hasFilmoteca;
  if (data.qtd_filmoteca !== undefined) mapped.qtdFilmoteca = parseInt(data.qtd_filmoteca) || null;
  if (data.qtdFilmoteca !== undefined) mapped.qtdFilmoteca = parseInt(data.qtdFilmoteca) || null;
  if (data.has_espaco_aberto !== undefined) mapped.hasEspacoAberto = data.has_espaco_aberto;
  if (data.hasEspacoAberto !== undefined) mapped.hasEspacoAberto = data.hasEspacoAberto;
  if (data.qtd_espaco_aberto !== undefined) mapped.qtdEspacoAberto = parseInt(data.qtd_espaco_aberto) || null;
  if (data.qtdEspacoAberto !== undefined) mapped.qtdEspacoAberto = parseInt(data.qtdEspacoAberto) || null;
  if (data.has_visita_guiada !== undefined) mapped.hasVisitaGuiada = data.has_visita_guiada;
  if (data.hasVisitaGuiada !== undefined) mapped.hasVisitaGuiada = data.hasVisitaGuiada;
  if (data.qtd_visita_guiada !== undefined) mapped.qtdVisitaGuiada = parseInt(data.qtd_visita_guiada) || null;
  if (data.qtdVisitaGuiada !== undefined) mapped.qtdVisitaGuiada = parseInt(data.qtdVisitaGuiada) || null;
  
  return mapped;
}

export async function spaceRoutes(app: FastifyInstance) {
  // Listar todos (com filtros)
  app.get('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const { ativo, order } = request.query as any;
    const where: any = {};
    if (ativo !== undefined) where.ativo = ativo === 'true';
    
    return prisma.espaco.findMany({ 
      where, 
      orderBy: order ? { nome: order === 'asc' ? 'asc' : 'desc' } : { nome: 'asc' } 
    });
  });

  // Buscar por ID
  app.get('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    return prisma.espaco.findUnique({ where: { id } });
  });

  // Criar (admin only)
  app.post('/', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.perfil !== 'administrador') {
      return reply.status(403).send({ error: 'Apenas administrador pode criar espaço' });
    }
    const rawBody = Array.isArray(request.body) ? request.body[0] : request.body;
    const parsed = validateBody(createEspacoBodySchema, rawBody);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error?.details });
    }
    const data = mapSpaceFields(parsed.data);
    return prisma.espaco.create({ data });
  });

  // Atualizar
  app.put('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.perfil !== 'administrador') {
      return reply.status(403).send({ error: 'Apenas administrador pode atualizar' });
    }
    const { id } = request.params;
    const parsed = validateBody(updateEspacoBodySchema, request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error?.details });
    }
    const data = mapSpaceFields(parsed.data);
    return prisma.espaco.update({ where: { id }, data });
  });

  // Patch - atualizar parcialmente
  app.patch('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.perfil !== 'administrador') {
      return reply.status(403).send({ error: 'Apenas administrador pode atualizar' });
    }
    const { id } = request.params;
    const parsed = validateBody(updateEspacoBodySchema, request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error?.details });
    }
    const data = mapSpaceFields(parsed.data);
    return prisma.espaco.update({ where: { id }, data });
  });

  // Soft delete
  app.delete('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.perfil !== 'administrador') {
      return reply.status(403).send({ error: 'Apenas administrador pode excluir' });
    }
    const { id } = request.params;
    return prisma.espaco.update({ where: { id }, data: { ativo: false } });
  });
}