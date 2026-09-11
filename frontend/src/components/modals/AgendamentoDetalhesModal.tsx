import React, { useState } from 'react';
import {
  X,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building,
  Trash2,
} from 'lucide-react';

interface AgendamentoDetalhesModalProps {
  agendamento: {
    id?: string;
    // camelCase — como a API retorna após conversão automática
    solicitanteNome: string;
    solicitanteEmail: string;
    solicitanteTelefone: string;
    solicitanteDocumento?: string;
    tipoSolicitante: string;
    tipoEspaco: string;
    espacoSolicitado: string;
    dataPretendida: string;
    horarioInicio: string;
    horarioFim: string;
    numeroParticipantes: number;
    descricaoEvento: string;
    naturezaEvento: string;
    gratuito: boolean;
    valorIngresso?: number | null;
    necessitaEquipamentos?: string;
    observacoes?: string;
    status?: string;
    termoAceito: boolean;
    responsabilidadeEvento?: boolean;
    danosPatrimonio?: boolean;
    respeitoLotacao?: boolean;
    autorizoDivulgacao?: boolean;
    documentoAnexoUrl?: string;
    respostaCoordenador?: string;
  };
  onClose: () => void;
  onStatusChange: (id: string, status: 'aprovado' | 'rejeitado', resposta?: string) => void;
  onDelete?: (id: string) => void;
  loading: boolean;
}

const naturezaLabels: Record<string, string> = {
  cultural: 'Cultural',
  educacional: 'Educacional',
  corporativo: 'Corporativo',
  comunitario: 'Comunitário',
  outro: 'Outro',
};

const tipoEspacoLabels: Record<string, string> = {
  auditorium: 'Auditório',
  sala_reuniao: 'Sala de Reunião',
  area_externa: 'Área Externa',
  visita_guiada: 'Visita Guiada',
  outro: 'Outro',
};

const tipoSolicitanteLabels: Record<string, string> = {
  escola: 'Escola',
  universidade: 'Universidade',
  ong: 'ONG',
  empresa: 'Empresa',
  pessoa_fisica: 'Pessoa Física',
};

export default function AgendamentoDetalhesModal({
  agendamento,
  onClose,
  onStatusChange,
  onDelete,
  loading,
}: AgendamentoDetalhesModalProps) {
  const [resposta, setResposta] = useState('');
  const [showConfirm, setShowConfirm] = useState<'aprovar' | 'rejeitar' | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  

  const handleEditSave = () => {
    // Map from camelCase (state) to snake_case (API format)
    const payload = {
      data_pretendida: editData.dataPretendida ? editData.dataPretendida.substring(0, 10) : undefined,
      horario_inicio: editData.horarioInicio ? editData.horarioInicio.substring(11, 16) : undefined,
      horario_fim: editData.horarioFim ? editData.horarioFim.substring(11, 16) : undefined,
    };
    onStatusChange(agendamento.id!, 'editar' as any, JSON.stringify(payload));
    setIsEditing(false);
  };


  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '-';
    if (timeStr.includes('T')) {
      const d = new Date(timeStr);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Rio_Branco' });
    }
    return timeStr.slice(0, 5);
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6, 10)}`;
    }
    return phone;
  };

  const formatDoc = (doc: string) => {
    if (!doc) return '-';
    const cleaned = doc.replace(/\D/g, '');
    if (cleaned.length === 11) {
      // CPF
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (cleaned.length === 14) {
      // CNPJ
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
  };

  const handleConfirm = () => {
    if (showConfirm === 'aprovar') {
      onStatusChange(agendamento.id ?? '', 'aprovado', resposta || undefined);
    } else if (showConfirm === 'rejeitar') {
      onStatusChange(agendamento.id ?? '', 'rejeitado', resposta);
    }
    setShowConfirm(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agendamento-detalhes-title"
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-6 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 id="agendamento-detalhes-title" className="text-2xl font-display font-bold text-slate-900">Detalhes do Agendamento</h2>
            <p className="text-slate-500 text-sm mt-1">
              Solicitação #{(agendamento.id ?? '').slice(0, 8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-50 rounded-2xl p-6">
              <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                <User size={18} />
                Dados do Solicitante
              </h3>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="text-indigo-700 font-medium">Nome:</span>{' '}
                  <span className="text-slate-700">{agendamento.solicitanteNome}</span>
                </p>
                <p>
                  <span className="text-indigo-700 font-medium">Tipo:</span>{' '}
                  <span className="text-slate-700">{tipoSolicitanteLabels[agendamento.tipoSolicitante] || agendamento.tipoSolicitante}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-indigo-500" />
                  <span className="text-slate-700">{agendamento.solicitanteEmail}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-indigo-500" />
                  <span className="text-slate-700">{formatPhone(agendamento.solicitanteTelefone)}</span>
                </p>
                {agendamento.solicitanteDocumento && (
                  <p>
                    <span className="text-indigo-700 font-medium">Doc:</span>{' '}
                    <span className="text-slate-700">{formatDoc(agendamento.solicitanteDocumento)}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-6">
              <h3 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                <MapPin size={18} />
                Espaço Solicitado
              </h3>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="text-emerald-700 font-medium">Espaço:</span>{' '}
                  <span className="text-slate-700">{agendamento.espacoSolicitado}</span>
                </p>
                <p>
                  <span className="text-emerald-700 font-medium">Tipo:</span>{' '}
                  <span className="text-slate-700">{tipoEspacoLabels[agendamento.tipoEspaco] || agendamento.tipoEspaco}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Users size={14} className="text-emerald-500" />
                  <span className="text-slate-700">{agendamento.numeroParticipantes} participantes</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CalendarDays size={18} />
              Data e Horário
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-xl p-4">
                <p className="text-slate-500 mb-1">Data</p>
                {isEditing ? (
                  <input type="date" className="border rounded p-1 w-full" value={editData.dataPretendida?.split('T')[0] || ''} onChange={e => setEditData({...editData, dataPretendida: e.target.value + 'T00:00:00.000Z'})} />
                ) : (
                  <p className="font-semibold text-slate-900">{formatDate(agendamento.dataPretendida)}</p>
                )}
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="text-slate-500 mb-1">Início</p>
                {isEditing ? (
                  <input type="time" className="border rounded p-1 w-full" value={editData.horarioInicio?.split('T')[1]?.substring(0,5) || ''} onChange={e => {
                    const baseDate = editData.dataPretendida ? editData.dataPretendida.split('T')[0] : '2024-01-01';
                    setEditData({...editData, horarioInicio: baseDate + 'T' + e.target.value + ':00.000Z'});
                  }} />
                ) : (
                  <p className="font-semibold text-slate-900">{formatTime(agendamento.horarioInicio)}</p>
                )}
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="text-slate-500 mb-1">Fim</p>
                {isEditing ? (
                  <input type="time" className="border rounded p-1 w-full" value={editData.horarioFim?.split('T')[1]?.substring(0,5) || ''} onChange={e => {
                    const baseDate = editData.dataPretendida ? editData.dataPretendida.split('T')[0] : '2024-01-01';
                    setEditData({...editData, horarioFim: baseDate + 'T' + e.target.value + ':00.000Z'});
                  }} />
                ) : (
                  <p className="font-semibold text-slate-900">{formatTime(agendamento.horarioFim)}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText size={18} />
              Detalhes do Evento
            </h3>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 mb-1">Natureza</p>
                  <p className="font-medium text-slate-900">{naturezaLabels[agendamento.naturezaEvento] || agendamento.naturezaEvento}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Valor</p>
                  <p className="font-medium text-slate-900">
                    {agendamento.gratuito ? 'Gratuito' : `R$ ${agendamento.valorIngresso?.toFixed(2)}`}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Descrição do Evento</p>
                <p className="text-slate-900">{agendamento.descricaoEvento}</p>
              </div>
              {agendamento.necessitaEquipamentos && (
                <div>
                  <p className="text-slate-500 mb-1">Equipamentos Necessários</p>
                  <p className="text-slate-900">{agendamento.necessitaEquipamentos}</p>
                </div>
              )}
              {agendamento.observacoes && (
                <div>
                  <p className="text-slate-500 mb-1">Observações</p>
                  <p className="text-slate-900">{agendamento.observacoes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Termos Aceitos</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className={`flex items-center gap-2 p-3 rounded-xl ${agendamento.termoAceito ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {agendamento.termoAceito ? <CheckCircle size={16} /> : <XCircle size={16} />}
                <span className="text-sm font-medium">Termo da Portaria 169/2023</span>
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-xl ${agendamento.responsabilidadeEvento ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {agendamento.responsabilidadeEvento ? <CheckCircle size={16} /> : <XCircle size={16} />}
                <span className="text-sm font-medium">Responsabilidade pelo evento</span>
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-xl ${agendamento.danosPatrimonio ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {agendamento.danosPatrimonio ? <CheckCircle size={16} /> : <XCircle size={16} />}
                <span className="text-sm font-medium">Responsabilidade por danos</span>
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-xl ${agendamento.respeitoLotacao ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {agendamento.respeitoLotacao ? <CheckCircle size={16} /> : <XCircle size={16} />}
                <span className="text-sm font-medium">Respeito à lotação máxima</span>
              </div>
            </div>
          </div>

          {(agendamento.status === 'pendente' || showConfirm) && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} />
                {showConfirm ? (showConfirm === 'aprovar' ? 'Observações da Aprovação' : 'Justificativa da Rejeição') : 'Resposta do Coordenador'}
              </h3>
              <textarea
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder={showConfirm === 'rejeitar' ? 'Justificativa obrigatória para rejeição...' : 'Observações (opcional)...'}
                className="w-full p-4 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[100px]"
              />
            </div>
          )}

          {agendamento.status !== 'pendente' && agendamento.respostaCoordenador && !showConfirm && (
            <div className={`border rounded-2xl p-6 ${agendamento.status === 'aprovado' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`font-semibold mb-2 ${agendamento.status === 'aprovado' ? 'text-emerald-900' : 'text-red-900'}`}>
                Resposta do Coordenador
              </h3>
              <p className="text-sm text-slate-700">{agendamento.respostaCoordenador}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-8 py-6 flex items-center justify-end gap-4 rounded-b-3xl">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="px-6 py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
                <button onClick={handleEditSave} disabled={loading} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium text-white transition-colors">Salvar Edição</button>
              </>
            ) : showConfirm ? (
              <>
                <button
                  onClick={() => setShowConfirm(null)}
                  className="px-6 py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading || (showConfirm === 'rejeitar' && !resposta)}
                  className={`px-6 py-3 rounded-xl font-medium text-white transition-colors disabled:opacity-50 ${
                    showConfirm === 'aprovar'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {loading ? 'Processando...' : showConfirm === 'aprovar' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setIsEditing(true); setEditData(agendamento); }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  disabled={loading}
                >
                  <FileText size={18} />
                  Editar
                </button>
                {agendamento.status !== 'rejeitado' && (
                  <button
                    onClick={() => setShowConfirm('rejeitar')}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                    disabled={loading}
                  >
                    <XCircle size={18} />
                    Rejeitar
                  </button>
                )}
                {agendamento.status !== 'aprovado' && (
                  <button
                    onClick={() => setShowConfirm('aprovar')}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    disabled={loading}
                  >
                    <CheckCircle size={18} />
                    Aprovar
                  </button>
                )}
              </>
            )}
          </div>
      </div>
    </div>
  );
}