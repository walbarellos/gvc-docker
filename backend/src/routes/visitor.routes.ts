import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
    const parts = value.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d2 = new Date(year, month, day);
      if (!isNaN(d2.getTime())) return d2;
    }
  }
  return null;
}

function mapVisitorFields(data: any): any {
  if (!data) return data;
  const mapped: any = {};
  
  if (data.full_name !== undefined) mapped.fullName = data.full_name || '';
  if (data.fullName !== undefined) mapped.fullName = data.fullName || '';
  if (data.cpf !== undefined) mapped.cpf = data.cpf || null;
  if (data.passport !== undefined) mapped.passport = data.passport || null;
  if (data.is_foreigner !== undefined) mapped.isForeigner = data.is_foreigner;
  if (data.isForeigner !== undefined) mapped.isForeigner = data.isForeigner;
  if (data.gender !== undefined) mapped.gender = data.gender || null;
  
  const birthDate = data.birth_date !== undefined ? data.birth_date : data.birthDate;
  if (birthDate) {
    const parsed = parseDate(birthDate);
    if (parsed) mapped.birthDate = parsed;
  }
  
  if (data.email !== undefined) mapped.email = data.email || null;
  if (data.phone !== undefined) mapped.phone = data.phone || null;
  if (data.address !== undefined) mapped.address = data.address || null;
  if (data.category !== undefined) mapped.category = data.category || null;
  if (data.photo_url !== undefined) mapped.photoUrl = data.photo_url || null;
  if (data.photoUrl !== undefined) mapped.photoUrl = data.photoUrl || null;
  
  return mapped;
}

export async function visitorRoutes(app: FastifyInstance) {
  // Listar todos
  app.get('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const { cpf, passport, order } = request.query as any;
    const where: any = {};
    if (cpf) where.cpf = cpf;
    if (passport) where.passport = passport;
    
    return prisma.visitor.findMany({
      where,
      orderBy: order ? { createdAt: order === 'asc' ? 'asc' : 'desc' } : { createdAt: 'desc' },
    });
  });

  // Buscar por ID
  app.get('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    const visitor = await prisma.visitor.findUnique({ where: { id } });
    return visitor;
  });

  // Criar
  app.post('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const data = mapVisitorFields(request.body);
    const visitor = await prisma.visitor.create({ data });
    return visitor;
  });

  // Atualizar
  app.put('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    const data = mapVisitorFields(request.body);
    const visitor = await prisma.visitor.update({ where: { id }, data });
    return visitor;
  });

  // Patch - atualizar parcialmente
  app.patch('/:id', { preHandler: [app.authenticate] }, async (request: any) => {
    const { id } = request.params;
    const data = mapVisitorFields(request.body);
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