import api from './api';

export enum UserType {
  ADMIN = 1,
  MEDICO = 2,
  RECEPCIONISTA = 3,
  PACIENTE = 4,
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: UserType;
  phone?: string;
  cpf?: string;
  crm?: string;
  is_active: boolean;
  date_joined: string;
}

const UsersService = {
  getUser: async (id: number): Promise<User> => {
    try {
      const response = await api.get(`/api/users/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/api/users/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createUser: async (userData: Omit<User, 'id' | 'date_joined' | 'is_active'> & { password: string }): Promise<User> => {
    try {
      const payload = {
        ...userData,
        password2: userData.password
      };
      const response = await api.post('/api/register/', payload);
      return response.data.user; // O endpoint register retorna { user: ..., message: ... }
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put(`/api/users/${id}/`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/users/${id}/`);
    } catch (error) {
      throw error;
    }
  },

  getMedicos: async (): Promise<User[]> => {
    try {
      const response = await api.get('/api/users/');
      // Verificar se a resposta é paginada ou um array direto
      const users = Array.isArray(response.data) ? response.data : response.data.results || [];
      // Filtrar apenas médicos
      return users.filter((user: User) => user.user_type === UserType.MEDICO);
    } catch (error) {
      throw error;
    }
  },
};

export default UsersService;
