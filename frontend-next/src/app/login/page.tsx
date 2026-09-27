'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

import { Stethoscope, Activity, User, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted');
    setLoading(true);

    try {
      const cleanUsername = username.trim();
      console.log('Attempting login with:', { username: cleanUsername, password: '***' });
      await login({ username: cleanUsername, password });
      console.log('Login successful, redirecting to dashboard');
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro no login",
        description: "Credenciais inválidas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      console.log('Login process finished');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-400 via-blue-500 to-indigo-600 dark:from-gray-900 dark:via-blue-900 dark:to-emerald-900 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white/95 dark:bg-gray-800/95 p-8 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-gray-700">
        <div className="mb-8 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform -rotate-6">
            <Stethoscope className="h-10 w-10 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
            <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent tracking-tight">MediHub</h1>
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Sistema de Gestão de Clínicas</p>
        </div>

        <div className="mb-8 space-y-1">
          <h2 className="text-2xl font-black text-foreground text-center">Bem-vindo de volta!</h2>
          <p className="text-sm text-muted-foreground text-center font-medium">Acesse sua conta para gerenciar seus atendimentos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="username" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
              <User className="h-3 w-3" /> Nome de Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="block w-full rounded-2xl border-2 border-border/50 bg-background text-foreground px-4 py-3.5 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 font-medium placeholder:text-muted-foreground/50"
              placeholder="Digite seu nome de usuário"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
              <Lock className="h-3 w-3" /> Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-2xl border-2 border-border/50 bg-background text-foreground px-4 py-3.5 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 font-medium placeholder:text-muted-foreground/50"
              placeholder="Digite sua senha"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 px-4 py-4 text-white font-black uppercase tracking-widest hover:from-emerald-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-emerald-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Autenticando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Entrar no Sistema
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="px-4 bg-white dark:bg-gray-800 text-muted-foreground/50">ou</span>
            </div>
          </div>

          <p className="text-sm font-medium text-muted-foreground">
            Não tem uma conta?{' '}
            <Link href="/register" className="font-black text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors underline underline-offset-4 decoration-2">
              Registre-se agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
