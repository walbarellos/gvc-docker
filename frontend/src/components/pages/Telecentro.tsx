import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { visitorService } from '../../services/visitorService';
import { spaceService } from '../../services/spaceService';
import { api } from '../../lib/api';
import { useDebounce } from '../../hooks/useDebounce';
import { 
  Monitor, 
  MonitorOff,
  Unlock,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  Search,
  User,
  X,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Footer from '../layout/PageFooter';

interface Computador {
  id: string;
  numero: number;
  status: 'Livre' | 'Em Uso' | 'Excedido';
  usuarioId?: string;
  usuarioNome?: string;
  horarioInicio?: string;
  horarioLimite?: string;
}

export default function Telecentro() {
  const { userData, spaceConfig } = useAuth();
  const [computadores, setComputadores] = useState<Computador[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComputador, setSelectedComputador] = useState<Computador | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [tick, setTick] = useState(0);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Timer para atualizar contagem regressiva
  useEffect(() => {
    const interval = setInterval(() => setTick(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const isGlobalUser = userData?.perfil === 'administrador' || userData?.perfil === 'coordenador';
    const hasGlobalAccess = !userData?.espacoId || userData?.espacoId === 'todos' || 
      (userData?.espacoNome && userData.espacoNome.toLowerCase().includes('todos'));
    
    if (isGlobalUser && hasGlobalAccess) {
      spaceService.listAll().then(({ data }) => {
        if (data) {
          const telecentroSpaces = data.filter((s: any) => s.perfilTelecentro === true);
          setSpaces(telecentroSpaces);
          if (telecentroSpaces.length === 1) {
            setSelectedSpaceId(telecentroSpaces[0].id);
          }
        }
      });
    }
  }, [userData]);

  const isGlobalAdmin = (userData?.perfil === 'administrador' || userData?.perfil === 'coordenador') && 
    (!userData.espacoId || userData.espacoId === 'todos' || 
     (userData.espacoNome && userData.espacoNome.toLowerCase().includes('todos')));

  const currentSpace = spaces.find(s => s.id === (selectedSpaceId || userData?.espacoId));
  const totalComputadoresCount = currentSpace?.totalComputadores || spaceConfig?.totalComputadores || 10;
  const limiteMaximoMinutos = currentSpace?.tempoLimiteComputador || spaceConfig?.tempoLimiteComputador || 30;

  useEffect(() => {
    if (!userData) return;
    const espacoId = isGlobalAdmin ? (selectedSpaceId || null) : userData.espacoId;

    const fetchComputadores = async () => {
      const query = espacoId ? `?espacoId=${espacoId}` : '';
      const { data } = await api.get<any[]>(`/computadores${query}`);

      const fullList: Computador[] = [];
      for (let i = 1; i <= totalComputadoresCount; i++) {
        const existing = (data || []).find(c => c.numero === i || c.numero === i.toString());
        let status: 'Livre' | 'Em Uso' | 'Excedido' = 'Livre';
        if (existing?.usuarioId) {
          const agora = new Date();
          const limite = existing.horarioLimite ? new Date(existing.horarioLimite) : null;
          status = (limite && agora > limite) ? 'Excedido' : 'Em Uso';
        }
        fullList.push(existing ? { 
          id: existing.id, 
          numero: existing.numero, 
          status, 
          usuarioId: existing.usuarioId, 
          usuarioNome: existing.usuarioNome || existing.usuario_nome, 
          horarioInicio: existing.horarioInicio || existing.horario_inicio,
          horarioLimite: existing.horarioLimite || existing.horario_limite 
        } : { id: `temp-${i}`, numero: i, status: 'Livre' });
      }
      setComputadores(fullList.sort((a, b) => a.numero - b.numero));
      setLoading(false);
    };

    fetchComputadores();
    const interval = setInterval(fetchComputadores, 30000);
    return () => clearInterval(interval);
  }, [totalComputadoresCount, userData, selectedSpaceId, isGlobalAdmin]);

  useEffect(() => {
    if (debouncedSearchTerm.length > 2) {
      visitorService.listAll().then(({ data }) => {
        if (!data) return;
        const filtered = (data || []).filter((v: any) => {
          const searchLower = debouncedSearchTerm.toLowerCase();
          const searchTokens = searchLower.split(/\s+/).filter(t => t.length > 0);
          return searchTokens.length > 0 && searchTokens.every(token => (v.fullName || v.full_name || '').toLowerCase().includes(token));
        });
        setSearchResults((filtered || []).map(v => ({ id: v.id, fullName: v.fullName || v.full_name, cpf: v.cpf })).slice(0, 5));
      });
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  const handleComputadorClick = (pc: Computador) => {
    if (pc.status !== 'Livre') return;
    setSelectedComputador(pc);
    setIsSearchOpen(true);
    setSearchTerm('');
  };

  const iniciarComputador = async (visitor: any) => {
    if (!selectedComputador || !userData) return;
    const isGlobal = (userData?.perfil === 'administrador' || userData?.perfil === 'coordenador') && (!userData.espacoId || userData.espacoId === 'todos');
    const targetEspacoId = isGlobal ? (selectedSpaceId || null) : userData.espacoId;

    try {
      const agora = new Date();
      const limite = new Date(agora.getTime() + limiteMaximoMinutos * 60000);
      await api.post('/computadores', {
        numero: selectedComputador.numero,
        status: 'EmUso',
        usuarioId: visitor.id,
        usuarioNome: visitor.fullName,
        espacoId: targetEspacoId,
        espacoNome: currentSpace?.nome || spaceConfig?.nome,
        horarioInicio: agora.toISOString(),
        horarioLimite: limite.toISOString()
      });
      setToast({ message: `Sessão iniciada no PC ${selectedComputador.numero}!`, type: 'success' });
      setIsSearchOpen(false);
      setSelectedComputador(null);
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ message: "Erro ao iniciar sessão.", type: 'error' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const liberarComputador = async (pc: Computador) => {
    if (pc.id.startsWith('temp-')) return;
    try {
      await api.delete(`/computadores/${pc.id}`);
      setToast({ message: `PC ${pc.numero} liberado!`, type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ message: "Erro ao liberar.", type: 'error' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  // Calcula tempo decorrido desde o início
  const calcularTempoDecorrido = (horarioInicio: string | undefined) => {
    if (!horarioInicio) return null;
    const agora = new Date();
    const inicio = new Date(horarioInicio);
    const diff = agora.getTime() - inicio.getTime();
    if (diff < 0) return null;
    const minutos = Math.floor(diff / 60000);
    const segundos = Math.floor((diff % 60000) / 1000);
    return { minutos, segundos, totalMinutos: minutos };
  };

  // Calcula tempo restante
  const calcularTempoRestante = (horarioLimite: string | undefined) => {
    if (!horarioLimite) return '--:--';
    const agora = new Date();
    const limite = new Date(horarioLimite);
    const diff = limite.getTime() - agora.getTime();
    if (diff <= 0) return '00:00';
    return `${String(Math.floor(diff / 60000)).padStart(2, '0')}:${String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')}`;
  };

  if (!userData) return null;

  if (!isGlobalAdmin && (!spaceConfig || !spaceConfig?.perfilTelecentro)) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
          <MonitorOff size={48} />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Módulo de Telecentro Desativado</h2>
        <p className="text-slate-500 max-w-md">Este espaço não possui acesso ao telecentro.</p>
      </div>
    );
  }

  if (isGlobalAdmin && !selectedSpaceId && spaces.length > 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-bold mb-4">
            <Monitor size={16} />
            Selecione o Espaço
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Qual espaço você vai gerenciar?</h2>
          <p className="text-slate-500">Escolha uma unidade para acessar o módulo de computadores</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {spaces.map((s, idx) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedSpaceId(s.id)}
              className="group p-8 bg-white border-2 border-slate-200 rounded-3xl text-left hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 transition-all"
            >
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-amber-100 transition-colors">
                <Monitor size={28} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-2">{s.nome}</h3>
              <p className="text-slate-500 text-sm">{s.totalComputadores || 0} computadores disponíveis</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const emUso = computadores.filter(c => c.status !== 'Livre').length;
  const livre = computadores.filter(c => c.status === 'Livre').length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          className={`fixed top-6 left-1/2 px-6 py-3 rounded-2xl shadow-2xl z-[200] flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-primary text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold text-sm">{toast.message}</span>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          {isGlobalAdmin && (
            <button onClick={() => setSelectedSpaceId('')} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              <X size={20} className="text-slate-600" />
            </button>
          )}
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Monitor size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">{currentSpace?.nome || 'Telecentro'}</h1>
            <p className="text-slate-500 text-sm mt-1">Módulo de Computadores • {limiteMaximoMinutos} min/sessão</p>
          </div>
        </div>

        {isGlobalAdmin && selectedSpaceId && (
          <button 
            onClick={() => setSelectedSpaceId('')}
            className="px-5 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Monitor size={16} />
            Trocar Espaço
          </button>
        )}

        <div className="flex gap-3">
          <div className="px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-emerald-600 font-bold uppercase">Livres</p>
                <p className="text-2xl font-bold text-slate-900">{livre}</p>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Monitor size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-amber-600 font-bold uppercase">Em Uso</p>
                <p className="text-2xl font-bold text-slate-900">{emUso}</p>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Monitor size={20} className="text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Total</p>
                <p className="text-2xl font-bold text-slate-900">{computadores.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {computadores.map((pc, idx) => {
            const isOcupado = pc.status !== 'Livre';
            const isExcedido = pc.status === 'Excedido';
            const tempoDecorrido = isOcupado ? calcularTempoDecorrido(pc.horarioInicio) : null;
            
            return (
              <motion.div
                key={pc.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => !isOcupado && handleComputadorClick(pc)}
                className={`relative ${isOcupado ? 'cursor-default' : 'cursor-pointer hover:-translate-y-1'}`}
              >
                <div className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                  isExcedido ? 'border-red-400 bg-gradient-to-br from-red-50 to-rose-50' :
                  isOcupado ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50' :
                  'border-slate-200 bg-white hover:border-primary hover:shadow-lg hover:shadow-primary/10'
                }`}>
                  <div className="relative z-10 p-5">
                    {/* Ícone maior do computador */}
                    <div className="flex items-center justify-center mb-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        isOcupado 
                          ? isExcedido 
                            ? 'bg-red-500' 
                            : 'bg-amber-500'
                          : 'bg-gradient-to-br from-slate-100 to-slate-200'
                      }`}>
                        <Monitor size={36} className={isOcupado ? 'text-white' : 'text-slate-600'} />
                      </div>
                    </div>

                    {/* Número do PC */}
                    <div className="text-center mb-3">
                      <span className={`text-2xl font-black ${isOcupado ? 'text-slate-800' : 'text-slate-400'}`}>
                        PC {pc.numero}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold mb-3 w-full ${
                      isExcedido ? 'bg-red-100 text-red-700' : isOcupado ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isExcedido ? <AlertCircle size={12} /> : isOcupado ? <Monitor size={12} /> : <Monitor size={12} />}
                      {isExcedido ? 'Excedido' : isOcupado ? 'Em Uso' : 'Livre'}
                    </div>

                    {/* Informações do usuário e cronômetro */}
                    {isOcupado && pc.usuarioNome && (
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-slate-800 text-center truncate">{pc.usuarioNome}</p>
                        
                        {/* Cronômetro de tempo decorrido */}
                        {tempoDecorrido && (
                          <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl ${
                            isExcedido ? 'bg-red-100' : 'bg-slate-100'
                          }`}>
                            <Clock size={18} className={isExcedido ? 'text-red-600' : 'text-slate-600'} />
                            <span className={`font-mono text-lg font-bold ${
                              isExcedido ? 'text-red-700' : 'text-slate-700'
                            }`}>
                              {String(tempoDecorrido.minutos).padStart(2, '0')}:{String(tempoDecorrido.segundos).padStart(2, '0')}
                            </span>
                            <span className={`text-xs ${isExcedido ? 'text-red-500' : 'text-slate-400'}`}>
                              / {limiteMaximoMinutos}min
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {!isOcupado && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleComputadorClick(pc); }}
                        className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <Play size={16} />
                        INICIAR
                      </button>
                    )}
                  </div>

                  {isOcupado && (
                    <div className="p-3 bg-white/80 border-t border-slate-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); liberarComputador(pc); }}
                        className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                          isExcedido 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-slate-800 hover:bg-slate-900 text-white'
                        }`}
                      >
                        <Square size={14} />
                        ENCERRAR
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-primary text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Iniciar Sessão</h3>
                    <p className="text-white/80 text-sm">Computador {selectedComputador?.numero}</p>
                  </div>
                  <button onClick={() => setIsSearchOpen(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Buscar visitante..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(searchResults || []).length > 0 ? (
                    (searchResults || []).map((visitor) => (
                      <button
                        key={visitor.id}
                        onClick={() => iniciarComputador(visitor)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all text-left"
                      >
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                          {visitor.fullName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{visitor.fullName}</p>
                          <p className="text-xs text-slate-400">{visitor.cpf || 'Sem CPF'}</p>
                        </div>
                      </button>
                    ))
                  ) : searchTerm.length > 2 ? (
                    <div className="p-8 text-center text-slate-400">Nenhum visitante encontrado</div>
                  ) : (
                    <div className="p-8 text-center text-slate-400">Digite para buscar</div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => iniciarComputador({ id: 'temp', fullName: `Visitante ${Date.now()}` })}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                  Iniciar Sessão Rápida
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer type="telecentro" />
    </div>
  );
}