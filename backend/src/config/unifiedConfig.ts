import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  api: z.object({
    port: z.coerce.number().default(3001),
    corsOrigin: z.string().default('*'),
  }),
  db: z.object({
    url: z.string(),
  }),
  auth: z.object({
    jwtSecret: z.string(),
    jwtExpiresIn: z.string().default('24h'),
  }),
  sentry: z.object({
    dsn: z.string().optional(),
  }),
  external: z.object({
    brasilApiUrl: z.string().url().default('https://brasilapi.com.br/api/cpf/v1'),
  })
});

const envVars = {
  nodeEnv: process.env.NODE_ENV,
  api: {
    port: process.env.API_PORT,
    corsOrigin: process.env.CORS_ORIGIN,
  },
  db: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
  external: {
    brasilApiUrl: process.env.BRASIL_API_URL,
  }
};

const parsed = configSchema.safeParse(envVars);

if (!parsed.success) {
  console.error('❌ Invalid configuration:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const config = parsed.data;
