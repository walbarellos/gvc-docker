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

  // Buscar por email (para validação de unicidade)
  app.get('/email/:email', async (request: any, reply: any) => {
    const { email } = request.params;
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: { id: true, email: true, nome: true }
    });
    if (!usuario) {
      return reply.status(404).send({ exists: false });
    }
    return { exists: true, usuario };
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
    const body = request.body as any;
    
    const { senha, espaco_id, espaco_nome, ativo, ...rest } = body;
    
    const updateData: any = {
      nome: rest.nome,
      email: rest.email,
      perfil: rest.perfil,
      espacoNome: espaco_nome || null,
      ativo: ativo !== undefined ? ativo : true
    };
    
    if (senha) {
      updateData.senha = await bcrypt.hash(senha, 10);
    }
    
    if (espaco_id && espaco_id !== null && espaco_id !== 'null') {
      updateData.espaco = { connect: { id: espaco_id } };
    } else {
      updateData.espaco = { disconnect: true };
    }
    
    try {
      return await prisma.usuario.update({ 
        where: { id }, 
        data: updateData 
      });
    } catch (error: any) {
      console.error('Erro no update:', error);
      return reply.status(500).send({ error: error.message });
    }
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