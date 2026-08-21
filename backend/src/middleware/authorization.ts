import { FastifyReply } from 'fastify';

export type UserRole = 'administrador' | 'coordenador' | 'funcionario' | 'operador' | 'monitor' | 'cidadao';

const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  'cidadao': ['cidadao'],
  'monitor': ['monitor', 'operador', 'funcionario', 'coordenador', 'administrador'],
  'operador': ['operador', 'funcionario', 'coordenador', 'administrador'],
  'funcionario': ['funcionario', 'coordenador', 'administrador'],
  'coordenador': ['coordenador', 'administrador'],
  'administrador': ['administrador']
};

export const requireRole = (...roles: UserRole[]) => {
  return async (request: any, reply: FastifyReply) => {
    const perfil: UserRole | undefined = request.user?.perfil;
    if (!perfil) {
      return reply.status(403).send({ error: 'Usuário sem perfil' });
    }
    
    // Check if the user's profile is in the allowed roles directly,
    // OR if any of the allowed roles implicitly grants access to the user's profile via hierarchy.
    const hasPermission = roles.some(role => ROLE_HIERARCHY[role]?.includes(perfil));
    
    if (!hasPermission) {
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