import { parseDate } from './dateUtils.js';

export interface FieldMappingConfig {
  [key: string]: {
    target: string;
    type?: 'string' | 'number' | 'boolean' | 'date' | 'dateArray';
    required?: boolean;
    transform?: (value: any) => any;
  };
}

const defaultConfig: FieldMappingConfig = {
  id: { target: 'id' },
  nome: { target: 'nome' },
  name: { target: 'nome' },
  email: { target: 'email' },
  telefone: { target: 'telefone' },
  documento: { target: 'documento' },
  status: { target: 'status' },
  ativo: { target: 'ativo', type: 'boolean' },
  descricao: { target: 'descricao' },
  observacoes: { target: 'observacoes' },
};

export function mapFields(data: any, config: FieldMappingConfig = defaultConfig): any {
  if (!data) return data;
  const mapped: any = {};
  
  for (const [sourceKey, mapping] of Object.entries(config)) {
    if (data[sourceKey] !== undefined) {
      let value = data[sourceKey];
      
      if (mapping.type === 'boolean' && typeof value === 'string') {
        value = value === 'true';
      } else if (mapping.type === 'number') {
        value = parseFloat(value) || 0;
      } else if (mapping.type === 'date' || mapping.type === 'dateArray') {
        const parsed = parseDate(value);
        value = parsed || null;
      } else if (mapping.transform) {
        value = mapping.transform(value);
      }
      
      mapped[mapping.target] = mapping.required && !value ? null : value;
    }
  }
  
  return mapped;
}

export function mapVisitorFields(data: any): any {
  if (!data) return data;
  const mapped: any = {};
  
  if (data.full_name !== undefined) mapped.fullName = data.full_name || '';
  if (data.fullName !== undefined) mapped.fullName = data.fullName || '';
  if (data.cpf !== undefined) mapped.cpf = data.cpf || null;
  if (data.passport !== undefined) mapped.passport = data.passport || null;
  if (data.is_foreigner !== undefined) mapped.isForeigner = data.is_foreigner;
  if (data.isForeigner !== undefined) mapped.isForeigner = data.isForeigner;
  if (data.gender !== undefined) mapped.gender = data.gender || null;
  
  const birthDate = data.birth_date !== undefined ? data.birth_date : data.birthDate;
  if (birthDate) {
    const parsed = parseDate(birthDate);
    if (parsed) mapped.birthDate = parsed;
  }
  
  if (data.email !== undefined) mapped.email = data.email || null;
  if (data.phone !== undefined) mapped.phone = data.phone || null;
  if (data.address !== undefined) mapped.address = data.address || null;
  if (data.category !== undefined) mapped.category = data.category || null;
  if (data.photo_url !== undefined) mapped.photoUrl = data.photo_url || null;
  if (data.photoUrl !== undefined) mapped.photoUrl = data.photoUrl || null;
  
  return mapped;
}

export function mapAgendamentoFields(data: any): any {
  if (!data) return data;
  const mapped: any = {};
  
  if (data.espacoId !== undefined) mapped.espacoId = data.espacoId || null;
  if (data.espaco_id !== undefined) mapped.espacoId = data.espaco_id || null;
  
  if (data.solicitante_nome !== undefined) mapped.solicitante_nome = data.solicitante_nome || '';
  if (data.solicitanteNome !== undefined) mapped.solicitante_nome = data.solicitanteNome || '';
  
  if (data.solicitante_email !== undefined) mapped.solicitante_email = data.solicitante_email || '';
  if (data.solicitanteEmail !== undefined) mapped.solicitante_email = data.solicitanteEmail || '';
  
  if (data.solicitante_telefone !== undefined) mapped.solicitante_telefone = data.solicitante_telefone || '';
  if (data.solicitanteTelefone !== undefined) mapped.solicitante_telefone = data.solicitanteTelefone || '';
  
  if (data.solicitante_documento !== undefined) mapped.solicitante_documento = data.solicitante_documento || null;
  if (data.solicitanteDocumento !== undefined) mapped.solicitante_documento = data.solicitanteDocumento || null;
  
  if (data.tipo_solicitante !== undefined) mapped.tipo_solicitante = data.tipo_solicitante || '';
  if (data.tipoSolicitante !== undefined) mapped.tipo_solicitante = data.tipoSolicitante || '';
  
  if (data.tipo_espaco !== undefined) mapped.tipo_espaco = data.tipo_espaco || '';
  if (data.tipoEspaco !== undefined) mapped.tipo_espaco = data.tipoEspaco || '';
  
  if (data.espaco_solicitado !== undefined) mapped.espaco_solicitado = data.espaco_solicitado || '';
  if (data.espacoSolicitado !== undefined) mapped.espaco_solicitado = data.espacoSolicitado || '';
  
  const data_pretendida = data.data_pretendida || data.dataPretendida;
  if (data_pretendida) {
    const parsed = parseDate(data_pretendida);
    if (parsed) mapped.data_pretendida = parsed;
  }
  
  const horario_inicio = data.horario_inicio || data.horarioInicio;
  if (horario_inicio) {
    const parsed = parseDate(horario_inicio);
    if (parsed) mapped.horario_inicio = parsed;
  }
  
  const horario_fim = data.horario_fim || data.horarioFim;
  if (horario_fim) {
    const parsed = parseDate(horario_fim);
    if (parsed) mapped.horario_fim = parsed;
  }
  
  if (data.numero_participantes !== undefined) mapped.numero_participantes = parseInt(data.numero_participantes) || 0;
  if (data.numeroParticipantes !== undefined) mapped.numero_participantes = parseInt(data.numeroParticipantes) || 0;
  
  if (data.descricao_evento !== undefined) mapped.descricao_evento = data.descricao_evento || '';
  if (data.descricaoEvento !== undefined) mapped.descricao_evento = data.descricaoEvento || '';
  
  if (data.natureza_evento !== undefined) mapped.natureza_evento = data.natureza_evento || '';
  if (data.naturezaEvento !== undefined) mapped.natureza_evento = data.naturezaEvento || '';
  
  if (data.gratuito !== undefined) mapped.gratuito = data.gratuito;
  if (data.gratuito !== undefined && typeof data.gratuito === 'string') {
    mapped.gratuito = data.gratuito === 'true';
  }
  
  if (data.valor_ingresso !== undefined) mapped.valor_ingresso = parseFloat(data.valor_ingresso) || null;
  if (data.valorIngresso !== undefined) mapped.valor_ingresso = parseFloat(data.valorIngresso) || null;
  
  if (data.necessita_equipamentos !== undefined) mapped.necessita_equipamentos = data.necessita_equipamentos || null;
  if (data.necessitaEquipamentos !== undefined) mapped.necessita_equipamentos = data.necessitaEquipamentos || null;
  
  if (data.observacoes !== undefined) mapped.observacoes = data.observacoes || null;
  
  if (data.termo_aceito !== undefined) mapped.termo_aceito = data.termo_aceito;
  if (data.termoAceito !== undefined) mapped.termo_aceito = data.termoAceito;
  
  const termo_aceito_em = data.termo_aceito_em || data.termoAceitoEm;
  if (termo_aceito_em) {
    const parsed = parseDate(termo_aceito_em);
    if (parsed) mapped.termo_aceito_em = parsed;
  }
  
  if (data.responsabhilidade_evento !== undefined) mapped.responsabhilidade_evento = data.responsabhilidade_evento;
  if (data.responsabhilidadeEvento !== undefined) mapped.responsabhilidade_evento = data.responsabhilidadeEvento;
  
  if (data.danos_patrimonio !== undefined) mapped.danos_patrimonio = data.danos_patrimonio;
  if (data.danosPatrimonio !== undefined) mapped.danos_patrimonio = data.danosPatrimonio;
  
  if (data.respeito_lotacao !== undefined) mapped.respeito_lotacao = data.respeito_lotacao;
  if (data.respeitoLotacao !== undefined) mapped.respeito_lotacao = data.respeitoLotacao;
  
  if (data.autorizo_divulgacao !== undefined) mapped.autorizo_divulgacao = data.autorizo_divulgacao;
  if (data.autorizoDivulgacao !== undefined) mapped.autorizo_divulgacao = data.autorizoDivulgacao;
  
  if (data.documento_anexo_url !== undefined) mapped.documento_anexo_url = data.documento_anexo_url || null;
  if (data.documentoAnexoUrl !== undefined) mapped.documento_anexo_url = data.documentoAnexoUrl || null;
  
  if (data.status !== undefined) mapped.status = data.status || 'pendente';
  
  return mapped;
}

export function mapVisitFields(data: any): any {
  if (!data) return data;
  const mapped: any = {};
  
  if (data.visitorId !== undefined) mapped.visitorId = data.visitorId || null;
  if (data.visitor_id !== undefined) mapped.visitorId = data.visitor_id || null;
  if (data.espacoId !== undefined) mapped.espacoId = data.espacoId || null;
  if (data.espaco_id !== undefined) mapped.espacoId = data.espaco_id || null;
  if (data.nome !== undefined) mapped.nome = data.nome || '';
  if (data.perfil !== undefined) mapped.perfil = data.perfil || null;
  if (data.local !== undefined) mapped.local = data.local || null;
  if (data.status !== undefined) mapped.status = data.status || null;
  if (data.armario !== undefined) mapped.armario = data.armario || null;
  
  const checkin = data.checkin || data.checkIn;
  if (checkin) {
    const parsed = parseDate(checkin);
    if (parsed) mapped.checkin = parsed;
  }
  
  const checkout = data.checkout || data.checkOut;
  if (checkout) {
    const parsed = parseDate(checkout);
    if (parsed) mapped.checkout = parsed;
  }
  
  return mapped;
}

export function mapSpaceFields(data: any): any {
  if (!data) return data;
  const mapped: any = {};
  
  if (data.nome !== undefined) mapped.nome = data.nome || '';
  if (data.name !== undefined) mapped.nome = data.name || '';
  if (mapped.nome === '') mapped.nome = 'Espaço sem nome';
  if (data.email !== undefined) mapped.email = data.email || null;
  if (data.endereco !== undefined) mapped.endereco = data.endereco || null;
  if (data.municipio !== undefined) mapped.municipio = data.municipio || null;
  if (data.horario_funcionamento !== undefined) mapped.horario_funcionamento = data.horario_funcionamento || null;
  if (data.horarioFuncionamento !== undefined) mapped.horario_funcionamento = data.horarioFuncionamento || null;
  if (data.capacidade_visitantes !== undefined) mapped.capacidade_visitantes = parseInt(data.capacidade_visitantes) || null;
  if (data.capacidadeVisitantes !== undefined) mapped.capacidade_visitantes = parseInt(data.capacidadeVisitantes) || null;
  if (data.mensagem_boas_vindas !== undefined) mapped.mensagem_boas_vindas = data.mensagem_boas_vindas || null;
  if (data.mensagemBoasVindas !== undefined) mapped.mensagem_boas_vindas = data.mensagemBoasVindas || null;
  if (data.tempo_limite_excedido !== undefined) mapped.tempo_limite_excedido = parseInt(data.tempo_limite_excedido) || null;
  if (data.tempoLimiteExcedido !== undefined) mapped.tempo_limite_excedido = parseInt(data.tempoLimiteExcedido) || null;
  if (data.ativo !== undefined) mapped.ativo = data.ativo;
  if (data.perfil_armarios !== undefined) mapped.perfil_armarios = data.perfil_armarios;
  if (data.perfilArmarios !== undefined) mapped.perfil_armarios = data.perfilArmarios;
  if (data.perfil_telecentro !== undefined) mapped.perfil_telecentro = data.perfil_telecentro;
  if (data.perfilTelecentro !== undefined) mapped.perfil_telecentro = data.perfilTelecentro;
  if (data.perfil_agendamento !== undefined) mapped.perfil_agendamento = data.perfil_agendamento;
  if (data.perfilAgendamento !== undefined) mapped.perfil_agendamento = data.perfilAgendamento;
  if (data.total_armarios !== undefined) mapped.total_armarios = parseInt(data.total_armarios) || null;
  if (data.totalArmarios !== undefined) mapped.total_armarios = parseInt(data.totalArmarios) || null;
  if (data.total_computadores !== undefined) mapped.total_computadores = parseInt(data.total_computadores) || null;
  if (data.totalComputadores !== undefined) mapped.total_computadores = parseInt(data.totalComputadores) || null;
  if (data.tempo_limite_computador !== undefined) mapped.tempo_limite_computador = parseInt(data.tempo_limite_computador) || null;
  if (data.tempoLimiteComputador !== undefined) mapped.tempo_limite_computador = parseInt(data.tempoLimiteComputador) || null;
  if (data.capacidade_agendamento !== undefined) mapped.capacidade_agendamento = parseInt(data.capacidade_agendamento) || null;
  if (data.capacidadeAgendamento !== undefined) mapped.capacidade_agendamento = parseInt(data.capacidadeAgendamento) || null;
  if (data.has_auditorio !== undefined) mapped.has_auditorio = data.has_auditorio;
  if (data.hasAuditorio !== undefined) mapped.has_auditorio = data.hasAuditorio;
  if (data.qtd_auditorio !== undefined) mapped.qtd_auditorio = parseInt(data.qtd_auditorio) || null;
  if (data.qtdAuditorio !== undefined) mapped.qtd_auditorio = parseInt(data.qtdAuditorio) || null;
  if (data.has_sala_estudos !== undefined) mapped.has_sala_estudos = data.has_sala_estudos;
  if (data.hasSalaEstudos !== undefined) mapped.has_sala_estudos = data.hasSalaEstudos;
  if (data.qtd_sala_estudos !== undefined) mapped.qtd_sala_estudos = parseInt(data.qtd_sala_estudos) || null;
  if (data.qtdSalaEstudos !== undefined) mapped.qtd_sala_estudos = parseInt(data.qtdSalaEstudos) || null;
  if (data.has_teatro !== undefined) mapped.has_teatro = data.has_teatro;
  if (data.hasTeatro !== undefined) mapped.has_teatro = data.hasTeatro;
  if (data.qtd_teatro !== undefined) mapped.qtd_teatro = parseInt(data.qtd_teatro) || null;
  if (data.qtdTeatro !== undefined) mapped.qtd_teatro = parseInt(data.qtdTeatro) || null;
  if (data.has_filmoteca !== undefined) mapped.has_filmoteca = data.has_filmoteca;
  if (data.hasFilmoteca !== undefined) mapped.has_filmoteca = data.hasFilmoteca;
  if (data.qtd_filmoteca !== undefined) mapped.qtd_filmoteca = parseInt(data.qtd_filmoteca) || null;
  if (data.qtdFilmoteca !== undefined) mapped.qtd_filmoteca = parseInt(data.qtdFilmoteca) || null;
  if (data.has_espaco_aberto !== undefined) mapped.has_espaco_aberto = data.has_espaco_aberto;
  if (data.hasEspacoAberto !== undefined) mapped.has_espaco_aberto = data.hasEspacoAberto;
  if (data.qtd_espaco_aberto !== undefined) mapped.qtd_espaco_aberto = parseInt(data.qtd_espaco_aberto) || null;
  if (data.qtdEspacoAberto !== undefined) mapped.qtd_espaco_aberto = parseInt(data.qtdEspacoAberto) || null;
  if (data.has_visita_guiada !== undefined) mapped.has_visita_guiada = data.has_visita_guiada;
  if (data.hasVisitaGuiada !== undefined) mapped.has_visita_guiada = data.hasVisitaGuiada;
  if (data.qtd_visita_guiada !== undefined) mapped.qtd_visita_guiada = parseInt(data.qtd_visita_guiada) || null;
  if (data.qtdVisitaGuiada !== undefined) mapped.qtd_visita_guiada = parseInt(data.qtdVisitaGuiada) || null;
  
  return mapped;
}