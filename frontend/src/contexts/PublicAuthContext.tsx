import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, getTokenStored, removeToken } from '../lib/api';

export interface PublicUser {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  tipo: 'cidadao' | 'escola' | 'ong' | 'empresa' | 'pessoa_fisica' | 'universidade';
}

interface PublicAuthContextType {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  loginWithGoogle: () => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  publicLoading: boolean;
}

const PublicAuthContext = createContext<PublicAuthContextType | undefined>(undefined);

export function PublicAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getTokenStored();
    if (token) {
      api.get<{ id: string; nome: string; email: string }>('/auth/me').then(({ data }) => {
        if (data) {
          setUser({
            id: data.id,
            email: data.email,
            nome: data.nome,
            tipo: 'cidadao'
          });
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await api.post<{ token: string; user: PublicUser }>('/auth/login', { email, senha: password }, false);
    if (data) {
      setToken(data.token);
      setUser(data.user);
      return { error: null };
    }
    return { error: error as Error | null };
  };

  const loginWithGoogle = async () => {
    return { error: new Error('Google OAuth não disponível') };
  };

  const logout = async () => {
    removeToken();
    setUser(null);
  };

  return (
    <PublicAuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, publicLoading: loading }}>
      {children}
    </PublicAuthContext.Provider>
  );
}

export function usePublicAuth() {
  const context = useContext(PublicAuthContext);
  if (context === undefined) {
    throw new Error('usePublicAuth must be used within a PublicAuthProvider');
  }
  return context;
}