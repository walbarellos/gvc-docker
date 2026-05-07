const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const espacos = await prisma.espaco.findMany();
  
  for (const espaco of espacos) {
    const total = espaco.total_computadores || 10;
    console.log(`Criando ${total} computadores para ${espaco.nome}...`);
    
    for (let i = 1; i <= total; i++) {
      try {
        await prisma.computador.create({
          data: {
            numero: i,
            status: 'Livre',
            espacoId: espaco.id
          }
        });
      } catch (e) {
        // Já existe, ignora
      }
    }
  }
  
  console.log('Concluído!');
  await prisma.$disconnect();
}

main();
