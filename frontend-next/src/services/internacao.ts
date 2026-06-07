import api from './api';

export interface Internacao {
  id: number;
  paciente: number;
  paciente_nome: string;
  responsavel_nome: string;
  responsavel_telefone: string;
  medico_responsavel: number;
  medico_nome: string;
  data_entrada: string;
  data_alta?: string;
  motivo: string;
  diagnostico?: string;
  observacoes_entrada?: string;
  observacoes_alta?: string;
  status: 'internado' | 'alta' | 'transferido' | 'obito';
  valor_diaria: string;
  dias_internado: number;
  data_criacao: string;
  data_atualizacao: string;
}

export interface EvolucoesInternacao {
  id: number;
  internacao: number;
  medico: number;
  medico_nome: string;
  data_hora: string;
  evolucao: string;
  temperatura?: number;
  peso?: number;
  observacoes?: string;
}

export interface InternacaoEstatisticas {
  total: number;
  ativas: number;
  alta_hoje: number;
  receita_ativa: number;
}

const InternacaoService = {
  async getInternacoes(params?: {
    status?: string;
    search?: string;
  }): Promise<Internacao[]> {
    const response = await api.get('/api/internacoes/', { params });
    return response.data.results || response.data;
  },

  async getInternacao(id: number): Promise<Internacao> {
    const response = await api.get(`/api/internacoes/${id}/`);
    return response.data;
  },

  async createInternacao(data: Partial<Internacao>): Promise<Internacao> {
    const response = await api.post('/api/internacoes/', data);
    return response.data;
  },

  async updateInternacao(id: number, data: Partial<Internacao>): Promise<Internacao> {
    const response = await api.patch(`/api/internacoes/${id}/`, data);
    return response.data;
  },

  async deleteInternacao(id: number): Promise<void> {
    await api.delete(`/api/internacoes/${id}/`);
  },

  async getEstatisticas(): Promise<InternacaoEstatisticas> {
    const response = await api.get('/api/internacoes/estatisticas/');
    return response.data;
  },

  async getEvolucoes(internacaoId?: number): Promise<EvolucoesInternacao[]> {
    const params = internacaoId ? { internacao: internacaoId } : {};
    const response = await api.get('/api/evolucoes/', { params });
    return response.data.results || response.data;
  },

  async createEvolucao(data: Partial<EvolucoesInternacao>): Promise<EvolucoesInternacao> {
    const response = await api.post('/api/evolucoes/', data);
    return response.data;
  }
};

export default InternacaoService;