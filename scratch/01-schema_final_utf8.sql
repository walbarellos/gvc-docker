-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('administrador', 'coordenador', 'operador', 'monitor', 'funcionario');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('ativo', 'finalizado', 'cancelado');

-- CreateEnum
CREATE TYPE "ComputadorStatus" AS ENUM ('Livre', 'EmUso', 'Manutencao', 'Indisponivel');

-- CreateEnum
CREATE TYPE "LockerStatus" AS ENUM ('Livre', 'Ocupado', 'Manutencao');

-- CreateEnum
CREATE TYPE "AgendamentoStatus" AS ENUM ('pendente', 'aprovado', 'rejeitado', 'cancelado');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('masculino', 'feminino', 'outro', 'prefiro_nao_dizer');

-- CreateTable
CREATE TABLE "visitors" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "cpf" TEXT,
    "passport" TEXT,
    "is_foreigner" BOOLEAN NOT NULL DEFAULT false,
    "gender" "Gender",
    "birth_date" TIMESTAMP(3),
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "category" TEXT,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parental_authorization" BOOLEAN DEFAULT false,
    "authorization_date" TIMESTAMP(3),
    "responsible_name" VARCHAR(100),
    "authorization_doc_type" VARCHAR(20),
    "authorization_presented" BOOLEAN DEFAULT false,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "auth_uid" TEXT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT,
    "perfil" "PerfilUsuario" NOT NULL,
    "espaco_id" TEXT,
    "espaco_nome" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "espacos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "endereco" TEXT,
    "municipio" TEXT,
    "horario_funcionamento" TEXT,
    "capacidade_visitantes" INTEGER,
    "mensagem_boas_vindas" TEXT,
    "tempo_limite_excedido" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "perfil_armarios" BOOLEAN NOT NULL DEFAULT true,
    "perfil_telecentro" BOOLEAN NOT NULL DEFAULT false,
    "perfil_agendamento" BOOLEAN NOT NULL DEFAULT false,
    "total_armarios" INTEGER,
    "total_computadores" INTEGER,
    "tempo_limite_computador" INTEGER,
    "capacidade_agendamento" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "has_auditorio" BOOLEAN NOT NULL DEFAULT false,
    "qtd_auditorio" INTEGER,
    "has_sala_estudos" BOOLEAN NOT NULL DEFAULT false,
    "qtd_sala_estudos" INTEGER,
    "has_teatro" BOOLEAN NOT NULL DEFAULT false,
    "qtd_teatro" INTEGER,
    "has_filmoteca" BOOLEAN NOT NULL DEFAULT false,
    "qtd_filmoteca" INTEGER,
    "has_espaco_aberto" BOOLEAN NOT NULL DEFAULT false,
    "qtd_espaco_aberto" INTEGER,
    "has_visita_guiada" BOOLEAN NOT NULL DEFAULT false,
    "qtd_visita_guiada" INTEGER,

    CONSTRAINT "espacos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "visitor_id" TEXT,
    "nome" TEXT NOT NULL,
    "perfil" TEXT,
    "local" TEXT,
    "espaco_id" TEXT,
    "checkin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkout" TIMESTAMP(3),
    "status" "VisitStatus",
    "armario" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responsible_accompanied" BOOLEAN DEFAULT false,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "computadores" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "status" "ComputadorStatus" DEFAULT 'Livre',
    "usuario_id" TEXT,
    "usuario_nome" TEXT,
    "horario_inicio" TIMESTAMP(3),
    "horario_limite" TIMESTAMP(3),
    "espaco_id" TEXT,
    "espaco_nome" TEXT,

    CONSTRAINT "computadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lockers" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" TEXT,
    "visitor_id" TEXT,
    "visitor_name" TEXT,
    "espaco_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lockers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "id" TEXT NOT NULL,
    "espaco_id" TEXT NOT NULL,
    "solicitante_nome" TEXT NOT NULL,
    "solicitante_email" TEXT NOT NULL,
    "solicitante_telefone" TEXT NOT NULL,
    "solicitante_documento" TEXT,
    "tipo_solicitante" TEXT NOT NULL,
    "tipo_espaco" TEXT NOT NULL,
    "espaco_solicitado" TEXT NOT NULL,
    "data_pretendida" TIMESTAMP(3) NOT NULL,
    "horario_inicio" TIMESTAMP(3) NOT NULL,
    "horario_fim" TIMESTAMP(3) NOT NULL,
    "numero_participantes" INTEGER NOT NULL,
    "descricao_evento" TEXT NOT NULL,
    "natureza_evento" TEXT NOT NULL,
    "gratuito" BOOLEAN,
    "valor_ingresso" DOUBLE PRECISION,
    "necessita_equipamentos" TEXT,
    "observacoes" TEXT,
    "status" "AgendamentoStatus" NOT NULL DEFAULT 'pendente',
    "termo_aceito" BOOLEAN,
    "termo_aceito_em" TIMESTAMP(3),
    "responsabhilidade_evento" BOOLEAN,
    "danos_patrimonio" BOOLEAN,
    "respeito_lotacao" BOOLEAN,
    "autorizo_divulgacao" BOOLEAN,
    "documento_anexo_url" TEXT,
    "resposta_coordenador" TEXT,
    "coordenador_id" TEXT,
    "respondido_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assinaturas_digitais" (
    "id" TEXT NOT NULL,
    "visitor_id" TEXT,
    "nome_assinante" TEXT NOT NULL,
    "cpf_assinante" TEXT NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "documento_id" TEXT,
    "documento_hash" TEXT NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_hora_brasilia" TEXT,
    "ip_publico" TEXT NOT NULL,
    "user_agent" TEXT,
    "browser_fingerprint" JSONB,
    "cpf_validado" BOOLEAN,
    "cpf_status" TEXT,
    "termo_conteudo" TEXT,
    "termo_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assinaturas_digitais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "perfil" TEXT,
    "acao" TEXT NOT NULL,
    "detalhes" TEXT,
    "entidade_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" TEXT NOT NULL DEFAULT 'sistema',
    "institution_name" TEXT,
    "data" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamentos_rascunhos" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "solicitante_nome" TEXT,
    "solicitante_email" TEXT,
    "solicitante_telefone" TEXT,
    "solicitante_documento" TEXT,
    "tipo_solicitante" TEXT,
    "razao_social" TEXT,
    "nome_instituicao" TEXT,
    "secretaria_governo" TEXT,
    "unidade_governo" TEXT,
    "espaco_id" TEXT,
    "tipo_espaco" TEXT,
    "espaco_solicitado" TEXT,
    "data_pretendida" TEXT,
    "horario_inicio" TEXT,
    "horario_fim" TEXT,
    "numero_participantes" INTEGER,
    "descricao_evento" TEXT,
    "natureza_evento" TEXT,
    "gratuito" BOOLEAN,
    "valor_ingresso" TEXT,
    "necessita_equipamentos" TEXT,
    "observacoes" TEXT,
    "termo_aceito" BOOLEAN,
    "responsabhilidade_evento" BOOLEAN,
    "danos_patrimonio" BOOLEAN,
    "respeito_lotacao" BOOLEAN,
    "autorizo_divulgacao" BOOLEAN,
    "termo_compromisso_assinado" BOOLEAN,
    "termo_compromisso_data" TEXT,
    "termo_compromisso_ip" TEXT,
    "current_step" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "termo_compromisso_arquivo" TEXT,

    CONSTRAINT "agendamentos_rascunhos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authorization_logs" (
    "id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "authorized_by" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "doc_type" TEXT NOT NULL,
    "details" TEXT,

    CONSTRAINT "authorization_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "visitors_cpf_key" ON "visitors"("cpf");

-- CreateIndex
CREATE INDEX "visitors_cpf_idx" ON "visitors"("cpf");

-- CreateIndex
CREATE INDEX "visitors_email_idx" ON "visitors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_auth_uid_key" ON "usuarios"("auth_uid");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_espaco_id_idx" ON "usuarios"("espaco_id");

-- CreateIndex
CREATE INDEX "usuarios_perfil_idx" ON "usuarios"("perfil");

-- CreateIndex
CREATE INDEX "usuarios_ativo_idx" ON "usuarios"("ativo");

-- CreateIndex
CREATE INDEX "visits_visitor_id_idx" ON "visits"("visitor_id");

-- CreateIndex
CREATE INDEX "visits_espaco_id_idx" ON "visits"("espaco_id");

-- CreateIndex
CREATE INDEX "visits_checkin_idx" ON "visits"("checkin");

-- CreateIndex
CREATE INDEX "visits_status_idx" ON "visits"("status");

-- CreateIndex
CREATE INDEX "computadores_espaco_id_idx" ON "computadores"("espaco_id");

-- CreateIndex
CREATE INDEX "computadores_status_idx" ON "computadores"("status");

-- CreateIndex
CREATE UNIQUE INDEX "computadores_espaco_id_numero_key" ON "computadores"("espaco_id", "numero");

-- CreateIndex
CREATE INDEX "agendamentos_espaco_id_idx" ON "agendamentos"("espaco_id");

-- CreateIndex
CREATE INDEX "agendamentos_status_idx" ON "agendamentos"("status");

-- CreateIndex
CREATE INDEX "agendamentos_data_pretendida_idx" ON "agendamentos"("data_pretendida");

-- CreateIndex
CREATE INDEX "agendamentos_solicitante_email_idx" ON "agendamentos"("solicitante_email");

-- CreateIndex
CREATE INDEX "assinaturas_digitais_cpf_assinante_idx" ON "assinaturas_digitais"("cpf_assinante");

-- CreateIndex
CREATE INDEX "assinaturas_digitais_visitor_id_idx" ON "assinaturas_digitais"("visitor_id");

-- CreateIndex
CREATE INDEX "assinaturas_digitais_data_hora_idx" ON "assinaturas_digitais"("data_hora");

-- CreateIndex
CREATE INDEX "auditoria_usuario_idx" ON "auditoria"("usuario");

-- CreateIndex
CREATE INDEX "auditoria_acao_idx" ON "auditoria"("acao");

-- CreateIndex
CREATE INDEX "auditoria_created_at_idx" ON "auditoria"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "agendamentos_rascunhos_session_id_key" ON "agendamentos_rascunhos"("session_id");

-- CreateIndex
CREATE INDEX "agendamentos_rascunhos_session_id_idx" ON "agendamentos_rascunhos"("session_id");

-- CreateIndex
CREATE INDEX "authorization_logs_visitor_id_idx" ON "authorization_logs"("visitor_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_espaco_id_fkey" FOREIGN KEY ("espaco_id") REFERENCES "espacos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_espaco_id_fkey" FOREIGN KEY ("espaco_id") REFERENCES "espacos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "computadores" ADD CONSTRAINT "computadores_espaco_id_fkey" FOREIGN KEY ("espaco_id") REFERENCES "espacos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lockers" ADD CONSTRAINT "lockers_espaco_id_fkey" FOREIGN KEY ("espaco_id") REFERENCES "espacos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lockers" ADD CONSTRAINT "lockers_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_espaco_id_fkey" FOREIGN KEY ("espaco_id") REFERENCES "espacos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authorization_logs" ADD CONSTRAINT "authorization_logs_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

