import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { createUserSchema, updateUserBodySchema } from '../schemas/index.js';

export async function userRoutes(app: FastifyInstance) {
  // Listar todos (com filtro opcional por espacoId)
  app.get('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const { espacoId } = request.query;
    const where: any = {};
    if (espacoId) where.espacoId = espacoId;
    // select explícito — NUNCA expor o hash de senha
    return prisma.usuario.findMany({
      where,
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        espacoId: true,
        espacoNome: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  // Buscar por email (para validação de unicidade)
  app.get('/email/:email', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { email } = request.params;
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: { id: true }
    });
    return { exists: !!usuario };
  });

  // Buscar por ID
  app.get('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    return prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        espacoId: true,
        espacoNome: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  // Criar
  app.post('/', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.perfil !== 'administrador') {
      return reply.status(403).send({ error: 'Apenas administrador pode criar usuários' });
    }
    const parsed = createUserSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.issues,
      });
    }
    const body = parsed.data;
    const data: Record<string, unknown> = {
      nome: body.nome,
      email: body.email,
      senha: await bcrypt.hash(body.senha, 10),
      perfil: body.perfil,
      espacoId: body.espacoId ?? null,
      ativo: body.ativo ?? true,
    };
    return prisma.usuario.create({
      data: data as any,
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        espacoId: true,
        espacoNome: true,
        ativo: true,
        createdAt: true,
      },
    });
  });

  // Atualizar
  app.put('/:id', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    if (request.user.perfil !== 'administrador') {
      return reply.status(403).send({ error: 'Apenas administrador pode atualizar usuários' });
    }
    const { id } = request.params;
    const parsed = updateUserBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error.issues });
    }
    const body = parsed.data!;

    const { senha, espaco_id, espaco_nome, ativo, ...rest } = body;

    const updateData: any = {
      nome: rest.nome,
      email: rest.email,
      perfil: rest.perfil,
      espacoNome: espaco_nome || rest.espacoNome || null,
      ativo: ativo !== undefined ? ativo : true
    };
    
    if (senha) {
      updateData.senha = await bcrypt.hash(senha, 10);
    }
    
    const espacoId = espaco_id || rest.espacoId;
    if (espacoId && espacoId !== 'null') {
      updateData.espaco = { connect: { id: espacoId } };
    } else if (espacoId === 'null' || (rest.espacoId === null)) {
      updateData.espaco = { disconnect: true };
    }
    
    try {
      return await prisma.usuario.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          espacoId: true,
          espacoNome: true,
          ativo: true,
          createdAt: true,
          updatedAt: true,
        },
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