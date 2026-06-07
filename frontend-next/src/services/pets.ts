import api from './api';
import UsersService from './users';

export interface Paciente {
  id: number;
  nome: string;
  responsavel: number;
  convenio: number;
  plano?: number;
  data_nascimento?: string;
  sexo: 'M' | 'F';
  peso?: number;
  foto?: string;
  observacoes?: string;
}

export interface Convenio {
  id: number;
  nome: string;
}

export interface Plano {
  id: number;
  nome: string;
  convenio: number;
}

export interface Responsavel {
  id: number;
  user: number;
  endereco: string;
  data_cadastro: string;
}

export interface CreatePacienteData {
  nome: string;
  convenio: string;
  plano?: string;
  dataNascimento?: string;
  sexo: string;
  cor?: string;
  peso?: number;
  observacoes?: string;
  responsavel: {
    nome: string;
    email?: string;
    telefone: string;
    endereco?: string;
  };
}

export interface Vacina {
  id: number;
  nome: string;
  descricao?: string;
  periodo_reforco: number;
}

export interface VacinaAplicada {
  id: number;
  paciente: number;
  vacina: number;
  vacina_nome: string;
  data_aplicacao: string;
  data_proximo_reforco?: string;
  medico: number;
  medico_nome: string;
  observacoes?: string;
}

export interface AgendamentoVacina {
  id: number;
  paciente: number;
  paciente_nome: string;
  responsavel_nome: string;
  responsavel_telefone: string;
  vacina: number;
  vacina_nome: string;
  data_agendamento: string;
  medico?: number;
  medico_nome?: string;
  status: 'agendado' | 'aplicado' | 'cancelado' | 'atrasado';
  observacoes?: string;
  data_aplicacao?: string;
  vacina_aplicada?: number;
  is_atrasado: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

export interface VacinaEstatisticas {
  total: number;
  aplicadas: number;
  agendadas: number;
  atrasadas: number;
}

const PacientesService = {
  // Pacientes
  getAllPacientes: async (): Promise<Paciente[]> => {
    try {
      const response = await api.get('/api/pacientes/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPaciente: async (id: number): Promise<Paciente> => {
    try {
      const response = await api.get(`/api/pacientes/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPacienteWithResponsavel: async (id: number): Promise<any> => {
    try {
      // Buscar dados básicos do paciente
      const pacienteResponse = await api.get(`/api/pacientes/${id}/`);
      const paciente = pacienteResponse.data;

      // Buscar dados do responsável
      let responsavelData = null;
      if (paciente.responsavel) {
        try {
          const responsavelResponse = await api.get(`/api/responsaveis/${paciente.responsavel}/`);
          const responsavel = responsavelResponse.data;

          // Buscar dados do usuário do responsável
          if (responsavel.user) {
            const userResponse = await UsersService.getUser(responsavel.user);
            responsavelData = {
              id: responsavel.id,
              nome: `${userResponse.first_name} ${userResponse.last_name}`.trim(),
              telefone: userResponse.phone || 'Não informado',
              endereco: responsavel.endereco || 'Não informado'
            };
          }
        } catch (error) {
          console.error('Erro ao buscar dados do responsável:', error);
        }
      }

      return {
        ...paciente,
        responsavelData
      };
    } catch (error) {
      throw error;
    }
  },

  createPaciente: async (pacienteData: CreatePacienteData): Promise<Paciente> => {
    try {
      // Buscar ou criar responsável baseado nos dados fornecidos
      const responsavelId = await PacientesService.findOrCreateResponsavel(pacienteData.responsavel);

      // Buscar ou criar convênio por nome
      const convenio = await PacientesService.findOrCreateConvenio(pacienteData.convenio);

      // Buscar plano por nome (se fornecido)
      let plano = null;
      if (pacienteData.plano && pacienteData.plano.trim() !== '') {
        const planos = await PacientesService.getPlanosByConvenio(convenio.id);
        plano = planos.find(p => p.nome.toLowerCase() === pacienteData.plano?.toLowerCase());
      }

      // Mapear sexo
      let sexoBackend = pacienteData.sexo === 'Feminino' ? 'F' : 'M';

      // Criar o paciente
      const pacientePayload = {
        nome: pacienteData.nome.trim(),
        responsavel: responsavelId,
        convenio: convenio.id,
        plano: plano?.id || null,
        data_nascimento: pacienteData.dataNascimento || null,
        sexo: sexoBackend,
        peso: pacienteData.peso || null,
        observacoes: pacienteData.observacoes || '',
      };

      const pacienteResponse = await api.post('/api/pacientes/', pacientePayload);
      return pacienteResponse.data;
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      throw error;
    }
  },

  updatePaciente: async (id: number, pacienteData: Partial<Paciente>): Promise<Paciente> => {
    try {
      const response = await api.patch(`/api/pacientes/${id}/`, pacienteData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      throw error;
    }
  },

  deletePaciente: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/pacientes/${id}/`);
    } catch (error) {
      console.error('Erro ao deletar paciente:', error);
      throw error;
    }
  },

  // Buscar pacientes com informações do responsável
  getPacientesParaAgendamento: async (): Promise<{ id: number; nome: string; convenio: string; plano: string; responsavel_nome: string; responsavel_telefone: string; }[]> => {
    try {
      const response = await api.get('/api/pacientes-agendamento/');
      return response.data.map((paciente: {
        id: number;
        nome: string;
        convenio: string;
        plano?: string;
        responsavel: {
          user: {
            first_name: string;
            last_name: string;
            phone?: string;
          };
        };
      }) => ({
        id: paciente.id,
        nome: paciente.nome,
        convenio: paciente.convenio,
        plano: paciente.plano || 'Não informado',
        responsavel_nome: `${paciente.responsavel.user.first_name} ${paciente.responsavel.user.last_name}`.trim(),
        responsavel_telefone: paciente.responsavel.user.phone || 'Não informado'
      }));
    } catch (error) {
      console.error('Erro ao buscar pacientes para agendamento:', error);
      throw error;
    }
  },

  // Convênios
  getAllConvenios: async (): Promise<Convenio[]> => {
    try {
      const response = await api.get('/api/convenios/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  findOrCreateConvenio: async (nome: string): Promise<Convenio> => {
    try {
      const convenios = await PacientesService.getAllConvenios();
      const convenioExistente = convenios.find(c => c.nome.toLowerCase() === nome.toLowerCase());

      if (convenioExistente) {
        return convenioExistente;
      }

      const nomeFormatado = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
      const response = await api.post('/api/convenios/', { nome: nomeFormatado });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar/criar convênio:', error);
      throw error;
    }
  },

  // Planos
  getPlanosByConvenio: async (convenioId: number): Promise<Plano[]> => {
    try {
      const response = await api.get(`/api/planos/?convenio=${convenioId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Responsáveis
  getAllResponsaveis: async (): Promise<Responsavel[]> => {
    try {
      const response = await api.get('/api/responsaveis/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getResponsavel: async (id: number): Promise<Responsavel> => {
    try {
      const response = await api.get(`/api/responsaveis/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  findOrCreateResponsavel: async (responsavelData: { nome: string; email?: string; telefone: string; endereco?: string }): Promise<number> => {
    try {
      // Tentar encontrar um responsável existente pelo telefone
      const responsaveis = await PacientesService.getAllResponsaveis();
      
      const users = await Promise.all(
        responsaveis.map(async (responsavel) => {
          try {
            const user = await UsersService.getUser(responsavel.user);
            return { responsavel, user };
          } catch (error) {
            return null;
          }
        })
      );

      const validUsers = users.filter(item => item !== null) as { responsavel: Responsavel, user: any }[];
      
      const normalizePhone = (phone: string) => phone ? phone.replace(/\D/g, '') : '';
      const normalizedInputPhone = normalizePhone(responsavelData.telefone);

      let existingResponsavel = validUsers.find(item => normalizePhone(item.user.phone) === normalizedInputPhone);

      if (existingResponsavel) {
        return existingResponsavel.responsavel.id;
      }

      // Se não encontrou, criar um novo usuário e responsável
      const nomePartes = responsavelData.nome.trim().split(' ');
      const firstName = nomePartes[0];
      const lastName = nomePartes.slice(1).join(' ') || '';
      const baseUsername = responsavelData.telefone.replace(/\D/g, '');
      const username = `${baseUsername}_${Date.now().toString().slice(-4)}`;

      const newUser = await UsersService.createUser({
        username: username,
        email: responsavelData.email || `${baseUsername}@clinica.com`,
        first_name: firstName,
        last_name: lastName,
        user_type: 4, // RESPONSAVEL
        phone: responsavelData.telefone,
        password: 'senha_padrao_clinica'
      });

      const response = await api.post('/api/responsaveis/', {
        user: newUser.id,
        endereco: responsavelData.endereco || ''
      });
      
      return response.data.id;

    } catch (error) {
      console.error('Erro ao buscar/criar responsável:', error);
      return 1; // Fallback
    }
  },

  // Vacinas
  getAllVacinas: async (): Promise<Vacina[]> => {
    try {
      const response = await api.get('/api/vacinas/');
      return response.data.results || response.data;
    } catch (error) {
      throw error;
    }
  },

  getVacinasAplicadas: async (pacienteId?: number): Promise<VacinaAplicada[]> => {
    try {
      const params = pacienteId ? { paciente: pacienteId } : {};
      const response = await api.get('/api/vacinas-aplicadas/', { params });
      return response.data.results || response.data;
    } catch (error) {
      throw error;
    }
  },

  createVacinaAplicada: async (data: Partial<VacinaAplicada>): Promise<VacinaAplicada> => {
    try {
      const response = await api.post('/api/vacinas-aplicadas/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Agendamentos de Vacinas
  getAgendamentosVacina: async (params?: {
    status?: string;
    search?: string;
    data?: string;
  }): Promise<AgendamentoVacina[]> => {
    try {
      const response = await api.get('/api/agendamentos-vacina/', { params });
      return response.data.results || response.data;
    } catch (error) {
      throw error;
    }
  },

  getAgendamentoVacina: async (id: number): Promise<AgendamentoVacina> => {
    try {
      const response = await api.get(`/api/agendamentos-vacina/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createAgendamentoVacina: async (data: Partial<AgendamentoVacina>): Promise<AgendamentoVacina> => {
    try {
      const response = await api.post('/api/agendamentos-vacina/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateAgendamentoVacina: async (id: number, data: Partial<AgendamentoVacina>): Promise<AgendamentoVacina> => {
    try {
      const response = await api.put(`/api/agendamentos-vacina/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteAgendamentoVacina: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/agendamentos-vacina/${id}/`);
    } catch (error) {
      throw error;
    }
  },

  getEstatisticasVacinas: async (): Promise<VacinaEstatisticas> => {
    try {
      const response = await api.get('/api/agendamentos-vacina/estatisticas/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default PacientesService;
