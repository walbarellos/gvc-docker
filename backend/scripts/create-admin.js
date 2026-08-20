const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  console.error('Defina ADMIN_PASSWORD (mín. 12 chars) no ambiente. Ex.: ADMIN_PASSWORD=$(openssl rand -base64 24) node scripts/create-admin.js');
  process.exit(1);
}

const prisma = new PrismaClient();

async function createAdmin() {
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  
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
  console.log('Admin criado/atualizado:', result.email);
}