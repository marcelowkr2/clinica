// src/services/auth.ts
import api from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  // adicione outros campos conforme necessário
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  // adicione outros campos conforme necessário
}

class AuthService {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly USER_KEY = 'user_data';

  // Método para fazer login - Otimizado para retornar usuário e tokens em uma única chamada
  static async login(credentials: LoginCredentials): Promise<User> {
    try {
      console.log('🔐 Tentando login no endpoint:', '/api/token/');
      const response = await api.post('/api/token/', credentials);
      const { access, refresh, user } = response.data;

      // Armazenar tokens
      this.setToken(access);
      this.setRefreshToken(refresh);

      // Armazenar dados do usuário (já vêm na resposta do login agora)
      this.setUser(user);

      return user;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  }

  // Método para registrar - AJUSTE para endpoint Django REST
  static async register(data: RegisterData): Promise<void> {
    try {
      console.log('📝 Tentando registro no endpoint:', '/api/register/');
      await api.post('/api/register/', data);
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      throw error;
    }
  }

  // Método para validar token com o backend
  static async validateToken(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) {
        console.log('❌ Nenhum token encontrado para validação');
        return null;
      }

      console.log('🔍 Validando token no endpoint:', '/api/user/');
      const response = await api.get('/api/user/');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao validar token:', error);
      this.clearCorruptedData();
      return null;
    }
  }

  // Método para fazer logout
  static logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    console.log('✅ Logout realizado - tokens removidos');
  }

  // Verificar se está autenticado
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Obter usuário atual
  static getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('❌ Erro ao obter usuário:', error);
      return null;
    }
  }

  // Obter token de acesso
  static getToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // Obter token de refresh
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Definir token de acesso
  private static setToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  // Definir token de refresh
  private static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  // Definir usuário
  private static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Limpar dados corrompidos
  static clearCorruptedData(): void {
    const token = this.getToken();
    const user = this.getCurrentUser();

    if (token && !user) {
      console.warn('⚠️ Dados inconsistentes: token sem usuário. Limpando...');
      this.logout();
    }
  }
}

export default AuthService;
