import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { createUser } from '../controllers/userController.js';
import { prisma } from '../lib/prisma.js';

export async function authRoutes(app: FastifyInstance) {
  // Login
  app.post('/login', async (request, reply) => {
    const { email, senha } = request.body as any;
    
    console.log('Login attempt - email:', email, 'senha recebida:', senha ? 'sim' : 'nao');
    
    if (!email || !senha) {
      return reply.status(400).send({ error: 'Email e senha são obrigatórios' });
    }
    
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });
    
    if (!usuario) {
      console.log('Usuario not found');
      return reply.status(401).send({ error: 'Credenciais inválidas' });
    }
    
    if (!usuario.ativo) {
      console.log('Usuario inativo');
      return reply.status(401).send({ error: 'Usuário inativo' });
    }
    
    console.log('Usuario found, checking password...');
    console.log('Hash no DB:', usuario.senha?.substring(0, 30));
    
    try {
      const valid = await bcrypt.compare(senha, usuario.senha || '');
      console.log('bcrypt.compare result:', valid);
      
      if (!valid) {
        return reply.status(401).send({ error: 'Credenciais inválidas' });
      }
    } catch (err) {
      console.error('Erro no bcrypt:', err);
      return reply.status(500).send({ error: 'Erro interno' });
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