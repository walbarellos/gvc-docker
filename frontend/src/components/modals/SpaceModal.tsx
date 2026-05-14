import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, MapPin, Mail, Clock, Users, Package, Bell, Info, Search, Monitor, CalendarDays, ClipboardList, Save, Settings as SettingsIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { spaceService, Space } from '../../services/spaceService';
import { auditService } from '../../services/auditService';
import { useAuth } from '../../contexts/AuthContext';

interface SpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceToEdit?: any;
  onSave?: () => void;
}

interface HorarioDia {
  ativo: boolean;
  inicio: string;
  fim: string;
}

interface HorariosFuncionamento {
  seg: HorarioDia;
  ter: HorarioDia;
  qua: HorarioDia;
  qui: HorarioDia;
  sex: HorarioDia;
  sab: HorarioDia;
  dom: HorarioDia;
}

const DIAS_SEMANA = [
  { key: 'seg', label: 'Seg' },
  { key: 'ter', label: 'Ter' },
  { key: 'qua', label: 'Qua' },
  { key: 'qui', label: 'Qui' },
  { key: 'sex', label: 'Sex' },
  { key: 'sab', label: 'Sáb' },
  { key: 'dom', label: 'Dom' },
] as const;

const TIPOS_ESPACO = [
  { key: 'hasAuditorio', qtdKey: 'qtdAuditorio', label: 'Auditório', icon: '🎭' },
  { key: 'hasSalaEstudos', qtdKey: 'qtdSalaEstudos', label: 'Sala de Estudos', icon: '📚' },
  { key: 'hasTeatro', qtdKey: 'qtdTeatro', label: 'Teatro', icon: '🎪' },
  { key: 'hasFilmoteca', qtdKey: 'qtdFilmoteca', label: 'Filmoteca', icon: '🎬' },
  { key: 'hasEspacoAberto', qtdKey: 'qtdEspacoAberto', label: 'Espaço Aberto', icon: '🌳' },
  { key: 'hasVisitaGuiada', qtdKey: 'qtdVisitaGuiada', label: 'Visita Guiada', icon: '🚶' },
] as const;

const criarHorarioVazio = (): HorarioDia => ({ ativo: false, inicio: '07:00', fim: '18:00' });

const criarHorariosDefault = (): HorariosFuncionamento => ({
  seg: criarHorarioVazio(),
  ter: criarHorarioVazio(),
  qua: criarHorarioVazio(),
  qui: criarHorarioVazio(),
  sex: criarHorarioVazio(),
  sab: criarHorarioVazio(),
  dom: criarHorarioVazio(),
});

const MUNICIPARIOS_ACRE = [
  "Acrelândia", "Assis Brasil", "Brasiléia", "Bujari", "Capixaba", 
  "Cruzeiro do Sul", "Epitaciolândia", "Feijó", "Jordão", "Mâncio Lima", 
  "Manoel Urbano", "Marechal Thaumaturgo", "Plácido de Castro", "Porto Acre", 
  "Porto Walter", "Rio Branco", "Rodrigues Alves", "Santa Rosa do Purus", 
  "Sena Madureira", "Senador Guiomard", "Tarauacá", "Xapuri"
];

const SpaceModal: React.FC<SpaceModalProps> = ({ isOpen, onClose, spaceToEdit, onSave }) => {
  const { userData: currentAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [municipioSearch, setMunicipioSearch] = useState('');
  const [showMunicipioList, setShowMunicipioList] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    endereco: '',
    municipio: '',
    horarios: criarHorariosDefault(),
    capacidadeVisitantes: 100,
    mensagemBoasVindas: '',
    tempoLimiteExcedido: 4,
    ativo: true,
    perfilArmarios: true,
    perfilTelecentro: false,
    perfilAgendamento: false,
    totalArmarios: 20,
    totalComputadores: 10,
    tempoLimiteComputador: 20,
    capacidadeAgendamento: 0,
    hasAuditorio: false,
    qtdAuditorio: 0,
    hasSalaEstudos: false,
    qtdSalaEstudos: 0,
    hasTeatro: false,
    qtdTeatro: 0,
    hasFilmoteca: false,
    qtdFilmoteca: 0,
    hasEspacoAberto: false,
    qtdEspacoAberto: 0,
    hasVisitaGuiada: false,
    qtdVisitaGuiada: 0
  });

  useEffect(() => {
    if (spaceToEdit) {
      let horariosParseados = criarHorariosDefault();
      
      if (spaceToEdit.horario_funcionamento || spaceToEdit.horarioFuncionamento) {
        try {
          const horarioStr = spaceToEdit.horario_funcionamento || spaceToEdit.horarioFuncionamento;
          if (typeof horarioStr === 'string') {
            horariosParseados = JSON.parse(horarioStr);
          } else if (typeof horarioStr === 'object') {
            horariosParseados = horarioStr as HorariosFuncionamento;
          }
        } catch {
          horariosParseados = criarHorariosDefault();
        }
      }
      
      setFormData({
        nome: spaceToEdit.nome || '',
        email: spaceToEdit.email || '',
        endereco: spaceToEdit.endereco || '',
        municipio: spaceToEdit.municipio || '',
        horarios: horariosParseados,
        capacidadeVisitantes: spaceToEdit.capacidade_visitantes || spaceToEdit.capacidadeVisitantes || 100,
        mensagemBoasVindas: spaceToEdit.mensagem_boas_vindas || spaceToEdit.mensagemBoasVindas || '',
        tempoLimiteExcedido: spaceToEdit.tempo_limite_excedido || spaceToEdit.tempoLimiteExcedido || 4,
        ativo: spaceToEdit.ativo !== false,
        perfilArmarios: spaceToEdit.perfil_armarios !== false && spaceToEdit.perfilArmarios !== false,
        perfilTelecentro: !!(spaceToEdit.perfil_telecentro || spaceToEdit.perfilTelecentro),
        perfilAgendamento: !!(spaceToEdit.perfil_agendamento || spaceToEdit.perfilAgendamento),
        totalArmarios: spaceToEdit.total_armarios || spaceToEdit.totalArmarios || 20,
        totalComputadores: spaceToEdit.total_computadores || spaceToEdit.totalComputadores || 10,
        tempoLimiteComputador: spaceToEdit.tempo_limite_computador || spaceToEdit.tempoLimiteComputador || 20,
        capacidadeAgendamento: spaceToEdit.capacidade_agendamento || spaceToEdit.capacidadeAgendamento || 0,
        hasAuditorio: spaceToEdit.has_auditorio || false,
        qtdAuditorio: spaceToEdit.qtd_auditorio || 0,
        hasSalaEstudos: spaceToEdit.has_sala_estudos || false,
        qtdSalaEstudos: spaceToEdit.qtd_sala_estudos || 0,
        hasTeatro: spaceToEdit.has_teatro || false,
        qtdTeatro: spaceToEdit.qtd_teatro || 0,
        hasFilmoteca: spaceToEdit.has_filmoteca || false,
        qtdFilmoteca: spaceToEdit.qtd_filmoteca || 0,
        hasEspacoAberto: spaceToEdit.has_espaco_aberto || false,
        qtdEspacoAberto: spaceToEdit.qtd_espaco_aberto || 0,
        hasVisitaGuiada: spaceToEdit.has_visita_guiada || false,
        qtdVisitaGuiada: spaceToEdit.qtd_visita_guiada || 0
      });
      setMunicipioSearch(spaceToEdit.municipio || '');
    } else {
      setFormData({
        nome: '',
        email: '',
        endereco: '',
        municipio: '',
        horarios: criarHorariosDefault(),
        capacidadeVisitantes: 100,
        mensagemBoasVindas: '',
        tempoLimiteExcedido: 4,
        ativo: true,
        perfilArmarios: true,
        perfilTelecentro: false,
        perfilAgendamento: false,
        totalArmarios: 20,
        totalComputadores: 10,
        tempoLimiteComputador: 20,
        capacidadeAgendamento: 0,
        hasAuditorio: false,
        qtdAuditorio: 0,
        hasSalaEstudos: false,
        qtdSalaEstudos: 0,
        hasTeatro: false,
        qtdTeatro: 0,
        hasFilmoteca: false,
        qtdFilmoteca: 0,
        hasEspacoAberto: false,
        qtdEspacoAberto: 0,
        hasVisitaGuiada: false,
        qtdVisitaGuiada: 0
      });
      setMunicipioSearch('');
    }
  }, [spaceToEdit, isOpen]);

  const filteredMunicipios = useMemo(() => {
    return MUNICIPARIOS_ACRE.filter(m => 
      m.toLowerCase().includes(municipioSearch.toLowerCase())
    );
  }, [municipioSearch]);

  const handleHorarioChange = (dia: keyof HorariosFuncionamento, campo: keyof HorarioDia, valor: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [dia]: {
          ...prev.horarios[dia],
          [campo]: valor
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.endereco || !formData.municipio) {
      return alert('Preencha todos os campos obrigatórios (*)');
    }

    if (formData.perfilArmarios && (formData.totalArmarios < 5 || formData.totalArmarios > 50)) {
      return alert('O total de armários deve ser entre 5 e 50.');
    }

    for (const dia of DIAS_SEMANA) {
      const horario = formData.horarios[dia.key as keyof HorariosFuncionamento];
      if (horario.ativo && horario.inicio && horario.fim && horario.inicio >= horario.fim) {
        return alert(`O horário de ${dia.label} está inválido: o início deve ser menor que o fim.`);
      }
    }

    setLoading(true);
    try {
      const dataToSave = {
        nome: formData.nome,
        email: formData.email,
        endereco: formData.endereco,
        municipio: formData.municipio,
        horario_funcionamento: JSON.stringify(formData.horarios),
        capacidade_visitantes: formData.capacidadeVisitantes,
        mensagem_boas_vindas: formData.mensagemBoasVindas || null,
        tempo_limite_excedido: formData.tempoLimiteExcedido,
        ativo: formData.ativo,
        perfil_armarios: formData.perfilArmarios,
        perfil_telecentro: formData.perfilTelecentro,
        perfil_agendamento: formData.perfilAgendamento,
        total_armarios: formData.perfilArmarios ? formData.totalArmarios : null,
        total_computadores: formData.perfilTelecentro ? formData.totalComputadores : null,
        tempo_limite_computador: formData.perfilTelecentro ? formData.tempoLimiteComputador : null,
        capacidade_agendamento: formData.perfilAgendamento ? formData.capacidadeAgendamento : null,
        has_auditorio: formData.perfilAgendamento && formData.hasAuditorio,
        qtd_auditorio: formData.perfilAgendamento && formData.hasAuditorio ? formData.qtdAuditorio : null,
        has_sala_estudos: formData.perfilAgendamento && formData.hasSalaEstudos,
        qtd_sala_estudos: formData.perfilAgendamento && formData.hasSalaEstudos ? formData.qtdSalaEstudos : null,
        has_teatro: formData.perfilAgendamento && formData.hasTeatro,
        qtd_teatro: formData.perfilAgendamento && formData.hasTeatro ? formData.qtdTeatro : null,
        has_filmoteca: formData.perfilAgendamento && formData.hasFilmoteca,
        qtd_filmoteca: formData.perfilAgendamento && formData.hasFilmoteca ? formData.qtdFilmoteca : null,
        has_espaco_aberto: formData.perfilAgendamento && formData.hasEspacoAberto,
        qtd_espaco_aberto: formData.perfilAgendamento && formData.hasEspacoAberto ? formData.qtdEspacoAberto : null,
        has_visita_guiada: formData.perfilAgendamento && formData.hasVisitaGuiada,
        qtd_visita_guiada: formData.perfilAgendamento && formData.hasVisitaGuiada ? formData.qtdVisitaGuiada : null
      };

      if (spaceToEdit) {
        const { error: updateError } = await spaceService.update(spaceToEdit.id, dataToSave);
        if (updateError) {
          console.error('Erro ao atualizar:', updateError);
          alert('Erro ao salvar: ' + updateError.message);
          setLoading(false);
          return;
        }
        await auditService.log({ acao: "editou_espaco", detalhes: `Editou espaço cultural ${formData.nome}`, entidadeId: spaceToEdit.id, userProfile: currentAdmin });
      } else {
        const { data, error } = await spaceService.create(dataToSave);
        if (error) throw error;
        if (data) {
          await auditService.log({ acao: "criou_espaco", detalhes: `Criou novo espaço cultural ${formData.nome}`, entidadeId: (data as any)?.id, userProfile: currentAdmin });
        }
      }
      if (onSave) onSave();
      else onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar espaço.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="space-modal-title"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div>
              <h2 id="space-modal-title" className="text-xl font-display font-bold text-slate-900">
                {spaceToEdit ? `Editar ${spaceToEdit.nome}` : 'Novo Espaço Cultural'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Configure as informações e limites desta unidade.</p>
            </div>
            <button onClick={onClose} aria-label="Fechar modal" className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-8 pb-10 scrollbar-hide">
            {/* Seção 1: Dados do Espaço */}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <ClipboardList size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Dados do Espaço</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="spaceNome" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Nome do Espaço Cultural *</label>
                  <input 
                    id="spaceNome"
                    name="nome"
                    type="text" 
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value.toUpperCase()})}
                    placeholder="Ex: BIBLIOTECA PÚBLICA ESTADUAL"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans uppercase"
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="spaceEmail" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Email Institucional *</label>
                  <div className="relative">
                    <input 
                      id="spaceEmail"
                      name="email"
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="adonay@instituicao.org"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pl-10 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                      required
                    />
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="municipio" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Município *</label>
                  <div className="relative">
                    <input 
                      id="municipio"
                      name="municipio"
                      type="text" 
                      value={municipioSearch}
                      onFocus={() => setShowMunicipioList(true)}
                      onChange={e => {
                        setMunicipioSearch(e.target.value);
                        setShowMunicipioList(true);
                      }}
                      placeholder="Busca Município..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                      required
                    />
                    <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  {showMunicipioList && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[110] max-h-48 overflow-y-auto">
                      {filteredMunicipios.length > 0 ? filteredMunicipios.map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setFormData({...formData, municipio: m});
                            setMunicipioSearch(m);
                            setShowMunicipioList(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          {m}
                        </button>
                      )) : (
                        <p className="p-3 text-xs text-slate-400 italic">Nenhum município encontrado</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="endereco" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Endereço Completo *</label>
                  <input 
                    id="endereco"
                    name="endereco"
                    type="text" 
                    value={formData.endereco}
                    onChange={e => setFormData({...formData, endereco: e.target.value})}
                    placeholder="Av. Brasil, 123 - Centro"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Nova Seção: Perfis do Espaço */}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                  <ClipboardList size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Perfis do Espaço</h3>
              </div>
              
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Ative os módulos disponíveis nesta unidade</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Perfil: Armários */}
                    <div className={`p-4 rounded-xl border transition-all ${formData.perfilArmarios ? 'bg-white border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-start gap-3">
                        <input 
                          id="perfilArmarios"
                          type="checkbox" 
                          checked={formData.perfilArmarios}
                          onChange={e => setFormData({...formData, perfilArmarios: e.target.checked})}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <label htmlFor="perfilArmarios" className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <Package size={14} className={formData.perfilArmarios ? 'text-blue-500' : 'text-slate-400'} />
                            Armários
                          </label>
                          <p className="text-[10px] text-slate-500">Guarda-volumes para visitantes</p>
                          
                          {formData.perfilArmarios && (
                            <div className="mt-3 py-2 border-t border-slate-100">
                              <label htmlFor="totalArmarios" className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total de Armários (5-50)</label>
                              <input 
                                id="totalArmarios"
                                name="totalArmarios"
                                type="number" 
                                value={formData.totalArmarios}
                                onChange={e => setFormData({...formData, totalArmarios: Number(e.target.value)})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Perfil: Telecentro */}
                    <div className={`p-4 rounded-xl border transition-all ${formData.perfilTelecentro ? 'bg-white border-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-start gap-3">
                        <input 
                          id="perfilTelecentro"
                          type="checkbox" 
                          checked={formData.perfilTelecentro}
                          onChange={e => setFormData({...formData, perfilTelecentro: e.target.checked})}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <label htmlFor="perfilTelecentro" className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <Monitor size={14} className={formData.perfilTelecentro ? 'text-indigo-500' : 'text-slate-400'} />
                            Telecentro
                          </label>
                          <p className="text-[10px] text-slate-500">Computadores para pesquisa</p>
                          
                          {formData.perfilTelecentro && (
                            <div className="mt-3 py-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                              <div>
                                <label htmlFor="totalComputadores" className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Qtd IDs (5-30)</label>
                                <input 
                                  id="totalComputadores"
                                  name="totalComputadores"
                                  type="number" 
                                  value={formData.totalComputadores}
                                  onChange={e => setFormData({...formData, totalComputadores: Number(e.target.value)})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-sm"
                                />
                              </div>
                              <div>
                                <label htmlFor="tempoLimiteComputador" className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tempo (min)</label>
                                <input 
                                  id="tempoLimiteComputador"
                                  name="tempoLimiteComputador"
                                  type="number" 
                                  value={formData.tempoLimiteComputador}
                                  onChange={e => setFormData({...formData, tempoLimiteComputador: Number(e.target.value)})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Perfil: Agendamento */}
                    <div className={`p-4 rounded-xl border transition-all ${formData.perfilAgendamento ? 'bg-white border-amber-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-start gap-3">
                        <input 
                          id="perfilAgendamento"
                          type="checkbox" 
                          checked={formData.perfilAgendamento}
                          onChange={e => setFormData({...formData, perfilAgendamento: e.target.checked})}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                        <div className="flex-1">
                          <label htmlFor="perfilAgendamento" className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <CalendarDays size={14} className={formData.perfilAgendamento ? 'text-amber-500' : 'text-slate-400'} />
                            Agendamento
                          </label>
                          <p className="text-[10px] text-slate-500">Agendamento de espaços e eventos</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {formData.perfilAgendamento && (
                  <div className="mt-4">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Tipos de Espaços Disponíveis (para agendamento)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {TIPOS_ESPACO.map(item => {
                        const isAtivado = formData[item.key as keyof typeof formData] as boolean;
                        return (
                          <div 
                            key={item.key} 
                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${isAtivado ? 'bg-white border-amber-300 shadow-sm' : 'bg-slate-50 border-slate-100'}`}
                          >
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                              <input 
                                type="checkbox" 
                                checked={isAtivado}
                                onChange={e => setFormData({...formData, [item.key]: e.target.checked})}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                            </label>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-lg shrink-0">{item.icon}</span>
                              <span className="text-xs font-medium text-slate-700 truncate">{item.label}</span>
                            </div>
                            {isAtivado && (
                              <div className="flex items-center gap-1 shrink-0">
                                <input 
                                  type="number" 
                                  min="0"
                                  value={formData[item.qtdKey as keyof typeof formData] as number}
                                  onChange={e => setFormData({...formData, [item.qtdKey]: Number(e.target.value)})}
                                  placeholder="0"
                                  className="w-14 bg-white border border-slate-200 rounded py-1.5 px-2 text-xs text-center focus:ring-2 focus:ring-amber-200 outline-none"
                                />
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">lugares</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Seção 2: Configurações do Espaço */}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                  <SettingsIcon size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Configurações Gerais</h3>
              </div>

              <div className="space-y-6">
                {/* Horário de Funcionamento */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    <Clock size={14} className="inline mr-1" />
                    Horário de Funcionamento
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                    {DIAS_SEMANA.map(dia => {
                      const horario = formData.horarios[dia.key as keyof HorariosFuncionamento];
                      return (
                        <div 
                          key={dia.key} 
                          className={`p-3 rounded-xl border transition-all ${horario.ativo ? 'bg-white border-amber-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <input 
                              type="checkbox" 
                              checked={horario.ativo}
                              onChange={e => handleHorarioChange(dia.key as keyof HorariosFuncionamento, 'ativo', e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="text-xs font-bold text-slate-600">{dia.label}</span>
                          </div>
                          {horario.ativo && (
                            <div className="space-y-2 mt-2 pt-2 border-t border-slate-100">
                              <div>
                                <label className="text-[9px] text-slate-400 uppercase">Início</label>
                                <input 
                                  type="time" 
                                  value={horario.inicio}
                                  onChange={e => handleHorarioChange(dia.key as keyof HorariosFuncionamento, 'inicio', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs focus:ring-2 focus:ring-amber-200 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-400 uppercase">Fim</label>
                                <input 
                                  type="time" 
                                  value={horario.fim}
                                  onChange={e => handleHorarioChange(dia.key as keyof HorariosFuncionamento, 'fim', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs focus:ring-2 focus:ring-amber-200 outline-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Capacidade de Visitantes */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    <Users size={14} className="inline mr-1" />
                    Capacidade de Visitantes
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                      id="capacidadeVisitantes"
                      name="capacidadeVisitantes"
                      type="range" 
                      min="0"
                      max="1000"
                      step="10"
                      value={formData.capacidadeVisitantes}
                      onChange={e => setFormData({...formData, capacidadeVisitantes: Number(e.target.value)})}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <span className="text-lg font-bold text-slate-700">{formData.capacidadeVisitantes}</span>
                      <span className="text-xs text-slate-400">visitantes</span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-slate-400">0</span>
                    <span className="text-[10px] text-slate-400">500</span>
                    <span className="text-[10px] text-slate-400">1000</span>
                  </div>
                </div>

                {/* Mensagem de Boas-Vindas */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Info size={14} className="inline mr-1" />
                      Mensagem de Boas-Vindas
                    </label>
                    <span className={`text-[10px] ${formData.mensagemBoasVindas.length > 500 ? 'text-red-500' : 'text-slate-400'}`}>
                      {formData.mensagemBoasVindas.length}/500
                    </span>
                  </div>
                  <textarea 
                    id="mensagemBoasVindas"
                    name="mensagemBoasVindas"
                    value={formData.mensagemBoasVindas}
                    onChange={e => {
                      if (e.target.value.length <= 500) {
                        setFormData({...formData, mensagemBoasVindas: e.target.value});
                      }
                    }}
                    placeholder={formData.nome ? `Bem-vindo ao ${formData.nome}!` : 'Bem-vindo ao espaço cultural!'}
                    maxLength={500}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans min-h-[100px]"
                  />
                  {formData.mensagemBoasVindas && (
                    <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Preview</p>
                      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {formData.mensagemBoasVindas.split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g).map((parte, i) => {
                          if (parte.startsWith('**') && parte.endsWith('**')) {
                            return <strong key={i}>{parte.slice(2, -2)}</strong>;
                          }
                          if (parte.startsWith('*') && parte.endsWith('*')) {
                            return <em key={i}>{parte.slice(1, -1)}</em>;
                          }
                          if (parte.startsWith('[') && parte.includes('](')) {
                            const match = parte.match(/\[(.*?)\]\((.*?)\)/);
                            if (match) return <a key={i} href={match[2]} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{match[1]}</a>;
                          }
                          return parte;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 py-2">
                   <label htmlFor="espacoAtivo" className="relative inline-flex items-center cursor-pointer">
                    <input 
                      id="espacoAtivo"
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.ativo}
                      onChange={e => setFormData({...formData, ativo: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-bold text-slate-600 uppercase tracking-widest">Espaço Ativo</span>
                  </label>
                </div>
              </div>
            </div>
          </form>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl shrink-0 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Salvando...'
              ) : (
                <>
                  <Save size={16} />
                  Salvar Espaço
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SpaceModal;
