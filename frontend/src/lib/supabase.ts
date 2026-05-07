import { api } from './api';

function toCamelCase(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(item => toCamelCase(item));
    if (typeof obj !== 'object') return obj;
    
    const result: any = {};
    for (const key in obj) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = toCamelCase(obj[key]);
    }
    return result;
}

function toSnakeCase(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(item => toSnakeCase(item));
    if (typeof obj !== 'object') return obj;
    
    const result: any = {};
    for (const key in obj) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        result[snakeKey] = toSnakeCase(obj[key]);
    }
    return result;
}

const tableMap: Record<string, string> = {
    'espacos': 'spaces',
    'visitantes': 'visitors',
    'visitas': 'visits',
    'armarios': 'lockers',
    'computadores': 'computadores',
    'usuarios': 'usuarios',
    'agendamentos': 'agendamentos',
    'assinaturas_digitais': 'assinaturas_digitais',
    'auditoria': 'auditoria',
    'configuracoes': 'configuracoes',
    'computers': 'computadores',
    'users': 'usuarios',
    'lockers': 'lockers',
    'configuracao': 'configuracoes'
};

function mapTable(table: string): string {
    return tableMap[table] || table;
}

function buildQuery(filters: string[]): string {
    return filters.length ? `?${filters.join('&')}` : '';
}

function createQueryExecutor(endpoint: string, filters: string[], method?: string, body?: any) {
    return async (): Promise<any> => {
        const query = buildQuery(filters);
        if (method === 'POST') {
            const { data } = await api.post<any>(`/${endpoint}`, body ? toCamelCase(body) : undefined);
            if (!data) return [];
            return toSnakeCase(Array.isArray(data) ? data : [data]);
        } else if (method === 'PATCH') {
            const id = filters[0]?.split('=')[1] || '';
            const { data } = await api.patch<any>(`/${endpoint}/${id}`, toCamelCase(body));
            if (!data) return [];
            return toSnakeCase(Array.isArray(data) ? data : [data]);
        } else if (method === 'DELETE') {
            const id = filters[0]?.split('=')[1] || '';
            await api.delete(`/${endpoint}/${id}`);
            return { success: true };
        }
        const { data } = await api.get<any[]>(`/${endpoint}${query}`);
        if (!data) return [];
        return toSnakeCase(Array.isArray(data) ? data : [data]);
    };
}

function createChainable(endpoint: string, filters: string[]) {
    const executor = createQueryExecutor(endpoint, filters);
    
    const chain: any = new Promise(async (resolve) => {
        const result = await executor();
        resolve(Array.isArray(result) ? result : result ? [result] : []);
    });
    
    chain.select = (_columns?: string) => {
        const f = [...filters];
        return createChainable(endpoint, f);
    };
    
    chain.eq = (field: string, value: any) => {
        const f = [...filters, `${field}=${value}`];
        return createChainable(endpoint, f);
    };
    
    chain.gte = (field: string, value: any) => {
        const f = [...filters, `${field}=gte.${value}`];
        const ch = createChainable(endpoint, f);
        ch.lte = (field2: string, value2: any) => {
            const f2 = [...f, `${field2}=lte.${value2}`];
            return createChainable(endpoint, f2);
        };
        return ch;
    };
    
    chain.lt = (field: string, value: any) => {
        const f = [...filters, `${field}=lt.${value}`];
        return createChainable(endpoint, f);
    };
    
    chain.lte = (field: string, value: any) => {
        const f = [...filters, `${field}=lte.${value}`];
        return createChainable(endpoint, f);
    };
    
    chain.neq = (field: string, value: any) => {
        const f = [...filters, `${field}=neq.${value}`];
        return createChainable(endpoint, f);
    };
    
    chain.in = (field: string, values: any[]) => {
        const f = [...filters, `${field}=in.(${values.join(',')})`];
        return createChainable(endpoint, f);
    };
    
    chain.order = (field: string, _opts?: any) => {
        const f = [...filters, `order=${field}`];
        return createChainable(endpoint, f);
    };
    
    chain.limit = (n: number) => {
        const f = [...filters, `limit=${n}`];
        return createChainable(endpoint, f);
    };
    
    chain.range = (from: number, to: number) => {
        const f = [...filters, `range=${from},${to}`];
        return createChainable(endpoint, f);
    };
    
    chain.single = async () => {
        const { data } = await api.get<any>(`/${endpoint}${buildQuery(filters)}`);
        return { data: toSnakeCase(data), error: null };
    };
    
    chain.insert = (data: any) => {
        const insertChain: any = new Promise(async (resolve) => {
            const executor = createQueryExecutor(endpoint, filters, 'POST', data);
            const result = await executor();
            resolve(result);
        });
        
        insertChain.select = () => insertChain;
        insertChain.then = (onFulfilled: any, onRejected?: any) => {
            return executor().then((result: any) => {
                const arr = Array.isArray(result) ? result : result ? [result] : [];
                onFulfilled(arr);
            }, onRejected);
        };
        insertChain.single = async () => {
            const executor = createQueryExecutor(endpoint, filters, 'POST', data);
            const result = await executor();
            return { data: result, error: null };
        };
        
        return insertChain;
    };
    
    chain.update = (data: any) => {
        const updateChain: any = {};
        
        updateChain.eq = (field: string, value: any) => {
            const f = [...filters, `${field}=${value}`];
            const uc: any = new Promise(async (resolve) => {
                const executor = createQueryExecutor(endpoint, f, 'PATCH', data);
                const result = await executor();
                resolve(result);
            });
            uc.then = (onFulfilled: any, onRejected?: any) => {
                return executor().then((result: any) => {
                    const arr = Array.isArray(result) ? result : result ? [result] : [];
                    onFulfilled(arr);
                }, onRejected);
            };
            return uc;
        };
        
        return updateChain;
    };
    
    chain.delete = () => {
        const deleteChain: any = {};
        
        deleteChain.eq = (field: string, value: any) => {
            const f = [...filters, `${field}=${value}`];
            const dc: any = new Promise(async (resolve) => {
                const executor = createQueryExecutor(endpoint, f, 'DELETE');
                await executor();
                resolve({ success: true });
            });
            dc.then = (onFulfilled: any, onRejected?: any) => {
                return executor().then((result: any) => {
                    const arr = Array.isArray(result) ? result : result ? [result] : [];
                    onFulfilled(arr);
                }, onRejected);
            };
            return dc;
        };
        
        return deleteChain;
    };
    
    chain.then = (onFulfilled: any, onRejected?: any) => {
        return executor().then(
            (result: any) => {
                const arr = Array.isArray(result) ? result : result ? [result] : [];
                onFulfilled(arr);
            },
            onRejected
        );
    };
    
    chain.catch = (onRejected: any) => {
        return executor().catch(onRejected);
    };
    
    return chain;
}

export const supabase = {
    auth: {
        getSession: async () => {
            const token = localStorage.getItem('gvc_token');
            const user = localStorage.getItem('gvc_user');
            if (token) {
                return {
                    data: { 
                        session: { 
                            access_token: token, 
                            user: user ? JSON.parse(user) : null,
                            expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
                        } 
                    },
                    error: null
                };
            }
            return { data: { session: null }, error: null };
        },
        
        getUser: async () => {
            const user = localStorage.getItem('gvc_user');
            if (user) {
                return { data: { user: JSON.parse(user) }, error: null };
            }
            return { data: { user: null }, error: null };
        },

        signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
            const { data, error } = await api.post<any>('/auth/login', { email, senha: password });
            if (data?.token) {
                localStorage.setItem('gvc_token', data.token);
                localStorage.setItem('gvc_user', JSON.stringify(data.user));
                return { 
                    data: { 
                        user: data.user, 
                        session: { access_token: data.token, user: data.user }
                    }, 
                    error: null 
                };
            }
            return { data: { user: null, session: null }, error: { message: error?.message || 'Login failed' } };
        },
        
        signOut: async () => {
            localStorage.removeItem('gvc_token');
            localStorage.removeItem('gvc_user');
            return { error: null };
        },
        
        onAuthStateChange: () => {
            return { data: { subscription: { unsubscribe: () => {} } } };
        },
        
        updateUser: async () => ({ data: { user: null }, error: null }),
        signUp: async () => ({ data: { user: null, session: null }, error: null }),
        signInWithOAuth: async () => ({ data: { user: null, session: null }, error: null }),
        signInWithOtp: async () => ({ data: { user: null, session: null }, error: null }),
        resetPasswordForEmail: async () => ({ data: {}, error: null }),
    },
    
    from: (table: string) => {
        const endpoint = mapTable(table);
        return createChainable(endpoint, []);
    },
    
    channel: (_name: string) => ({
        on: () => ({ subscribe: () => ({}) }),
        subscribe: () => ({})
    }),
    
    removeChannel: async () => ({ data: null, error: null }),
    getChannels: () => []
};