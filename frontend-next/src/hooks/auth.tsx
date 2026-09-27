'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import AuthService, { User, LoginCredentials, RegisterData } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário está autenticado ao carregar a página
    const checkAuth = async () => {
      try {
        console.log('🔍 AuthProvider - Verificando autenticação...');
        setLoading(true);
        
        // Primeiro, limpar dados corrompidos
        AuthService.clearCorruptedData();
        
        const isAuth = AuthService.isAuthenticated();
        console.log('🔍 AuthProvider - isAuthenticated:', isAuth);
        
        if (isAuth) {
          console.log('✅ AuthProvider - Usuário autenticado, buscando dados...');
          const userData = AuthService.getCurrentUser();
          console.log('✅ AuthProvider - Dados do usuário:', userData);
          
          if (userData) {
            setUser(userData);
          } else {
            console.log('❌ AuthProvider - Dados do usuário não encontrados, fazendo logout');
            AuthService.logout();
            setUser(null);
          }
        } else {
          console.log('❌ AuthProvider - Usuário não autenticado');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ AuthProvider - Erro ao verificar autenticação:', error);
        // Em caso de erro, limpar o estado e os tokens
        setUser(null);
        AuthService.logout();
      } finally {
        setLoading(false);
        console.log('🏁 AuthProvider - Verificação de autenticação finalizada');
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('AuthContext: Starting login process');
      setLoading(true);
      const userData = await AuthService.login(credentials);
      console.log('AuthContext: Login response received:', userData);
      setUser(userData);
      console.log('AuthContext: User state updated, authentication successful');
      router.push('/dashboard');
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      await AuthService.register(data);
      // Após o registro, fazer login automaticamente
      await login({
        username: data.username,
        password: data.password,
      });
    } catch (error) {
      console.error('Erro ao registrar:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!AuthService.getToken(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}