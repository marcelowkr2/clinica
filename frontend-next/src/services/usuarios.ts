// Interfaces
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  perfil: 'admin' | 'medico' | 'recepcionista' | 'auxiliar';
  status: 'ativo' | 'inativo' | 'bloqueado';
  dataCadastro: string;
  ultimoAcesso: string;
  avatar?: string;
  permissoes: string[];
}

export interface CreateUsuarioData {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  perfil: 'admin' | 'medico' | 'recepcionista' | 'auxiliar';
  senha: string;
  permissoes: string[];
}

export interface EstatisticasUsuarios {
  total: number;
  ativos: number;
  inativos: number;
  bloqueados: number;
}

// Dados mockados
const usuariosMockados: Usuario[] = [
  {
    id: 1,
    nome: 'Dr. João Silva',
    email: 'joao.silva@medihub.com',
    telefone: '(11) 99999-1111',
    cargo: 'Médico Clínico',
    perfil: 'medico',
    status: 'ativo',
    dataCadastro: '2024-01-15',
    ultimoAcesso: '2024-12-20 14:30',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
    permissoes: ['consultas', 'exames', 'receitas', 'cirurgias']
  },
  // ... outros usuários
];

// Serviço de Usuários
class UsuariosService {
  private baseURL = 'http://localhost:8001/api';
  private cache = new Map<number, Usuario>();
  private cacheExpiry = new Map<number, number>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') return localStorage.getItem('access_token');
    return null;
  }

  private getHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private getCached(id: number): Usuario | null {
    const expiry = this.cacheExpiry.get(id);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(id);
      this.cacheExpiry.delete(id);
      return null;
    }
    return this.cache.get(id) || null;
  }

  private setCached(usuario: Usuario) {
    this.cache.set(usuario.id, usuario);
    this.cacheExpiry.set(usuario.id, Date.now() + this.CACHE_DURATION);
  }

  private updateCached(id: number, data: Partial<Usuario>): Usuario | null {
    const user = this.getCached(id);
    if (user) {
      const updated = { ...user, ...data };
      this.setCached(updated);
      return updated;
    }
    return null;
  }

  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  async getUsuarios(): Promise<Usuario[]> {
    try {
      const res = await fetch(`${this.baseURL}/users/`, { headers: this.getHeaders() });
      if (!res.ok) throw new Error(`Erro API: ${res.status}`);
      const apiUsers = await res.json();
      // Mapear API -> frontend
      const usuarios = apiUsers.map((u: any) => this.mapApiUser(u));
      return usuarios;
    } catch {
      return [...usuariosMockados];
    }
  }

  async getUsuarioById(id: number): Promise<Usuario | null> {
    const cached = this.getCached(id);
    if (cached) return cached;

    try {
      const res = await fetch(`${this.baseURL}/users/${id}/`, { headers: this.getHeaders() });
      if (!res.ok) return usuariosMockados.find(u => u.id === id) || null;
      const apiUser = await res.json();
      const usuario = this.mapApiUser(apiUser);
      this.setCached(usuario);
      return usuario;
    } catch {
      return usuariosMockados.find(u => u.id === id) || null;
    }
  }

  async getEstatisticas(): Promise<EstatisticasUsuarios> {
    const usuarios = await this.getUsuarios();
    return {
      total: usuarios.length,
      ativos: usuarios.filter(u => u.status === 'ativo').length,
      inativos: usuarios.filter(u => u.status === 'inativo').length,
      bloqueados: usuarios.filter(u => u.status === 'bloqueado').length
    };
  }

  async createUsuario(data: CreateUsuarioData): Promise<Usuario> {
    const novo: Usuario = {
      id: Math.max(...usuariosMockados.map(u => u.id)) + 1,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      cargo: data.cargo,
      perfil: data.perfil,
      status: 'ativo',
      dataCadastro: new Date().toISOString().split('T')[0],
      ultimoAcesso: 'Nunca',
      permissoes: data.permissoes
    };
    usuariosMockados.push(novo);
    return novo;
  }

  async updateUsuario(id: number, data: Partial<Usuario>): Promise<Usuario> {
    const index = usuariosMockados.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Usuário não encontrado');
    const updated = { ...usuariosMockados[index], ...data };
    usuariosMockados[index] = updated;
    this.setCached(updated);
    return updated;
  }

  async deleteUsuario(id: number) {
    const index = usuariosMockados.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Usuário não encontrado');
    usuariosMockados.splice(index, 1);
    this.cache.delete(id);
  }

  async exportUsuarios(): Promise<string> {
    const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Cargo', 'Perfil', 'Status', 'Data Cadastro', 'Último Acesso'];
    const csv = [
      headers.join(','),
      ...usuariosMockados.map(u =>
        [u.id, `"${u.nome}"`, u.email, u.telefone, `"${u.cargo}"`, u.perfil, u.status, u.dataCadastro, `"${u.ultimoAcesso}"`].join(',')
      )
    ].join('\n');
    return csv;
  }

  private mapApiUser(apiUser: any): Usuario {
    const perfilMap: Record<number, Usuario['perfil']> = {
      1: 'admin',
      2: 'medico',
      3: 'recepcionista',
      4: 'auxiliar'
    };
    return {
      id: apiUser.id,
      nome: `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.username,
      email: apiUser.email,
      telefone: apiUser.phone || '',
      cargo: apiUser.user_type === 1 ? 'Administrador' : apiUser.user_type === 2 ? 'Médico' : apiUser.user_type === 3 ? 'Recepcionista' : 'Auxiliar',
      perfil: perfilMap[apiUser.user_type] || 'auxiliar',
      status: 'ativo',
      dataCadastro: new Date().toISOString().split('T')[0],
      ultimoAcesso: 'Não disponível',
      permissoes: apiUser.user_type === 1 ? ['todos'] :
                  apiUser.user_type === 2 ? ['consultas','exames','receitas','cirurgias'] :
                  apiUser.user_type === 3 ? ['agendamentos','clientes','pacientes','vendas'] :
                  ['pacientes']
    };
  }
}

export const usuariosService = new UsuariosService();
export default usuariosService;
