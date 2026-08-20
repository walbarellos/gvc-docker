import { FastifyReply } from 'fastify';

export type UserRole = 'administrador' | 'coordenador' | 'funcionario' | 'operador' | 'monitor' | 'cidadao';

export const requireRole = (...roles: UserRole[]) => {
  return async (request: any, reply: FastifyReply) => {
    const perfil: string | undefined = request.user?.perfil;
    if (!roles.includes(perfil as UserRole)) {
      return reply.status(403).send({ error: 'Sem permissão para esta ação' });
    }
  };
};

export const isAdmin = (user: any): boolean => user?.perfil === 'administrador';

export const scopedSpaceId = (user: any): string | null => {
  if (!user || isAdmin(user)) return null;
  return user.espacoId || null;
};

export const scopedWhere = (user: any, field = 'espacoId'): Record<string, unknown> => {
  const spaceId = scopedSpaceId(user);
  return spaceId ? { [field]: spaceId } : {};
};

export const assertSameSpace = (request: any, reply: FastifyReply, recordSpaceId: string | null | undefined): boolean => {
  const spaceId = scopedSpaceId(request.user);
  if (!spaceId) return true;
  if (!recordSpaceId || recordSpaceId !== spaceId) {
    reply.status(403).send({ error: 'Sem permissão para acessar este registro' });
    return false;
  }
  return true;
};