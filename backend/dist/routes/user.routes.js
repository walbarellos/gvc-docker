"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = userRoutes;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function userRoutes(app) {
    // Listar todos
    app.get('/', { preHandler: [app.authenticate] }, async () => {
        return prisma.usuario.findMany({ orderBy: { nome: 'asc' } });
    });
    // Buscar por ID
    app.get('/:id', { preHandler: [app.authenticate] }, async (request) => {
        const { id } = request.params;
        return prisma.usuario.findUnique({ where: { id } });
    });
    // Criar
    app.post('/', { preHandler: [app.authenticate] }, async (request, reply) => {
        if (request.user.perfil !== 'administrador') {
            return reply.status(403).send({ error: 'Apenas administrador pode criar usuários' });
        }
        const { senha, ...data } = request.body;
        if (senha) {
            data.senha = await bcryptjs_1.default.hash(senha, 10);
        }
        return prisma.usuario.create({ data });
    });
    // Atualizar
    app.put('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
        if (request.user.perfil !== 'administrador') {
            return reply.status(403).send({ error: 'Apenas administrador pode atualizar usuários' });
        }
        const { id } = request.params;
        const { senha, ...data } = request.body;
        if (senha) {
            data.senha = await bcryptjs_1.default.hash(senha, 10);
        }
        return prisma.usuario.update({ where: { id }, data });
    });
    // Deletar
    app.delete('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
        if (request.user.perfil !== 'administrador') {
            return reply.status(403).send({ error: 'Apenas administrador pode excluir usuários' });
        }
        const { id } = request.params;
        await prisma.usuario.delete({ where: { id } });
        return { success: true };
    });
}
//# sourceMappingURL=user.routes.js.map