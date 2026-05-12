import { api } from '../lib/api';

export interface Visitor {
    id?: string;
    full_name: string;
    cpf?: string;
    passport?: string;
    is_foreigner: boolean;
    gender?: string;
    category?: string;
    phone?: string;
    email?: string;
    address?: string;
    created_at?: string;
}

export const visitorService = {
    async findByDocument(document: string, isForeigner: boolean) {
        const column = isForeigner ? 'passport' : 'cpf';
        const { data, error } = await api.get<Visitor[]>(`/visitantes?${column}=${document}`);
        return { data: data?.[0] || null, error };
    },

    async listAll() {
        const { data, error } = await api.get<Visitor[]>('/visitantes');
        return { data: data || [], error };
    },

    async create(visitor: Omit<Visitor, 'id' | 'created_at'>) {
        const { data, error } = await api.post<Visitor>('/visitantes', visitor);
        return { data, error };
    },

    async update(id: string, updates: Partial<Visitor>) {
        const { data, error } = await api.put<Visitor>(`/visitantes/${id}`, updates);
        return { data, error };
    },

    async delete(id: string) {
        const { error } = await api.delete(`/visitantes/${id}`);
        return { error };
    }
};