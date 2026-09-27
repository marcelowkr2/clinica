// src/services/api.ts
import axios from 'axios';

// REMOVA o /api final da URL base pois já está sendo adicionado nas rotas
const API_URL = 'http://127.0.0.1:8001'; // ← Usando IP para evitar problemas de DNS/localhost

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    // Garantir que todas as URLs tenham barra final para compatibilidade com Django
    if (config.url && !config.url.endsWith('/') && !config.url.includes('?') && !config.url.includes('#') && !config.url.startsWith('http')) {
      const originalUrl = config.url;
      config.url += '/';
    }

    // Verificar se estamos no navegador antes de acessar localStorage
    if (typeof window !== 'undefined') {
      const isPublicEndpoint = config.url === '/api/token/' || config.url === '/api/token/refresh/';
      const token = localStorage.getItem('access_token');
      
      if (token && !isPublicEndpoint) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log(`📡 [API] ${config.method?.toUpperCase()} ${config.url} - Token enviado`);
      } else {
        console.log(`📡 [API] ${config.method?.toUpperCase()} ${config.url} - Sem header Authorization`);
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ Erro no interceptor de request:', error);
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor para renovar o token quando expirado
api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta recebida:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 (Unauthorized) e não for uma tentativa de refresh ou login
    if (error.response?.status === 401 && !originalRequest?._retry &&
        originalRequest?.url !== '/api/token/refresh/' &&
        originalRequest?.url !== '/api/token/') {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      console.log('🔄 Tentando renovar token...');
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Verificar se estamos no navegador antes de acessar localStorage
        if (typeof window === 'undefined') {
          return Promise.reject(error);
        }

        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          console.log('❌ Refresh token não encontrado');
          // Limpa tudo para garantir que o usuário seja redirecionado corretamente
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          processQueue(new Error('Refresh token não encontrado'), null);
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
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
        }

        processQueue(null, access);
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Falha ao renovar token:', refreshError);
        processQueue(refreshError, null);
        // Se falhar ao renovar o token, limpa o storage e redireciona para login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
