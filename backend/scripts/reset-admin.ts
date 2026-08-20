import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';

const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminPassword || adminPassword.length < 12) {
  console.error('Defina ADMIN_PASSWORD (mín. 12 chars) no ambiente.');
  process.exit(1);
}
const ADMIN_PASSWORD: string = adminPassword;

async function resetAdmin() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  
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
  
  console.log('Admin criado/atualizado:', admin.email);
}

resetAdmin()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });