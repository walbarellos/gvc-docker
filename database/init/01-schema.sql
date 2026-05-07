-- ====================================================================
-- GVC - Schema Principal (sem RLS do Supabase)
-- ====================================================================

-- EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- TABELAS
-- ====================================================================

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

CREATE TABLE IF NOT EXISTS lockers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INTEGER NOT NULL,
    status TEXT DEFAULT 'available',
    visitor_id UUID REFERENCES visitors(id),
    visitor_name TEXT,
    espaco_id UUID REFERENCES espacos(id),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario TEXT NOT NULL,
    perfil TEXT DEFAULT 'desconhecido',
    acao TEXT NOT NULL,
    detalhes TEXT,
    entidade_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS configuracoes (
    id TEXT PRIMARY KEY DEFAULT 'sistema',
    institution_name TEXT,
    data JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS documentos_agendamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
    nome_arquivo TEXT NOT NULL,
    url_arquivo TEXT NOT NULL,
    tipo_documento TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

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
-- FUNÇÕES
-- ====================================================================
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

CREATE OR REPLACE FUNCTION update_agendamento_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- ====================================================================
-- TRIGGERS
-- ====================================================================
CREATE TRIGGER trigger_update_agendamento_updated_at BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION update_agendamento_updated_at();
CREATE TRIGGER trigger_log_agendamento_audit AFTER UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION log_agendamento_audit();
