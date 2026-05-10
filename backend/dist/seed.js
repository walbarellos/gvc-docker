"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const hash = await bcryptjs_1.default.hash('admin123', 10);
    const user = await prisma.usuario.upsert({
        where: { email: 'admin@cultura.gov.br' },
        update: {},
        create: {
            nome: 'Administrador',
            email: 'admin@cultura.gov.br',
            senha: hash,
            perfil: 'administrador',
            espacoNome: 'Todos os Espaços',
            ativo: true
        }
    });
    console.log('Usuário criado:', user.email);
}
main()
    .then(() => process.exit(0))
    .catch(e => { console.error(e); process.exit(1); });
//# sourceMappingURL=seed.js.map