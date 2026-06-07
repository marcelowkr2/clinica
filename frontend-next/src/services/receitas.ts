import api from './api';

export interface Medicamento {
  id: number;
  nome: string;
  principio_ativo: string;
  concentracao?: string;
  forma_farmaceutica?: string;
  fabricante?: string;
}

export interface ItemReceita {
  id: number;
  receita: number;
  medicamento: number;
  medicamento_nome: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
  quantidade: number;
  via_administracao?: string;
  observacoes?: string;
}

export interface Receita {
  id: number;
  paciente: number;
  paciente_nome: string;
  responsavel_nome: string;
  responsavel_telefone: string;
  medico: number;
  medico_nome: string;
  data_prescricao: string;
  data_validade: string;
  diagnostico: string;
  observacoes?: string;
  status: 'ativa' | 'finalizada' | 'cancelada';
  is_vencida: boolean;
  data_atualizacao: string;
  itens?: ItemReceita[];
}

export interface ControleReceita {
  id: number;
  item_receita: number;
  medicamento_nome: string;
  data_administracao: string;
  administrador?: string;
}

export interface ReceitaEstatisticas {
  total: number;
  ativas: number;
  finalizadas: number;
  vencidas: number;
}

class ReceitasService {
  async getMedicamentos(search?: string): Promise<Medicamento[]> {
    const params = search ? { search } : {};
    const response = await api.get('/api/medicamentos/', { params });
    return response.data.results || response.data;
  }

  async getReceitas(params?: {
    status?: string;
    search?: string;
  }): Promise<Receita[]> {
    const response = await api.get('/api/receitas/', { params });
    return response.data.results || response.data;
  }

  async getReceita(id: number): Promise<Receita> {
    const response = await api.get(`/api/receitas/${id}/`);
    return response.data;
  }

  async createReceita(data: Partial<Receita>): Promise<Receita> {
    const response = await api.post('/api/receitas/', data);
    return response.data;
  }

  async updateReceita(id: number, data: Partial<Receita>): Promise<Receita> {
    const response = await api.put(`/api/receitas/${id}/`, data);
    return response.data;
  }

  async deleteReceita(id: number): Promise<void> {
    await api.delete(`/api/receitas/${id}/`);
  }

  async getEstatisticas(): Promise<ReceitaEstatisticas> {
    const response = await api.get('/api/receitas/estatisticas/');
    return response.data;
  }

  async getItensReceita(receitaId?: number): Promise<ItemReceita[]> {
    const params = receitaId ? { receita: receitaId } : {};
    const response = await api.get('/api/itens/', { params });
    return response.data.results || response.data;
  }

  async createItemReceita(data: Partial<ItemReceita>): Promise<ItemReceita> {
    const response = await api.post('/api/itens/', data);
    return response.data;
  }

  async updateItemReceita(id: number, data: Partial<ItemReceita>): Promise<ItemReceita> {
    const response = await api.put(`/api/itens/${id}/`, data);
    return response.data;
  }

  async deleteItemReceita(id: number): Promise<void> {
    await api.delete(`/api/itens/${id}/`);
  }

  async getControles(): Promise<ControleReceita[]> {
    const response = await api.get('/api/controles/');
    return response.data.results || response.data;
  }

  async createControle(data: Partial<ControleReceita>): Promise<ControleReceita> {
    const response = await api.post('/api/controles/', data);
    return response.data;
  }
}

export default new ReceitasService();