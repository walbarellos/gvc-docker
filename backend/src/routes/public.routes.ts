/**
 * PATCH gvc-docker — problema-02 + problema-15 (CPF)
 * Elimina mass assignment no agendamento público e no cadastro público.
 * Força status=pendente no servidor; valida com Zod; whitelist de campos.
 *
 * Arquivo alvo: backend/src/routes/public.routes.ts
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/unifiedConfig.js';

// Schema específico do endpoint público (whitelist — NUNCA aceitar status, coordenadorId, etc.)
const publicAgendamentoSchema = z.object({
  espacoId: z.string().uuid('ID de espaço inválido'),
  solicitanteNome: z.string().min(3).max(200),
  solicitanteEmail: z.string().email().max(200),
  solicitanteTelefone: z.string().min(10).max(20),
  solicitanteDocumento: z.string().max(20).optional().nullable(),
  tipoSolicitante: z.enum([
    'pessoa_fisica',
    'pessoa_juridica',
    'escola',
    'universidade',
    'governo',
  ]),
  tipoEspaco: z.enum([
    'auditorio',
    'sala_estudos',
    'teatro',
    'filmoteca',
    'espaco_aberto',
    'visita_guiada',
  ]),
  espacoSolicitado: z.string().min(3).max(200),
  dataPretendida: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  horarioInicio: z.string().regex(/^\d{2}:\d{2}$/),
  horarioFim: z.string().regex(/^\d{2}:\d{2}$/),
  numeroParticipantes: z.coerce.number().int().min(1).max(5000),
  descricaoEvento: z.string().min(10).max(5000),
  naturezaEvento: z.string().min(3).max(200),
  gratuito: z.boolean().default(true),
  valorIngresso: z.coerce.number().positive().optional().nullable(),
  necessitaEquipamentos: z.string().max(1000).optional().nullable(),
  observacoes: z.string().max(2000).optional().nullable(),
  termoAceito: z.literal(true),
  responsabilidadeEvento: z.literal(true),
  danosPatrimonio: z.literal(true),
  respeitoLotacao: z.literal(true),
  autorizoDivulgacao: z.boolean().default(false),
  razaoSocial: z.string().max(200).optional().nullable(),
  nomeInstituicao: z.string().max(200).optional().nullable(),
  secretariaGoverno: z.string().max(200).optional().nullable(),
  unidadeGoverno: z.string().max(200).optional().nullable(),
});

const publicCadastroSchema = z.object({
  nome: z.string().min(3).max(200),
  cpf: z.string().regex(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional(),
  email: z.string().email().max(200),
  telefone: z.string().min(10).max(20).optional(),
});

export async function publicRoutes(app: FastifyInstance) {
  // Criar agendamento público
  app.post('/agendamentos', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => {
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
      where: { id: data.espacoId, ativo: true, perfilAgendamento: true },
      select: { id: true, capacidadeAgendamento: true },
    });
    if (!espaco) {
      return reply.status(400).send({ error: 'Espaço inválido ou indisponível para agendamento' });
    }

    if (
      espaco.capacidadeAgendamento &&
      data.numeroParticipantes > espaco.capacidadeAgendamento
    ) {
      return reply.status(400).send({
        error: `Número de participantes excede a capacidade (${espaco.capacidadeAgendamento})`,
      });
    }

    // Montar DateTime para horários
    const dataBase = data.dataPretendida; // YYYY-MM-DD
    const horarioInicio = new Date(`${dataBase}T${data.horarioInicio}:00`);
    const horarioFim = new Date(`${dataBase}T${data.horarioFim}:00`);

    if (horarioFim <= horarioInicio) {
      return reply.status(400).send({ error: 'Horário de fim deve ser posterior ao de início' });
    }

    // Verificar conflito (status pendente/aprovado)
    const conflicts = await prisma.agendamento.findMany({
      where: {
        espacoId: data.espacoId,
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
        espacoId: data.espacoId,
        solicitanteNome: data.solicitanteNome,
        solicitanteEmail: data.solicitanteEmail,
        solicitanteTelefone: data.solicitanteTelefone,
        solicitanteDocumento: data.solicitanteDocumento ?? null,
        tipoSolicitante: data.tipoSolicitante,
        tipoEspaco: data.tipoEspaco,
        espacoSolicitado: data.espacoSolicitado,
        dataPretendida: new Date(dataBase),
        horarioInicio,
        horarioFim,
        numeroParticipantes: data.numeroParticipantes,
        descricaoEvento: data.descricaoEvento,
        naturezaEvento: data.naturezaEvento,
        gratuito: data.gratuito,
        valorIngresso: data.valorIngresso ?? null,
        necessitaEquipamentos: data.necessitaEquipamentos ?? null,
        observacoes: data.observacoes ?? null,
        termoAceito: true,
        termoAceitoEm: new Date(),
        responsabilidadeEvento: true,
        danosPatrimonio: true,
        respeitoLotacao: true,
        autorizoDivulgacao: data.autorizoDivulgacao,
        razaoSocial: data.razaoSocial ?? null,
        nomeInstituicao: data.nomeInstituicao ?? null,
        secretariaGoverno: data.secretariaGoverno ?? null,
        unidadeGoverno: data.unidadeGoverno ?? null,
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

  // Cadastro público de visitante
  app.post('/cadastro', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => {
    const parsed = publicCadastroSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten(),
      });
    }

    const data = parsed.data;
    const cpf = data.cpf?.replace(/\D/g, '') || null;

    // CPF: fail-closed se informado e inválido; se BrasilAPI cair, rejeita (não fail-open)
    if (cpf) {
      if (cpf.length !== 11) {
        return reply.status(400).send({ error: 'CPF inválido' });
      }
      try {
        const res = await fetch(`${config.external.brasilApiUrl}/${cpf}`, {
          signal: AbortSignal.timeout(5000),
        });
        const body = (await res.json().catch(() => ({}))) as { isValid?: boolean };
        // BrasilAPI retorna 200 com isValid:false para CPF inexistente — checar o campo
        if (!res.ok || body.isValid === false) {
          return reply.status(400).send({ error: 'CPF inválido na Receita Federal' });
        }
      } catch {
        return reply.status(503).send({
          error: 'Serviço de validação de CPF temporariamente indisponível. Tente novamente.',
        });
      }
    }

    try {
      const visitor = await prisma.visitor.create({
        data: {
          fullName: data.nome,
          cpf,
          email: data.email,
          phone: data.telefone ?? null,
          category: 'general',
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
        },
      });
      return reply.status(201).send(visitor);
    } catch (err: any) {
      if (err?.code === 'P2002') {
        return reply.status(409).send({ error: 'CPF ou e-mail já cadastrado' });
      }
      throw err;
    }
  });

  // Espaços disponíveis para agendamento
  app.get('/espacos', async () => {
    return prisma.espaco.findMany({
      where: { ativo: true, perfilAgendamento: true },
      select: {
        id: true,
        nome: true,
        municipio: true,
        capacidadeAgendamento: true,
      },
    });
  });
}