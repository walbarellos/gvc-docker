import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { createAssinaturaBodySchema, validateBody } from '../schemas/index.js';

export async function assinaturaRoutes(app: FastifyInstance) {
  // Listar todos
  app.get('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const { limit } = request.query as any;
    return prisma.assinaturaDigital.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : 50,
    });
  });

  // Criar
  app.post('/', async (request: any, reply: any) => {
    const parsed = validateBody(createAssinaturaBodySchema, request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error?.details });
    }
    const body = parsed.data!;
    return prisma.assinaturaDigital.create({
      data: {
        nomeAssinante: body.nomeAssinante ?? body.nome_assinante!,
        cpfAssinante: body.cpfAssinante ?? body.cpf_assinante!,
        tipoDocumento: body.tipoDocumento ?? body.tipo_documento!,
        documentoId: body.documentoId ?? body.documento_id ?? null,
        documentoHash: body.documentoHash ?? body.documento_hash!,
        ipPublico: body.ipPublico ?? body.ip_publico!,
        userAgent: body.userAgent ?? body.user_agent ?? null,
      },
    });
  });

  // Buscar por ID
  app.get('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    return prisma.assinaturaDigital.findUnique({ where: { id } });
  });

  // Buscar por CPF
  app.get('/cpf/:cpf', { preHandler: [app.authenticate] }, async (request: any) => {
    const { cpf } = request.params;
    return prisma.assinaturaDigital.findMany({
      where: { cpfAssinante: cpf },
      orderBy: { createdAt: 'desc' },
    });
  });
}