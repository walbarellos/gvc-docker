"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitRoutes = visitRoutes;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function parseDate(value) {
    if (!value)
        return null;
    if (value instanceof Date)
        return value;
    if (typeof value === 'string') {
        const d = new Date(value);
        if (!isNaN(d.getTime()))
            return d;
    }
    return null;
}
function mapVisitFields(data) {
    if (!data)
        return data;
    const mapped = {};
    if (data.visitorId !== undefined)
        mapped.visitorId = data.visitorId || null;
    if (data.visitor_id !== undefined)
        mapped.visitorId = data.visitor_id || null;
    if (data.espacoId !== undefined)
        mapped.espacoId = data.espacoId || null;
    if (data.espaco_id !== undefined)
        mapped.espacoId = data.espaco_id || null;
    if (data.nome !== undefined)
        mapped.nome = data.nome || '';
    if (data.perfil !== undefined)
        mapped.perfil = data.perfil || null;
    if (data.local !== undefined)
        mapped.local = data.local || null;
    if (data.status !== undefined)
        mapped.status = data.status || null;
    if (data.armario !== undefined)
        mapped.armario = data.armario || null;
    const checkin = data.checkin || data.checkIn;
    if (checkin) {
        const parsed = parseDate(checkin);
        if (parsed)
            mapped.checkin = parsed;
    }
    const checkout = data.checkout || data.checkOut;
    if (checkout) {
        const parsed = parseDate(checkout);
        if (parsed)
            mapped.checkout = parsed;
    }
    return mapped;
}
async function visitRoutes(app) {
    // Listar todas as visitas (com filtros)
    app.get('/', { preHandler: [app.authenticate] }, async (request) => {
        const { espaco_id, status, limit, order } = request.query;
        const where = {};
        if (espaco_id)
            where.espacoId = espaco_id;
        if (status)
            where.status = status;
        return prisma.visit.findMany({
            where,
            orderBy: order ? { checkin: order === 'asc' ? 'asc' : 'desc' } : { checkin: 'desc' },
            take: limit ? parseInt(limit) : undefined,
            include: { visitor: true }
        });
    });
    // Buscar por ID
    app.get('/:id', { preHandler: [app.authenticate] }, async (request) => {
        const { id } = request.params;
        const visit = await prisma.visit.findUnique({
            where: { id },
            include: { visitor: true }
        });
        if (!visit)
            return { error: 'Visita não encontrada' };
        return visit;
    });
    // Atualizar visita (para Telecentro)
    app.put('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
        const { id } = request.params;
        const data = mapVisitFields(request.body);
        try {
            const visit = await prisma.visit.update({
                where: { id },
                data
            });
            return visit;
        }
        catch (error) {
            return reply.status(400).send({ error: 'Erro ao atualizar visita' });
        }
    });
    // Contar visitas
    app.get('/count', { preHandler: [app.authenticate] }, async (request) => {
        const { espaco_id, date } = request.query;
        const where = {};
        if (espaco_id)
            where.espacoId = espaco_id;
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            where.checkin = { gte: start, lte: end };
        }
        const count = await prisma.visit.count({ where });
        return [{ count }];
    });
    // Check-in
    app.post('/checkin', { preHandler: [app.authenticate] }, async (request, reply) => {
        const { visitorId, espacoId, perfil } = request.body;
        const existing = await prisma.visit.findFirst({
            where: {
                visitorId,
                espacoId,
                status: 'Ativo',
                checkin: { gte: new Date(Date.now() - 60 * 60 * 1000) },
            },
        });
        if (existing) {
            return reply.status(400).send({ error: 'Visitante já possui check-in ativo nos últimos 60 minutos' });
        }
        const visitor = await prisma.visitor.findUnique({ where: { id: visitorId } });
        if (!visitor) {
            return reply.status(404).send({ error: 'Visitante não encontrado' });
        }
        const visit = await prisma.visit.create({
            data: { visitorId, espacoId, nome: visitor.fullName, perfil: perfil || 'general', status: 'Ativo' },
        });
        return visit;
    });
    // Check-out
    app.post('/checkout/:id', { preHandler: [app.authenticate] }, async (request) => {
        const { id } = request.params;
        const visit = await prisma.visit.update({
            where: { id },
            data: { checkout: new Date(), status: 'Inativo' },
        });
        return visit;
    });
    // Visitas ativas do espaço
    app.get('/active', { preHandler: [app.authenticate] }, async (request) => {
        const visits = await prisma.visit.findMany({
            where: { espacoId: request.user.espacoId, status: 'Ativo' },
        });
        return visits;
    });
    // Visitas de hoje
    app.get('/today', { preHandler: [app.authenticate] }, async (request) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const visits = await prisma.visit.findMany({
            where: { checkin: { gte: today } },
        });
        return visits;
    });
    // Excluir visita (Undo Check-in)
    app.delete('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
        const { id } = request.params;
        await prisma.visit.delete({ where: { id } });
        return { success: true };
    });
}
//# sourceMappingURL=visit.routes.js.map