"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitorRoutes = visitorRoutes;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function parseDate(value) {
    if (!value || typeof value !== 'string')
        return null;
    const trimmed = value.trim();
    if (!trimmed)
        return null;
    if (trimmed === '')
        return null;
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        if (year < 1900 || year > 2100)
            return null;
        return d;
    }
    const parts = trimmed.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (year < 1900 || year > 2100)
            return null;
        const d2 = new Date(year, month, day);
        if (!isNaN(d2.getTime()))
            return d2;
    }
    return null;
}
function mapVisitorFields(data) {
    if (!data)
        return data;
    const mapped = {};
    if (data.full_name !== undefined)
        mapped.fullName = data.full_name || '';
    if (data.fullName !== undefined)
        mapped.fullName = data.fullName || '';
    if (data.cpf !== undefined)
        mapped.cpf = data.cpf || null;
    if (data.passport !== undefined)
        mapped.passport = data.passport || null;
    if (data.is_foreigner !== undefined)
        mapped.isForeigner = data.is_foreigner;
    if (data.isForeigner !== undefined)
        mapped.isForeigner = data.isForeigner;
    if (data.gender !== undefined)
        mapped.gender = data.gender || null;
    const birthDate = data.birth_date !== undefined ? data.birth_date : data.birthDate;
    if (birthDate) {
        const parsed = parseDate(birthDate);
        if (parsed)
            mapped.birthDate = parsed;
    }
    if (data.email !== undefined)
        mapped.email = data.email || null;
    if (data.phone !== undefined)
        mapped.phone = data.phone || null;
    if (data.address !== undefined)
        mapped.address = data.address || null;
    if (data.category !== undefined)
        mapped.category = data.category || null;
    if (data.photo_url !== undefined)
        mapped.photoUrl = data.photo_url || null;
    if (data.photoUrl !== undefined)
        mapped.photoUrl = data.photoUrl || null;
    return mapped;
}
async function visitorRoutes(app) {
    // Listar todos
    app.get('/', { preHandler: [app.authenticate] }, async (request) => {
        const { cpf, passport, order } = request.query;
        const where = {};
        if (cpf)
            where.cpf = cpf;
        if (passport)
            where.passport = passport;
        return prisma.visitor.findMany({
            where,
            orderBy: order ? { createdAt: order === 'asc' ? 'asc' : 'desc' } : { createdAt: 'desc' },
        });
    });
    // Buscar por ID
    app.get('/:id', { preHandler: [app.authenticate] }, async (request) => {
        const { id } = request.params;
        const visitor = await prisma.visitor.findUnique({ where: { id } });
        return visitor;
    });
    // Criar
    app.post('/', { preHandler: [app.authenticate] }, async (request) => {
        const data = mapVisitorFields(request.body);
        const visitor = await prisma.visitor.create({ data });
        return visitor;
    });
    // Atualizar
    app.put('/:id', { preHandler: [app.authenticate] }, async (request) => {
        const { id } = request.params;
        console.log('PUT visitor - body:', JSON.stringify(request.body));
        const data = mapVisitorFields(request.body);
        console.log('PUT visitor - mapped:', JSON.stringify(data));
        const visitor = await prisma.visitor.update({ where: { id }, data });
        return visitor;
    });
    // Patch - atualizar parcialmente
    app.patch('/:id', { preHandler: [app.authenticate] }, async (request) => {
        const { id } = request.params;
        const data = mapVisitorFields(request.body);
        const visitor = await prisma.visitor.update({ where: { id }, data });
        return visitor;
    });
    // Deletar (admin only)
    app.delete('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
        if (request.user.perfil !== 'administrador') {
            return reply.status(403).send({ error: 'Apenas administrador pode excluir' });
        }
        const { id } = request.params;
        await prisma.visitor.delete({ where: { id } });
        return { success: true };
    });
    // Buscar por CPF
    app.get('/search/cpf/:cpf', { preHandler: [app.authenticate] }, async (request) => {
        const { cpf } = request.params;
        const visitor = await prisma.visitor.findUnique({ where: { cpf } });
        return visitor;
    });
}
//# sourceMappingURL=visitor.routes.js.map