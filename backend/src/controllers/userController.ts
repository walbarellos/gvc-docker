import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../prisma.js';
import bcrypt from 'bcryptjs';

interface CreateUserBody {
  nome: string;
  email: string;
  senha: string;
  perfil: 'administrador' | 'coordenador' | 'funcionario' | 'operador';
  espaco_id?: string;
}

export async function createUser(request: FastifyRequest, reply: FastifyReply) {
  const admin = (request as any).user;

  // Só administradores e coordenadores podem criar usuários
  if (!['administrador', 'coordenador'].includes(admin?.perfil)) {
    return reply.status(403).send({ error: 'Sem permissão para criar usuários' });
  }

  const {
    nome,
    email,
    senha,
    perfil,
    espaco_id,
  } = request.body as CreateUserBody;

  // Validações básicas
  if (!nome || !email || !senha || !perfil) {
    return reply.status(400).send({ error: 'Campos obrigatórios: nome, email, senha, perfil' });
  }

  // Verificar e‑mail duplicado (ativos e inativos)
  const existing = await prisma.usuario.findFirst({
    where: { email },
  });
  if (existing) {
    if (existing.ativo) {
      return reply.status(400).send({ error: 'Este email já está sendo utilizado por outro usuário' });
    }
    // Usuário inativo existe - podemos reactivar ou deletar e criar novamente
    await prisma.usuario.delete({ where: { id: existing.id } });
  }

  // Hash da senha
  const hashedSenha = await bcrypt.hash(senha, 10);

  // Criar usuário
  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha: hashedSenha,
      perfil,
      espacoId: espaco_id || null,
      ativo: true,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
      espacoId: true,
      ativo: true,
      createdAt: true,
    },
  });

  return reply.status(201).send(usuario);
}