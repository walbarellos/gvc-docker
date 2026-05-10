"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function resetAdmin() {
    const hash = await bcryptjs_1.default.hash('admin123', 10);
    const admin = await prisma.usuario.upsert({
        where: { email: 'admin@cultura.gov.br' },
        update: {
            senha: hash,
            perfil: 'administrador',
            ativo: true,
            espacoNome: 'Todos os Espaços',
        },
        create: {
            nome: 'Administrador',
            email: 'admin@cultura.gov.br',
            senha: hash,
            perfil: 'administrador',
            espacoNome: 'Todos os Espaços',
            ativo: true,
        },
    });
    console.log('✅ Admin criado/atualizado:', admin.email);
    console.log('📝 Senha: admin123');
}
resetAdmin()
    .then(() => process.exit(0))
    .catch(e => { console.error(e); process.exit(1); });
//# sourceMappingURL=reset-admin.js.map