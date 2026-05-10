import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
function mapAuditoriaFields(data) {
    if (!data)
        return data;
    const mapped = {};
    if (data.usuario !== undefined)
        mapped.usuario = data.usuario || '';
    if (data.perfil !== undefined)
        mapped.perfil = data.perfil || null;
    if (data.acao !== undefined)
        mapped.acao = data.acao || '';
    if (data.detalhes !== undefined)
        mapped.detalhes = data.detalhes || null;
    if (data.entidade_id !== undefined)
        mapped.entidadeId = data.entidade_id || null;
    if (data.entidadeId !== undefined)
        mapped.entidadeId = data.entidadeId || null;
    if (data.createdAt !== undefined)
        mapped.createdAt = data.createdAt;
    return mapped;
}
export async function auditoriaRoutes(app) {
    // Listar todos
    app.get('/', { preHandler: [app.authenticate] }, async (request) => {
        const { limit } = request.query;
        return prisma.auditoria.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit ? parseInt(limit) : 50,
        });
    });
    // Criar (sem auth para logs automáticos)
    app.post('/', async (request) => {
        const data = mapAuditoriaFields(request.body);
        return prisma.auditoria.create({ data });
    });
}
//# sourceMappingURL=auditoria.routes.js.map