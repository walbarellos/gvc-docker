# Estágio de Dependências (apenas prod)
FROM node:20-bookworm AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Estágio de Build
FROM node:20-bookworm AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Estágio de Produção Final
FROM node:20-bookworm AS production
WORKDIR /app

# Instala apenas dependências necessárias do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    tzdata \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

ENV TZ=America/Rio_Branco
ENV NODE_ENV=production

# Copia dependências de produção do estágio 'deps'
COPY --from=deps /app/node_modules ./node_modules
# Copia binários do prisma (necessário para o client)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copia código compilado e outros arquivos necessários
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/server.js"]
