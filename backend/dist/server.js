"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_js_1 = require("./routes/auth.routes.js");
const visitor_routes_js_1 = require("./routes/visitor.routes.js");
const visit_routes_js_1 = require("./routes/visit.routes.js");
const space_routes_js_1 = require("./routes/space.routes.js");
const agendamento_routes_js_1 = require("./routes/agendamento.routes.js");
const public_routes_js_1 = require("./routes/public.routes.js");
const dashboard_routes_js_1 = require("./routes/dashboard.routes.js");
const locker_routes_js_1 = require("./routes/locker.routes.js");
const computador_routes_js_1 = require("./routes/computador.routes.js");
const auditoria_routes_js_1 = require("./routes/auditoria.routes.js");
const assinatura_routes_js_1 = require("./routes/assinatura.routes.js");
const user_routes_js_1 = require("./routes/user.routes.js");
const configuracao_routes_js_1 = require("./routes/configuracao.routes.js");
dotenv_1.default.config();
const app = (0, fastify_1.default)({ logger: true });
// Registros
await app.register(cors_1.default, {
    origin: process.env.CORS_ORIGIN?.split(',') || true,
    credentials: true,
});
await app.register(jwt_1.default, {
    secret: process.env.JWT_SECRET || 'default-secret',
});
// Decorator para autenticação
app.decorate('authenticate', async function (request, reply) {
    try {
        await request.jwtVerify();
    }
    catch (err) {
        reply.status(401).send({ error: 'Unauthorized' });
    }
});
// Health check
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
// Root route
app.get('/', async () => ({ message: 'GVC API - Sistema de Gestão de Visitantes', version: '1.0.0' }));
// Rotas
await app.register(auth_routes_js_1.authRoutes, { prefix: '/auth' });
await app.register(public_routes_js_1.publicRoutes, { prefix: '/public' });
await app.register(visitor_routes_js_1.visitorRoutes, { prefix: '/visitors' });
await app.register(visit_routes_js_1.visitRoutes, { prefix: '/visits' });
await app.register(space_routes_js_1.spaceRoutes, { prefix: '/spaces' });
await app.register(agendamento_routes_js_1.agendamentoRoutes, { prefix: '/agendamentos' });
await app.register(dashboard_routes_js_1.dashboardRoutes, { prefix: '/dashboard' });
await app.register(locker_routes_js_1.lockerRoutes, { prefix: '/lockers' });
await app.register(computador_routes_js_1.computadorRoutes, { prefix: '/computadores' });
await app.register(auditoria_routes_js_1.auditoriaRoutes, { prefix: '/auditoria' });
await app.register(assinatura_routes_js_1.assinaturaRoutes, { prefix: '/assinaturas_digitais' });
await app.register(user_routes_js_1.userRoutes, { prefix: '/usuarios' });
await app.register(configuracao_routes_js_1.configuracaoRoutes, { prefix: '/configuracoes' });
// Startup
const start = async () => {
    const port = parseInt(process.env.API_PORT || '3001');
    try {
        await app.listen({ port, host: '0.0.0.0' });
        console.log(`🚀 GVC API rodando na porta ${port}`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map