import { useEffect } from 'react';
import { api } from '../lib/api';

export function useAutoCheckout() {
  useEffect(() => {
    const checkAndExpireVisits = async () => {
      try {
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        
        const { data: exceededVisits, error: fetchError } = await api.get<any[]>(
          `/visitas?status=Ativo&checkin=lt.${oneHourAgo.toISOString()}`
        );

        if (fetchError) {
          console.error('Auto-checkout: erro ao buscar visitas', fetchError);
          return;
        }

        if (!exceededVisits || exceededVisits.length === 0) {
          return;
        }

        const now = new Date().toISOString();
        console.log(`Auto-checkout: ${exceededVisits.length} visita(s) encontrada(s) excedida(s)`);

        for (const visit of exceededVisits) {
          try {
            await api.put(`/visitas/${visit.id}`, {
              checkout: now
            });
          } catch (e) {
            console.error('Auto-checkout: erro ao atualizar', e);
          }
        }
        
        console.log(`Auto-checkout: ${exceededVisits.length} visita(s) encerrada(s) automaticamente`);
      } catch (error) {
        console.error('Auto-checkout: erro crítico', error);
      }
    };

    checkAndExpireVisits();
    
    const interval = setInterval(checkAndExpireVisits, 60000);
    
    return () => clearInterval(interval);
  }, []);
}