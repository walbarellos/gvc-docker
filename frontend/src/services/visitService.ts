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
        const { data, error } = await api.get<VisitWithVisitor[]>(`/visits?${query}`);
        return { data: data || [], error };
    },

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

    async countByDateRange(startDate: string, endDate: string, espacoId?: string) {
        const query = buildVisitQuery(espacoId, {
            checkin_gte: startDate,
            checkin_lte: endDate
        });
        const { data, error } = await api.get<VisitWithVisitor[]>(`/visits?${query}`);
        return { count: data?.length || 0, error };
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