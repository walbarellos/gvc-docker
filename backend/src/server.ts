import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth.routes.js';
import { visitorRoutes } from './routes/visitor.routes.js';
import { visitRoutes } from './routes/visit.routes.js';
import { spaceRoutes } from './routes/space.routes.js';
import { agendamentoRoutes } from './routes/agendamento.routes.js';
import { publicRoutes } from './routes/public.routes.js';
import { dashboardRoutes } from './routes/dashboard.routes.js';
import { lockerRoutes } from './routes/locker.routes.js';
import { computadorRoutes } from './routes/computador.routes.js';
import { auditoriaRoutes } from './routes/auditoria.routes.js';
import { assinaturaRoutes } from './routes/assinatura.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { configuracaoRoutes } from './routes/configuracao.routes.js';

dotenv.config();

const app = Fastify({ logger: true });

// Registros
app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || true,
  credentials: true,
});

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'default-secret',
});

// Decorator para autenticação
app.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

// Health check
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Root route
app.get('/', async () => ({ message: 'GVC API - Sistema de Gestão de Visitantes', version: '1.0.0' }));

// Rotas
app.register(authRoutes, { prefix: '/auth' });
app.register(publicRoutes, { prefix: '/public' });
app.register(visitorRoutes, { prefix: '/visitantes' });
app.register(visitRoutes, { prefix: '/visitas' });
app.register(spaceRoutes, { prefix: '/espacos' });
app.register(agendamentoRoutes, { prefix: '/agendamentos' });
app.register(dashboardRoutes, { prefix: '/dashboard' });
app.register(lockerRoutes, { prefix: '/armarios' });
app.register(computadorRoutes, { prefix: '/computadores' });
app.register(auditoriaRoutes, { prefix: '/auditoria' });
app.register(assinaturaRoutes, { prefix: '/assinaturas' });
app.register(userRoutes, { prefix: '/usuarios' });
app.register(configuracaoRoutes, { prefix: '/configuracoes' });

// Startup
const start = async () => {
  const port = parseInt(process.env.API_PORT || '3001');
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 GVC API rodando na porta ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();