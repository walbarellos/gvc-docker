import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { configuracaoBodySchema, validateBody } from '../schemas/index.js';

export async function configuracaoRoutes(app: FastifyInstance) {
  app.get('/sistema', { preHandler: [app.authenticate] }, async () => {
    const config = await prisma.configuracao.findFirst({ where: { id: 'sistema' } });
    return config || { id: 'sistema', data: {} };
  });

  app.get('/', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { id } = request.query as any;
    
    if (id) {
      const config = await prisma.configuracao.findUnique({ where: { id } });
      return config || reply.status(404).send({ error: 'Configuração não encontrada' });
    }
    
    const configs = await prisma.configuracao.findMany();
    return configs;
  });

  app.get('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { id } = request.params;
    const config = await prisma.configuracao.findUnique({ where: { id } });
    if (!config) {
      return reply.status(404).send({ error: 'Configuração não encontrada' });
    }
    return config;
  });

  app.post('/', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const parsed = validateBody(configuracaoBodySchema, request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error?.details });
    }
    const data = parsed.data!;
    const createData: any = {};
    if (data.id) createData.id = data.id;
    if (data.institution_name || data.institutionName) createData.institutionName = data.institution_name || data.institutionName;
    if (data.data !== undefined) createData.data = data.data;
    const config = await prisma.configuracao.create({ data: createData });
    return config;
  });

  app.put('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { id } = request.params;
    const parsed = validateBody(configuracaoBodySchema, request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error?.details });
    }
    const data = parsed.data!;
    const updateData: any = {};
    if (data.institution_name || data.institutionName) updateData.institutionName = data.institution_name || data.institutionName;
    if (data.data !== undefined) updateData.data = data.data;
    const config = await prisma.configuracao.update({ where: { id }, data: updateData });
    return config;
  });

  app.delete('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    await prisma.configuracao.delete({ where: { id } });
    return { success: true };
  });
}