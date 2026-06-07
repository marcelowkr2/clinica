import api from './api';

export interface TipoExame {
  id: number;
  nome: string;
  descricao?: string;
  valor: number;
  tempo_resultado: number;
}

export interface Exame {
  id: number;
  paciente: number;
  paciente_nome: string;
  responsavel_nome: string;
  responsavel_telefone: string;
  tipo_exame: number;
  tipo_exame_nome: string;
  medico_solicitante: number;
  medico_nome: string;
  data_solicitacao: string;
  data_coleta?: string;
  data_resultado?: string;
  status: 'solicitado' | 'coletado' | 'processando' | 'concluido' | 'cancelado';
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
  observacoes_resultado?: string;
  resultado?: string;
  arquivo_resultado?: string;
  data_atualizacao: string;
}

export interface ParametroExame {
  id: number;
  exame: number;
  nome: string;
  valor: string;
  unidade?: string;
  valor_referencia?: string;
}

export interface ExameEstatisticas {
  total: number;
  pendentes: number;
  coletados: number;
  concluidos: number;
}

class ExamesService {
  async getTiposExame(): Promise<TipoExame[]> {
    const response = await api.get('/api/tipos-exame/');
    return response.data.results || response.data;
  }

  async getExames(params?: {
    status?: string;
    search?: string;
    prioridade?: string;
  }): Promise<Exame[]> {
    const response = await api.get('/api/exames/', { params });
    return response.data.results || response.data;
  }

  async getExame(id: number): Promise<Exame> {
    const response = await api.get(`/api/exames/${id}/`);
    return response.data;
  }

  async createExame(data: Partial<Exame>): Promise<Exame> {
    const response = await api.post('/api/exames/', data);
    return response.data;
  }

  async updateExame(id: number, data: Partial<Exame>): Promise<Exame> {
    const response = await api.patch(`/api/exames/${id}/`, data);
    return response.data;
  }

  async deleteExame(id: number): Promise<void> {
    await api.delete(`/api/exames/${id}/`);
  }

  async getEstatisticas(): Promise<ExameEstatisticas> {
    const response = await api.get('/api/exames/estatisticas/');
    return response.data;
  }

  async getParametros(exameId?: number): Promise<ParametroExame[]> {
    const params = exameId ? { exame: exameId } : {};
    const response = await api.get('/api/parametros/', { params });
    return response.data.results || response.data;
  }

  async createParametro(data: Partial<ParametroExame>): Promise<ParametroExame> {
    const response = await api.post('/api/parametros/', data);
    return response.data;
  }

  async updateParametro(id: number, data: Partial<ParametroExame>): Promise<ParametroExame> {
    const response = await api.put(`/api/parametros/${id}/`, data);
    return response.data;
  }
}

export default new ExamesService();