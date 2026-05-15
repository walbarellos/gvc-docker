import { api } from '../lib/api';

export interface VisitWithVisitor {
    id: string;
    visitorId: string;
    nome: string;
    perfil: string;
    local: string;
    espacoId: string;
    checkin: string;
    checkout: string | null;
    status: string;
    armario: string | null;
    visitor?: {
        fullName: string;
        cpf: string | null;
        passport: string | null;
        isForeigner: boolean;
    };
}

function buildVisitQuery(espacoId?: string, filters?: {
    status?: string;
    checkin_gte?: string;
    checkin_lte?: string;
    limit?: number;
    order?: 'asc' | 'desc';
}): string {
    const params = new URLSearchParams();
    if (espacoId) params.append('espaco_id', espacoId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.checkin_gte) params.append('checkin_gte', filters.checkin_gte);
    if (filters?.checkin_lte) params.append('checkin_lte', filters.checkin_lte);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.order) params.append('order', filters.order);
    return params.toString();
}

export const visitService = {
    async list(espacoId?: string, filters?: {
        status?: string;
        checkin_gte?: string;
        checkin_lte?: string;
        limit?: number;
        order?: 'asc' | 'desc';
    }) {
        const query = buildVisitQuery(espacoId, filters);
        const { data, error } = await api.get<VisitWithVisitor[]>(`/visitas?${query}`);
        return { data: data || [], error };
    },

    async listActive(espacoId: string) {
        const { data, error } = await api.get<VisitWithVisitor[]>(
            `/visitas?espaco_id=${espacoId}&status=Ativo,Excedido&order=checkin`
        );
        return { data: data || [], error };
    },

    async listHistory(espacoId: string, limit = 50) {
        const { data, error } = await api.get<VisitWithVisitor[]>(
            `/visitas?espaco_id=${espacoId}&limit=${limit}&order=checkin`
        );
        return { data: data || [], error };
    },

    async countToday(espacoId: string) {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await api.get<{ count: number }[]>(
            `/visitas/count?espaco_id=${espacoId}&date=${today}`
        );
        return { count: data?.[0]?.count || 0, error };
    },

    async countByDateRange(startDate: string, endDate: string, espacoId?: string) {
        const query = buildVisitQuery(espacoId, {
            checkin_gte: startDate,
            checkin_lte: endDate
        });
        const { data, error } = await api.get<VisitWithVisitor[]>(`/visitas?${query}`);
        return { count: data?.length || 0, error };
    },

    async checkin(payload: { visitorId: string, espacoId: string | null, perfil: string, nome?: string, local?: string }) {
        const { data, error } = await api.post<VisitWithVisitor>('/visitas/checkin', payload);
        return { data, error };
    },

    async checkout(id: string) {
        const { data, error } = await api.post<VisitWithVisitor>(`/visitas/checkout/${id}`);
        return { data, error };
    },

    async undoCheckin(id: string) {
        const { error } = await api.delete(`/visitas/${id}`);
        return { error };
    }
};