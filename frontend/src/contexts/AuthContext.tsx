import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getTokenStored, removeToken } from '../lib/api';
import { SystemUser, SpaceConfig } from '../types';

interface AuthContextType {
  user: any;
  userData: SystemUser | null;
  spaceConfig: SpaceConfig | null;
  loading: boolean;
  isAdmin: boolean;
  isCoordinator: boolean;
  isStaff: boolean;
  isMonitor: boolean;
  isSuperadmin: boolean;
  isPublic: boolean;
  isCitizen: boolean;
  hasPermission: (path: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<SystemUser | null>(null);
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const token = getTokenStored();
      
      if (token) {
        try {
          const { data, error } = await api.get<{ id: string; nome: string; email: string; perfil: string; espacoId: string; espacoNome: string }>('/auth/sessao');
          
          if (data && !error) {
            setUser(data);
            setUserData({
              id: data.id,
              nome: data.nome,
              email: data.email,
              perfil: data.perfil,
              espacoId: data.espacoId,
              espacoNome: data.espacoNome,
              ativo: true
            });

            if (data.espacoId && data.espacoId !== 'todos') {
              const { data: sData } = await api.get<any>(`/espacos/${data.espacoId}`);
              if (sData) {
                setSpaceConfig(formatSpace(sData));
              }
            }
          } else {
            removeToken();
          }
        } catch (e) {
          removeToken();
        }
      }
      
      setLoading(false);
    }

    checkSession();
  }, []);

  function formatSpace(data: any): SpaceConfig {
    return {
      id: data.id,
      nome: data.nome,
      municipio: data.municipio,
      totalArmarios: data.total_armarios || data.totalArmarios,
      mensagemBoasVindas: data.mensagem_boas_vindas || data.mensagemBoasVindas,
      tempoLimiteExcedido: data.tempo_limite_excedido || data.tempoLimiteExcedido,
      capacidadeVisitantes: data.capacidade_visitantes || data.capacidadeVisitantes,
      horarioFuncionamento: data.horario_funcionamento || data.horarioFuncionamento,
      perfilArmarios: data.perfil_armarios ?? data.perfilArmarios,
      perfilTelecentro: data.perfil_telecentro ?? data.perfilTelecentro,
      perfilAgendamento: data.perfil_agendamento ?? data.perfilAgendamento,
      totalComputadores: data.total_computadores || data.totalComputadores,
      tempoLimiteComputador: data.tempo_limite_computador || data.tempoLimiteComputador,
      capacidadeAgendamento: data.capacidade_agendamento || data.capacidadeAgendamento
    };
  }

  const isAdmin = userData?.perfil === 'administrador';
  const isCoordinator = userData?.perfil === 'coordenador' || isAdmin;
  const isStaff = userData?.perfil === 'funcionario' || isCoordinator;
  const isInternalUser = ['administrador', 'coordenador', 'funcionario', 'monitor'].includes(userData?.perfil || '');
  
  const isMonitor = userData?.perfil === 'monitor' || isAdmin;
  const isSuperadmin = isAdmin;
  const isCitizen = !isInternalUser;
  const isPublic = !isInternalUser;

  const hasPermission = (path: string) => {
    const p = path.replace(/^\//, '') || 'painel';
    if (isAdmin) return true;
    
    const pathMap: Record<string, string> = {
      '': 'painel',
      'visitantes': 'visitantes',
      'armarios': 'armarios',
      'telecentro': 'telecentro',
      'agendamento': 'agendamento',
      'relatorios': 'relatorios',
      'configuracoes': 'configuracoes'
    };
    
    const permissionKey = pathMap[p] || p;

    const PERMISSIONS: Record<string, string[]> = {
      coordenador: ["painel", "visitantes", "relatorios"],
      funcionario: ["painel", "visitantes", "armarios"],
      monitor: ["painel", "visitantes", "telecentro"]
    };

    const perfil = userData?.perfil || 'vazio';
    const allowed = PERMISSIONS[perfil] || [];
    
    return allowed.includes(permissionKey);
  };

  const logout = async () => {
    removeToken();
    window.location.href = '/gerenciamento';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      spaceConfig,
      loading, 
      isAdmin, 
      isCoordinator, 
      isStaff,
      isMonitor,
      isSuperadmin,
      isPublic,
      isCitizen,
      hasPermission,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};