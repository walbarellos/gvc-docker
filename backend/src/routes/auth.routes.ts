/**
 * PATCH gvc-docker — problema-01 + problema-20
 * JWT com expiração + remoção de logs sensíveis no login
 *
 * Arquivo alvo: backend/src/routes/auth.routes.ts
 * Substituir o conteúdo do handler POST /login e garantir uso de config.auth.jwtExpiresIn
 *
 * Também requer: import { config } from '../config/unifiedConfig.js';
import { loginSchema } from '../schemas/user.schema.js';
 */

import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { createUser } from '../controllers/userController.js';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/unifiedConfig.js';
import { loginSchema } from '../schemas/user.schema.js';

export async function authRoutes(app: FastifyInstance) {
  // Login
  app.post('/login', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Email e senha são obrigatórios' });
    }
    const { email, senha } = parsed.data;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
        perfil: true,
        espacoId: true,
        espacoNome: true,
        ativo: true,
      },
    });

    // Resposta uniforme para não permitir enumeração de usuários
    if (!usuario || !usuario.ativo) {
      return reply.status(401).send({ error: 'Credenciais inválidas' });
    }

    try {
      const valid = await bcrypt.compare(senha, usuario.senha || '');
      if (!valid) {
        return reply.status(401).send({ error: 'Credenciais inválidas' });
      }
    } catch {
      return reply.status(500).send({ error: 'Erro interno' });
    }

    // PATCH CRÍTICO: passa expiresIn — antes o token não expirava
    const token = app.jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil,
        espacoId: usuario.espacoId,
      },
      { expiresIn: config.auth.jwtExpiresIn || '8h' }
    );

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

  // Sessão atual
  app.get('/sessao', { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const usuario = await prisma.usuario.findUnique({
      where: { id: request.user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        espacoId: true,
        espacoNome: true,
        ativo: true,
      },
    });

    if (!usuario || !usuario.ativo) {
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

  // Criar usuário — restringir a administrador (ver patch de authz)
  app.post('/create-user', { preHandler: [app.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createUser);
}
