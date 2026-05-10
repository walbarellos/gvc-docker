"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = dashboardRoutes;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function dashboardRoutes(app) {
    // Estatísticas
    app.get('/stats', { preHandler: [app.authenticate] }, async (request) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [totalVisitantes, visitasHoje, agendamentosPendentes, espacos] = await Promise.all([
            prisma.visitor.count(),
            prisma.visit.count({ where: { checkin: { gte: today } } }),
            prisma.agendamento.count({
                where: { status: 'pendente', ...(request.user.perfil !== 'administrador' ? { espacoId: request.user.espacoId } : {}) }
            }),
            prisma.espaco.count({ where: { ativo: true } }),
        ]);
        return { totalVisitantes, visitasHoje, agendamentosPendentes, espacos };
    });
}
//# sourceMappingURL=dashboard.routes.js.map