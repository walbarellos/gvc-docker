import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma.js';

const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminPassword || adminPassword.length < 12) {
  console.error('Defina ADMIN_PASSWORD (mín. 12 chars) no ambiente.');
  process.exit(1);
}
const ADMIN_PASSWORD: string = adminPassword;

async function main() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
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