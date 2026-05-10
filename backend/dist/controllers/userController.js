"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
const prisma_1 = require("../prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function createUser(request, reply) {
    const admin = request.user;
    // Só administradores e coordenadores podem criar usuários
    if (!['administrador', 'coordenador'].includes(admin?.perfil)) {
        return reply.status(403).send({ error: 'Sem permissão para criar usuários' });
    }
    const { nome, email, senha, perfil, espaco_id, } = request.body;
    // Validações básicas
    if (!nome || !email || !senha || !perfil) {
        return reply.status(400).send({ error: 'Campos obrigatórios: nome, email, senha, perfil' });
    }
    // Verificar e‑mail duplicado (ativos e inativos)
    const existing = await prisma_1.prisma.usuario.findFirst({
        where: { email },
    });
    if (existing) {
        if (existing.ativo) {
            return reply.status(400).send({ error: 'Este email já está sendo utilizado por outro usuário' });
        }
        // Usuário inativo existe - podemos reactivar ou deletar e criar novamente
        await prisma_1.prisma.usuario.delete({ where: { id: existing.id } });
    }
    // Hash da senha
    const hashedSenha = await bcryptjs_1.default.hash(senha, 10);
    // Criar usuário
    const usuario = await prisma_1.prisma.usuario.create({
        data: {
            nome,
            email,
            senha: hashedSenha,
            perfil,
            espacoId: espaco_id || null,
            ativo: true,
        },
        select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            espacoId: true,
            ativo: true,
            createdAt: true,
        },
    });
    return reply.status(201).send(usuario);
}
//# sourceMappingURL=userController.js.map