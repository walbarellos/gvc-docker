import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function configuracaoRoutes(app) {
    app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
        const { id } = request.query;
        if (id) {
            const config = await prisma.configuracao.findUnique({ where: { id } });
            return config || reply.status(404).send({ error: 'Configuração não encontrada' });
        }
        const configs = await prisma.configuracao.findMany();
        return configs;
    });
    app.post('/', { preHandler: [app.authenticate] }, async (request) => {
        const data = request.body;
        const createData = {};
        if (data.id)
            createData.id = data.id;
        if (data.institution_name)
            createData.institutionName = data.institution_name;
        if (data.data)
            createData.data = data.data;
        const config = await prisma.configuracao.create({ data: createData });
        return config;
    });
    app.put('/:id', { preHandler: [app.authenticate] }, async (request) => {
        const { id } = request.params;
        const data = request.body;
        const updateData = {};
        if (data.institution_name)
            updateData.institutionName = data.institution_name;
        if (data.data)
            updateData.data = data.data;
        const config = await prisma.configuracao.update({ where: { id }, data: updateData });
        return config;
    });
    app.delete('/:id', { preHandler: [app.authenticate] }, async (request) => {
        const { id } = request.params;
        await prisma.configuracao.delete({ where: { id } });
        return { success: true };
    });
}
//# sourceMappingURL=configuracao.routes.js.map