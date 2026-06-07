import api from './api';

export interface Agendamento {
  id?: number | string;
  paciente: number;
  paciente_nome?: string;
  responsavel_nome?: string;
  responsavel_sobrenome?: string;
  medico: number;
  medico_nome?: string;
  servico: number;
  servico_nome?: string;
  data_hora: string;
  status: string;
  observacoes?: string;
  valor: number;
  data_criacao?: string;
  data_atualizacao?: string;
  tipo?: string; // Para identificar se é vacinação
}

export interface Servico {
  id: number;
  nome: string;
  descricao: string;
  valor: number | string;
  duracao: number;
}

export interface PacienteParaAgendamento {
  id: number;
  nome: string;
  convenio: string;
  plano?: string;
  responsavel: {
    id: number;
    user: {
      first_name: string;
      last_name: string;
      phone: string;
    };
  };
}

export class AppointmentsService {
  static async getAllAgendamentos(): Promise<Agendamento[]> {
    try {
      const response = await api.get('/api/agendamentos/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      throw error;
    }
  }

  static async createAgendamento(agendamento: Omit<Agendamento, 'id'>): Promise<Agendamento> {
    try {
      const response = await api.post('/api/agendamentos/', agendamento);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  }

  static async getAgendamento(id: number): Promise<Agendamento> {
    try {
      const response = await api.get(`/api/agendamentos/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error);
      throw error;
    }
  }

  static async updateAgendamento(id: number, agendamento: Partial<Agendamento>): Promise<Agendamento> {
    try {
      const response = await api.put(`/api/agendamentos/${id}/`, agendamento);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      throw error;
    }
  }

  static async deleteAgendamento(id: number | string): Promise<void> {
    try {
      if (typeof id === 'string' && id.startsWith('vacina_')) {
        const vacinaId = id.replace('vacina_', '');
        await api.delete(`/api/agendamentos-vacina/${vacinaId}/`);
      } else {
        await api.delete(`/api/agendamentos/${id}/`);
      }
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      throw error;
    }
  }

  static async updateAgendamentoVacina(id: number, agendamento: Partial<Agendamento>): Promise<Agendamento> {
    try {
      const response = await api.put(`/api/agendamentos-vacina/${id}/`, agendamento);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar agendamento de vacinação:', error);
      throw error;
    }
  }

  static async getAllServicos(): Promise<Servico[]> {
    try {
      const response = await api.get('/api/servicos/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      throw error;
    }
  }

  static async getPacientesParaAgendamento(): Promise<PacienteParaAgendamento[]> {
    try {
      const response = await api.get('/api/pacientes-agendamento/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pacientes para agendamento:', error);
      throw error;
    }
  }
}