/**
 * PATCH problema-18 — schemas adicionais para rotas que ainda usam `as any`
 * Anexar ao final de backend/src/schemas/index.ts (ou importar deste módulo).
 */

import { z } from 'zod';

// ---- Query params comuns ----
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(20).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  espaco_id: z.string().uuid().optional(),
  espacoId: z.string().uuid().optional(),
  status: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

// ---- Login (já existe loginSchema; reforço) ----
export const loginBodySchema = z
  .object({
    email: z.string().email(),
    senha: z.string().min(1),
  })
  .strict();

// ---- User create/update com whitelist ----
export const createUserBodySchema = z
  .object({
    nome: z.string().min(3).max(200),
    email: z.string().email(),
    senha: z.string().min(8).max(128),
    perfil: z.enum(['administrador', 'coordenador', 'funcionario', 'monitor', 'cidadao']),
    espacoId: z.string().uuid().nullable().optional(),
    espaco_id: z.string().uuid().nullable().optional(),
    espacoNome: z.string().max(200).nullable().optional(),
    espaco_nome: z.string().max(200).nullable().optional(),
    ativo: z.boolean().optional(),
  })
  .strict();

// ---- Locker ----
export const createLockerBodySchema = z
  .object({
    number: z.union([z.string().min(1), z.number().int()]),
    status: z.enum(['Livre', 'Ocupado', 'Manutencao', 'livre', 'ocupado', 'manutencao', 'available', 'occupied']).optional(),
    espaco_id: z.string().uuid().optional(),
    espacoId: z.string().uuid().optional(),
    visitor_id: z.string().uuid().nullable().optional(),
    visitorId: z.string().uuid().nullable().optional(),
    visitor_name: z.string().max(200).nullable().optional(),
    visitorName: z.string().max(200).nullable().optional(),
  })
  .strict()
  .refine((d) => !!(d.espaco_id || d.espacoId), { message: 'Espaço é obrigatório' });

export const updateLockerBodySchema = z
  .object({
    number: z.union([z.string().min(1), z.number().int()]).optional(),
    status: z.enum(['Livre', 'Ocupado', 'Manutencao', 'livre', 'ocupado', 'manutencao', 'available', 'occupied']).optional(),
    espaco_id: z.string().uuid().optional(),
    espacoId: z.string().uuid().optional(),
    visitor_id: z.string().uuid().nullable().optional(),
    visitorId: z.string().uuid().nullable().optional(),
    visitor_name: z.string().max(200).nullable().optional(),
    visitorName: z.string().max(200).nullable().optional(),
  })
  .strict();

// ---- Computador (campos reais do Prisma: numero Int) ----
export const createComputadorBodySchema = z
  .object({
    numero: z.coerce.number().int().min(1),
    number: z.coerce.number().int().min(1).optional(),
    status: z.string().optional(),
    espaco_id: z.string().uuid().nullable().optional(),
    espacoId: z.string().uuid().nullable().optional(),
    espacoNome: z.string().max(200).nullable().optional(),
    usuario_id: z.string().uuid().nullable().optional(),
    usuarioId: z.string().uuid().nullable().optional(),
    usuario_nome: z.string().max(200).nullable().optional(),
    usuarioNome: z.string().max(200).nullable().optional(),
    horarioInicio: z.string().datetime({ offset: true }).nullable().optional(),
    horarioLimite: z.string().datetime({ offset: true }).nullable().optional(),
  })
  .strict()
  .refine((d) => !!(d.numero || d.number), { message: 'Número do computador é obrigatório' });

export const updateComputadorBodySchema = z
  .object({
    numero: z.coerce.number().int().min(1).optional(),
    number: z.coerce.number().int().min(1).optional(),
    status: z.string().optional(),
    espaco_id: z.string().uuid().nullable().optional(),
    espacoId: z.string().uuid().nullable().optional(),
    espacoNome: z.string().max(200).nullable().optional(),
    usuario_id: z.string().uuid().nullable().optional(),
    usuarioId: z.string().uuid().nullable().optional(),
    usuario_nome: z.string().max(200).nullable().optional(),
    usuarioNome: z.string().max(200).nullable().optional(),
    horarioInicio: z.string().datetime({ offset: true }).nullable().optional(),
    horarioLimite: z.string().datetime({ offset: true }).nullable().optional(),
  })
  .strict();

// ---- Check-in ----
export const checkinBodySchema = z
  .object({
    visitorId: z.string().uuid().optional(),
    visitor_id: z.string().uuid().optional(),
    espacoId: z.string().uuid().optional(),
    espaco_id: z.string().uuid().optional(),
    perfil: z.string().max(50).optional(),
    responsibleAccompanied: z.boolean().optional(),
    responsible_accompanied: z.boolean().optional(),
    nome: z.string().max(200).optional(),
  })
  .strict()
  .refine((d) => !!(d.visitorId || d.visitor_id), { message: 'visitorId obrigatório' });

// ---- Agendamento status ----
export const agendamentoStatusBodySchema = z
  .object({
    status: z.enum(['aprovado', 'rejeitado', 'cancelado', 'confirmado', 'concluido', 'pendente']),
    respostaCoordenador: z.string().max(2000).optional(),
    resposta_coordenador: z.string().max(2000).optional(),
  })
  .strict();

// ---- Aprovação (somente resposta) ----
export const aprovacaoBodySchema = z
  .object({
    resposta: z.string().max(2000).optional(),
  })
  .strict();

// ---- Rascunho de agendamento ----
export const rascunhoBodySchema = z
  .object({
    sessionId: z.string().uuid().optional(),
    session_id: z.string().uuid().optional(),
    data: z.record(z.string(), z.unknown()),
  })
  .strict()
  .refine((v) => !!v.sessionId || !!v.session_id, { message: 'sessionId obrigatório' });

// ---- Espaço (front envia números como string → coerce) ----
export const createEspacoBodySchema = z
  .object({
    nome: z.string().min(1).max(200).optional(),
    name: z.string().min(1).max(200).optional(),
    email: z.string().email().max(200).nullable().optional(),
    endereco: z.string().max(500).nullable().optional(),
    municipio: z.string().max(200).nullable().optional(),
    horario_funcionamento: z.string().max(200).nullable().optional(),
    horarioFuncionamento: z.string().max(200).nullable().optional(),
    mensagem_boas_vindas: z.string().max(2000).nullable().optional(),
    mensagemBoasVindas: z.string().max(2000).nullable().optional(),
    capacidade_visitantes: z.coerce.number().int().min(0).nullable().optional(),
    capacidadeVisitantes: z.coerce.number().int().min(0).nullable().optional(),
    ativo: z.boolean().optional(),
    perfil_armarios: z.boolean().optional(),
    perfilArmarios: z.boolean().optional(),
    perfil_telecentro: z.boolean().optional(),
    perfilTelecentro: z.boolean().optional(),
    perfil_agendamento: z.boolean().optional(),
    perfilAgendamento: z.boolean().optional(),
    total_armarios: z.coerce.number().int().min(0).nullable().optional(),
    totalArmarios: z.coerce.number().int().min(0).nullable().optional(),
    total_computadores: z.coerce.number().int().min(0).nullable().optional(),
    totalComputadores: z.coerce.number().int().min(0).nullable().optional(),
    tempo_limite_computador: z.coerce.number().int().min(0).nullable().optional(),
    tempoLimiteComputador: z.coerce.number().int().min(0).nullable().optional(),
    capacidade_agendamento: z.coerce.number().int().min(0).nullable().optional(),
    capacidadeAgendamento: z.coerce.number().int().min(0).nullable().optional(),
    tempo_limite_excedido: z.coerce.number().int().min(0).nullable().optional(),
    tempoLimiteExcedido: z.coerce.number().int().min(0).nullable().optional(),
    has_auditorio: z.boolean().optional(),
    hasAuditorio: z.boolean().optional(),
    qtd_auditorio: z.coerce.number().int().min(0).nullable().optional(),
    qtdAuditorio: z.coerce.number().int().min(0).nullable().optional(),
    has_sala_estudos: z.boolean().optional(),
    hasSalaEstudos: z.boolean().optional(),
    qtd_sala_estudos: z.coerce.number().int().min(0).nullable().optional(),
    qtdSalaEstudos: z.coerce.number().int().min(0).nullable().optional(),
    has_teatro: z.boolean().optional(),
    hasTeatro: z.boolean().optional(),
    qtd_teatro: z.coerce.number().int().min(0).nullable().optional(),
    qtdTeatro: z.coerce.number().int().min(0).nullable().optional(),
    has_filmoteca: z.boolean().optional(),
    hasFilmoteca: z.boolean().optional(),
    qtd_filmoteca: z.coerce.number().int().min(0).nullable().optional(),
    qtdFilmoteca: z.coerce.number().int().min(0).nullable().optional(),
  })
  .passthrough(); // mapper já filtra; validação de tipos sem rejeitar extras

export const updateEspacoBodySchema = createEspacoBodySchema.partial();

// ---- Auditoria (log sem auth — validação de tipos) ----
export const auditoriaBodySchema = z
  .object({
    usuario: z.string().max(200).optional(),
    perfil: z.string().max(50).nullable().optional(),
    acao: z.string().max(300).optional(),
    detalhes: z.unknown().nullable().optional(),
    entidade_id: z.string().max(100).nullable().optional(),
    entidadeId: z.string().max(100).nullable().optional(),
    createdAt: z.string().optional(),
  })
  .passthrough();

// ---- Visitor (payload real do front: snake_case + strings flexíveis) ----
export const createVisitorBodySchema = z
  .object({
    full_name: z.string().min(3).max(200),
    cpf: z.string().min(11).max(14).optional(),
    passport: z.string().max(50).optional(),
    is_foreigner: z.boolean().optional(),
    gender: z.string().max(50).optional(),
    category: z.string().max(100).optional(),
    phone: z.string().max(30).optional(),
    email: z.string().email().max(200).optional().or(z.literal('')),
    address: z.string().max(500).optional(),
  })
  .passthrough()
  .refine((d) => !!(d.cpf || d.passport), { message: 'CPF ou passaporte é obrigatório' });

export const updateVisitorBodySchema = z
  .object({
    full_name: z.string().min(3).max(200).optional(),
    cpf: z.string().min(11).max(14).optional(),
    passport: z.string().max(50).optional(),
    is_foreigner: z.boolean().optional(),
    gender: z.string().max(50).optional(),
    category: z.string().max(100).optional(),
    phone: z.string().max(30).optional(),
    email: z.string().email().max(200).optional().or(z.literal('')),
    address: z.string().max(500).optional(),
  })
  .passthrough();

// ---- Alocar locker ----
export const alocarLockerBodySchema = z
  .object({
    numero: z.coerce.number().int().min(1),
    visitorId: z.string().uuid().optional(),
    visitor_id: z.string().uuid().optional(),
    espacoId: z.string().uuid(),
    espaco_id: z.string().uuid(),
  })
  .strict()
  .refine((d) => !!(d.espacoId || d.espaco_id), { message: 'Espaço é obrigatório' });

// ---- User update (payload real do front: camel+snake, espacoNome) ----
export const updateUserBodySchema = z
  .object({
    nome: z.string().min(3).max(200).optional(),
    email: z.string().email().max(200).optional(),
    senha: z.string().min(6).max(128).optional(),
    perfil: z.enum(['administrador', 'coordenador', 'operador', 'funcionario', 'monitor']).optional(),
    espacoId: z.string().uuid().nullable().optional(),
    espaco_id: z.string().uuid().nullable().optional(),
    espacoNome: z.string().max(200).nullable().optional(),
    espaco_nome: z.string().max(200).nullable().optional(),
    ativo: z.boolean().optional(),
  })
  .passthrough();

// ---- Config (campos reais: institution_name, data) ----
export const configuracaoBodySchema = z
  .object({
    id: z.string().min(1).optional(),
    institution_name: z.string().max(200).optional(),
    institutionName: z.string().max(200).optional(),
    data: z.unknown().optional(),
  })
  .strict();

// ---- Assinatura (campos obrigatórios do Prisma) ----
export const createAssinaturaBodySchema = z
  .object({
    nomeAssinante: z.string().min(3),
    nome_assinante: z.string().min(3).optional(),
    cpfAssinante: z.string().min(11),
    cpf_assinante: z.string().min(11).optional(),
    tipoDocumento: z.string().min(1),
    tipo_documento: z.string().min(1).optional(),
    documentoId: z.string().optional(),
    documento_id: z.string().optional(),
    documentoHash: z.string().min(1),
    documento_hash: z.string().min(1).optional(),
    ipPublico: z.string().min(1),
    ip_publico: z.string().min(1).optional(),
    userAgent: z.string().max(500).optional(),
    user_agent: z.string().max(500).optional(),
  })
  .strict()
  .refine((d) => {
    const nome = d.nomeAssinante ?? d.nome_assinante;
    const cpf = d.cpfAssinante ?? d.cpf_assinante;
    const tipo = d.tipoDocumento ?? d.tipo_documento;
    const hash = d.documentoHash ?? d.documento_hash;
    const ip = d.ipPublico ?? d.ip_publico;
    return !!(nome && cpf && tipo && hash && ip);
  }, { message: 'nomeAssinante, cpfAssinante, tipoDocumento, documentoHash e ipPublico são obrigatórios' });
