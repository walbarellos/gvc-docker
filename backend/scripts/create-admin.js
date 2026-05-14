const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const hash = bcrypt.hashSync('admin123', 10);
  console.log('Hash:', hash);
  
  const result = await prisma.usuario.upsert({
    where: { email: 'admin@cultura.gov.br' },
    update: { senha: hash, perfil: 'administrador', ativo: true },
    create: {
      nome: 'Administrador',
      email: 'admin@cultura.gov.br',
      senha: hash,
      perfil: 'administrador',
      espacoNome: 'Todos os Espaços',
      ativo: true
    }
  });
  console.log('Admin criado:', result.email);
}

createAdmin().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });