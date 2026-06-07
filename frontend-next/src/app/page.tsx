'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Aguarda o loading do auth terminar antes de redirecionar
    if (!loading && !isRedirecting) {
      setIsRedirecting(true);
      
      // Redireciona para o dashboard se estiver autenticado, caso contrário para o login
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, loading, router, isRedirecting]);

  // Página de carregamento enquanto redireciona
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">VetSys</h1>
        <p className="text-gray-600">Carregando...</p>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
        </div>
      </div>
    </div>
  );
}
