'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

import { Stethoscope, Activity, User, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Erro de validação',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await register({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao registrar:', error);
      toast({
        title: 'Erro ao criar conta',
        description: 'Ocorreu um erro ao criar sua conta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-400 via-blue-500 to-indigo-600 dark:from-gray-900 dark:via-blue-900 dark:to-emerald-900 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white/95 dark:bg-gray-800/95 p-8 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-gray-700 my-8">
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
          <h2 className="text-2xl font-black text-foreground text-center">Crie sua conta</h2>
          <p className="text-sm text-muted-foreground text-center font-medium">Junte-se à maior rede de gestão clínica</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
              <User className="h-3 w-3" /> Nome de Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="block w-full rounded-2xl border-2 border-border/50 bg-background text-foreground px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 font-medium placeholder:text-muted-foreground/50"
              placeholder="Digite seu nome de usuário"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                👤 Nome
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="block w-full rounded-2xl border-2 border-border/50 bg-background text-foreground px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 font-medium placeholder:text-muted-foreground/50"
                placeholder="Nome"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lastName" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                👤 Sobrenome
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="block w-full rounded-2xl border-2 border-border/50 bg-background text-foreground px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 font-medium placeholder:text-muted-foreground/50"
                placeholder="Sobrenome"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
              <Mail className="h-3 w-3" /> E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full rounded-2xl border-2 border-border/50 bg-background text-foreground px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 font-medium placeholder:text-muted-foreground/50"
              placeholder="Digite seu melhor e-mail"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
              <Lock className="h-3 w-3" /> Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-2xl border-2 border-border/50 bg-background text-foreground px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 font-medium placeholder:text-muted-foreground/50"
              placeholder="Crie uma senha forte"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
              <Lock className="h-3 w-3" /> Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="block w-full rounded-2xl border-2 border-border/50 bg-background text-foreground px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 font-medium placeholder:text-muted-foreground/50"
              placeholder="Repita sua senha"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="group w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 px-4 py-4 text-white font-black uppercase tracking-widest hover:from-emerald-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-emerald-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Criando conta...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Finalizar Cadastro
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
            Já tem uma conta?{' '}
            <Link href="/login" className="font-black text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors underline underline-offset-4 decoration-2">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
