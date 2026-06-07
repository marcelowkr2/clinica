const API_BASE_URL = 'http://127.0.0.1:8000/api';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiRequest = async (
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<any> => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    throw new ApiError('Token de autenticação não encontrado', 401);
  }

  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: 'Erro desconhecido' };
      }
      
      throw new ApiError(
        errorData.detail || errorData.message || `Erro ${response.status}`,
        response.status,
        errorData
      );
    }

    // Se a resposta não tem conteúdo (204 No Content), retorna null
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      'Erro de conexão. Verifique se o servidor está funcionando.',
      0,
      error
    );
  }
};

// Funções específicas para diferentes endpoints
export const transacaoApi = {
  listar: () => apiRequest('/api/financeiro/transacoes'),
  criar: (data: any) => apiRequest('/api/financeiro/transacoes/', { method: 'POST', body: data }),
  obter: (id: number) => apiRequest(`/api/financeiro/transacoes/${id}/`),
  atualizar: (id: number, data: any) => apiRequest(`/api/financeiro/transacoes/${id}/`, { method: 'PUT', body: data }),
  deletar: (id: number) => apiRequest(`/api/financeiro/transacoes/${id}/`, { method: 'DELETE' }),
  criarAutomatica: (data: any) => apiRequest('/api/financeiro/transacao-automatica', { method: 'POST', body: data }),
};

export const estatisticasApi = {
  obter: () => apiRequest('/api/financeiro/estatisticas'),
};

export const internacaoApi = {
  listar: () => apiRequest('/api/internacao/internacoes'),
  criar: (data: any) => apiRequest('/api/internacao/internacoes/', { method: 'POST', body: data }),
  obter: (id: number) => apiRequest(`/api/internacao/internacoes/${id}/`),
  atualizar: (id: number, data: any) => apiRequest(`/api/internacao/internacoes/${id}/`, { method: 'PUT', body: data }),
  deletar: (id: number) => apiRequest(`/api/internacao/internacoes/${id}/`, { method: 'DELETE' }),
};

export const agendamentoApi = {
  listar: () => apiRequest('/api/agendamento/agendamentos'),
  criar: (data: any) => apiRequest('/api/agendamento/agendamentos/', { method: 'POST', body: data }),
  obter: (id: number) => apiRequest(`/api/agendamento/agendamentos/${id}/`),
  atualizar: (id: number, data: any) => apiRequest(`/api/agendamento/agendamentos/${id}/`, { method: 'PUT', body: data }),
  deletar: (id: number) => apiRequest(`/api/agendamento/agendamentos/${id}/`, { method: 'DELETE' }),
};

export const banhoTosaApi = {
  listar: () => apiRequest('/api/banho-tosa/banho-tosas'),
  criar: (data: any) => apiRequest('/api/banho-tosa/banho-tosas/', { method: 'POST', body: data }),
  obter: (id: number) => apiRequest(`/api/banho-tosa/banho-tosas/${id}/`),
  atualizar: (id: number, data: any) => apiRequest(`/api/banho-tosa/banho-tosas/${id}/`, { method: 'PUT', body: data }),
  deletar: (id: number) => apiRequest(`/api/banho-tosa/banho-tosas/${id}/`, { method: 'DELETE' }),
};