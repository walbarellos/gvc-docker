import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function publicRoutes(app: FastifyInstance) {
  // Criar agendamento público
  app.post('/agendamentos', async (request, reply) => {
    const data = request.body as any;
    
    // Verificar conflito
    const conflicts = await prisma.agendamento.findMany({
      where: {
        espacoId: data.espacoId,
        dataPretendida: data.dataPretendida,
        status: { in: ['pendente', 'aprovado'] },
        OR: [
          { AND: [{ horarioInicio: { lte: data.horarioInicio } }, { horarioFim: { gt: data.horarioInicio } }] },
          { AND: [{ horarioInicio: { lt: data.horarioFim } }, { horarioFim: { gte: data.horarioFim } }] },
          { AND: [{ horarioInicio: { gte: data.horarioInicio } }, { horarioFim: { lte: data.horarioFim } }] },
        ],
      },
    });

    if (conflicts.length > 0) {
      return reply.status(400).send({ error: 'Conflito de horário. Espaço indisponível neste horário.' });
    }

    const agendamento = await prisma.agendamento.create({ data });
    return agendamento;
  });

  // Cadastro público
  app.post('/cadastro', async (request, reply) => {
    const data = request.body as any;
    
    // Validar CPF na BrasilAPI
    const cpf = data.cpf?.replace(/\D/g, '');
    if (cpf && cpf.length === 11) {
      try {
        const res = await fetch(`https://brasilapi.com.br/api/cpf/v1/${cpf}`);
        if (!res.ok) return reply.status(400).send({ error: 'CPF inválido na Receita Federal' });
      } catch (e) {
        // Continua mesmo se API falhar
      }
    }

    // Criar visitante
    const visitor = await prisma.visitor.create({
      data: {
        fullName: data.nome,
        cpf: data.cpf,
        email: data.email,
        phone: data.telefone,
        category: 'general',
      },
    });
    return visitor;
  });

  // Espaços disponíveis para agendamento
  app.get('/espacos', async () => {
    return prisma.espaco.findMany({
      where: { ativo: true, perfilAgendamento: true },
      select: { id: true, nome: true, municipio: true, capacidadeAgendamento: true },
    });
  });
}