import { api } from '../lib/api';

export interface VisitWithVisitor {
    id: string;
    visitor_id: string;
    nome: string;
    perfil: string;
    local: string;
    espaco_id: string;
    checkin: string;
    checkout: string | null;
    status: string;
    armario: string | null;
    visitors?: {
        full_name: string;
        cpf: string | null;
        passport: string | null;
        is_foreigner: boolean;
    };
}

export const visitService = {
    async listActive(espacoId: string) {
        const { data, error } = await api.get<VisitWithVisitor[]>(
            `/visits?espaco_id=${espacoId}&status=Ativo,Excedido&order=checkin`
        );
        return { data: data || [], error };
    },

    async listHistory(espacoId: string, limit = 50) {
        const { data, error } = await api.get<VisitWithVisitor[]>(
            `/visits?espaco_id=${espacoId}&limit=${limit}&order=checkin`
        );
        return { data: data || [], error };
    },

    async countToday(espacoId: string) {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await api.get<{ count: number }[]>(
            `/visits/count?espaco_id=${espacoId}&date=${today}`
        );
        return { count: data?.[0]?.count || 0, error };
    },

    async checkin(payload: { visitorId: string, espacoId: string | null, perfil: string, nome?: string, local?: string }) {
        const { data, error } = await api.post<VisitWithVisitor>('/visits/checkin', payload);
        return { data, error };
    },

    async checkout(id: string) {
        const { data, error } = await api.post<VisitWithVisitor>(`/visits/checkout/${id}`);
        return { data, error };
    },

    async undoCheckin(id: string) {
        const { error } = await api.delete(`/visits/${id}`);
        return { error };
    }
};