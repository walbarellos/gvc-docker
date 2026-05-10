"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userController_1 = require("../controllers/userController");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function authRoutes(app) {
    // Login
    app.post('/login', async (request, reply) => {
        const { email, senha } = request.body;
        console.log('Login attempt - email:', email, 'senha recebida:', senha ? 'sim' : 'não');
        const usuario = await prisma.usuario.findUnique({
            where: { email },
        });
        console.log('Usuario found:', !!usuario, 'ativo:', usuario?.ativo);
        console.log('Senha hash no DB:', usuario?.senha?.substring(0, 30));
        if (!usuario || !usuario.ativo) {
            return reply.status(401).send({ error: 'Credenciais inválidas - usuario não encontrado ou inativo' });
        }
        const valid = await bcryptjs_1.default.compare(senha, usuario.senha || '');
        console.log('bcrypt.compare result:', valid);
        if (!valid) {
            return reply.status(401).send({ error: 'Credenciais inválidas - senha incorreta' });
        }
        const token = app.jwt.sign({
            id: usuario.id,
            email: usuario.email,
            perfil: usuario.perfil,
            espacoId: usuario.espacoId,
        });
        return {
            token,
            user: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil,
                espacoId: usuario.espacoId,
                espacoNome: usuario.espacoNome,
            },
        };
    });
    // Meus dados
    app.get('/me', { preHandler: [app.authenticate] }, async (request, reply) => {
        const usuario = await prisma.usuario.findUnique({
            where: { id: request.user.id },
        });
        if (!usuario) {
            return reply.status(404).send({ error: 'Usuário não encontrado' });
        }
        return {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
            espacoId: usuario.espacoId,
            espacoNome: usuario.espacoNome,
        };
    });
    // Nova rota para criar usuário
    app.post('/create-user', { preHandler: [app.authenticate] }, userController_1.createUser);
}
//# sourceMappingURL=auth.routes.js.map