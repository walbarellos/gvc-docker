import { api } from '../lib/api';

export interface DashboardStats {
    visitasAtivas: number;
    visitasHoje: number;
    ocupacaoArmarios: number;
    totalArmarios: number;
    mediaDiaria: number;
}

export const dashboardService = {
    async getStats(espacoId: string): Promise<{ data: DashboardStats | null; error: any }> {
        const { data, error } = await api.get<DashboardStats>(`/dashboard/estatisticas?espaco_id=${espacoId}`);
        return { data, error };
    },

    async getVisitasPorHora(espacoId: string, data: string) {
        const { data, error } = await api.get<Record<number, number>>(
            `/dashboard/visitas-hora?espaco_id=${espacoId}&data=${data}`
        );
        return { data, error };
    }
};