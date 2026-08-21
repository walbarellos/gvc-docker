import './instrument.js';
import * as Sentry from '@sentry/node';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from './config/unifiedConfig.js';
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

const app = Fastify({ logger: true, trustProxy: true });

// Registros
app.register(helmet);

app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// CORS: whitelist rígida. Nunca refletir a origem (reflexivo = qualquer site dispara chamadas autenticadas).
const corsOrigins = config.api.corsOrigin === '*'
  ? config.api.corsOrigin.split(',')
  : config.api.corsOrigin.split(',');
app.register(cors, {
  origin: corsOrigins.includes('*') ? false : corsOrigins,
  credentials: true,
});

app.register(jwt, {
  secret: config.auth.jwtSecret,
});

// Decorator para autenticação
app.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

// Handler global de erros
app.setErrorHandler((error, request, reply) => {
  request.log.error(error);

  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    Sentry.captureException(error, {
      tags: { correlationId: request.id },
    });
  }

  if (error.validation) {
    return reply.status(400).send({
      error: 'Erro de validação',
      message: error.message,
      details: error.validation
    });
  }

  if (error.code === 'P2002') {
    return reply.status(409).send({
      error: 'Conflito de dados',
      message: 'Um registro com estes dados já existe.'
    });
  }

  if (error.code === 'P2025') {
    return reply.status(404).send({
      error: 'Não encontrado',
      message: 'O registro solicitado não foi encontrado.'
    });
  }

  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    return reply.status(statusCode).send({
      error: 'Erro Interno do Servidor',
      message: 'Ocorreu um erro inesperado no servidor.',
      correlationId: request.id
    });
  }

  reply.status(statusCode).send({
    error: error.name || 'Error',
    message: error.message
  });
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
  const port = config.api.port;
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 GVC API rodando na porta ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();