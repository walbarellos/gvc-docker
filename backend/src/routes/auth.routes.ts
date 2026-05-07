import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function authRoutes(app: FastifyInstance) {
  // Login
  app.post('/login', async (request, reply) => {
    const { email, senha } = request.body as any;
    
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario || !usuario.ativo) {
      return reply.status(401).send({ error: 'Credenciais inválidas' });
    }

    const valid = await bcrypt.compare(senha, usuario.senha || '');
    if (!valid) {
      return reply.status(401).send({ error: 'Credenciais inválidas' });
    }

    const token = app.jwt.sign({
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
      espacoId: usuario.espacoId,
    });

    return {
      token,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        espacoId: usuario.espacoId,
        espacoNome: usuario.espacoNome,
      },
    };
  });

  // Meus dados
  app.get('/me', { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const usuario = await prisma.usuario.findUnique({
      where: { id: request.user.id },
    });

    if (!usuario) {
      return reply.status(404).send({ error: 'Usuário não encontrado' });
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      espacoId: usuario.espacoId,
      espacoNome: usuario.espacoNome,
    };
  });
}