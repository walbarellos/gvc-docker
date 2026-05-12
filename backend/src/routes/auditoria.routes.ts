import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function mapAuditoriaFields(data: any): any {
  if (!data) return data;
  const mapped: any = {};
  
  if (data.usuario !== undefined) mapped.usuario = data.usuario || '';
  if (data.perfil !== undefined) mapped.perfil = data.perfil || null;
  if (data.acao !== undefined) mapped.acao = data.acao || '';
  if (data.detalhes !== undefined) mapped.detalhes = data.detalhes || null;
  
  if (data.entidade_id !== undefined) mapped.entidadeId = data.entidade_id || null;
  if (data.entidadeId !== undefined) mapped.entidadeId = data.entidadeId || null;
  
  if (data.createdAt !== undefined) mapped.createdAt = data.createdAt;
  
  return mapped;
}

export async function auditoriaRoutes(app: FastifyInstance) {
  // Listar todos
  app.get('/', { preHandler: [app.authenticate] }, async (request: any) => {
    const { limit } = request.query as any;
    const logs = await prisma.auditoria.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : 50,
    });
    
    // Mapear campos para formato snake_case (como no banco)
    return logs.map(log => ({
      id: log.id,
      usuario: log.usuario,
      perfil: log.perfil,
      acao: log.acao,
      detalhes: log.detalhes,
      entidade_id: log.entidadeId,
      created_at: log.createdAt
    }));
  });

  // Criar (sem auth para logs automáticos)
  app.post('/', async (request: any) => {
    const data = mapAuditoriaFields(request.body);
    return prisma.auditoria.create({ data });
  });
}