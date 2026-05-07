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

dotenv.config();

const app = Fastify({ logger: true });

// Registros
await app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || true,
  credentials: true,
});

await app.register(jwt, {
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

// Rotas
await app.register(authRoutes, { prefix: '/auth' });
await app.register(publicRoutes, { prefix: '/public' });
await app.register(visitorRoutes, { prefix: '/visitors' });
await app.register(visitRoutes, { prefix: '/visits' });
await app.register(spaceRoutes, { prefix: '/spaces' });
await app.register(agendamentoRoutes, { prefix: '/agendamentos' });
await app.register(dashboardRoutes, { prefix: '/dashboard' });

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