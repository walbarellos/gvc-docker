import { api, setToken, removeToken, getTokenStored } from '../lib/api';

export interface UserProfile {
    id: string;
    nome: string;
    email: string;
    perfil: 'administrador' | 'coordenador' | 'funcionario' | 'monitor';
    espaco_id?: string;
    ativo: boolean;
}

export interface AuthResponse {
    token: string;
    user: UserProfile;
}

export const authService = {
    async signIn(email: string, password: string) {
        const { data, error } = await api.post<AuthResponse>('/auth/login', { email, senha: password }, false);
        
        if (data) {
            setToken(data.token);
            return { session: { access_token: data.token, user: data.user }, user: data.user, error: null };
        }
        
        return { session: null, user: null, error };
    },

    async signOut() {
        removeToken();
        return { error: null };
    },

    async getProfile(userId: string) {
        const { data, error } = await api.get<UserProfile>(`/auth/usuarios/${userId}`);
        return { data, error };
    },

    async getSession() {
        const token = getTokenStored();
        if (token) {
            const { data } = await api.get<{ id: string; nome: string; email: string; perfil: string }>('/auth/sessao');
            if (data) {
                return { session: { access_token: token, user: data }, error: null };
            }
        }
        return { session: null, error: null };
    },

    onAuthStateChange(_callback: (session: any) => void) {
        return { data: { subscription: { unsubscribe: () => {} } } };
    }
};