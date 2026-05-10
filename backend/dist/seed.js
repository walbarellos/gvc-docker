import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    const hash = await bcrypt.hash('admin123', 10);
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