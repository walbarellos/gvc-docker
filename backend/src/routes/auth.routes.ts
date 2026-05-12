import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { createUser } from '../controllers/userController.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function authRoutes(app: FastifyInstance) {
  // Login
  app.post('/login', async (request, reply) => {
    const { email, senha } = request.body as any;
    
    console.log('Login attempt - email:', email, 'senha recebida:', senha ? 'sim' : 'não');
    
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });
    
    console.log('Usuario found:', !!usuario, 'ativo:', usuario?.ativo);
    console.log('Senha hash no DB:', usuario?.senha?.substring(0, 30));
    
    if (!usuario || !usuario.ativo) {
      return reply.status(401).send({ error: 'Credenciais inválidas - usuario não encontrado ou inativo' });
    }
    
    const valid = await bcrypt.compare(senha, usuario.senha || '');
    console.log('bcrypt.compare result:', valid);
    
    if (!valid) {
      return reply.status(401).send({ error: 'Credenciais inválidas - senha incorreta' });
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

  // Sessão atual
  app.get('/sessao', { preHandler: [app.authenticate] }, async (request: any, reply) => {
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

  // Nova rota para criar usuário
  app.post('/create-user', { preHandler: [app.authenticate] }, createUser);
}