import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { visitorService, Visitor } from '../../services/visitorService';
import { visitService } from '../../services/visitService';
import { spaceService } from '../../services/spaceService';
import { api } from '../../lib/api';
import { 
  Monitor, 
  MonitorOff,
  CheckCircle2,
  AlertCircle,
  Search,
  User,
  X,
  UserPlus,
  Clock,
  Unlock,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Footer from '../layout/PageFooter';

interface Computador {
  id: string;
  numero: number;
  status: 'Livre' | 'Em Uso' | 'Excedido';
  usuarioId?: string;
  usuarioNome?: string;
  horarioInicio?: any;
  horarioLimite?: any;
  espacoId?: string;
  espacoNome?: string;
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
  const [tick, setTick] = useState(0);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');

  useEffect(() => {
    if (userData?.espacoId === 'todos') {
      spaceService.listAll().then(({ data }) => {
        if (data) setSpaces(data);
      });
    }
  }, [userData]);

  const isGlobalAdmin = userData?.perfil === 'administrador' && 
    (!userData.espacoId || userData.espacoId === 'todos');
  
  const espacoId = isGlobalAdmin 
    ? (selectedSpaceId || null)
    : userData?.espacoId;

  const totalComputadoresCount = isGlobalAdmin
    ? 10
    : (spaceConfig?.totalComputadores || 10);
  const limiteMaximoMinutos = isGlobalAdmin
    ? 30
    : (spaceConfig?.tempoLimiteComputador || 30);

  // Timer para atualizar contagem regressiva
  useEffect(() => {
    const interval = setInterval(() => setTick(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Buscar computadores
  useEffect(() => {
    if (!userData) return;

    const espacoId = isGlobalAdmin 
      ? (selectedSpaceId || null)
      : userData.espacoId;

    const fetchComputadores = async () => {
      const query = espacoId ? `?espacoId=${espacoId}` : '';
      const { data, error } = await api.get<any[]>(`/computadores${query}`);

      if (error) {
        console.error("Erro ao carregar computadores:", error);
        setLoading(false);
        return;
      }

      const fullList: Computador[] = [];
      for (let i = 1; i <= totalComputadoresCount; i++) {
        const existing = (data || []).find(c => c.numero === i || c.numero === i.toString());
        fullList.push(existing ? {
          id: existing.id,
          numero: existing.numero,
          status: existing.status as any,
          usuarioId: existing.usuarioId || existing.usuario_id,
          usuarioNome: existing.usuarioNome || existing.usuario_nome,
          horarioInicio: existing.horarioInicio || existing.horario_inicio,
          horarioLimite: existing.horarioLimite || existing.horario_limite,
          espacoId: existing.espacoId || existing.espaco_id,
          espacoNome: existing.espacoNome || existing.espaco_nome
        } : {
          id: `temp-pc-${i}`,
          numero: i,
          status: 'Livre'
        });
      }

      setComputadores(fullList.sort((a, b) => a.numero - b.numero));
      setLoading(false);
    };

    fetchComputadores();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchComputadores, 30000);
    return () => clearInterval(interval);
  }, [totalComputadoresCount, userData, selectedSpaceId]);

  // Buscar visitantes para o modal
  useEffect(() => {
    if (searchTerm.length > 2) {
      const searchVisitors = async () => {
        const { data } = await visitorService.listAll();
        if (!data) return;

        const filtered = (data || []).filter((v: any) => {
          const searchLower = searchTerm.toLowerCase();
          const cleanTokenSearch = searchLower.replace(/[^\d]/g, '');
          const searchTokens = searchLower.split(/\s+/).filter(t => t.length > 0);

          const nameMatches = searchTokens.length > 0 && searchTokens.every(token =>
            (v.fullName || v.full_name || '').toLowerCase().includes(token)
          );

          const cpfMatches = v.cpf && cleanTokenSearch && v.cpf.includes(cleanTokenSearch);
          const passportMatches = v.passport && searchLower && v.passport.toLowerCase().includes(searchLower);

          return nameMatches || cpfMatches || passportMatches;
        });

        setSearchResults((filtered || []).map(v => ({
          id: v.id,
          fullName: v.fullName || v.full_name,
          cpf: v.cpf,
          passport: v.passport
        })).slice(0, 5));
      };

      searchVisitors();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, userData]);

  const abrirBuscaVisitante = (computador: Computador) => {
    if (computador.status !== 'Livre') return;
    setSelectedComputador(computador);
    setIsSearchOpen(true);
    setSearchTerm('');
  };

  const iniciarComputador = async (visitante: any) => {
    if (!selectedComputador || !userData) return;

    const isGlobalAdmin = userData.perfil === 'administrador' &&
      (!userData.espacoId || userData.espacoId === 'todos');
    const targetEspacoId = isGlobalAdmin
      ? (selectedSpaceId || null)
      : userData.espacoId;

    try {
      // Verificar se visitante tem check-in ativo
      const { data: activeVisits } = await api.get<any[]>(
        `/visits?visitorId=${visitante.id}&status=Ativo&espacoId=${targetEspacoId || ''}`
      );

      if (!activeVisits || activeVisits.length === 0) {
        setToast({
          message: 'ERRO: Visitante não possui check-in ativo neste espaço.',
          type: 'error'
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      if (targetEspacoId) {
        const { data: existing } = await api.get<any[]>(
          `/computadores?espacoId=${targetEspacoId}&usuarioId=${visitante.id}&status=Em Uso`
        );

        if (existing && existing.length > 0) {
          setToast({
            message: `ERRO: Este visitante já está utilizando o computador ${existing[0].numero}`,
            type: 'error'
          });
          setTimeout(() => setToast(null), 5000);
          return;
        }
      }

      const agora = new Date();
      const limite = new Date(agora.getTime() + limiteMaximoMinutos * 60000);

      await api.post('/computadores', {
        numero: selectedComputador.numero,
        status: 'Em Uso',
        usuarioId: visitante.id,
        usuarioNome: visitante.fullName,
        espacoId: targetEspacoId,
        espacoNome: (spaces || []).find(s => s.id === targetEspacoId)?.nome || '',
        horarioInicio: agora.toISOString(),
        horarioLimite: limite.toISOString()
      });

      setToast({ message: `Computador ${selectedComputador.numero} iniciado com sucesso!`, type: 'success' });
      setIsSearchOpen(false);
      setSelectedComputador(null);
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error(error);
      setToast({ message: "Erro ao iniciar computador.", type: 'error' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const liberarComputador = async (computadorId: string) => {
    try {
      await api.delete(`/computadores/${computadorId}`);
      setToast({ message: `Computador liberado com sucesso!`, type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error("Erro ao liberar computador:", error);
      setToast({ message: "Erro ao liberar computador. Tente novamente.", type: 'error' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  // ... (manter as funções formatarHora, calcularTempoRestante, etc. - estão OK)

  const formatarHora = (timestamp: any) => {
    if (!timestamp) return "--:--";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const calcularTempoRestante = (horarioLimite: any) => {
    if (!horarioLimite) return null;
    const agora = new Date();
    const limite = new Date(horarioLimite);
    const diff = limite.getTime() - agora.getTime();
    if (diff <= 0) return { minutos: 0, segundos: 0, excedido: true };
    const minutos = Math.floor(diff / 60000);
    const segundos = Math.floor((diff % 60000) / 1000);
    return { minutos, segundos, excedido: false };
  };

  const formatarTimer = (tempo: any) => {
    if (!tempo) return "00:00";
    if (tempo.excedido) return "00:00";
    return `${String(tempo.minutos).padStart(2, "0")}:${String(tempo.segundos).padStart(2, "0")}`;
  };

  const calcularPorcentagem = (tempoRestante: any) => {
    if (!tempoRestante || tempoRestante.excedido) return 0;
    const totalSegundos = tempoRestante.minutos * 60 + tempoRestante.segundos;
    const totalMaximoSegundos = limiteMaximoMinutos * 60;
    const perc = (totalSegundos / totalMaximoSegundos) * 100;
    return perc > 100 ? 100 : perc;
  };

  const obterStatusComputador = (computador: Computador) => {
    if (computador.status === "Livre") return "Livre";
    const agora = new Date();
    const limite = computador.horarioLimite ? new Date(computador.horarioLimite) : null;
    if (limite && agora > limite) return "Excedido";
    return "Em Uso";
  };

  // ... (manter o JSX de retorno - está OK, só remover imports do supabase)

  if (!userData) return null;

  if (!isGlobalAdmin && (!spaceConfig || !spaceConfig?.perfilTelecentro)) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Módulo de Telecentro Desativado</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Este espaço cultural não possui o perfil de telecentro ativo. 
          Entre em contato com o administrador para habilitar esta funcionalidade.
        </p>
      </div>
    );
  }

  // Para admin global, mostrar seletor de espaços
  if (isGlobalAdmin && !selectedSpaceId) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
          <Monitor size={48} />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Selecione um Espaço</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-4">
          Como administrador global, selecione um espaço para gerenciar o Telecentro.
        </p>
        <select 
          value={selectedSpaceId} 
          onChange={e => setSelectedSpaceId(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
        >
          <option value="">Selecione um espaço</option>
          {(spaces || []).map(s => (
            <option key={s.id} value={s.id}>{s.nome}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* ... (manter todo o JSX existente) ... */}
      <Footer type="telecentro" />
    </div>
  );
} 