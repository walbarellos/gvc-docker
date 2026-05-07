# 🚀 GVC Docker - Gestão de Visitantes Culturais

Sistema completo de gerenciamento de visitantes, espaços culturais e agendamentos em arquitetura Docker.

## 📋 Estrutura

```
gvc-docker/
├── docker-compose.yml     # Orquestrador
├── .env             # Variáveis de ambiente
├── frontend/         # React + Vite + Nginx
├── backend/         # Fastify + Prisma
└── database/       # PostgreSQL
```

## 🐳 Como Rodar

```bash
# Iniciar todos os serviços
docker compose up -d

# Ver logs
docker compose logs -f

# Parar
docker compose down
```

## 🔌 Portas

| Serviço | Porta |
|---------|------|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001 |
| PostgreSQL | localhost:5432 |

## 👥 Perfis de Usuário

| Perfil | Permissões |
|--------|----------|
| cidadao | Cadastro, agendamento próprio |
| monitor | Check-in, visitors |
| funcionario | + relatorios |
| coordenador | + aprovações |
| administrador | Tudo |

## 📝 Endpoints API

| Método | Rota | Auth | Descrição |
|--------|------|------|------|
| POST | /auth/login | ❌ | Login |
| GET | /auth/me | ✅ | Dados usuário |
| GET | /visitors | ✅ | Listar |
| POST | /visits/checkin | ✅ | Registrar entrada |
| POST | /visits/checkout/:id | ✅ | Registrar saída |
| GET | /spaces | ✅ | Espaços |
| POST | /public/agendamentos | ❌ | Criar agendamento |
| GET | /dashboard/stats | ✅ | Estatísticas |

## 🔧 Variáveis .env

Crie um arquivo `.env` com os seguintes valores (use senhas fortes):

```env
DB_NAME=gvc
DB_USER=gvc_admin
DB_PASSWORD=SUA_SENHA_FORTE_AQUI
JWT_SECRET=SUA_CHAVE_JWT_SECRETA
API_PORT=3001
FRONTEND_PORT=3000
```

## 📦 Stack

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS
- **Backend**: Fastify + TypeScript + Prisma
- **Database**: PostgreSQL 17

## 📄 Licença

MIT