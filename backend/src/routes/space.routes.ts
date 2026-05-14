import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

function mapSpaceFields(data: any): any {
  if (!data) return data;
  const mapped: any = {};
  
  if (data.nome !== undefined) mapped.nome = data.nome || '';
  if (data.name !== undefined) mapped.nome = data.name || '';
  if (mapped.nome === '') mapped.nome = 'Espaço sem nome';
  if (data.email !== undefined) mapped.email = data.email || null;
  if (data.endereco !== undefined) mapped.endereco = data.endereco || null;
  if (data.municipio !== undefined) mapped.municipio = data.municipio || null;
  if (data.horario_funcionamento !== undefined) mapped.horario_funcionamento = data.horario_funcionamento || null;
  if (data.horarioFuncionamento !== undefined) mapped.horario_funcionamento = data.horarioFuncionamento || null;
  if (data.capacidade_visitantes !== undefined) mapped.capacidade_visitantes = parseInt(data.capacidade_visitantes) || null;
  if (data.capacidadeVisitantes !== undefined) mapped.capacidade_visitantes = parseInt(data.capacidadeVisitantes) || null;
  if (data.mensagem_boas_vindas !== undefined) mapped.mensagem_boas_vindas = data.mensagem_boas_vindas || null;
  if (data.mensagemBoasVindas !== undefined) mapped.mensagem_boas_vindas = data.mensagemBoasVindas || null;
  if (data.tempo_limite_excedido !== undefined) mapped.tempo_limite_excedido = parseInt(data.tempo_limite_excedido) || null;
  if (data.tempoLimiteExcedido !== undefined) mapped.tempo_limite_excedido = parseInt(data.tempoLimiteExcedido) || null;
  if (data.ativo !== undefined) mapped.ativo = data.ativo;
  if (data.perfil_armarios !== undefined) mapped.perfil_armarios = data.perfil_armarios;
  if (data.perfilArmarios !== undefined) mapped.perfil_armarios = data.perfilArmarios;
  if (data.perfil_telecentro !== undefined) mapped.perfil_telecentro = data.perfil_telecentro;
  if (data.perfilTelecentro !== undefined) mapped.perfil_telecentro = data.perfilTelecentro;
  if (data.perfil_agendamento !== undefined) mapped.perfil_agendamento = data.perfil_agendamento;
  if (data.perfilAgendamento !== undefined) mapped.perfil_agendamento = data.perfilAgendamento;
  if (data.total_armarios !== undefined) mapped.total_armarios = parseInt(data.total_armarios) || null;
  if (data.totalArmarios !== undefined) mapped.total_armarios = parseInt(data.totalArmarios) || null;
  if (data.total_computadores !== undefined) mapped.total_computadores = parseInt(data.total_computadores) || null;
  if (data.totalComputadores !== undefined) mapped.total_computadores = parseInt(data.totalComputadores) || null;
  if (data.tempo_limite_computador !== undefined) mapped.tempo_limite_computador = parseInt(data.tempo_limite_computador) || null;
  if (data.tempoLimiteComputador !== undefined) mapped.tempo_limite_computador = parseInt(data.tempoLimiteComputador) || null;
  if (data.capacidade_agendamento !== undefined) mapped.capacidade_agendamento = parseInt(data.capacidade_agendamento) || null;
  if (data.capacidadeAgendamento !== undefined) mapped.capacidade_agendamento = parseInt(data.capacidadeAgendamento) || null;
  if (data.has_auditorio !== undefined) mapped.has_auditorio = data.has_auditorio;
  if (data.hasAuditorio !== undefined) mapped.has_auditorio = data.hasAuditorio;
  if (data.qtd_auditorio !== undefined) mapped.qtd_auditorio = parseInt(data.qtd_auditorio) || null;
  if (data.qtdAuditorio !== undefined) mapped.qtd_auditorio = parseInt(data.qtdAuditorio) || null;
  if (data.has_sala_estudos !== undefined) mapped.has_sala_estudos = data.has_sala_estudos;
  if (data.hasSalaEstudos !== undefined) mapped.has_sala_estudos = data.hasSalaEstudos;
  if (data.qtd_sala_estudos !== undefined) mapped.qtd_sala_estudos = parseInt(data.qtd_sala_estudos) || null;
  if (data.qtdSalaEstudos !== undefined) mapped.qtd_sala_estudos = parseInt(data.qtdSalaEstudos) || null;
  if (data.has_teatro !== undefined) mapped.has_teatro = data.has_teatro;
  if (data.hasTeatro !== undefined) mapped.has_teatro = data.hasTeatro;
  if (data.qtd_teatro !== undefined) mapped.qtd_teatro = parseInt(data.qtd_teatro) || null;
  if (data.qtdTeatro !== undefined) mapped.qtd_teatro = parseInt(data.qtdTeatro) || null;
  if (data.has_filmoteca !== undefined) mapped.has_filmoteca = data.has_filmoteca;
  if (data.hasFilmoteca !== undefined) mapped.has_filmoteca = data.hasFilmoteca;
  if (data.qtd_filmoteca !== undefined) mapped.qtd_filmoteca = parseInt(data.qtd_filmoteca) || null;
  if (data.qtdFilmoteca !== undefined) mapped.qtd_filmoteca = parseInt(data.qtdFilmoteca) || null;
  if (data.has_espaco_aberto !== undefined) mapped.has_espaco_aberto = data.has_espaco_aberto;
  if (data.hasEspacoAberto !== undefined) mapped.has_espaco_aberto = data.hasEspacoAberto;
  if (data.qtd_espaco_aberto !== undefined) mapped.qtd_espaco_aberto = parseInt(data.qtd_espaco_aberto) || null;
  if (data.qtdEspacoAberto !== undefined) mapped.qtd_espaco_aberto = parseInt(data.qtdEspacoAberto) || null;
  if (data.has_visita_guiada !== undefined) mapped.has_visita_guiada = data.has_visita_guiada;
  if (data.hasVisitaGuiada !== undefined) mapped.has_visita_guiada = data.hasVisitaGuiada;
  if (data.qtd_visita_guiada !== undefined) mapped.qtd_visita_guiada = parseInt(data.qtd_visita_guiada) || null;
  if (data.qtdVisitaGuiada !== undefined) mapped.qtd_visita_guiada = parseInt(data.qtdVisitaGuiada) || null;
  
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
    const body = Array.isArray(request.body) ? request.body[0] : request.body;
    const data = mapSpaceFields(body);
    return prisma.espaco.create({ data });
  });

  // Atualizar
  app.put('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.perfil !== 'administrador') {
      return reply.status(403).send({ error: 'Apenas administrador pode atualizar' });
    }
    const { id } = request.params;
    const data = mapSpaceFields(request.body);
    return prisma.espaco.update({ where: { id }, data });
  });

  // Patch - atualizar parcialmente
  app.patch('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.perfil !== 'administrador') {
      return reply.status(403).send({ error: 'Apenas administrador pode atualizar' });
    }
    const { id } = request.params;
    const data = mapSpaceFields(request.body);
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