import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';

async function resetAdmin() {
  const hash = await bcrypt.hash('admin123', 10);
  
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