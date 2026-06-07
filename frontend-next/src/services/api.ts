// src/services/api.ts
import axios from 'axios';

// REMOVA o /api final da URL base pois já está sendo adicionado nas rotas
const API_URL = 'http://127.0.0.1:8000'; // ← Removi /api daqui

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    console.log('🔄 Interceptor - URL completa:', `${config.baseURL}${config.url}`);

    // Garantir que todas as URLs tenham barra final para compatibilidade com Django
    if (config.url && !config.url.endsWith('/') && !config.url.includes('?') && !config.url.includes('#')) {
      const originalUrl = config.url;
      config.url += '/';
      console.log('🔧 Interceptor - URL modificada:', originalUrl, '->', config.url);
    }

    // Verificar se estamos no navegador antes de acessar localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token adicionado aos headers');
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ Erro no interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para renovar o token quando expirado
api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta recebida:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('❌ Erro na resposta:', error.response?.status, error.config?.url);

    const originalRequest = error.config;

    // Se o erro for 401 (Unauthorized) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest?._retry && originalRequest?.url !== '/api/token/refresh/') {
      console.log('🔄 Tentando renovar token...');
      originalRequest._retry = true;

      try {
        // Verificar se estamos no navegador antes de acessar localStorage
        if (typeof window === 'undefined') {
          return Promise.reject(error);
        }

        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          console.log('❌ Refresh token não encontrado');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);
        console.log('✅ Token renovado com sucesso');

        // Refaz a requisição original com o novo token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Falha ao renovar token:', refreshError);
        // Se falhar ao renovar o token, limpa o storage e redireciona para login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Tratamento específico para erro 404
    if (error.response?.status === 404) {
      console.error('❌ Endpoint não encontrado (404):', error.config?.url);
      console.log('💡 Verifique se:');
      console.log('1. O backend Django está rodando');
      console.log('2. A URL está correta');
      console.log('3. As rotas no Django estão configuradas corretamente');
    }

    return Promise.reject(error);
  }
);

export default api;
