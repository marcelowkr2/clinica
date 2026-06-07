import api from './api';

export interface ServicoProcedimento {
  id: number;
  nome: string;
  descricao?: string;
  preco: number | string;
  tempo_estimado: number;
}

export interface Procedimento {
  id: number;
  paciente: number;
  paciente_nome: string;
  responsavel_nome: string;
  responsavel_telefone: string;
  servicos: number[];
  servicos_nomes: string[];
  data_agendamento: string;
  data_inicio?: string;
  data_fim?: string;
  data_realizacao?: string;
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string;
  valor_total: number;
  profissional?: number | string | { id: number; first_name: string; last_name: string; [key: string]: any };
  profissional_nome?: string;
  profissional_dados?: {
    id: number;
    first_name: string;
    last_name: string;
    nome_completo: string;
  };
  data_atualizacao: string;
}

export interface AvaliacaoProcedimento {
  id: number;
  procedimento: number;
  nota: number;
  comentario?: string;
  data_avaliacao: string;
}

export interface FotoProcedimento {
  id: number;
  procedimento: number;
  foto: string;
  descricao?: string;
  data_upload: string;
}

export interface ProcedimentoEstatisticas {
  total: number;
  agendados: number;
  em_andamento: number;
  concluidos: number;
  hoje: number;
  receita: number;
  receita_hoje: number;
}

class ProcedimentosService {
  async getServicos(): Promise<ServicoProcedimento[]> {
    const response = await api.get('/api/procedimentos/servicos/');
    return response.data.results || response.data;
  }

  async getProcedimentos(params?: {
    status?: string;
    search?: string;
    data?: string;
  }): Promise<Procedimento[]> {
    const response = await api.get('/api/procedimentos/atendimentos/', { params });
    return response.data.results || response.data;
  }

  async getProcedimento(id: number): Promise<Procedimento> {
    const response = await api.get(`/api/procedimentos/atendimentos/${id}/`);
    return response.data;
  }

  async createProcedimento(data: Partial<Procedimento>): Promise<Procedimento> {
    const response = await api.post('/api/procedimentos/atendimentos/', data);
    return response.data;
  }

  async updateProcedimento(id: number, data: Partial<Procedimento>): Promise<Procedimento> {
    const response = await api.put(`/api/procedimentos/atendimentos/${id}/`, data);
    return response.data;
  }

  async deleteProcedimento(id: number): Promise<void> {
    await api.delete(`/api/procedimentos/atendimentos/${id}/`);
  }

  async getEstatisticas(): Promise<ProcedimentoEstatisticas> {
    const response = await api.get('/api/procedimentos/atendimentos/estatisticas/');
    return response.data;
  }
}

export default new ProcedimentosService();
