import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function userRoutes(app: FastifyInstance) {
  // Listar todos (com filtro opcional por espacoId)
  app.get('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const { espacoId } = request.query;
    const where: any = {};
    if (espacoId) where.espacoId = espacoId;
    return prisma.usuario.findMany({ where, orderBy: { nome: 'asc' } });
  });

  // Buscar por ID
  app.get('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    return prisma.usuario.findUnique({ where: { id } });
  });

  // Criar
  app.post('/', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.perfil !== 'administrador') {
      return reply.status(403).send({ error: 'Apenas administrador pode criar usuários' });
    }
    const { senha, ...data } = request.body as any;
    if (senha) {
      data.senha = await bcrypt.hash(senha, 10);
    }
    return prisma.usuario.create({ data });
  });

  // Atualizar
  app.put('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.perfil !== 'administrador') {
      return reply.status(403).send({ error: 'Apenas administrador pode atualizar usuários' });
    }
    const { id } = request.params;
    const { senha, ...data } = request.body as any;
    if (senha) {
      data.senha = await bcrypt.hash(senha, 10);
    }
    return prisma.usuario.update({ where: { id }, data });
  });

  // Deletar
  app.delete('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.perfil !== 'administrador') {
      return reply.status(403).send({ error: 'Apenas administrador pode excluir usuários' });
    }
    const { id } = request.params;
    await prisma.usuario.delete({ where: { id } });
    return { success: true };
  });
}