-- ====================================================================
-- SCHEMA FINAL CONSOLIDADO - GVC (Gestão de Visitantes Culturais)
-- ====================================================================
-- Gerado automaticamente a partir dos arquivos SQL do projeto
-- Data: 2026-05-13
-- ====================================================================

-- ====================================================================
-- 1. ENUMS
-- ====================================================================
CREATE TYPE IF NOT EXISTS public."PerfilUsuario" AS ENUM ('cidadao', 'monitor', 'funcionario', 'coordenador', 'administrador');
CREATE TYPE IF NOT EXISTS public."ComputadorStatus" AS ENUM ('Livre', 'EmUso', 'Manutencao');
CREATE TYPE IF NOT EXISTS public."LockerStatus" AS ENUM ('available', 'occupied', 'maintenance');
CREATE TYPE IF NOT EXISTS public."AgendamentoStatus" AS ENUM ('pendente', 'confirmado', 'aprovado', 'rejeitado', 'cancelado', 'concluido');
CREATE TYPE IF NOT EXISTS public."Gender" AS ENUM ('masculino', 'feminino', 'outro', 'nao_informar');
CREATE TYPE IF NOT EXISTS public."VisitStatus" AS ENUM ('ativo', 'finalizado', 'cancelado');

-- ====================================================================
-- 2. TABLES
-- ====================================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Visitantes
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    cpf TEXT,
    passport TEXT,
    is_foreigner BOOLEAN DEFAULT false,
    gender TEXT DEFAULT 'masculino',
    birth_date DATE,
    email TEXT,
    phone TEXT,
    address TEXT,
    category TEXT DEFAULT 'general',
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Espaços
CREATE TABLE IF NOT EXISTS espacos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT,
    endereco TEXT,
    municipio TEXT,
    horario_funcionamento TEXT DEFAULT 'Seg-Sex: 8h-18h, Sáb: 8h-12h',
    capacidade_visitantes INTEGER DEFAULT 100,
    mensagem_boas_vindas TEXT,
    tempo_limite_excedido INTEGER DEFAULT 4,
    ativo BOOLEAN DEFAULT true,
    perfil_armarios BOOLEAN DEFAULT true,
    perfil_telecentro BOOLEAN DEFAULT false,
    perfil_agendamento BOOLEAN DEFAULT false,
    total_armarios INTEGER DEFAULT 20,
    total_computadores INTEGER DEFAULT 10,
    tempo_limite_computador INTEGER DEFAULT 20,
    capacidade_agendamento INTEGER DEFAULT 0,
    has_auditorio BOOLEAN DEFAULT false,
    qtd_auditorio INTEGER DEFAULT 0,
    has_sala_estudos BOOLEAN DEFAULT false,
    qtd_sala_estudos INTEGER DEFAULT 0,
    has_teatro BOOLEAN DEFAULT false,
    qtd_teatro INTEGER DEFAULT 0,
    has_filmoteca BOOLEAN DEFAULT false,
    qtd_filmoteca INTEGER DEFAULT 0,
    has_espaco_aberto BOOLEAN DEFAULT false,
    qtd_espaco_aberto INTEGER DEFAULT 0,
    has_visita_guiada BOOLEAN DEFAULT false,
    qtd_visita_guiada INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_uid UUID,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT,
    perfil TEXT NOT NULL,
    espaco_id UUID REFERENCES espacos(id),
    espaco_nome TEXT DEFAULT 'Todos os Espaços',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Visitas
CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID REFERENCES visitors(id),
    nome TEXT NOT NULL,
    perfil TEXT DEFAULT 'general',
    local TEXT DEFAULT 'Entrada Principal',
    espaco_id UUID REFERENCES espacos(id),
    checkin TIMESTAMPTZ DEFAULT now(),
    checkout TIMESTAMPTZ,
    status TEXT DEFAULT 'Ativo',
    armario TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Computadores
CREATE TABLE IF NOT EXISTS computadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero INTEGER NOT NULL,
    status TEXT DEFAULT 'Livre',
    usuario_id UUID,
    usuario_nome TEXT,
    horario_inicio TIMESTAMPTZ,
    horario_limite TIMESTAMPTZ,
    espaco_id UUID REFERENCES espacos(id),
    espaco_nome TEXT
);

-- Armários (Lockers)
CREATE TABLE IF NOT EXISTS lockers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INTEGER NOT NULL,
    status TEXT DEFAULT 'available',
    visitor_id UUID REFERENCES visitors(id),
    visitor_name TEXT,
    espaco_id UUID REFERENCES espacos(id),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auditoria
CREATE TABLE IF NOT EXISTS auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario TEXT NOT NULL,
    perfil TEXT DEFAULT 'desconhecido',
    acao TEXT NOT NULL,
    detalhes TEXT,
    entidade_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Configurações
CREATE TABLE IF NOT EXISTS configuracoes (
    id TEXT PRIMARY KEY DEFAULT 'sistema',
    institution_name TEXT,
    data JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    espaco_id UUID REFERENCES espacos(id),
    solicitante_nome TEXT NOT NULL,
    solicitante_email TEXT NOT NULL,
    solicitante_telefone TEXT NOT NULL,
    solicitante_documento TEXT,
    tipo_solicitante TEXT NOT NULL,
    tipo_espaco TEXT NOT NULL,
    espaco_solicitado TEXT NOT NULL,
    data_pretendida DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    numero_participantes INTEGER NOT NULL,
    descricao_evento TEXT NOT NULL,
    natureza_evento TEXT NOT NULL,
    gratuito BOOLEAN DEFAULT true,
    valor_ingresso NUMERIC,
    necessita_equipamentos TEXT,
    observacoes TEXT,
    status TEXT DEFAULT 'pendente',
    termo_aceito BOOLEAN DEFAULT false,
    termo_aceito_em TIMESTAMP,
    responsabhilidade_evento BOOLEAN DEFAULT false,
    danos_patrimonio BOOLEAN DEFAULT false,
    respeito_lotacao BOOLEAN DEFAULT false,
    autorizo_divulgacao BOOLEAN DEFAULT false,
    documento_anexo_url TEXT,
    resposta_coordenador TEXT,
    coordenador_id UUID,
    respondido_em TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    termo_compromisso_assinado BOOLEAN DEFAULT false,
    termo_compromisso_data TIMESTAMP,
    termo_compromisso_ip TEXT,
    razao_social TEXT,
    nome_instituicao TEXT,
    secretaria_governo TEXT,
    unidade_governo TEXT,
    assinatura_id TEXT,
    ip_confirmacao TEXT,
    user_agent TEXT
);

-- Agendamentos Rascunho
CREATE TABLE IF NOT EXISTS agendamentos_rascunho (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    solicitante_nome TEXT,
    solicitante_email TEXT,
    solicitante_telefone TEXT,
    solicitante_documento TEXT,
    tipo_solicitante TEXT,
    razao_social TEXT,
    nome_instituicao TEXT,
    secretaria_governo TEXT,
    unidade_governo TEXT,
    espaco_id UUID,
    tipo_espaco TEXT,
    espaco_solicitado TEXT,
    data_pretendida TEXT,
    horario_inicio TEXT,
    horario_fim TEXT,
    numero_participantes INTEGER,
    descricao_evento TEXT,
    natureza_evento TEXT,
    gratuito BOOLEAN DEFAULT true,
    valor_ingresso TEXT,
    necessita_equipamentos TEXT,
    observacoes TEXT,
    termo_aceito BOOLEAN DEFAULT false,
    responsabhilidade_evento BOOLEAN DEFAULT false,
    danos_patrimonio BOOLEAN DEFAULT false,
    respeito_lotacao BOOLEAN DEFAULT false,
    autorizo_divulgacao BOOLEAN DEFAULT false,
    termo_compromisso_assinado BOOLEAN DEFAULT false,
    termo_compromisso_data TIMESTAMP,
    termo_compromisso_ip TEXT,
    current_step INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Documentos de Agendamento
CREATE TABLE IF NOT EXISTS documentos_agendamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
    nome_arquivo TEXT NOT NULL,
    url_arquivo TEXT NOT NULL,
    tipo_documento TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Log de Agendamentos
CREATE TABLE IF NOT EXISTS log_agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID,
    acao TEXT NOT NULL,
    usuario_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Assinaturas Digitais
CREATE TABLE IF NOT EXISTS assinaturas_digitais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID REFERENCES visitors(id),
    nome_assinante VARCHAR(255) NOT NULL,
    cpf_assinante VARCHAR(14) NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL,
    documento_id UUID,
    documento_hash TEXT NOT NULL,
    data_hora TIMESTAMPTZ DEFAULT now(),
    data_hora_brasilia VARCHAR(50),
    ip_publico VARCHAR(45) NOT NULL,
    user_agent TEXT,
    browser_fingerprint JSONB,
    cpf_validado BOOLEAN DEFAULT false,
    cpf_status VARCHAR(50),
    termo_conteudo TEXT,
    termo_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 3. ALTERS (colunas, constraints, indexes)
-- ====================================================================

-- Alterar coluna status da tabela visits para usar o enum VisitStatus
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'visits'
        AND column_name = 'status'
        AND data_type = 'text'
    ) THEN
        ALTER TABLE visits ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE visits ALTER COLUMN status TYPE public."VisitStatus" USING status::text::public."VisitStatus";
        ALTER TABLE visits ALTER COLUMN status SET DEFAULT 'ativo';
    END IF;
END
$$;

-- Alterar coluna status da tabela agendamentos para usar o enum AgendamentoStatus
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agendamentos'
        AND column_name = 'status'
        AND data_type = 'text'
    ) THEN
        ALTER TABLE agendamentos ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE agendamentos ALTER COLUMN status TYPE public."AgendamentoStatus" USING status::text::public."AgendamentoStatus";
        ALTER TABLE agendamentos ALTER COLUMN status SET DEFAULT 'pendente';
    END IF;
END
$$;

-- ====================================================================
-- ÍNDICES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_agendamentos_espaco_id ON agendamentos(espaco_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_pretendida ON agendamentos(data_pretendida);
CREATE INDEX IF NOT EXISTS idx_agendamentos_solicitante_email ON agendamentos(solicitante_email);
CREATE INDEX IF NOT EXISTS idx_agendamentos_created_at ON agendamentos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_visitor_id ON visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visits_espaco_id ON visits(espaco_id);
CREATE INDEX IF NOT EXISTS idx_visits_checkin ON visits(checkin DESC);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visitors_cpf ON visitors(cpf);
CREATE INDEX IF NOT EXISTS idx_visitors_email ON visitors(email);
CREATE INDEX IF NOT EXISTS idx_espacos_ativo ON espacos(ativo);
CREATE INDEX IF NOT EXISTS idx_espacos_perfil_agendamento ON espacos(perfil_agendamento);
CREATE INDEX IF NOT EXISTS idx_lockers_espaco_id ON lockers(espaco_id);
CREATE INDEX IF NOT EXISTS idx_lockers_status ON lockers(status);
CREATE INDEX IF NOT EXISTS idx_computadores_espaco_id ON computadores(espaco_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_cpf ON assinaturas_digitais(cpf_assinante);
CREATE INDEX IF NOT EXISTS idx_assinaturas_data ON assinaturas_digitais(data_hora);
CREATE INDEX IF NOT EXISTS idx_assinaturas_hash ON assinaturas_digitais(documento_hash);

-- ====================================================================
-- 4. FUNÇÕES E TRIGGERS
-- ====================================================================

-- Função para verificar conflito de agendamento
CREATE OR REPLACE FUNCTION verificar_conflito_agendamento(
    p_espaco_id UUID, p_data DATE, p_inicio TIME, p_fim TIME, p_exclude_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_conflito INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_conflito
    FROM agendamentos
    WHERE espaco_id = p_espaco_id
        AND data_pretendida = p_data
        AND status NOT IN ('rejeitado', 'cancelado')
        AND (horario_inicio, horario_fim) OVERLAPS (p_inicio, p_fim)
        AND (p_exclude_id IS NULL OR id != p_exclude_id);
    RETURN v_conflito > 0;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_agendamento_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para log de auditoria de agendamentos
CREATE OR REPLACE FUNCTION log_agendamento_audit()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO log_agendamentos (agendamento_id, acao, usuario_id, dados_anteriores, dados_novos)
        VALUES (NEW.id,
            CASE NEW.status
                WHEN 'aprovado' THEN 'aprovacao'
                WHEN 'rejeitado' THEN 'rejeicao'
                WHEN 'cancelado' THEN 'cancelamento'
                ELSE 'atualizacao'
            END,
            NEW.coordenador_id, to_jsonb(OLD), to_jsonb(NEW));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers (drop e recreate para evitar erros)
DROP TRIGGER IF EXISTS trigger_update_agendamento_updated_at ON agendamentos;
CREATE TRIGGER trigger_update_agendamento_updated_at BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION update_agendamento_updated_at();

DROP TRIGGER IF EXISTS trigger_log_agendamento_audit ON agendamentos;
CREATE TRIGGER trigger_log_agendamento_audit AFTER UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION log_agendamento_audit();