import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import '../types/fastify.js';

const prisma = new PrismaClient();

const profiles = ['funcionario', 'coordenador', 'administrador'];

export async function visitorRoutes(app: FastifyInstance) {
  // Listar todos
  app.get('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const visitor = await prisma.visitor.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return visitor;
  });

  // Buscar por ID
  app.get('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    const visitor = await prisma.visitor.findUnique({ where: { id } });
    return visitor;
  });

  // Criar
  app.post('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const data = request.body as any;
    const visitor = await prisma.visitor.create({ data });
    return visitor;
  });

  // Atualizar
  app.put('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    const data = request.body as any;
    const visitor = await prisma.visitor.update({ where: { id }, data });
    return visitor;
  });

  // Deletar (admin only)
  app.delete('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.perfil !== 'administrador') {
      return reply.status(403).send({ error: 'Apenas administrador pode excluir' });
    }
    const { id } = request.params;
    await prisma.visitor.delete({ where: { id } });
    return { success: true };
  });

  // Buscar por CPF
  app.get('/search/cpf/:cpf', { preHandler: [app.authenticate] }, async (request: any) => {
    const { cpf } = request.params;
    const visitor = await prisma.visitor.findUnique({ where: { cpf } });
    return visitor;
  });
}