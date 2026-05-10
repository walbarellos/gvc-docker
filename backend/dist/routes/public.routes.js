import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function publicRoutes(app) {
    // Criar agendamento público
    app.post('/agendamentos', async (request, reply) => {
        const data = request.body;
        // Verificar conflito
        const conflicts = await prisma.agendamento.findMany({
            where: {
                espacoId: data.espacoId,
                data_pretendida: data.data_pretendida,
                status: { in: ['pendente', 'aprovado'] },
                OR: [
                    { AND: [{ horario_inicio: { lte: data.horario_inicio } }, { horario_fim: { gt: data.horario_inicio } }] },
                    { AND: [{ horario_inicio: { lt: data.horario_fim } }, { horario_fim: { gte: data.horario_fim } }] },
                    { AND: [{ horario_inicio: { gte: data.horario_inicio } }, { horario_fim: { lte: data.horario_fim } }] },
                ],
            },
        });
        if (conflicts.length > 0) {
            return reply.status(400).send({ error: 'Conflito de horário. Espaço indisponível neste horário.' });
        }
        const agendamento = await prisma.agendamento.create({ data });
        return agendamento;
    });
    // Cadastro público
    app.post('/cadastro', async (request, reply) => {
        const data = request.body;
        // Validar CPF na BrasilAPI
        const cpf = data.cpf?.replace(/\D/g, '');
        if (cpf && cpf.length === 11) {
            try {
                const res = await fetch(`https://brasilapi.com.br/api/cpf/v1/${cpf}`);
                if (!res.ok)
                    return reply.status(400).send({ error: 'CPF inválido na Receita Federal' });
            }
            catch (e) {
                // Continua mesmo se API falhar
            }
        }
        // Criar visitante
        const visitor = await prisma.visitor.create({
            data: {
                fullName: data.nome,
                cpf: data.cpf,
                email: data.email,
                phone: data.telefone,
                category: 'general',
            },
        });
        return visitor;
    });
    // Espaços disponíveis para agendamento
    app.get('/espacos', async () => {
        return prisma.espaco.findMany({
            where: { ativo: true, perfil_agendamento: true },
            select: { id: true, nome: true, municipio: true, capacidade_agendamento: true },
        });
    });
}
//# sourceMappingURL=public.routes.js.map