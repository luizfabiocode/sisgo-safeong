import {
  UserAuth,
  DoacaoItem,
  AlertaItem,
  LogItem,
  UsuarioItem,
  EstatisticasDoacoes,
  SystemStatus,
  FormaPagamento,
  StatusDoacao,
  CriticidadeAlerta,
  RiscoLog,
  UserStatus,
} from '../types';

const TOKEN_KEY = 'sisgo_auth_token';

export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.warn('Falha ao manipular token no localStorage', err);
  }
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include',
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = { sucesso: false, mensagem: 'Erro ao interpretar resposta do servidor.' };
  }

  if (!response.ok) {
    const errorMsg = data?.mensagem || data?.error || `Erro ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  auth: {
    login: async (login: string, senha: string) => {
      const data = await request<{
        sucesso: boolean;
        mensagem: string;
        token?: string;
        usuario: UserAuth;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login, senha }),
      });

      if (data.token) {
        setStoredToken(data.token);
      }
      return data;
    },

    me: async () => {
      return request<{
        sucesso: boolean;
        usuario: UserAuth;
      }>('/api/auth/me');
    },

    logout: async () => {
      try {
        await request<{ sucesso: boolean; mensagem: string }>('/api/auth/logout', {
          method: 'POST',
        });
      } finally {
        setStoredToken(null);
      }
    },
  },

  doacoes: {
    list: async (params?: { status?: StatusDoacao; formaPagamento?: FormaPagamento; limit?: number }) => {
      const search = new URLSearchParams();
      if (params?.status) search.append('status', params.status);
      if (params?.formaPagamento) search.append('formaPagamento', params.formaPagamento);
      if (params?.limit) search.append('limit', String(params.limit));

      const query = search.toString() ? `?${search.toString()}` : '';
      return request<{
        sucesso: boolean;
        total: number;
        doacoes: DoacaoItem[];
      }>(`/api/doacoes${query}`);
    },

    stats: async () => {
      return request<{
        sucesso: boolean;
        estatisticas: EstatisticasDoacoes;
      }>('/api/doacoes/stats');
    },

    create: async (payload: {
      valor: number;
      formaPagamento: FormaPagamento;
      status?: StatusDoacao;
    }) => {
      return request<{
        sucesso: boolean;
        mensagem: string;
        doacao: DoacaoItem;
      }>('/api/doacoes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  alertas: {
    list: async (params?: { criticidade?: CriticidadeAlerta; lido?: boolean }) => {
      const search = new URLSearchParams();
      if (params?.criticidade) search.append('criticidade', params.criticidade);
      if (params?.lido !== undefined) search.append('lido', String(params.lido));

      const query = search.toString() ? `?${search.toString()}` : '';
      return request<{
        sucesso: boolean;
        total: number;
        naoLidos: number;
        alertas: AlertaItem[];
      }>(`/api/alertas${query}`);
    },

    toggleLido: async (id: string, lido: boolean) => {
      return request<{
        sucesso: boolean;
        mensagem: string;
        alerta: AlertaItem;
      }>(`/api/alertas/${id}/lido`, {
        method: 'PATCH',
        body: JSON.stringify({ lido }),
      });
    },

    create: async (payload: { titulo: string; criticidade: CriticidadeAlerta; doacaoId?: string }) => {
      return request<{
        sucesso: boolean;
        mensagem: string;
        alerta: AlertaItem;
      }>('/api/alertas', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  logs: {
    list: async (params?: { risco?: RiscoLog; usuarioId?: string; limit?: number }) => {
      const search = new URLSearchParams();
      if (params?.risco) search.append('risco', params.risco);
      if (params?.usuarioId) search.append('usuarioId', params.usuarioId);
      if (params?.limit) search.append('limit', String(params.limit));

      const query = search.toString() ? `?${search.toString()}` : '';
      return request<{
        sucesso: boolean;
        total: number;
        logs: LogItem[];
      }>(`/api/logs${query}`);
    },
  },

  usuarios: {
    list: async () => {
      return request<{
        sucesso: boolean;
        total: number;
        usuarios: UsuarioItem[];
      }>('/api/usuarios');
    },

    updateStatus: async (id: string, status: UserStatus) => {
      return request<{
        sucesso: boolean;
        mensagem: string;
        usuario: UsuarioItem;
      }>(`/api/usuarios/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },

  status: async () => {
    return request<SystemStatus>('/api/status');
  },
};

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
};
