import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const lockerStatusMap = {
    'Livre': 'Livre',
    'Ocupado': 'Ocupado',
    'Manutencao': 'Manutencao',
    'disponivel': 'Livre',
    'ocupado': 'Ocupado',
};
export async function lockerRoutes(app) {
    // Listar todos
    app.get('/', { preHandler: [app.authenticate] }, async (request) => {
        const { espaco_id, status } = request.query;
        const where = {};
        if (espaco_id)
            where.espacoId = espaco_id;
        if (status)
            where.status = lockerStatusMap[status] || status;
        return prisma.locker.findMany({ where, orderBy: { number: 'asc' } });
    });
    // Buscar por ID
    app.get('/:id', { preHandler: [app.authenticate] }, async (request) => {
        const { id } = request.params;
        return prisma.locker.findUnique({ where: { id } });
    });
    // Criar
    app.post('/', { preHandler: [app.authenticate] }, async (request) => {
        const data = request.body;
        return prisma.locker.create({ data });
    });
    // Atualizar
    app.put('/:id', { preHandler: [app.authenticate] }, async (request) => {
        const { id } = request.params;
        const data = request.body;
        return prisma.locker.update({ where: { id }, data });
    });
    // Deletar
    app.delete('/:id', { preHandler: [app.authenticate] }, async (request) => {
        const { id } = request.params;
        await prisma.locker.delete({ where: { id } });
        return { success: true };
    });
    // Alocar armário
    app.post('/alocar', { preHandler: [app.authenticate] }, async (request) => {
        const { numero, visitorId, espacoId } = request.body;
        const locker = await prisma.locker.create({
            data: {
                number: parseInt(numero),
                status: 'Ocupado',
                espacoId,
                visitorId,
            }
        });
        return locker;
    });
    // Desalocar armário
    app.post('/:id/desalocar', { preHandler: [app.authenticate] }, async (request) => {
        const { id } = request.params;
        const locker = await prisma.locker.update({
            where: { id },
            data: { status: 'Livre', visitorId: null }
        });
        return locker;
    });
}
//# sourceMappingURL=locker.routes.js.map