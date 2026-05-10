"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assinaturaRoutes = assinaturaRoutes;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function assinaturaRoutes(app) {
    // Listar todos
    app.get('/', { preHandler: [app.authenticate] }, async (request) => {
        const { limit } = request.query;
        return prisma.assinaturaDigital.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit ? parseInt(limit) : 50,
        });
    });
    // Criar
    app.post('/', async (request) => {
        const data = request.body;
        return prisma.assinaturaDigital.create({ data });
    });
    // Buscar por ID
    app.get('/:id', { preHandler: [app.authenticate] }, async (request) => {
        const { id } = request.params;
        return prisma.assinaturaDigital.findUnique({ where: { id } });
    });
    // Buscar por CPF
    app.get('/cpf/:cpf', { preHandler: [app.authenticate] }, async (request) => {
        const { cpf } = request.params;
        return prisma.assinaturaDigital.findMany({
            where: { cpfAssinante: cpf },
            orderBy: { createdAt: 'desc' },
        });
    });
}
//# sourceMappingURL=assinatura.routes.js.map