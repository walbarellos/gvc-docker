import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { visitorService } from '../../services/visitorService';
import { spaceService } from '../../services/spaceService';
import { api } from '../../lib/api';
import { useDebounce } from '../../hooks/useDebounce';
import { 
  Lock, 
  LockOpen, 
  Unlock,
  CheckCircle2,
  AlertCircle,
  Search,
  User,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Footer from '../layout/PageFooter';

interface Locker {
  id: string;
  number: number;
  status: 'Livre' | 'Ocupado' | 'Manutencao';
  visitorId?: string;
  visitorName?: string;
  updatedAt?: string;
}

export default function Lockers() {
  const { userData, spaceConfig } = useAuth();
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const isGlobalUser = userData?.perfil === 'administrador' || userData?.perfil === 'coordenador';
    const hasGlobalAccess = !userData?.espacoId || userData?.espacoId === 'todos' || 
      (userData?.espacoNome && userData.espacoNome.toLowerCase().includes('todos'));
    
    if (isGlobalUser && hasGlobalAccess) {
      spaceService.listAll().then(({ data }) => {
        if (data) {
          const lockerSpaces = data.filter((s: any) => s.perfilArmarios === true);
          setSpaces(lockerSpaces);
          if (lockerSpaces.length === 1) {
            setSelectedSpaceId(lockerSpaces[0]?.id ?? '');
          }
        }
      });
    }
  }, [userData]);

  const isGlobalAdmin = (userData?.perfil === 'administrador' || userData?.perfil === 'coordenador') && 
    (!userData.espacoId || userData.espacoId === 'todos' || 
     (userData.espacoNome && userData.espacoNome.toLowerCase().includes('todos')));

  const currentSpace = spaces.find(s => s.id === (selectedSpaceId || userData?.espacoId));
  const totalLockersCount = currentSpace?.totalArmarios || spaceConfig?.totalArmarios || 20;

  useEffect(() => {
    if (!userData) return;
    const espacoId = isGlobalAdmin ? (selectedSpaceId || null) : userData.espacoId;

    const fetchLockers = async () => {
      const query = espacoId ? `?espacoId=${espacoId}` : '';
      const { data } = await api.get<any[]>(`/armarios${query}`);

      const fullList: Locker[] = [];
      for (let i = 1; i <= totalLockersCount; i++) {
        const existing = (data || []).find(l => l.number === i || l.number === i.toString());
        let status: 'Livre' | 'Ocupado' | 'Manutencao' = 'Livre';
        if (existing?.status === 'Ocupado' || existing?.status === 'occupied') {
          status = 'Ocupado';
        } else if (existing?.status === 'Manutencao' || existing?.status === 'maintenance') {
          status = 'Manutencao';
        }
        fullList.push(existing ? { 
          id: existing.id, 
          number: existing.number, 
          status, 
          visitorId: existing.visitor_id || existing.visitorId, 
          visitorName: existing.visitor_name || existing.visitorName,
          updatedAt: existing.updated_at 
        } : { id: `temp-${i}`, number: i, status: 'Livre' });
      }
      setLockers(fullList.sort((a, b) => a.number - b.number));
      setLoading(false);
    };

    fetchLockers();
    const interval = setInterval(fetchLockers, 30000);
    return () => clearInterval(interval);
  }, [totalLockersCount, userData, selectedSpaceId, isGlobalAdmin, refreshTrigger]);

  useEffect(() => {
    if (debouncedSearchTerm.length > 2) {
      visitorService.listAll().then(({ data }) => {
        if (!data) return;
        const filtered = (data || []).filter((v: any) => {
          const searchLower = debouncedSearchTerm.toLowerCase();
          const searchTokens = searchLower.split(/\s+/).filter(t => t.length > 0);
          return searchTokens.length > 0 && searchTokens.every(token => 
            (v.fullName || v.full_name || '').toLowerCase().includes(token) ||
            (v.cpf || '').replace(/\D/g, '').includes(token.replace(/\D/g, ''))
          );
        });
        setSearchResults((filtered || []).map(v => ({ id: v.id, fullName: v.full_name, cpf: v.cpf })).slice(0, 5));
      });
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  const handleLockerClick = (locker: Locker) => {
    if (locker.status !== 'Livre') return;
    setSelectedLocker(locker);
    setIsSearchOpen(true);
    setSearchTerm('');
  };

  const assignLocker = async (visitor: any) => {
    if (!selectedLocker || !userData) return;

    const isGlobal = (userData?.perfil === 'administrador' || userData?.perfil === 'coordenador') && (!userData.espacoId || userData.espacoId === 'todos');
    const targetEspacoId = isGlobal ? (selectedSpaceId || null) : userData.espacoId;

    try {
      const { data: activeCheckIn } = await api.get<any[]>(
        `/visitas?visitorId=${visitor.id}&status=Ativo&espacoId=${targetEspacoId || ''}`
      );

      if (!activeCheckIn || activeCheckIn.length === 0) {
        setToast({ message: 'ERRO: Visitante não possui check-in ativo neste espaço.', type: 'error' });
        setTimeout(() => setToast(null), 4000);
        return;
      }

      if (targetEspacoId) {
        const { data: existing } = await api.get<any[]>(
          `/armarios?espacoId=${targetEspacoId}&visitorId=${visitor.id}&status=Ocupado`
        );

        if (existing && existing.length > 0) {
          setToast({ message: `ERRO: Este visitante já possui o armário ${existing[0].number}`, type: 'error' });
          setTimeout(() => setToast(null), 4000);
          return;
        }
      }

      await api.post('/armarios', {
        number: selectedLocker.number,
        status: 'Ocupado',
        visitor_id: visitor.id,
        visitor_name: visitor.fullName,
        espaco_id: targetEspacoId
      });

      setToast({ message: `Armário ${selectedLocker.number} ocupado com sucesso!`, type: 'success' });
      setIsSearchOpen(false);
      setSelectedLocker(null);
      setRefreshTrigger(prev => prev + 1);
      setTimeout(() => setToast(null), 3000);
    } catch (error: any) {
      console.error(error);
      setToast({ message: error?.response?.data?.error || "Erro ao ocupar armário.", type: 'error' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const releaseLocker = async (locker: Locker) => {
    if (locker.id.startsWith('temp-')) return;
    try {
      await api.delete(`/armarios/${locker.id}`);
      setToast({ message: `Armário ${locker.number} liberado com sucesso!`, type: 'success' });
      setRefreshTrigger(prev => prev + 1);
      setTimeout(() => setToast(null), 3000);
    } catch (error: any) {
      console.error("Erro ao liberar armário:", error);
      setToast({ message: error?.response?.data?.error || "Erro ao liberar armário.", type: 'error' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  if (!userData) return null;

  if (!isGlobalAdmin && (!spaceConfig || !spaceConfig?.perfilArmarios)) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
          <Lock size={48} />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Módulo de Armários Desativado</h2>
        <p className="text-slate-500 max-w-md">Este espaço cultural não possui o perfil de armários ativo.</p>
      </div>
    );
  }

  if (isGlobalAdmin && !selectedSpaceId && spaces.length > 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-bold mb-4">
            <Lock size={16} />
            Selecione o Espaço
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Qual espaço você vai gerenciar?</h2>
          <p className="text-slate-500">Escolha uma unidade para acessar o módulo de armários</p>
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
                <Lock size={28} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-2">{s.nome}</h3>
              <p className="text-slate-500 text-sm">{s.totalArmarios || 0} armários disponíveis</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const ocupado = lockers.filter(l => l.status === 'Ocupado').length;
  const livre = lockers.filter(l => l.status === 'Livre').length;

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
            <Lock size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">{currentSpace?.nome || 'Armários'}</h1>
            <p className="text-slate-500 text-sm mt-1">Gestão de armários e chaves</p>
          </div>
        </div>

        {isGlobalAdmin && selectedSpaceId && (
          <button 
            onClick={() => setSelectedSpaceId('')}
            className="px-5 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Lock size={16} />
            Trocar Espaço
          </button>
        )}

        <div className="flex gap-3">
          <div className="px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <LockOpen size={20} className="text-emerald-600" />
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
                <Lock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-amber-600 font-bold uppercase">Ocupados</p>
                <p className="text-2xl font-bold text-slate-900">{ocupado}</p>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Lock size={20} className="text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Total</p>
                <p className="text-2xl font-bold text-slate-900">{lockers.length}</p>
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
          {lockers.map((locker, idx) => {
            const isOcupado = locker.status === 'Ocupado';
            const isManutencao = locker.status === 'Manutencao';
            
            return (
              <motion.div
                key={locker.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => !isOcupado && !isManutencao && handleLockerClick(locker)}
                className={`relative ${isOcupado || isManutencao ? 'cursor-default' : 'cursor-pointer hover:-translate-y-1'}`}
              >
                <div className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                  isManutencao 
                    ? 'border-red-300 bg-gradient-to-br from-red-50 to-rose-50'
                    : isOcupado 
                      ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50'
                      : 'border-slate-200 bg-white hover:border-primary hover:shadow-lg hover:shadow-primary/10'
                }`}>
                  <div className="relative z-10 p-5">
                    {/* Ícone do armário */}
                    <div className="flex items-center justify-center mb-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        isOcupado 
                          ? 'bg-amber-500'
                          : isManutencao
                            ? 'bg-red-500'
                            : 'bg-gradient-to-br from-slate-100 to-slate-200'
                      }`}>
                        <Lock size={36} className={isOcupado || isManutencao ? 'text-white' : 'text-slate-600'} />
                      </div>
                    </div>

                    {/* Número do armário */}
                    <div className="text-center mb-3">
                      <span className={`text-2xl font-black ${isOcupado ? 'text-slate-800' : 'text-slate-400'}`}>
                        {String(locker.number).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold mb-3 w-full ${
                      isManutencao 
                        ? 'bg-red-100 text-red-700' 
                        : isOcupado 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isManutencao ? <AlertCircle size={12} /> : isOcupado ? <Lock size={12} /> : <LockOpen size={12} />}
                      {isManutencao ? 'Manutenção' : isOcupado ? 'Ocupado' : 'Livre'}
                    </div>

                    {/* Informações do visitante */}
                    {isOcupado && locker.visitorName && (
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-slate-800 text-center truncate">{locker.visitorName}</p>
                      </div>
                    )}

                    {!isOcupado && !isManutencao && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLockerClick(locker); }}
                        className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <Lock size={16} />
                        OCUPAR
                      </button>
                    )}
                  </div>

                  {isOcupado && (
                    <div className="p-3 bg-white/80 border-t border-slate-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); releaseLocker(locker); }}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <Unlock size={14} />
                        LIBERAR
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
                    <h3 className="text-xl font-bold">Ocupar Armário</h3>
                    <p className="text-white/80 text-sm">Armário {selectedLocker?.number}</p>
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
                        onClick={() => assignLocker(visitor)}
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
                  onClick={() => setIsSearchOpen(false)}
                  className="w-full py-4 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer type="lockers" />
    </div>
  );
}