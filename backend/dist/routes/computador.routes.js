import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function computadorRoutes(app) {
    // Listar todos
    app.get('/', { preHandler: [app.authenticate] }, async (request) => {
        const { espaco_id, status } = request.query;
        const where = {};
        if (espaco_id)
            where.espacoId = espaco_id;
        if (status)
            where.status = status;
        return prisma.computador.findMany({ where, orderBy: { numero: 'asc' } });
    });
    // Buscar por ID
    app.get('/:id', { preHandler: [app.authenticate] }, async (request) => {
        const { id } = request.params;
        return prisma.computador.findUnique({ where: { id } });
    });
    // Criar
    app.post('/', { preHandler: [app.authenticate] }, async (request) => {
        const data = request.body;
        return prisma.computador.create({ data });
    });
    // Atualizar
    app.put('/:id', { preHandler: [app.authenticate] }, async (request) => {
        const { id } = request.params;
        const data = request.body;
        return prisma.computador.update({ where: { id }, data });
    });
    // Deletar
    app.delete('/:id', { preHandler: [app.authenticate] }, async (request) => {
        const { id } = request.params;
        await prisma.computador.delete({ where: { id } });
        return { success: true };
    });
}
//# sourceMappingURL=computador.routes.js.map