import { useState, useCallback } from 'react';
import { useSessionId } from './useSessionId';

interface RascunhoData {
  id?: string;
  dados: Record<string, unknown>;
  etapa: number;
}

export function useRascunhoAgendamento() {
  const sessionId = useSessionId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const salvarRascunho = useCallback(async (dados: Record<string, unknown>, etapa: number) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    setSalvo(false);
    
    try {
      const key = `rascunho_agendamento_${sessionId}`;
      const existente = localStorage.getItem(key);
      
      if (existente) {
        const rascunho = JSON.parse(existente);
        localStorage.setItem(key, JSON.stringify({
          ...rascunho,
          dados,
          etapa,
          updated_at: new Date().toISOString()
        }));
      } else {
        localStorage.setItem(key, JSON.stringify({
          session_id: sessionId,
          dados,
          etapa,
          current_step: etapa,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
      }
      
      setSalvo(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const carregarRascunho = useCallback(async (): Promise<RascunhoData | null> => {
    if (!sessionId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const key = `rascunho_agendamento_${sessionId}`;
      const data = localStorage.getItem(key);
      
      if (data) {
        const rascunho = JSON.parse(data);
        return {
          dados: rascunho.dados,
          etapa: rascunho.etapa || rascunho.current_step || 1
        };
      }
      return null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const limparRascunho = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const key = `rascunho_agendamento_${sessionId}`;
      localStorage.removeItem(key);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    }
  }, [sessionId]);

  return { salvarRascunho, carregarRascunho, limparRascunho, loading, error, salvo };
}